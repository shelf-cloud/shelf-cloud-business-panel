import { InboundPlan, WaitingReponses } from '@typesTs/amazon/fulfillments/fulfillment'
import React from 'react'
import { Spinner } from 'reactstrap'
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
        <div className='w-100 px-3'>
          <p className='my-1 p-0 fs-6'>
            From:{' '}
            <span className='fw-semibold'>
              {inboundPlan.sourceAddress.companyName}, {inboundPlan.sourceAddress.addressLine1}, {inboundPlan.sourceAddress.addressLine2}, {inboundPlan.sourceAddress.city},{' '}
              {inboundPlan.sourceAddress.stateOrProvinceCode}, {inboundPlan.sourceAddress.postalCode}, {inboundPlan.sourceAddress.countryCode}
            </span>
          </p>
          <p className='p-0 fs-6'>
            Ship Date: <span className='fw-semibold'>09/15/2024</span>
          </p>
          <div className='d-flex flex-row flex-wrap justify-content-start align-items-start gap-3'>
            {Object.values(inboundPlan.confirmedShipments).map((shipment, shipmentIndex) => (
              <BoxLabelsCard
                key={shipment.shipmentId}
                inboundPlan={inboundPlan}
                handleNextStep={handleNextStep}
                shipment={shipment}
                shipmentIndex={shipmentIndex}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className='w-100 px-3'>
          <div className='my-3 d-flex justify-content-start align-items-center gap-3'>
            <Spinner color='primary' />
            <p className='m-0 p-0 fw-normal fs-5'>Confirm charges and fees first for Box labels to be available.</p>
          </div>
        </div>
      )}
    </>
  )
}

export default BoxLabels
