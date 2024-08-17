/* eslint-disable @next/next/no-img-element */
import { InboundPlan } from '@typesTs/amazon/fulfillments/fulfillment'
import React from 'react'
import { Button, Card, CardBody, CardFooter, CardHeader, Spinner } from 'reactstrap'

type Props = {
  fulfillment: InboundPlan
  handleNextStep: (inboundPlanId: string, packingOptionId: string) => void
  watingRepsonse: boolean
}

const Packing = ({ fulfillment, handleNextStep, watingRepsonse }: Props) => {
  return (
    <div className='w-100'>
      <div className='d-flex flex-row justify-content-start align-items-center gap-3'>
        {fulfillment.packingOptions?.map((packingOption, index) => (
          <Card key={packingOption.packingOptionId}>
            <CardHeader>
              <p className='fs-4 fw-bold m-0'>{`Packing Option ${index + 1}`}</p>
              <p className='m-0 p-0'>{`Status: ${packingOption.status}`}</p>
              <p>{packingOption.packingOptionId}</p>
              {/* <p className='m-0 p-0'>{`Supported Shipping Configurations: ${packingOption.supportedShippingConfigurations}`}</p> */}
            </CardHeader>
            <CardBody>
              <div className='d-flex flex-column justify-content-start align-items-start gap-2'>
                {packingOption.packingGroups.map((packingGroup, packingGroupIndex) => (
                  <div key={packingGroup}>
                    <p className='fs-5 fw-bold m-0'>{`Pack Group ${packingGroupIndex + 1}`}</p>
                    <p className='m-0 p-0 fs-7 text-muted'>{`These SKUs can be packed together: ${packingOption.packingGroups.length} SKUs (${packingOption.packingItems[
                      packingGroup
                    ].reduce((total, packingItem) => total + packingItem.quantity, 0)} units)`}</p>
                    <div className='d-flex flex-row justify-content-start align-items-center gap-2'>
                      {packingOption.packingItems[packingGroup].map((packingItem) => (
                        <div key={packingItem.msku} className='text-center'>
                          <div
                            style={{
                              width: '70px',
                              height: '50px',
                              margin: '0px',
                              position: 'relative',
                            }}>
                            <img
                              loading='lazy'
                              src={
                                fulfillment.skus_details[packingItem.msku].image
                                  ? fulfillment.skus_details[packingItem.msku].image
                                  : 'https://firebasestorage.googleapis.com/v0/b/etiquetas-fba.appspot.com/o/image%2Fno-image.png?alt=media&token=c2232af5-43f6-4739-84eb-1d4803c44770'
                              }
                              alt='product Image'
                              style={{ objectFit: 'contain', objectPosition: 'center', width: '100%', height: '100%' }}
                            />
                          </div>
                          <p className='m-0 p-0 fs-7 '>{`x ${packingItem.quantity}`}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardBody>
            <CardFooter className='d-flex justify-content-end'>
              <Button
                disabled={watingRepsonse}
                color='success'
                id='btn_handleNextShipping'
                onClick={() => handleNextStep(fulfillment.inboundPlanId, packingOption.packingOptionId)}>
                {watingRepsonse ? <Spinner color='light' size={'sm'} /> : 'Next Step'}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default Packing
