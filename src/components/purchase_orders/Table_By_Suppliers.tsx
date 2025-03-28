import React, { useContext } from 'react'
import { PurchaseOrderBySuppliers } from '@typesTs/purchaseOrders'
import DataTable from 'react-data-table-component'
import { FormatIntNumber } from '@lib/FormatNumbers'
import AppContext from '@context/AppContext'
// import Expanded_By_Orders from './Expanded_By_Orders'
import { Badge } from 'reactstrap'
import Table_By_Suppliers_Orders from './Table_By_Suppliers_Orders'

type Props = {
  filterDataTable: PurchaseOrderBySuppliers[]
  pending: boolean
}

const Table_By_Suppliers = ({ filterDataTable, pending }: Props) => {
  const { state }: any = useContext(AppContext)
  const columns: any = [
    {
      selector: (row: PurchaseOrderBySuppliers) => {
        return <span className='fw-bold fs-4'>{row.suppliersName}</span>
      },
    },
    {
      name: <span className='fw-bolder fs-6'></span>,
      selector: (row: PurchaseOrderBySuppliers) => {
        const totalReceivingQty = Object.entries(state.receivingFromPo.items).reduce((total: number, po: [string, any]) => {
          const poTotal = Object.entries(po[1]).reduce((subtotal: number, inventoryId: [string, any]) => {
            if (inventoryId[1].suppliersName == row.suppliersName) {
              return subtotal + inventoryId[1].receivingQty
            } else {
              return subtotal
            }
          }, 0)
          return total + poTotal
        }, 0)

        if (totalReceivingQty > 0) {
          return (
            <Badge pill color='success' className='fs-7'>
              {FormatIntNumber(state.currentRegion, totalReceivingQty)}
            </Badge>
          )
        } else {
          return <></>
        }
      },
      sortable: false,
      center: true,
      compact: true,
      grow: 0,
    },
  ]
  return (
    <>
      <DataTable
        noTableHead={true}
        columns={columns}
        data={filterDataTable}
        progressPending={pending}
        striped={true}
        expandableRows
        expandableRowsComponent={Table_By_Suppliers_Orders}
      />
    </>
  )
}

export default Table_By_Suppliers
