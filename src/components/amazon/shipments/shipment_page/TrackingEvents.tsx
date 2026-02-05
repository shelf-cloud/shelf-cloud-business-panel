import { FBAShipment } from '@typesTs/amazon/fbaShipments.interface'
import { WaitingReponses } from '@typesTs/amazon/fulfillments/fulfillment'
import { Button, Col, Spinner } from 'reactstrap'

type Props = {
  shipmentDetails: FBAShipment
  handlePrintShipmentBillOfLading: (shipmentId: string) => void
  watingRepsonse: WaitingReponses
}

const TrackingEvents = ({ shipmentDetails, handlePrintShipmentBillOfLading, watingRepsonse }: Props) => {
  return (
    <div className='my-3 px-3'>
      <Col sm='12' lg='8'>
        <p className='fs-5 fw-bold'>Bill of Lading (BOL)</p>
        <p>
          Print Bill of Lading (BOL) document: <span className='fw-semibold'>{shipmentDetails.shipment.trackingDetails?.ltlTrackingDetail.billOfLadingNumber ?? 'Pending'}</span>
        </p>
        <Button
          disabled={watingRepsonse.printingLabel || !shipmentDetails.shipment.trackingDetails?.ltlTrackingDetail.billOfLadingNumber}
          color='primary'
          onClick={() => handlePrintShipmentBillOfLading(shipmentDetails.shipment.shipmentConfirmationId)}>
          {watingRepsonse.printingLabel ? (
            <span>
              <Spinner color='light' size={'sm'} className='me-1' /> Downloading BOL...
            </span>
          ) : (
            'Download Bill Of Lading'
          )}
        </Button>
        <p className=' mt-3 fs-7 text-muted'>The BOL will be generated no later than 8 a.m. the morning of pickup.</p>
      </Col>
    </div>
  )
}

export default TrackingEvents
