import { useContext } from 'react'

import AppContext from '@context/AppContext'
import { FormatCurrency, FormatIntNumber } from '@lib/FormatNumbers'
import { sortNumbers } from '@lib/helperFunctions'
import { PurchaseOrder, PurchaseOrderItem } from '@typesTs/purchaseOrders'
import DataTable from 'react-data-table-component'
import { Badge } from '@/components/migration-ui'

import Expanded_By_Orders from './Expanded_By_Orders'
import PurchaseOrderActionsDropdown from './PurchaseOrderActionsDropdown'

type Props = {
  filterDataTable: PurchaseOrder[]
  pending: boolean
}

const Table_By_Orders = ({ filterDataTable, pending }: Props) => {
  const { state }: any = useContext(AppContext)

  const columns: any = [
    {
      name: <span className='font-extrabold text-[13px]'>Order Number</span>,
      selector: (row: PurchaseOrder) => row.orderNumber,
      sortable: true,
      wrap: false,
      grow: 1.5,
      style: {
        fontSize: '0.7rem',
      },
    },
    {
      name: <span className='font-extrabold text-[13px]'>Supplier</span>,
      selector: (row: PurchaseOrder) => row.suppliersName,
      sortable: true,
      compact: true,
      style: {
        fontSize: '0.7rem',
      },
    },
    {
      name: <span className='font-extrabold text-center text-[13px]'>Date Created</span>,
      selector: (row: PurchaseOrder) => row.date,
      sortable: true,
      wrap: false,
      center: true,
      compact: true,
      style: {
        fontSize: '0.7rem',
      },
    },
    {
      name: <span className='font-extrabold text-[13px]'>Order Cost</span>,
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
      name: <span className='font-extrabold text-[13px]'>Status</span>,
      selector: (row: PurchaseOrder) => {
        switch (true) {
          case row.poItems.reduce((total, item: PurchaseOrderItem) => total + item.receivedQty, 0) === 0:
            return 'Pending'
            break
          case row.poItems.reduce((total, item: PurchaseOrderItem) => total + item.receivedQty, 0) <
            row.poItems.reduce((total, item: PurchaseOrderItem) => total + item.orderQty, 0):
            return 'Partial Received'
            break
          case row.isOpen &&
            row.poItems.reduce((total, item: PurchaseOrderItem) => total + item.receivedQty, 0) ===
              row.poItems.reduce((total, item: PurchaseOrderItem) => total + item.orderQty, 0):
            return 'Total Received'
            break
          case !row.isOpen &&
            row.poItems.reduce((total, item: PurchaseOrderItem) => total + item.receivedQty, 0) ===
              row.poItems.reduce((total, item: PurchaseOrderItem) => total + item.orderQty, 0):
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
          when: (row: PurchaseOrder) =>
            row.isOpen &&
            row.poItems.reduce((total, item: PurchaseOrderItem) => total + item.receivedQty, 0) ===
              row.poItems.reduce((total, item: PurchaseOrderItem) => total + item.orderQty, 0),

          classNames: ['text-destructive'],
        },
        {
          when: (row: PurchaseOrder) =>
            !row.isOpen &&
            row.poItems.reduce((total, item: PurchaseOrderItem) => total + item.receivedQty, 0) ===
              row.poItems.reduce((total, item: PurchaseOrderItem) => total + item.orderQty, 0),

          classNames: ['text-success'],
        },
      ],
      style: {
        fontSize: '0.7rem',
      },
    },
    {
      name: <span className='font-extrabold text-[13px]'>Destination</span>,
      selector: (row: PurchaseOrder) => row.warehouseName,
      sortable: true,
      left: true,
      compact: true,
      wrap: true,
      grow: 1.5,
      style: {
        fontSize: '0.7rem',
      },
    },
    {
      name: <span className='font-extrabold text-[13px]'></span>,
      selector: (row: PurchaseOrder) =>
        state.receivingFromPo.items[row.poId] ? (
          <>
            <Badge pill color='success' className='text-[11.2px]'>
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
      name: <span className='font-extrabold text-[13px]'></span>,
      selector: (row: PurchaseOrder) => <PurchaseOrderActionsDropdown purchaseOrder={row} />,
      sortable: false,
      center: true,
      compact: true,
      grow: 0,
    },
  ]

  return (
    <>
      <DataTable
        columns={columns}
        data={filterDataTable}
        progressPending={pending}
        striped={true}
        expandableRows
        expandableRowsComponent={Expanded_By_Orders}
        defaultSortFieldId={3}
        defaultSortAsc={false}
      />
    </>
  )
}

export default Table_By_Orders
