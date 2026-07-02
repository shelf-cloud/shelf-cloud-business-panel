/* eslint-disable @next/next/no-img-element */
import Link from 'next/link'
import { useContext } from 'react'

import AppContext from '@context/AppContext'
import { FormatCurrency } from '@lib/FormatNumbers'
import { NoImageAdress } from '@lib/assetsConstants'
import { CheckSummaryType } from '@typesTs/commercehub/checkSummary'
import moment from 'moment'
import DataTable from '@components/Common/DataTableSC'
import { toast } from 'react-toastify'
import { UncontrolledTooltip } from '@/components/migration-ui'

import { getTotalPaid } from './helperFunctions'

type SortByType = {
  key: string
  asc: boolean
}

type Props = {
  filteredItems: CheckSummaryType[]
  pending: boolean
  sortBy: SortByType
  setSortBy: (prev: SortByType) => void
}

const CheckSummaryTable = ({ filteredItems, pending, sortBy, setSortBy }: Props) => {
  const { state }: any = useContext(AppContext)

  const columns: any = [
    {
      name: (
        <span className='tw:font-bold tw:text-[13px] tw:text-nowrap' style={{ cursor: 'pointer' }} onClick={() => setSortBy({ key: 'storeId', asc: !sortBy.asc })}>
          Marketplace
          {sortBy.key === 'storeId' ? sortBy.asc ? <i className='ri-arrow-up-fill tw:text-[11.2px] text-primary' /> : <i className='ri-arrow-down-fill tw:text-[11.2px] text-primary' /> : null}
        </span>
      ),
      selector: (row: CheckSummaryType) => {
        return (
          <>
            <img
              loading='lazy'
              src={row.channelLogo ? row.channelLogo : NoImageAdress}
              alt='product Image'
              id={`ChannelLogo-${row.checkNumber}`}
              style={{
                width: '20px',
                height: '20px',
                objectFit: 'contain',
              }}
            />
            <UncontrolledTooltip placement='right' target={`ChannelLogo-${row.checkNumber}`}>
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
        <span className='tw:font-bold tw:text-[13px]' style={{ cursor: 'pointer' }} onClick={() => setSortBy({ key: 'checkNumber', asc: !sortBy.asc })}>
          Check Number{' '}
          {sortBy.key === 'checkNumber' ? sortBy.asc ? <i className='ri-arrow-up-fill tw:text-[11.2px] text-primary' /> : <i className='ri-arrow-down-fill tw:text-[11.2px] text-primary' /> : null}
        </span>
      ),
      selector: (row: CheckSummaryType) => {
        return row.checkNumber ? (
          <div className='tw:flex tw:flex-wrap tw:justify-start tw:items-center'>
            <Link href={`/commercehub/${row.storeName}/${row.checkNumber}`} className='tw:text-[11.2px] tw:!text-primary tw:font-normal'>
              {row.checkNumber}
            </Link>
            <i
              className='ri-file-copy-line tw:text-[13px] my-0 mx-1 p-0 text-muted'
              style={{ cursor: 'pointer' }}
              onClick={() => {
                navigator.clipboard.writeText(row.checkNumber)
                toast('Check No. copied!', {
                  autoClose: 1500,
                })
              }}
            />
          </div>
        ) : (
          <span className='tw:text-[11.2px] mw-30 tw:text-[var(--bs-secondary-color)] tw:font-light tw:italic'>Pending</span>
        )
      },
      sortable: false,
      left: true,
      compact: true,
    },
    {
      name: (
        <span className='tw:font-bold tw:text-[13px]' style={{ cursor: 'pointer' }} onClick={() => setSortBy({ key: 'checkDate', asc: !sortBy.asc })}>
          Check Date{' '}
          {sortBy.key === 'checkDate' ? sortBy.asc ? <i className='ri-arrow-up-fill tw:text-[11.2px] text-primary' /> : <i className='ri-arrow-down-fill tw:text-[11.2px] text-primary' /> : null}
        </span>
      ),
      selector: (row: CheckSummaryType) => <span className='tw:text-[11.2px]'>{row.checkDate ? moment.utc(row.checkDate).local().format('D MMM YYYY') : ''}</span>,
      sortable: false,
      left: true,
      compact: true,
    },
    {
      name: (
        <span className='tw:font-bold tw:text-[13px]' style={{ cursor: 'pointer' }} onClick={() => setSortBy({ key: 'pending', asc: !sortBy.asc })}>
          Total Paid {sortBy.key === 'pending' ? sortBy.asc ? <i className='ri-arrow-up-fill tw:text-[11.2px] text-primary' /> : <i className='ri-arrow-down-fill tw:text-[11.2px] text-primary' /> : null}
        </span>
      ),
      selector: (row: CheckSummaryType) => {
        return <span className='tw:tw:text-center tw:text-[11.2px]'>{FormatCurrency(state.currentRegion, getTotalPaid(row.orderTotal, row.deductions, row.charges))}</span>
      },
      sortable: false,
      left: true,
      compact: true,
    },
    {
      name: (
        <span className='tw:font-bold tw:text-[13px]' style={{ cursor: 'pointer' }} onClick={() => setSortBy({ key: 'deductions', asc: !sortBy.asc })}>
          Deductions{' '}
          {sortBy.key === 'deductions' ? sortBy.asc ? <i className='ri-arrow-up-fill tw:text-[11.2px] text-primary' /> : <i className='ri-arrow-down-fill tw:text-[11.2px] text-primary' /> : null}
        </span>
      ),
      selector: (row: CheckSummaryType) => <span className='tw:text-center tw:text-[11.2px] tw:text-danger'>{FormatCurrency(state.currentRegion, row.deductions)}</span>,
      sortable: false,
      left: true,
      compact: true,
    },
  ]

  return (
    <>
      <DataTable columns={columns} data={filteredItems} progressPending={pending} striped={true} dense={true} />
    </>
  )
}

export default CheckSummaryTable
