/* eslint-disable @next/next/no-img-element */
import React, { useContext, useState } from 'react'
import { Card, CardBody, CardHeader, Col, Input, Row, UncontrolledTooltip } from 'reactstrap'
import { ExpanderComponentProps } from 'react-data-table-component'
import { PoItemArrivalHistory, PoPaymentHistory, PurchaseOrder, PurchaseOrderItem } from '@typesTs/purchaseOrders'
import { FormatCurrency, FormatIntNumber } from '@lib/FormatNumbers'
import AppContext from '@context/AppContext'
import Confirm_Delete_Item_From_PO from '@components/modals/purchaseOrders/Confirm_Delete_Item_From_PO'

type Props = {
  data: PurchaseOrder
}

const Expanded_By_Orders: React.FC<ExpanderComponentProps<PurchaseOrder>> = ({ data }: Props) => {
  const { state, setReceivingFromPo, setModalAddPaymentToPoDetails, setModalAddSkuToPurchaseOrder }: any = useContext(AppContext)
  const [loading, setLoading] = useState(false)
  const [showDeleteModal, setshowDeleteModal] = useState({
    show: false,
    poId: 0,
    orderNumber: '',
    inventoryId: 0,
    sku: '',
    title: '',
    image: '',
  })

  const handlereceivingOrderFromPo = (
    poId: number,
    orderNumber: string,
    inventoryId: number,
    sku: string,
    title: string,
    image: string,
    businessId: number,
    suppliersName: string,
    receivingQty: number
  ) => {
    let newReceivingOrderFromPo = state.receivingFromPo
    if (newReceivingOrderFromPo?.[poId]?.[inventoryId]) {
      if (receivingQty === 0 || String(receivingQty) === '') {
        delete newReceivingOrderFromPo[poId][inventoryId]
        Object.keys(newReceivingOrderFromPo[poId]).length <= 0 && delete newReceivingOrderFromPo[poId]
      } else {
        newReceivingOrderFromPo[poId][inventoryId].receivingQty = receivingQty
      }
    } else {
      if (!newReceivingOrderFromPo[poId]) {
        newReceivingOrderFromPo[poId] = {}
      }
      newReceivingOrderFromPo[poId][inventoryId] = {
        poId,
        orderNumber,
        inventoryId,
        sku,
        title,
        image,
        businessId,
        suppliersName,
        receivingQty,
      }
    }

    setReceivingFromPo(newReceivingOrderFromPo)
  }

  return (
    <div style={{ backgroundColor: '#F0F4F7', padding: '10px' }}>
      <Row>
        <Col xl={3}>
          <Col xl={12}>
            <Card>
              <CardHeader className='py-3'>
                <h5 className='fw-semibold m-0'>Details</h5>
              </CardHeader>
              <CardBody>
                <table className='table table-sm table-borderless'>
                  <tbody>
                    <tr>
                      <td className='text-muted text-nowrap'>Order Number:</td>
                      <td className='fw-semibold w-100'>{data.orderNumber}</td>
                    </tr>
                    <tr>
                      <td className='text-muted text-nowrap'>Supplier:</td>
                      <td className='fw-semibold w-100'>{data.suppliersName}</td>
                    </tr>
                    <tr>
                      <td className='text-muted text-nowrap'>Created:</td>
                      <td className='fw-semibold w-100'>{data.date}</td>
                    </tr>
                    <tr>
                      <td className='text-muted text-nowrap'>Note:</td>
                      <td className='fw-semibold w-100'>{data.note}</td>
                    </tr>
                  </tbody>
                </table>
              </CardBody>
            </Card>
          </Col>
          <Col xl={12}>
            <Card>
              <CardHeader className='py-3 d-flex flex-row justify-content-between'>
                <h5 className='fw-semibold m-0'>Payment History</h5>{' '}
                <i className='fs-3 text-success las la-plus-circle' style={{ cursor: 'pointer' }} onClick={() => setModalAddPaymentToPoDetails(data.poId, data.orderNumber)} />
              </CardHeader>
              <CardBody>
                <table className='table table-sm table-borderless table-nowrap mb-0'>
                  <thead className='table-light'>
                    <tr>
                      <th scope='col' className='text-center'>
                        Date
                      </th>
                      <th scope='col' className='text-center'>
                        Amount
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.poPayments.map((payment: PoPaymentHistory, key) => (
                      <tr key={`${key}-${payment.date}`}>
                        <td className='text-center'>{payment.date}</td>
                        <td className='text-center'>{FormatCurrency(state.currentRegion, payment.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardBody>
            </Card>
          </Col>
        </Col>
        <Col xl={9}>
          <Card>
            <CardHeader className='py-3 d-flex flex-row justify-content-between'>
              <h5 className='fw-semibold m-0'>Products</h5>
              <i
                className='fs-3 text-success las la-plus-circle'
                style={{ cursor: 'pointer' }}
                onClick={() => setModalAddSkuToPurchaseOrder(data.poId, data.orderNumber, data.suppliersName)}
              />
            </CardHeader>
            <CardBody>
              <div className='table-responsive'>
                <table className='table table-sm align-middle table-borderless mb-0'>
                  <thead className='table-light'>
                    <tr>
                      <th scope='col' className='text-center'>
                        Image
                      </th>
                      <th scope='col'>Title</th>
                      <th className='text-center' scope='col'>
                        SKU
                      </th>
                      {/* <th className='text-center' scope='col'>
                        Unit Cost
                      </th> */}
                      <th className='text-center' scope='col'>
                        Cost
                      </th>
                      <th className='text-center' scope='col'>
                        Ordered
                      </th>
                      <th className='text-center' scope='col'>
                        Inbound
                      </th>
                      <th className='text-center' scope='col'>
                        Arrived
                      </th>
                      <th className='text-center' scope='col'>
                        Pending
                      </th>
                      <th className='text-center' scope='col'>
                        Receiving
                      </th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {data?.poItems?.map((product: PurchaseOrderItem, key) => (
                      <tr key={`${key}-${product.sku}`} className='border-bottom py-2'>
                        <td className='text-center'>
                          <div
                            style={{
                              width: '100%',
                              maxWidth: '80px',
                              height: '50px',
                              margin: '2px 0px',
                              position: 'relative',
                            }}>
                            <img
                              loading='lazy'
                              src={
                                product.image
                                  ? product.image
                                  : 'https://firebasestorage.googleapis.com/v0/b/etiquetas-fba.appspot.com/o/image%2Fno-image.png?alt=media&token=c2232af5-43f6-4739-84eb-1d4803c44770'
                              }
                              onError={(e) =>
                                (e.currentTarget.src =
                                  'https://firebasestorage.googleapis.com/v0/b/etiquetas-fba.appspot.com/o/image%2Fno-image.png?alt=media&token=c2232af5-43f6-4739-84eb-1d4803c44770')
                              }
                              alt='product Image'
                              style={{ objectFit: 'contain', objectPosition: 'center', width: '100%', height: '100%' }}
                            />
                          </div>
                        </td>
                        <td className='fs-6 fw-semibold'>
                          {product.title}
                          {product.arrivalHistory.length > 0 && (
                            <>
                              <i className='ri-information-fill ms-2 fs-5 text-warning' id={`tooltipHistory${product.inventoryId}`}></i>
                              <UncontrolledTooltip
                                placement='right'
                                target={`tooltipHistory${product.inventoryId}`}
                                popperClassName='bg-white shadow px-3 pt-3 rounded-2'
                                innerClassName='text-black bg-white p-0'>
                                <p className='fs-5 text-primary m-0 p-0 fw-bold mb-2'>Arrival History</p>
                                <table className='table table-striped table-bordered table-sm table-responsive text-nowrap'>
                                  <thead>
                                    <tr>
                                      <th>Date</th>
                                      <th>Order</th>
                                      <th>Qty</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {product.arrivalHistory.map((received: PoItemArrivalHistory, index: number) => (
                                      <tr key={index}>
                                        <td>{received.date}</td>
                                        <td>{received.receivingOrder}</td>
                                        <td>{FormatIntNumber(state.currentRegion, received.quantity)}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </UncontrolledTooltip>
                            </>
                          )}
                          {product.asin && (
                            <>
                              <br />
                              <span className='text-muted fs-6 fw-normal'>{product.asin}</span>
                            </>
                          )}
                          {product.barcode && (
                            <>
                              <br />
                              <span className='text-muted fs-6 fw-normal'>{product.barcode}</span>
                            </>
                          )}
                        </td>
                        <td className='fs-6 text-center text-nowrap'>{product.sku}</td>
                        {/* <td className='fs-6 text-center text-nowrap'>{FormatCurrency(state.currentRegion, product.sellerCost)}</td> */}
                        <td className='fs-6 text-center text-nowrap'>{FormatCurrency(state.currentRegion, product.orderQty * product.sellerCost)}</td>
                        <td className='fs-6 text-center text-nowrap'>{FormatIntNumber(state.currentRegion, product.orderQty)}</td>
                        <td className='fs-6 text-center text-nowrap'>{FormatIntNumber(state.currentRegion, product.inboundQty)}</td>
                        <td className='fs-6 text-center text-nowrap'>{FormatIntNumber(state.currentRegion, product.receivedQty)}</td>
                        <td className='fs-6 text-center text-nowrap'>{FormatIntNumber(state.currentRegion, product.orderQty - product.receivedQty - product.inboundQty)}</td>
                        <td className='fs-6 text-center text-nowrap'>
                          <Input
                            disabled={product.orderQty - product.receivedQty - product.inboundQty <= 0 || !data.isOpen}
                            type='number'
                            className='form-control fs-6 m-0'
                            style={{ maxWidth: '80px' }}
                            placeholder='--'
                            bsSize='sm'
                            value={state.receivingFromPo?.[data.poId]?.[product.inventoryId]?.receivingQty || ''}
                            onChange={(e) => {
                              if (Number(e.target.value) <= product.orderQty - product.receivedQty - product.inboundQty && Number(e.target.value) >= 0) {
                                handlereceivingOrderFromPo(
                                  data.poId,
                                  data.orderNumber,
                                  product.inventoryId,
                                  product.sku,
                                  product.title,
                                  product.image,
                                  data.businessId,
                                  data.suppliersName,
                                  Number(e.target.value)
                                )
                              }
                            }}
                            // onBlur={validation.handleBlur}
                            invalid={
                              Number(state.receivingFromPo?.[data.poId]?.[product.inventoryId]?.receivingQty) > product.orderQty - product.receivedQty - product.inboundQty
                                ? true
                                : false
                            }
                          />
                        </td>
                        <td>
                          {data.isOpen &&
                            (loading ? (
                              <i className='fs-4 text-muted las la-trash-alt ps-3' />
                            ) : (
                              <i
                                className='fs-4 text-danger las la-trash-alt ps-3'
                                style={{ cursor: 'pointer' }}
                                // onClick={() => handleDeleteFromSkuList(data.poId, data.orderNumber, product.inventoryId, product.sku)}
                                onClick={() =>
                                  setshowDeleteModal((prev) => {
                                    return {
                                      ...prev,
                                      show: true,
                                      poId: data.poId,
                                      orderNumber: data.orderNumber,
                                      inventoryId: product.inventoryId,
                                      sku: product.sku,
                                      title: product.title,
                                      image: product.image,
                                    }
                                  })
                                }
                              />
                            ))}
                        </td>
                      </tr>
                    ))}
                    <tr>
                      <td></td>
                      <td></td>
                      <td className='text-center fs-5 fw-semibold text-nowrap'>Totals</td>
                      <td className='text-center fs-5 fw-semibold'>
                        {FormatCurrency(
                          state.currentRegion,
                          data?.poItems?.reduce((total, product: PurchaseOrderItem) => total + Number(product.orderQty * product.sellerCost), 0)
                        )}
                      </td>
                      <td className='text-center fs-5 fw-semibold'>
                        {FormatIntNumber(
                          state.currentRegion,
                          data?.poItems?.reduce((total, product: PurchaseOrderItem) => total + Number(product.orderQty), 0)
                        )}
                      </td>
                      <td className='text-center fs-5 fw-semibold'>
                        {FormatIntNumber(
                          state.currentRegion,
                          data?.poItems?.reduce((total, product: PurchaseOrderItem) => total + Number(product.inboundQty), 0)
                        )}
                      </td>
                      <td className='text-center fs-5 fw-semibold'>
                        {FormatIntNumber(
                          state.currentRegion,
                          data?.poItems?.reduce((total, product: PurchaseOrderItem) => total + Number(product.receivedQty), 0)
                        )}
                      </td>
                      <td className='text-center fs-5 fw-semibold'>
                        {FormatIntNumber(
                          state.currentRegion,
                          data?.poItems?.reduce((total, product: PurchaseOrderItem) => total + Number(product.orderQty - product.receivedQty - product.inboundQty), 0)
                        )}
                      </td>
                      <td></td>
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
            {/* {state.currentRegion == 'us'
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
                )} */}
          </Card>
        </Col>
      </Row>
      {showDeleteModal.show && <Confirm_Delete_Item_From_PO showDeleteModal={showDeleteModal} setshowDeleteModal={setshowDeleteModal} loading={loading} setLoading={setLoading} />}
    </div>
  )
}

export default Expanded_By_Orders
