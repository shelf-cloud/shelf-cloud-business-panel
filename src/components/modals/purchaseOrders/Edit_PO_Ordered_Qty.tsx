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
import { Button } from '@shadcn/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@shadcn/ui/dialog'
import { Input } from '@shadcn/ui/input'
import { Spinner } from '@shadcn/ui/spinner'
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
    <Dialog open={!!show} onOpenChange={(open) => { if (!open) handleClose() }}>
      <DialogContent id='confirmDelete' aria-describedby={undefined} className='max-h-[90vh] overflow-y-auto sm:!max-w-3xl'>
        <DialogHeader className='pr-6'>
          <DialogTitle className='modal-title' id='myModalLabel'>
            Edit PO Quantities
          </DialogTitle>
        </DialogHeader>
        <div>
        <p className='m-0 text-[16.25px] font-semibold'>
          Purchase Order: <span className='text-primary'>{orderNumber}</span>
        </p>
        {hasSplitting && (
          <p className='text-[16.25px] font-semibold'>
            In Split: <span className='text-primary'>{split?.splitName}</span>
          </p>
        )}
        <div className='mt-2 overflow-x-auto'>
          <table className='w-full align-middle mb-0 [&_th]:px-2 [&_th]:py-1 [&_td]:px-2 [&_td]:py-1'>
            <thead className='bg-[color:var(--vz-light)]'>
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
            <tbody className='text-[11.2px]'>
              {newOrderedQtyItems?.map((product: PurchaseOrderItem, key: number) => (
                <tr key={`${key}-${product.sku}`} className='border-b py-2'>
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
                  <td className='text-[11.2px] font-semibold'>
                    {product.title}

                    {product.asin && (
                      <>
                        <br />
                        <span className='text-[var(--bs-secondary-color)] text-[11.2px] font-normal'>ASIN: {product.asin}</span>
                      </>
                    )}
                    {product.barcode && (
                      <>
                        <br />
                        <span className='text-[var(--bs-secondary-color)] text-[11.2px] font-normal'>UPC: {product.barcode}</span>
                      </>
                    )}
                  </td>
                  <td className='text-center text-nowrap'>{product.sku}</td>
                  <td className='text-center text-nowrap'>{FormatCurrency(state.currentRegion, product.orderQty * product.sellerCost || 0)}</td>
                  <td className='text-center text-nowrap'>
                    <Input
                      type='number'
                      onWheel={(e) => e.currentTarget.blur()}
                      className='text-[13px] m-0 mx-auto h-8 text-xs'
                      style={{ maxWidth: '60px' }}
                      placeholder='Qty'
                      id='newOrderQty'
                      name='newOrderQty'
                      min={0}
                      value={product.orderQty || 0}
                      onChange={(e) => {
                        const trEl = e.target.closest('tr')
                        if (trEl) trEl.style.backgroundColor = 'color-mix(in srgb, var(--warning) 25%, transparent)'
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
                      aria-invalid={(product.orderQty <= 0 || product.orderQty < product.receivedQty + product.inboundQty ? true : false) || undefined}
                    />
                  </td>
                  <td className='text-[13px] text-center text-nowrap'>{FormatIntNumber(state.currentRegion, product.inboundQty)}</td>
                  <td className='text-[13px] text-center text-nowrap'>{FormatIntNumber(state.currentRegion, product.receivedQty)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className='mt-4 flex justify-end items-center gap-2'>
          <Button type='button' variant='light' className='text-[11.2px]' onClick={handleClose}>
            Cancel
          </Button>
          <Button disabled={loading || error ? true : false} type='button' variant='success' className='text-[11.2px]' onClick={handleEditOrderedQtyFromPO}>
            {loading ? (
              <span>
                <Spinner className='text-white' /> Saving...
              </span>
            ) : (
              'Save Changes'
            )}
          </Button>
        </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default Edit_PO_Ordered_Qty
