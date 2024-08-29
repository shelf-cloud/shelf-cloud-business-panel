/* eslint-disable @next/next/no-img-element */
import React, { useContext, useState } from 'react'
import AppContext from '@context/AppContext'
import { FormatIntPercentage } from '@lib/FormatNumbers'
import { InboundPlan, WaitingReponses } from '@typesTs/amazon/fulfillments/fulfillment'
import { Button, Card, CardBody, Col, Spinner } from 'reactstrap'

type Props = {
  inboundPlan: InboundPlan
  handlePrintShipmentBillOfLading: (shipmentId: string) => void
  watingRepsonse: WaitingReponses
}

const TrackingDetails = ({ inboundPlan, handlePrintShipmentBillOfLading, watingRepsonse }: Props) => {
  const { state }: any = useContext(AppContext)
  const [selectedShipment, setselectedShipment] = useState(Object.values(inboundPlan.confirmedShipments)[0])
  return (
    <>
      {Object.values(inboundPlan.confirmedShipments).length > 0 ? (
        <div className='w-100 px-3'>
          <div className='my-3'>
            <div className='d-flex flex-row flex-wrap justify-content-start align-items-start gap-3'>
              {Object.values(inboundPlan.confirmedShipments).map((shipment, shipmentIndex) => (
                <Card
                  key={shipment.shipmentId}
                  className={'m-0 shadow-sm ' + (selectedShipment.shipmentId === shipment.shipmentId && 'border border-3 border-success')}
                  style={{ width: 'fit-content', maxWidth: '400px', zIndex: Object.values(inboundPlan.confirmedShipments).length - shipmentIndex }}
                  onClick={() => setselectedShipment(shipment)}>
                  <CardBody>
                    <p className='m-0 p-0 fw-bold fs-6'>Shipment #{shipmentIndex + 1}</p>
                    <p className='m-0 fs-7'>
                      <span className='text-primary'>Shipment ID: </span>
                      {shipment.shipment.shipmentConfirmationId}
                    </p>
                    <p className='m-0 fs-7'>
                      <span className='text-primary'>Method: </span>
                      {shipment.shipment.trackingDetails?.ltlTrackingDetail.billOfLadingNumber ? 'Less than and full truckload (LTL/FTL)' : 'Small parcel delivery (SPD)'}
                    </p>
                    {/* <p className='m-0 fs-7'>
                      <span className='text-primary'>Carrier: </span>
                      {''}
                    </p> */}
                  </CardBody>
                </Card>
              ))}
            </div>
            {selectedShipment.shipment.trackingDetails?.spdTrackingDetail?.spdTrackingItems.length > 0 && (
              <div className='my-3 px-2'>
                <Col sm='12' lg='8'>
                  <table className='table table-bordered'>
                    <thead className='table-light'>
                      <tr>
                        <th>Box #</th>
                        <th>FBA Box Label #</th>
                        <th>thacking ID #</th>
                        <th>Status</th>
                        <th>Weight (lb)</th>
                        <th>Dimensions (in)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedShipment.shipment.trackingDetails?.spdTrackingDetail?.spdTrackingItems?.map((tracking, boxIndex) => (
                        <tr key={tracking.boxId}>
                          <td>{boxIndex + 1}</td>
                          <td>{tracking.boxId}</td>
                          <td>{tracking.trackingId}</td>
                          <td className='text-success fw-semibold'>Confirmed</td>
                          <td>
                            {selectedShipment.shipmentBoxes.boxes[boxIndex]?.weight.value
                              ? FormatIntPercentage(state.currentRegion, selectedShipment.shipmentBoxes.boxes[boxIndex]?.weight.value)
                              : 'N/A'}
                          </td>
                          <td>
                            {selectedShipment.shipmentBoxes.boxes[boxIndex]?.dimensions.height
                              ? `${selectedShipment.shipmentBoxes.boxes[boxIndex]?.dimensions.height} x ${selectedShipment.shipmentBoxes.boxes[boxIndex]?.dimensions.width} x ${selectedShipment.shipmentBoxes.boxes[boxIndex]?.dimensions.length}`
                              : 'N/A'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </Col>
              </div>
            )}
            {selectedShipment.shipment.trackingDetails?.ltlTrackingDetail.billOfLadingNumber && (
              <div className='my-3 px-2'>
                <Col sm='12' lg='8'>
                  <p className='fs-5 fw-bold'>Bill of Lading (BOL)</p>
                  <p>
                    Amazon Reference ID: <span className='fw-semibold'>{selectedShipment.shipment.trackingDetails?.ltlTrackingDetail.billOfLadingNumber}</span>
                  </p>
                  <Button disabled={watingRepsonse.printingLabel} color='primary' onClick={() => handlePrintShipmentBillOfLading(selectedShipment.shipment.shipmentConfirmationId)}>
                    {watingRepsonse.printingLabel ? (
                      <span>
                        <Spinner color='light' size={'sm'} className='me-1' /> Downloading BOL...
                      </span>
                    ) : (
                      'Download Bill Of Lading'
                    )}
                  </Button>
                  <p className=' mt-3 fs-7 text-muted'>The BOL will be generated no later than 8 a.m. the morning of pickup.</p>
                </Col>
              </div>
            )}
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

export default TrackingDetails
