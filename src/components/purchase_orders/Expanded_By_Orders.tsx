/* eslint-disable @next/next/no-img-element */
import React, { useContext, useState } from 'react'
import { Button, Card, CardBody, CardHeader, Col, Form, FormFeedback, FormGroup, Input, Label, Row, UncontrolledTooltip } from 'reactstrap'
import { ExpanderComponentProps } from 'react-data-table-component'
import { PoItemArrivalHistory, PoPaymentHistory, PurchaseOrder, PurchaseOrderItem } from '@typesTs/purchaseOrders'
import { FormatCurrency, FormatIntNumber } from '@lib/FormatNumbers'
import AppContext from '@context/AppContext'
import Confirm_Delete_Item_From_PO from '@components/modals/purchaseOrders/Confirm_Delete_Item_From_PO'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useSWRConfig } from 'swr'
import { useRouter } from 'next/router'
import * as Yup from 'yup'
import { useFormik } from 'formik'
import Edit_PO_Ordered_Qty from '@components/modals/purchaseOrders/Edit_PO_Ordered_Qty'

type Props = {
  data: PurchaseOrder
}

const Expanded_By_Orders: React.FC<ExpanderComponentProps<PurchaseOrder>> = ({ data }: Props) => {
  const router = useRouter()
  const { status, organizeBy } = router.query
  const { state, setReceivingFromPo, setModalAddPaymentToPoDetails, setModalAddSkuToPurchaseOrder }: any = useContext(AppContext)
  const { mutate } = useSWRConfig()
  const [loading, setLoading] = useState(false)
  const [showEditNote, setShowEditNote] = useState(false)
  const [showDeleteModal, setshowDeleteModal] = useState({
    show: false,
    poId: 0,
    orderNumber: '',
    inventoryId: 0,
    sku: '',
    title: '',
    image: '',
  })
  const [showEditOrderQty, setshowEditOrderQty] = useState({
    show: false,
    poId: 0,
    orderNumber: '',
    poItems: [] as PurchaseOrderItem[],
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

  const handlePoOpenState = async (poId: number, isOpen: boolean) => {
    setLoading(true)

    const response = await axios.post(`/api/purchaseOrders/changeOpenStatusToPO?region=${state.currentRegion}&businessId=${state.user.businessId}`, {
      poId,
      isOpen,
    })

    if (!response.data.error) {
      toast.success(response.data.msg)

      if (organizeBy == 'suppliers') {
        mutate(`/api/purchaseOrders/getpurchaseOrdersBySuppliers?region=${state.currentRegion}&businessId=${state.user.businessId}&status=${status}`)
      } else if (organizeBy == 'orders') {
        mutate(`/api/purchaseOrders/getpurchaseOrdersByOrders?region=${state.currentRegion}&businessId=${state.user.businessId}&status=${status}`)
      } else if (organizeBy == 'sku') {
        mutate(`/api/purchaseOrders/getpurchaseOrdersBySku?region=${state.currentRegion}&businessId=${state.user.businessId}&status=${status}`)
      }
    } else {
      toast.error(response.data.msg)
    }
    setLoading(false)
  }

  const validationNote = useFormik({
    enableReinitialize: true,
    initialValues: {
      note: data.note || '',
    },
    validationSchema: Yup.object({
      note: Yup.string().max(300, 'Title is to Long'),
    }),
    onSubmit: async (values) => {
      setLoading(true)

      const response = await axios.post(`/api/purchaseOrders/editNoteFromPO?region=${state.currentRegion}&businessId=${state.user.businessId}`, {
        poId: data.poId,
        note: values.note,
      })

      if (!response.data.error) {
        toast.success(response.data.msg)

        if (organizeBy == 'suppliers') {
          mutate(`/api/purchaseOrders/getpurchaseOrdersBySuppliers?region=${state.currentRegion}&businessId=${state.user.businessId}&status=${status}`)
        } else if (organizeBy == 'orders') {
          mutate(`/api/purchaseOrders/getpurchaseOrdersByOrders?region=${state.currentRegion}&businessId=${state.user.businessId}&status=${status}`)
        } else if (organizeBy == 'sku') {
          mutate(`/api/purchaseOrders/getpurchaseOrdersBySku?region=${state.currentRegion}&businessId=${state.user.businessId}&status=${status}`)
        }
        setShowEditNote(false)
      } else {
        toast.error(response.data.msg)
      }
      setLoading(false)
    },
  })

  const HandleAddProduct = (event: any) => {
    event.preventDefault()
    validationNote.handleSubmit()
  }
  return (
    <div style={{ backgroundColor: '#F0F4F7', padding: '10px' }}>
      <Row>
        <Col sm={3}>
          <Col sm={12}>
            <Card>
              <CardHeader className='py-3'>
                <h5 className='fw-semibold m-0'>Details</h5>
              </CardHeader>
              <CardBody>
                <table className='table table-sm table-borderless mb-0'>
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
                      <td></td>
                    </tr>
                  </tbody>
                </table>
                <p className='m-0 px-1 fs-7'>{data.note}</p>
                <p className='text-end m-0 px-1'>
                  <i className={'ri-pencil-fill fs-5 text-primary m-0 p-0 ' + (showEditNote && 'd-none')} style={{ cursor: 'pointer' }} onClick={() => setShowEditNote(true)}></i>
                </p>
                {showEditNote && (
                  <Form onSubmit={HandleAddProduct}>
                    <Col md={12}>
                      <FormGroup className='m-0'>
                        <Label htmlFor='note' className='form-label'>
                          Edit Note
                        </Label>
                        <Input
                          type='textarea'
                          className='form-control fs-6'
                          placeholder=''
                          id='note'
                          name='note'
                          bsSize='sm'
                          onChange={validationNote.handleChange}
                          onBlur={validationNote.handleBlur}
                          value={validationNote.values.note || ''}
                          invalid={validationNote.touched.note && validationNote.errors.note ? true : false}
                        />
                        {validationNote.touched.note && validationNote.errors.note ? <FormFeedback type='invalid'>{validationNote.errors.note}</FormFeedback> : null}
                      </FormGroup>
                      <div className='d-flex flex-row justify-content-end align-items-center gap-3'>
                        <Button type='button' disabled={loading} color='light' className='btn btn-sm' onClick={() => setShowEditNote(false)}>
                          Cancel
                        </Button>
                        <Button type='submit' disabled={loading} color='primary' className='btn btn-sm'>
                          Save Changes
                        </Button>
                      </div>
                    </Col>
                  </Form>
                )}
              </CardBody>
            </Card>
          </Col>
          <Col sm={12}>
            <Card>
              <CardHeader className='py-3 d-flex flex-row justify-content-between'>
                <h5 className='fw-semibold m-0'>Payment History</h5>{' '}
                {data.isOpen && (
                  <i className='fs-3 text-success las la-plus-circle' style={{ cursor: 'pointer' }} onClick={() => setModalAddPaymentToPoDetails(data.poId, data.orderNumber)} />
                )}
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
                    {data.poPayments?.map((payment: PoPaymentHistory, key) => (
                      <tr key={`${key}-${payment.date}`}>
                        <td className='text-center'>{payment.date}</td>
                        <td className='text-center'>{FormatCurrency(state.currentRegion, payment.amount)}</td>
                      </tr>
                    ))}
                    {data.poPayments?.length > 0 && (
                      <tr className='border-top'>
                        <td className='text-center fw-semibold'>Total</td>
                        <td className='text-center fw-semibold'>
                          {FormatCurrency(
                            state.currentRegion,
                            data.poPayments.reduce((total, payment: PoPaymentHistory) => total + Number(payment.amount), 0)
                          )}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </CardBody>
            </Card>
          </Col>
        </Col>
        <Col sm={9}>
          <Card>
            <CardHeader className='py-3 d-flex flex-row justify-content-between'>
              <h5 className='fw-semibold m-0'>Products</h5>
              {data.isOpen && (
                <div className='d-flex flex-row justify-content-end gap-4 align-items-center'>
                  <i
                    className='ri-pencil-fill fs-4 text-primary m-0 p-0'
                    style={{ cursor: 'pointer' }}
                    onClick={() =>
                      setshowEditOrderQty((prev) => {
                        return {
                          ...prev,
                          show: true,
                          poId: data.poId,
                          orderNumber: data.orderNumber,
                          poItems: data.poItems,
                        }
                      })
                    }
                  />
                  <i
                    className='fs-3 text-success las la-plus-circle'
                    style={{ cursor: 'pointer' }}
                    onClick={() => setModalAddSkuToPurchaseOrder(data.poId, data.orderNumber, data.suppliersName)}
                  />
                </div>
              )}
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
                          {product.arrivalHistory?.length > 0 && (
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
                            Number(product.inboundQty) <= 0 &&
                            Number(product.receivedQty) <= 0 &&
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
          <Row>
            <Col sm={12} className='d-flex justify-content-end align-items-end'>
              <Card className='m-0'>
                {data.isOpen ? (
                  <Button color='success' disabled={loading} className='btn-label' onClick={() => handlePoOpenState(data.poId, !data.isOpen)}>
                    <i className='las la-check-circle label-icon align-middle fs-3 me-2' />
                    Mark as Complete
                  </Button>
                ) : (
                  <Button color='info' disabled={loading} className='btn-label' onClick={() => handlePoOpenState(data.poId, !data.isOpen)}>
                    <i className='las la-lock-open label-icon align-middle fs-3 me-2' />
                    ReOpen PO
                  </Button>
                )}
              </Card>
            </Col>
          </Row>
        </Col>
      </Row>
      {showDeleteModal.show && <Confirm_Delete_Item_From_PO showDeleteModal={showDeleteModal} setshowDeleteModal={setshowDeleteModal} loading={loading} setLoading={setLoading} />}
      {showEditOrderQty.show && <Edit_PO_Ordered_Qty showEditOrderQty={showEditOrderQty} setshowEditOrderQty={setshowEditOrderQty} loading={loading} setLoading={setLoading} />}
    </div>
  )
}

export default Expanded_By_Orders
