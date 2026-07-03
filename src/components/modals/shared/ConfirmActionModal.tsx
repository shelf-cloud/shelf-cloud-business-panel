 
import { useState } from 'react'

import { Button } from '@shadcn/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@shadcn/ui/dialog'
import { Spinner } from '@shadcn/ui/spinner'

type Props = {
  isOpen: boolean
  headerText: string
  primaryText: string
  primaryTextSub?: string
  descriptionText?: string
  confirmText: string
  loadingText: string
  isDeleteAction?: boolean
  handleSubmit: () => Promise<{ error: boolean }>
  handleClose: () => void
}

const ConfirmActionModal = ({
  isOpen,
  headerText,
  primaryText,
  primaryTextSub,
  descriptionText,
  confirmText,
  loadingText,
  isDeleteAction = false,
  handleSubmit,
  handleClose,
}: Props) => {
  const [isLoading, setisLoading] = useState(false)

  const handleConfirmAction = async () => {
    setisLoading(true)
    await handleSubmit().then(() => {
      handleClose()
      setisLoading(false)
    })
  }

  return (
    <Dialog open={!!isOpen} onOpenChange={(open) => { if (!open) handleClose() }}>
      <DialogContent aria-describedby={undefined} className='max-h-[90vh] overflow-y-auto sm:!max-w-lg' id='confirmDeleteReceiving'>
        <DialogHeader className='pr-6 modal-title' id='myModalLabel'>
          <DialogTitle>{headerText}</DialogTitle>
        </DialogHeader>
        <div>
          <div className='flex flex-wrap -mx-3'>
            <p className='mb-2 text-[16.25px] font-semibold'>
              {primaryText} {primaryTextSub && <span className='text-primary'>{primaryTextSub}</span>}
            </p>
            {descriptionText && <p className='mb-1 text-[var(--bs-secondary-color)]'>{descriptionText}</p>}
          </div>
        </div>
        <DialogFooter className='items-center'>
          <div className='w-full flex flex-row gap-2 justify-between items-center'>
            <div></div>
            <div className='flex flex-row gap-2 justify-end'>
              <Button disabled={isLoading} type='button' variant='light' className='text-[11.2px]' onClick={handleClose}>
                Cancel
              </Button>
              <Button disabled={isLoading} type='button' variant={isDeleteAction ? 'destructive' : 'success'} className='text-[11.2px]' onClick={handleConfirmAction}>
                {isLoading ? (
                  <span>
                    <Spinner className='text-white' /> {loadingText}
                  </span>
                ) : (
                  confirmText
                )}
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default ConfirmActionModal
