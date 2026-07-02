/* eslint-disable @next/next/no-img-element */
import { useContext, useMemo, useState } from 'react'

import TooltipComponent from '@components/constants/Tooltip'
import AppContext from '@context/AppContext'
import { FormatCurrency } from '@lib/FormatNumbers'
import { CleanSpecialCharacters } from '@lib/SkuFormatting'
import { NoImageAdress } from '@lib/assetsConstants'
import { Shipment, ShipmentOrderItem } from '@typesTs/shipments/shipments'
import axios from 'axios'
import moment from 'moment'
import { Button, Card, CardBody, CardHeader, Col, Row, Spinner } from '@/components/migration-ui'

import ShipmentCarrierStatusBar from './ShipmentCarrierStatusBar'
import ShipmentTrackingNumber from './ShipmentTrackingNumber'

type Props = {
  data: Shipment
  showActions: boolean
  mutateShipments?: () => void
}

const ReturnType = ({ data, showActions, mutateShipments }: Props) => {
  const { state }: any = useContext(AppContext)
  const [loadingLabel, setLoadingLabel] = useState(false)
  const OrderId = CleanSpecialCharacters(data.orderId)

  const serviceFee = useMemo(() => {
    if (data.chargesFees) {
      switch (true) {
        case !data.isIndividualUnits && data.carrierService == 'Parcel Boxes':
          return `${data.carrierService} - ${FormatCurrency(state.currentRegion, data.chargesFees.parcelBoxCost!)} per box`
        case !data.isIndividualUnits && data.carrierService == 'LTL':
          return `${data.carrierService} - ${FormatCurrency(state.currentRegion, data.chargesFees.palletCost!)} per pallet + ${FormatCurrency(state.currentRegion, 0.3)} per item`
        case data.isIndividualUnits:
          return `
                ${data.carrierService} - ${FormatCurrency(state.currentRegion, data.chargesFees.individualUnitCost!)} per unit
                ${data.carrierService} - ${FormatCurrency(state.currentRegion, data.chargesFees.parcelBoxCost!)} per box
                ${data.carrierService} - ${FormatCurrency(state.currentRegion, data.chargesFees.palletCost!)} per pallet
                `
        default:
          return `${FormatCurrency(state.currentRegion, data.chargesFees.orderCost!)} first item + ${FormatCurrency(
            state.currentRegion,
            data.chargesFees.extraItemOrderCost!
          )} addt'l.`
      }
    }
    return ''
  }, [data, state.currentRegion])

  const handlePrintingLabel = async () => {
    setLoadingLabel(true)
    const response: any = await axios(`/api/createLabelForOrder?region=${state.currentRegion}&businessId=${state.user.businessId}&orderId=${data.id}`)

    const linkSource = `data:application/pdf;base64,${response.data}`
    const downloadLink = document.createElement('a')
    const fileName = data.orderNumber + '-shipLabel.pdf'

    downloadLink.href = linkSource
    downloadLink.download = fileName
    downloadLink.click()
    mutateShipments && mutateShipments()
    setLoadingLabel(false)
  }
  return (
    <div style={{ backgroundColor: '#F0F4F7', padding: '10px' }}>
      {data.carrierStatus && (
        <Row>
          <Col xs={12}>
            <ShipmentCarrierStatusBar carrier={data.carrierUsed} currentStatus={data.carrierStatus} />
          </Col>
        </Row>
      )}
      <Row>
        <Col xs={12} lg={8}>
          <Row>
            <Col xs={12} lg={6} className='pb-4'>
              <Card className='h-full'>
                <CardHeader className='py-4'>
                  <h5 className='font-semibold m-0'>Order Summary</h5>
                </CardHeader>
                <CardBody>
                  <Row className='m-0 p-0 flex flex-row justify-between items-start'>
                    <Col xs={6} className='m-0 p-0'>
                      <span className='text-[var(--bs-secondary-color)] text-[11.2px]'>Store:</span>
                      <div className='flex flex-col justify-start items-start gap-2'>
                        <img
                          loading='lazy'
                          src={data.channelLogo ? data.channelLogo : NoImageAdress}
                          alt='product Image'
                          id={`ChannelLogo-${data.id}`}
                          style={{
                            width: '20px',
                            height: '20px',
                            objectFit: 'contain',
                          }}
                        />
                        <span className='text-[11.2px] font-semibold'>{data.storeName}</span>
                      </div>
                      <span className='text-[var(--bs-secondary-color)] text-[11.2px]'>Order Date:</span>
                      <p className='text-[11.2px] font-semibold m-0'>{moment.utc(data.orderDate).format('LL')}</p>
                      <span className='text-[var(--bs-secondary-color)] text-[11.2px]'>Closed Date:</span>
                      {data.closedDate && <p className='text-[11.2px] font-semibold m-0'>{moment.utc(data.closedDate).format('LL')}</p>}
                    </Col>
                    <Col xs={6} className='m-0 p-0'>
                      <table className='w-full whitespace-nowrap m-0 text-[11.2px] [&_th]:px-2 [&_th]:py-1 [&_td]:px-2 [&_td]:py-1'>
                        <tbody>
                          <tr className='border-b border-[color:var(--border)]'>
                            <td className='text-[var(--bs-secondary-color)]'>Subtotal</td>
                            <td className='font-semibold text-right'>{FormatCurrency(state.currentRegion, data.subtotal)}</td>
                          </tr>
                          <tr className='border-b border-[color:var(--border)]'>
                            <td className='text-[var(--bs-secondary-color)]'>Shipping</td>
                            <td className='font-semibold text-right'>{FormatCurrency(state.currentRegion, data.salesShipping > 0 ? data.salesShipping : data.orderShipping)}</td>
                          </tr>
                          <tr className='border-b border-[color:var(--border)]'>
                            <td className='text-[var(--bs-secondary-color)]'>Tax</td>
                            <td className='font-semibold text-right'>{FormatCurrency(state.currentRegion, data.salesTax)}</td>
                          </tr>
                          <tr className='border-b border-[color:var(--border)]'>
                            <td className='text-[var(--bs-secondary-color)]'>Discount</td>
                            <td className='font-semibold text-right'>{FormatCurrency(state.currentRegion, data.discount)}</td>
                          </tr>
                          <tr>
                            <td className='font-semibold text-right'>TOTAL Order</td>
                            <td className='text-primary font-semibold text-right'>{FormatCurrency(state.currentRegion, data.orderTotal)}</td>
                          </tr>
                          <tr>
                            <td className='font-semibold text-right'>TOTAL Paid</td>
                            <td className='text-primary font-semibold text-right'>{FormatCurrency(state.currentRegion, data.orderPaid)}</td>
                          </tr>
                        </tbody>
                      </table>
                    </Col>
                  </Row>
                </CardBody>
              </Card>
            </Col>
            <Col xs={12} lg={6} className='pb-4'>
              <Card className='h-full'>
                <CardHeader className='py-4'>
                  <h5 className='font-semibold m-0'>Shipping</h5>
                </CardHeader>
                <CardBody>
                  <table className='w-full whitespace-nowrap m-0 text-[11.2px] [&_th]:px-2 [&_th]:py-1 [&_td]:px-2 [&_td]:py-1'>
                    <tbody>
                      <tr>
                        <td className='text-[var(--bs-secondary-color)] whitespace-nowrap'>Carrier:</td>
                        <td className='font-semibold w-full capitalize'>{data.carrierUsed}</td>
                      </tr>
                      <tr>
                        <td className='text-[var(--bs-secondary-color)] whitespace-nowrap'>Service Requested:</td>
                        <td className='font-semibold w-full capitalize'>{data.carrierService}</td>
                      </tr>
                      <tr>
                        <td className='text-[var(--bs-secondary-color)] whitespace-nowrap'>Service Used:</td>
                        <td className='font-semibold w-full capitalize'>{data.carrierType}</td>
                      </tr>
                      <tr>
                        <td className='text-[var(--bs-secondary-color)] whitespace-nowrap'>Customer Name:</td>
                        <td className='font-semibold w-full capitalize'>{data.shipName}</td>
                      </tr>
                      <tr>
                        <td className='text-[var(--bs-secondary-color)] whitespace-nowrap'># Of Pallets:</td>
                        <td className='font-semibold w-full'>{data.numberPallets}</td>
                      </tr>
                    </tbody>
                  </table>
                  <div className='px-1 text-[11.2px]'>
                    <span className='m-0 text-[var(--bs-secondary-color)] text-[11.2px]'>Tracking No.</span>
                    <ShipmentTrackingNumber
                      orderStatus={data.orderStatus}
                      orderType={data.orderType}
                      trackingNumber={data.trackingNumber}
                      trackingLink={data.trackingLink}
                      carrierIcon={data.carrierIcon}
                      carrierService={data.carrierService}
                    />
                  </div>
                </CardBody>
              </Card>
            </Col>
          </Row>
          <Row>
            <Col xs={12}>
              <Card>
                <CardHeader className='py-4'>
                  <h5 className='font-semibold m-0'>Products</h5>
                </CardHeader>
                <CardBody>
                  <div className='overflow-x-auto'>
                    <table className='w-full align-middle mb-0 text-[11.2px] [&_th]:px-2 [&_th]:py-1 [&_td]:px-2 [&_td]:py-1'>
                      <thead className='bg-[color:var(--vz-light)]'>
                        <tr>
                          <th scope='col'>Title</th>
                          <th scope='col'>Sku</th>
                          <th scope='col'>Condition</th>
                          <th className='text-center' scope='col'>
                            Qty
                          </th>
                          <th className='text-center' scope='col'>
                            Qty Received
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.orderItems.map((product: ShipmentOrderItem, key) => (
                          <tr key={key} className='border-b border-[color:var(--border)]'>
                            <td className='w-1/2 font-semibold'>{product.name || product.title}</td>
                            <td className='text-[var(--bs-secondary-color)]'>{product.sku}</td>
                            <td className='text-[var(--bs-secondary-color)] capitalize'>{product.state}</td>
                            <td className='text-center'>{product.quantity || product.qtyReceived}</td>
                            <td className='text-center'>{product.qtyReceived ? product.qtyReceived : product.quantity}</td>
                          </tr>
                        ))}
                        <tr className='bg-[var(--vz-light)]'>
                          <td></td>
                          <td></td>
                          <td className='text-left text-[13px] font-bold whitespace-nowrap'>Total</td>
                          <td className='text-center text-[13px] text-primary'>
                            {data.orderItems.reduce((total, item: ShipmentOrderItem) => total + (item.quantity ?? item.qtyReceived), 0)}
                          </td>
                          <td className='text-center text-[13px] text-primary'>
                            {data.orderItems.reduce((total, item: ShipmentOrderItem) => total + (item.qtyReceived ? item.qtyReceived : item.quantity), 0)}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </Col>
        <Col xs={12} lg={4}>
          <Col xs={12}>
            <Card>
              <CardHeader className='py-4'>
                <h5 className='font-semibold m-0'>Charge Details</h5>
              </CardHeader>
              <CardBody>
                <table className='w-full whitespace-nowrap mb-0 text-[11.2px] [&_th]:px-2 [&_th]:py-1 [&_td]:px-2 [&_td]:py-1'>
                  <tbody>
                    <tr className='border-b border-[color:var(--border)]'>
                      <td className='text-[var(--bs-secondary-color)] flex flex-row justify-start items-start'>
                        Pick Pack Charge
                        {data.chargesFees && (
                          <>
                            <i className='ri-information-fill ms-1 text-[13px] text-[var(--bs-secondary-color)]' id={`tooltip${OrderId}`}></i>
                            <TooltipComponent target={`tooltip${OrderId}`} text={serviceFee} />
                          </>
                        )}
                      </td>
                      <td className='font-semibold text-right'>{FormatCurrency(state.currentRegion, data.pickpackCharge!)}</td>
                    </tr>
                    <tr className='border-b border-[color:var(--border)]'>
                      <td className='text-[var(--bs-secondary-color)]'>Shipping Charge</td>
                      <td className='font-semibold text-right'>{FormatCurrency(state.currentRegion, data.onixShipping!)}</td>
                    </tr>
                    <tr className='border-b border-[color:var(--border)]'>
                      <td className='text-[var(--bs-secondary-color)]'>Extra Charge</td>
                      <td className='font-semibold text-right'>{FormatCurrency(state.currentRegion, data.extraCharge!)}</td>
                    </tr>
                    <tr>
                      <td className='font-bold'>TOTAL</td>
                      <td className='text-primary font-semibold text-right'>{FormatCurrency(state.currentRegion, data.totalCharge!)}</td>
                    </tr>
                  </tbody>
                </table>
              </CardBody>
            </Card>
          </Col>
          {data.extraComment != '' && (
            <Col xs={12}>
              <Card>
                <CardHeader className='py-4'>
                  <h5 className='font-semibold m-0'>Order Comment</h5>
                </CardHeader>
                <CardBody>
                  <p>{data.extraComment}</p>
                </CardBody>
              </Card>
            </Col>
          )}
          {showActions && (
            <Row>
              <Col xs={12} className='flex flex-row flex-wrap justify-start items-end gap-2'>
                {data.returnOrigin === 'shipment' && (
                  <Card className='m-0'>
                    {loadingLabel ? (
                      <Button color='secondary' size='sm' className='btn-label text-[11.2px] whitespace-nowrap'>
                        <i className='las la-toilet-paper label-icon align-middle text-[22.75px] me-2' />
                        <Spinner color='light' size={'sm'} />
                      </Button>
                    ) : (
                      <Button color='secondary' size='sm' className='btn-label text-[11.2px] whitespace-nowrap' onClick={() => handlePrintingLabel()}>
                        <i className='las la-toilet-paper label-icon align-middle text-[22.75px] me-2' />
                        Print Label
                      </Button>
                    )}
                  </Card>
                )}
              </Col>
            </Row>
          )}
        </Col>
      </Row>
    </div>
  )
}

export default ReturnType
