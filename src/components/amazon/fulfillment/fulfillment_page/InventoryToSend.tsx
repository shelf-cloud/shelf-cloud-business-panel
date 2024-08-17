/* eslint-disable @next/next/no-img-element */
import { InboundPlan, WaitingReponses } from '@typesTs/amazon/fulfillments/fulfillment'
import React from 'react'
import { Button, Spinner } from 'reactstrap'

type Props = {
  inboundPlan: InboundPlan
  handleNextStep: (inboundPlanId: string) => void
  watingRepsonse: WaitingReponses
}

const InventoryToSend = ({ inboundPlan, handleNextStep, watingRepsonse }: Props) => {
  return (
    <div className='w-100 px-3'>
      <table className='table table-sm'>
        <thead className='table-light'>
          <tr>
            <th>SKU Details</th>
            <th>Packing Details</th>
            <th>Information/Action</th>
            <th className='text-center'>Quantity to Send</th>
          </tr>
        </thead>
        <tbody>
          {inboundPlan.items?.map((item) => (
            <tr className='fs-7' key={item.msku}>
              <td className='w-50'>
                <div className='d-flex justify-content-start align-items-center gap-2'>
                  <div
                    className='my-2'
                    style={{
                      width: '60px',
                      height: '50px',
                      margin: '2px 0px',
                      position: 'relative',
                    }}>
                    <img
                      loading='lazy'
                      src={
                        inboundPlan.skus_details[item.msku].image
                          ? inboundPlan.skus_details[item.msku].image
                          : 'https://firebasestorage.googleapis.com/v0/b/etiquetas-fba.appspot.com/o/image%2Fno-image.png?alt=media&token=c2232af5-43f6-4739-84eb-1d4803c44770'
                      }
                      alt='product Image'
                      style={{ objectFit: 'contain', objectPosition: 'center', width: '100%', height: '100%' }}
                    />
                  </div>
                  <div>
                    <p className='m-0 p-0 text-primary'>{inboundPlan.skus_details[item.msku].title}</p>
                    <p className='m-0 p-0'>{`SKU: ${item.msku}`}</p>
                    <p className='m-0 p-0'>{`ASIN: ${inboundPlan.skus_details[item.msku].asin}`}</p>
                  </div>
                </div>
              </td>
              <td className='py-2'>
                {inboundPlan.fulfillmentType === 'Master Boxes' ? (
                  <>
                    <p className='m-0 p-0'>
                      <span className='text-muted'>Box Weight:</span>
                      {` ${inboundPlan.skus_details[item.msku].boxWeight} lbs`}
                    </p>
                    <p className='m-0 p-0'>
                      <span className='text-muted'>Box Width:</span>
                      {` ${inboundPlan.skus_details[item.msku].boxWidth} in`}
                    </p>
                    <p className='m-0 p-0'>
                      <span className='text-muted'>Box Height:</span>
                      {` ${inboundPlan.skus_details[item.msku].boxHeight} in`}
                    </p>
                    <p className='m-0 p-0'>
                      <span className='text-muted'>Box Length:</span>
                      {` ${inboundPlan.skus_details[item.msku].boxLength} in`}
                    </p>
                  </>
                ) : (
                  <>
                    <p className='m-0 p-0'>
                      <span className='text-muted'>Weight:</span>
                      {` ${inboundPlan.skus_details[item.msku].weight} lbs`}
                    </p>
                    <p className='m-0 p-0'>
                      <span className='text-muted'>Width:</span>
                      {` ${inboundPlan.skus_details[item.msku].width} in`}
                    </p>
                    <p className='m-0 p-0'>
                      <span className='text-muted'>Height:</span>
                      {` ${inboundPlan.skus_details[item.msku].height} in`}
                    </p>
                    <p className='m-0 p-0'>
                      <span className='text-muted'>Length:</span>
                      {` ${inboundPlan.skus_details[item.msku].length} in`}
                    </p>
                  </>
                )}
              </td>
              <td>
                {inboundPlan.fulfillmentType === 'Master Boxes' && (
                  <p className='m-0 p-0 '>
                    <span className='text-muted'>Unit per box:</span>
                    {` ${inboundPlan.skus_details[item.msku].boxQty}`}
                  </p>
                )}
                <p className='m-0 p-0 '>
                  <span className='text-muted'>Unit prep:</span>
                  {` ${item.prepOwner}`}
                </p>
                <p className='m-0 p-0'>
                  <span className='text-muted'>Unit labelling:</span>
                  {` ${item.labelOwner}`}
                </p>
              </td>
              <td className='text-center'>
                <p className='m-0 p-0 '>
                  <span className='text-muted'>Units:</span>
                  {` ${item.quantity}`}
                </p>
                {inboundPlan.fulfillmentType === 'Master Boxes' && (
                  <p className='m-0 p-0 '>
                    <span className='text-muted'>Boxes:</span>
                    {` ${inboundPlan.skus_details[item.msku].boxes}`}
                  </p>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className='d-flex justify-content-end'>
        <Button
          disabled={watingRepsonse.shipping || inboundPlan.steps[1].complete}
          color='success'
          id='btn_handleNextStepPacking'
          onClick={() => handleNextStep(inboundPlan.inboundPlanId)}>
          {watingRepsonse.shipping ? <Spinner color='light' size={'sm'} /> : 'Confirm and Continue'}
        </Button>
      </div>
    </div>
  )
}

export default InventoryToSend
