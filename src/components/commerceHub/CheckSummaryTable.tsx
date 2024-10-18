/* eslint-disable @next/next/no-img-element */
import AppContext from '@context/AppContext'
import { FormatCurrency } from '@lib/FormatNumbers'
import { CheckSummaryType } from '@typesTs/commercehub/checkSummary'
import moment from 'moment'
import Link from 'next/link'
import React, { useContext } from 'react'
import DataTable from 'react-data-table-component'
import { toast } from 'react-toastify'
import { UncontrolledTooltip } from 'reactstrap'

type Props = {
  filteredItems: CheckSummaryType[]
  pending: boolean
}

const CheckSummaryTable = ({ filteredItems, pending }: Props) => {
  const { state }: any = useContext(AppContext)

  const sortDates = (Adate: string, Bdate: string) => {
    const a = moment(Adate)
    const b = moment(Bdate)
    if (a.isBefore(b)) {
      return -1
    } else {
      return 1
    }
  }
  const sortStrings = (rowA: string, rowB: string) => {
    if (rowA.localeCompare(rowB)) {
      return 1
    } else {
      return -1
    }
  }

  const columns: any = [
    {
      name: <span className='fw-bolder fs-6'>Marketplace</span>,
      selector: (row: CheckSummaryType) => {
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
      sortFunction: (rowA: CheckSummaryType, rowB: CheckSummaryType) => sortStrings(rowA.storeName, rowB.storeName),
    },
    {
      name: <span className='fw-bold fs-6'>Check Number</span>,
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
      name: <span className='fw-bold fs-6'>Check Date</span>,
      selector: (row: CheckSummaryType) => <span className='fs-7'>{row.checkDate ? moment.utc(row.checkDate).local().format('D MMM YYYY') : ''}</span>,
      sortable: true,
      left: true,
      compact: true,
      sortFunction: (rowA: CheckSummaryType, rowB: CheckSummaryType) => {
        if (rowA.checkDate && rowB.checkDate) sortDates(rowA.checkDate, rowB.checkDate)
      },
    },
    {
      name: <span className='fw-bold fs-6'>Check Paid</span>,
      selector: (row: CheckSummaryType) => {
        const pending = row.checkTotal + row.cashDiscountTotal
        return <span className='text-center fs-7'>{FormatCurrency(state.currentRegion, pending)}</span>
      },
      sortable: false,
      left: true,
      compact: true,
    },
    {
      name: <span className='fw-bold fs-6'>Deductions</span>,
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
