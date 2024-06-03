import React, { useContext, useState } from 'react'
import { PurchaseOrder, PurchaseOrderBySuppliers, PurchaseOrderItem } from '@typesTs/purchaseOrders'
import DataTable from 'react-data-table-component'
import { ExpanderComponentProps } from 'react-data-table-component'
import { FormatCurrency, FormatIntNumber } from '@lib/FormatNumbers'
import AppContext from '@context/AppContext'
import { Badge, Card, UncontrolledTooltip } from 'reactstrap'
import Expanded_By_Orders from './Expanded_By_Orders'
import Confirm_Delete_Po from '@components/modals/purchaseOrders/Confirm_Delete_Po'

type Props = {
  data: PurchaseOrderBySuppliers
}

const Table_By_Suppliers_Orders: React.FC<ExpanderComponentProps<PurchaseOrderBySuppliers>> = ({ data }: Props) => {
  const { state }: any = useContext(AppContext)
  const [loading, setLoading] = useState(false)
  const [showDeleteModal, setshowDeleteModal] = useState({
    show: false,
    poId: 0,
    orderNumber: '',
  })
  const columns: any = [
    {
      name: <span className='fw-bolder fs-6'>Order Number</span>,
      selector: (row: PurchaseOrder) => row.orderNumber,
      sortable: true,
      wrap: false,
      grow: 1.5,
    },
    {
      name: <span className='fw-bolder fs-6'>Supplier</span>,
      selector: (row: PurchaseOrder) => row.suppliersName,
      sortable: true,
      compact: true,
    },
    {
      name: <span className='fw-bolder fs-6'>Date Created</span>,
      selector: (row: PurchaseOrder) => row.date,
      sortable: true,
      compact: true,
    },
    {
      name: <span className='fw-bolder fs-6'>Order Cost</span>,
      selector: (row: PurchaseOrder) =>
        FormatCurrency(
          state.currentRegion,
          row?.poItems?.reduce((total, product: PurchaseOrderItem) => total + Number(product.orderQty * product.sellerCost), 0)
        ),
      sortable: true,
      compact: true,
      center: true,
    },
    {
      name: <span className='fw-bolder fs-6'>Status</span>,
      selector: (row: PurchaseOrder) => (row.isOpen ? 'Pending' : 'Complete'),
      sortable: true,
      center: true,
      compact: true,
    },
    {
      name: <span className='fw-bolder fs-6'>Destination</span>,
      selector: (row: PurchaseOrder) => (row.destinationSC ? 'ShelfCloud Warehouse' : 'Direct to Marketplace'),
      sortable: true,
      center: true,
      compact: true,
      wrap: true,
    },
    {
      name: <span className='fw-bolder fs-6'></span>,
      selector: (row: PurchaseOrder) =>
        state.receivingFromPo[row.poId] ? (
          <>
            <Badge pill color='success' className='fs-6'>
              {FormatIntNumber(
                state.currentRegion,
                Object.entries(state.receivingFromPo[row.poId]).reduce((total: number, obj: [string, any]) => total + obj[1].receivingQty, 0)
              )}
            </Badge>
          </>
        ) : (
          <></>
        ),
      sortable: false,
      center: true,
      compact: true,
      grow: 0,
    },
    {
      name: <span className='fw-bolder fs-6'></span>,
      selector: (row: PurchaseOrder) =>
        row.isOpen &&
        row.poPayments.length <= 0 &&
        row.poItems.reduce((total, item: PurchaseOrderItem) => total + item.inboundQty, 0) <= 0 &&
        row.poItems.reduce((total, item: PurchaseOrderItem) => total + item.receivedQty, 0) <= 0 ? (
          <>
            <i
              className='fs-3 text-danger las la-trash-alt'
              style={{ cursor: 'pointer' }}
              id={`deletePo${row.poId}`}
              onClick={() =>
                setshowDeleteModal((prev) => {
                  return {
                    ...prev,
                    show: true,
                    poId: row.poId,
                    orderNumber: row.orderNumber,
                  }
                })
              }
            />
            <UncontrolledTooltip placement='top' target={`deletePo${row.poId}`} popperClassName='bg-white shadow px-1 pt-1 rounded-2' innerClassName='text-black bg-white p-0'>
              <p className='fs-6 text-danger m-0 p-0 mb-0'>Delete PO</p>
            </UncontrolledTooltip>
          </>
        ) : (
          <></>
        ),
      sortable: false,
      center: true,
      compact: true,
      grow: 0,
    },
  ]
  return (
    <div className='p-2'>
      <Card>
        <DataTable columns={columns} data={data.orders} striped={true} expandableRows expandableRowsComponent={Expanded_By_Orders} defaultSortFieldId={3} defaultSortAsc={false} />
      </Card>
      {showDeleteModal.show && <Confirm_Delete_Po showDeleteModal={showDeleteModal} setshowDeleteModal={setshowDeleteModal} loading={loading} setLoading={setLoading} />}
    </div>
  )
}

export default Table_By_Suppliers_Orders
