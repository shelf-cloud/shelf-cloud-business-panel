 
import { useContext, useState } from 'react'

import AppContext from '@context/AppContext'
import { FormatIntNumber } from '@lib/FormatNumbers'
import { ShipmentOrderItem } from '@typings'
import axios from 'axios'
import { toast } from '@/lib/toast'
import { Button } from '@shadcn/ui/button'
import { Input } from '@shadcn/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@shadcn/ui/dialog'
import { Spinner } from '@shadcn/ui/spinner'

type Props = {
  showEditOrderQty: {
    show: boolean
    receivingId: number
    orderNumber: string
    receivingItems: ShipmentOrderItem[]
  }
  setshowEditOrderQty: (prev: any) => void
  mutateReceivings?: () => void
}

const EditManualReceivingLog = ({ showEditOrderQty, setshowEditOrderQty, mutateReceivings }: Props) => {
  const { state }: any = useContext(AppContext)
  const [newOrderedQtyItems, setnewOrderedQtyItems] = useState(structuredClone(showEditOrderQty.receivingItems))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)

  const handleEditManualReceiving = async () => {
    setLoading(true)

    const addSkusToManualReceiving = toast.loading('Adding Products to Manual Receiving...')

    const response = await axios.post(`/api/receivings/editManualReceiving?region=${state.currentRegion}&businessId=${state.user.businessId}`, {
      receivingId: showEditOrderQty.receivingId,
      orderNumber: showEditOrderQty.orderNumber,
      receivingItems: newOrderedQtyItems,
    })

    if (!response.data.error) {
      toast.update(addSkusToManualReceiving, {
        render: response.data.message,
        type: 'success',
        isLoading: false,
        autoClose: 3000,
      })
      mutateReceivings && mutateReceivings()
      setshowEditOrderQty({
        show: false,
        receivingId: 0,
        orderNumber: '',
        receivingItems: [],
      })
    } else {
      toast.update(addSkusToManualReceiving, {
        render: response.data.message,
        type: 'error',
        isLoading: false,
        autoClose: 3000,
      })
    }

    setLoading(false)
  }

  return (
    <Dialog
      open={!!showEditOrderQty.show}
      onOpenChange={(open) => {
        if (!open) {
          setshowEditOrderQty({
            show: false,
            receivingId: 0,
            orderNumber: '',
            receivingItems: [],
          })
        }
      }}>
      <DialogContent aria-describedby={undefined} className='max-h-[90vh] overflow-y-auto sm:!max-w-3xl' id='confirmDelete'>
        <DialogHeader className='pr-6' id='myModalLabel'>
          <DialogTitle>Edit Receiving Quantities</DialogTitle>
        </DialogHeader>
        <div>
          <div className='flex flex-wrap -mx-3'>
          <h5 className='text-[16.25px] mb-6 font-semibold text-primary'>
            Purchase Order: <span className='text-[16.25px] font-bold text-black'>{showEditOrderQty.orderNumber}</span>
          </h5>
          <div className='overflow-x-auto'>
            <table className='w-full align-middle mb-0 [&_th]:px-2 [&_th]:py-1 [&_td]:px-2 [&_td]:py-1'>
              <thead className='bg-[color:var(--vz-light)]'>
                <tr>
                  <th scope='col'>Title</th>
                  <th className='text-center' scope='col'>
                    SKU
                  </th>
                  <th className='text-center' scope='col'>
                    Qty
                  </th>
                  <th className='text-center' scope='col'>
                    Qty Received
                  </th>
                </tr>
              </thead>
              <tbody className='text-[11.2px]'>
                {newOrderedQtyItems?.map((product: ShipmentOrderItem, key: number) => (
                  <tr key={`${key}-${product.sku}`} className='border-b border-[color:var(--border)] py-2'>
                    <td className='font-semibold'>{product.name || product.title}</td>
                    <td className='text-center text-nowrap'>{product.sku}</td>
                    <td className='text-center text-nowrap'>
                      <Input
                        type='number'
                        onWheel={(e) => e.currentTarget.blur()}
                        className='h-8 text-xs mx-auto text-center'
                        style={{ maxWidth: '80px' }}
                        placeholder='Qty'
                        id='newOrderQty'
                        name='newOrderQty'
                        min={0}
                        value={product.quantity || 0}
                        onChange={(e) => {
                          e.target.closest('tr')?.style.setProperty('background-color', 'color-mix(in srgb, var(--warning) 22%, var(--card))')
                          if (parseInt(e.target.value) <= 0 || parseInt(e.target.value) < product.qtyReceived!) {
                            setError(true)
                            e.target.classList.remove('border-warning')
                          } else {
                            setError(false)
                          }
                          const newOrderedQty = [...newOrderedQtyItems]
                          newOrderedQty[key].quantity = parseInt(e.target.value)
                          setnewOrderedQtyItems(newOrderedQty)
                        }}
                        aria-invalid={(product.quantity <= 0 || product.quantity < product.qtyReceived!) || undefined}
                      />
                    </td>
                    <td className='text-center text-nowrap'>{FormatIntNumber(state.currentRegion, product.qtyReceived!)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className='flex flex-wrap -mx-3'>
            <div className='text-end mt-6'>
              <Button disabled={loading || error ? true : false} type='button' variant='success' onClick={handleEditManualReceiving}>
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
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default EditManualReceivingLog
