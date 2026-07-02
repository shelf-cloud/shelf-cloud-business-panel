 
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
        <div className='tw:w-full tw:px-4'>
          <div className='tw:flex tw:flex-row tw:flex-wrap tw:justify-start tw:items-start tw:gap-4'>
            {Object.values(inboundPlan.confirmedShipments).map((shipment, shipmentIndex) => (
              <CarrierPalletCard key={shipment.shipmentId} inboundPlan={inboundPlan} handleNextStep={handleNextStep} shipment={shipment} shipmentIndex={shipmentIndex} />
            ))}
          </div>
        </div>
      ) : (
        <div className='tw:w-full tw:px-4'>
          <div className='tw:my-4 tw:flex tw:justify-start tw:items-center tw:gap-4'>
            <Spinner color='primary' />
            <p className='tw:m-0 tw:p-0 tw:font-normal tw:text-[16.25px]'>Confirm charges and fees first for Pallet labels to be available.</p>
          </div>
        </div>
      )}
    </>
  )
}

export default CarrierPalletInfo
