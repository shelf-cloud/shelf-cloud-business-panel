 
import { useContext, useState } from 'react'

import AppContext from '@context/AppContext'
import { FormatIntPercentage } from '@lib/FormatNumbers'
import { InboundPlan, WaitingReponses } from '@typesTs/amazon/fulfillments/fulfillment'
import { Button, Card, CardBody, Col, Spinner } from '@/components/migration-ui'

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
        <div className='w-full px-4'>
          <div className='my-4'>
            <div className='flex flex-row flex-wrap justify-start items-start gap-4'>
              {Object.values(inboundPlan.confirmedShipments).map((shipment, shipmentIndex) => (
                <Card
                  key={shipment.shipmentId}
                  className={'m-0 shadow-[0_0.125rem_0.25rem_rgba(0,0,0,0.075)] ' + (selectedShipment.shipmentId === shipment.shipmentId && 'border border-[3px] border-success')}
                  style={{ width: 'fit-content', maxWidth: '400px', zIndex: Object.values(inboundPlan.confirmedShipments).length - shipmentIndex }}
                  onClick={() => setselectedShipment(shipment)}>
                  <CardBody>
                    <p className='m-0 p-0 font-bold text-[13px]'>Shipment #{shipmentIndex + 1}</p>
                    <p className='m-0 text-[11.2px]'>
                      <span className='text-primary'>Shipment ID: </span>
                      {shipment.shipment.shipmentConfirmationId}
                    </p>
                    <p className='m-0 text-[11.2px]'>
                      <span className='text-primary'>Method: </span>
                      {shipment.shipment.trackingDetails?.ltlTrackingDetail.billOfLadingNumber ? 'Less than and full truckload (LTL/FTL)' : 'Small parcel delivery (SPD)'}
                    </p>
                    {/* <p className='m-0 text-[11.2px]'>
                      <span className='text-primary'>Carrier: </span>
                      {''}
                    </p> */}
                  </CardBody>
                </Card>
              ))}
            </div>
            {selectedShipment.shipment.trackingDetails?.spdTrackingDetail?.spdTrackingItems.length > 0 && (
              <div className='my-4 px-2'>
                <Col sm='12' lg='8'>
                  <div className='overflow-x-auto'>
                    <table className='w-full align-middle mb-0 border border-[color:var(--border)] [&_td]:border-t [&_th]:px-2 [&_th]:py-1 [&_td]:px-2 [&_td]:py-1'>
                      <thead className='bg-[color:var(--vz-light)]'>
                        <tr>
                          <th>Box #</th>
                          <th>FBA Box Label #</th>
                          <th>Tracking ID #</th>
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
                            <td className='text-success font-semibold'>Confirmed</td>
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
                  </div>
                </Col>
              </div>
            )}
            {inboundPlan.shippingMode === 'LTL' && (
              <div className='my-4 px-2'>
                <Col sm='12' lg='8'>
                  <p className='text-[16.25px] font-bold'>Bill of Lading (BOL)</p>
                  <p>
                    Amazon Reference ID: <span className='font-semibold'>{selectedShipment.shipment.trackingDetails?.ltlTrackingDetail.billOfLadingNumber ?? 'Pending'}</span>
                  </p>
                  <Button
                    disabled={watingRepsonse.printingLabel || !selectedShipment.shipment.trackingDetails?.ltlTrackingDetail.billOfLadingNumber}
                    color='primary'
                    onClick={() => handlePrintShipmentBillOfLading(selectedShipment.shipment.shipmentConfirmationId)}>
                    {watingRepsonse.printingLabel ? (
                      <span>
                        <Spinner color='light' size={'sm'} className='me-1' /> Downloading BOL...
                      </span>
                    ) : (
                      'Download Bill Of Lading'
                    )}
                  </Button>
                  <p className=' mt-4 text-[11.2px] text-[var(--bs-secondary-color)]'>The BOL will be generated no later than 8 a.m. the morning of pickup.</p>
                </Col>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className='w-full px-4'>
          <div className='my-4 flex justify-start items-center gap-4'>
            <Spinner color='primary' />
            <p className='m-0 p-0 font-normal text-[16.25px]'>Confirm charges and fees first for Tracking Details be available.</p>
          </div>
        </div>
      )}
    </>
  )
}

export default TrackingDetails
