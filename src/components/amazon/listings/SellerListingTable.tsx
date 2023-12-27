/* eslint-disable @next/next/no-img-element */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useContext, useState } from 'react'
import DataTable from 'react-data-table-component'
import AppContext from '@context/AppContext'
import { Listing } from '@typesTs/amazon/listings'
import MappedListing from '@components/modals/amazon/MappedListing'
import Link from 'next/link'

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
    listingId: 0,
    shelfCloudSku: '',
    shelfCloudSkuId: 0,
    currentSkuMapped: '',
    currentSkuIdMapped: 0,
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
      name: <span className='font-weight-bold fs-13'>Image</span>,
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
              src={
                row.image
                  ? row.image
                  : 'https://firebasestorage.googleapis.com/v0/b/etiquetas-fba.appspot.com/o/image%2Fno-image.png?alt=media&token=c2232af5-43f6-4739-84eb-1d4803c44770'
              }
              onError={(e) =>
                (e.currentTarget.src =
                  'https://firebasestorage.googleapis.com/v0/b/etiquetas-fba.appspot.com/o/image%2Fno-image.png?alt=media&token=c2232af5-43f6-4739-84eb-1d4803c44770')
              }
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
        <span className='font-weight-bold fs-13'>
          SKU
          <br />
          Brand
        </span>
      ),
      selector: (row: Listing) => {
        return (
          <div>
            <p className='fs-7 m-0 p-0 fw-semibold'>{row.sku}</p>
            <p style={{ margin: '0px' }} className='fs-7 text-muted'>
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
        <span className='font-weight-bold fs-13'>
          ASIN
          <br />
          FNSKU
        </span>
      ),
      selector: (row: Listing) => {
        return (
          <div>
            <p className='m-0 fs-7'>
              {/* <a href={`https://www.amazon.${state.currentRegion == 'us' ? 'com' : 'es'}/exec/obidos/ASIN${row.asin}`} target='blank'> */}
              <a href={`https://www.amazon.${state.currentRegion == 'us' ? 'com' : 'es'}/dp/${row.asin}`} target='blank'>
                {row.asin}
              </a>
            </p>
            {row.fnsku && row.asin !== row.fnsku && <p className='m-0 fs-7'>{row.fnsku}</p>}
          </div>
        )
      },
      sortable: false,
      wrap: false,
      compact: true,
      grow: 0,
    },
    {
      name: <span className='font-weight-bold fs-13'>Condition</span>,
      selector: (row: Listing) => {
        return (
          <>
            <p className='m-0 p-0 fs-7 text-center'>{row.condition}</p>
            {row.show === 0 && <span className='text-info fs-7 text-center opacity-75'>Hidden</span>}
          </>
        )
      },
      sortable: true,
      center: true,
      compact: true,
      grow: 0,
    },
    {
      name: <span className='font-weight-bold fs-13 text-center'>Fulfillment Channel</span>,
      selector: (row: Listing) => {
        return (
          <div>
            {row.mfn_listing_exists ? <p className='m-0 p-0 fs-7'>Merchant</p> : <></>}
            {row.afn_listing_exists ? <p className='m-0 p-0 fs-7'>Amazon FBA</p> : <></>}
          </div>
        )
      },
      center: true,
      sortable: false,
      compact: true,
      grow: 0,
    },
    {
      name: <span className='font-weight-bold fs-13'>Fulfillable</span>,
      selector: (row: Listing) => row.afn_fulfillable_quantity,
      center: true,
      sortable: true,
      compact: true,
      grow: 0,
    },
    {
      name: <span className='font-weight-bold fs-13'>Reserved</span>,
      selector: (row: Listing) => row.afn_reserved_quantity,
      center: true,
      sortable: true,
      compact: true,
      grow: 0,
    },
    {
      name: <span className='font-weight-bold fs-13'>Unsellable</span>,
      selector: (row: Listing) => row.afn_unsellable_quantity,
      center: true,
      sortable: true,
      compact: true,
      grow: 0,
    },
    {
      name: <span className='font-weight-bold fs-13'>Inbound</span>,
      selector: (row: Listing) => row.afn_inbound_receiving_quantity + row.afn_inbound_shipped_quantity + row.afn_inbound_working_quantity,
      center: true,
      sortable: true,
      compact: true,
      grow: 0,
    },
    {
      name: <span className='font-weight-bold fs-13 text-center'>Mapped to ShelfCloud</span>,
      selector: (row: Listing) => {
        return (
          <div>
            {row.shelfcloud_sku ? (
              <div className='d-flex flex-row justify-content-end align-items-center gap-2'>
                <i
                  className='las la-link fs-4 text-success m-0 p-0'
                  style={{ cursor: 'pointer' }}
                  onClick={() =>
                    setshowMappedListingModal((prev) => {
                      return {
                        ...prev,
                        show: true,
                        listingSku: row.sku,
                        listingId: row.id,
                        currentSkuMapped: row.shelfcloud_sku || '',
                        currentSkuIdMapped: row.shelfcloud_sku_id || 0,
                      }
                    })
                  }
                />
                <Link href={`/product/${row.shelfcloud_sku_id}/${row.shelfcloud_sku}`} passHref>
                  <a>
                    <span className='fs-7'>{row.shelfcloud_sku}</span>
                  </a>
                </Link>
              </div>
            ) : (
              <div
                className='d-flex flex-row justify-content-end align-items-center gap-2'
                style={{ cursor: 'pointer' }}
                onClick={() =>
                  setshowMappedListingModal((prev) => {
                    return {
                      ...prev,
                      show: true,
                      listingSku: row.sku,
                      listingId: row.id,
                    }
                  })
                }>
                <i className='las la-link fs-4 text-danger m-0 p-0' />
                <span className='fs-7 text-muted'>Not Mapped</span>
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
