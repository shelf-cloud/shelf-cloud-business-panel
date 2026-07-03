import { useContext, useState } from 'react'

import AppContext from '@context/AppContext'
import { FormatIntNumber } from '@lib/FormatNumbers'
import { ProductPO } from '@typesTs/products/productPOs'
import axios from 'axios'
import DataTable from 'react-data-table-component'
import { Button } from '@shadcn/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@shadcn/ui/dialog'
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
      name: <span className='font-bold text-[13px]'>PO Number</span>,
      selector: (row: ProductPO) => row.orderNumber,
      sortable: true,
      center: true,
      wrap: false,
    },
    {
      name: <span className='font-bold text-[13px]'>Supplier</span>,
      selector: (row: ProductPO) => row.suppliersName,
      sortable: true,
      center: true,
    },
    {
      name: <span className='font-bold text-[13px]'>Date</span>,
      selector: (row: ProductPO) => row.date,
      sortable: true,
      center: true,
    },
    {
      name: <span className='font-bold text-[13px]'>Ordered</span>,
      selector: (row: ProductPO) =>
        FormatIntNumber(
          state.currentRegion,
          row.poItems.reduce((acc, item) => (item.sku === showOrderedModal.sku ? acc + item.orderQty : acc), 0)
        ),
      sortable: true,
      center: true,
    },
    {
      name: <span className='font-bold text-[13px]'>Received</span>,
      selector: (row: ProductPO) =>
        FormatIntNumber(
          state.currentRegion,
          row.poItems.reduce((acc, item) => (item.sku === showOrderedModal.sku ? acc + item.receivedQty : acc), 0)
        ),
      sortable: true,
      center: true,
    },
    {
      name: <span className='font-bold text-[13px]'>Pending</span>,
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
    <Dialog
      open={!!showOrderedModal.show}
      onOpenChange={(open) => {
        if (!open) setshowOrderedModal({ show: false, sku: '' })
      }}>
      <DialogContent aria-describedby={undefined} className='max-h-[90vh] overflow-y-auto sm:!max-w-3xl' id='myModal'>
        <DialogHeader className='pr-6'>
          <DialogTitle>
            <p className='modal-title text-[22.75px]' id='myModalLabel'>
              Open Purchase Orders
            </p>
            <p className='text-[16.25px]'>SKU: {showOrderedModal.sku}</p>
          </DialogTitle>
        </DialogHeader>
        <div>
          <DataTable columns={columns} data={Pos ?? []} progressPending={loading} striped={true} highlightOnHover={true} dense />
        </div>
        <DialogFooter className='items-center'>
          <Button
            variant='light'
            onClick={() => {
              setshowOrderedModal({ show: false, sku: '' })
            }}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default ProductOrderedModals
