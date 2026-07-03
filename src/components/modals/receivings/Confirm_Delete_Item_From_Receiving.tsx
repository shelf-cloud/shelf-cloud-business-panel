 
import { useContext, useState } from 'react'

import { DeleteSKUFromReceivingModalType } from '@components/receiving/ReceivingType'
import AppContext from '@context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import { Button } from '@shadcn/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@shadcn/ui/dialog'
import { Spinner } from '@shadcn/ui/spinner'

type Props = {
  deleteSKUModal: DeleteSKUFromReceivingModalType
  setDeleteSKUModal: (prev: DeleteSKUFromReceivingModalType) => void
  mutateReceivings?: () => void
}

const Confirm_Delete_Item_From_Receiving = ({ deleteSKUModal, setDeleteSKUModal, mutateReceivings }: Props) => {
  const { show, orderId, orderNumber, sku, title, poNumber, poId, isReceivingFromPo } = deleteSKUModal
  const { state }: any = useContext(AppContext)
  const [loading, setLoading] = useState(false)

  const handleClose = () => {
    setDeleteSKUModal({
      show: false,
      orderId: 0,
      orderNumber: '',
      sku: '',
      title: '',
      poNumber: '',
      poId: 0,
      isReceivingFromPo: false,
    })
  }

  const handleDeleteFromSkuList = async () => {
    setLoading(true)
    const response = await axios.post(`/api/receivings/deleteSkufromReceiving?region=${state.currentRegion}&businessId=${state.user.businessId}`, {
      orderId,
      orderNumber,
      sku,
      poId,
      isReceivingFromPo,
    })
    if (!response.data.error) {
      mutateReceivings && mutateReceivings()
      handleClose()
      toast.success(response.data.msg)
    } else {
      toast.error(response.data.msg)
    }
    setLoading(false)
  }

  return (
    <Dialog
      open={!!show}
      onOpenChange={(open) => {
        if (!open) handleClose()
      }}>
      <DialogContent aria-describedby={undefined} className='max-h-[90vh] overflow-y-auto sm:!max-w-lg'>
        <DialogHeader className='pr-6'>
          <DialogTitle id='confirmDeleteItemFromReceivingModalLabel'>Confirm Delete Item From Receiving</DialogTitle>
        </DialogHeader>
        <div className='flex flex-wrap -mx-3'>
          <p className='mb-2 text-[16.25px] font-semibold'>
            Receiving: <span className='text-primary'>{orderNumber}</span>
          </p>
          <div className='my-2 flex flex-row'>
            <div>
              <p className='font-bold mb-1'>
                PO: <span className='text-primary'>{poNumber}</span>
              </p>
              <p className='font-semibold mb-0'>{title}</p>
              <p className='font-normal mb-0'>SKU: {sku}</p>
            </div>
          </div>
          <div className='mt-4 flex justify-end items-center gap-2'>
            <Button type='button' variant='light' onClick={handleClose}>
              Cancel
            </Button>
            <Button disabled={loading} type='button' variant='destructive' onClick={handleDeleteFromSkuList}>
              {loading ? (
                <span>
                  <Spinner className='text-white' /> Deleting...
                </span>
              ) : (
                'Delete'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default Confirm_Delete_Item_From_Receiving
