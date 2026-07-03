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
import { toast } from '@/lib/toast'
import { Button, buttonVariants } from '@shadcn/ui/button'
import { cn } from '@/lib/shadcn/utils'
import { Card, CardHeader, CardContent } from '@shadcn/ui/card'
import { Input } from '@shadcn/ui/input'
import { Textarea } from '@shadcn/ui/textarea'
import { Label } from '@shadcn/ui/label'
import { UncontrolledTooltip } from '@/components/ui/UncontrolledTooltip'
import { Nav, NavItem } from '@/components/ui/nav-tabs'
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
      <div className='flex flex-wrap -mx-3'>
        <div className='px-3 w-full sm:w-3/12'>
          <div className='px-3 w-full'>
            <Card>
              <CardHeader className='py-2'>
                <h5 className='font-semibold m-0'>Details</h5>
              </CardHeader>
              <CardContent>
                <table className='w-full text-[11.2px] mb-0 [&_th]:px-2 [&_th]:py-1 [&_td]:px-2 [&_td]:py-1'>
                  <tbody>
                    {!editPONumber && (
                      <tr>
                        <td className='text-muted-foreground text-nowrap'>PO Number:</td>
                        <td className='font-semibold w-full'>
                          {data.orderNumber}{' '}
                          <button
                            type='button'
                            aria-label='Edit PO number'
                            className={cn(buttonVariants({ variant: 'link' }), 'border-0 bg-transparent text-primary m-0 p-0', editPONumber && 'hidden')}
                            onClick={() => seteditPONumber(true)}>
                            <i className='las la-edit text-[16.25px] m-0 p-0' />
                          </button>
                        </td>
                      </tr>
                    )}
                    {editPONumber && (
                      <tr>
                        <td colSpan={2}>
                          <form onSubmit={handleChangePONumber}>
                            <div className='px-3 w-full'>
                              <div className='mb-3'>
                                <Label htmlFor='orderNumber'>
                                  New PO Number:
                                </Label>
                                <div className='flex mb-2'>
                                  <span className='inline-flex items-center font-semibold text-[11.2px] m-0 px-2 py-0 bg-[color:var(--vz-light)] border border-[color:var(--input-border)] rounded-l-md' id='basic-addon1'>
                                    {orderNumberStart}
                                  </span>
                                  <Input
                                    type='text'
                                    aria-label='New PO number'
                                    className='h-8 text-xs'
                                    id='orderNumber'
                                    name='orderNumber'
                                    onChange={validationPONumber.handleChange}
                                    onBlur={validationPONumber.handleBlur}
                                    value={validationPONumber.values.orderNumber || ''}
                                    aria-invalid={Boolean(validationPONumber.touched.orderNumber && validationPONumber.errors.orderNumber) || undefined}
                                  />
                                  {validationPONumber.touched.orderNumber && validationPONumber.errors.orderNumber ? (
                                    <div className='text-sm text-destructive'>{validationPONumber.errors.orderNumber}</div>
                                  ) : null}
                                </div>
                                <div className='flex flex-row justify-end items-center gap-2'>
                                  <Button type='button' disabled={loading} variant='light' size='sm' onClick={() => seteditPONumber(false)}>
                                    Cancel
                                  </Button>
                                  <Button type='submit' disabled={loading} size='sm'>
                                    Save Changes
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </form>
                        </td>
                      </tr>
                    )}

                    <tr>
                      <td className='text-muted-foreground text-nowrap'>Supplier:</td>
                      <td className='font-semibold w-full'>{data.suppliersName}</td>
                    </tr>
                    <tr>
                      <td className='text-muted-foreground text-nowrap'>Created:</td>
                      <td className='font-semibold w-full'>{data.date}</td>
                    </tr>
                    <tr>
                      <td className='text-muted-foreground text-nowrap'>Note:</td>
                      <td aria-label='Note value'></td>
                    </tr>
                  </tbody>
                </table>
                <p className='m-0 px-1 text-[11.2px]'>{data.note}</p>
                <p className='text-right m-0 px-1'>
                  <button
                    type='button'
                    aria-label='Edit PO note'
                    className={cn(buttonVariants({ variant: 'link' }), 'border-0 bg-transparent text-primary m-0 p-0', showEditNote && 'hidden')}
                    onClick={() => setShowEditNote(true)}>
                    <i className='las la-edit text-[19.5px] m-0 p-0' />
                  </button>
                </p>
                {showEditNote && (
                  <form onSubmit={handleAddComment}>
                    <div className='px-3 w-full'>
                      <div className='!m-0'>
                        <Label htmlFor='note'>
                          Edit Note
                        </Label>
                        <Textarea
                          className='text-xs'
                          placeholder=''
                          id='note'
                          name='note'
                          onChange={validationNote.handleChange}
                          onBlur={validationNote.handleBlur}
                          value={validationNote.values.note || ''}
                          aria-invalid={Boolean(validationNote.touched.note && validationNote.errors.note) || undefined}
                        />
                        {validationNote.touched.note && validationNote.errors.note ? <div className='text-sm text-destructive'>{validationNote.errors.note}</div> : null}
                      </div>
                      <div className='flex flex-row justify-end items-center gap-3'>
                        <Button type='button' disabled={loading} variant='light' size='sm' onClick={() => setShowEditNote(false)}>
                          Cancel
                        </Button>
                        <Button type='submit' disabled={loading} size='sm'>
                          Save Changes
                        </Button>
                      </div>
                    </div>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>
          <div className='px-3 w-full'>
            <Card>
              <CardHeader className='py-2 flex flex-row justify-between'>
                <h5 className='font-semibold m-0'>Payment History</h5>{' '}
                {data.isOpen && (
                  <button
                    type='button'
                    aria-label='Add payment'
                    className='border-0 bg-transparent text-success m-0 p-0'
                    onClick={() => setModalAddPaymentToPoDetails(data.poId, data.orderNumber)}>
                    <i className='text-[19.5px] las la-plus-circle' />
                  </button>
                )}
              </CardHeader>
              <CardContent className='pt-0 px-0'>
                <table className='w-full text-[11.2px] text-nowrap mb-0 [&_th]:px-2 [&_th]:py-1 [&_td]:px-2 [&_td]:py-1'>
                  <thead className='bg-[color:var(--vz-light)] text-[11.2px]'>
                    <tr>
                      <th scope='col' className='text-center'>
                        Date
                      </th>
                      <th scope='col' className='text-left'>
                        Amount
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.poPayments?.map((payment: PoPaymentHistory, key) => (
                      <tr key={`${data.orderNumber}-${key}-${payment.date}`}>
                        <td className='text-center'>{payment.date}</td>
                        <td className='flex justify-start items-center gap-2'>
                          <span>{FormatCurrency(state.currentRegion, payment.amount)}</span>
                          <button
                            type='button'
                            aria-label='Edit payment'
                            className='border-0 bg-transparent text-primary m-0 p-0'
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
                            <i className='las la-edit text-[16.25px] m-0 p-0' />
                          </button>
                          {payment.comment && (
                            <>
                              <i className='ri-information-fill m-0 p-0 text-[16.25px] text-info' id={`paymentComment${data.orderNumber}-${key}-${payment.date}`} />
                              <UncontrolledTooltip
                                placement='right'
                                target={`paymentComment${data.orderNumber}-${key}-${payment.date}`}
                                popperClassName='bg-[color:var(--vz-light)] shadow px-3 py-3 rounded'
                                innerClassName='text-black bg-[color:var(--vz-light)] p-0'>
                                {payment.comment}
                              </UncontrolledTooltip>
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                    {data.poPayments?.length > 0 && (
                      <tr className='border-t border-[color:var(--border)]'>
                        <td className='text-center font-semibold'>Total</td>
                        <td className='text-left font-semibold'>
                          {FormatCurrency(
                            state.currentRegion,
                            data.poPayments.reduce((total, payment: PoPaymentHistory) => total + Number(payment.amount), 0)
                          )}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </div>
        </div>
        <div className='px-3 w-full sm:w-9/12'>
          <Card className='mb-3'>
            <CardHeader className='py-2 flex flex-row justify-between items-start'>
              <div>
                <h5 className='font-semibold m-0'>Products</h5>
                {data.hasSplitting && (
                  <>
                    <p className='m-0 my-1 p-0 text-[11.2px] text-muted-foreground font-normal'>Split Destinations:</p>
                    <Nav className='m-0 flex flex-row justify-start items-center gap-2 text-[11.2px]' role='tablist'>
                      <NavItem>
                        <Button type='button' variant={activeTab === 'all' ? undefined : 'light'} size='sm' className='text-[11.2px]' onClick={() => setactiveTab('all')}>
                          All Splits
                        </Button>
                      </NavItem>
                      {Object.values(data.splits).map((split) => (
                        <NavItem key={`splitId-${split.splitId}`}>
                          <Button
                            type='button'
                            variant={activeTab === `${split.splitId}` ? undefined : 'light'}
                            size='sm'
                            className='text-[11.2px]'
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
                <div className='flex flex-row justify-end gap-2 items-center'>
                  {data.poItems.length > 0 && (
                    <button
                      type='button'
                      aria-label='Edit PO items'
                      id={`editPoItems-${data.poId}-${activeTab}`}
                      className='border-0 bg-transparent text-primary m-0 p-0'
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
                      <i className='mdi mdi-file-edit-outline text-[19.5px] m-0 p-0' />
                    </button>
                  )}
                  {data.poItems.length > 0 && (
                    <UncontrolledTooltip
                      placement='top'
                      target={`editPoItems-${data.poId}-${activeTab}`}
                      popperClassName='bg-[color:var(--vz-light)] shadow px-2 py-2 rounded'
                      innerClassName='text-black bg-[color:var(--vz-light)] p-0'>
                      Edit PO items
                    </UncontrolledTooltip>
                  )}
                  <button
                    type='button'
                    aria-label='Add SKU to PO'
                    id={`addSkuToPo-${data.poId}-${activeTab}`}
                    className='border-0 bg-transparent text-success m-0 p-0'
                    onClick={() => setModalAddSkuToPurchaseOrder(true, data.poId, data.orderNumber, data.suppliersName, data.hasSplitting, data.splits[activeTab] || undefined)}>
                    <i className='text-[19.5px] mdi mdi-plus-circle-outline' />
                  </button>
                  <UncontrolledTooltip
                    placement='top'
                    target={`addSkuToPo-${data.poId}-${activeTab}`}
                    popperClassName='bg-[color:var(--vz-light)] shadow px-2 py-2 rounded'
                    innerClassName='text-black bg-[color:var(--vz-light)] p-0'>
                    Add SKU to PO
                  </UncontrolledTooltip>
                  {hasPendingProducts && (
                    <>
                      <button
                        type='button'
                        aria-label='Receive all pending items'
                        id={`receiveAllPendingItems-${data.poId}-${activeTab}`}
                        className='border-0 bg-transparent text-success m-0 p-0'
                        onClick={() => handleReceiveAllPendingItems()}>
                        <i className='text-[19.5px] mdi mdi-checkbox-multiple-marked-outline' />
                      </button>
                      <UncontrolledTooltip
                        placement='top'
                        target={`receiveAllPendingItems-${data.poId}-${activeTab}`}
                        popperClassName='bg-[color:var(--vz-light)] shadow px-2 py-2 rounded'
                        innerClassName='text-black bg-[color:var(--vz-light)] p-0'>
                        Receive all pending items
                      </UncontrolledTooltip>
                    </>
                  )}
                </div>
              )}
            </CardHeader>
            <CardContent className='pt-0 px-0'>
              <ExpandedOrderItems
                activeTab={activeTab}
                poItems={activeTab === 'all' ? data.poItems : data.splits[activeTab].items}
                data={data}
                loading={loading}
                handlereceivingOrderFromPo={handlereceivingOrderFromPo}
                setshowDeleteModal={setshowDeleteModal}
              />
            </CardContent>
          </Card>
          <div className='flex flex-wrap -mx-3 mb-2'>
            <div className='px-3 w-full flex flex-row justify-end items-end'>
              <div className='m-0 flex flex-row justify-end items-end gap-2'>
                {/* <DownloadExcelPurchaseOrder purchaseOrder={data}/> */}
                <DownloadExcelPurchaseOrder purchaseOrder={data} />
                {data.isOpen ? (
                  <Button variant='success' disabled={loading} className='text-[11.2px]' onClick={() => handlePoOpenState(data.poId, !data.isOpen)}>
                    <i className='las la-check-circle label-icon align-middle text-[19.5px] me-2' />
                    Mark as Complete
                  </Button>
                ) : (
                  <Button variant='info' disabled={loading} className='text-[11.2px]' onClick={() => handlePoOpenState(data.poId, !data.isOpen)}>
                    <i className='las la-lock-open label-icon align-middle text-[16.25px] me-2' />
                    ReOpen PO
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      {showDeleteModal.show && <Confirm_Delete_Item_From_PO showDeleteModal={showDeleteModal} setshowDeleteModal={setshowDeleteModal} loading={loading} setLoading={setLoading} />}
      {showEditOrderQty.show && <Edit_PO_Ordered_Qty showEditOrderQty={showEditOrderQty} setshowEditOrderQty={setshowEditOrderQty} loading={loading} setLoading={setLoading} />}
      {editPaymentModal.show && <Edit_Payment_Modal editPaymentModal={editPaymentModal} setEditPaymentModal={setEditPaymentModal} />}
    </div>
  )
}

export default Expanded_By_Orders
