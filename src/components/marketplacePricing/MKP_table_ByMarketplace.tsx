/* eslint-disable @next/next/no-img-element */
import Link from 'next/link'
import { useContext } from 'react'

import CopyTextToClipboard from '@components/ui/CopyTextToClipboard'
import AppContext from '@context/AppContext'
import { FormatCurrency, FormatIntNumber, FormatIntPercentage } from '@lib/FormatNumbers'
import { NoImageAdress } from '@lib/assetsConstants'
import { sortNumbers, sortStringsCaseInsensitive } from '@lib/helperFunctions'
import { MKP_Product, MKP_Product_Table } from '@typesTs/marketplacePricing/marketplacePricing'
import DataTable from '@components/Common/DataTableSC'
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
  handleNotes: (sku: string, storeId: number, value: string) => void
  handleSetMarketplaceMargin: (sku: string, value: number, skus: string[]) => void
}

const MKP_table_ByMarketplace = ({
  products,
  isLoading,
  storeId,
  handleOtherCosts,
  handleProposedPrice,
  handleSetSingleMargin,
  handleNotes,
  handleSetMarketplaceMargin,
}: Props) => {
  const { state }: any = useContext(AppContext)

  //   const handleSelectedRows = ({ selectedRows }: { selectedRows: MKP_Product[] }) => {
  //     setSelectedRows(selectedRows)
  //   }

  const columns: any = [
    {
      name: <span className='font-semibold text-center text-[11.2px]'></span>,
      selector: (row: MKP_Product_Table) => {
        return (
          <div className='flex flex-col justify-center gap-0 items-center'>
            <div
              style={{
                width: '22px',
                height: '22px',
                margin: '0px',
                position: 'relative',
              }}>
              <img
                loading='lazy'
                src={row.logo ?? NoImageAdress}
                onError={(e) => (e.currentTarget.src = NoImageAdress)}
                alt='product Image'
                style={{ objectFit: 'contain', objectPosition: 'center', width: '100%', height: '100%' }}
              />
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
      name: <span className='font-semibold text-center text-[11.2px]'>Product</span>,
      selector: (row: MKP_Product_Table) => {
        return (
          <div className='my-1 flex flex-row justify-start items-center gap-2'>
            <div
              style={{
                width: '35px',
                height: '45px',
                margin: '0px',
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
            <div className='w-full'>
              <div className='flex flex-row justify-start items-center'>
                <Link href={`/product/${row.inventoryId}/${row.sku}`}>
                  <p className='m-0 p-0 text-primary font-semibold text-[11.2px]'>{row.sku}</p>
                </Link>
                <CopyTextToClipboard text={row.sku} label='SKU' />
              </div>
              <p className='m-0 p-0 text-black font-semibold text-[11.2px] text-wrap'>{row.title}</p>
              <span className='m-0 p-0 text-black font-normal text-[11.2px] flex flex-wrap justify-start items-center'>
                {row.asin && (
                  <div className='flex flex-nowrap justify-start items-center' style={{ gap: '2px' }}>
                    {`ASIN: `}
                    <a
                      href={`https://www.amazon.${state.currentRegion == 'us' ? 'com' : 'es'}/dp/${row.asin}`}
                      target='blank'
                      rel='noopener noreferrer'
                      className='font-light'
                      style={{ textDecoration: 'none' }}>
                      {row.asin}
                    </a>
                    <i className='ri-file-copy-line text-[13px] m-0 p-0 text-[var(--bs-secondary-color)]' style={{ cursor: 'pointer' }} onClick={() => navigator.clipboard.writeText(row.asin)} />
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
      name: <span className='font-semibold text-center text-[11.2px]'>On Watch</span>,
      selector: (row: MKP_Product_Table) =>
        row.proposedPrice > 0 && row.proposedPrice !== row.actualPrice ? <i className='mdi mdi-eye label-icon align-middle text-[16.25px] me-2 text-primary' /> : null,
      sortable: true,
      center: true,
      compact: true,
      minWidth: '70px',
      with: 'fit-content',
      sortFunction: (rowA: MKP_Product_Table, rowB: MKP_Product_Table) =>
        sortNumbers(rowA.proposedPrice > 0 && rowA.proposedPrice !== rowA.actualPrice ? 1 : 0, rowB.proposedPrice > 0 && rowB.proposedPrice !== rowB.actualPrice ? 1 : 0),
    },
    {
      name: <span className='font-semibold text-center text-[11.2px]'>1 Month Sales</span>,
      selector: (row: MKP_Product_Table) => FormatIntNumber(state.currentRegion, row.unitsSold['1M'] ?? 0),
      sortable: true,
      center: true,
      compact: true,
      minWidth: '70px',
      sortFunction: (rowA: MKP_Product_Table, rowB: MKP_Product_Table) => sortNumbers(rowA.unitsSold['1M'] ?? 0, rowB.unitsSold['1M'] ?? 0),
    },
    {
      name: <span className='font-semibold text-center text-[11.2px]'>1 Year Sales</span>,
      selector: (row: MKP_Product_Table) => FormatIntNumber(state.currentRegion, row.unitsSold['1Y'] ?? 0),
      sortable: true,
      center: true,
      compact: true,
      minWidth: '70px',
      sortFunction: (rowA: MKP_Product_Table, rowB: MKP_Product_Table) => sortNumbers(rowA.unitsSold['1Y'] ?? 0, rowB.unitsSold['1Y'] ?? 0),
    },
    {
      name: <span className='font-semibold text-center text-[11.2px]'>Landed Cost</span>,
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
      name: <span className='font-semibold text-center text-[11.2px]'>Shipping Cost</span>,
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
      name: <span className='font-semibold text-center text-[11.2px]'>Other Costs</span>,
      selector: (row: MKP_Product_Table) => {
        return (
          <div className='flex flex-col justify-start items-center gap-2 w-full px-1'>
            <DebounceInput
              type='number'
              debounceTimeout={400}
              className='h-8 px-2 rounded-md border border-input bg-input shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 text-[11.2px] m-0 py-0 w-3/4 text-center'
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
      name: <span className='font-semibold text-center text-[11.2px]'>Current Price</span>,
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
      name: <span className='font-semibold text-center text-[11.2px]'>Fee</span>,
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
      name: <span className='font-semibold text-center text-[11.2px]'>Profit</span>,
      selector: (row: MKP_Product_Table) =>
        FormatCurrency(
          state.currentRegion,
          row.actualPrice - row.totalFees - row.sellerCost - row.inboundShippingCost - row.otherCosts - row.shippingToMarketpalce - row.storeOtherCosts
        ),
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
      name: <span className='font-semibold text-center text-[11.2px]'>Margin</span>,
      selector: (row: MKP_Product_Table) => {
        const actualMargin =
          row.actualPrice <= 0
            ? 0
            : ((row.actualPrice - row.totalFees - row.sellerCost - row.inboundShippingCost - row.otherCosts - row.shippingToMarketpalce - row.storeOtherCosts) / row.actualPrice) *
              100
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
          ((rowA.actualPrice - rowA.totalFees - rowA.sellerCost - rowA.inboundShippingCost - rowA.otherCosts - rowA.shippingToMarketpalce - rowA.storeOtherCosts) /
            rowA.actualPrice) *
            100,
          ((rowB.actualPrice - rowB.totalFees - rowB.sellerCost - rowB.inboundShippingCost - rowB.otherCosts - rowB.shippingToMarketpalce - rowB.storeOtherCosts) /
            rowB.actualPrice) *
            100
        ),
    },
    {
      name: <span className='font-semibold text-center text-[11.2px]'>Proposed Price</span>,
      selector: (row: MKP_Product_Table) => {
        return (
          <div className='flex flex-col justify-start items-center gap-2 w-full px-1'>
            <DebounceInput
              type='number'
              debounceTimeout={400}
              className='h-8 px-2 rounded-md border border-input bg-input shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 text-[11.2px] m-0 py-0 w-3/4 text-center'
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
      name: <span className='font-semibold text-center text-[11.2px]'>Fee</span>,
      selector: (row: MKP_Product_Table) => FormatCurrency(state.currentRegion, row.proposedPrice * (row.comissionFee / 100) + row.fixedFee + row.fbaHandlingFee),
      sortable: true,
      center: true,
      compact: true,
      minWidth: '70px',
      style: {
        backgroundColor: 'rgba(174, 214, 241, 0.5)',
      },
      sortFunction: (rowA: MKP_Product_Table, rowB: MKP_Product_Table) =>
        sortNumbers(
          rowA.proposedPrice * (rowA.comissionFee / 100) + rowA.fixedFee + rowA.fbaHandlingFee,
          rowB.proposedPrice * (rowB.comissionFee / 100) + rowB.fixedFee + rowB.fbaHandlingFee
        ),
    },
    {
      name: <span className='font-semibold text-center text-[11.2px]'>Profit</span>,
      selector: (row: MKP_Product_Table) =>
        FormatCurrency(
          state.currentRegion,
          row.proposedPrice -
            (row.proposedPrice * (row.comissionFee / 100) + row.fixedFee + row.fbaHandlingFee) -
            row.sellerCost -
            row.inboundShippingCost -
            row.otherCosts -
            row.shippingToMarketpalce -
            row.storeOtherCosts
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
          rowA.proposedPrice -
            (rowA.proposedPrice * (rowA.comissionFee / 100) + rowA.fixedFee + rowA.fbaHandlingFee) -
            rowA.sellerCost -
            rowA.inboundShippingCost -
            rowA.otherCosts -
            rowA.shippingToMarketpalce -
            rowA.storeOtherCosts,
          rowB.proposedPrice -
            (rowB.proposedPrice * (rowB.comissionFee / 100) + rowB.fixedFee + rowB.fbaHandlingFee) -
            rowB.sellerCost -
            rowB.inboundShippingCost -
            rowB.otherCosts -
            rowB.shippingToMarketpalce -
            rowB.storeOtherCosts
        ),
    },
    {
      name: <span className='font-semibold text-center text-[11.2px]'>Margin</span>,
      selector: (row: MKP_Product_Table) => {
        const proposedMargin =
          ((row.proposedPrice -
            (row.proposedPrice * (row.comissionFee / 100) + row.fixedFee + row.fbaHandlingFee) -
            row.sellerCost -
            row.inboundShippingCost -
            row.otherCosts -
            row.shippingToMarketpalce -
            row.storeOtherCosts) /
            row.proposedPrice) *
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
          ((rowA.proposedPrice -
            (rowA.proposedPrice * (rowA.comissionFee / 100) + rowA.fixedFee + rowA.fbaHandlingFee) -
            rowA.sellerCost -
            rowA.inboundShippingCost -
            rowA.otherCosts -
            rowA.shippingToMarketpalce -
            rowA.storeOtherCosts) /
            rowA.proposedPrice) *
            100,
          ((rowB.proposedPrice -
            (rowB.proposedPrice * (rowB.comissionFee / 100) + rowB.fixedFee + rowB.fbaHandlingFee) -
            rowB.sellerCost -
            rowB.inboundShippingCost -
            rowB.otherCosts -
            rowB.shippingToMarketpalce -
            rowB.storeOtherCosts) /
            rowB.proposedPrice) *
            100
        ),
    },
    {
      name: (
        <div className='flex flex-col justify-start items-center gap-1 w-full'>
          <span className='font-semibold text-center text-[11.2px]'>Set Margin</span>
          <div className='flex flex-row justify-center items-center gap-2 w-full px-1'>
            <DebounceInput
              type='number'
              debounceTimeout={400}
              className='h-8 px-2 rounded-md border border-input bg-input shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 text-[11.2px] m-0 py-0 w-1/2 text-center'
              min={0}
              id={`marketplaceMargin-${storeId}`}
              onClick={(e: any) => e.target.select()}
              onChange={(e) => {
                if (e.target.value === '') {
                  handleSetMarketplaceMargin(
                    storeId,
                    0,
                    products.map((product) => product.sku)
                  )
                } else {
                  handleSetMarketplaceMargin(
                    storeId,
                    parseFloat(e.target.value),
                    products.map((product) => product.sku)
                  )
                }
              }}
            />
            <span className='text-[var(--bs-secondary-color)]'>%</span>
          </div>
        </div>
      ),

      selector: (row: MKP_Product_Table) => {
        return (
          <div className='flex flex-row justify-center items-center gap-2 w-full px-1'>
            <DebounceInput
              type='number'
              debounceTimeout={400}
              className='h-8 px-2 rounded-md border border-input bg-input shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 text-[11.2px] m-0 py-0 w-1/2 text-center'
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
            <span className='text-[var(--bs-secondary-color)]'>%</span>
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
      name: <span className='font-semibold text-center text-[11.2px]'>Notes</span>,
      selector: (row: MKP_Product_Table) => (
        <DebounceInput
          element='textarea'
          minLength={3}
          debounceTimeout={600}
          className='h-8 px-2 rounded-md border border-input bg-input shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 text-[11.2px] m-0'
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
