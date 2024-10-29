/* eslint-disable @next/next/no-img-element */
import AppContext from '@context/AppContext'
import { FormatCurrency } from '@lib/FormatNumbers'
import { Invoice } from '@typesTs/commercehub/invoices'
import moment from 'moment'
import React, { useContext } from 'react'
import DataTable from 'react-data-table-component'
import { toast } from 'react-toastify'
import { UncontrolledTooltip } from 'reactstrap'

type SortByType = {
  key: string
  asc: boolean
}

type Props = {
  filteredItems: Invoice[]
  pending: boolean
  setSelectedRows: (selectedRows: Invoice[]) => void
  toggledClearRows: boolean
  sortBy: SortByType
  setSortBy: (prev: SortByType) => void
}

const InvoicesTable = ({ filteredItems, pending, setSelectedRows, toggledClearRows, sortBy, setSortBy }: Props) => {
  const { state }: any = useContext(AppContext)

  const handleSelectedRows = ({ selectedRows }: { selectedRows: Invoice[] }) => {
    setSelectedRows(selectedRows)
  }

  const rowDisabledCriteria = (row: Invoice) => !row.orderId

  const columns: any = [
    {
      name: (
        <span className='fw-bold fs-6 text-nowrap' style={{ cursor: 'pointer' }} onClick={() => setSortBy({ key: 'storeId', asc: !sortBy.asc })}>
          Marketplace
          {sortBy.key === 'storeId' ? sortBy.asc ? <i className='ri-arrow-up-fill fs-7 text-primary' /> : <i className='ri-arrow-down-fill fs-7 text-primary' /> : null}
        </span>
      ),
      selector: (row: Invoice) => {
        return (
          <>
            <img
              loading='lazy'
              src={
                row.channelLogo
                  ? row.channelLogo
                  : 'https://firebasestorage.googleapis.com/v0/b/etiquetas-fba.appspot.com/o/image%2Fno-image.png?alt=media&token=c2232af5-43f6-4739-84eb-1d4803c44770'
              }
              alt='product Image'
              id={`ChannelLogo-${row.orderNumber}`}
              style={{
                width: '20px',
                height: '20px',
                objectFit: 'contain',
              }}
            />
            <UncontrolledTooltip placement='right' target={`ChannelLogo-${row.orderNumber}`}>
              {row.storeName}
            </UncontrolledTooltip>
          </>
        )
      },
      sortable: false,
      wrap: true,
      center: true,
      compact: true,
    },
    {
      name: <span className='fw-bold fs-6 text-nowrap'>Invoice No.</span>,
      selector: (row: Invoice) => (
        <div className='d-flex flex-wrap justify-content-start align-items-center'>
          <p className='m-0 p-0 fw-semibold fs-7'>{row.invoiceNumber}</p>{' '}
          <i
            className='ri-file-copy-line fs-6 my-0 mx-1 p-0 text-muted'
            style={{ cursor: 'pointer' }}
            onClick={() => {
              navigator.clipboard.writeText(row.invoiceNumber)
              toast('Invoice No. copied!', {
                autoClose: 1500,
              })
            }}
          />
        </div>
      ),
      sortable: false,
      wrap: false,
      center: false,
      compact: true,
    },
    {
      name: <span className='fw-bold fs-6 text-nowrap'>Order No.</span>,
      selector: (row: Invoice) => <p className='m-0 p-0 text-muted fs-7'>{row.orderNumber}</p>,
      sortable: false,
      left: true,
      compact: true,
    },
    {
      name: <span className='fw-bold fs-6 text-nowrap'>PO No.</span>,
      selector: (row: Invoice) => (
        <div className='d-flex flex-wrap justify-content-start align-items-center'>
          <p className='m-0 p-0 text-muted fs-7'>{row.poNumber}</p>
          <i
            className='ri-file-copy-line fs-6 my-0 mx-1 p-0 text-muted'
            style={{ cursor: 'pointer' }}
            onClick={() => {
              navigator.clipboard.writeText(row.poNumber)
              toast('PO No. copied!', {
                autoClose: 1500,
              })
            }}
          />
        </div>
      ),
      sortable: false,
      left: true,
      compact: true,
    },
    {
      name: (
        <span className='fw-bold fs-6 text-nowrap' style={{ cursor: 'pointer' }} onClick={() => setSortBy({ key: 'closedDate', asc: !sortBy.asc })}>
          Invoice Date{' '}
          {sortBy.key === 'closedDate' ? sortBy.asc ? <i className='ri-arrow-up-fill fs-7 text-primary' /> : <i className='ri-arrow-down-fill fs-7 text-primary' /> : null}
        </span>
      ),
      selector: (row: Invoice) => <span className='fs-7'>{moment.utc(row.closedDate).local().format('D MMM YYYY')}</span>,
      sortable: false,
      center: true,
      compact: true,
    },
    {
      name: (
        <span className='fw-bold fs-6 text-nowrap' style={{ cursor: 'pointer' }} onClick={() => setSortBy({ key: 'orderTotal', asc: !sortBy.asc })}>
          Invoice Total{' '}
          {sortBy.key === 'orderTotal' ? sortBy.asc ? <i className='ri-arrow-up-fill fs-7 text-primary' /> : <i className='ri-arrow-down-fill fs-7 text-primary' /> : null}
        </span>
      ),
      selector: (row: Invoice) => <span className='fs-7'>{row.invoiceTotal ? FormatCurrency(state.currentRegion, row.invoiceTotal) : ''}</span>,
      sortable: false,
      center: true,
      compact: true,
    },
    {
      name: (
        <span className='fw-bold fs-6 text-nowrap' style={{ cursor: 'pointer' }} onClick={() => setSortBy({ key: 'dueDate', asc: !sortBy.asc })}>
          Due Date {sortBy.key === 'dueDate' ? sortBy.asc ? <i className='ri-arrow-up-fill fs-7 text-primary' /> : <i className='ri-arrow-down-fill fs-7 text-primary' /> : null}
        </span>
      ),
      selector: (row: Invoice) => <span className='fs-7'>{moment.utc(row.closedDate).local().add(row.payterms, 'days').format('D MMM YYYY')}</span>,
      sortable: false,
      center: true,
      compact: true,
    },
    {
      name: (
        <span className='fw-bold fs-6 text-nowrap' style={{ cursor: 'pointer' }} onClick={() => setSortBy({ key: 'checkDate', asc: !sortBy.asc })}>
          Check Date{' '}
          {sortBy.key === 'checkDate' ? sortBy.asc ? <i className='ri-arrow-up-fill fs-7 text-primary' /> : <i className='ri-arrow-down-fill fs-7 text-primary' /> : null}
        </span>
      ),
      selector: (row: Invoice) => <span className='fs-7'>{row.checkDate ? moment.utc(row.checkDate).local().format('D MMM YYYY') : ''}</span>,
      sortable: false,
      center: true,
      compact: true,
    },
    {
      name: (
        <span className='fw-bold fs-6 text-nowrap' style={{ cursor: 'pointer' }} onClick={() => setSortBy({ key: 'checkNumber', asc: !sortBy.asc })}>
          Check Number{' '}
          {sortBy.key === 'checkNumber' ? sortBy.asc ? <i className='ri-arrow-up-fill fs-7 text-primary' /> : <i className='ri-arrow-down-fill fs-7 text-primary' /> : null}
        </span>
      ),
      selector: (row: Invoice) => <span className='fs-7'>{row.checkNumber}</span>,
      sortable: false,
      center: true,
      compact: true,
    },
    {
      name: (
        <span className='fw-bold fs-6 text-nowrap' style={{ cursor: 'pointer' }} onClick={() => setSortBy({ key: 'checkTotal', asc: !sortBy.asc })}>
          Total Paid
          {sortBy.key === 'checkTotal' ? sortBy.asc ? <i className='ri-arrow-up-fill fs-7 text-primary' /> : <i className='ri-arrow-down-fill fs-7 text-primary' /> : null}
        </span>
      ),
      selector: (row: Invoice) => <span className='fs-7'>{row.checkTotal ? FormatCurrency(state.currentRegion, row.checkTotal) : ''}</span>,
      sortable: false,
      center: true,
      compact: true,
    },
    {
      name: (
        <span className='fw-bold fs-6 text-nowrap' style={{ cursor: 'pointer' }} onClick={() => setSortBy({ key: 'pending', asc: !sortBy.asc })}>
          Pending {sortBy.key === 'pending' ? sortBy.asc ? <i className='ri-arrow-up-fill fs-7 text-primary' /> : <i className='ri-arrow-down-fill fs-7 text-primary' /> : null}
        </span>
      ),
      selector: (row: Invoice) => {
        const pending = parseFloat((row.invoiceTotal - row.checkTotal).toFixed(2))
        if (pending > 0) {
          return <span className='text-danger text-center fs-7'>{FormatCurrency(state.currentRegion, pending)}</span>
        } else {
          return <span className='text-success text-center fs-7'>{FormatCurrency(state.currentRegion, 0)}</span>
        }
      },
      sortable: false,
      center: true,
      compact: true,
    },
    {
      name: (
        <span className='fw-bold fs-6 text-nowrap' style={{ cursor: 'pointer' }} onClick={() => setSortBy({ key: 'commerceHubStatus', asc: !sortBy.asc })}>
          Status{' '}
          {sortBy.key === 'commerceHubStatus' ? sortBy.asc ? <i className='ri-arrow-up-fill fs-7 text-primary' /> : <i className='ri-arrow-down-fill fs-7 text-primary' /> : null}
        </span>
      ),
      selector: (row: Invoice) => {
        if (row.checkNumber) {
          return <span className='badge text-uppercase badge-soft-success p-2'>{` Paid `}</span>
        }
        switch (row.commerceHubStatus) {
          case 'paid':
            return <span className='badge text-uppercase badge-soft-success p-2'>{` ${row.commerceHubStatus} `}</span>
            break
          case 'unpaid':
            return <span className='badge text-uppercase badge-soft-warning p-2'>{` ${row.commerceHubStatus} `}</span>
            break
          case 'closed':
          case 'resolved':
            return <span className='badge text-uppercase badge-soft-dark p-2'>{` ${row.commerceHubStatus} `}</span>
            break
          case 'reviewing':
            return <span className='badge text-uppercase badge-soft-warning p-2'>{` ${row.commerceHubStatus} `}</span>
            break
          default:
            return <span className='badge text-uppercase badge-soft-warning p-2'>{` Unpaid `}</span>
            break
        }
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
        dense={true}
        selectableRows
        onSelectedRowsChange={handleSelectedRows}
        selectableRowDisabled={rowDisabledCriteria}
        clearSelectedRows={toggledClearRows}
      />
    </>
  )
}

export default InvoicesTable
