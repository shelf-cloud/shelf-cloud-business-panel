/* eslint-disable @next/next/no-img-element */
/* eslint-disable react-hooks/exhaustive-deps */
import React from 'react'

import ProductsQtyTimeline from '@components/products/ProductsQtyTimeline'
import { Modal, ModalBody, ModalHeader } from 'reactstrap'

type Props = {
  dates: string[]
  dailyQty: number[]
  dailySellerValue: number[]
  dailyLandedValue: number[]
  productsQtyTimelineModal: { show: boolean }
  setproductsQtyTimelineModal: (prev: any) => void
}

const ProductsInventoryTimelineModal = ({ dates, dailyQty, dailySellerValue, dailyLandedValue, productsQtyTimelineModal, setproductsQtyTimelineModal }: Props) => {
  return (
    <Modal
      fade={false}
      size='xl'
      id='ProductsInventoryTimelineModal'
      isOpen={productsQtyTimelineModal.show}
      toggle={() => {
        setproductsQtyTimelineModal({ show: false })
      }}>
      <ModalHeader
        toggle={() => {
          setproductsQtyTimelineModal({ show: false })
        }}
        className='modal-title'
        id='ProductsInventoryTimeline'>
        Inventory Timeline
      </ModalHeader>
      <ModalBody>
        <ProductsQtyTimeline dates={dates} dailyQty={dailyQty} dailySellerValue={dailySellerValue} dailyLandedValue={dailyLandedValue} />
      </ModalBody>
    </Modal>
  )
}

export default ProductsInventoryTimelineModal
