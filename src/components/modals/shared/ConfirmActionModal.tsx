 
import { useState } from 'react'

import { Button, Modal, ModalBody, ModalFooter, ModalHeader, Row, Spinner } from '@/components/migration-ui'

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
    <Modal fade={false} size='md' id='confirmDeleteReceiving' isOpen={isOpen} toggle={handleClose}>
      <ModalHeader toggle={handleClose} className='modal-title' id='myModalLabel'>
        {headerText}
      </ModalHeader>
      <ModalBody>
        <Row>
          <p className='tw:mb-2 tw:text-[16.25px] tw:font-semibold'>
            {primaryText} {primaryTextSub && <span className='tw:text-primary'>{primaryTextSub}</span>}
          </p>
          {descriptionText && <p className='tw:mb-1 tw:text-[var(--bs-secondary-color)]'>{descriptionText}</p>}
        </Row>
      </ModalBody>
      <ModalFooter>
        <div className='tw:w-full tw:flex tw:flex-row tw:gap-2 tw:justify-between tw:items-center'>
          <div></div>
          <div className='tw:flex tw:flex-row tw:gap-2 tw:justify-end'>
            <Button disabled={isLoading} type='button' color='light' className='tw:text-[11.2px]' onClick={handleClose}>
              Cancel
            </Button>
            <Button disabled={isLoading} type='button' color={isDeleteAction ? 'danger' : 'success'} className='tw:text-[11.2px]' onClick={handleConfirmAction}>
              {isLoading ? (
                <span>
                  <Spinner color='light' size={'sm'} /> {loadingText}
                </span>
              ) : (
                confirmText
              )}
            </Button>
          </div>
        </div>
      </ModalFooter>
    </Modal>
  )
}

export default ConfirmActionModal
