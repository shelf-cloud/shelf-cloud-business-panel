import React, { useContext, useState } from 'react'
import { Button, Card, CardBody, CardHeader, Col, Row } from 'reactstrap'
// import Animation from '@components/Common/Animation'
import { KitChildren, OrderRowType, ShipmentOrderItem } from '@typings'
import AppContext from '@context/AppContext'
import TooltipComponent from './constants/Tooltip'
import { FormatCurrency } from '@lib/FormatNumbers'
import CancelManualOrderConfirmationModal from './modals/orders/shipments/CancelManualOrderConfirmationModal'
import { CleanSpecialCharacters } from '@lib/SkuFormatting'
// import dynamic from 'next/dynamic';
// const Animation = dynamic(() => import('@components/Common/Animation'), {
//     ssr: false
// });

type Props = {
  data: OrderRowType
  apiMutateLink?: string
}

const ShipmentType = ({ data, apiMutateLink }: Props) => {
  const { state, setModalCreateReturnInfo }: any = useContext(AppContext)
  const [showDeleteModal, setshowDeleteModal] = useState({
    show: false,
    orderId: 0,
    orderNumber: '',
    goFlowOrderId: 0,
  })
  const OrderId = CleanSpecialCharacters(data.orderId)
  return (
    <div style={{ backgroundColor: '#F0F4F7', padding: '10px' }}>
      <Row>
        <Col xl={4}>
          <Col xl={12}>
            <Card>
              <CardHeader className='py-3'>
                <h5 className='fw-semibold m-0'>Shipping</h5>
              </CardHeader>
              <CardBody>
                <table className='table table-sm table-borderless'>
                  <tbody className='fs-7'>
                    <tr>
                      <td className='text-muted text-nowrap'>Service Requested:</td>
                      <td className='fw-semibold w-100'>{data.carrierService}</td>
                    </tr>
                    <tr>
                      <td className='text-muted text-nowrap'>Service Used:</td>
                      <td className='fw-semibold w-100'>{data.carrierType}</td>
                    </tr>
                    <tr>
                      <td className='text-muted text-nowrap'>Customer Name:</td>
                      <td className='fw-semibold w-100'>{data.shipName}</td>
                    </tr>
                    <tr>
                      <td className='text-muted text-nowrap'>Address:</td>
                      <td className='fw-semibold w-100'>
                        {data.shipStreet}, {data.shipCity}, {data.shipState}, {data.shipZipcode}, {data.shipCountry}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </CardBody>
            </Card>
          </Col>
          <Col xl={12}>
            <Card>
              <CardHeader className='py-3'>
                <h5 className='fw-semibold m-0'>Charge Details</h5>
              </CardHeader>
              <CardBody>
                <table className='table table-sm table-borderless table-nowrap mb-0'>
                  <tbody className='fs-7'>
                    <tr className='border-bottom pb-2'>
                      <td className='text-muted d-flex flex-row justify-content-start align-items-start'>
                        Pick Pack Charge
                        {data.chargesFees && (
                          <>
                            <i className='ri-information-fill ms-1 fs-6 text-muted' id={`tooltip${OrderId}`}></i>
                            <TooltipComponent
                              target={`tooltip${OrderId}`}
                              text={`${FormatCurrency(state.currentRegion, data.chargesFees.orderCost!)} first item + ${FormatCurrency(
                                state.currentRegion,
                                data.chargesFees.extraItemOrderCost!
                              )} addt'l.`}
                            />
                          </>
                        )}
                      </td>
                      <td className='fw-semibold text-end'>{FormatCurrency(state.currentRegion, data.pickpackCharge)}</td>
                    </tr>
                    <tr className='border-bottom pb-2'>
                      <td className='text-muted'>Shipping Charge</td>
                      <td className='fw-semibold text-end'>{FormatCurrency(state.currentRegion, data.onixShipping)}</td>
                    </tr>
                    <tr className='border-bottom pb-2'>
                      <td className='text-muted'>Extra Charge</td>
                      <td className='fw-semibold text-end'>{FormatCurrency(state.currentRegion, data.extraCharge)}</td>
                    </tr>
                    <tr>
                      <td className='fw-bold'>TOTAL</td>
                      <td className='text-primary fw-semibold text-end'>{FormatCurrency(state.currentRegion, data.totalCharge)}</td>
                    </tr>
                  </tbody>
                </table>
              </CardBody>
            </Card>
          </Col>
          {data.extraComment != '' && (
            <Col xl={12}>
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
        <Col xl={8}>
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
                      <th scope='col'>Sku</th>
                      <th className='text-center' scope='col'>
                        Unit Price
                      </th>
                      <th className='text-center' scope='col'>
                        Qty
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.orderItems.map((product: ShipmentOrderItem, key) => (
                      <tr key={key} className='border-bottom py-2'>
                        <td className='w-50 fs-7 fw-semibold'>
                          {product.title || product.name}
                          {product.isKit === true &&
                            product.children.length > 0 &&
                            product.children.map((child: KitChildren) => (
                              <p className='m-0 p-0 fs-7 text-muted fw-light' key={child.orderChildrenId}>
                                {`- ${child.title === undefined ? child.name : child.title} Qty: ${child.quantity}`}
                              </p>
                            ))}
                        </td>
                        <td className='fs-7 text-muted'>{product.sku}</td>
                        <td className='text-center'>{FormatCurrency(state.currentRegion, product.unitPrice ?? 0)}</td>
                        <td className='text-center'>{product.quantity}</td>
                      </tr>
                    ))}
                    <tr>
                      <td></td>
                      <td></td>
                      <td className='text-end fw-bold text-nowrap'>Total QTY</td>
                      <td className='text-center text-primary'>{data.totalItems}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardBody>
          </Card>
        </Col>
      </Row>
      <Row>
        <Col xl={12} className='d-flex justify-content-end align-items-end'>
          <Card className='m-0'>
            {data.carrierService.toLowerCase() !== 'ltl' && state.currentRegion == 'us'
              ? data.orderStatus == 'shipped' &&
                data.hasReturn == false &&
                data.shipCountry == 'US' && (
                  <Button color='warning' className='btn-label' onClick={() => setModalCreateReturnInfo(data.businessId, data.id)}>
                    <i className='las la-reply label-icon align-middle fs-3 me-2' />
                    Create Return
                  </Button>
                )
              : data.orderStatus == 'shipped' &&
                data.hasReturn == false &&
                data.shipCountry == 'ES' && (
                  <Button color='warning' className='btn-label' onClick={() => setModalCreateReturnInfo(data.businessId, data.id)}>
                    <i className='las la-reply label-icon align-middle fs-3 me-2' />
                    Create Return
                  </Button>
                )}
            {state.currentRegion == 'us' && data.orderStatus == 'awating' && data.goFlowOrderId != 0 && data.trackingNumber == '' && (
              <Button
                color='danger'
                className='btn-label'
                onClick={() =>
                  setshowDeleteModal({
                    show: true,
                    orderId: data.id,
                    orderNumber: data.orderNumber,
                    goFlowOrderId: data.goFlowOrderId,
                  })
                }>
                <i className='las la-trash-alt label-icon align-middle fs-3 me-2' />
                Cancel Order
              </Button>
            )}
          </Card>
        </Col>
      </Row>
      {showDeleteModal.show && <CancelManualOrderConfirmationModal showDeleteModal={showDeleteModal} setshowDeleteModal={setshowDeleteModal} apiMutateLink={apiMutateLink} />}
    </div>
  )
}

export default ShipmentType
