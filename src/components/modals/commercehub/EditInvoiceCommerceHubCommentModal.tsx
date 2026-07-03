import { useContext, useState } from 'react'

import AppContext from '@context/AppContext'
import axios from 'axios'
import { DebounceInput } from 'react-debounce-input'
import { toast } from '@/lib/toast'
import { Button } from '@shadcn/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@shadcn/ui/dialog'
import { Spinner } from '@shadcn/ui/spinner'

type EditComment = {
  show: boolean
  orderId: number
  comment: string
}

type Props = {
  editCommentModal: EditComment
  setEditCommentModal: (prev: EditComment) => void
  mutate: () => void
}

const EditInvoiceCommerceHubCommentModal = ({ editCommentModal, setEditCommentModal, mutate }: Props) => {
  const { state }: any = useContext(AppContext)
  const [newComment, setnewComment] = useState(editCommentModal.comment)
  const [isLoading, setisLoading] = useState(false)

  const hanldeEditFBAShipmentName = async () => {
    setisLoading(true)
    const editComment = toast.loading('Saving Note...')
    try {
      const response = await axios
        .post(`/api/commerceHub/editInvoiceComment?region=${state.currentRegion}&businessId=${state.user.businessId}`, {
          id: editCommentModal.orderId,
          comment: newComment,
        })
        .then((res) => res.data)

      if (!response.error) {
        toast.update(editComment, {
          render: response.message,
          type: 'success',
          isLoading: false,
          autoClose: 3000,
        })
        setEditCommentModal({
          show: false,
          orderId: 0,
          comment: '',
        })
        mutate()
      } else {
        toast.update(editComment, {
          render: response.message,
          type: 'error',
          isLoading: false,
          autoClose: 3000,
        })
      }
    } catch (error) {
      toast.update(editComment, {
        render: 'Error saving note',
        type: 'error',
        isLoading: false,
        autoClose: 3000,
      })
    }
    setisLoading(false)
  }

  return (
    <Dialog
      open={!!editCommentModal.show}
      onOpenChange={(open) => {
        if (!open)
          setEditCommentModal({
            show: false,
            orderId: 0,
            comment: '',
          })
      }}>
      <DialogContent aria-describedby={undefined} className='max-h-[90vh] overflow-y-auto sm:!max-w-lg' id='editInvoiceCommentModal'>
        <DialogHeader className='pr-6' id='myModalLabel'>
          <DialogTitle>Invoice Note</DialogTitle>
        </DialogHeader>
        <div className='flex flex-wrap -mx-3'>
          <div className='px-3 md:w-full mt-2'>
            <DebounceInput
              element='textarea'
              minLength={3}
              debounceTimeout={700}
              className='h-9 w-full min-w-0 rounded-md border border-input bg-input px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 text-[11.2px]'
              placeholder='Comment ...'
              id='search-options'
              value={editCommentModal.comment}
              onKeyDown={(e) => (e.key == 'Enter' ? e.preventDefault() : null)}
              onChange={(e) => setnewComment(e.target.value)}
            />
          </div>
          <div className='mt-6 flex flex-row gap-4 justify-end'>
            <Button
              disabled={isLoading}
              type='button'
              variant='light'
              onClick={() => {
                setEditCommentModal({
                  show: false,
                  orderId: 0,
                  comment: '',
                })
              }}>
              Cancel
            </Button>
            <Button disabled={isLoading} type='button' variant='success' onClick={hanldeEditFBAShipmentName}>
              {isLoading ? <Spinner className='text-white' /> : 'Save'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default EditInvoiceCommerceHubCommentModal
