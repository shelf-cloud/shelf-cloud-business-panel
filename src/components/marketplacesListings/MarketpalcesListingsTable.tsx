/* eslint-disable @next/next/no-img-element */
 
import Link from 'next/link'
import { useContext } from 'react'

import CopyTextToClipboard from '@components/ui/CopyTextToClipboard'
import AppContext from '@context/AppContext'
import { MarketplaceListingsProduct } from '@hooks/products/useMarketplaceListings'
import { NoImageAdress } from '@lib/assetsConstants'
import { sortStringsCaseInsensitive } from '@lib/helperFunctions'
import DataTable from 'react-data-table-component'

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
      name: <span className='fw-semibold fs-6'>Image</span>,
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
        <span className='fw-semibold fs-6'>
          Title
          <br />
          SKU
        </span>
      ),
      selector: (row: MarketplaceListingsProduct) => {
        return (
          <div className='fs-7 d-flex flex-column justify-content-start align-items-start gap-0 pe-2'>
            <div className='d-flex flex-row justify-content-start align-items-center fs-7'>
              <Link href={`/product/${row.inventoryId}/${row.sku}`}>
                <p className='m-0 p-0 text-primary fw-semibold fs-6'>{row.sku}</p>
              </Link>
              <CopyTextToClipboard text={row.sku} label='SKU' />{' '}
            </div>
            <span className='m-0 p-0 text-black fw-semibold fs-7 text-wrap'>{row.title}</span>
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
        <span className='fw-semibold fs-6'>
          ASIN
          <br />
          FNSKU
          <br />
          Barcode
        </span>
      ),
      selector: (row: MarketplaceListingsProduct) => {
        return (
          <div className='fs-7 d-flex flex-column justify-item-start gap-1'>
            {row.asin !== '' && (
              <div className='d-flex flex-row justify-content-start align-items-center'>
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
              <div className='d-flex flex-row justify-content-start align-items-center'>
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
      name: <span className='fw-semibold fs-6'>Brand</span>,
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
      name: <span className='fw-semibold fs-6'>Supplier</span>,
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
      name: <span className='fw-semibold fs-6 text-center'>Mapped</span>,
      id: MAPPED_COL_ID,
      selector: (row: MarketplaceListingsProduct) => {
        if (marketplaceId === '') {
          return <span className='fs-7 text-muted'>Select Marketplace</span>
        }

        const listing = row.listings.find((listing) => listing.storeId_true?.toString() === marketplaceId)

        if (listing) {
          return (
            <div className='d-flex flex-row justify-content-end align-items-center gap-2'>
              <i className='las la-link fs-4 text-success m-0 p-0' />
              <Link href={row.isKit ? `/kit/${row.inventoryId}/${row.sku}` : `/product/${row.inventoryId}/${row.sku}`} target='blank' rel='noopener noreferrer'>
                <span className='fs-7'>{listing.storeSku}</span>
              </Link>
              {listing.isHidden ? (
                <p className='fs-7 m-0 p-0'>
                  <i className='mdi mdi-eye-off label-icon align-middle fs-6 me-0 text-danger' /> <span className='text-muted'>Hidden</span>
                </p>
              ) : null}
              {listing.isManual ? (
                <p className='fs-7 m-0 p-0'>
                  <i className='mdi mdi-hand-back-left label-icon align-middle fs-6 me-0 text-primary' /> <span className='text-muted'>Manual</span>
                </p>
              ) : null}
            </div>
          )
        } else {
          return (
            <div className='d-flex flex-row justify-content-end align-items-center gap-2'>
              <i className='las la-link fs-4 text-danger m-0 p-0' />
              <span className='fs-7 text-muted'>Not Mapped</span>
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
