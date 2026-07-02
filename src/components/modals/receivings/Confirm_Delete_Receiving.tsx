 
import { useContext, useState } from 'react'

import AppContext from '@context/AppContext'
import { DeleteReceivingModalType } from '@pages/receivings'
import axios from 'axios'
import { toast } from 'react-toastify'
import { Button, Modal, ModalBody, ModalHeader, Row, Spinner } from '@/components/migration-ui'

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
          <p className='tw:m-0 tw:text-[16.25px] tw:font-semibold'>
            Receiving: <span className='tw:text-primary'>{orderNumber}</span>
          </p>
          <div className='tw:mt-4 tw:flex tw:justify-end tw:items-center tw:gap-2'>
            <Button type='button' color='light' onClick={handleClose}>
              Cancel
            </Button>
            <Button disabled={isLoading} type='button' color='danger' onClick={handleDeleteReceiving}>
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
