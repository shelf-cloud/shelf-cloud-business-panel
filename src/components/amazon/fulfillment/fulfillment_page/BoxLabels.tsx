/* eslint-disable @next/next/no-img-element */
import AppContext from '@context/AppContext'
import { FormatIntPercentage } from '@lib/FormatNumbers'
import { InboundPlan, WaitingReponses } from '@typesTs/amazon/fulfillments/fulfillment'
import React, { useContext } from 'react'
import { Button, Card, CardBody, CardFooter, CardHeader, Spinner } from 'reactstrap'

type Props = {
  inboundPlan: InboundPlan
  handleNextStep: (shipmentId: any, boxes: number) => void
  watingRepsonse: WaitingReponses
}

const BoxLabels = ({ inboundPlan, handleNextStep, watingRepsonse }: Props) => {
  const { state }: any = useContext(AppContext)

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
              <Card
                key={shipment.shipmentId}
                className='m-0 shadow-sm'
                style={{ width: 'fit-content', maxWidth: '400px', zIndex: Object.values(inboundPlan.confirmedShipments).length - shipmentIndex }}>
                <CardHeader>
                  <p className='m-0 p-0 fw-bold fs-6'>Shipment #{shipmentIndex + 1}</p>
                </CardHeader>
                <CardBody>
                  <p className='m-0 fs-7'>
                    <span className='text-primary'>Shipment Name: </span>
                    {shipment.shipment.name}
                  </p>
                  <p className='m-0 fs-7'>
                    <span className='text-primary'>Shipment ID: </span>
                    {shipment.shipment.shipmentConfirmationId}
                  </p>
                  <p className='m-0 fs-7'>
                    <span className='text-primary'>Ship From: </span>
                    {shipment.shipment.source.address.name}, {shipment.shipment.source.address.addressLine1}, {shipment.shipment.source.address.city},{' '}
                    {shipment.shipment.source.address.stateOrProvinceCode}, {shipment.shipment.source.address.postalCode}, {shipment.shipment.source.address.countryCode}
                  </p>
                  <p className='m-0 fs-7'>
                    <span className='text-primary'>Ship to: </span>
                    {shipment.shipment.destination.warehouseId} - {shipment.shipment.destination.address.addressLine1}, {shipment.shipment.destination.address.city},{' '}
                    {shipment.shipment.destination.address.stateOrProvinceCode}, {shipment.shipment.destination.address.countryCode}
                  </p>
                  <p className='my-2 p-0 fw-semibold fs-7'>Shipment Contents</p>
                  <div className='d-flex flex-row flex-nowrap justify-content-between align-items-start'>
                    <div>
                      <p className='m-0 p-0 fs-7'>
                        Boxes: <span className='fw-bold'>{shipment.shipmentBoxes.boxes.reduce((total, item) => total + item.quantity, 0)}</span>
                      </p>
                      <p className='m-0 p-0 fs-7'>
                        SKUs: <span className='fw-bold'>{shipment.shipmentItems.items.length}</span>
                      </p>
                      <p className='m-0 p-0 fs-7'>
                        Units:{' '}
                        <span className='fw-bold'>
                          {shipment.shipmentBoxes.boxes.reduce((total, item) => {
                            const totalitems = item.items.reduce((total, item) => total + item.quantity, 0) * item.quantity
                            return total + totalitems
                          }, 0)}
                        </span>
                      </p>
                      <p className='m-0 p-0 fs-7'>
                        Weight:{' '}
                        <span className='fw-bold'>
                          {FormatIntPercentage(
                            state.currentRegion,
                            shipment.shipmentBoxes.boxes.reduce((total, item) => {
                              const totalitems = item.weight.value * item.quantity
                              return total + totalitems
                            }, 0)
                          )}{' '}
                          Lb
                        </span>
                      </p>
                    </div>
                    <div className='d-flex flex-row flex-nowrap justify-content-end align-items-center gap-2'>
                      {shipment.shipmentItems.items.map(
                        (item, itemIndex) =>
                          itemIndex <= 2 && (
                            <div
                              key={`${shipment.shipmentId}-${itemIndex}`}
                              className='my-2'
                              style={{
                                width: '50px',
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
                          )
                      )}
                      {shipment.shipmentItems.items.length > 3 && <p>+{shipment.shipmentItems.items.length - 3}</p>}
                    </div>
                  </div>
                </CardBody>
                <CardFooter>
                  <div className='d-flex justify-content-between align-items-center'>
                    <p className='m-0 p-0 fw-semibold'>Print Box and Shipping Lables</p>
                    <Button
                      disabled={watingRepsonse.printingLabel}
                      size='sm'
                      color='success'
                      id={shipment.shipment.shipmentConfirmationId}
                      onClick={() =>
                        handleNextStep(
                          shipment.shipment.shipmentConfirmationId,
                          shipment.shipmentBoxes.boxes.reduce((total, item) => total + item.quantity, 0)
                        )
                      }>
                      {watingRepsonse.printingLabel ? (
                        <span className='text-nowrap'>
                          <Spinner color='light' size={'sm'} className='me-1' /> Downloading Labels
                        </span>
                      ) : (
                        'Print Box Labels'
                      )}
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
          {/* TOTAL ESTIMATED FEES */}
          {/* <Row className='mt-5 mb-3'>
            <Col xs='12' lg='8'>
              <p className='fs-6 fw-bold'>Your shipment or shipments are now complete.</p>
              <p className='fs-7'>The Fulfillment has been created successfully, ShelfCloud has received the information and will begin to prepare the Shipments.</p>
            </Col>
            <Col xs='12' lg='4'>
              <table className='table table-sm fs-7'>
                <tbody>
                  <tr>
                    <td>Total prep and labeling fees:</td>
                    <td>{FormatCurrency(state.currentRegion, inboundPlan.totalPrepFees)}</td>
                  </tr>
                  <tr>
                    <td>Total placement fees:</td>
                    <td>{FormatCurrency(state.currentRegion, inboundPlan.totalPlacementFees)}</td>
                  </tr>
                  <tr>
                    <td>{inboundPlan.totalLtlFees > 0 ? 'SPD shipping fees:' : 'Total estimated shipping fees:'}</td>
                    <td>{FormatCurrency(state.currentRegion, inboundPlan.totalSpdFees)}</td>
                  </tr>
                  {inboundPlan.totalLtlFees > 0 && (
                    <tr>
                      <td>LTL shipping fees:</td>
                      <td>{FormatCurrency(state.currentRegion, inboundPlan.totalLtlFees)}</td>
                    </tr>
                  )}
                  <tr className='fw-bold'>
                    <td>Total estimated prep, labeling, placement, and shipping fees (other fees may apply):</td>
                    <td>{FormatCurrency(state.currentRegion, inboundPlan.totalFees)}</td>
                  </tr>
                </tbody>
              </table>
            </Col>
          </Row> */}
        </div>
      ) : (
        <div className='w-100 px-3'>
          <div className='my-3 d-flex justify-content-start align-items-center gap-3'>
            <Spinner color='primary' />
            <p className='m-0 p-0 fw-normal fs-5'>Confirming Charges and Fees, this may take a few minutes...</p>
          </div>
        </div>
      )}
    </>
  )
}

export default BoxLabels
