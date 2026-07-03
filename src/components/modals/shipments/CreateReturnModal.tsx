 
import { useContext, useState } from 'react'

import AppContext from '@context/AppContext'
import { Shipment } from '@typesTs/shipments/shipments'
import axios from 'axios'
import { toast } from '@/lib/toast'
import { Button } from '@shadcn/ui/button'
import { Dialog, DialogContent, DialogHeader } from '@shadcn/ui/dialog'
import { NativeSelect } from '@shadcn/ui/native-select'
import { Spinner } from '@shadcn/ui/spinner'

type Props = {
  data: Shipment
  mutateShipments?: () => void
}

function CreateReturnModal({ data, mutateShipments }: Props) {
  const { state, setShowCreateReturnModal }: any = useContext(AppContext)
  const [loadingConfirmation, setLoadingConfirmation] = useState(false)
  const [returnItemsList, setReturnItemsList] = useState<any>(
    data.orderItems.map((item: any) => {
      return {
        sku: item.sku,
        name: item.name,
        quantity: Number(item.quantity),
        unitPrice: 0,
      }
    })
  )
  const [errorMsg, setErrorMsg] = useState(false)

  const handleOnChangeQty = (e: any, sku: string) => {
    setReturnItemsList(
      returnItemsList.map((item: any) => {
        if (item.sku == sku) {
          item.quantity = Number(e.target.value)
        }
        return item
      })
    )
  }

  const handleConfirmReturn = async () => {
    setErrorMsg(false)
    setLoadingConfirmation(true)
    const finalReturnItems = returnItemsList.filter((item: any) => item.quantity > 0)
    if (finalReturnItems.length == 0) {
      setErrorMsg(true)
      setLoadingConfirmation(false)
      return
    }

    const response = await axios.post(
      `api/createReturnFromOrder?region=${state.currentRegion}&businessId=${state.user.businessId}&orderId=${state.modalCreateReturnInfo.orderId}`,
      {
        returnItems: finalReturnItems,
      }
    )

    if (!response.data.error) {
      setShowCreateReturnModal(false)
      setLoadingConfirmation(false)
      toast.success(response.data.msg)
      mutateShipments && mutateShipments()
    } else {
      setLoadingConfirmation(false)
      toast.error(response.data.msg)
    }
  }

  return (
    <Dialog
      open={!!state.showCreateReturnModal}
      onOpenChange={(open) => {
        if (!open) setShowCreateReturnModal(!state.showCreateReturnModal)
      }}>
      <DialogContent id='myModal' aria-describedby={undefined} className='max-h-[90vh] overflow-y-auto sm:!max-w-5xl'>
      <DialogHeader className='pr-6'>
        <h3 className='m-0' id='myModalLabel'>
          Create Return
        </h3>
      </DialogHeader>
      <div>
        <h4 className='font-normal text-[16.25px] text-muted-foreground'>
          Order: <span className='font-bold text-black'>{data?.orderNumber}</span>
        </h4>
        <h4 className='font-normal text-[16.25px] text-muted-foreground'>
          Status: <span className='font-bold text-black capitalize'>{data?.orderStatus}</span>
        </h4>
        {data?.totalItems == 1 ? (
          <table className='w-full align-middle text-[13px] [&_th]:px-2 [&_th]:py-1 [&_td]:px-2 [&_td]:py-1 [&_tbody_tr:nth-child(odd)]:bg-[var(--vz-light)]'>
            <thead className='bg-[color:var(--vz-light)]'>
              <tr className='font-bold'>
                <th>Item</th>
                <th className='text-center'>Qty</th>
              </tr>
            </thead>
            <tbody>
              {data?.orderItems.map((item: any) => (
                <tr key={item.sku}>
                  <td>
                    <span className='font-bold'>{item.name || item.title}</span>
                    <br />
                    SKU: {item.sku}
                  </td>
                  <td className='font-bold text-center'>{item.quantity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <table className='w-full align-middle text-[13px] [&_th]:px-2 [&_th]:py-1 [&_td]:px-2 [&_td]:py-1 [&_tbody_tr:nth-child(odd)]:bg-[var(--vz-light)]'>
            <thead className='bg-[color:var(--vz-light)]'>
              <tr className='font-bold'>
                <th>Item</th>
                <th className='text-center'>Qty</th>
              </tr>
            </thead>
            <tbody>
              {data?.orderItems.map((item: any, index: number) => (
                <tr key={item.sku}>
                  <td>
                    <span className='font-bold'>{item.name || item.title}</span>
                    <br />
                    SKU: {item.sku}
                  </td>
                  <td className='font-bold text-center'>
                    <div className='flex justify-center items-center flex-nowrap gap-4 text-[13px]'>
                      <NativeSelect className='text-[13px]' value={returnItemsList[index].quantity} style={{ width: '80px' }} onChange={(e) => handleOnChangeQty(e, item.sku)}>
                        <option key={0} value={0}>
                          {0}
                        </option>
                        {Array(parseInt(item.quantity))
                          .fill(0)
                          .map((_item: any, index: number) => (
                            <option key={index + 1} value={index + 1}>
                              {index + 1}
                            </option>
                          ))}
                      </NativeSelect>
                      <p className='m-0'>of</p>
                      {item.quantity}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {errorMsg && (
          <div className='flex justify-start items-center'>
            <p className='text-danger text-[13px]'>You must select at least 1 Quantity to return!</p>
          </div>
        )}
        <div className='flex justify-end items-center'>
          <Button disabled={loadingConfirmation} variant='success' onClick={() => handleConfirmReturn()}>
            {loadingConfirmation ? <Spinner className='size-6 text-white' /> : 'Confirm Return'}
          </Button>
        </div>
      </div>
      </DialogContent>
    </Dialog>
  )
}

export default CreateReturnModal
