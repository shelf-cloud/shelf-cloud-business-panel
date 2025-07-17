/* eslint-disable @next/next/no-img-element */
import { useRouter } from 'next/router'
import React, { useContext, useState } from 'react'

import Confirm_Delete_Item_From_PO, { DeleteItemFromOrderType } from '@components/modals/purchaseOrders/Confirm_Delete_Item_From_PO'
import Edit_PO_Ordered_Qty, { EditPurchaseOrderQtyType } from '@components/modals/purchaseOrders/Edit_PO_Ordered_Qty'
import Edit_Payment_Modal from '@components/modals/purchaseOrders/Edit_Payment_Modal'
import AppContext from '@context/AppContext'
import { FormatCurrency } from '@lib/FormatNumbers'
import { PoPaymentHistory, PurchaseOrder, PurchaseOrderItem } from '@typesTs/purchaseOrders'
import axios from 'axios'
import { useFormik } from 'formik'
import { ExpanderComponentProps } from 'react-data-table-component'
import { toast } from 'react-toastify'
import { Button, Card, CardBody, CardHeader, Col, Form, FormFeedback, FormGroup, Input, Label, Nav, NavItem, Row, UncontrolledTooltip } from 'reactstrap'
import { useSWRConfig } from 'swr'
import * as Yup from 'yup'

import DownloadExcelPurchaseOrder from './DownloadExcelPurchaseOrder'
import ExpandedOrderItems from './ExpandedOrderItems'

type Props = {
  data: PurchaseOrder
}

