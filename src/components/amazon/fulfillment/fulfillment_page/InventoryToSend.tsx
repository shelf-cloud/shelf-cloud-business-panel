/* eslint-disable @next/next/no-img-element */
import { NoImageAdress } from '@lib/assetsConstants'
import { InboundPlan, WaitingReponses } from '@typesTs/amazon/fulfillments/fulfillment'
import { Button, Col, Spinner } from '@/components/migration-ui'

type Props = {
  inboundPlan: InboundPlan
  handleNextStep?: (inboundPlanId: string) => void
  watingRepsonse: WaitingReponses
}

const InventoryToSend = ({ inboundPlan, handleNextStep, watingRepsonse }: Props) => {
  return (
    <div className='tw:w-full tw:p-0'>
      <Col xs='12' className='tw:overflow-auto'>
        <table className='tw:w-full tw:align-middle tw:mb-0 tw:[&_th]:px-2 tw:[&_th]:py-1 tw:[&_td]:px-2 tw:[&_td]:py-1'>
          <thead className='tw:bg-[color:var(--vz-light)]'>
            <tr>
              <th>SKU Details</th>
              <th className='tw:text-nowrap'>Packing Details</th>
              <th>Information</th>
              <th className='tw:text-center'>Quantity to Send</th>
            </tr>
          </thead>
          <tbody>
            {inboundPlan.items?.map((item) => (
              <tr className='tw:text-[11.2px]' key={item.msku}>
                <td>
                  <div className='tw:flex tw:justify-start tw:items-center tw:gap-2'>
                    <div
                      className='tw:my-2 tw:hidden tw:lg:block'
                      style={{
                        width: '60px',
                        minWidth: '60px',
                        height: '50px',
                        margin: '2px 0px',
                        position: 'relative',
                      }}>
                      <img
                        loading='lazy'
                        src={inboundPlan.skus_details[item.msku]?.image ? inboundPlan.skus_details[item.msku]?.image : NoImageAdress}
                        alt='product Image'
                        style={{ objectFit: 'contain', objectPosition: 'center', width: '100%', height: '100%' }}
                      />
                    </div>
                    <div
                      className='tw:my-2 tw:lg:hidden'
                      style={{
                        width: '200px',
                        height: '70px',
                        margin: '2px 0px',
                        position: 'relative',
                      }}>
                      <img
                        loading='lazy'
                        src={inboundPlan.skus_details[item.msku]?.image ? inboundPlan.skus_details[item.msku]?.image : NoImageAdress}
                        alt='product Image'
                        style={{ objectFit: 'contain', objectPosition: 'center', width: '100%', height: '100%' }}
                      />
                    </div>
                    <div>
                      <p className='tw:m-0 tw:p-0 tw:text-primary'>{inboundPlan.skus_details[item.msku]?.title}</p>
                      <p className='tw:m-0 tw:p-0 tw:font-semibold'>{`SC SKU: ${inboundPlan.skus_details[item.msku]?.shelfcloud_sku}`}</p>
                      <p className='tw:m-0 tw:p-0'>{`MSKU: ${item.msku}`}</p>
                      <p className='tw:m-0 tw:p-0'>{`ASIN: ${inboundPlan.skus_details[item.msku]?.asin}`}</p>
                    </div>
                  </div>
                </td>
                <td>
                  {inboundPlan.fulfillmentType === 'Master Boxes' ? (
                    <>
                      <p className='tw:m-0 tw:p-0 tw:text-nowrap'>
                        <span className='tw:text-[var(--bs-secondary-color)]'>Box Weight:</span>
                        {` ${inboundPlan.skus_details[item.msku]?.boxWeight} lbs`}
                      </p>
                      <p className='tw:m-0 tw:p-0 tw:text-nowrap'>
                        <span className='tw:text-[var(--bs-secondary-color)]'>Box Width:</span>
                        {` ${inboundPlan.skus_details[item.msku]?.boxWidth} in`}
                      </p>
                      <p className='tw:m-0 tw:p-0 tw:text-nowrap'>
                        <span className='tw:text-[var(--bs-secondary-color)]'>Box Height:</span>
                        {` ${inboundPlan.skus_details[item.msku]?.boxHeight} in`}
                      </p>
                      <p className='tw:m-0 tw:p-0 tw:text-nowrap'>
                        <span className='tw:text-[var(--bs-secondary-color)]'>Box Length:</span>
                        {` ${inboundPlan.skus_details[item.msku]?.boxLength} in`}
                      </p>
                    </>
                  ) : (
                    <>
                      <p className='tw:m-0 tw:p-0 tw:text-nowrap'>
                        <span className='tw:text-[var(--bs-secondary-color)]'>Weight:</span>
                        {` ${inboundPlan.skus_details[item.msku]?.weight} lbs`}
                      </p>
                      <p className='tw:m-0 tw:p-0 tw:text-nowrap'>
                        <span className='tw:text-[var(--bs-secondary-color)]'>Width:</span>
                        {` ${inboundPlan.skus_details[item.msku]?.width} in`}
                      </p>
                      <p className='tw:m-0 tw:p-0 tw:text-nowrap'>
                        <span className='tw:text-[var(--bs-secondary-color)]'>Height:</span>
                        {` ${inboundPlan.skus_details[item.msku]?.height} in`}
                      </p>
                      <p className='tw:m-0 tw:p-0 tw:text-nowrap'>
                        <span className='tw:text-[var(--bs-secondary-color)]'>Length:</span>
                        {` ${inboundPlan.skus_details[item.msku]?.length} in`}
                      </p>
                    </>
                  )}
                </td>
                <td>
                  {inboundPlan.fulfillmentType === 'Master Boxes' && (
                    <p className='tw:m-0 tw:p-0 tw:text-nowrap'>
                      <span className='tw:text-[var(--bs-secondary-color)]'>Unit per box:</span>
                      {` ${inboundPlan.skus_details[item.msku]?.boxQty}`}
                    </p>
                  )}
                  <p className='tw:m-0 tw:p-0 tw:text-nowrap'>
                    <span className='tw:text-[var(--bs-secondary-color)]'>Unit prep:</span>
                    {` ${item.prepOwner}`}
                  </p>
                  <p className='tw:m-0 tw:p-0 tw:text-nowrap'>
                    <span className='tw:text-[var(--bs-secondary-color)]'>Unit labelling:</span>
                    {` ${item.labelOwner}`}
                  </p>
                </td>
                <td className='tw:text-center'>
                  <p className='tw:m-0 tw:p-0 tw:text-nowrap'>
                    <span className='tw:text-[var(--bs-secondary-color)]'>Units:</span>
                    {` ${item.quantity}`}
                  </p>
                  {inboundPlan.fulfillmentType === 'Master Boxes' && (
                    <p className='tw:m-0 tw:p-0 tw:text-nowrap'>
                      <span className='tw:text-[var(--bs-secondary-color)]'>Boxes:</span>
                      {` ${inboundPlan.skus_details[item.msku]?.boxes}`}
                    </p>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Col>
      {handleNextStep && inboundPlan.fulfillmentType === 'Master Boxes' && (
        <Col xs='12' className='tw:flex tw:justify-end'>
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
