 
import { InboundPlan, WaitingReponses } from '@typesTs/amazon/fulfillments/fulfillment'
import { Spinner } from '@/components/migration-ui'

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
        <div className='w-full px-4'>
          <div className='flex flex-row flex-wrap justify-start items-start gap-4'>
            {Object.values(inboundPlan.confirmedShipments).map((shipment, shipmentIndex) => (
              <CarrierPalletCard key={shipment.shipmentId} inboundPlan={inboundPlan} handleNextStep={handleNextStep} shipment={shipment} shipmentIndex={shipmentIndex} />
            ))}
          </div>
        </div>
      ) : (
        <div className='w-full px-4'>
          <div className='my-4 flex justify-start items-center gap-4'>
            <Spinner color='primary' />
            <p className='m-0 p-0 font-normal text-[16.25px]'>Confirm charges and fees first for Pallet labels to be available.</p>
          </div>
        </div>
      )}
    </>
  )
}

export default CarrierPalletInfo
