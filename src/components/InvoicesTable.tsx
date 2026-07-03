 
import Link from 'next/link'
import { useContext } from 'react'

import AppContext from '@context/AppContext'
import { FormatCurrency } from '@lib/FormatNumbers'
import { InvoiceList } from '@typings'
import moment from 'moment'
import DataTable from '@components/Common/DataTableSC'
import { Button } from '@shadcn/ui/button'

type Props = {
  filteredItems: InvoiceList[]
  pending: boolean
}

const InvoicesTable = ({ filteredItems, pending }: Props) => {
  const { state }: any = useContext(AppContext)
  const today = moment().format('YYYY-MM-DD')

  const sortInvoiceNumber = (rowA: InvoiceList, rowB: InvoiceList) => {
    const a = rowA.invoiceNumber.toLowerCase()
    const b = rowB.invoiceNumber.toLowerCase()

    if (a > b) {
      return 1
    }

    if (b > a) {
      return -1
    }

    return 0
  }
  const sortStatus = (rowA: InvoiceList, rowB: InvoiceList) => {
    const a = rowA.paid ? 'Paid' : moment(today).isAfter(rowA.expireDate) ? 'Past Due' : 'Due'
    const b = rowB.paid ? 'Paid' : moment(today).isAfter(rowB.expireDate) ? 'Past Due' : 'Due'

    if (a > b) {
      return 1
    }

    if (b > a) {
      return -1
    }

    return 0
  }
  const sortCreatedDates = (rowA: InvoiceList, rowB: InvoiceList) => {
    const a = moment(rowA.createdDate, 'YYYY-MM-DD')
    const b = moment(rowB.createdDate, 'YYYY-MM-DD')

    if (a > b) {
      return 1
    }

    if (b > a) {
      return -1
    }

    return 0
  }
  const sortExpireDates = (rowA: InvoiceList, rowB: InvoiceList) => {
    const a = moment(rowA.expireDate, 'YYYY-MM-DD')
    const b = moment(rowB.expireDate, 'YYYY-MM-DD')

    if (a > b) {
      return 1
    }

    if (b > a) {
      return -1
    }

    return 0
  }
  const sortTotal = (rowA: InvoiceList, rowB: InvoiceList) => {
    const a = rowA.totalCharge
    const b = rowB.totalCharge

    if (a > b) {
      return 1
    }

    if (b > a) {
      return -1
    }

    return 0
  }
  const paginationComponentOptions = {
    selectAllRowsItem: true,
    selectAllRowsItemText: 'All',
  }
  const columns: any = [
    {
      name: <span className='font-bold text-[16.25px]'>Invoice Number</span>,
      selector: (row: InvoiceList) => {
        return (
          <div>
            <p style={{ margin: '0px', fontWeight: '800' }}>{row.invoiceNumber}</p>
          </div>
        )
      },
      sortable: true,
      wrap: true,
      grow: 1,
      sortFunction: sortInvoiceNumber,
    },
    {
      name: <span className='font-bold text-[16.25px]'>Status</span>,
      selector: (row: InvoiceList) => {
        return (
          <p className={row.paid ? 'text-[14px] my-1 text-success' : moment(today).isAfter(row.expireDate) ? 'text-[14px] my-1 text-danger' : 'text-[14px] my-1'}>
            {row.paid
              ? 'Paid'
              : moment(today).isAfter(row.expireDate)
                ? `Past Due ${moment(row.expireDate).fromNow(true)}`
                : moment(today).isSame(row.expireDate)
                  ? 'Due Today'
                  : `Due in ${moment(row.expireDate).fromNow(true)}`}
          </p>
        )
      },
      sortable: true,
      center: true,
      compact: true,
      sortFunction: sortStatus,
    },
    {
      name: <span className='font-bold text-[16.25px]'>Invoice Date</span>,
      selector: (row: InvoiceList) => {
        return moment(row.createdDate, 'YYYY-MM-DD').format('LL')
      },
      sortable: true,
      center: true,
      compact: true,
      sortFunction: sortCreatedDates,
    },
    {
      name: <span className='font-bold text-[16.25px]'>Expire Date</span>,
      selector: (row: InvoiceList) => {
        return (
          <p className={row.paid ? 'text-[14px] my-1' : moment(today).isSameOrAfter(row.expireDate) ? 'text-[14px] my-1 text-danger' : 'text-[14px] my-1'}>
            {moment(row.expireDate, 'YYYY-MM-DD').format('LL')}
          </p>
        )
      },
      sortable: true,
      center: true,
      compact: true,
      sortFunction: sortExpireDates,
    },
    {
      name: <span className='font-bold text-[16.25px]'>Total Invoice</span>,
      selector: (row: InvoiceList) => FormatCurrency(state.currentRegion, row.totalCharge),
      sortable: true,
      center: true,
      compact: true,
      sortFunction: sortTotal,
    },
    {
      name: <span className='font-bold text-[16.25px]'></span>,
      selector: (row: InvoiceList) => {
        if (state.currentRegion == 'us') {
          return (
            <a href={`${row.payLink}`} target='blank' rel='noopener noreferrer'>
              <Button
                className={
                  row.paid
                    ? 'inline-flex h-9 items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium bg-[color-mix(in_srgb,var(--vz-success)_18%,transparent)] text-success hover:bg-success hover:text-white'
                    : undefined
                }>
                {row.paid ? 'View Receipt' : 'Pay Now'}
              </Button>
            </a>
          )
        } else {
          return null
        }
      },
      sortable: false,
      center: true,
      compact: true,
    },
    {
      name: <span className='font-bold text-[16.25px]'></span>,
      selector: (row: InvoiceList) => {
        return <Link href={`/Invoices/${row.idOfInvoice}`}>View Details</Link>
      },
      sortable: false,
      center: true,
      compact: true,
    },
  ]

  return (
    <>
      <DataTable columns={columns} data={filteredItems} progressPending={pending} striped={true} pagination paginationComponentOptions={paginationComponentOptions} />
    </>
  )
}

export default InvoicesTable
