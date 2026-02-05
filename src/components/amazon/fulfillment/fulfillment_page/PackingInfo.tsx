/* eslint-disable @next/next/no-img-element */
import { NoImageAdress } from '@lib/assetsConstants'
import { InboundPlan, WaitingReponses } from '@typesTs/amazon/fulfillments/fulfillment'
import { Button, Card, CardBody, CardHeader, Col, Spinner } from 'reactstrap'

type Props = {
  inboundPlan: InboundPlan
  handleNextStep?: (inboundPlanId: string) => void
  watingRepsonse: WaitingReponses
}

const PackingInfo = ({ inboundPlan, handleNextStep, watingRepsonse }: Props) => {
  return (
    <div className='w-100 px-3'>
      <div className='my-3'>
        {!inboundPlan.packingInformation && <p className='m-0 text-danger'>{`We're still working on packing information.`}</p>}
        {inboundPlan.packingInformation && <p className='m-0 text-primary'>Packing Information ready.</p>}
        {/* <p className='m-0'>SKUs already case-packed: 0 (0 units) in 0 box or boxes</p> */}
      </div>
      <div>
        {inboundPlan.packingOptions.map((packingOption, packingOptionindex) => (
          <div key={`${packingOption.packingOptionId}-option-${packingOptionindex}`} className='d-flex flex-row flex-nowrap justify-content-start align-items-center gap-3'>
            {packingOption.packingGroups.map((packingGroupId, packingGroupindex) => (
              <Card key={`${packingGroupId}-group-${packingGroupindex}`} className='m-0 shadow-sm' style={{ width: 'fit-content', maxWidth: '400px' }}>
                <CardHeader>
                  <p className='m-0 fw-bold fs-5'>{`Pack Group ${packingGroupindex + 1}`}</p>
                  <p className='m-0 fs-7'>
                    These SKUs can be packed together:{' '}
                    <span>
                      {inboundPlan.packingGroups[packingGroupId].packingItems.length} SKUs (
                      {inboundPlan.packingGroups[packingGroupId].packingItems.reduce((total, item) => total + item.quantity, 0)} units)
                    </span>
                  </p>
                </CardHeader>
                <CardBody>
                  <div className='d-flex flex-row flex-nowrap justify-content-start align-items-center gap-2'>
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
                                src={inboundPlan.skus_details[item.msku].image ? inboundPlan.skus_details[item.msku].image : NoImageAdress}
                                alt='product Image'
                                style={{ objectFit: 'contain', objectPosition: 'center', width: '100%', height: '100%' }}
                              />
                            </div>
                            <p className='m-0 fs-7'>x{item.quantity}</p>
                          </div>
                        )
                    )}
                    {inboundPlan.packingGroups[packingGroupId].packingItems.length > 5 && <p>+{inboundPlan.packingGroups[packingGroupId].packingItems.length - 5}</p>}
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        ))}
      </div>

      {handleNextStep && inboundPlan.fulfillmentType === 'Master Boxes' && (
        <Col xs='12' className='d-flex justify-content-end'>
          <Button
            disabled={watingRepsonse.inventoryToSend || !inboundPlan.packingInformation || inboundPlan.steps[3].complete}
            color='success'
            id='btn_handleNextStepPacking'
            onClick={() => handleNextStep(inboundPlan.inboundPlanId)}>
            {watingRepsonse.inventoryToSend ? (
              <span>
                <Spinner color='light' size={'sm'} className='me-2' /> Confirming...
              </span>
            ) : (
              'Confirm and Continue'
            )}
          </Button>
        </Col>
      )}
    </div>
  )
}

export default PackingInfo
