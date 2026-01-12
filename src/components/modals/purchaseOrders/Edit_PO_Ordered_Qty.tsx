/* eslint-disable @next/next/no-img-element */
import { useRouter } from 'next/router'
import { useContext, useState } from 'react'

import AppContext from '@context/AppContext'
import { FormatCurrency, FormatIntNumber } from '@lib/FormatNumbers'
import { NoImageAdress } from '@lib/assetsConstants'
import { PurchaseOrderItem, Split } from '@typesTs/purchaseOrders'
import axios from 'axios'
import { toast } from 'react-toastify'
import { Button, Input, Modal, ModalBody, ModalHeader, Spinner } from 'reactstrap'
import { useSWRConfig } from 'swr'

export type EditPurchaseOrderQtyType = {
  show: boolean
  poId: number
  orderNumber: string
  poItems: PurchaseOrderItem[]
  hasSplitting: boolean
  split: Split | undefined
}

type Props = {
  showEditOrderQty: EditPurchaseOrderQtyType
  setshowEditOrderQty: (prev: EditPurchaseOrderQtyType) => void
  loading: boolean
  setLoading: (state: boolean) => void
}

const Edit_PO_Ordered_Qty = ({ showEditOrderQty, setshowEditOrderQty, loading, setLoading }: Props) => {
  const { show, poId, orderNumber, poItems, hasSplitting, split } = showEditOrderQty
  const { state }: any = useContext(AppContext)
  const router = useRouter()
  const { status, organizeBy } = router.query
  const { mutate } = useSWRConfig()
  const [newOrderedQtyItems, setnewOrderedQtyItems] = useState(structuredClone(poItems))
  const [error, setError] = useState(false)

  const handleClose = () => {
    setshowEditOrderQty({
      show: false,
      poId: 0,
      orderNumber: '',
      poItems: [],
      hasSplitting: false,
      split: undefined,
    })
  }

  const handleEditOrderedQtyFromPO = async () => {
    setLoading(true)
    const response = await axios.post(`/api/purchaseOrders/editPoOrderedQty?region=${state.currentRegion}&businessId=${state.user.businessId}`, {
      poId: poId,
      orderNumber: orderNumber,
      poItems: newOrderedQtyItems,
      hasSplitting,
      split: hasSplitting ? split : undefined,
    })

    if (!response.data.error) {
      axios.post(`/api/reorderingPoints/delete-reordering-points-cache?region=${state.currentRegion}&businessId=${state.user.businessId}`)
      if (organizeBy == 'suppliers') {
        mutate(`/api/purchaseOrders/getpurchaseOrdersBySuppliers?region=${state.currentRegion}&businessId=${state.user.businessId}&status=${status}`)
      } else if (organizeBy == 'orders') {
        mutate(`/api/purchaseOrders/getpurchaseOrdersByOrders?region=${state.currentRegion}&businessId=${state.user.businessId}&status=${status}`)
      } else if (organizeBy == 'sku') {
        mutate(`/api/purchaseOrders/getpurchaseOrdersBySku?region=${state.currentRegion}&businessId=${state.user.businessId}&status=${status}`)
      }
      toast.success(response.data.msg)
      handleClose()
    } else {
      toast.error(response.data.msg)
    }
    setLoading(false)
  }

  return (
    <Modal fade={false} size='lg' id='confirmDelete' isOpen={show} toggle={handleClose}>
      <ModalHeader toggle={handleClose} className='modal-title' id='myModalLabel'>
        Edit PO Quantities
      </ModalHeader>
      <ModalBody>
        <p className='m-0 fs-5 fw-semibold'>
          Purchase Order: <span className='text-primary'>{orderNumber}</span>
        </p>
        {hasSplitting && (
          <p className='fs-5 fw-semibold'>
            In Split: <span className='text-primary'>{split?.splitName}</span>
          </p>
        )}
        <div className='mt-2 table-responsive'>
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
              </tr>
            </thead>
            <tbody className='fs-7'>
              {newOrderedQtyItems?.map((product: PurchaseOrderItem, key: number) => (
                <tr key={`${key}-${product.sku}`} className='border-bottom py-2'>
                  <td className='text-center'>
                    <div
                      style={{
                        width: '100%',
                        maxWidth: '80px',
                        height: '40px',
                        margin: '2px 0px',
                        position: 'relative',
                      }}>
                      <img
                        loading='lazy'
                        src={product.image ? product.image : NoImageAdress}
                        onError={(e) => (e.currentTarget.src = NoImageAdress)}
                        alt='product Image'
                        style={{ objectFit: 'contain', objectPosition: 'center', width: '100%', height: '100%' }}
                      />
                    </div>
                  </td>
                  <td className='fs-7 fw-semibold'>
                    {product.title}

                    {product.asin && (
                      <>
                        <br />
                        <span className='text-muted fs-7 fw-normal'>ASIN: {product.asin}</span>
                      </>
                    )}
                    {product.barcode && (
                      <>
                        <br />
                        <span className='text-muted fs-7 fw-normal'>UPC: {product.barcode}</span>
                      </>
                    )}
                  </td>
                  <td className='text-center text-nowrap'>{product.sku}</td>
                  <td className='text-center text-nowrap'>{FormatCurrency(state.currentRegion, product.orderQty * product.sellerCost || 0)}</td>
                  <td className='text-center text-nowrap'>
                    <Input
                      type='number'
                      onWheel={(e) => e.currentTarget.blur()}
                      className='form-control fs-6 m-0 mx-auto'
                      style={{ maxWidth: '60px' }}
                      placeholder='Qty'
                      id='newOrderQty'
                      name='newOrderQty'
                      bsSize='sm'
                      min={0}
                      value={product.orderQty || 0}
                      onChange={(e) => {
                        e.target.closest('tr')?.classList.add('bg-warning', 'bg-opacity-25')
                        if (parseInt(e.target.value) <= 0 || parseInt(e.target.value) < product.receivedQty + product.inboundQty) {
                          setError(true)
                          e.target.classList.remove('border-warning')
                        } else {
                          setError(false)
                        }
                        const newOrderedQty = [...newOrderedQtyItems]
                        newOrderedQty[key].orderQty = parseInt(e.target.value)
                        setnewOrderedQtyItems(newOrderedQty)
                      }}
                      invalid={product.orderQty <= 0 || product.orderQty < product.receivedQty + product.inboundQty ? true : false}
                    />
                  </td>
                  <td className='fs-6 text-center text-nowrap'>{FormatIntNumber(state.currentRegion, product.inboundQty)}</td>
                  <td className='fs-6 text-center text-nowrap'>{FormatIntNumber(state.currentRegion, product.receivedQty)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className='mt-3 d-flex justify-content-end align-items-center gap-2'>
          <Button type='button' color='light' className='fs-7' onClick={handleClose}>
            Cancel
          </Button>
          <Button disabled={loading || error ? true : false} type='button' color='success' className='fs-7' onClick={handleEditOrderedQtyFromPO}>
            {loading ? (
              <span>
                <Spinner color='light' size={'sm'} /> Saving...
              </span>
            ) : (
              'Save Changes'
            )}
          </Button>
        </div>
      </ModalBody>
    </Modal>
  )
}

export default Edit_PO_Ordered_Qty
