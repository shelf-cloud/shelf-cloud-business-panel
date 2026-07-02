import { FBAShipment } from '@typesTs/amazon/fbaShipments.interface'
import { WaitingReponses } from '@typesTs/amazon/fulfillments/fulfillment'
import { Button, Col, Spinner } from '@/components/migration-ui'

type Props = {
  shipmentDetails: FBAShipment
  handlePrintShipmentBillOfLading: (shipmentId: string) => void
  watingRepsonse: WaitingReponses
}

const TrackingEvents = ({ shipmentDetails, handlePrintShipmentBillOfLading, watingRepsonse }: Props) => {
  return (
    <div className='tw:my-4 tw:px-4'>
      <Col sm='12' lg='8'>
        <p className='tw:text-[16.25px] tw:font-bold'>Bill of Lading (BOL)</p>
        <p>
          Print Bill of Lading (BOL) document: <span className='tw:font-semibold'>{shipmentDetails.shipment.trackingDetails?.ltlTrackingDetail.billOfLadingNumber ?? 'Pending'}</span>
        </p>
        <Button
          disabled={watingRepsonse.printingLabel || !shipmentDetails.shipment.trackingDetails?.ltlTrackingDetail.billOfLadingNumber}
          color='primary'
          onClick={() => handlePrintShipmentBillOfLading(shipmentDetails.shipment.shipmentConfirmationId)}>
          {watingRepsonse.printingLabel ? (
            <span>
              <Spinner color='light' size={'sm'} className='tw:me-1' /> Downloading BOL...
            </span>
          ) : (
            'Download Bill Of Lading'
          )}
        </Button>
        <p className='tw:mt-4 tw:text-[11.2px] tw:text-[var(--bs-secondary-color)]'>The BOL will be generated no later than 8 a.m. the morning of pickup.</p>
      </Col>
    </div>
  )
}

export default TrackingEvents
