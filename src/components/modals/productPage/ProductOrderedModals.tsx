import { useContext, useState } from 'react'

import AppContext from '@context/AppContext'
import { FormatIntNumber } from '@lib/FormatNumbers'
import { ProductPO } from '@typesTs/products/productPOs'
import axios from 'axios'
import DataTable from 'react-data-table-component'
import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from '@/components/migration-ui'
import useSWR from 'swr'

type Props = {
  showOrderedModal: { show: boolean; sku: string }
  setshowOrderedModal: (arg0: { show: boolean; sku: string }) => void
}

const ProductOrderedModals = ({ showOrderedModal, setshowOrderedModal }: Props) => {
  const { state }: any = useContext(AppContext)
  const [loading, setLoading] = useState(true)

  const fetcherPos = (endPoint: string) => {
    setLoading(true)
    return axios(endPoint).then((res) => {
      setLoading(false)
      return res.data
    })
  }
  const { data: Pos }: { data?: ProductPO[] } = useSWR(
    state.user.businessId ? `/api/productDetails/getProductPurchaseOrders?region=${state.currentRegion}&businessId=${state.user.businessId}&sku=${showOrderedModal.sku}` : null,
    fetcherPos,
    {
      revalidateOnFocus: false,
    }
  )

  const columns: any = [
    {
      name: <span className='tw:font-bold tw:text-[13px]'>PO Number</span>,
      selector: (row: ProductPO) => row.orderNumber,
      sortable: true,
      center: true,
      wrap: false,
    },
    {
      name: <span className='tw:font-bold tw:text-[13px]'>Supplier</span>,
      selector: (row: ProductPO) => row.suppliersName,
      sortable: true,
      center: true,
    },
    {
      name: <span className='tw:font-bold tw:text-[13px]'>Date</span>,
      selector: (row: ProductPO) => row.date,
      sortable: true,
      center: true,
    },
    {
      name: <span className='tw:font-bold tw:text-[13px]'>Ordered</span>,
      selector: (row: ProductPO) =>
        FormatIntNumber(
          state.currentRegion,
          row.poItems.reduce((acc, item) => (item.sku === showOrderedModal.sku ? acc + item.orderQty : acc), 0)
        ),
      sortable: true,
      center: true,
    },
    {
      name: <span className='tw:font-bold tw:text-[13px]'>Received</span>,
      selector: (row: ProductPO) =>
        FormatIntNumber(
          state.currentRegion,
          row.poItems.reduce((acc, item) => (item.sku === showOrderedModal.sku ? acc + item.receivedQty : acc), 0)
        ),
      sortable: true,
      center: true,
    },
    {
      name: <span className='tw:font-bold tw:text-[13px]'>Pending</span>,
      selector: (row: ProductPO) =>
        FormatIntNumber(
          state.currentRegion,
          row.poItems.reduce((acc, item) => (item.sku === showOrderedModal.sku ? acc + (item.orderQty - item.receivedQty) : acc), 0)
        ),
      sortable: true,
      center: true,
    },
  ]

  return (
    <Modal
      id='myModal'
      isOpen={showOrderedModal.show}
      size='lg'
      toggle={() => {
        setshowOrderedModal({ show: false, sku: '' })
      }}>
      <ModalHeader
        toggle={() => {
          setshowOrderedModal({ show: false, sku: '' })
        }}>
        <p className='modal-title tw:text-[22.75px]' id='myModalLabel'>
          Open Purchase Orders
        </p>
        <p className='tw:text-[16.25px]'>SKU: {showOrderedModal.sku}</p>
      </ModalHeader>
      <ModalBody>
        <DataTable columns={columns} data={Pos ?? []} progressPending={loading} striped={true} highlightOnHover={true} dense />
      </ModalBody>
      <ModalFooter>
        <Button
          color='light'
          onClick={() => {
            setshowOrderedModal({ show: false, sku: '' })
          }}>
          Close
        </Button>
      </ModalFooter>
    </Modal>
  )
}

export default ProductOrderedModals
