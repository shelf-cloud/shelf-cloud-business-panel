import React, { useContext, useState } from 'react'
import { PurchaseOrder, PurchaseOrderBySuppliers, PurchaseOrderItem } from '@typesTs/purchaseOrders'
import DataTable from 'react-data-table-component'
import { ExpanderComponentProps } from 'react-data-table-component'
import { FormatCurrency, FormatIntNumber } from '@lib/FormatNumbers'
import AppContext from '@context/AppContext'
import { Badge, Card, UncontrolledTooltip } from 'reactstrap'
import Expanded_By_Orders from './Expanded_By_Orders'
import Confirm_Delete_Po from '@components/modals/purchaseOrders/Confirm_Delete_Po'
import { sortNumbers } from '@lib/helperFunctions'

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
      left: true,
      wrap: false,
      grow: 1.5,
      style: {
        fontSize: '0.7rem',
      },
    },
    // {
    //   name: <span className='fw-bolder fs-6'>Supplier</span>,
    //   selector: (row: PurchaseOrder) => row.suppliersName,
    //   sortable: true,
    //   compact: true,
    // },
    {
      name: <span className='fw-bolder fs-6'>Date Created</span>,
      selector: (row: PurchaseOrder) => row.date,
      sortable: true,
      center: true,
      compact: true,
      style: {
        fontSize: '0.7rem',
      },
    },
    {
      name: <span className='fw-bolder fs-6'>Order Cost</span>,
      selector: (row: PurchaseOrder) =>
        FormatCurrency(
          state.currentRegion,
          row?.poItems?.reduce((total, product: PurchaseOrderItem) => total + Number(product.orderQty * product.sellerCost), 0)
        ),
      sortable: true,
      compact: false,
      right: true,
      sortFunction: (rowA: PurchaseOrder, rowB: PurchaseOrder) =>
        sortNumbers(
          rowA?.poItems?.reduce((total: number, product: PurchaseOrderItem) => total + Number(product.orderQty * product.sellerCost), 0),
          rowB?.poItems?.reduce((total: number, product: PurchaseOrderItem) => total + Number(product.orderQty * product.sellerCost), 0)
        ),
      style: {
        fontSize: '0.7rem',
      },
    },
    {
      name: <span className='fw-bolder fs-6'>Status</span>,
      selector: (row: PurchaseOrder) => {
        switch (true) {
          case row.poItems.reduce((total, item: PurchaseOrderItem) => total + item.receivedQty, 0) === 0:
            return 'Pending'
            break
          case row.poItems.reduce((total, item: PurchaseOrderItem) => total + item.receivedQty, 0) < row.poItems.reduce((total, item: PurchaseOrderItem) => total + item.orderQty, 0):
            return 'Partial Received'
            break
          case row.isOpen && row.poItems.reduce((total, item: PurchaseOrderItem) => total + item.receivedQty, 0) === row.poItems.reduce((total, item: PurchaseOrderItem) => total + item.orderQty, 0):
            return 'Total Received'
            break
          case !row.isOpen && row.poItems.reduce((total, item: PurchaseOrderItem) => total + item.receivedQty, 0) === row.poItems.reduce((total, item: PurchaseOrderItem) => total + item.orderQty, 0):
            return 'Completed'
            break
          default:
            return 'Pending'
            break
        }
      },
      sortable: true,
      left: true,
      compact: false,
      conditionalCellStyles: [
        {
          when: (row: PurchaseOrder) => row.poItems.reduce((total, item: PurchaseOrderItem) => total + item.receivedQty, 0) === 0,
          classNames: ['text-primary'],
        },
        {
          when: (row: PurchaseOrder) =>
            row.poItems.reduce((total, item: PurchaseOrderItem) => total + item.receivedQty, 0) > 0 &&
            row.poItems.reduce((total, item: PurchaseOrderItem) => total + item.receivedQty, 0) < row.poItems.reduce((total, item: PurchaseOrderItem) => total + item.orderQty, 0),
          classNames: ['text-info'],
        },
        {
          when: (row: PurchaseOrder) => row.isOpen && row.poItems.reduce((total, item: PurchaseOrderItem) => total + item.receivedQty, 0) === row.poItems.reduce((total, item: PurchaseOrderItem) => total + item.orderQty, 0),

          classNames: ['text-danger'],
        },
        {
          when: (row: PurchaseOrder) => !row.isOpen && row.poItems.reduce((total, item: PurchaseOrderItem) => total + item.receivedQty, 0) === row.poItems.reduce((total, item: PurchaseOrderItem) => total + item.orderQty, 0),

          classNames: ['text-success'],
        },
      ],
      style: {
        fontSize: '0.7rem',
      },
    },
    {
      name: <span className='fw-bolder fs-6'>Destination</span>,
      selector: (row: PurchaseOrder) => row.warehouseName,
      sortable: true,
      left: true,
      compact: true,
      wrap: true,
      style: {
        fontSize: '0.7rem',
      },
    },
    {
      name: <span className='fw-bolder fs-6'></span>,
      selector: (row: PurchaseOrder) =>
        state.receivingFromPo.items[row.poId] ? (
          <>
            <Badge pill color='success' className='fs-7'>
              {FormatIntNumber(
                state.currentRegion,
                Object.entries(state.receivingFromPo.items[row.poId]).reduce((total: number, obj: [string, any]) => total + obj[1].receivingQty, 0)
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
        row.isOpen && row.poPayments.length <= 0 && row.poItems.reduce((total, item: PurchaseOrderItem) => total + item.inboundQty, 0) <= 0 && row.poItems.reduce((total, item: PurchaseOrderItem) => total + item.receivedQty, 0) <= 0 ? (
          <>
            <i
              className='fs-4 text-danger las la-trash-alt'
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
        <DataTable columns={columns} data={data.orders} striped={true} expandableRows expandableRowsComponent={Expanded_By_Orders} defaultSortFieldId={2} defaultSortAsc={false} />
      </Card>
      {showDeleteModal.show && <Confirm_Delete_Po showDeleteModal={showDeleteModal} setshowDeleteModal={setshowDeleteModal} loading={loading} setLoading={setLoading} />}
    </div>
  )
}

export default Table_By_Suppliers_Orders
