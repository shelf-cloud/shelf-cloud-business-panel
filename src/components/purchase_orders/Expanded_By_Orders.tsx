import { useRouter } from 'next/router'
import React, { useContext, useMemo, useState } from 'react'

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
import { Button, Card, CardBody, CardHeader, Col, Form, FormFeedback, FormGroup, Input, Label, Nav, NavItem, Row, UncontrolledTooltip } from '@/components/migration-ui'
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

  const handleChangePONumber = (event: any) => {
    event.preventDefault()
    validationPONumber.handleSubmit()
  }

  const handleAddComment = (event: any) => {
    event.preventDefault()
    validationNote.handleSubmit()
  }

  const handleReceiveAllPendingItems = () => {
    data.poItems.forEach((item: PurchaseOrderItem) => {
      const pendingQty = item.orderQty - item.receivedQty - item.inboundQty
      if (pendingQty > 0) {
        handlereceivingOrderFromPo(
          data.hasSplitting ? data.splits[activeTab].destination.id : data.warehouseId,
          data.hasSplitting ? data.splits[activeTab].destination.label : data.warehouseName,
          data.poId,
          data.orderNumber,
          item.inventoryId,
          item.sku,
          item.title,
          item.image,
          data.businessId,
          data.suppliersName,
          pendingQty,
          data.hasSplitting,
          data.hasSplitting ? data.splits[activeTab].splitId : undefined,
          item.boxQty
        )
      }
    })
  }

  const hasPendingProducts = useMemo(() => {
    const hasPendingReceiveItems = data.poItems.some((item: PurchaseOrderItem) => item.orderQty - item.inboundQty - item.receivedQty > 0)
    const isDifferentWarehouse = () => {
      if (state.receivingFromPo.warehouse.id === 0) return false
      if (data.hasSplitting && activeTab === 'all') return false
      return data.hasSplitting ? state.receivingFromPo.warehouse.id !== data.splits[activeTab].destination.id : state.receivingFromPo.warehouse.id !== data.warehouseId
    }
    return hasPendingReceiveItems && data.isOpen && !isDifferentWarehouse()
  }, [data.poItems, data.isOpen, data.hasSplitting, data.splits, data.warehouseId, state.receivingFromPo.warehouse.id, activeTab])

  return (
    <div style={{ backgroundColor: '#F0F4F7', padding: '10px' }}>
      <Row>
        <Col sm={3}>
          <Col sm={12}>
            <Card>
              <CardHeader className='tw:py-2'>
                <h5 className='tw:font-semibold tw:m-0'>Details</h5>
              </CardHeader>
              <CardBody>
                <table className='tw:w-full tw:text-[11.2px] tw:mb-0 tw:[&_th]:px-2 tw:[&_th]:py-1 tw:[&_td]:px-2 tw:[&_td]:py-1'>
                  <tbody>
                    {!editPONumber && (
                      <tr>
                        <td className='tw:text-[color:var(--bs-secondary-color)] tw:text-nowrap'>PO Number:</td>
                        <td className='tw:font-semibold tw:w-full'>
                          {data.orderNumber}{' '}
                          <button
                            type='button'
                            aria-label='Edit PO number'
                            className={'btn btn-link border-0 bg-transparent text-primary m-0 p-0 ' + (editPONumber && 'tw:hidden')}
                            onClick={() => seteditPONumber(true)}>
                            <i className='las la-edit tw:text-[16.25px] tw:m-0 tw:p-0' />
                          </button>
                        </td>
                      </tr>
                    )}
                    {editPONumber && (
                      <tr>
                        <td colSpan={2}>
                          <Form onSubmit={handleChangePONumber}>
                            <Col md={12}>
                              <FormGroup>
                                <Label htmlFor='orderNumber'>
                                  New PO Number:
                                </Label>
                                <div className='tw:flex tw:mb-2'>
                                  <span className='tw:inline-flex tw:items-center tw:font-semibold tw:text-[11.2px] tw:m-0 tw:px-2 tw:py-0 tw:bg-[color:var(--vz-light)] tw:border tw:border-[color:var(--input-border)] tw:rounded-l-md' id='basic-addon1'>
                                    {orderNumberStart}
                                  </span>
                                  <Input
                                    type='text'
                                    aria-label='New PO number'
                                    className='tw:text-[11.2px]'
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
                                <div className='tw:flex tw:flex-row tw:justify-end tw:items-center tw:gap-2'>
                                  <Button type='button' disabled={loading} color='light' size='sm' onClick={() => seteditPONumber(false)}>
                                    Cancel
                                  </Button>
                                  <Button type='submit' disabled={loading} color='primary' size='sm'>
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
                      <td className='tw:text-[color:var(--bs-secondary-color)] tw:text-nowrap'>Supplier:</td>
                      <td className='tw:font-semibold tw:w-full'>{data.suppliersName}</td>
                    </tr>
                    <tr>
                      <td className='tw:text-[color:var(--bs-secondary-color)] tw:text-nowrap'>Created:</td>
                      <td className='tw:font-semibold tw:w-full'>{data.date}</td>
                    </tr>
                    <tr>
                      <td className='tw:text-[color:var(--bs-secondary-color)] tw:text-nowrap'>Note:</td>
                      <td aria-label='Note value'></td>
                    </tr>
                  </tbody>
                </table>
                <p className='tw:m-0 tw:px-1 tw:text-[11.2px]'>{data.note}</p>
                <p className='tw:text-right tw:m-0 tw:px-1'>
                  <button
                    type='button'
                    aria-label='Edit PO note'
                    className={'btn btn-link border-0 bg-transparent text-primary m-0 p-0 ' + (showEditNote && 'tw:hidden')}
                    onClick={() => setShowEditNote(true)}>
                    <i className='las la-edit tw:text-[19.5px] tw:m-0 tw:p-0' />
                  </button>
                </p>
                {showEditNote && (
                  <Form onSubmit={handleAddComment}>
                    <Col md={12}>
                      <FormGroup className='tw:!m-0'>
                        <Label htmlFor='note'>
                          Edit Note
                        </Label>
                        <Input
                          type='textarea'
                          className='tw:text-[13px]'
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
                      <div className='tw:flex tw:flex-row tw:justify-end tw:items-center tw:gap-3'>
                        <Button type='button' disabled={loading} color='light' size='sm' onClick={() => setShowEditNote(false)}>
                          Cancel
                        </Button>
                        <Button type='submit' disabled={loading} color='primary' size='sm'>
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
              <CardHeader className='tw:py-2 tw:flex tw:flex-row tw:justify-between'>
                <h5 className='tw:font-semibold tw:m-0'>Payment History</h5>{' '}
                {data.isOpen && (
                  <button
                    type='button'
                    aria-label='Add payment'
                    className='tw:border-0 tw:bg-transparent tw:text-success tw:m-0 tw:p-0'
                    onClick={() => setModalAddPaymentToPoDetails(data.poId, data.orderNumber)}>
                    <i className='tw:text-[19.5px] las la-plus-circle' />
                  </button>
                )}
              </CardHeader>
              <CardBody className='tw:pt-0 tw:px-0'>
                <table className='tw:w-full tw:text-[11.2px] tw:text-nowrap tw:mb-0 tw:[&_th]:px-2 tw:[&_th]:py-1 tw:[&_td]:px-2 tw:[&_td]:py-1'>
                  <thead className='tw:bg-[color:var(--vz-light)] tw:text-[11.2px]'>
                    <tr>
                      <th scope='col' className='tw:text-center'>
                        Date
                      </th>
                      <th scope='col' className='tw:text-left'>
                        Amount
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.poPayments?.map((payment: PoPaymentHistory, key) => (
                      <tr key={`${data.orderNumber}-${key}-${payment.date}`}>
                        <td className='tw:text-center'>{payment.date}</td>
                        <td className='tw:flex tw:justify-start tw:items-center tw:gap-2'>
                          <span>{FormatCurrency(state.currentRegion, payment.amount)}</span>
                          <button
                            type='button'
                            aria-label='Edit payment'
                            className='tw:border-0 tw:bg-transparent tw:text-primary tw:m-0 tw:p-0'
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
                            }>
                            <i className='las la-edit tw:text-[16.25px] tw:m-0 tw:p-0' />
                          </button>
                          {payment.comment && (
                            <>
                              <i className='ri-information-fill tw:m-0 tw:p-0 tw:text-[16.25px] tw:text-info' id={`paymentComment${data.orderNumber}-${key}-${payment.date}`} />
                              <UncontrolledTooltip
                                placement='right'
                                target={`paymentComment${data.orderNumber}-${key}-${payment.date}`}
                                popperClassName='tw:bg-[color:var(--vz-light)] tw:shadow tw:px-3 tw:py-3 tw:rounded'
                                innerClassName='tw:text-black tw:bg-[color:var(--vz-light)] tw:p-0'>
                                {payment.comment}
                              </UncontrolledTooltip>
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                    {data.poPayments?.length > 0 && (
                      <tr className='tw:border-t tw:border-[color:var(--border)]'>
                        <td className='tw:text-center tw:font-semibold'>Total</td>
                        <td className='tw:text-left tw:font-semibold'>
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
          <Card className='tw:mb-3'>
            <CardHeader className='tw:py-2 tw:flex tw:flex-row tw:justify-between tw:items-start'>
              <div>
                <h5 className='tw:font-semibold tw:m-0'>Products</h5>
                {data.hasSplitting && (
                  <>
                    <p className='tw:m-0 tw:my-1 tw:p-0 tw:text-[11.2px] tw:text-[color:var(--bs-secondary-color)] tw:font-normal'>Split Destinations:</p>
                    <Nav className='tw:m-0 tw:flex tw:flex-row tw:justify-start tw:items-center tw:gap-2 tw:text-[11.2px]' role='tablist'>
                      <NavItem>
                        <Button type='button' color={activeTab === 'all' ? 'primary' : 'light'} size='sm' className='tw:text-[11.2px]' onClick={() => setactiveTab('all')}>
                          All Splits
                        </Button>
                      </NavItem>
                      {Object.values(data.splits).map((split) => (
                        <NavItem key={`splitId-${split.splitId}`}>
                          <Button
                            type='button'
                            color={activeTab === `${split.splitId}` ? 'primary' : 'light'}
                            size='sm'
                            className='tw:text-[11.2px]'
                            onClick={() => setactiveTab(`${split.splitId}`)}>
                            {split.splitName}
                          </Button>
                        </NavItem>
                      ))}
                    </Nav>
                  </>
                )}
              </div>
              {(!data.hasSplitting || (data.hasSplitting && activeTab !== 'all')) && data.isOpen && (
                <div className='tw:flex tw:flex-row tw:justify-end tw:gap-2 tw:items-center'>
                  {data.poItems.length > 0 && (
                    <button
                      type='button'
                      aria-label='Edit PO items'
                      id={`editPoItems-${data.poId}-${activeTab}`}
                      className='tw:border-0 tw:bg-transparent tw:text-primary tw:m-0 tw:p-0'
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
                      }>
                      <i className='mdi mdi-file-edit-outline tw:text-[19.5px] tw:m-0 tw:p-0' />
                    </button>
                  )}
                  {data.poItems.length > 0 && (
                    <UncontrolledTooltip
                      placement='top'
                      target={`editPoItems-${data.poId}-${activeTab}`}
                      popperClassName='tw:bg-[color:var(--vz-light)] tw:shadow tw:px-2 tw:py-2 tw:rounded'
                      innerClassName='tw:text-black tw:bg-[color:var(--vz-light)] tw:p-0'>
                      Edit PO items
                    </UncontrolledTooltip>
                  )}
                  <button
                    type='button'
                    aria-label='Add SKU to PO'
                    id={`addSkuToPo-${data.poId}-${activeTab}`}
                    className='tw:border-0 tw:bg-transparent tw:text-success tw:m-0 tw:p-0'
                    onClick={() => setModalAddSkuToPurchaseOrder(true, data.poId, data.orderNumber, data.suppliersName, data.hasSplitting, data.splits[activeTab] || undefined)}>
                    <i className='tw:text-[19.5px] mdi mdi-plus-circle-outline' />
                  </button>
                  <UncontrolledTooltip
                    placement='top'
                    target={`addSkuToPo-${data.poId}-${activeTab}`}
                    popperClassName='tw:bg-[color:var(--vz-light)] tw:shadow tw:px-2 tw:py-2 tw:rounded'
                    innerClassName='tw:text-black tw:bg-[color:var(--vz-light)] tw:p-0'>
                    Add SKU to PO
                  </UncontrolledTooltip>
                  {hasPendingProducts && (
                    <>
                      <button
                        type='button'
                        aria-label='Receive all pending items'
                        id={`receiveAllPendingItems-${data.poId}-${activeTab}`}
                        className='tw:border-0 tw:bg-transparent tw:text-success tw:m-0 tw:p-0'
                        onClick={() => handleReceiveAllPendingItems()}>
                        <i className='tw:text-[19.5px] mdi mdi-checkbox-multiple-marked-outline' />
                      </button>
                      <UncontrolledTooltip
                        placement='top'
                        target={`receiveAllPendingItems-${data.poId}-${activeTab}`}
                        popperClassName='tw:bg-[color:var(--vz-light)] tw:shadow tw:px-2 tw:py-2 tw:rounded'
                        innerClassName='tw:text-black tw:bg-[color:var(--vz-light)] tw:p-0'>
                        Receive all pending items
                      </UncontrolledTooltip>
                    </>
                  )}
                </div>
              )}
            </CardHeader>
            <CardBody className='tw:pt-0 tw:px-0'>
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
          <Row className='tw:mb-2'>
            <Col sm={12} className='tw:flex tw:flex-row tw:justify-end tw:items-end'>
              <div className='tw:m-0 tw:flex tw:flex-row tw:justify-end tw:items-end tw:gap-2'>
                {/* <DownloadExcelPurchaseOrder purchaseOrder={data}/> */}
                <DownloadExcelPurchaseOrder purchaseOrder={data} />
                {data.isOpen ? (
                  <Button color='success' disabled={loading} className='tw:text-[11.2px]' onClick={() => handlePoOpenState(data.poId, !data.isOpen)}>
                    <i className='las la-check-circle label-icon tw:align-middle tw:text-[19.5px] tw:me-2' />
                    Mark as Complete
                  </Button>
                ) : (
                  <Button color='info' disabled={loading} className='tw:text-[11.2px]' onClick={() => handlePoOpenState(data.poId, !data.isOpen)}>
                    <i className='las la-lock-open label-icon tw:align-middle tw:text-[16.25px] tw:me-2' />
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
