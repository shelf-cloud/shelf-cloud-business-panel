import React, { useContext } from 'react'
import { Button, Card, CardBody, CardHeader, Col, Row } from 'reactstrap'
// import Animation from '@components/Common/Animation'
import { OrderRowType, ShipmentOrderItem } from '@typings'
import AppContext from '@context/AppContext'
import TooltipComponent from './constants/Tooltip'
// import dynamic from 'next/dynamic';
// const Animation = dynamic(() => import('@components/Common/Animation'), {
//     ssr: false
// });

type Props = {
  data: OrderRowType
}

const ShipmentType = ({ data }: Props) => {
  const { state, setModalCreateReturnInfo }: any = useContext(AppContext)
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
                  <tbody>
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
                  <tbody>
                    <tr className='border-bottom pb-2'>
                      <td className='text-muted d-flex flex-row justify-content-start align-items-start'>
                        Pick Pack Charge
                        {data.chargesFees && (
                          <>
                            <i className='ri-information-fill ms-1 fs-6 text-muted' id={`tooltip${data.orderId}`}></i>
                            <TooltipComponent
                              target={`tooltip${data.orderId}`}
                              text={`$${data.chargesFees.orderCost?.toFixed(
                                2
                              )} first item + $${data.chargesFees.extraItemOrderCost?.toFixed(2)} addt'l.`}
                            />
                          </>
                        )}
                      </td>
                      <td className='fw-semibold text-end'>$ {data.pickpackCharge?.toFixed(2)}</td>
                    </tr>
                    <tr className='border-bottom pb-2'>
                      <td className='text-muted'>Shipping Charge</td>
                      <td className='fw-semibold text-end'>$ {data.onixShipping?.toFixed(2)}</td>
                    </tr>
                    <tr className='border-bottom pb-2'>
                      <td className='text-muted'>Extra Charge</td>
                      <td className='fw-semibold text-end'>$ {data.extraCharge?.toFixed(2)}</td>
                    </tr>
                    <tr>
                      <td className='fw-bold'>TOTAL</td>
                      <td className='text-primary fw-semibold text-end'>$ {data.totalCharge?.toFixed(2)}</td>
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
                        <td className='w-50 fs-6 fw-semibold'>{product.name || ''}</td>
                        <td className='fs-6 text-muted'>{product.sku}</td>
                        <td className='text-center'>$ {product.unitPrice?.toFixed(2)}</td>
                        <td className='text-center'>{product.quantity}</td>
                      </tr>
                    ))}
                    <tr>
                      <td className='text-start fs-5 fw-bold text-nowrap'>Total QTY</td>
                      <td></td>
                      <td></td>
                      <td className='text-center fs-5 text-primary'>{data.totalItems}</td>
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
            {state.currentRegion == 'us'
              ? data.orderStatus == 'shipped' &&
                data.hasReturn == false &&
                data.shipCountry == 'US' && (
                  <Button
                    color='warning'
                    className='btn-label'
                    onClick={() => setModalCreateReturnInfo(data.businessId, data.id)}>
                    <i className='las la-reply label-icon align-middle fs-3 me-2' />
                    Create Return
                  </Button>
                )
              : data.orderStatus == 'shipped' &&
                data.hasReturn == false &&
                data.shipCountry == 'ES' && (
                  <Button
                    color='warning'
                    className='btn-label'
                    onClick={() => setModalCreateReturnInfo(data.businessId, data.id)}>
                    <i className='las la-reply label-icon align-middle fs-3 me-2' />
                    Create Return
                  </Button>
                )}
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default ShipmentType
