/* eslint-disable @next/next/no-img-element */
import { useContext } from 'react'

import AppContext from '@context/AppContext'
import { FormatCurrency } from '@lib/FormatNumbers'
import { CleanSpecialCharacters } from '@lib/SkuFormatting'
import { NoImageAdress } from '@lib/assetsConstants'
import { DeductionType } from '@typesTs/commercehub/deductions'
import moment from 'moment'
import DataTable from '@components/Common/DataTableSC'
import { toast } from 'react-toastify'
import { UncontrolledTooltip } from '@/components/migration-ui'

type EditComment = {
  show: boolean
  id: number
  comment: string
}

type SortByType = {
  key: string
  asc: boolean
}

type Props = {
  filteredItems: DeductionType[]
  pending: boolean
  setSelectedRows: (selectedRows: DeductionType[]) => void
  toggledClearRows: boolean
  setEditCommentModal: (prev: EditComment) => void
  sortBy: SortByType
  setSortBy: (prev: SortByType) => void
}

const DeductionsTable = ({ filteredItems, pending, setSelectedRows, toggledClearRows, setEditCommentModal, sortBy, setSortBy }: Props) => {
  const { state }: any = useContext(AppContext)

  // const sortDates = (Adate: string, Bdate: string) => {
  //   const a = moment(Adate)
  //   const b = moment(Bdate)
  //   if (a.isBefore(b)) {
  //     return -1
  //   } else {
  //     return 1
  //   }
  // }

  // const sortStrings = (rowA: string, rowB: string) => {
  //   if (rowA.localeCompare(rowB)) {
  //     return 1
  //   } else {
  //     return -1
  //   }
  // }

  const handleSelectedRows = ({ selectedRows }: { selectedRows: DeductionType[] }) => {
    setSelectedRows(selectedRows)
  }

  const columns: any = [
    {
      name: (
        <span className='tw:font-extrabold tw:text-[13px]' style={{ cursor: 'pointer' }} onClick={() => setSortBy({ key: 'storeId', asc: !sortBy.asc })}>
          Marketplace
          {sortBy.key === 'storeId' ? sortBy.asc ? <i className='ri-arrow-up-fill tw:text-[11.2px] tw:text-primary' /> : <i className='ri-arrow-down-fill tw:text-[11.2px] tw:text-primary' /> : null}
        </span>
      ),
      selector: (row: DeductionType) => {
        return (
          <>
            <img
              loading='lazy'
              src={row.channelLogo ? row.channelLogo : NoImageAdress}
              alt='product Image'
              id={`ChannelLogo-${CleanSpecialCharacters(row.invoicePoId)}`}
              style={{
                width: '20px',
                height: '20px',
                objectFit: 'contain',
              }}
            />
            <UncontrolledTooltip placement='right' target={`ChannelLogo-${CleanSpecialCharacters(row.invoicePoId)}`}>
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
      name: (
        <span className='tw:font-bold tw:text-[13px]' style={{ cursor: 'pointer' }} onClick={() => setSortBy({ key: 'invoiceNumber', asc: !sortBy.asc })}>
          Invoice No.
          {sortBy.key === 'invoiceNumber' ? sortBy.asc ? <i className='ri-arrow-up-fill tw:text-[11.2px] tw:text-primary' /> : <i className='ri-arrow-down-fill tw:text-[11.2px] tw:text-primary' /> : null}
        </span>
      ),
      selector: (row: DeductionType) => (
        <div className='tw:flex tw:flex-wrap tw:justify-start tw:items-center'>
          <p className='tw:m-0 tw:p-0 tw:font-semibold tw:text-[11.2px]'>{row.invoiceNumber}</p>{' '}
          <i
            className='ri-file-copy-line tw:text-[13px] tw:my-0 tw:mx-1 tw:p-0 tw:text-[color:var(--bs-secondary-color)]'
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
      compact: true,
    },
    {
      name: <span className='tw:font-bold tw:text-[13px] tw:text-nowrap'>Keyrec No.</span>,
      selector: (row: DeductionType) => <p className='tw:m-0 tw:p-0 tw:text-[var(--bs-secondary-color)] tw:text-[11.2px]'>{row.keyrecNumber ? row.keyrecNumber : ''}</p>,
      sortable: false,
      left: true,
      compact: true,
    },
    {
      name: <span className='tw:font-bold tw:text-[13px]'>PO No.</span>,
      selector: (row: DeductionType) => (
        <div className='tw:flex tw:flex-wrap tw:justify-start tw:items-center'>
          <p className='tw:m-0 tw:p-0 tw:text-[var(--bs-secondary-color)] tw:text-[11.2px]'>{row.poNumber}</p>
        </div>
      ),
      sortable: false,
      left: true,
      compact: true,
    },
    {
      name: <span className='tw:font-bold tw:text-[13px]'>Comments</span>,
      selector: (row: DeductionType) => (
        <div className='tw:flex tw:flex-row tw:justify-start tw:items-center tw:gap-2'>
          <span className='tw:text-[11.2px]'>{row.comments}</span>
          <i className='ri-pencil-fill tw:text-primary' style={{ cursor: 'pointer' }} onClick={() => setEditCommentModal({ show: true, id: row.id, comment: row.comments ?? '' })} />
        </div>
      ),
      sortable: false,
      left: true,
      compact: true,
      wrap: true,
      grow: 1.2,
    },
    {
      name: (
        <span className='tw:font-bold tw:text-[13px]' style={{ cursor: 'pointer' }} onClick={() => setSortBy({ key: 'checkDate', asc: !sortBy.asc })}>
          Check Date
          {sortBy.key === 'checkDate' ? sortBy.asc ? <i className='ri-arrow-up-fill tw:text-[11.2px] tw:text-primary' /> : <i className='ri-arrow-down-fill tw:text-[11.2px] tw:text-primary' /> : null}
        </span>
      ),
      selector: (row: DeductionType) => <span className='tw:text-[11.2px]'>{row.checkDate ? moment.utc(row.checkDate).local().format('D MMM YYYY') : ''}</span>,
      sortable: false,
      center: true,
      compact: true,
    },
    {
      name: (
        <span className='tw:font-bold tw:text-[13px]' style={{ cursor: 'pointer' }} onClick={() => setSortBy({ key: 'checkNumber', asc: !sortBy.asc })}>
          Check Number
          {sortBy.key === 'checkNumber' ? sortBy.asc ? <i className='ri-arrow-up-fill tw:text-[11.2px] tw:text-primary' /> : <i className='ri-arrow-down-fill tw:text-[11.2px] tw:text-primary' /> : null}
        </span>
      ),
      selector: (row: DeductionType) => <span className='tw:text-[11.2px]'>{row.checkNumber}</span>,
      sortable: false,
      center: true,
      compact: true,
    },
    {
      name: (
        <span className='tw:font-bold tw:text-[13px]' style={{ cursor: 'pointer' }} onClick={() => setSortBy({ key: 'checkTotal', asc: !sortBy.asc })}>
          Deduction
          {sortBy.key === 'checkTotal' ? sortBy.asc ? <i className='ri-arrow-up-fill tw:text-[11.2px] tw:text-primary' /> : <i className='ri-arrow-down-fill tw:text-[11.2px] tw:text-primary' /> : null}
        </span>
      ),
      selector: (row: DeductionType) => <span className='tw:text-[11.2px] tw:text-danger'>{row.checkTotal ? FormatCurrency(state.currentRegion, row.checkTotal) : ''}</span>,
      sortable: false,
      center: true,
      compact: true,
    },
    {
      name: (
        <span className='tw:font-extrabold tw:text-[13px]' style={{ cursor: 'pointer' }} onClick={() => setSortBy({ key: 'status', asc: !sortBy.asc })}>
          Status
          {sortBy.key === 'status' ? sortBy.asc ? <i className='ri-arrow-up-fill tw:text-[11.2px] tw:text-primary' /> : <i className='ri-arrow-down-fill tw:text-[11.2px] tw:text-primary' /> : null}
        </span>
      ),
      selector: (row: DeductionType) => {
        switch (row.status) {
          case 'closed':
          case 'resolved':
            return <span className='badge tw:uppercase tw:bg-[color-mix(in_srgb,var(--bs-dark)_10%,transparent)] tw:text-dark tw:p-2'>{` ${row.status} `}</span>
          case 'reviewing':
            return <span className='badge tw:uppercase tw:bg-[color-mix(in_srgb,var(--bs-warning)_10%,transparent)] tw:text-warning tw:p-2'>{` ${row.status} `}</span>
          case 'pending':
            return <span className='badge tw:uppercase tw:bg-[color-mix(in_srgb,var(--bs-info)_10%,transparent)] tw:text-info tw:p-2'>{` ${row.status} `}</span>
          default:
            return <span className='badge tw:uppercase tw:bg-[color-mix(in_srgb,var(--bs-info)_10%,transparent)] tw:text-info tw:p-2'>{` pending `}</span>
        }
      },
      sortable: false,
      wrap: true,
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
        clearSelectedRows={toggledClearRows}
      />
    </>
  )
}

export default DeductionsTable
