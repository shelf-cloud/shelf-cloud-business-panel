import { useContext } from 'react'

import AppContext from '@context/AppContext'
import { FormatIntPercentage } from '@lib/FormatNumbers'
import { CleanStatus } from '@lib/SkuFormatting'
import { FBAShipment } from '@typesTs/amazon/fbaShipments.interface'
import { WaitingReponses } from '@typesTs/amazon/fulfillments/fulfillment'
import { Button, Col, Spinner } from '@/components/migration-ui'

type Props = {
  shipmentDetails: FBAShipment
  handlePrintShipmentBillOfLading: (shipmentId: string) => void
  watingRepsonse: WaitingReponses
}

const Pallets = ({ shipmentDetails, handlePrintShipmentBillOfLading, watingRepsonse }: Props) => {
  const { state }: any = useContext(AppContext)
  return (
    <div className='tw:my-4 tw:px-4'>
      <Col sm='12' lg='8'>
        <p className='tw:text-[16.25px] tw:font-bold'>Bill of Lading (BOL)</p>
        <p>
          Print Bill of Lading (BOL) document: <span className='tw:font-semibold'>{shipmentDetails.shipment.trackingDetails?.ltlTrackingDetail.billOfLadingNumber}</span>
        </p>
        <Button disabled={watingRepsonse.printingLabel} color='primary' onClick={() => handlePrintShipmentBillOfLading(shipmentDetails.shipment.shipmentConfirmationId)}>
          {watingRepsonse.printingLabel ? (
            <span>
              <Spinner color='light' size={'sm'} className='tw:me-1' /> Downloading BOL...
            </span>
          ) : (
            'Print BOL Document'
          )}
        </Button>
        <p className='tw:mt-1 tw:text-[11.2px] tw:text-[var(--bs-secondary-color)]'>The BOL will be generated no later than 8 a.m. the morning of pickup.</p>
      </Col>

      <Col sm='12' lg='9'>
        <div className='tw:overflow-x-auto'>
        <table className='tw:w-full tw:align-middle tw:mb-0 tw:border tw:border-[color:var(--border)] tw:[&_td]:border-t tw:[&_th]:px-2 tw:[&_th]:py-1 tw:[&_td]:px-2 tw:[&_td]:py-1'>
          <thead className='tw:bg-[color:var(--vz-light)]'>
            <tr>
              <th>Dimensions (IN)</th>
              <th>Weight (LB)</th>
              <th>Number of pallets</th>
              <th className='tw:text-center'>Total weight (LB)</th>
              <th className='tw:text-center'>Stackable</th>
            </tr>
          </thead>
          <tbody>
            {shipmentDetails.shipmentPallets.pallets.map((pallet) => (
              <tr key={pallet.packageId}>
                <td>{`${pallet.dimensions.length} x ${pallet.dimensions.width} x ${pallet.dimensions.height}`}</td>
                <td>{FormatIntPercentage(state.currentRegion, pallet.weight.value)}</td>
                <td>{pallet.quantity}</td>
                <td>{FormatIntPercentage(state.currentRegion, pallet.weight.value * pallet.quantity)}</td>
                <td>{CleanStatus(pallet.stackability)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </Col>
    </div>
  )
}

export default Pallets
