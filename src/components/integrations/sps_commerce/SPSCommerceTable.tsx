/* eslint-disable @next/next/no-img-element */
 
import Link from 'next/link'
import { useContext } from 'react'

import CopyTextToClipboard from '@components/ui/CopyTextToClipboard'
import SCTooltip from '@components/ui/SCTooltip'
import AppContext from '@context/AppContext'
import { SPSCommerceItem } from '@hooks/integrations/useSPSCommerceIntegrations'
import { FormatIntNumber } from '@lib/FormatNumbers'
import { NoImageAdress } from '@lib/assetsConstants'
import { sortBooleans, sortNumbers, sortStringsCaseInsensitive } from '@lib/helperFunctions'
import DataTable from 'react-data-table-component'

type CloneProductModal = {
  isOpen: boolean
  originalId: number
  originalName: string
  originalSku: string
}

type Props = {
  tableData: SPSCommerceItem[]
  pending: boolean
  setSelectedRows: (selectedRows: SPSCommerceItem[]) => void
  toggledClearRows: boolean
  setcloneProductModal?: (prev: CloneProductModal) => void
}

const SPSCommerceTable = ({ tableData, pending, setSelectedRows, toggledClearRows }: Props) => {
  const { state } = useContext(AppContext)
  const handleSelectedRows = ({ selectedRows }: { selectedRows: SPSCommerceItem[] }) => {
    setSelectedRows(selectedRows)
  }

  const columns: any = [
    {
      name: <span className='fw-bold fs-6'>Image</span>,
      selector: (row: SPSCommerceItem) => {
        return (
          <Link href={`/product/${row.inventoryId}/${row.sku}`}>
            <div
              style={{
                width: '35px',
                height: '45px',
                margin: '2px 0px',
                position: 'relative',
              }}>
              <img
                loading='lazy'
                src={row.image ? row.image : NoImageAdress}
                onError={(e) => (e.currentTarget.src = NoImageAdress)}
                alt='product Image'
                style={{ objectFit: 'contain', objectPosition: 'center', width: '100%', height: '100%' }}
              />
            </div>
          </Link>
        )
      },
      sortable: false,
      center: false,
      compact: true,
      width: '65px',
    },
    {
      name: (
        <span className='fw-bold fs-6'>
          Title
          <br />
          SKU
        </span>
      ),
      selector: (row: SPSCommerceItem) => {
        return (
          <div className='fs-7 d-flex flex-column justify-content-start align-items-start gap-0 pe-2'>
            <div className='d-flex flex-row justify-content-start align-items-center fs-7'>
              <Link href={`/product/${row.inventoryId}/${row.sku}`}>
                <p className='m-0 p-0 text-primary fw-semibold fs-6'>{row.sku}</p>
              </Link>
              <CopyTextToClipboard text={row.sku} label='SKU' />{' '}
            </div>
            <span className='m-0 p-0 text-black fs-7 text-wrap'>{row.title}</span>
            {row.note && <i className='ri-information-fill fs-5 text-warning' id={`tooltip${row.inventoryId}`} />}
            {row.note && (
              <SCTooltip target={`tooltip${row.inventoryId}`} placement='right' key={`tooltip${row.inventoryId}`}>
                <p className='fs-7 text-primary m-0 p-0'>{row.note}</p>
              </SCTooltip>
            )}
          </div>
        )
      },
      sortable: true,
      wrap: true,
      compact: false,
      minWidth: '200px',
      grow: 2,
      sortFunction: (rowA: SPSCommerceItem, rowB: SPSCommerceItem) => sortStringsCaseInsensitive(rowA.title.toLowerCase(), rowB.title.toLowerCase()),
    },
    {
      name: <span className='fw-bold fs-6'>Integration SKU</span>,
      selector: (row: SPSCommerceItem) => row.integrationSku,
      sortable: true,
      left: true,
      compact: true,
      wrap: false,
      style: {
        fontSize: '0.7rem',
      },
    },
    {
      name: <span className='fw-bold fs-6'>UPC</span>,
      selector: (row: SPSCommerceItem) => row.barcode,
      sortable: true,
      left: true,
      compact: true,
      wrap: false,
      style: {
        fontSize: '0.7rem',
      },
    },
    {
      name: <span className='fw-bold fs-6'>Available</span>,
      selector: (row: SPSCommerceItem) => FormatIntNumber(state.currentRegion, row.quantity),
      sortable: true,
      compact: true,
      center: true,
      sortFunction: (rowA: SPSCommerceItem, rowB: SPSCommerceItem) => sortNumbers(rowA.quantity, rowB.quantity),
    },
    {
      name: <span className='fw-bold fs-6'>Should Update</span>,
      selector: (row: SPSCommerceItem) => (row.shouldUpdate ? <span className='text-success'>Yes</span> : <span className='text-danger'>No</span>),
      sortable: true,
      compact: true,
      center: true,
      sortFunction: (rowA: SPSCommerceItem, rowB: SPSCommerceItem) => sortBooleans(rowA.shouldUpdate, rowB.shouldUpdate),
    },
  ]

  return (
    <>
      <DataTable
        columns={columns}
        data={tableData}
        progressPending={pending}
        striped={true}
        dense
        defaultSortFieldId={2}
        selectableRows
        onSelectedRowsChange={handleSelectedRows}
        clearSelectedRows={toggledClearRows}
        pagination={tableData.length > 100 ? true : false}
        paginationPerPage={50}
        paginationRowsPerPageOptions={[50, 100, 200, 500]}
        paginationComponentOptions={{
          rowsPerPageText: 'Products per page:',
          rangeSeparatorText: 'of',
          noRowsPerPage: false,
          selectAllRowsItem: true,
          selectAllRowsItemText: 'All',
        }}
      />
    </>
  )
}

export default SPSCommerceTable
