/* eslint-disable @next/next/no-img-element */
import { NoImageAdress } from '@lib/assetsConstants'
import { InboundPlan, WaitingReponses } from '@typesTs/amazon/fulfillments/fulfillment'
import { Button } from '@shadcn/ui/button'
import { Spinner } from '@shadcn/ui/spinner'

type Props = {
  inboundPlan: InboundPlan
  handleNextStep?: (inboundPlanId: string) => void
  watingRepsonse: WaitingReponses
}

const InventoryToSend = ({ inboundPlan, handleNextStep, watingRepsonse }: Props) => {
  return (
    <div className='w-full p-0'>
      <div className='px-3 w-full overflow-auto'>
        <table className='w-full align-middle mb-0 [&_th]:px-2 [&_th]:py-1 [&_td]:px-2 [&_td]:py-1'>
          <thead className='bg-[color:var(--vz-light)]'>
            <tr>
              <th>SKU Details</th>
              <th className='text-nowrap'>Packing Details</th>
              <th>Information</th>
              <th className='text-center'>Quantity to Send</th>
            </tr>
          </thead>
          <tbody>
            {inboundPlan.items?.map((item) => (
              <tr className='text-[11.2px]' key={item.msku}>
                <td>
                  <div className='flex justify-start items-center gap-2'>
                    <div
                      className='my-2 hidden lg:block'
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
                      className='my-2 lg:hidden'
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
                      <p className='m-0 p-0 text-primary'>{inboundPlan.skus_details[item.msku]?.title}</p>
                      <p className='m-0 p-0 font-semibold'>{`SC SKU: ${inboundPlan.skus_details[item.msku]?.shelfcloud_sku}`}</p>
                      <p className='m-0 p-0'>{`MSKU: ${item.msku}`}</p>
                      <p className='m-0 p-0'>{`ASIN: ${inboundPlan.skus_details[item.msku]?.asin}`}</p>
                    </div>
                  </div>
                </td>
                <td>
                  {inboundPlan.fulfillmentType === 'Master Boxes' ? (
                    <>
                      <p className='m-0 p-0 text-nowrap'>
                        <span className='text-muted-foreground'>Box Weight:</span>
                        {` ${inboundPlan.skus_details[item.msku]?.boxWeight} lbs`}
                      </p>
                      <p className='m-0 p-0 text-nowrap'>
                        <span className='text-muted-foreground'>Box Width:</span>
                        {` ${inboundPlan.skus_details[item.msku]?.boxWidth} in`}
                      </p>
                      <p className='m-0 p-0 text-nowrap'>
                        <span className='text-muted-foreground'>Box Height:</span>
                        {` ${inboundPlan.skus_details[item.msku]?.boxHeight} in`}
                      </p>
                      <p className='m-0 p-0 text-nowrap'>
                        <span className='text-muted-foreground'>Box Length:</span>
                        {` ${inboundPlan.skus_details[item.msku]?.boxLength} in`}
                      </p>
                    </>
                  ) : (
                    <>
                      <p className='m-0 p-0 text-nowrap'>
                        <span className='text-muted-foreground'>Weight:</span>
                        {` ${inboundPlan.skus_details[item.msku]?.weight} lbs`}
                      </p>
                      <p className='m-0 p-0 text-nowrap'>
                        <span className='text-muted-foreground'>Width:</span>
                        {` ${inboundPlan.skus_details[item.msku]?.width} in`}
                      </p>
                      <p className='m-0 p-0 text-nowrap'>
                        <span className='text-muted-foreground'>Height:</span>
                        {` ${inboundPlan.skus_details[item.msku]?.height} in`}
                      </p>
                      <p className='m-0 p-0 text-nowrap'>
                        <span className='text-muted-foreground'>Length:</span>
                        {` ${inboundPlan.skus_details[item.msku]?.length} in`}
                      </p>
                    </>
                  )}
                </td>
                <td>
                  {inboundPlan.fulfillmentType === 'Master Boxes' && (
                    <p className='m-0 p-0 text-nowrap'>
                      <span className='text-muted-foreground'>Unit per box:</span>
                      {` ${inboundPlan.skus_details[item.msku]?.boxQty}`}
                    </p>
                  )}
                  <p className='m-0 p-0 text-nowrap'>
                    <span className='text-muted-foreground'>Unit prep:</span>
                    {` ${item.prepOwner}`}
                  </p>
                  <p className='m-0 p-0 text-nowrap'>
                    <span className='text-muted-foreground'>Unit labelling:</span>
                    {` ${item.labelOwner}`}
                  </p>
                </td>
                <td className='text-center'>
                  <p className='m-0 p-0 text-nowrap'>
                    <span className='text-muted-foreground'>Units:</span>
                    {` ${item.quantity}`}
                  </p>
                  {inboundPlan.fulfillmentType === 'Master Boxes' && (
                    <p className='m-0 p-0 text-nowrap'>
                      <span className='text-muted-foreground'>Boxes:</span>
                      {` ${inboundPlan.skus_details[item.msku]?.boxes}`}
                    </p>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {handleNextStep && inboundPlan.fulfillmentType === 'Master Boxes' && (
        <div className='px-3 w-full flex justify-end'>
          <Button
            disabled={watingRepsonse.inventoryToSend || inboundPlan.steps[1].complete}
            variant='success'
            id='btn_handleNextStepPacking'
            onClick={() => handleNextStep(inboundPlan.inboundPlanId)}>
            {watingRepsonse.inventoryToSend ? <Spinner className='text-white' /> : 'Confirm and Continue'}
          </Button>
        </div>
      )}
    </div>
  )
}

export default InventoryToSend
