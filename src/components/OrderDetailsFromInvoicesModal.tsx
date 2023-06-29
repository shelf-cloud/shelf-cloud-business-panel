/* eslint-disable react-hooks/exhaustive-deps */
// ALTER TABLE `dbpruebas` ADD `activeState` BOOLEAN NOT NULL DEFAULT TRUE AFTER `image`;
import React, { useState, useEffect, useContext } from 'react'
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Col,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Row,
  Spinner,
} from 'reactstrap'
import AppContext from '@context/AppContext'
import axios from 'axios'
import { ShipmentOrderItem } from '@typings'
import { FormatCurrency, FormatIntNumber } from '@lib/FormatNumbers'

type Props = {}

function OrderDetailsFromInvoicesModal({}: Props) {
  const { state, setShowOrderDetailsOfInvoiceModal }: any = useContext(AppContext)
  const [data, setOrderInfo] = useState({}) as any
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (state.orderNumberfromInvoices) {
      const bringOrderDetails = async () => {
        const response: any = await axios(
          `/api/getShipmentOrder?region=${state.currentRegion}&businessId=${state.user.businessId}&orderId=${state.orderNumberfromInvoices}`
        )
        await setOrderInfo(response.data)
        setLoading(false)
      }
      bringOrderDetails()
    }
    return () => {
      setLoading(true)
    }
  }, [state.currentRegion, state.user.businessId, state.orderNumberfromInvoices])

  return (
    <Modal
      size='xl'
      id='OrderDetailsFromInvoicesModal'
      isOpen={state.showOrderDetailsOfInvoiceModal}
      toggle={() => {
        setShowOrderDetailsOfInvoiceModal(!state.showOrderDetailsOfInvoiceModal, null)
      }}>
      <ModalHeader
        toggle={() => {
          setShowOrderDetailsOfInvoiceModal(!state.showOrderDetailsOfInvoiceModal, null)
        }}>
        <h3 className='modal-title' id='myModalLabel'>
          {`Order Details: ${data.orderNumber ? data.orderNumber : ''}`}
        </h3>
      </ModalHeader>
      <ModalBody>
        {!loading ? (
          data.orderType == 'Wholesale' ? (
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
                              <td className='text-muted text-nowrap'># Of Pallets:</td>
                              <td className='fw-semibold w-100'>{data.numberPallets}</td>
                            </tr>
                            <tr>
                              <td className='text-muted text-nowrap'># Of Boxes:</td>
                              <td className='fw-semibold w-100'>{data.numberBoxes}</td>
                            </tr>
                            {data.isThird && (
                              <tr>
                                <td className='text-muted text-nowrap'>Third Party Shipping Info:</td>
                                <td className='fw-semibold w-100'>{data.thirdInfo}</td>
                              </tr>
                            )}
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
                              <td className='text-muted'>Pick Pack Charge</td>
                              <td className='fw-semibold text-end'>{FormatCurrency(state.currentRegion, data.pickpackCharge)}</td>
                            </tr>
                            <tr className='border-bottom pb-2'>
                              <td className='text-muted'>Shipping Charge</td>
                              <td className='fw-semibold text-end'>{FormatCurrency(state.currentRegion, data.onixShipping)}</td>
                            </tr>
                            <tr className='border-bottom pb-2'>
                              <td className='text-muted'>Labeling</td>
                              <td className='fw-semibold text-end'>{FormatCurrency(state.currentRegion, data.labeling)}</td>
                            </tr>
                            <tr className='border-bottom pb-2'>
                              <td className='text-muted'>Man Hour</td>
                              <td className='fw-semibold text-end'>{FormatCurrency(state.currentRegion, data.manHour)}</td>
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
                                Qty
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {data.orderItems.map((product: ShipmentOrderItem, key: any) => (
                              <tr key={key} className='border-bottom py-2'>
                                <td className='w-75 fs-6 fw-semibold'>{product.name || ''}</td>
                                <td className='fs-6 text-muted'>{product.sku}</td>
                                <td className='text-center'>{product.quantity}</td>
                              </tr>
                            ))}
                            <tr>
                              <td className='text-start fs-5 fw-bold text-nowrap'>Total QTY</td>
                              <td></td>
                              <td className='text-center fw-bold fs-5 text-primary'>{data.totalItems}</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </CardBody>
                  </Card>
                </Col>
              </Row>
            </div>
          ) : data.orderType == 'Shipment' ? (
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
                                {data.shipStreet}, {data.shipCity}, {data.shipState}, {data.shipZipcode},{' '}
                                {data.shipCountry}
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
                              <td className='text-muted'>Pick Pack Charge</td>
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
                            {data.orderItems?.map((product: ShipmentOrderItem, key: any) => (
                              <tr key={key} className='border-bottom py-2'>
                                <td className='w-50 fs-6 fw-semibold'>{product.name || ''}</td>
                                <td className='fs-6 text-muted'>{product.sku}</td>
                                <td className='text-center'>{FormatCurrency(state.currentRegion, product.unitPrice)}</td>
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
            </div>
          ) : data.orderType == 'Receiving' ? (
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
                  <Col xl={12}>
                    <Card>
                      <CardHeader className='py-3'>
                        <h5 className='fw-semibold m-0'>Charge Details</h5>
                      </CardHeader>
                      <CardBody>
                        <table className='table table-sm table-borderless table-nowrap mb-0'>
                          <tbody>
                            <tr className='border-bottom pb-2'>
                              <td className='text-muted'>Service</td>
                              <td className='fw-semibold text-end'>{FormatCurrency(state.currentRegion, data.receivingService)}</td>
                            </tr>
                            <tr className='border-bottom pb-2'>
                              <td className='text-muted'>Pallets</td>
                              <td className='fw-semibold text-end'>{FormatCurrency(state.currentRegion, data.receivingPallets)}</td>
                            </tr>
                            <tr className='border-bottom pb-2'>
                              <td className='text-muted'>Wrap Service</td>
                              <td className='fw-semibold text-end'>{FormatCurrency(state.currentRegion, data.receivingWrapService)}</td>
                            </tr>
                            <tr className='border-bottom pb-2'>
                              <td className='text-muted'>Man Hour</td>
                              <td className='fw-semibold text-end'>{FormatCurrency(state.currentRegion, data.manHour)}</td>
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
                                Qty
                              </th>
                              <th className='text-center' scope='col'>
                                Qty Received
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {data.orderItems?.map((product: ShipmentOrderItem, key: any) => (
                              <tr key={key} className='border-bottom py-2'>
                                <td className='w-50 fs-6 fw-semibold'>{product.name || ''}</td>
                                <td className='fs-6 text-muted'>{product.sku}</td>
                                <td className='text-center'>{FormatIntNumber.format(Number(product.quantity))}</td>
                                <td className='text-center'>{FormatIntNumber.format(Number(product.qtyReceived))}</td>
                              </tr>
                            ))}
                            <tr>
                              <td className='text-start fs-5 fw-bold text-nowrap'>Total QTY</td>
                              <td></td>
                              <td className='text-center fw-semibold fs-5 text-primary'>
                                {FormatIntNumber.format(Number(data.totalItems))}
                              </td>
                              <td className='text-center fw-semibold fs-5 text-primary'>
                                {FormatIntNumber.format(Number(data.totalReceivedItems))}
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </CardBody>
                  </Card>
                </Col>
              </Row>
            </div>
          ) : (
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
                                {data.shipStreet}, {data.shipCity}, {data.shipState}, {data.shipZipcode},{' '}
                                {data.shipCountry}
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
                              <td className='text-muted'>Pick Pack Charge</td>
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
                            {data.orderItems?.map((product: ShipmentOrderItem, key: any) => (
                              <tr key={key} className='border-bottom py-2'>
                                <td className='w-50 fs-6 fw-semibold'>{product.name || ''}</td>
                                <td className='fs-6 text-muted'>{product.sku}</td>
                                <td className='text-center'>{FormatCurrency(state.currentRegion, product.unitPrice)}</td>
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
            </div>
          )
        ) : (
          <Spinner />
        )}
      </ModalBody>
      <ModalFooter>
        <div className='d-flex justify-content-end align-items-center'>
          <Button
            color='secondary'
            onClick={() => {
              setShowOrderDetailsOfInvoiceModal(!state.showOrderDetailsOfInvoiceModal, null)
            }}>
            Close
          </Button>
        </div>
      </ModalFooter>
    </Modal>
  )
}

export default OrderDetailsFromInvoicesModal
