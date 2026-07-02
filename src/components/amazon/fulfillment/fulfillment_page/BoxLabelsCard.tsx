/* eslint-disable @next/next/no-img-element */
import { useContext, useState } from 'react'

import AppContext from '@context/AppContext'
import { FormatIntPercentage } from '@lib/FormatNumbers'
import { NoImageAdress } from '@lib/assetsConstants'
import { ConfirmedShipments, InboundPlan } from '@typesTs/amazon/fulfillments/fulfillment'
import { Button, Card, CardBody, CardFooter, CardHeader, Spinner } from '@/components/migration-ui'

type Props = {
  inboundPlan: InboundPlan
  handleNextStep: (shipmentId: any, boxes: number) => Promise<void>
  shipment: ConfirmedShipments
  shipmentIndex: number
}

const BoxLabelsCard = ({ inboundPlan, handleNextStep, shipment, shipmentIndex }: Props) => {
  const { state }: any = useContext(AppContext)
  const [isLoading, setisLoading] = useState(false)
  return (
    <Card
      key={shipment.shipmentId}
      className='tw:m-0 tw:shadow-sm'
      style={{ width: 'fit-content', maxWidth: '400px', zIndex: Object.values(inboundPlan.confirmedShipments).length - shipmentIndex }}>
      <CardHeader>
        <p className='tw:m-0 tw:p-0 tw:font-bold tw:text-[13px]'>Shipment #{shipmentIndex + 1}</p>
      </CardHeader>
      <CardBody>
        <p className='tw:m-0 tw:text-[11.2px]'>
          <span className='tw:text-primary'>Shipment Name: </span>
          {shipment.shipment.name}
        </p>
        <p className='tw:m-0 tw:text-[11.2px]'>
          <span className='tw:text-primary'>Shipment ID: </span>
          {shipment.shipment.shipmentConfirmationId}
        </p>
        <p className='tw:m-0 tw:text-[11.2px]'>
          <span className='tw:text-primary'>Ship From: </span>
          {shipment.shipment.source.address.name}, {shipment.shipment.source.address.addressLine1}, {shipment.shipment.source.address.city},{' '}
          {shipment.shipment.source.address.stateOrProvinceCode}, {shipment.shipment.source.address.postalCode}, {shipment.shipment.source.address.countryCode}
        </p>
        <p className='tw:m-0 tw:text-[11.2px]'>
          <span className='tw:text-primary'>Ship to: </span>
          {shipment.shipment.destination.warehouseId} - {shipment.shipment.destination.address.addressLine1}, {shipment.shipment.destination.address.city},{' '}
          {shipment.shipment.destination.address.stateOrProvinceCode}, {shipment.shipment.destination.address.countryCode}
        </p>
        <p className='tw:my-2 tw:p-0 tw:font-semibold tw:text-[11.2px]'>Shipment Contents</p>
        <div className='tw:flex tw:flex-row tw:flex-nowrap tw:justify-between tw:items-start'>
          <div>
            <p className='tw:m-0 tw:p-0 tw:text-[11.2px]'>
              Boxes: <span className='tw:font-bold'>{shipment.shipmentBoxes.boxes.reduce((total, item) => total + item.quantity, 0)}</span>
            </p>
            <p className='tw:m-0 tw:p-0 tw:text-[11.2px]'>
              SKUs: <span className='tw:font-bold'>{shipment.shipmentItems.items.length}</span>
            </p>
            <p className='tw:m-0 tw:p-0 tw:text-[11.2px]'>
              Units:{' '}
              <span className='tw:font-bold'>
                {shipment.shipmentBoxes.boxes.reduce((total, item) => {
                  const totalitems = item.items.reduce((total, item) => total + item.quantity, 0) * item.quantity
                  return total + totalitems
                }, 0)}
              </span>
            </p>
            <p className='tw:m-0 tw:p-0 tw:text-[11.2px]'>
              Weight:{' '}
              <span className='tw:font-bold'>
                {FormatIntPercentage(
                  state.currentRegion,
                  shipment.shipmentBoxes.boxes.reduce((total, item) => {
                    const totalitems = item.weight.value * item.quantity
                    return total + totalitems
                  }, 0)
                )}{' '}
                Lb
              </span>
            </p>
          </div>
          <div className='tw:flex tw:flex-row tw:flex-nowrap tw:justify-end tw:items-center tw:gap-2'>
            {shipment.shipmentItems.items.map(
              (item, itemIndex) =>
                itemIndex <= 2 && (
                  <div
                    key={`${shipment.shipmentId}-${itemIndex}`}
                    className='tw:my-2'
                    style={{
                      width: '50px',
                      height: '50px',
                      margin: '2px 0px',
                      position: 'relative',
                    }}>
                    <img
                      loading='lazy'
                      src={inboundPlan.skus_details[item.msku]?.image ? inboundPlan.skus_details[item.msku]?.image : NoImageAdress}
                      alt='product Image'
                      style={{ objectFit: 'contain', objectPosition: 'center', width: '100%', height: '100%' }}
                    />
                  </div>
                )
            )}
            {shipment.shipmentItems.items.length > 3 && <p>+{shipment.shipmentItems.items.length - 3}</p>}
          </div>
        </div>
      </CardBody>
      <CardFooter>
        <div className='tw:flex tw:justify-between tw:items-center'>
          <p className='tw:m-0 tw:p-0 tw:font-semibold'>Print Box and Shipping Lables</p>
          <Button
            disabled={isLoading}
            size='sm'
            color='success'
            id={shipment.shipment.shipmentConfirmationId}
            onClick={async () => {
              setisLoading(true)
              await handleNextStep(
                shipment.shipment.shipmentConfirmationId,
                shipment.shipmentBoxes.boxes.reduce((total, item) => total + item.quantity, 0)
              ).then(() => setisLoading(false))
            }}>
            {isLoading ? (
              <span className='tw:text-nowrap'>
                <Spinner color='light' size={'sm'} className='tw:me-1' /> Downloading...
              </span>
            ) : (
              'Print Box Labels'
            )}
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}

export default BoxLabelsCard
