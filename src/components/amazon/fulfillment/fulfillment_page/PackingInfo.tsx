/* eslint-disable @next/next/no-img-element */
import { NoImageAdress } from '@lib/assetsConstants'
import { InboundPlan, WaitingReponses } from '@typesTs/amazon/fulfillments/fulfillment'
import { Button } from '@shadcn/ui/button'
import { Card, CardContent, CardHeader } from '@shadcn/ui/card'
import { Spinner } from '@shadcn/ui/spinner'

type Props = {
  inboundPlan: InboundPlan
  handleNextStep?: (inboundPlanId: string) => void
  watingRepsonse: WaitingReponses
}

const PackingInfo = ({ inboundPlan, handleNextStep, watingRepsonse }: Props) => {
  return (
    <div className='w-full px-4'>
      <div className='my-4'>
        {!inboundPlan.packingInformation && <p className='m-0 text-danger'>{`We're still working on packing information.`}</p>}
        {inboundPlan.packingInformation && <p className='m-0 text-primary'>Packing Information ready.</p>}
        {/* <p className='m-0'>SKUs already case-packed: 0 (0 units) in 0 box or boxes</p> */}
      </div>
      <div>
        {inboundPlan.packingOptions.map((packingOption, packingOptionindex) => (
          <div key={`${packingOption.packingOptionId}-option-${packingOptionindex}`} className='flex flex-row flex-nowrap justify-start items-center gap-4'>
            {packingOption.packingGroups.map((packingGroupId, packingGroupindex) => (
              <Card key={`${packingGroupId}-group-${packingGroupindex}`} className='m-0 shadow-sm' style={{ width: 'fit-content', maxWidth: '400px' }}>
                <CardHeader>
                  <p className='m-0 font-bold text-[16.25px]'>{`Pack Group ${packingGroupindex + 1}`}</p>
                  <p className='m-0 text-[11.2px]'>
                    These SKUs can be packed together:{' '}
                    <span>
                      {inboundPlan.packingGroups[packingGroupId].packingItems.length} SKUs (
                      {inboundPlan.packingGroups[packingGroupId].packingItems.reduce((total, item) => total + item.quantity, 0)} units)
                    </span>
                  </p>
                </CardHeader>
                <CardContent>
                  <div className='flex flex-row flex-nowrap justify-start items-center gap-2'>
                    {inboundPlan.packingGroups[packingGroupId].packingItems.map(
                      (item, itemIndex) =>
                        itemIndex <= 4 && (
                          <div key={`${packingGroupId}-item-${itemIndex}`} className='text-center'>
                            <div
                              key={`${packingGroupId}-${itemIndex}`}
                              className='my-2'
                              style={{
                                width: '50px',
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
                            <p className='m-0 text-[11.2px]'>x{item.quantity}</p>
                          </div>
                        )
                    )}
                    {inboundPlan.packingGroups[packingGroupId].packingItems.length > 5 && <p>+{inboundPlan.packingGroups[packingGroupId].packingItems.length - 5}</p>}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ))}
      </div>

      {handleNextStep && inboundPlan.fulfillmentType === 'Master Boxes' && (
        <div className='w-full flex justify-end'>
          <Button
            disabled={watingRepsonse.inventoryToSend || !inboundPlan.packingInformation || inboundPlan.steps[3].complete}
            variant='success'
            id='btn_handleNextStepPacking'
            onClick={() => handleNextStep(inboundPlan.inboundPlanId)}>
            {watingRepsonse.inventoryToSend ? (
              <span>
                <Spinner className='text-white me-2' /> Confirming...
              </span>
            ) : (
              'Confirm and Continue'
            )}
          </Button>
        </div>
      )}
    </div>
  )
}

export default PackingInfo
