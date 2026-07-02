import { InboundPlan, WaitingReponses } from '@typesTs/amazon/fulfillments/fulfillment'
import { Spinner } from '@/components/migration-ui'

import BoxLabelsCard from './BoxLabelsCard'

type Props = {
  inboundPlan: InboundPlan
  handleNextStep: (shipmentId: any, boxes: number) => Promise<void>
  watingRepsonse: WaitingReponses
}

const BoxLabels = ({ inboundPlan, handleNextStep, watingRepsonse }: Props) => {
  return (
    <>
      {!watingRepsonse.boxLabels && inboundPlan.confirmedShipments && Object.values(inboundPlan.confirmedShipments)?.length > 0 ? (
        <div className='w-full px-4'>
          <p className='my-1 p-0 text-[13px]'>
            From:{' '}
            <span className='font-semibold'>
              {inboundPlan.sourceAddress.companyName}, {inboundPlan.sourceAddress.addressLine1}, {inboundPlan.sourceAddress.addressLine2}, {inboundPlan.sourceAddress.city},{' '}
              {inboundPlan.sourceAddress.stateOrProvinceCode}, {inboundPlan.sourceAddress.postalCode}, {inboundPlan.sourceAddress.countryCode}
            </span>
          </p>
          <p className='p-0 text-[13px]'>
            Ship Date: <span className='font-semibold'>09/15/2024</span>
          </p>
          <div className='flex flex-row flex-wrap justify-start items-start gap-4'>
            {Object.values(inboundPlan.confirmedShipments).map((shipment, shipmentIndex) => (
              <BoxLabelsCard key={shipment.shipmentId} inboundPlan={inboundPlan} handleNextStep={handleNextStep} shipment={shipment} shipmentIndex={shipmentIndex} />
            ))}
          </div>
        </div>
      ) : (
        <div className='w-full px-4'>
          <div className='my-4 flex justify-start items-center gap-4'>
            <Spinner color='primary' />
            <p className='m-0 p-0 font-normal text-[16.25px]'>Confirm charges and fees first for Box labels to be available.</p>
          </div>
        </div>
      )}
    </>
  )
}

export default BoxLabels
