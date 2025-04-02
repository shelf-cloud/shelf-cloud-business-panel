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
  const { show, poId, orderNumber } = showDeleteModal
  const router = useRouter()
  const { status, organizeBy } = router.query
  const { state }: any = useContext(AppContext)
  const { mutate } = useSWRConfig()

  const handleClose = () => {
    setshowDeleteModal({
      show: false,
      poId: 0,
      orderNumber: '',
    })
  }

  const handleDeletePO = async () => {
    setLoading(true)
    const response = await axios.post(`/api/purchaseOrders/deletePo?region=${state.currentRegion}&businessId=${state.user.businessId}`, {
      poId: poId,
      orderNumber: orderNumber,
    })
    if (!response.data.error) {
      if (organizeBy == 'suppliers') {
        mutate(`/api/purchaseOrders/getpurchaseOrdersBySuppliers?region=${state.currentRegion}&businessId=${state.user.businessId}&status=${status}`)
      } else if (organizeBy == 'orders') {
        mutate(`/api/purchaseOrders/getpurchaseOrdersByOrders?region=${state.currentRegion}&businessId=${state.user.businessId}&status=${status}`)
      } else if (organizeBy == 'sku') {
        mutate(`/api/purchaseOrders/getpurchaseOrdersBySku?region=${state.currentRegion}&businessId=${state.user.businessId}&status=${status}`)
      }
      toast.success(response.data.msg)
      setshowDeleteModal({
        show: false,
        poId: 0,
        orderNumber: '',
      })
    } else {
      toast.error(response.data.msg)
    }
    setLoading(false)
  }

  return (
    <Modal fade={false} size='md' id='confirmDelete' isOpen={show} toggle={handleClose}>
      <ModalHeader toggle={handleClose} className='modal-title' id='myModalLabel'>
        Confirm Delete Purchase Order
      </ModalHeader>
      <ModalBody>
        <Row>
          <p className='m-0 fs-5 fw-semibold'>
            Purchase Order: <span className='text-primary'>{orderNumber}</span>
          </p>
          <div className='mt-3 d-flex justify-content-end align-items-center gap-2'>
            <Button type='button' color='light' className='fs-7' onClick={handleClose}>
              Cancel
            </Button>
            <Button disabled={loading} type='button' color='danger' className='fs-7' onClick={handleDeletePO}>
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

export default Confirm_Delete_Po
