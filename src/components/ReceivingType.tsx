import React, { useContext, useEffect, useState } from 'react'
import { Button, Card, CardBody, CardHeader, Col, Row } from 'reactstrap'
// import Animation from '@components/Common/Animation'
import { OrderRowType, ShipmentOrderItem } from '@typings'
import { FormatCurrency, FormatIntNumber } from '@lib/FormatNumbers'
import TooltipComponent from './constants/Tooltip'
import AppContext from '@context/AppContext'
import Confirm_Delete_Item_From_Receiving from './modals/receivings/Confirm_Delete_Item_From_Receiving'

// import dynamic from 'next/dynamic';
// const Animation = dynamic(() => import('@components/Common/Animation'), {
//     ssr: false
// });

type Props = {
  data: OrderRowType
  apiMutateLink?: string
}

const ReceivingType = ({ data, apiMutateLink }: Props) => {
  const { state }: any = useContext(AppContext)
  const [serviceFee, setServiceFee] = useState('')
  const [loading, setLoading] = useState(false)
  const [showDeleteModal, setshowDeleteModal] = useState({
    show: false,
    orderId: 0,
    orderNumber: '',
    sku: '',
    title: '',
    quantity: 0,
  })

  useEffect(() => {
    if (data.chargesFees) {
      switch (data.carrierService) {
        case '20HQ-P':
          setServiceFee(`${data.carrierService} - ${FormatCurrency(state.currentRegion, data.chargesFees['20HQ-P']!)}`)
          break
        case '40HQ-P':
          setServiceFee(`${data.carrierService} - ${FormatCurrency(state.currentRegion, data.chargesFees['40HQ-P']!)}`)
          break
        case '20HQ-FL':
          setServiceFee(`${data.carrierService} - ${FormatCurrency(state.currentRegion, data.chargesFees['20HQ-FL']!)}`)
          break
        case '40HQ-FL':
          setServiceFee(`${data.carrierService} - ${FormatCurrency(state.currentRegion, data.chargesFees['40HQ-FL']!)}`)
          break
        case 'Pallets':
          setServiceFee(`${data.carrierService} - ${FormatCurrency(state.currentRegion, data.chargesFees.receivingPallets!)} per pallet`)
          break
        case 'Parcel':
          setServiceFee(`${data.carrierService} - ${FormatCurrency(state.currentRegion, data.chargesFees.parcelBoxCost!)} per box`)
          break
        default:
          setServiceFee(`Type of service...`)
      }
    }

    return () => {
      setServiceFee('')
    }
  }, [data, state.currentRegion])

  const OrderId = data.orderId?.replace(/[\-\,\(\)\/\s\.\:\;]/g, '')
  return (
    <div style={{ backgroundColor: '#F0F4F7', padding: '10px' }}>
      <Row>
        <Col md={4}>
          <Col md={12}>
            <Card>
              <CardHeader className='py-3'>
                <h5 className='fw-semibold m-0'>Receiving Details</h5>
              </CardHeader>
              <CardBody>
                <table className='table table-sm table-borderless'>
                  <tbody>
                    <tr>
                      <td className='text-muted text-nowrap'>Type of Service:</td>
                      <td className='fw-semibold w-100'>{data.carrierService}</td>
                    </tr>
                    <tr>
                      <td className='text-muted text-nowrap'># Of Pallets:</td>
                      <td className='fw-semibold w-100'>{data.numberPallets}</td>
                    </tr>
                    <tr>
                      <td className='text-muted text-nowrap'># Of Boxes:</td>
                      <td className='fw-semibold w-100'>{data.numberBoxes}</td>
                    </tr>
                    <tr>
                      <td className='text-muted text-nowrap'>Shrink Wrap:</td>
                      <td className='fw-semibold w-100'>{data.shrinkWrap}</td>
                    </tr>
                    <tr>
                      <td className='text-muted text-nowrap'>Man Hours:</td>
                      <td className='fw-semibold w-100'>{data.manHours}</td>
                    </tr>
                  </tbody>
                </table>
              </CardBody>
            </Card>
          </Col>
          <Col md={12}>
            <Card>
              <CardHeader className='py-3'>
                <h5 className='fw-semibold m-0'>Charge Details</h5>
              </CardHeader>
              <CardBody>
                <table className='table table-sm table-borderless table-nowrap mb-0'>
                  <tbody>
                    <tr className='border-bottom pb-2'>
                      <td className='text-muted d-flex flex-row justify-content-start align-items-start'>
                        Service
                        {data.chargesFees && (
                          <>
                            <i className='ri-information-fill ms-1 fs-6 text-muted' id={`tooltipService${OrderId}`}></i>
                            <TooltipComponent target={`tooltipService${OrderId}`} text={serviceFee} />
                          </>
                        )}
                      </td>
                      <td className='fw-semibold text-end'>{FormatCurrency(state.currentRegion, data.receivingService!)}</td>
                    </tr>
                    <tr className='border-bottom pb-2'>
                      <td className='text-muted'>
                        Pallets
                        {data.chargesFees && (
                          <>
                            <i className='ri-information-fill ms-1 fs-6 text-muted' id={`tooltipPallet${OrderId}`}></i>
                            <TooltipComponent
                              target={`tooltipPallet${OrderId}`}
                              text={`${FormatCurrency(state.currentRegion, data.chargesFees.receivingPalletCost!)} per pallet`}
                            />
                          </>
                        )}
                      </td>
                      <td className='fw-semibold text-end'>{FormatCurrency(state.currentRegion, data.receivingPallets!)}</td>
                    </tr>
                    <tr className='border-bottom pb-2'>
                      <td className='text-muted d-flex flex-row justify-content-start align-items-start'>
                        Wrap Service
                        {data.chargesFees && (
                          <>
                            <i className='ri-information-fill ms-1 fs-6 text-muted' id={`tooltipWrap${OrderId}`}></i>
                            <TooltipComponent target={`tooltipWrap${OrderId}`} text={`${FormatCurrency(state.currentRegion, data.chargesFees.receivingWrapService!)} per wrap`} />
                          </>
                        )}
                      </td>
                      <td className='fw-semibold text-end'>{FormatCurrency(state.currentRegion, data.receivingWrapService!)}</td>
                    </tr>
                    <tr className='border-bottom pb-2'>
                      <td className='text-muted d-flex flex-row justify-content-start align-items-start'>
                        Man Hour
                        {data.chargesFees && (
                          <>
                            <i className='ri-information-fill ms-1 fs-6 text-muted' id={`tooltipHour${OrderId}`}></i>
                            <TooltipComponent target={`tooltipHour${OrderId}`} text={`${FormatCurrency(state.currentRegion, data.chargesFees.receivingManHour!)} per hour`} />
                          </>
                        )}
                      </td>
                      <td className='fw-semibold text-end'>{FormatCurrency(state.currentRegion, data.manHour!)}</td>
                    </tr>
                    <tr className='border-bottom pb-2'>
                      <td className='text-muted'>Extra Charge</td>
                      <td className='fw-semibold text-end'>{FormatCurrency(state.currentRegion, data.extraCharge!)}</td>
                    </tr>
                    <tr>
                      <td className='fw-bold'>TOTAL</td>
                      <td className='text-primary fw-semibold text-end'>{FormatCurrency(state.currentRegion, data.totalCharge!)}</td>
                    </tr>
                  </tbody>
                </table>
              </CardBody>
            </Card>
          </Col>
          {data.extraComment != '' && (
            <Col md={12}>
              <Card>
                <CardHeader className='py-3'>
                  <h5 className='fw-semibold m-0'>Order Comment</h5>
                </CardHeader>
                <CardBody>
                  <p>{data.extraComment}</p>
                </CardBody>
              </Card>
            </Col>
          )}
        </Col>
        <Col md={8}>
          <Card>
            <CardHeader className='py-3'>
              <h5 className='fw-semibold m-0'>Products</h5>
            </CardHeader>
            <CardBody>
              <div className='table-responsive'>
                <table className='table table-sm align-middle table-borderless mb-0'>
                  <thead className='table-light'>
                    <tr>
                      <th scope='col'>Title</th>
                      {data.orderItems.some((product: ShipmentOrderItem) => (product.poNumber ? true : false)) && <th scope='col'>PO</th>}
                      <th scope='col'>Sku</th>
                      <th className='text-center' scope='col'>
                        Qty
                      </th>
                      <th className='text-center' scope='col'>
                        Qty Received
                      </th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.orderItems.map((product: ShipmentOrderItem, key) => (
                      <tr key={key} className='border-bottom py-2 w-100 fs-6'>
                        <td className='fw-semibold'>{product.name || ''}</td>
                        {product.poNumber && <td className='fw-normal text-nowrap'>{product.poNumber}</td>}
                        <td className='text-muted'>{product.sku}</td>
                        <td className='text-center'>{FormatIntNumber(state.currentRegion, Number(product.quantity))}</td>
                        <td className='text-center'>{FormatIntNumber(state.currentRegion, Number(product.qtyReceived))}</td>
                        <td>
                          {(data.orderStatus == 'awating' || data.orderStatus == 'awaiting_shipment') && product.qtyReceived! <= 0 && (
                            <i
                              className='fs-4 text-danger las la-trash-alt'
                              style={{ cursor: 'pointer' }}
                              onClick={() =>
                                setshowDeleteModal((prev) => {
                                  return {
                                    ...prev,
                                    show: true,
                                    orderId: data.id,
                                    orderNumber: data.orderNumber,
                                    sku: product.sku,
                                    title: product.name,
                                    quantity: product.quantity,
                                  }
                                })
                              }
                            />
                          )}
                        </td>
                      </tr>
                    ))}
                    <tr>
                      <td className='text-start fs-5 fw-bold text-nowrap'>Total QTY</td>
                      {data.orderItems.some((product: ShipmentOrderItem) => (product.poNumber ? true : false)) && <td></td>}
                      <td></td>
                      <td className='text-center fw-semibold fs-5 text-primary'>{FormatIntNumber(state.currentRegion, Number(data.totalItems))}</td>
                      <td className='text-center fw-semibold fs-5 text-primary'>{FormatIntNumber(state.currentRegion, Number(data.totalReceivedItems))}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardBody>
          </Card>
        </Col>
      </Row>
      <Row>
        <Col md={12} className='d-flex justify-content-end align-items-end'>
          <Card className='m-0'>
            {data.proofOfShipped != '' && data.proofOfShipped != null && (
              <a href={data.proofOfShipped} target='blank'>
                <Button color='info' className='btn-label'>
                  <i className='las la-truck label-icon align-middle fs-16 me-2' />
                  Proof Of Received
                </Button>
              </a>
            )}
          </Card>
        </Col>
      </Row>
      {showDeleteModal.show && (
        <Confirm_Delete_Item_From_Receiving
          showDeleteModal={showDeleteModal}
          setshowDeleteModal={setshowDeleteModal}
          loading={loading}
          setLoading={setLoading}
          apiMutateLink={apiMutateLink}
        />
      )}
    </div>
  )
}

export default ReceivingType
