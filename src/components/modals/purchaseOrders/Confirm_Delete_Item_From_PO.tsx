/* eslint-disable @next/next/no-img-element */
import React, { useContext } from 'react'
import { Button, Modal, ModalBody, ModalHeader, Spinner } from 'reactstrap'
import { toast } from 'react-toastify'
import { useSWRConfig } from 'swr'
import axios from 'axios'
import { useRouter } from 'next/router'
import AppContext from '@context/AppContext'
import { NoImageAdress } from '@lib/assetsConstants'
import { Split } from '@typesTs/purchaseOrders'

export type DeleteItemFromOrderType = {
  show: boolean
  poId: number
  orderNumber: string
  inventoryId: number
  sku: string
  title: string
  image: string
  hasSplitting: boolean
  split: Split | undefined
}

type Props = {
  showDeleteModal: DeleteItemFromOrderType
  setshowDeleteModal: (prev: DeleteItemFromOrderType) => void
  loading: boolean
  setLoading: (state: boolean) => void
}

const Confirm_Delete_Item_From_PO = ({ showDeleteModal, setshowDeleteModal, loading, setLoading }: Props) => {
  const { show, poId, orderNumber, inventoryId, sku, title, image, hasSplitting, split } = showDeleteModal
  const { state }: any = useContext(AppContext)
  const router = useRouter()
  const { status, organizeBy } = router.query
  const { mutate } = useSWRConfig()

  const handleClose = () => {
    setshowDeleteModal({
      show: false,
      poId: 0,
      orderNumber: '',
      inventoryId: 0,
      sku: '',
      title: '',
      image: '',
      hasSplitting: false,
      split: undefined,
    })
  }

  const handleDeleteFromSkuList = async () => {
    setLoading(true)
    const response = await axios.post(`/api/purchaseOrders/deleteSkufromPo?region=${state.currentRegion}&businessId=${state.user.businessId}`, {
      poId,
      orderNumber: orderNumber,
      inventoryId: inventoryId,
      sku: sku,
      hasSplitting,
      split: hasSplitting ? split : undefined,
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
      handleClose()
    } else {
      toast.error(response.data.msg)
    }
    setLoading(false)
  }

  return (
    <Modal fade={false} size='md' id='confirmDelete' isOpen={show} toggle={handleClose}>
      <ModalHeader toggle={handleClose} className='modal-title' id='myModalLabel'>
        Confirm Delete Item From PO
      </ModalHeader>
      <ModalBody>
        <p className='m-0 fs-5 fw-semibold'>
          Purchase Order: <span className='text-primary'>{orderNumber}</span>
        </p>
        {hasSplitting && (
          <p className='fs-5 fw-semibold'>
            From Split: <span className='text-primary'>{split?.splitName}</span>
          </p>
        )}
        <div className='my-2 d-flex flex-row'>
          <div
            style={{
              width: '100%',
              maxWidth: '80px',
              height: '45px',
              margin: '2px 0px',
              position: 'relative',
            }}>
            <img loading='lazy' src={image ? image : NoImageAdress} alt='product Image' style={{ objectFit: 'contain', objectPosition: 'center', width: '100%', height: '100%' }} />
          </div>
          <div>
            <p className='fw-semibold mb-0'>{title}</p>
            <p className='fw-normal mb-0'>{sku}</p>
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
      </ModalBody>
    </Modal>
  )
}

export default Confirm_Delete_Item_From_PO
