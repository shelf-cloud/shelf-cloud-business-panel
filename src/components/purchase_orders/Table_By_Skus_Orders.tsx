import React, { useContext } from 'react'
import { PurchaseOrder, PurchaseOrderBySkus, PurchaseOrderItem } from '@typesTs/purchaseOrders'
import DataTable from 'react-data-table-component'
import { ExpanderComponentProps } from 'react-data-table-component'
import { FormatCurrency, FormatIntNumber } from '@lib/FormatNumbers'
import AppContext from '@context/AppContext'
import { Badge, Card } from 'reactstrap'
import Expanded_By_Orders from './Expanded_By_Orders'

type Props = {
  data: PurchaseOrderBySkus
}

const Table_By_Skus_Orders: React.FC<ExpanderComponentProps<PurchaseOrderBySkus>> = ({ data }: Props) => {
  const { state }: any = useContext(AppContext)
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
  ]
  return (
    <div className='p-2'>
      <Card>
        <DataTable columns={columns} data={data.orders} striped={true} expandableRows expandableRowsComponent={Expanded_By_Orders} defaultSortFieldId={3} />
      </Card>
    </div>
  )
}

export default Table_By_Skus_Orders
