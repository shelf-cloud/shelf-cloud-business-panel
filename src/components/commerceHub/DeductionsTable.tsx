/* eslint-disable @next/next/no-img-element */
import AppContext from '@context/AppContext'
import { FormatCurrency } from '@lib/FormatNumbers'
import { CleanSpecialCharacters } from '@lib/SkuFormatting'
import { DeductionType } from '@typesTs/commercehub/deductions'
import moment from 'moment'
import React, { useContext } from 'react'
import DataTable from 'react-data-table-component'
import { toast } from 'react-toastify'
import { UncontrolledTooltip } from 'reactstrap'

type EditComment = {
  show: boolean
  id: number
  comment: string
}

type Props = {
  filteredItems: DeductionType[]
  pending: boolean
  setSelectedRows: (selectedRows: DeductionType[]) => void
  toggledClearRows: boolean
  setEditCommentModal: (prev: EditComment) => void
}

const DeductionsTable = ({ filteredItems, pending, setSelectedRows, toggledClearRows, setEditCommentModal }: Props) => {
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

  const handleSelectedRows = ({ selectedRows }: { selectedRows: DeductionType[] }) => {
    setSelectedRows(selectedRows)
  }

  const columns: any = [
    {
      name: <span className='fw-bolder fs-6'>Marketplace</span>,
      selector: (row: DeductionType) => {
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
      sortFunction: (rowA: DeductionType, rowB: DeductionType) => sortStrings(rowA.channelName, rowB.channelName),
    },
    {
      name: <span className='fw-bold fs-6'>Invoice No.</span>,
      selector: (row: DeductionType) => (
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
      left: true,
      compact: true,
    },
    {
      name: <span className='fw-bold fs-6'>PO No.</span>,
      selector: (row: DeductionType) => (
        <div className='d-flex flex-wrap justify-content-start align-items-center'>
          <p className='m-0 p-0 text-muted fs-7'>{row.poNumber}</p>
        </div>
      ),
      sortable: false,
      left: true,
      compact: true,
    },
    {
      name: <span className='fw-bold fs-6'>Comments</span>,
      selector: (row: DeductionType) => (
        <div className='d-flex flex-row justify-content-start align-items-center gap-2'>
          <span className='fs-7'>{row.comments}</span>
          <i className='ri-pencil-fill text-primary' style={{ cursor: 'pointer' }} onClick={() => setEditCommentModal({ show: true, id: row.id, comment: row.comments ?? '' })} />
        </div>
      ),
      sortable: false,
      left: true,
      compact: true,
      wrap: true,
      grow: 1.2,
    },
    {
      name: <span className='fw-bold fs-6'>Check Date</span>,
      selector: (row: DeductionType) => <span className='fs-7'>{row.checkDate ? moment.utc(row.checkDate).local().format('D MMM YYYY') : ''}</span>,
      sortable: true,
      center: true,
      compact: true,
      sortFunction: (rowA: DeductionType, rowB: DeductionType) => {
        if (rowA.checkDate && rowB.checkDate) sortDates(rowA.checkDate, rowB.checkDate)
      },
    },
    {
      name: <span className='fw-bold fs-6'>Check Number</span>,
      selector: (row: DeductionType) => <span className='fs-7'>{row.checkNumber}</span>,
      sortable: false,
      center: true,
      compact: true,
    },
    {
      name: <span className='fw-bold fs-6'>Deduction</span>,
      selector: (row: DeductionType) => <span className='fs-7 text-danger'>{row.checkTotal ? FormatCurrency(state.currentRegion, row.checkTotal) : ''}</span>,
      sortable: false,
      center: true,
      compact: true,
    },
    {
      name: <span className='fw-bolder fs-6'>Review Status</span>,
      selector: (row: DeductionType) => {
        switch (row.status) {
          case 'closed':
          case 'resolved':
            return <span className='badge text-uppercase badge-soft-dark p-2'>{` ${row.status} `}</span>
            break
          case 'reviewing':
            return <span className='badge text-uppercase badge-soft-warning p-2'>{` ${row.status} `}</span>
            break
          case 'pending':
            return <span className='badge text-uppercase badge-soft-info p-2'>{` ${row.status} `}</span>
            break
          default:
            return <span className='badge text-uppercase badge-soft-info p-2'>{` pending `}</span>
            break
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
