/* eslint-disable @next/next/no-img-element */
import { NoImageAdress } from '@lib/assetsConstants'
import { InboundPlan, WaitingReponses } from '@typesTs/amazon/fulfillments/fulfillment'
import React from 'react'
import { Button, Col, Spinner } from 'reactstrap'

type Props = {
  inboundPlan: InboundPlan
  handleNextStep?: (inboundPlanId: string) => void
  watingRepsonse: WaitingReponses
}

const InventoryToSend = ({ inboundPlan, handleNextStep, watingRepsonse }: Props) => {
  return (
    <div className='w-100 p-0'>
      <Col xs='12' className='overflow-auto'>
        <table className='table table-sm'>
          <thead className='table-light'>
            <tr>
              <th>SKU Details</th>
              <th className='text-nowrap'>Packing Details</th>
              <th>Information</th>
              <th className='text-center'>Quantity to Send</th>
            </tr>
          </thead>
          <tbody>
            {inboundPlan.items?.map((item) => (
              <tr className='fs-7' key={item.msku}>
                <td className='col-sm-12 col-lg-6'>
                  <div className='d-flex justify-content-start align-items-center gap-2'>
                    <div
                      className='my-2 d-none d-lg-block'
                      style={{
                        width: '60px',
                        minWidth: '60px',
                        height: '50px',
                        margin: '2px 0px',
                        position: 'relative',
                      }}>
                      <img
                        loading='lazy'
                        src={
                          inboundPlan.skus_details[item.msku].image
                            ? inboundPlan.skus_details[item.msku].image
                            : NoImageAdress
                        }
                        alt='product Image'
                        style={{ objectFit: 'contain', objectPosition: 'center', width: '100%', height: '100%' }}
                      />
                    </div>
                    <div
                      className='my-2 d-lg-none'
                      style={{
                        width: '200px',
                        height: '70px',
                        margin: '2px 0px',
                        position: 'relative',
                      }}>
                      <img
                        loading='lazy'
                        src={
                          inboundPlan.skus_details[item.msku].image
                            ? inboundPlan.skus_details[item.msku].image
                            : NoImageAdress
                        }
                        alt='product Image'
                        style={{ objectFit: 'contain', objectPosition: 'center', width: '100%', height: '100%' }}
                      />
                    </div>
                    <div>
                      <p className='m-0 p-0 text-primary'>{inboundPlan.skus_details[item.msku].title}</p>
                      <p className='m-0 p-0 fw-semibold'>{`SC SKU: ${inboundPlan.skus_details[item.msku].shelfcloud_sku}`}</p>
                      <p className='m-0 p-0'>{`MSKU: ${item.msku}`}</p>
                      <p className='m-0 p-0'>{`ASIN: ${inboundPlan.skus_details[item.msku].asin}`}</p>
                    </div>
                  </div>
                </td>
                <td>
                  {inboundPlan.fulfillmentType === 'Master Boxes' ? (
                    <>
                      <p className='m-0 p-0 text-nowrap'>
                        <span className='text-muted'>Box Weight:</span>
                        {` ${inboundPlan.skus_details[item.msku].boxWeight} lbs`}
                      </p>
                      <p className='m-0 p-0 text-nowrap'>
                        <span className='text-muted'>Box Width:</span>
                        {` ${inboundPlan.skus_details[item.msku].boxWidth} in`}
                      </p>
                      <p className='m-0 p-0 text-nowrap'>
                        <span className='text-muted'>Box Height:</span>
                        {` ${inboundPlan.skus_details[item.msku].boxHeight} in`}
                      </p>
                      <p className='m-0 p-0 text-nowrap'>
                        <span className='text-muted'>Box Length:</span>
                        {` ${inboundPlan.skus_details[item.msku].boxLength} in`}
                      </p>
                    </>
                  ) : (
                    <>
                      <p className='m-0 p-0 text-nowrap'>
                        <span className='text-muted'>Weight:</span>
                        {` ${inboundPlan.skus_details[item.msku].weight} lbs`}
                      </p>
                      <p className='m-0 p-0 text-nowrap'>
                        <span className='text-muted'>Width:</span>
                        {` ${inboundPlan.skus_details[item.msku].width} in`}
                      </p>
                      <p className='m-0 p-0 text-nowrap'>
                        <span className='text-muted'>Height:</span>
                        {` ${inboundPlan.skus_details[item.msku].height} in`}
                      </p>
                      <p className='m-0 p-0 text-nowrap'>
                        <span className='text-muted'>Length:</span>
                        {` ${inboundPlan.skus_details[item.msku].length} in`}
                      </p>
                    </>
                  )}
                </td>
                <td>
                  {inboundPlan.fulfillmentType === 'Master Boxes' && (
                    <p className='m-0 p-0 text-nowrap'>
                      <span className='text-muted'>Unit per box:</span>
                      {` ${inboundPlan.skus_details[item.msku].boxQty}`}
                    </p>
                  )}
                  <p className='m-0 p-0 text-nowrap'>
                    <span className='text-muted'>Unit prep:</span>
                    {` ${item.prepOwner}`}
                  </p>
                  <p className='m-0 p-0 text-nowrap'>
                    <span className='text-muted'>Unit labelling:</span>
                    {` ${item.labelOwner}`}
                  </p>
                </td>
                <td className='text-center'>
                  <p className='m-0 p-0 text-nowrap'>
                    <span className='text-muted'>Units:</span>
                    {` ${item.quantity}`}
                  </p>
                  {inboundPlan.fulfillmentType === 'Master Boxes' && (
                    <p className='m-0 p-0 text-nowrap'>
                      <span className='text-muted'>Boxes:</span>
                      {` ${inboundPlan.skus_details[item.msku].boxes}`}
                    </p>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Col>
      {handleNextStep && inboundPlan.fulfillmentType === 'Master Boxes' && (
        <Col xs='12' className='d-flex justify-content-end'>
          <Button
            disabled={watingRepsonse.inventoryToSend || inboundPlan.steps[1].complete}
            color='success'
            id='btn_handleNextStepPacking'
            onClick={() => handleNextStep(inboundPlan.inboundPlanId)}>
            {watingRepsonse.inventoryToSend ? <Spinner color='light' size={'sm'} /> : 'Confirm and Continue'}
          </Button>
        </Col>
      )}
    </div>
  )
}

export default InventoryToSend
