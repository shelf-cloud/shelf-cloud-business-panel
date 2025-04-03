/* eslint-disable @next/next/no-img-element */
import React, { useState } from 'react'
import { Button, Modal, ModalBody, ModalFooter, ModalHeader, Row, Spinner } from 'reactstrap'

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

const ConfirmActionModal = ({ isOpen, headerText, primaryText, primaryTextSub, descriptionText, confirmText, loadingText, isDeleteAction = false, handleSubmit, handleClose }: Props) => {
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
          <p className='mb-2 fs-5 fw-semibold'>
            {primaryText} {primaryTextSub && <span className='text-primary'>{primaryTextSub}</span>}
          </p>
          {descriptionText && <p className='mb-1 text-muted'>{descriptionText}</p>}
        </Row>
      </ModalBody>
      <ModalFooter>
        <div className='w-100 d-flex flex-row gap-2 justify-content-between align-items-center'>
          <div></div>
          <div className='d-flex flex-row gap-2 justify-content-end'>
            <Button disabled={isLoading} type='button' color='light' className='fs-7' onClick={handleClose}>
              Cancel
            </Button>
            <Button disabled={isLoading} type='button' color={isDeleteAction ? 'danger' : 'success'} className='fs-7' onClick={handleConfirmAction}>
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
