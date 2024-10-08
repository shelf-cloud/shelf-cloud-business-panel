/* eslint-disable @next/next/no-img-element */
import React, { useContext } from 'react'
import { Button, Modal, ModalBody, ModalHeader, Row, Spinner } from 'reactstrap'
import { toast } from 'react-toastify'
import { useSWRConfig } from 'swr'
import axios from 'axios'
import { useRouter } from 'next/router'
import AppContext from '@context/AppContext'

type Props = {
  showDeleteModal: {
    show: boolean
    poId: number
    orderNumber: string
    inventoryId: number
    sku: string
    title: string
    image: string
  }
  setshowDeleteModal: (prev: any) => void
  loading: boolean
  setLoading: (state: boolean) => void
}

const Confirm_Delete_Item_From_PO = ({ showDeleteModal, setshowDeleteModal, loading, setLoading }: Props) => {
  const { state }: any = useContext(AppContext)
  const router = useRouter()
  const { status, organizeBy } = router.query
  const { mutate } = useSWRConfig()

  const handleDeleteFromSkuList = async () => {
    setLoading(true)
    const response = await axios.post(`/api/purchaseOrders/deleteSkufromPo?region=${state.currentRegion}&businessId=${state.user.businessId}`, {
      poId: showDeleteModal.poId,
      orderNumber: showDeleteModal.orderNumber,
      inventoryId: showDeleteModal.inventoryId,
      sku: showDeleteModal.sku,
    })

    if (!response.data.error) {
      setshowDeleteModal({
        show: false,
        poId: 0,
        orderNumber: '',
        inventoryId: 0,
        sku: '',
        title: '',
        image: '',
      })
      toast.success(response.data.msg)
      if (organizeBy == 'suppliers') {
        mutate(`/api/purchaseOrders/getpurchaseOrdersBySuppliers?region=${state.currentRegion}&businessId=${state.user.businessId}&status=${status}`)
      } else if (organizeBy == 'orders') {
        mutate(`/api/purchaseOrders/getpurchaseOrdersByOrders?region=${state.currentRegion}&businessId=${state.user.businessId}&status=${status}`)
      } else if (organizeBy == 'sku') {
        mutate(`/api/purchaseOrders/getpurchaseOrdersBySku?region=${state.currentRegion}&businessId=${state.user.businessId}&status=${status}`)
      }
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
          inventoryId: 0,
          sku: '',
          title: '',
          image: '',
        })
      }}>
      <ModalHeader
        toggle={() => {
          setshowDeleteModal({
            show: false,
            poId: 0,
            orderNumber: '',
            inventoryId: 0,
            sku: '',
            title: '',
            image: '',
          })
        }}
        className='modal-title'
        id='myModalLabel'>
        Confirm Delete Item From PO
      </ModalHeader>
      <ModalBody>
        <Row>
          <h5 className='fs-4 mb-4 fw-semibold text-primary'>
            Purchase Order: <span className='fs-4 fw-bold text-black'>{showDeleteModal.orderNumber}</span>
          </h5>
          <div className='d-flex flex-row'>
            <div
              style={{
                width: '100%',
                maxWidth: '80px',
                height: '50px',
                margin: '2px 0px',
                position: 'relative',
              }}>
              <img
                loading='lazy'
                src={
                  showDeleteModal.image
                    ? showDeleteModal.image
                    : 'https://firebasestorage.googleapis.com/v0/b/etiquetas-fba.appspot.com/o/image%2Fno-image.png?alt=media&token=c2232af5-43f6-4739-84eb-1d4803c44770'
                }
                alt='product Image'
                style={{ objectFit: 'contain', objectPosition: 'center', width: '100%', height: '100%' }}
              />
            </div>
            <div>
              <p className='fw-semibold fs-5 mb-0'>{showDeleteModal.title}</p>
              <p className='fw-normal fs-6 mb-0'>{showDeleteModal.sku}</p>
            </div>
          </div>
          <Row md={12}>
            <div className='text-end mt-4'>
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

export default Confirm_Delete_Item_From_PO
