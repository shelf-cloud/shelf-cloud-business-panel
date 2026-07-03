 
import { useContext, useState } from 'react'

import AppContext from '@context/AppContext'
import { DeleteReceivingModalType } from '@pages/receivings'
import axios from 'axios'
import { toast } from 'react-toastify'
import { Button } from '@shadcn/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@shadcn/ui/dialog'
import { Spinner } from '@shadcn/ui/spinner'

type Props = {
  showDeleteModal: DeleteReceivingModalType
  setshowDeleteModal: (prev: DeleteReceivingModalType) => void
  mutateReceivings: () => void
}

const Confirm_Delete_Receiving = ({ showDeleteModal, setshowDeleteModal, mutateReceivings }: Props) => {
  const { show, orderId, orderNumber } = showDeleteModal
  const { state }: any = useContext(AppContext)
  const [isLoading, setIsLoading] = useState(false)

  const handleClose = () => {
    setshowDeleteModal({
      show: false,
      orderId: 0,
      orderNumber: '',
    })
  }

  const handleDeleteReceiving = async () => {
    setIsLoading(true)
    const { data } = await axios.post(`/api/receivings/deleteReceiving?region=${state.currentRegion}&businessId=${state.user.businessId}`, {
      orderId: orderId,
      orderNumber: orderNumber,
    })
    if (!data.error) {
      mutateReceivings()
      toast.success(data.message)
      handleClose()
    } else {
      toast.error(data.message)
    }
    setIsLoading(false)
  }

  return (
    <Dialog open={!!show} onOpenChange={(open) => { if (!open) handleClose() }}>
      <DialogContent aria-describedby={undefined} className='max-h-[90vh] overflow-y-auto sm:!max-w-lg' id='confirmDeleteReceiving'>
        <DialogHeader className='pr-6'>
          <DialogTitle className='modal-title' id='myModalLabel'>
            Confirm Delete Receiving
          </DialogTitle>
        </DialogHeader>
        <div>
          <p className='m-0 text-[16.25px] font-semibold'>
            Receiving: <span className='text-primary'>{orderNumber}</span>
          </p>
          <div className='mt-4 flex justify-end items-center gap-2'>
            <Button type='button' variant='light' onClick={handleClose}>
              Cancel
            </Button>
            <Button disabled={isLoading} type='button' variant='destructive' onClick={handleDeleteReceiving}>
              {isLoading ? (
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

export default Confirm_Delete_Receiving
