import { FBAShipment } from '@typesTs/amazon/fbaShipments.interface'
import { WaitingReponses } from '@typesTs/amazon/fulfillments/fulfillment'
import { Button } from '@shadcn/ui/button'
import { Spinner } from '@shadcn/ui/spinner'

type Props = {
  shipmentDetails: FBAShipment
  handlePrintShipmentBillOfLading: (shipmentId: string) => void
  watingRepsonse: WaitingReponses
}

const TrackingEvents = ({ shipmentDetails, handlePrintShipmentBillOfLading, watingRepsonse }: Props) => {
  return (
    <div className='my-4 px-4'>
      <div className='px-3 sm:w-full lg:w-8/12'>
        <p className='text-[16.25px] font-bold'>Bill of Lading (BOL)</p>
        <p>
          Print Bill of Lading (BOL) document: <span className='font-semibold'>{shipmentDetails.shipment.trackingDetails?.ltlTrackingDetail.billOfLadingNumber ?? 'Pending'}</span>
        </p>
        <Button
          disabled={watingRepsonse.printingLabel || !shipmentDetails.shipment.trackingDetails?.ltlTrackingDetail.billOfLadingNumber}
          onClick={() => handlePrintShipmentBillOfLading(shipmentDetails.shipment.shipmentConfirmationId)}>
          {watingRepsonse.printingLabel ? (
            <span>
              <Spinner className='text-white me-1' /> Downloading BOL...
            </span>
          ) : (
            'Download Bill Of Lading'
          )}
        </Button>
        <p className='mt-4 text-[11.2px] text-muted-foreground'>The BOL will be generated no later than 8 a.m. the morning of pickup.</p>
      </div>
    </div>
  )
}

export default TrackingEvents
