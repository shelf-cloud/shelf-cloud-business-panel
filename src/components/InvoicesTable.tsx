/* eslint-disable react-hooks/exhaustive-deps */
import { Format } from '@lib/FormatCurrency'
import { InvoiceList } from '@typings'
import moment from 'moment'
import Link from 'next/link'
import React from 'react'
import DataTable from 'react-data-table-component'

type Props = {
  filteredItems: InvoiceList[]
  pending: boolean
}

const InvoicesTable = ({ filteredItems, pending }: Props) => {
  const today = moment().format('YYYY-MM-DD')
  const columns: any = [
    {
      name: <span className="fw-bold fs-5">Invoice Number</span>,
      selector: (row: InvoiceList) => {
        return (
          <div>
            <p style={{ margin: '0px', fontWeight: '800' }}>
              {row.invoiceNumber}
            </p>
          </div>
        )
      },
      sortable: true,
      wrap: true,
      grow: 1,
      //   compact: true,
    },
    {
      name: <span className="fw-bold fs-5">Status</span>,
      selector: (row: InvoiceList) => {
        return row.paid ? 'Paid' : 'Due'
      },
      sortable: true,
      center: true,
      compact: true,
    },
    {
      name: <span className="fw-bold fs-5">Invoice Date</span>,
      selector: (row: InvoiceList) => row.createdDate,
      sortable: true,
      center: true,
      compact: true,
    },
    {
      name: <span className="fw-bold fs-5">Expire Date</span>,
      selector: (row: InvoiceList) => {
        return (
          <p
            className={
              moment(today).isAfter(row.expireDate)
                ? 'fs-14 my-1 text-danger'
                : 'fs-14 my-1'
            }
          >
            {row.expireDate}
          </p>
        )
      },
      sortable: true,
      center: true,
      compact: true,
    },
    {
      name: <span className="fw-bold fs-5">Total Invoice</span>,
      selector: (row: InvoiceList) => Format.format(row.totalCharge),
      sortable: true,
      center: true,
      compact: true,
    },
    {
      name: <span className="fw-bold fs-5"></span>,
      selector: (row: InvoiceList) => {
        return (
          <Link
            href={`/Invoices/${row.idOfInvoice}`}
          >
            View Details
          </Link>
        )
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
        defaultSortFieldId={4}
      />
    </>
  )
}

export default InvoicesTable
