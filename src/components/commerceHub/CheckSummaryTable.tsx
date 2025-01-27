/* eslint-disable @next/next/no-img-element */
import AppContext from '@context/AppContext'
import { NoImageAdress } from '@lib/assetsConstants'
import { FormatCurrency } from '@lib/FormatNumbers'
import { CheckSummaryType } from '@typesTs/commercehub/checkSummary'
import moment from 'moment'
import Link from 'next/link'
import React, { useContext } from 'react'
import DataTable from 'react-data-table-component'
import { toast } from 'react-toastify'
import { UncontrolledTooltip } from 'reactstrap'
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
        <span className='fw-bold fs-6 text-nowrap' style={{ cursor: 'pointer' }} onClick={() => setSortBy({ key: 'storeId', asc: !sortBy.asc })}>
          Marketplace
          {sortBy.key === 'storeId' ? sortBy.asc ? <i className='ri-arrow-up-fill fs-7 text-primary' /> : <i className='ri-arrow-down-fill fs-7 text-primary' /> : null}
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
        <span className='fw-bold fs-6' style={{ cursor: 'pointer' }} onClick={() => setSortBy({ key: 'checkNumber', asc: !sortBy.asc })}>
          Check Number{' '}
          {sortBy.key === 'checkNumber' ? sortBy.asc ? <i className='ri-arrow-up-fill fs-7 text-primary' /> : <i className='ri-arrow-down-fill fs-7 text-primary' /> : null}
        </span>
      ),
      selector: (row: CheckSummaryType) => {
        return row.checkNumber ? (
          <div className='d-flex flex-wrap justify-content-start align-items-center'>
            <Link href={`/commercehub/${row.storeName}/${row.checkNumber}`}>
              <a className='fs-7 text-primary fw-normal'>{row.checkNumber}</a>
            </Link>
            <i
              className='ri-file-copy-line fs-6 my-0 mx-1 p-0 text-muted'
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
          <span className='fs-7 mw-30 text-muted fw-light fst-italic'>Pending</span>
        )
      },
      sortable: false,
      left: true,
      compact: true,
    },
    {
      name: (
        <span className='fw-bold fs-6' style={{ cursor: 'pointer' }} onClick={() => setSortBy({ key: 'checkDate', asc: !sortBy.asc })}>
          Check Date{' '}
          {sortBy.key === 'checkDate' ? sortBy.asc ? <i className='ri-arrow-up-fill fs-7 text-primary' /> : <i className='ri-arrow-down-fill fs-7 text-primary' /> : null}
        </span>
      ),
      selector: (row: CheckSummaryType) => <span className='fs-7'>{row.checkDate ? moment.utc(row.checkDate).local().format('D MMM YYYY') : ''}</span>,
      sortable: false,
      left: true,
      compact: true,
    },
    {
      name: (
        <span className='fw-bold fs-6' style={{ cursor: 'pointer' }} onClick={() => setSortBy({ key: 'pending', asc: !sortBy.asc })}>
          Total Paid {sortBy.key === 'pending' ? sortBy.asc ? <i className='ri-arrow-up-fill fs-7 text-primary' /> : <i className='ri-arrow-down-fill fs-7 text-primary' /> : null}
        </span>
      ),
      selector: (row: CheckSummaryType) => {
        return <span className='text-center fs-7'>{FormatCurrency(state.currentRegion, getTotalPaid(row.orderTotal, row.deductions, row.charges))}</span>
      },
      sortable: false,
      left: true,
      compact: true,
    },
    {
      name: (
        <span className='fw-bold fs-6' style={{ cursor: 'pointer' }} onClick={() => setSortBy({ key: 'deductions', asc: !sortBy.asc })}>
          Deductions{' '}
          {sortBy.key === 'deductions' ? sortBy.asc ? <i className='ri-arrow-up-fill fs-7 text-primary' /> : <i className='ri-arrow-down-fill fs-7 text-primary' /> : null}
        </span>
      ),
      selector: (row: CheckSummaryType) => <span className='text-center fs-7 text-danger'>{FormatCurrency(state.currentRegion, row.deductions)}</span>,
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