const Expanded_By_Orders: React.FC<ExpanderComponentProps<PurchaseOrder>> = ({ data }: Props) => {
  const router = useRouter()
  const { status, organizeBy } = router.query
  const { state, setReceivingFromPo, setModalAddPaymentToPoDetails, setModalAddSkuToPurchaseOrder } = useContext(AppContext)
  const { mutate } = useSWRConfig()
  const [activeTab, setactiveTab] = useState('all')
  const orderNumberStart = `${state?.user?.name.substring(0, 3).toUpperCase()}-`
  const [loading, setLoading] = useState(false)
  const [showEditNote, setShowEditNote] = useState(false)
  const [editPONumber, seteditPONumber] = useState(false)
  const [editPaymentModal, setEditPaymentModal] = useState({
    show: false,
    poId: 0,
    orderNumber: '',
    paymentDate: '',
    amount: 0,
    comment: '',
    paymentIndex: 0,
  })

  const [showDeleteModal, setshowDeleteModal] = useState<DeleteItemFromOrderType>({
    show: false,
    poId: 0,
    orderNumber: '',
    inventoryId: 0,
    sku: '',
    title: '',
    image: '',
    hasSplitting: false,
    split: undefined,
  })

  const [showEditOrderQty, setshowEditOrderQty] = useState<EditPurchaseOrderQtyType>({
    show: false,
    poId: 0,
    orderNumber: '',
    poItems: [] as PurchaseOrderItem[],
    hasSplitting: false,
    split: undefined,
  })

  const handlereceivingOrderFromPo = (
    warehouseId: number,
    warehouseName: string,
    poId: number,
    orderNumber: string,
    inventoryId: number,
    sku: string,
    title: string,
    image: string,
    businessId: number,
    suppliersName: string,
    receivingQty: number,
    hasSplitting: boolean,
    splitId: number | undefined,
    boxQty: number
  ) => {
    let newReceivingOrderFromPo = state.receivingFromPo
    newReceivingOrderFromPo.warehouse.id = warehouseId
    newReceivingOrderFromPo.warehouse.name = warehouseName

    if (newReceivingOrderFromPo?.items[poId]?.[inventoryId]) {
      if (receivingQty === 0 || String(receivingQty) === '') {
        delete newReceivingOrderFromPo.items[poId][inventoryId]
        Object.keys(newReceivingOrderFromPo.items[poId]).length <= 0 && delete newReceivingOrderFromPo.items[poId]
        if (Object.keys(newReceivingOrderFromPo.items).length <= 0) {
          newReceivingOrderFromPo = {
            warehouse: {
              id: 0,
              name: '',
            },
            items: {},
          }
        }
      } else {
        newReceivingOrderFromPo.items[poId][inventoryId].receivingQty = receivingQty
      }
    } else {
      if (!newReceivingOrderFromPo.items[poId]) {
        newReceivingOrderFromPo.items[poId] = {}
      }
      newReceivingOrderFromPo.items[poId][inventoryId] = {
        poId,
        orderNumber,
        inventoryId,
        sku,
        title,
        image,
        businessId,
        suppliersName,
        receivingQty,
        hasSplitting,
        splitId,
        boxQty,
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

  const validationPONumber = useFormik({
    enableReinitialize: true,
    initialValues: {
      orderNumber: data.orderNumber.slice(4),
    },
    validationSchema: Yup.object({
      orderNumber: Yup.string()
        .matches(/^[a-zA-Z0-9-]+$/, `Invalid special characters: % & # " ' @ ~ , ...`)
        .max(100, 'Title is to Long')
        .required('Please enter Order Number'),
    }),
    onSubmit: async (values) => {
      setLoading(true)

      const response = await axios.post(`/api/purchaseOrders/editNewPONumber?region=${state.currentRegion}&businessId=${state.user.businessId}`, {
        poId: data.poId,
        orderNumber: values.orderNumber,
      })

      if (!response.data.error) {
        toast.success(response.data.message)

        if (organizeBy == 'suppliers') {
          mutate(`/api/purchaseOrders/getpurchaseOrdersBySuppliers?region=${state.currentRegion}&businessId=${state.user.businessId}&status=${status}`)
        } else if (organizeBy == 'orders') {
          mutate(`/api/purchaseOrders/getpurchaseOrdersByOrders?region=${state.currentRegion}&businessId=${state.user.businessId}&status=${status}`)
        } else if (organizeBy == 'sku') {
          mutate(`/api/purchaseOrders/getpurchaseOrdersBySku?region=${state.currentRegion}&businessId=${state.user.businessId}&status=${status}`)
        }
        seteditPONumber(false)
      } else {
        toast.error(response.data.message)
      }
      setLoading(false)
    },
  })

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

  const HandleChangePONumber = (event: any) => {
    event.preventDefault()
    validationPONumber.handleSubmit()
  }

  const HandleAddComment = (event: any) => {
    event.preventDefault()
    validationNote.handleSubmit()
  }
  return (
    <div style={{ backgroundColor: '#F0F4F7', padding: '10px' }}>
      <Row>
        <Col sm={3}>
          <Col sm={12}>
            <Card>
              <CardHeader className='py-2'>
                <h5 className='fw-semibold m-0'>Details</h5>
              </CardHeader>
              <CardBody>
                <table className='table table-sm table-borderless mb-0'>
                  <tbody className='fs-7'>
                    {!editPONumber && (
                      <tr>
                        <td className='text-muted text-nowrap'>PO Number:</td>
                        <td className='fw-semibold w-100'>
                          {data.orderNumber}{' '}
                          <i
                            className={'las la-edit fs-5 text-primary m-0 p-0 ' + (editPONumber && 'd-none')}
                            style={{ cursor: 'pointer' }}
                            onClick={() => seteditPONumber(true)}
                          />
                        </td>
                      </tr>
                    )}
                    {editPONumber && (
                      <tr>
                        <td colSpan={2}>
                          <Form onSubmit={HandleChangePONumber}>
                            <Col md={12}>
                              <FormGroup>
                                <Label htmlFor='note' className='form-label'>
                                  New PO Number:
                                </Label>
                                <div className='input-group mb-2'>
                                  <span className='input-group-text fw-semibold fs-7 m-0 px-2 py-0' id='basic-addon1'>
                                    {orderNumberStart}
                                  </span>
                                  <Input
                                    type='text'
                                    className='form-control fs-7'
                                    id='orderNumber'
                                    name='orderNumber'
                                    bsSize='sm'
                                    onChange={validationPONumber.handleChange}
                                    onBlur={validationPONumber.handleBlur}
                                    value={validationPONumber.values.orderNumber || ''}
                                    invalid={validationPONumber.touched.orderNumber && validationPONumber.errors.orderNumber ? true : false}
                                  />
                                  {validationPONumber.touched.orderNumber && validationPONumber.errors.orderNumber ? (
                                    <FormFeedback type='invalid'>{validationPONumber.errors.orderNumber}</FormFeedback>
                                  ) : null}
                                </div>
                                <div className='d-flex flex-row justify-content-end align-items-center gap-2'>
                                  <Button type='button' disabled={loading} color='light' className='btn btn-sm' onClick={() => seteditPONumber(false)}>
                                    Cancel
                                  </Button>
                                  <Button type='submit' disabled={loading} color='primary' className='btn btn-sm'>
                                    Save Changes
                                  </Button>
                                </div>
                              </FormGroup>
                            </Col>
                          </Form>
                        </td>
                      </tr>
                    )}

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
                  <i className={'las la-edit fs-4 text-primary m-0 p-0 ' + (showEditNote && 'd-none')} style={{ cursor: 'pointer' }} onClick={() => setShowEditNote(true)}></i>
                </p>
                {showEditNote && (
                  <Form onSubmit={HandleAddComment}>
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
              <CardHeader className='py-2 d-flex flex-row justify-content-between'>
                <h5 className='fw-semibold m-0'>Payment History</h5>{' '}
                {data.isOpen && (
                  <i className='fs-4 text-success las la-plus-circle' style={{ cursor: 'pointer' }} onClick={() => setModalAddPaymentToPoDetails(data.poId, data.orderNumber)} />
                )}
              </CardHeader>
              <CardBody className='pt-0 px-0'>
                <table className='table table-sm table-borderless table-nowrap mb-0'>
                  <thead className='table-light fs-7'>
                    <tr>
                      <th scope='col' className='text-center'>
                        Date
                      </th>
                      <th scope='col' className='text-start'>
                        Amount
                      </th>
                    </tr>
                  </thead>
                  <tbody className='fs-7'>
                    {data.poPayments?.map((payment: PoPaymentHistory, key) => (
                      <tr key={`${data.orderNumber}-${key}-${payment.date}`}>
                        <td className='text-center'>{payment.date}</td>
                        <td className='d-flex justify-content-start align-items-center gap-2'>
                          <span>{FormatCurrency(state.currentRegion, payment.amount)}</span>
                          <i
                            className='las la-edit fs-5 text-primary m-0 p-0'
                            style={{ cursor: 'pointer' }}
                            onClick={() =>
                              setEditPaymentModal({
                                show: true,
                                poId: data.poId,
                                orderNumber: data.orderNumber,
                                paymentDate: payment.date,
                                amount: payment.amount,
                                comment: payment.comment ?? '',
                                paymentIndex: key,
                              })
                            }
                          />
                          {payment.comment && (
                            <>
                              <i className='ri-information-fill m-0 p-0 fs-5 text-info' id={`paymentComment${data.orderNumber}-${key}-${payment.date}`} />
                              <UncontrolledTooltip
                                placement='right'
                                target={`paymentComment${data.orderNumber}-${key}-${payment.date}`}
                                popperClassName='bg-light shadow px-3 py-3 rounded-2'
                                innerClassName='text-black bg-light p-0'>
                                {payment.comment}
                              </UncontrolledTooltip>
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                    {data.poPayments?.length > 0 && (
                      <tr className='border-top'>
                        <td className='text-center fw-semibold'>Total</td>
                        <td className='text-start fw-semibold'>
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
          <Card className='mb-3'>
            <CardHeader className='py-2 d-flex flex-row justify-content-between align-items-start'>
              <div>
                <h5 className='fw-semibold m-0'>Products</h5>
                {data.hasSplitting && (
                  <>
                    <p className='m-0 my-1 p-0 fs-7 text-muted fw-normal'>Split Destinations:</p>
                    <Nav className='m-0 d-flex flex-row justify-content-start align-items-center gap-2 fs-7' role='tablist'>
                      <NavItem style={{ cursor: 'pointer' }} onClick={() => setactiveTab('all')}>
                        <Button color={activeTab === 'all' ? 'primary' : 'light'} size='sm' className='fs-7'>
                          All Splits
                        </Button>
                      </NavItem>
                      {Object.values(data.splits).map((split) => (
                        <NavItem key={`splitId-${split.splitId}`} style={{ cursor: 'pointer' }} onClick={() => setactiveTab(`${split.splitId}`)}>
                          <Button color={activeTab === `${split.splitId}` ? 'primary' : 'light'} size='sm' className='fs-7'>
                            {split.splitName}
                          </Button>
                        </NavItem>
                      ))}
                    </Nav>
                  </>
                )}
              </div>
              {(!data.hasSplitting || (data.hasSplitting && activeTab !== 'all')) && data.isOpen && (
                <div className='d-flex flex-row justify-content-end gap-2 align-items-center'>
                  {data.poItems.length > 0 && (
                    <i
                      className='las la-edit fs-4 text-primary m-0 p-0'
                      style={{ cursor: 'pointer' }}
                      onClick={() =>
                        setshowEditOrderQty((prev) => {
                          return {
                            ...prev,
                            show: true,
                            poId: data.poId,
                            orderNumber: data.orderNumber,
                            poItems: data.hasSplitting ? data.splits[activeTab].items : data.poItems,
                            hasSplitting: data.hasSplitting,
                            split: data.splits[activeTab] || undefined,
                          }
                        })
                      }
                    />
                  )}
                  <i
                    className='fs-4 text-success las la-plus-circle'
                    style={{ cursor: 'pointer' }}
                    onClick={() => setModalAddSkuToPurchaseOrder(true, data.poId, data.orderNumber, data.suppliersName, data.hasSplitting, data.splits[activeTab] || undefined)}
                  />
                </div>
              )}
            </CardHeader>
            <CardBody className='pt-0 px-0'>
              <ExpandedOrderItems
                activeTab={activeTab}
                poItems={activeTab === 'all' ? data.poItems : data.splits[activeTab].items}
                data={data}
                loading={loading}
                handlereceivingOrderFromPo={handlereceivingOrderFromPo}
                setshowDeleteModal={setshowDeleteModal}
              />
            </CardBody>
          </Card>
          <Row className='mb-2'>
            <Col sm={12} className='d-flex flex-row justify-content-end align-items-end'>
              <div className='m-0 d-flex flex-row justify-content-end align-items-end gap-2'>
                {/* <DownloadExcelPurchaseOrder purchaseOrder={data}/> */}
                <DownloadExcelPurchaseOrder purchaseOrder={data} />
                {data.isOpen ? (
                  <Button color='success' disabled={loading} className='btn-label fs-7' onClick={() => handlePoOpenState(data.poId, !data.isOpen)}>
                    <i className='las la-check-circle label-icon align-middle fs-4 me-2' />
                    Mark as Complete
                  </Button>
                ) : (
                  <Button color='info' disabled={loading} className='btn-label fs-7' onClick={() => handlePoOpenState(data.poId, !data.isOpen)}>
                    <i className='las la-lock-open label-icon align-middle fs-5 me-2' />
                    ReOpen PO
                  </Button>
                )}
              </div>
            </Col>
          </Row>
        </Col>
      </Row>
      {showDeleteModal.show && <Confirm_Delete_Item_From_PO showDeleteModal={showDeleteModal} setshowDeleteModal={setshowDeleteModal} loading={loading} setLoading={setLoading} />}
      {showEditOrderQty.show && <Edit_PO_Ordered_Qty showEditOrderQty={showEditOrderQty} setshowEditOrderQty={setshowEditOrderQty} loading={loading} setLoading={setLoading} />}
      {editPaymentModal.show && <Edit_Payment_Modal editPaymentModal={editPaymentModal} setEditPaymentModal={setEditPaymentModal} />}
    </div>
  )
}

export default Expanded_By_Orders
