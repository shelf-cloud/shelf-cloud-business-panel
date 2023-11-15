/* eslint-disable @next/next/no-img-element */
import React, { useContext } from 'react'
import { Button, Modal, ModalBody, ModalHeader, Row, Spinner } from 'reactstrap'
import { toast } from 'react-toastify'
import { useSWRConfig } from 'swr'
import axios from 'axios'
import AppContext from '@context/AppContext'

type Props = {
  showDeleteModal: {
    show: boolean
    orderId: number
    orderNumber: string
    sku: string
    title: string
    quantity: number
  }
  setshowDeleteModal: (prev: any) => void
  loading: boolean
  setLoading: (state: boolean) => void
  apiMutateLink?: string
}

const Confirm_Delete_Item_From_Receiving = ({ showDeleteModal, setshowDeleteModal, loading, setLoading, apiMutateLink }: Props) => {
  const { state }: any = useContext(AppContext)
  const { mutate } = useSWRConfig()

  const handleDeleteFromSkuList = async () => {
    setLoading(true)
    const response = await axios.post(`/api/receivings/deleteSkufromReceiving?region=${state.currentRegion}&businessId=${state.user.businessId}`, {
      orderId: showDeleteModal.orderId,
      orderNumber: showDeleteModal.orderNumber,
      sku: showDeleteModal.sku,
    })
    if (!response.data.error) {
      mutate(apiMutateLink)
      setshowDeleteModal({
        show: false,
        orderId: 0,
        orderNumber: '',
        sku: '',
        title: '',
        quantity: 0,
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
          sku: '',
          title: '',
          quantity: 0,
        })
      }}>
      <ModalHeader
        toggle={() => {
          setshowDeleteModal({
            show: false,
            orderId: 0,
            orderNumber: '',
            sku: '',
            title: '',
            quantity: 0,
          })
        }}
        className='modal-title'
        id='myModalLabel'>
        Confirm Delete Item From Receiving
      </ModalHeader>
      <ModalBody>
        <Row>
          <h5 className='fs-4 mb-2 fw-semibold text-primary'>
            Receiving: <span className='fs-4 fw-bold text-black'>{showDeleteModal.orderNumber}</span>
          </h5>
          <div className='d-flex flex-row gap-4'>
            <div>
              <p className='fw-semibold fs-5 mb-0 text-muted'>Item</p>
              <p className='fw-semibold fs-6 mb-0'>{showDeleteModal.title}</p>
              <p className='fw-normal fs-6 mb-0'>{showDeleteModal.sku}</p>
            </div>
            <div className='text-center'>
              <p className='fw-semibold fs-5 mb-0 text-muted'>Quantity</p>
              <p className='fw-normal fs-6 mb-0'>{showDeleteModal.quantity}</p>
            </div>
          </div>
          <Row md={12}>
            <div className='text-end mt-2'>
              <Button disabled={loading} type='button' color='danger' className='btn' onClick={handleDeleteFromSkuList}>
                {loading ? <Spinner color='#fff' /> : 'Delete'}
              </Button>
            </div>
          </Row>
        </Row>
      </ModalBody>
    </Modal>
  )
}

export default Confirm_Delete_Item_From_Receiving
