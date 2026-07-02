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
      name: <span className='font-bold text-[13px]'>Image</span>,
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
        <span className='font-bold text-[13px]'>
          Title
          <br />
          SKU
        </span>
      ),
      selector: (row: SPSCommerceItem) => {
        return (
          <div className='text-[11.2px] flex flex-col justify-start items-start gap-0 pe-2'>
            <div className='flex flex-row justify-start items-center text-[11.2px]'>
              <Link href={`/product/${row.inventoryId}/${row.sku}`}>
                <p className='m-0 p-0 text-primary font-semibold text-[13px]'>{row.sku}</p>
              </Link>
              <CopyTextToClipboard text={row.sku} label='SKU' />{' '}
            </div>
            <span className='m-0 p-0 text-black text-[11.2px] text-wrap'>{row.title}</span>
            {row.note && <i className='ri-information-fill text-[16.25px] text-warning' id={`tooltip${row.inventoryId}`} />}
            {row.note && (
              <SCTooltip target={`tooltip${row.inventoryId}`} placement='right' key={`tooltip${row.inventoryId}`}>
                <p className='text-[11.2px] text-primary m-0 p-0'>{row.note}</p>
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
      name: <span className='font-bold text-[13px]'>Integration SKU</span>,
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
      name: <span className='font-bold text-[13px]'>UPC</span>,
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
      name: <span className='font-bold text-[13px]'>Total Available</span>,
      selector: (row: SPSCommerceItem) => FormatIntNumber(state.currentRegion, row.quantity ? Object.values(row.quantity).reduce((acc, qty) => acc + qty, 0) : 0),
      sortable: true,
      compact: true,
      center: true,
      sortFunction: (rowA: SPSCommerceItem, rowB: SPSCommerceItem) =>
        sortNumbers(
          Object.values(rowA.quantity).reduce((acc, qty) => acc + qty, 0),
          Object.values(rowB.quantity).reduce((acc, qty) => acc + qty, 0)
        ),
    },
    {
      name: <span className='font-bold text-[13px]'>Should Update</span>,
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
