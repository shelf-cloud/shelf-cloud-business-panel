/* eslint-disable @next/next/no-img-element */
import React, { useContext } from 'react'
import { Button, Modal, ModalBody, ModalHeader, Row, Spinner } from 'reactstrap'
import { toast } from 'react-toastify'
import axios from 'axios'
import AppContext from '@context/AppContext'

type Props = {
  showDeleteModal: {
    show: boolean
    orderId: number
    orderNumber: string
  }
  setshowDeleteModal: (prev: any) => void
  loading: boolean
  setLoading: (state: boolean) => void
  mutateReturns: () => void
}

const Confirm_Delete_Receiving = ({ showDeleteModal, setshowDeleteModal, loading, setLoading, mutateReturns }: Props) => {
  const { state }: any = useContext(AppContext)

  const handleDeleteReceiving = async () => {
    setLoading(true)
    const response = await axios.post(`/api/receivings/deleteReceiving?region=${state.currentRegion}&businessId=${state.user.businessId}`, {
      orderId: showDeleteModal.orderId,
      orderNumber: showDeleteModal.orderNumber,
    })
    if (!response.data.error) {
      mutateReturns()
      setshowDeleteModal({
        show: false,
        orderId: 0,
        orderNumber: '',
      })
      toast.success(response.data.msg)
    } else {
      toast.error(response.data.msg)
    }
    setLoading(false)
  }

  return (
    <Modal
      fade={false}
      size='md'
      id='confirmDelete'
      isOpen={showDeleteModal.show}
      toggle={() => {
        setshowDeleteModal({
          show: false,
          orderId: 0,
          orderNumber: '',
        })
      }}>
      <ModalHeader
        toggle={() => {
          setshowDeleteModal({
            show: false,
            orderId: 0,
            orderNumber: '',
          })
        }}
        className='modal-title'
        id='myModalLabel'>
        Confirm Delete Receiving
      </ModalHeader>
      <ModalBody>
        <Row>
          <h5 className='fs-4 mb-0 fw-semibold text-primary'>
            Receiving: <span className='fs-4 fw-bold text-black'>{showDeleteModal.orderNumber}</span>
          </h5>
          <Row md={12}>
            <div className='text-end mt-2'>
              <Button disabled={loading} type='button' color='danger' className='btn' onClick={handleDeleteReceiving}>
                {loading ? <Spinner color='#fff' /> : 'Delete'}
              </Button>
            </div>
          </Row>
        </Row>
      </ModalBody>
    </Modal>
  )
}

export default Confirm_Delete_Receiving
