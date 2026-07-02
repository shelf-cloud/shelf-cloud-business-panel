/* eslint-disable @next/next/no-img-element */
 
import Link from 'next/link'
import { useContext, useState } from 'react'

import MappedListing from '@components/modals/amazon/MappedListing'
import AppContext from '@context/AppContext'
import { NoImageAdress } from '@lib/assetsConstants'
import { Listing } from '@typesTs/amazon/listings'
import DataTable from '@components/Common/DataTableSC'

type Props = {
  tableData: Listing[]
  pending: boolean
  setSelectedRows: (selectedRows: Listing[]) => void
  toggledClearRows: boolean
}

const SellerListingTable = ({ tableData, pending, setSelectedRows, toggledClearRows }: Props) => {
  const { state }: any = useContext(AppContext)
  const [loading, setLoading] = useState(false)
  const [showMappedListingModal, setshowMappedListingModal] = useState({
    show: false,
    listingSku: '',
    listingFnsku: '',
    listingId: 0,
    shelfCloudSku: '',
    shelfCloudSkuId: 0,
    shelfCloudSkuIsKit: false,
    currentSkuMapped: '',
    currentSkuIdMapped: 0,
    currentSkuIsKitMapped: false,
  })
  const caseInsensitiveSort = (rowA: Listing, rowB: Listing) => {
    const a = rowA.sku.toLowerCase()
    const b = rowB.sku.toLowerCase()

    if (a > b) {
      return 1
    }

    if (b > a) {
      return -1
    }

    return 0
  }

  const isMappedSort = (rowA: Listing, rowB: Listing) => {
    const a = rowA.shelfcloud_sku ? 1 : 0
    const b = rowB.shelfcloud_sku ? 1 : 0

    if (a > b) {
      return 1
    }

    if (b > a) {
      return -1
    }

    return 0
  }

  const handleSelectedRows = ({ selectedRows }: { selectedRows: Listing[] }) => {
    setSelectedRows(selectedRows)
  }

  const columns: any = [
    {
      name: <span className='tw:font-bold tw:text-[13px]'>Image</span>,
      selector: (row: Listing) => {
        return (
          <div
            style={{
              width: '60px',
              height: '50px',
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
        )
      },
      sortable: false,
      center: true,
      compact: true,
      width: '60px',
      grow: 0,
    },
    {
      name: (
        <span className='tw:font-bold tw:text-[13px]'>
          SKU
          <br />
          Brand
        </span>
      ),
      selector: (row: Listing) => {
        return (
          <div>
            <p className='tw:text-[11.2px] tw:m-0 tw:p-0 tw:font-semibold'>{row.sku}</p>
            <p style={{ margin: '0px' }} className='tw:text-[11.2px] tw:text-[var(--bs-secondary-color)]'>
              {row.brand}
            </p>
          </div>
        )
      },
      sortable: true,
      wrap: true,
      grow: 2.2,
      sortFunction: caseInsensitiveSort,
    },
    {
      name: (
        <span className='tw:font-bold tw:text-[13px]'>
          ASIN
          <br />
          FNSKU
        </span>
      ),
      selector: (row: Listing) => {
        return (
          <div>
            <p className='tw:m-0 tw:text-[11.2px]'>
              {/* <a href={`https://www.amazon.${state.currentRegion == 'us' ? 'com' : 'es'}/exec/obidos/ASIN${row.asin}`} target='blank'> */}
              <a href={`https://www.amazon.${state.currentRegion == 'us' ? 'com' : 'es'}/dp/${row.asin}`} target='blank' rel='noopener noreferrer'>
                {row.asin}
              </a>
            </p>
            {row.fnsku && row.asin !== row.fnsku && <p className='tw:m-0 tw:text-[11.2px]'>{row.fnsku}</p>}
          </div>
        )
      },
      sortable: false,
      wrap: false,
      compact: true,
      grow: 0,
    },
    {
      name: <span className='tw:font-bold tw:text-[13px]'>Condition</span>,
      selector: (row: Listing) => {
        return (
          <>
            <p className='tw:m-0 tw:p-0 tw:text-[11.2px] tw:text-center'>{row.condition}</p>
            {row.show === 0 && <span className='tw:text-info tw:text-[11.2px] tw:text-center tw:opacity-75'>Hidden</span>}
          </>
        )
      },
      sortable: true,
      center: true,
      compact: true,
      grow: 0,
    },
    {
      name: <span className='tw:font-bold tw:text-[13px] tw:text-center'>Fulfillment Channel</span>,
      selector: (row: Listing) => {
        return (
          <div>
            {row.mfn_listing_exists ? <p className='tw:m-0 tw:p-0 tw:text-[11.2px]'>Merchant</p> : <></>}
            {row.afn_listing_exists ? <p className='tw:m-0 tw:p-0 tw:text-[11.2px]'>Amazon FBA</p> : <></>}
          </div>
        )
      },
      center: true,
      sortable: false,
      compact: true,
      grow: 0,
    },
    {
      name: <span className='tw:font-bold tw:text-[13px]'>Fulfillable</span>,
      selector: (row: Listing) => row.afn_fulfillable_quantity,
      center: true,
      sortable: true,
      compact: true,
      grow: 0,
    },
    {
      name: <span className='tw:font-bold tw:text-[13px]'>Reserved</span>,
      selector: (row: Listing) => row.afn_reserved_quantity,
      center: true,
      sortable: true,
      compact: true,
      grow: 0,
    },
    {
      name: <span className='tw:font-bold tw:text-[13px]'>Unsellable</span>,
      selector: (row: Listing) => row.afn_unsellable_quantity,
      center: true,
      sortable: true,
      compact: true,
      grow: 0,
    },
    {
      name: <span className='tw:font-bold tw:text-[13px]'>Inbound</span>,
      selector: (row: Listing) => row.afn_inbound_receiving_quantity + row.afn_inbound_shipped_quantity + row.afn_inbound_working_quantity,
      center: true,
      sortable: true,
      compact: true,
      grow: 0,
    },
    {
      name: <span className='tw:font-bold tw:text-[13px] tw:text-center'>Mapped to ShelfCloud</span>,
      selector: (row: Listing) => {
        return (
          <div>
            {row.shelfcloud_sku ? (
              <div className='tw:flex tw:flex-row tw:justify-end tw:items-center tw:gap-2'>
                <i
                  className='las la-link fs-4 text-success m-0 p-0'
                  style={{ cursor: 'pointer' }}
                  onClick={() =>
                    setshowMappedListingModal((prev) => {
                      return {
                        ...prev,
                        show: true,
                        listingSku: row.sku,
                        listingFnsku: row.fnsku.toLowerCase() === row.asin.toLowerCase() ? '' : row.fnsku,
                        listingId: row.id,
                        currentSkuMapped: row.shelfcloud_sku || '',
                        currentSkuIdMapped: row.shelfcloud_sku_id || 0,
                        currentSkuIsKitMapped: row.shelfcloud_isKit || false,
                      }
                    })
                  }
                />
                <Link
                  href={row.shelfcloud_isKit ? `/kit/${row.shelfcloud_sku_id}/${row.shelfcloud_sku}` : `/product/${row.shelfcloud_sku_id}/${row.shelfcloud_sku}`}
                  target='blank'
                  rel='noopener noreferrer'>
                  <span className='tw:text-[11.2px]'>{row.shelfcloud_sku}</span>
                </Link>
              </div>
            ) : (
              <div
                className='tw:flex tw:flex-row tw:justify-end tw:items-center tw:gap-2'
                style={{ cursor: 'pointer' }}
                onClick={() =>
                  setshowMappedListingModal((prev) => {
                    return {
                      ...prev,
                      show: true,
                      listingSku: row.sku,
                      listingFnsku: row.fnsku.toLowerCase() === row.asin.toLowerCase() ? '' : row.fnsku,
                      listingId: row.id,
                    }
                  })
                }>
                <i className='las la-link fs-4 text-danger m-0 p-0' />
                <span className='tw:text-[11.2px] tw:text-[var(--bs-secondary-color)]'>Not Mapped</span>
              </div>
            )}
          </div>
        )
      },
      wrap: true,
      center: true,
      sortable: true,
      sortFunction: isMappedSort,
      compact: false,
      grow: 2.2,
    },
  ]

  return (
    <>
      <DataTable
        columns={columns}
        data={tableData}
        progressPending={pending}
        striped={true}
        selectableRows
        onSelectedRowsChange={handleSelectedRows}
        clearSelectedRows={toggledClearRows}
        dense
        defaultSortFieldId={2}
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
      {showMappedListingModal.show && (
        <MappedListing showMappedListingModal={showMappedListingModal} setshowMappedListingModal={setshowMappedListingModal} loading={loading} setLoading={setLoading} />
      )}
    </>
  )
}

export default SellerListingTable
