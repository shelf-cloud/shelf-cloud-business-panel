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
        <span className='font-bold text-[13px] text-nowrap' style={{ cursor: 'pointer' }} onClick={() => setSortBy({ key: 'storeId', asc: !sortBy.asc })}>
          Marketplace
          {sortBy.key === 'storeId' ? sortBy.asc ? <i className='ri-arrow-up-fill text-[11.2px] text-primary' /> : <i className='ri-arrow-down-fill text-[11.2px] text-primary' /> : null}
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
        <span className='font-bold text-[13px]' style={{ cursor: 'pointer' }} onClick={() => setSortBy({ key: 'checkNumber', asc: !sortBy.asc })}>
          Check Number{' '}
          {sortBy.key === 'checkNumber' ? sortBy.asc ? <i className='ri-arrow-up-fill text-[11.2px] text-primary' /> : <i className='ri-arrow-down-fill text-[11.2px] text-primary' /> : null}
        </span>
      ),
      selector: (row: CheckSummaryType) => {
        return row.checkNumber ? (
          <div className='flex flex-wrap justify-start items-center'>
            <Link href={`/commercehub/${row.storeName}/${row.checkNumber}`} className='text-[11.2px] !text-primary font-normal'>
              {row.checkNumber}
            </Link>
            <i
              className='ri-file-copy-line text-[13px] my-0 mx-1 p-0 text-[color:var(--bs-secondary-color)]'
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
          <span className='text-[11.2px] text-[var(--bs-secondary-color)] font-light italic'>Pending</span>
        )
      },
      sortable: false,
      left: true,
      compact: true,
    },
    {
      name: (
        <span className='font-bold text-[13px]' style={{ cursor: 'pointer' }} onClick={() => setSortBy({ key: 'checkDate', asc: !sortBy.asc })}>
          Check Date{' '}
          {sortBy.key === 'checkDate' ? sortBy.asc ? <i className='ri-arrow-up-fill text-[11.2px] text-primary' /> : <i className='ri-arrow-down-fill text-[11.2px] text-primary' /> : null}
        </span>
      ),
      selector: (row: CheckSummaryType) => <span className='text-[11.2px]'>{row.checkDate ? moment.utc(row.checkDate).local().format('D MMM YYYY') : ''}</span>,
      sortable: false,
      left: true,
      compact: true,
    },
    {
      name: (
        <span className='font-bold text-[13px]' style={{ cursor: 'pointer' }} onClick={() => setSortBy({ key: 'pending', asc: !sortBy.asc })}>
          Total Paid {sortBy.key === 'pending' ? sortBy.asc ? <i className='ri-arrow-up-fill text-[11.2px] text-primary' /> : <i className='ri-arrow-down-fill text-[11.2px] text-primary' /> : null}
        </span>
      ),
      selector: (row: CheckSummaryType) => {
        return <span className='text-center text-[11.2px]'>{FormatCurrency(state.currentRegion, getTotalPaid(row.orderTotal, row.deductions, row.charges))}</span>
      },
      sortable: false,
      left: true,
      compact: true,
    },
    {
      name: (
        <span className='font-bold text-[13px]' style={{ cursor: 'pointer' }} onClick={() => setSortBy({ key: 'deductions', asc: !sortBy.asc })}>
          Deductions{' '}
          {sortBy.key === 'deductions' ? sortBy.asc ? <i className='ri-arrow-up-fill text-[11.2px] text-primary' /> : <i className='ri-arrow-down-fill text-[11.2px] text-primary' /> : null}
        </span>
      ),
      selector: (row: CheckSummaryType) => <span className='text-center text-[11.2px] text-danger'>{FormatCurrency(state.currentRegion, row.deductions)}</span>,
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
