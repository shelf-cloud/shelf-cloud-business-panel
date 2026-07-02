/* eslint-disable @next/next/no-img-element */
import Link from 'next/link'
import { useContext } from 'react'

import AppContext from '@context/AppContext'
import { FormatCurrency } from '@lib/FormatNumbers'
import { NoImageAdress } from '@lib/assetsConstants'
import { Invoice } from '@typesTs/commercehub/invoices'
import moment from 'moment'
import DataTable from '@components/Common/DataTableSC'
import { toast } from 'react-toastify'
import { Button, UncontrolledTooltip } from '@/components/migration-ui'

import { getTotalPaid, getTotalPending } from './helperFunctions'

type SortByType = {
  key: string
  asc: boolean
}

type EditComment = {
  show: boolean
  orderId: number
  comment: string
}

type Props = {
  filteredItems: Invoice[]
  pending: boolean
  setSelectedRows: (selectedRows: Invoice[]) => void
  toggledClearRows: boolean
  sortBy: SortByType
  setSortBy: (prev: SortByType) => void
  setEditCommentModal: (prev: EditComment) => void
}

const InvoicesTable = ({ filteredItems, pending, setSelectedRows, toggledClearRows, sortBy, setSortBy, setEditCommentModal }: Props) => {
  const { state }: any = useContext(AppContext)

  const handleSelectedRows = ({ selectedRows }: { selectedRows: Invoice[] }) => {
    setSelectedRows(selectedRows)
  }

  const rowDisabledCriteria = (row: Invoice) => !row.orderId

  const columns: any = [
    {
      name: (
        <span className='tw:font-bold tw:text-[13px] tw:text-nowrap' style={{ cursor: 'pointer' }} onClick={() => setSortBy({ key: 'storeId', asc: !sortBy.asc })}>
          Store
          {sortBy.key === 'storeId' ? sortBy.asc ? <i className='ri-arrow-up-fill fs-7 text-primary' /> : <i className='ri-arrow-down-fill fs-7 text-primary' /> : null}
        </span>
      ),
      selector: (row: Invoice) => {
        return (
          <>
            <img
              loading='lazy'
              src={row.channelLogo ? row.channelLogo : NoImageAdress}
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
      width: '35px',
    },
    {
      name: <span className='tw:font-bold tw:text-[13px] tw:text-nowrap'>Invoice No.</span>,
      selector: (row: Invoice) => (
        <div className='tw:flex tw:flex-nowrap tw:justify-start tw:items-center'>
          <p className='tw:m-0 tw:p-0 tw:font-semibold tw:text-[11.2px]'>{row.invoiceNumber}</p>{' '}
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
      left: true,
      compact: false,
    },
    {
      name: <span className='tw:font-bold tw:text-[13px] tw:text-nowrap'>Keyrec No.</span>,
      selector: (row: Invoice) => <p className='tw:m-0 tw:p-0 tw:text-[var(--bs-secondary-color)] tw:text-[11.2px]'>{row.keyrecNumber ? row.keyrecNumber : ''}</p>,
      sortable: false,
      left: true,
      compact: true,
    },
    {
      name: <span className='tw:font-bold tw:text-[13px] tw:text-nowrap'>Order No.</span>,
      selector: (row: Invoice) => <p className='tw:m-0 tw:p-0 tw:text-[var(--bs-secondary-color)] tw:text-[11.2px]'>{row.orderNumber}</p>,
      sortable: false,
      left: true,
      compact: true,
    },
    {
      name: <span className='tw:font-bold tw:text-[13px] tw:text-nowrap'>PO No.</span>,
      selector: (row: Invoice) => (
        <div className='tw:flex tw:flex-wrap tw:justify-start tw:items-center'>
          <p className='tw:m-0 tw:p-0 tw:text-[var(--bs-secondary-color)] tw:text-[11.2px]'>{row.poNumber}</p>
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
        <span className='tw:font-bold tw:text-[13px] tw:text-nowrap' style={{ cursor: 'pointer' }} onClick={() => setSortBy({ key: 'closedDate', asc: !sortBy.asc })}>
          Closed Date{' '}
          {sortBy.key === 'closedDate' ? sortBy.asc ? <i className='ri-arrow-up-fill fs-7 text-primary' /> : <i className='ri-arrow-down-fill fs-7 text-primary' /> : null}
        </span>
      ),
      selector: (row: Invoice) => <span className='tw:text-[11.2px]'>{moment.utc(row.closedDate).local().format('D MMM YYYY')}</span>,
      sortable: false,
      center: true,
      compact: true,
    },
    {
      name: (
        <span className='tw:font-bold tw:text-[13px] tw:text-nowrap' style={{ cursor: 'pointer' }} onClick={() => setSortBy({ key: 'orderTotal', asc: !sortBy.asc })}>
          Order Total{' '}
          {sortBy.key === 'orderTotal' ? sortBy.asc ? <i className='ri-arrow-up-fill fs-7 text-primary' /> : <i className='ri-arrow-down-fill fs-7 text-primary' /> : null}
        </span>
      ),
      selector: (row: Invoice) => <span className='tw:text-[11.2px]'>{FormatCurrency(state.currentRegion, row.orderTotal)}</span>,
      sortable: false,
      center: true,
      compact: true,
    },
    {
      name: (
        <span className='tw:font-bold tw:text-[13px] tw:text-nowrap' style={{ cursor: 'pointer' }} onClick={() => setSortBy({ key: 'dueDate', asc: !sortBy.asc })}>
          Due Date {sortBy.key === 'dueDate' ? sortBy.asc ? <i className='ri-arrow-up-fill fs-7 text-primary' /> : <i className='ri-arrow-down-fill fs-7 text-primary' /> : null}
        </span>
      ),
      selector: (row: Invoice) => (
        <span className='tw:text-[11.2px]'>
          {row.dueDate ? moment.utc(row.dueDate).local().format('D MMM YYYY') : moment.utc(row.closedDate).local().add(row.payterms, 'days').format('D MMM YYYY')}
        </span>
      ),
      sortable: false,
      center: true,
      compact: true,
    },
    {
      name: (
        <span className='tw:font-bold tw:text-[13px] tw:text-nowrap' style={{ cursor: 'pointer' }} onClick={() => setSortBy({ key: 'checkDate', asc: !sortBy.asc })}>
          Check Date{' '}
          {sortBy.key === 'checkDate' ? sortBy.asc ? <i className='ri-arrow-up-fill fs-7 text-primary' /> : <i className='ri-arrow-down-fill fs-7 text-primary' /> : null}
        </span>
      ),
      selector: (row: Invoice) => <span className='tw:text-[11.2px]'>{row.checkDate ? moment.utc(row.checkDate).local().format('D MMM YYYY') : ''}</span>,
      sortable: false,
      center: true,
      compact: true,
    },
    {
      name: (
        <span className='tw:font-bold tw:text-[13px] tw:text-nowrap' style={{ cursor: 'pointer' }} onClick={() => setSortBy({ key: 'checkNumber', asc: !sortBy.asc })}>
          Check Number{' '}
          {sortBy.key === 'checkNumber' ? sortBy.asc ? <i className='ri-arrow-up-fill fs-7 text-primary' /> : <i className='ri-arrow-down-fill fs-7 text-primary' /> : null}
        </span>
      ),
      selector: (row: Invoice) => (
        <Link href={`/commercehub/${row.storeName}/${row.checkNumber}`} className='tw:text-[11.2px] tw:!text-primary tw:font-normal'>
          {row.checkNumber}
        </Link>
      ),
      sortable: false,
      center: true,
      compact: true,
    },
    {
      name: <span className='tw:font-bold tw:text-[13px] tw:text-nowrap'>Deductions</span>,
      selector: (row: Invoice) => {
        if (!row.checkNumber) return <></>
        return <span className={'tw:text-[11.2px] tw:text-danger'}>{FormatCurrency(state.currentRegion, row.deductions)}</span>
      },
      sortable: false,
      center: true,
      compact: true,
    },
    {
      name: <span className='tw:font-bold tw:text-[13px] tw:text-nowrap'>Charges</span>,
      selector: (row: Invoice) => {
        if (!row.checkNumber) return <></>
        return <span className={'tw:text-[11.2px] tw:text-danger'}>{FormatCurrency(state.currentRegion, row.charges)}</span>
      },
      sortable: false,
      center: true,
      compact: true,
    },
    {
      name: (
        <span className='tw:font-bold tw:text-[13px] tw:text-nowrap' style={{ cursor: 'pointer' }} onClick={() => setSortBy({ key: 'checkTotal', asc: !sortBy.asc })}>
          Total Paid
          {sortBy.key === 'checkTotal' ? sortBy.asc ? <i className='ri-arrow-up-fill fs-7 text-primary' /> : <i className='ri-arrow-down-fill fs-7 text-primary' /> : null}
        </span>
      ),
      selector: (row: Invoice) => {
        if (!row.checkNumber) return <></>
        return <span className='tw:text-[11.2px]'>{FormatCurrency(state.currentRegion, getTotalPaid(row.orderTotal, row.deductions, row.charges))}</span>
      },
      sortable: false,
      center: true,
      compact: true,
    },
    {
      name: (
        <span className='tw:font-bold tw:text-[13px] tw:text-nowrap' style={{ cursor: 'pointer' }} onClick={() => setSortBy({ key: 'pending', asc: !sortBy.asc })}>
          Pending {sortBy.key === 'pending' ? sortBy.asc ? <i className='ri-arrow-up-fill fs-7 text-primary' /> : <i className='ri-arrow-down-fill fs-7 text-primary' /> : null}
        </span>
      ),
      selector: (row: Invoice) => {
        if (!row.checkNumber) return <></>
        const pending = getTotalPending(row.orderTotal, row.deductions, row.charges)
        return <span className={'tw:text-center tw:text-[11.2px] ' + (pending > 0 ? 'tw:text-danger' : 'tw:text-[var(--bs-secondary-color)]')}>{FormatCurrency(state.currentRegion, pending)}</span>
      },
      sortable: false,
      center: true,
      compact: true,
    },
    {
      name: (
        <span className='tw:font-bold tw:text-[13px] tw:text-nowrap' style={{ cursor: 'pointer' }} onClick={() => setSortBy({ key: 'commerceHubStatus', asc: !sortBy.asc })}>
          Status{' '}
          {sortBy.key === 'commerceHubStatus' ? sortBy.asc ? <i className='ri-arrow-up-fill fs-7 text-primary' /> : <i className='ri-arrow-down-fill fs-7 text-primary' /> : null}
        </span>
      ),
      selector: (row: Invoice) => {
        if (row.checkNumber) {
          if (row.deductions < 0) {
            return <span className='badge text-uppercase badge-soft-success p-2'>{` W/ Deductions `}</span>
          } else {
            return <span className='badge text-uppercase badge-soft-success p-2'>{` Paid `}</span>
          }
        }
        switch (row.commerceHubStatus) {
          case 'paid':
            return <span className='badge text-uppercase badge-soft-success p-2'>{` ${row.commerceHubStatus} `}</span>
          case 'unpaid':
            return <span className='badge text-uppercase badge-soft-warning p-2'>{` ${row.commerceHubStatus} `}</span>
          case 'closed':
          case 'resolved':
            return <span className='badge text-uppercase badge-soft-dark p-2'>{` ${row.commerceHubStatus} `}</span>
          case 'reviewing':
            return <span className='badge text-uppercase badge-soft-warning p-2'>{` ${row.commerceHubStatus} `}</span>
          default:
            return <span className='badge text-uppercase badge-soft-warning p-2'>{` Unpaid `}</span>
        }
      },
      sortable: false,
      center: true,
      compact: true,
    },
    {
      name: <span className='tw:font-bold tw:text-[13px] tw:text-nowrap'>Notes</span>,
      selector: (row: Invoice) => {
        return (
          <div className='tw:w-full tw:flex tw:flex-row tw:justify-end tw:items-center tw:gap-1'>
            {row.commerceHubComment && (
              <>
                <i className='ri-information-fill fs-5 text-primary' id={`tooltipCommerceHubComment${row.orderId}`} />
                <UncontrolledTooltip
                  placement='left'
                  target={`tooltipCommerceHubComment${row.orderId}`}
                  popperClassName='tw:bg-white tw:px-4 tw:pt-4 tw:rounded-md tw:border tw:border-primary'
                  innerClassName='tw:text-black tw:bg-white tw:p-0'>
                  <p className='tw:text-[11.2px] tw:text-left tw:font-light'>{row.commerceHubComment}</p>
                </UncontrolledTooltip>
              </>
            )}
            <Button id='Popover1' type='button' color='ghost' size='sm'>
              <i
                className='las la-edit fs-5 text-muted m-0 p-0 '
                style={{ cursor: 'pointer' }}
                onClick={() => setEditCommentModal({ show: true, orderId: row.orderId, comment: row.commerceHubComment ?? '' })}
              />
            </Button>
          </div>
        )
      },
      sortable: false,
      left: true,
      compact: true,
      width: '70px',
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
