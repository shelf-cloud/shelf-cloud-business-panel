/* eslint-disable react-hooks/exhaustive-deps */
import { FormatCurrency } from '@lib/FormatNumbers'
import { InvoiceList } from '@typings'
import moment from 'moment'
import Link from 'next/link'
import React from 'react'
import DataTable from 'react-data-table-component'
import { Button } from 'reactstrap'

type Props = {
  filteredItems: InvoiceList[]
  pending: boolean
}

const InvoicesTable = ({ filteredItems, pending }: Props) => {
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
      name: <span className='fw-bold fs-5'>Invoice Number</span>,
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
      name: <span className='fw-bold fs-5'>Status</span>,
      selector: (row: InvoiceList) => {
        return (
          <p
            className={
              row.paid
                ? 'fs-14 my-1 text-success'
                : moment(today).isAfter(row.expireDate)
                ? 'fs-14 my-1 text-danger'
                : 'fs-14 my-1'
            }>
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
      name: <span className='fw-bold fs-5'>Invoice Date</span>,
      selector: (row: InvoiceList) => {
        return moment(row.createdDate, 'YYYY-MM-DD').format('LL')
      },
      sortable: true,
      center: true,
      compact: true,
      sortFunction: sortCreatedDates,
    },
    {
      name: <span className='fw-bold fs-5'>Expire Date</span>,
      selector: (row: InvoiceList) => {
        return (
          <p
            className={
              row.paid
                ? 'fs-14 my-1'
                : moment(today).isSameOrAfter(row.expireDate)
                ? 'fs-14 my-1 text-danger'
                : 'fs-14 my-1'
            }>
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
      name: <span className='fw-bold fs-5'>Total Invoice</span>,
      selector: (row: InvoiceList) => FormatCurrency.format(row.totalCharge),
      sortable: true,
      center: true,
      compact: true,
      sortFunction: sortTotal,
    },
    {
      name: <span className='fw-bold fs-5'></span>,
      selector: (row: InvoiceList) => {
        return (
          <a href={`${row.payLink}`} target='blank'>
            <Button className={row.paid ? 'btn btn-soft-success' : 'btn btn-primary'}>
              {row.paid ? 'View Receipt' : 'Pay Now'}
            </Button>
          </a>
        )
      },
      sortable: false,
      center: true,
      compact: true,
    },
    {
      name: <span className='fw-bold fs-5'></span>,
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
      <DataTable
        columns={columns}
        data={filteredItems}
        progressPending={pending}
        striped={true}
        pagination
        paginationComponentOptions={paginationComponentOptions}
      />
    </>
  )
}

export default InvoicesTable
