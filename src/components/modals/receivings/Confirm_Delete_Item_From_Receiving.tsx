/* eslint-disable @next/next/no-img-element */
import React, { useContext, useState } from 'react'

import { DeleteSKUFromReceivingModalType } from '@components/receiving/ReceivingType'
import AppContext from '@context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import { Button, Modal, ModalBody, ModalHeader, Row, Spinner } from 'reactstrap'

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
          <p className='mb-2 fs-5 fw-semibold'>
            Receiving: <span className='text-primary'>{orderNumber}</span>
          </p>
          <div className='my-2 d-flex flex-row'>
            <div>
              <p className='fw-bold mb-1'>
                PO: <span className='text-primary'>{poNumber}</span>
              </p>
              <p className='fw-semibold mb-0'>{title}</p>
              <p className='fw-normal mb-0'>SKU: {sku}</p>
            </div>
          </div>
          <div className='mt-3 d-flex justify-content-end align-items-center gap-2'>
            <Button type='button' color='light' className='fs-7' onClick={handleClose}>
              Cancel
            </Button>
            <Button disabled={loading} type='button' color='danger' className='fs-7' onClick={handleDeleteFromSkuList}>
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
