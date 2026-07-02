import { useContext } from 'react'

import AppContext from '@context/AppContext'
import { FormatCurrency } from '@lib/FormatNumbers'
import { FBAOrder, FBAOrderItem } from '@typesTs/amazon/orders'
import moment from 'moment'
import DataTable from '@components/Common/DataTableSC'

import FbaOrdersExpandedDetail from './FbaOrdersExpandedDetail'

type Props = {
  tableData: FBAOrder[]
  pending: boolean
}

const SellerFbaOrdersTable = ({ tableData, pending }: Props) => {
  const { state }: any = useContext(AppContext)

  const orderStatus = (rowA: FBAOrder, rowB: FBAOrder) => {
    const a = rowA.orderStatus.toLowerCase()
    const b = rowB.orderStatus.toLowerCase()

    if (a > b) {
      return 1
    }

    if (b > a) {
      return -1
    }

    return 0
  }

  const columns: any = [
    {
      name: <span className='font-extrabold text-[13px]'>Order Id</span>,
      selector: (row: FBAOrder) => row.amazonOrderId,
      sortable: true,
      center: true,
      compact: true,
    },
    {
      name: <span className='font-extrabold text-[13px] text-center'>Date</span>,
      selector: (row: FBAOrder) => moment(row.purchaseDate).format('YYYY-MM-DD'),
      center: true,
      sortable: true,
      compact: true,
    },
    {
      name: <span className='font-extrabold text-[13px]'>Fulfillment</span>,
      selector: (row: FBAOrder) => row.fulfillmentChannel,
      center: true,
      sortable: true,
      compact: true,
    },
    {
      name: <span className='font-extrabold text-[13px]'>Channel</span>,
      selector: (row: FBAOrder) => row.salesChannel,
      center: true,
      sortable: true,
      compact: true,
    },
    {
      name: <span className='font-extrabold text-[13px]'>Status</span>,
      selector: (row: FBAOrder) => {
        switch (row.orderStatus) {
          case 'Shipped':
            return <span className='badge uppercase bg-[color-mix(in_srgb,var(--bs-success)_10%,transparent)] text-success p-2 my-2'>{` ${row.orderStatus} `}</span>
            break
          case 'Processed':
            return <span className='badge uppercase bg-[color-mix(in_srgb,var(--bs-secondary)_10%,transparent)] text-secondary p-2 my-2'>{` ${row.orderStatus} `}</span>
            break
          case 'Pending':
          case 'Unshipped':
          case 'PartiallyShipped':
          case 'InvoiceUnconfirmed':
            return <span className='badge uppercase bg-[color-mix(in_srgb,var(--bs-warning)_10%,transparent)] text-warning p-2 my-2'>{` ${row.orderStatus} `}</span>
            break
          case 'PendingAvailability':
            return <span className='badge uppercase bg-[color-mix(in_srgb,var(--bs-danger)_10%,transparent)] text-danger p-2 my-2'>{` ${row.orderStatus} `}</span>
            break
          case 'Unfulfillable':
          case 'Cancelled':
            return <span className='badge uppercase bg-[color-mix(in_srgb,var(--bs-dark)_10%,transparent)] text-dark p-2 my-2'>{` ${row.orderStatus} `}</span>
            break
          default:
            return <span className='badge uppercase text-info bg-[color:var(--vz-light)] p-2 my-2'>{` ${row.orderStatus} `}</span>
        }
      },
      center: true,
      sortable: true,
      compact: true,
      sortFunction: orderStatus,
    },
    {
      name: <span className='font-extrabold text-[13px]'>Item Qty</span>,
      selector: (row: FBAOrder) => row?.orderItems.reduce((total, item: FBAOrderItem) => total + item.quantity, 0),
      center: true,
      sortable: true,
      compact: true,
    },
    {
      name: <span className='font-extrabold text-[13px]'>Order Total</span>,
      selector: (row: FBAOrder) => {
        return (
          <>
            {FormatCurrency(
              state.currentRegion,
              row?.orderItems.reduce(
                (total, item: FBAOrderItem) =>
                  total +
                  Number(
                    item.itemPrice +
                      item.itemTax +
                      item.shippingPrice +
                      item.shippingTax +
                      item.giftWrapPrice +
                      item.giftWrapTax +
                      item.itemPromotionDiscount +
                      item.shippingPromotionDiscount
                  ),
                0
              )
            )}
            <span className='text-[var(--bs-secondary-color)] text-[11.2px]'>{` USD`}</span>
            {row?.orderItems.reduce(
              (total, item: FBAOrderItem) =>
                total + (item.refund_item + item.refund_itemTax + item.refund_commission + item.refund_adminCommission + item.refund_facilitatorTax_item),
              0
            ) !== 0 && <span className='text-danger font-normal'> - Refund</span>}
          </>
        )
      },
      rigth: true,
      sortable: true,
      compact: true,
      wrap: false,
    },
  ]

  return (
    <>
      <DataTable
        columns={columns}
        data={tableData}
        progressPending={pending}
        striped={true}
        // selectableRows
        // onSelectedRowsChange={handleSelectedRows}
        // clearSelectedRows={toggledClearRows}
        expandableRows
        expandableRowsComponent={FbaOrdersExpandedDetail}
        // expandableRowsComponentProps={{ apiMutateLink: apiMutateLink }}
        dense
        defaultSortFieldId={2}
        defaultSortAsc={false}
        pagination={tableData.length > 100 ? true : false}
        paginationPerPage={50}
        paginationRowsPerPageOptions={[50, 100, 200, 500]}
        paginationComponentOptions={{
          rowsPerPageText: 'Products per page:',
          rangeSeparatorText: 'of',
          noRowsPerPage: false,
          selectAllRowsItem: true,
          selectAllRowsItemText: 'All',
        }}
      />
    </>
  )
}

export default SellerFbaOrdersTable
