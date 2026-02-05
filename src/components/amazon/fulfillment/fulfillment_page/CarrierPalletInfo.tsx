 
import { InboundPlan, WaitingReponses } from '@typesTs/amazon/fulfillments/fulfillment'
import { Spinner } from 'reactstrap'

import CarrierPalletCard from './CarrierPalletCard'

type Props = {
  inboundPlan: InboundPlan
  handleNextStep: (shipmentId: any, boxes: number) => Promise<void>
  watingRepsonse: WaitingReponses
}

const CarrierPalletInfo = ({ inboundPlan, handleNextStep, watingRepsonse }: Props) => {
  return (
    <>
      {!watingRepsonse.boxLabels && inboundPlan.confirmedShipments && Object.values(inboundPlan.confirmedShipments)?.length > 0 ? (
        <div className='w-100 px-3'>
          <div className='d-flex flex-row flex-wrap justify-content-start align-items-start gap-3'>
            {Object.values(inboundPlan.confirmedShipments).map((shipment, shipmentIndex) => (
              <CarrierPalletCard key={shipment.shipmentId} inboundPlan={inboundPlan} handleNextStep={handleNextStep} shipment={shipment} shipmentIndex={shipmentIndex} />
            ))}
          </div>
        </div>
      ) : (
        <div className='w-100 px-3'>
          <div className='my-3 d-flex justify-content-start align-items-center gap-3'>
            <Spinner color='primary' />
            <p className='m-0 p-0 fw-normal fs-5'>Confirm charges and fees first for Pallet labels to be available.</p>
          </div>
        </div>
      )}
    </>
  )
}

export default CarrierPalletInfo
