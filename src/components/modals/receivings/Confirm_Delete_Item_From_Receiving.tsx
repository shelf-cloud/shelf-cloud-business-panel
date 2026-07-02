 
import { useContext, useState } from 'react'

import { DeleteSKUFromReceivingModalType } from '@components/receiving/ReceivingType'
import AppContext from '@context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import { Button, Modal, ModalBody, ModalHeader, Row, Spinner } from '@/components/migration-ui'

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
    <Modal fade={false} size='md' id='confirmDeleteItemFromReceiving' isOpen={show} toggle={handleClose}>
      <ModalHeader toggle={handleClose} className='modal-title' id='confirmDeleteItemFromReceivingModalLabel'>
        Confirm Delete Item From Receiving
      </ModalHeader>
      <ModalBody>
        <Row>
          <p className='tw:mb-2 tw:text-[16.25px] tw:font-semibold'>
            Receiving: <span className='tw:text-primary'>{orderNumber}</span>
          </p>
          <div className='tw:my-2 tw:flex tw:flex-row'>
            <div>
              <p className='tw:font-bold tw:mb-1'>
                PO: <span className='tw:text-primary'>{poNumber}</span>
              </p>
              <p className='tw:font-semibold tw:mb-0'>{title}</p>
              <p className='tw:font-normal tw:mb-0'>SKU: {sku}</p>
            </div>
          </div>
          <div className='tw:mt-4 tw:flex tw:justify-end tw:items-center tw:gap-2'>
            <Button type='button' color='light' onClick={handleClose}>
              Cancel
            </Button>
            <Button disabled={loading} type='button' color='danger' onClick={handleDeleteFromSkuList}>
              {loading ? (
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

export default Confirm_Delete_Item_From_Receiving
