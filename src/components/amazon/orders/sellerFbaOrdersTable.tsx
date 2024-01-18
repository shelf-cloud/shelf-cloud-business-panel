import AppContext from '@context/AppContext'
import { FormatCurrency } from '@lib/FormatNumbers'
import { FBAOrder, FBAOrderItem } from '@typesTs/amazon/orders'
import moment from 'moment'
import { useContext } from 'react'
import DataTable from 'react-data-table-component'
import FbaOrdersExpandedDetail from './FbaOrdersExpandedDetail'

type Props = {
  tableData: FBAOrder[]
  pending: boolean
}

const SellerFbaOrdersTable = ({ tableData, pending }: Props) => {
  const { state }: any = useContext(AppContext)

  const columns: any = [
    {
      name: <span className='fw-bolder fs-6'>Order Id</span>,
      selector: (row: FBAOrder) => row.amazonOrderId,
      sortable: true,
      center: true,
      compact: true,
    },
    {
      name: <span className='fw-bolder fs-6 text-center'>Date</span>,
      selector: (row: FBAOrder) => moment(row.purchaseDate).format('YYYY-MM-DD'),
      center: true,
      sortable: true,
      compact: true,
    },
    {
      name: <span className='fw-bolder fs-6'>Fulfillment</span>,
      selector: (row: FBAOrder) => row.fulfillmentChannel,
      center: true,
      sortable: true,
      compact: true,
    },
    {
      name: <span className='fw-bolder fs-6'>Channel</span>,
      selector: (row: FBAOrder) => row.salesChannel,
      center: true,
      sortable: true,
      compact: true,
    },
    {
      name: <span className='fw-bolder fs-6'>Status</span>,
      selector: (row: FBAOrder) => {
        switch (row.orderStatus) {
          case 'Shipped':
            return <span className='badge text-uppercase badge-soft-success p-2 my-2'>{` ${row.orderStatus} `}</span>
            break
          case 'Processed':
            return <span className='badge text-uppercase badge-soft-secondary p-2 my-2'>{` ${row.orderStatus} `}</span>
            break
          case 'Pending':
          case 'Unshipped':
          case 'PartiallyShipped':
          case 'InvoiceUnconfirmed':
            return <span className='badge text-uppercase badge-soft-warning p-2 my-2'>{` ${row.orderStatus} `}</span>
            break
          case 'PendingAvailability':
            return <span className='badge text-uppercase badge-soft-danger p-2 my-2'>{` ${row.orderStatus} `}</span>
            break
          case 'Unfulfillable':
          case 'Cancelled':
            return <span className='badge text-uppercase badge-soft-dark p-2 my-2'>{` ${row.orderStatus} `}</span>
            break
          default:
            break
        }
      },
      center: true,
      sortable: true,
      compact: true,
    },
    {
      name: <span className='fw-bolder fs-6'>Item Qty</span>,
      selector: (row: FBAOrder) => row?.orderItems.reduce((total, item: FBAOrderItem) => total + item.quantity, 0),
      center: true,
      sortable: true,
      compact: true,
    },
    {
      name: <span className='fw-bolder fs-6'>Order Total</span>,
      selector: (row: FBAOrder) => {
        return (
          <>
            {FormatCurrency(
              state.currentRegion,
              row?.orderItems.reduce(
                (total, item: FBAOrderItem) =>
                  total +
                  Number(item.itemPrice +
                    item.itemTax +
                    item.shippingPrice +
                    item.shippingTax +
                    item.giftWrapPrice +
                    item.giftWrapTax +
                    item.itemPromotionDiscount +
                    item.shippingPromotionDiscount),
                0
              )
            )}
            <span className='text-muted'>{` ${row.currencyCode}`}</span>
          </>
        )
      },
      rigth: true,
      sortable: true,
      compact: true,
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
