/* eslint-disable @next/next/no-img-element */
 
import Link from 'next/link'
import { useContext } from 'react'

import CopyTextToClipboard from '@components/ui/CopyTextToClipboard'
import AppContext from '@context/AppContext'
import { MarketplaceListingsProduct } from '@hooks/products/useMarketplaceListings'
import { NoImageAdress } from '@lib/assetsConstants'
import { sortStringsCaseInsensitive } from '@lib/helperFunctions'
import DataTable from '@components/Common/DataTableSC'

type Props = {
  tableData: MarketplaceListingsProduct[]
  pending: boolean
  setSelectedRows: (selectedRows: MarketplaceListingsProduct[]) => void
  toggledClearRows: boolean
  marketplaceId: string
}

const MAPPED_COL_ID = 'mapped'

const MarketplacesListingsTable = ({ tableData, pending, setSelectedRows, toggledClearRows, marketplaceId }: Props) => {
  const { state }: any = useContext(AppContext)

  const isMappedSort = (rowA: MarketplaceListingsProduct, rowB: MarketplaceListingsProduct) => {
    const a = rowA.listings.find((listing) => listing.storeId_true?.toString() === marketplaceId) ? 1 : 0
    const b = rowB.listings.find((listing) => listing.storeId_true?.toString() === marketplaceId) ? 1 : 0

    if (a > b) return 1
    if (b > a) return -1
    return 0
  }

  const handleSelectedRows = ({ selectedRows }: { selectedRows: MarketplaceListingsProduct[] }) => {
    setSelectedRows(selectedRows)
  }

  const columns: any = [
    {
      name: <span className='font-semibold text-[13px]'>Image</span>,
      selector: (row: MarketplaceListingsProduct) => {
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
      center: true,
      compact: true,
      width: '65px',
    },
    {
      name: (
        <span className='font-semibold text-[13px]'>
          Title
          <br />
          SKU
        </span>
      ),
      selector: (row: MarketplaceListingsProduct) => {
        return (
          <div className='text-[11.2px] flex flex-col justify-start items-start gap-0 pe-2'>
            <div className='flex flex-row justify-start items-center text-[11.2px]'>
              <Link href={`/product/${row.inventoryId}/${row.sku}`}>
                <p className='m-0 p-0 !text-primary font-semibold text-[13px]'>{row.sku}</p>
              </Link>
              <CopyTextToClipboard text={row.sku} label='SKU' />{' '}
            </div>
            <span className='m-0 p-0 text-black font-semibold text-[11.2px] text-wrap'>{row.title}</span>
          </div>
        )
      },
      sortable: true,
      wrap: true,
      compact: true,
      minWidth: '200px',
      sortFunction: (rowA: MarketplaceListingsProduct, rowB: MarketplaceListingsProduct) => sortStringsCaseInsensitive(rowA.title.toLowerCase(), rowB.title.toLowerCase()),
    },
    {
      name: (
        <span className='font-semibold text-[13px]'>
          ASIN
          <br />
          FNSKU
          <br />
          Barcode
        </span>
      ),
      selector: (row: MarketplaceListingsProduct) => {
        return (
          <div className='text-[11.2px] flex flex-col justify-start gap-1'>
            {row.asin !== '' && (
              <div className='flex flex-row justify-start items-center'>
                <a className='m-0' href={`https://www.amazon.${state.currentRegion == 'us' ? 'com' : 'es'}/dp/${row.asin}`} target='blank' rel='noopener noreferrer'>
                  {row.asin}
                </a>
                <CopyTextToClipboard text={row.asin} label='ASIN' />
              </div>
            )}
            {row.fnSku !== '' && (
              <p className='m-0'>
                {row.fnSku} <CopyTextToClipboard text={row.fnSku} label='FNSKU' />
              </p>
            )}
            {row.barcode !== '' && (
              <div className='flex flex-row justify-start items-center'>
                <p className='m-0'>{row.barcode}</p>
                <CopyTextToClipboard text={row.barcode} label='Barcode' />
              </div>
            )}
          </div>
        )
      },
      sortable: false,
      compact: true,
      // grow: 1,
    },
    {
      name: <span className='font-semibold text-[13px]'>Brand</span>,
      selector: (row: MarketplaceListingsProduct) => row.brand,
      sortable: true,
      left: true,
      compact: true,
      wrap: true,
      style: {
        fontSize: '0.7rem',
      },
    },
    {
      name: <span className='font-semibold text-[13px]'>Supplier</span>,
      selector: (row: MarketplaceListingsProduct) => row.supplier,
      sortable: true,
      left: true,
      compact: true,
      wrap: true,
      style: {
        fontSize: '0.7rem',
      },
      width: '100px',
    },
    {
      name: <span className='font-semibold text-[13px] text-center'>Mapped</span>,
      id: MAPPED_COL_ID,
      selector: (row: MarketplaceListingsProduct) => {
        if (marketplaceId === '') {
          return <span className='text-[11.2px] text-[var(--bs-secondary-color)]'>Select Marketplace</span>
        }

        const listing = row.listings.find((listing) => listing.storeId_true?.toString() === marketplaceId)

        if (listing) {
          return (
            <div className='flex flex-row justify-end items-center gap-2'>
              <i className='las la-link text-[19.5px] text-success m-0 p-0' />
              <Link href={row.isKit ? `/kit/${row.inventoryId}/${row.sku}` : `/product/${row.inventoryId}/${row.sku}`} target='blank' rel='noopener noreferrer'>
                <span className='text-[11.2px]'>{listing.storeSku}</span>
              </Link>
              {listing.isHidden ? (
                <p className='text-[11.2px] m-0 p-0'>
                  <i className='mdi mdi-eye-off label-icon align-middle text-[13px] me-0 text-destructive' /> <span className='text-[var(--bs-secondary-color)]'>Hidden</span>
                </p>
              ) : null}
              {listing.isManual ? (
                <p className='text-[11.2px] m-0 p-0'>
                  <i className='mdi mdi-hand-back-left label-icon align-middle text-[13px] me-0 text-primary' /> <span className='text-[var(--bs-secondary-color)]'>Manual</span>
                </p>
              ) : null}
            </div>
          )
        } else {
          return (
            <div className='flex flex-row justify-end items-center gap-2'>
              <i className='las la-link text-[19.5px] text-destructive m-0 p-0' />
              <span className='text-[11.2px] text-[var(--bs-secondary-color)]'>Not Mapped</span>
            </div>
          )
        }
      },
      wrap: false,
      left: true,
      sortable: true,
      sortFunction: isMappedSort,
      compact: false,
    },
  ]

  return (
    <>
      <DataTable
        key={`marketplace-${marketplaceId || 'none'}`}
        columns={columns}
        data={tableData}
        progressPending={pending}
        striped={true}
        selectableRows
        onSelectedRowsChange={handleSelectedRows}
        clearSelectedRows={toggledClearRows}
        dense
        defaultSortFieldId={MAPPED_COL_ID}
        defaultSortAsc={false}
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

export default MarketplacesListingsTable
