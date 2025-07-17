/* eslint-disable @next/next/no-img-element */
import { useContext, useState } from 'react'

import AppContext from '@context/AppContext'
import { DeleteReceivingModalType } from '@pages/receivings'
import axios from 'axios'
import { toast } from 'react-toastify'
import { Button, Modal, ModalBody, ModalHeader, Row, Spinner } from 'reactstrap'

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
    <Modal fade={false} size='md' id='confirmDeleteReceiving' isOpen={show} toggle={handleClose}>
      <ModalHeader toggle={handleClose} className='modal-title' id='myModalLabel'>
        Confirm Delete Receiving
      </ModalHeader>
      <ModalBody>
        <Row>
          <p className='m-0 fs-5 fw-semibold'>
            Receiving: <span className='text-primary'>{orderNumber}</span>
          </p>
          <div className='mt-3 d-flex justify-content-end align-items-center gap-2'>
            <Button type='button' color='light' className='fs-7' onClick={handleClose}>
              Cancel
            </Button>
            <Button disabled={isLoading} type='button' color='danger' className='fs-7' onClick={handleDeleteReceiving}>
              {isLoading ? (
                <span>
                  <Spinner color='light' size={'sm'} /> Deleting...
                </span>
              ) : (
                'Delete'
              )}
            </Button>
          </div>
        </Row>
      </ModalBody>
    </Modal>
  )
}

export default Confirm_Delete_Receiving
