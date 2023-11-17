/* eslint-disable @next/next/no-img-element */
import React, { useContext } from 'react'
import { Button, Modal, ModalBody, ModalHeader, Row, Spinner } from 'reactstrap'
import { toast } from 'react-toastify'
import { useSWRConfig } from 'swr'
import axios from 'axios'
import AppContext from '@context/AppContext'
import { useRouter } from 'next/router'

type Props = {
  showDeleteModal: {
    show: boolean
    poId: number
    orderNumber: string
  }
  setshowDeleteModal: (prev: any) => void
  loading: boolean
  setLoading: (state: boolean) => void
}

const Confirm_Delete_Po = ({ showDeleteModal, setshowDeleteModal, loading, setLoading }: Props) => {
  const router = useRouter()
  const { status, organizeBy } = router.query
  const { state }: any = useContext(AppContext)
  const { mutate } = useSWRConfig()

  const handleDeleteReceiving = async () => {
    setLoading(true)
    const response = await axios.post(`/api/purchaseOrders/deletePo?region=${state.currentRegion}&businessId=${state.user.businessId}`, {
      poId: showDeleteModal.poId,
      orderNumber: showDeleteModal.orderNumber,
    })
    if (!response.data.error) {
      setshowDeleteModal({
        show: false,
        poId: 0,
        orderNumber: '',
      })
      if (organizeBy == 'suppliers') {
        mutate(`/api/purchaseOrders/getpurchaseOrdersBySuppliers?region=${state.currentRegion}&businessId=${state.user.businessId}&status=${status}`)
      } else if (organizeBy == 'orders') {
        mutate(`/api/purchaseOrders/getpurchaseOrdersByOrders?region=${state.currentRegion}&businessId=${state.user.businessId}&status=${status}`)
      } else if (organizeBy == 'sku') {
        mutate(`/api/purchaseOrders/getpurchaseOrdersBySku?region=${state.currentRegion}&businessId=${state.user.businessId}&status=${status}`)
      }
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
          poId: 0,
          orderNumber: '',
        })
      }}>
      <ModalHeader
        toggle={() => {
          setshowDeleteModal({
            show: false,
            poId: 0,
            orderNumber: '',
          })
        }}
        className='modal-title'
        id='myModalLabel'>
        Confirm Delete Purchase Order
      </ModalHeader>
      <ModalBody>
        <Row>
          <h5 className='fs-4 mb-0 fw-semibold text-primary'>
            PO: <span className='fs-4 fw-bold text-black'>{showDeleteModal.orderNumber}</span>
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

export default Confirm_Delete_Po
