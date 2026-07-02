/* eslint-disable @next/next/no-img-element */
import { useRouter } from 'next/router'
import { useContext, useState } from 'react'

import AppContext from '@context/AppContext'
import { useRPNewForecast } from '@hooks/reorderingPoints/useRPNewForcast'
import { FormatCurrency, FormatIntNumber } from '@lib/FormatNumbers'
import { NoImageAdress } from '@lib/assetsConstants'
import { PurchaseOrderItem, Split } from '@typesTs/purchaseOrders'
import axios from 'axios'
import { toast } from 'react-toastify'
import { Button, Input, Modal, ModalBody, ModalHeader, Spinner } from '@/components/migration-ui'
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

  const { generate_new_forecast_products } = useRPNewForecast()

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
      generate_new_forecast_products({
        skus: newOrderedQtyItems.map((item) => item.sku),
        productIds: newOrderedQtyItems.map((item) => item.inventoryId),
      })
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
        <p className='tw:m-0 tw:text-[16.25px] tw:font-semibold'>
          Purchase Order: <span className='tw:text-primary'>{orderNumber}</span>
        </p>
        {hasSplitting && (
          <p className='tw:text-[16.25px] tw:font-semibold'>
            In Split: <span className='tw:text-primary'>{split?.splitName}</span>
          </p>
        )}
        <div className='tw:mt-2 tw:overflow-x-auto'>
          <table className='tw:w-full tw:align-middle tw:mb-0 tw:[&_th]:px-2 tw:[&_th]:py-1 tw:[&_td]:px-2 tw:[&_td]:py-1'>
            <thead className='tw:bg-[color:var(--vz-light)]'>
              <tr>
                <th scope='col' className='tw:text-center'>
                  Image
                </th>
                <th scope='col'>Title</th>
                <th className='tw:text-center' scope='col'>
                  SKU
                </th>
                <th className='tw:text-center' scope='col'>
                  Cost
                </th>
                <th className='tw:text-center' scope='col'>
                  Ordered
                </th>
                <th className='tw:text-center' scope='col'>
                  Inbound
                </th>
                <th className='tw:text-center' scope='col'>
                  Arrived
                </th>
              </tr>
            </thead>
            <tbody className='tw:text-[11.2px]'>
              {newOrderedQtyItems?.map((product: PurchaseOrderItem, key: number) => (
                <tr key={`${key}-${product.sku}`} className='tw:border-b tw:py-2'>
                  <td className='tw:text-center'>
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
                  <td className='tw:text-[11.2px] tw:font-semibold'>
                    {product.title}

                    {product.asin && (
                      <>
                        <br />
                        <span className='tw:text-[var(--bs-secondary-color)] tw:text-[11.2px] tw:font-normal'>ASIN: {product.asin}</span>
                      </>
                    )}
                    {product.barcode && (
                      <>
                        <br />
                        <span className='tw:text-[var(--bs-secondary-color)] tw:text-[11.2px] tw:font-normal'>UPC: {product.barcode}</span>
                      </>
                    )}
                  </td>
                  <td className='tw:text-center tw:text-nowrap'>{product.sku}</td>
                  <td className='tw:text-center tw:text-nowrap'>{FormatCurrency(state.currentRegion, product.orderQty * product.sellerCost || 0)}</td>
                  <td className='tw:text-center tw:text-nowrap'>
                    <Input
                      type='number'
                      onWheel={(e) => e.currentTarget.blur()}
                      className='tw:text-[13px] tw:m-0 tw:mx-auto'
                      style={{ maxWidth: '60px' }}
                      placeholder='Qty'
                      id='newOrderQty'
                      name='newOrderQty'
                      bsSize='sm'
                      min={0}
                      value={product.orderQty || 0}
                      onChange={(e) => {
                        const trEl = e.target.closest('tr')
                        if (trEl) trEl.style.backgroundColor = 'color-mix(in srgb, var(--warning) 25%, transparent)'
                        if (parseInt(e.target.value) <= 0 || parseInt(e.target.value) < product.receivedQty + product.inboundQty) {
                          setError(true)
                          e.target.classList.remove('tw:border-warning')
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
                  <td className='tw:text-[13px] tw:text-center tw:text-nowrap'>{FormatIntNumber(state.currentRegion, product.inboundQty)}</td>
                  <td className='tw:text-[13px] tw:text-center tw:text-nowrap'>{FormatIntNumber(state.currentRegion, product.receivedQty)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className='tw:mt-4 tw:flex tw:justify-end tw:items-center tw:gap-2'>
          <Button type='button' color='light' className='tw:text-[11.2px]' onClick={handleClose}>
            Cancel
          </Button>
          <Button disabled={loading || error ? true : false} type='button' color='success' className='tw:text-[11.2px]' onClick={handleEditOrderedQtyFromPO}>
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
