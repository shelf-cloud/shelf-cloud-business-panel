/* eslint-disable @next/next/no-img-element */
import Link from 'next/link'
import { useContext } from 'react'

import AppContext from '@context/AppContext'
import { FormatCurrency, FormatIntNumber } from '@lib/FormatNumbers'
import { NoImageAdress } from '@lib/assetsConstants'
import { sortNumbers, sortStringsCaseInsensitive } from '@lib/helperFunctions'
import { MKP_Product } from '@typesTs/marketplacePricing/marketplacePricing'
import DataTable from 'react-data-table-component'

import MKP_ExpandedDetails from './MKP_ExpandedDetails'

type Props = {
  products: MKP_Product[]
  isLoading: boolean
  //   setSelectedRows: (selectedRows: MKP_Product[]) => void
  //   toggledClearRows: boolean
  handleProposedPrice: (sku: string, storeId: number, value: number) => void
  handleOtherCosts: (sku: string, storeId: number, value: number) => void
  handleSetSingleMargin: (sku: string, storeId: number, value: number) => void
  handleSetProductMargin: (sku: string, value: number) => void
  handleNotes: (sku: string, storeId: number, value: string) => void
}

const MKP_table = ({ products, isLoading, handleOtherCosts, handleProposedPrice, handleSetSingleMargin, handleSetProductMargin, handleNotes }: Props) => {
  const { state }: any = useContext(AppContext)

  //   const handleSelectedRows = ({ selectedRows }: { selectedRows: MKP_Product[] }) => {
  //     setSelectedRows(selectedRows)
  //   }

  const columns: any = [
    {
      name: <span className='fw-semibold text-center fs-7'>Image</span>,
      selector: (row: MKP_Product) => {
        return (
          <Link href={`/product/${row.inventoryId}/${row.sku}`}>
            <div
              style={{
                width: '50px',
                height: '60px',
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
    },
    {
      name: (
        <span className='fw-semibold text-center fs-7'>
          SKU
          <br />
          Title
        </span>
      ),
      selector: (row: MKP_Product) => {
        return (
          <Link href={`/product/${row.inventoryId}/${row.sku}`} target='_blank'>
            <p className='m-0 fs-7 fw-semibold d-flex flex-row justify-content-start align-items-start'>{row.sku}</p>
            <a>
              <p className='fs-7 m-0 fw-semibold text-black'>{row.title}</p>
            </a>
          </Link>
        )
      },
      sortable: true,
      wrap: true,
      compact: true,
      grow: 2,
      sortFunction: (rowA: MKP_Product, rowB: MKP_Product) => sortStringsCaseInsensitive(rowA.sku, rowB.sku),
    },
    {
      name: <span className='fw-semibold text-center fs-7'>On Watch</span>,
      selector: (row: MKP_Product) =>
        Object.values(row.marketplaces).find((marketplace) => marketplace.proposedPrice > 0 && marketplace.proposedPrice !== marketplace.actualPrice) ? (
          <i className='mdi mdi-eye label-icon align-middle fs-5 me-2 text-primary' />
        ) : null,
      sortable: true,
      center: true,
      compact: true,
      with: 'fit-content',
      sortFunction: (rowA: MKP_Product, rowB: MKP_Product) =>
        sortNumbers(
          Object.values(rowA.marketplaces).find((marketplace) => marketplace.proposedPrice > 0 && marketplace.proposedPrice !== marketplace.actualPrice) ? 1 : 0,
          Object.values(rowB.marketplaces).find((marketplace) => marketplace.proposedPrice > 0 && marketplace.proposedPrice !== marketplace.actualPrice) ? 1 : 0
        ),
    },
    {
      name: <span className='fw-semibold text-center fs-7'>ASIN</span>,
      selector: (row: MKP_Product) => {
        return row.asin !== '' ? (
          <a className='m-0' href={`https://www.amazon.${state.currentRegion == 'us' ? 'com' : 'es'}/dp/${row.asin}`} target='blank' rel='noopener noreferrer'>
            {row.asin}
          </a>
        ) : (
          <></>
        )
      },
      sortable: false,
      compact: true,
      // grow: 1,
    },
    {
      name: <span className='fw-semibold text-center fs-7'>1 Month Sales</span>,
      selector: (row: MKP_Product) =>
        FormatIntNumber(
          state.currentRegion,
          Object.values(row.marketplaces).reduce((acc, curr) => acc + curr?.unitsSold?.['1M'] || 0, 0)
        ),
      sortable: true,
      center: true,
      compact: true,
      sortFunction: (rowA: MKP_Product, rowB: MKP_Product) =>
        sortNumbers(
          Object.values(rowA.marketplaces).reduce((acc, curr) => acc + curr?.unitsSold?.['1M'] || 0, 0),
          Object.values(rowB.marketplaces).reduce((acc, curr) => acc + curr?.unitsSold?.['1M'] || 0, 0)
        ),
    },
    {
      name: <span className='fw-semibold text-center fs-7'>1 Year Sales</span>,
      selector: (row: MKP_Product) =>
        FormatIntNumber(
          state.currentRegion,
          Object.values(row.marketplaces).reduce((acc, curr) => acc + curr?.unitsSold?.['1Y'] || 0, 0)
        ),
      sortable: true,
      center: true,
      compact: true,
      sortFunction: (rowA: MKP_Product, rowB: MKP_Product) =>
        sortNumbers(
          Object.values(rowA.marketplaces).reduce((acc, curr) => acc + curr?.unitsSold?.['1Y'] || 0, 0),
          Object.values(rowB.marketplaces).reduce((acc, curr) => acc + curr?.unitsSold?.['1Y'] || 0, 0)
        ),
    },
    {
      name: <span className='fw-semibold text-center fs-7'>Landed Cost</span>,
      selector: (row: MKP_Product) => FormatCurrency(state.currentRegion, row.sellerCost + row.inboundShippingCost),
      sortable: true,
      center: true,
      compact: false,
    },
  ]

  return (
    <>
      <DataTable
        columns={columns}
        data={products}
        progressPending={isLoading}
        striped={true}
        dense={true}
        defaultSortAsc={false}
        defaultSortFieldId={3}
        // selectableRows
        // onSelectedRowsChange={handleSelectedRows}
        // clearSelectedRows={toggledClearRows}
        expandableRows={true}
        expandableRowsComponent={MKP_ExpandedDetails}
        expandableRowsComponentProps={{ expandedRowProps: { handleOtherCosts, handleProposedPrice, handleSetSingleMargin, handleSetProductMargin, handleNotes } }}
        pagination={products.length > 100 ? true : false}
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

export default MKP_table
