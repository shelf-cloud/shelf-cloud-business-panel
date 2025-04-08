/* eslint-disable @next/next/no-img-element */
import AppContext from '@context/AppContext'
import { NoImageAdress } from '@lib/assetsConstants'
import { FormatCurrency, FormatIntNumber, FormatIntPercentage } from '@lib/FormatNumbers'
import { sortNumbers, sortStringsCaseInsensitive } from '@lib/helperFunctions'
import { MKP_Product, MKP_Product_Table } from '@typesTs/marketplacePricing/marketplacePricing'
import Link from 'next/link'
import React, { useContext } from 'react'
import DataTable from 'react-data-table-component'
import { DebounceInput } from 'react-debounce-input'

type Props = {
  products: MKP_Product_Table[]
  isLoading: boolean
  storeId: string
  //   setSelectedRows: (selectedRows: MKP_Product[]) => void
  //   toggledClearRows: boolean
  handleProposedPrice: (sku: string, storeId: number, value: number) => void
  handleOtherCosts: (sku: string, storeId: number, value: number) => void
  handleSetSingleMargin: (sku: string, storeId: number, value: number) => void
  handleSetProductMargin: (sku: string, value: number) => void
  handleNotes: (sku: string, storeId: number, value: string) => void
  handleSetMarketplaceMargin: (sku: string, value: number) => void
}

const MKP_table_ByMarketplace = ({ products, isLoading, storeId, handleOtherCosts, handleProposedPrice, handleSetSingleMargin, handleNotes, handleSetMarketplaceMargin }: Props) => {
  const { state }: any = useContext(AppContext)

  //   const handleSelectedRows = ({ selectedRows }: { selectedRows: MKP_Product[] }) => {
  //     setSelectedRows(selectedRows)
  //   }

  const columns: any = [
    {
      name: <span className='fw-semibold text-center fs-7'></span>,
      selector: (row: MKP_Product_Table) => {
        return (
          <div className='d-flex flex-column justify-content-center gap-0 align-items-center'>
            <div
              style={{
                width: '22px',
                height: '22px',
                margin: '0px',
                position: 'relative',
              }}>
              <img loading='lazy' src={row.logo ?? NoImageAdress} onError={(e) => (e.currentTarget.src = NoImageAdress)} alt='product Image' style={{ objectFit: 'contain', objectPosition: 'center', width: '100%', height: '100%' }} />
            </div>
          </div>
        )
      },
      sortable: false,
      compact: true,
      center: true,
      minWidth: '30px',
    },
    {
      name: <span className='fw-semibold text-center fs-7'>Product</span>,
      selector: (row: MKP_Product_Table) => {
        return (
          <div className='my-1 d-flex flex-row justify-content-start align-items-center gap-2'>
            <div
              style={{
                width: '35px',
                height: '45px',
                margin: '0px',
                position: 'relative',
              }}>
              <img loading='lazy' src={row.image ? row.image : NoImageAdress} onError={(e) => (e.currentTarget.src = NoImageAdress)} alt='product Image' style={{ objectFit: 'contain', objectPosition: 'center', width: '100%', height: '100%' }} />
            </div>
            <div className='w-100'>
              <Link href={`/product/${row.inventoryId}/${row.sku}`} passHref>
                <a>
                  <p className='m-0 p-0 text-primary fw-semibold fs-7'>{row.sku}</p>
                </a>
              </Link>
              <p className='m-0 p-0 text-black fw-semibold fs-7 text-wrap'>{row.title}</p>
              <span className='m-0 p-0 text-black fw-normal fs-7 d-flex flex-wrap justify-content-start align-items-center'>
                {row.asin && (
                  <div className='d-flex flex-nowrap justify-content-start align-items-center' style={{ gap: '2px' }}>
                    {`ASIN: `}
                    <a href={`https://www.amazon.${state.currentRegion == 'us' ? 'com' : 'es'}/dp/${row.asin}`} target='blank' className='fw-light' style={{ textDecoration: 'none' }}>
                      {row.asin}
                    </a>
                    <i className='ri-file-copy-line fs-6 m-0 p-0 text-muted' style={{ cursor: 'pointer' }} onClick={() => navigator.clipboard.writeText(row.asin)} />
                  </div>
                )}
              </span>
            </div>
          </div>
        )
      },
      sortable: true,
      left: true,
      compact: false,
      minWidth: 'fit-content',
      width: '280px',
      sortFunction: (rowA: MKP_Product, rowB: MKP_Product) => sortStringsCaseInsensitive(rowA.sku, rowB.sku),
    },
    {
      name: <span className='fw-semibold text-center fs-7'>On Watch</span>,
      selector: (row: MKP_Product_Table) => (row.proposedPrice > 0 && row.proposedPrice !== row.actualPrice ? <i className='mdi mdi-eye label-icon align-middle fs-5 me-2 text-primary' /> : null),
      sortable: true,
      center: true,
      compact: true,
      minWidth: '70px',
      with: 'fit-content',
      sortFunction: (rowA: MKP_Product_Table, rowB: MKP_Product_Table) => sortNumbers(rowA.proposedPrice > 0 && rowA.proposedPrice !== rowA.actualPrice ? 1 : 0, rowB.proposedPrice > 0 && rowB.proposedPrice !== rowB.actualPrice ? 1 : 0),
    },
    {
      name: <span className='fw-semibold text-center fs-7'>1 Month Sales</span>,
      selector: (row: MKP_Product_Table) => FormatIntNumber(state.currentRegion, row.unitsSold['1M'] ?? 0),
      sortable: true,
      center: true,
      compact: true,
      minWidth: '70px',
      sortFunction: (rowA: MKP_Product_Table, rowB: MKP_Product_Table) => sortNumbers(rowA.unitsSold['1M'] ?? 0, rowB.unitsSold['1M'] ?? 0),
    },
    {
      name: <span className='fw-semibold text-center fs-7'>1 Year Sales</span>,
      selector: (row: MKP_Product_Table) => FormatIntNumber(state.currentRegion, row.unitsSold['1Y'] ?? 0),
      sortable: true,
      center: true,
      compact: true,
      minWidth: '70px',
      sortFunction: (rowA: MKP_Product_Table, rowB: MKP_Product_Table) => sortNumbers(rowA.unitsSold['1Y'] ?? 0, rowB.unitsSold['1Y'] ?? 0),
    },
    {
      name: <span className='fw-semibold text-center fs-7'>Landed Cost</span>,
      selector: (row: MKP_Product) => FormatCurrency(state.currentRegion, row.sellerCost + row.inboundShippingCost),
      sortable: true,
      center: true,
      compact: true,
      minWidth: '70px',
      style: {
        backgroundColor: 'rgba(163, 228, 215, 0.5)',
      },
    },
    {
      name: <span className='fw-semibold text-center fs-7'>Shipping Cost</span>,
      selector: (row: MKP_Product_Table) => FormatCurrency(state.currentRegion, row.shippingToMarketpalce),
      sortable: true,
      center: true,
      compact: true,
      minWidth: '70px',
      style: {
        backgroundColor: 'rgba(163, 228, 215, 0.5)',
      },
      sortFunction: (rowA: MKP_Product_Table, rowB: MKP_Product_Table) => sortNumbers(rowA.shippingToMarketpalce, rowB.shippingToMarketpalce),
    },
    {
      name: <span className='fw-semibold text-center fs-7'>Other Costs</span>,
      selector: (row: MKP_Product_Table) => {
        return (
          <div className='d-flex flex-column justify-content-start align-items-center gap-2 w-100 px-1'>
            <DebounceInput
              type='number'
              debounceTimeout={400}
              className='form-control form-control-sm fs-7 m-0 py-0 w-75 text-center'
              min={0}
              id={`orderQty-${row.sku}-${row.storeId}`}
              value={row.storeOtherCosts}
              onClick={(e: any) => e.target.select()}
              onChange={(e) => {
                if (e.target.value === '') {
                  handleOtherCosts(row.sku, row.storeId, 0)
                } else {
                  handleOtherCosts(row.sku, row.storeId, parseFloat(e.target.value))
                }
              }}
            />
          </div>
        )
      },
      sortable: true,
      center: true,
      compact: true,
      style: {
        backgroundColor: 'rgba(163, 228, 215, 0.5)',
      },
      sortFunction: (rowA: MKP_Product_Table, rowB: MKP_Product_Table) => sortNumbers(rowA.storeOtherCosts, rowB.storeOtherCosts),
    },
    {
      name: <span className='fw-semibold text-center fs-7'>Current Price</span>,
      selector: (row: MKP_Product_Table) => FormatCurrency(state.currentRegion, row.actualPrice),
      sortable: true,
      center: true,
      compact: true,
      minWidth: '70px',
      style: {
        backgroundColor: 'rgba(249, 231, 159, 0.5)',
      },
      sortFunction: (rowA: MKP_Product_Table, rowB: MKP_Product_Table) => sortNumbers(rowA.actualPrice, rowB.actualPrice),
    },
    {
      name: <span className='fw-semibold text-center fs-7'>Fee</span>,
      selector: (row: MKP_Product_Table) => FormatCurrency(state.currentRegion, row.totalFees),
      sortable: true,
      center: true,
      compact: true,
      minWidth: '70px',
      style: {
        backgroundColor: 'rgba(249, 231, 159, 0.5)',
      },
      sortFunction: (rowA: MKP_Product_Table, rowB: MKP_Product_Table) => sortNumbers(rowA.totalFees, rowB.totalFees),
    },
    {
      name: <span className='fw-semibold text-center fs-7'>Profit</span>,
      selector: (row: MKP_Product_Table) => FormatCurrency(state.currentRegion, row.actualPrice - row.totalFees - row.sellerCost - row.inboundShippingCost - row.otherCosts - row.shippingToMarketpalce - row.storeOtherCosts),
      sortable: true,
      center: true,
      compact: true,
      minWidth: '70px',
      style: {
        backgroundColor: 'rgba(249, 231, 159, 0.5)',
      },
      sortFunction: (rowA: MKP_Product_Table, rowB: MKP_Product_Table) =>
        sortNumbers(
          rowA.actualPrice - rowA.totalFees - rowA.sellerCost - rowA.inboundShippingCost - rowA.otherCosts - rowA.shippingToMarketpalce - rowA.storeOtherCosts,
          rowB.actualPrice - rowB.totalFees - rowB.sellerCost - rowB.inboundShippingCost - rowB.otherCosts - rowB.shippingToMarketpalce - rowB.storeOtherCosts
        ),
    },
    {
      name: <span className='fw-semibold text-center fs-7'>Margin</span>,
      selector: (row: MKP_Product_Table) => {
        const actualMargin = row.actualPrice <= 0 ? 0 : ((row.actualPrice - row.totalFees - row.sellerCost - row.inboundShippingCost - row.otherCosts - row.shippingToMarketpalce - row.storeOtherCosts) / row.actualPrice) * 100
        return <span className={actualMargin < 0 ? 'text-danger' : 'text-success'}>{`${FormatIntPercentage(state.currentRegion, actualMargin)} %`}</span>
      },
      sortable: true,
      center: true,
      compact: true,
      minWidth: '70px',
      style: {
        backgroundColor: 'rgba(249, 231, 159, 0.5)',
      },
      sortFunction: (rowA: MKP_Product_Table, rowB: MKP_Product_Table) =>
        sortNumbers(
          ((rowA.actualPrice - rowA.totalFees - rowA.sellerCost - rowA.inboundShippingCost - rowA.otherCosts - rowA.shippingToMarketpalce - rowA.storeOtherCosts) / rowA.actualPrice) * 100,
          ((rowB.actualPrice - rowB.totalFees - rowB.sellerCost - rowB.inboundShippingCost - rowB.otherCosts - rowB.shippingToMarketpalce - rowB.storeOtherCosts) / rowB.actualPrice) * 100
        ),
    },
    {
      name: <span className='fw-semibold text-center fs-7'>Proposed Price</span>,
      selector: (row: MKP_Product_Table) => {
        return (
          <div className='d-flex flex-column justify-content-start align-items-center gap-2 w-100 px-1'>
            <DebounceInput
              type='number'
              debounceTimeout={400}
              className='form-control form-control-sm fs-7 m-0 py-0 w-75 text-center'
              min={0}
              id={`orderQty-${row.sku}-${row.storeId}`}
              value={row.proposedPrice}
              onClick={(e: any) => e.target.select()}
              onChange={(e) => {
                if (e.target.value === '') {
                  handleProposedPrice(row.sku, row.storeId, 0)
                } else {
                  handleProposedPrice(row.sku, row.storeId, parseFloat(e.target.value))
                }
              }}
            />
          </div>
        )
      },
      sortable: true,
      center: true,
      compact: true,
      style: {
        backgroundColor: 'rgba(174, 214, 241, 0.5)',
      },
      sortFunction: (rowA: MKP_Product_Table, rowB: MKP_Product_Table) => sortNumbers(rowA.proposedPrice, rowB.proposedPrice),
    },
    {
      name: <span className='fw-semibold text-center fs-7'>Fee</span>,
      selector: (row: MKP_Product_Table) => FormatCurrency(state.currentRegion, row.proposedPrice * (row.comissionFee / 100) + row.fixedFee + row.fbaHandlingFee),
      sortable: true,
      center: true,
      compact: true,
      minWidth: '70px',
      style: {
        backgroundColor: 'rgba(174, 214, 241, 0.5)',
      },
      sortFunction: (rowA: MKP_Product_Table, rowB: MKP_Product_Table) =>
        sortNumbers(rowA.proposedPrice * (rowA.comissionFee / 100) + rowA.fixedFee + rowA.fbaHandlingFee, rowB.proposedPrice * (rowB.comissionFee / 100) + rowB.fixedFee + rowB.fbaHandlingFee),
    },
    {
      name: <span className='fw-semibold text-center fs-7'>Profit</span>,
      selector: (row: MKP_Product_Table) =>
        FormatCurrency(
          state.currentRegion,
          row.proposedPrice - (row.proposedPrice * (row.comissionFee / 100) + row.fixedFee + row.fbaHandlingFee) - row.sellerCost - row.inboundShippingCost - row.otherCosts - row.shippingToMarketpalce - row.storeOtherCosts
        ),
      sortable: true,
      center: true,
      compact: true,
      minWidth: '70px',
      style: {
        backgroundColor: 'rgba(174, 214, 241, 0.5)',
      },
      sortFunction: (rowA: MKP_Product_Table, rowB: MKP_Product_Table) =>
        sortNumbers(
          rowA.proposedPrice - (rowA.proposedPrice * (rowA.comissionFee / 100) + rowA.fixedFee + rowA.fbaHandlingFee) - rowA.sellerCost - rowA.inboundShippingCost - rowA.otherCosts - rowA.shippingToMarketpalce - rowA.storeOtherCosts,
          rowB.proposedPrice - (rowB.proposedPrice * (rowB.comissionFee / 100) + rowB.fixedFee + rowB.fbaHandlingFee) - rowB.sellerCost - rowB.inboundShippingCost - rowB.otherCosts - rowB.shippingToMarketpalce - rowB.storeOtherCosts
        ),
    },
    {
      name: <span className='fw-semibold text-center fs-7'>Margin</span>,
      selector: (row: MKP_Product_Table) => {
        const proposedMargin =
          ((row.proposedPrice - (row.proposedPrice * (row.comissionFee / 100) + row.fixedFee + row.fbaHandlingFee) - row.sellerCost - row.inboundShippingCost - row.otherCosts - row.shippingToMarketpalce - row.storeOtherCosts) / row.proposedPrice) *
          100
        return <span className={proposedMargin < 0 ? 'text-danger' : 'text-success'}>{`${FormatIntPercentage(state.currentRegion, proposedMargin)} %`}</span>
      },
      sortable: true,
      center: true,
      compact: true,
      minWidth: '70px',
      style: {
        backgroundColor: 'rgba(174, 214, 241, 0.5)',
      },
      sortFunction: (rowA: MKP_Product_Table, rowB: MKP_Product_Table) =>
        sortNumbers(
          ((rowA.proposedPrice - (rowA.proposedPrice * (rowA.comissionFee / 100) + rowA.fixedFee + rowA.fbaHandlingFee) - rowA.sellerCost - rowA.inboundShippingCost - rowA.otherCosts - rowA.shippingToMarketpalce - rowA.storeOtherCosts) /
            rowA.proposedPrice) *
            100,
          ((rowB.proposedPrice - (rowB.proposedPrice * (rowB.comissionFee / 100) + rowB.fixedFee + rowB.fbaHandlingFee) - rowB.sellerCost - rowB.inboundShippingCost - rowB.otherCosts - rowB.shippingToMarketpalce - rowB.storeOtherCosts) /
            rowB.proposedPrice) *
            100
        ),
    },
    {
      name: (
        <div className='d-flex flex-column justify-content-start align-items-center gap-1 w-100'>
          <span className='fw-semibold text-center fs-7'>Set Margin</span>
          <DebounceInput
            type='number'
            debounceTimeout={400}
            className='form-control form-control-sm fs-7 m-0 py-0 w-75 text-center'
            min={0}
            id={`marketplaceMargin-${storeId}`}
            onClick={(e: any) => e.target.select()}
            onChange={(e) => {
              if (e.target.value === '') {
                handleSetMarketplaceMargin(storeId, 0)
              } else {
                handleSetMarketplaceMargin(storeId, parseFloat(e.target.value))
              }
            }}
          />
        </div>
      ),

      selector: (row: MKP_Product_Table) => {
        return (
          <div className='d-flex flex-row justify-content-center align-items-center gap-2 w-100 px-1'>
            <DebounceInput
              type='number'
              debounceTimeout={400}
              className='form-control form-control-sm fs-7 m-0 py-0 w-50 text-center'
              min={0}
              id={`orderQty-${row.sku}-${row.storeId}`}
              value={row.proposedMargin}
              onClick={(e: any) => e.target.select()}
              onChange={(e) => {
                if (e.target.value === '') {
                  handleSetSingleMargin(row.sku, row.storeId, 0)
                } else {
                  handleSetSingleMargin(row.sku, row.storeId, parseFloat(e.target.value))
                }
              }}
            />
            <span className='text-muted'>%</span>
          </div>
        )
      },
      sortable: false,
      center: true,
      compact: true,
      style: {
        backgroundColor: 'rgba(174, 214, 241, 0.5)',
      },
    },
    {
      name: <span className='fw-semibold text-center fs-7'>Notes</span>,
      selector: (row: MKP_Product_Table) => (
        <DebounceInput
          element='textarea'
          minLength={3}
          debounceTimeout={600}
          className='form-control form-control-sm fs-7 m-0'
          rows={2}
          id={`notes-${row.sku}-${row.storeId}`}
          value={row.notes}
          onClick={(e: any) => e.target.select()}
          onChange={(e) => {
            handleNotes(row.sku, row.storeId, e.target.value)
          }}
        />
      ),
      sortable: false,
      center: true,
      compact: true,
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

export default MKP_table_ByMarketplace
