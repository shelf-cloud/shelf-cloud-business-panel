/* eslint-disable @next/next/no-img-element */
import Link from 'next/link'
import { useContext, useState } from 'react'

import UnitsSoldDetailsModal from '@components/modals/marketplaces/unitsSoldDetailsModal'
import CopyTextToClipboard from '@components/ui/CopyTextToClipboard'
import AppContext from '@context/AppContext'
import { FormatCurrency, FormatIntNumber, FormatIntPercentage } from '@lib/FormatNumbers'
import { NoImageAdress } from '@lib/assetsConstants'
import { Marketplace, ProductPerformance } from '@typesTs/marketplaces/productPerformance'
import DataTable from 'react-data-table-component'
import { Button } from '@shadcn/ui/button'

import ProductPerformanceExpandedDetails from './productPerformanceExpandedDetails'
import { getProductMargin, getProductNetExpenses, getProductNetProfit, getProductRoi, getProductsTotalRoi } from './productPerformanceMetrics'

type Props = {
  tableData: ProductPerformance[]
  pending: boolean
  selectedMarketplace: {
    storeId: string
    name: string
    logo: string
  }
}

const ProductPerformanceTable = ({ tableData, pending, selectedMarketplace }: Props) => {
  const { state }: any = useContext(AppContext)
  const [showUnitsSoldDetailsModal, setshowUnitsSoldDetailsModal] = useState({
    showUnitsSoldDetailsModal: false,
    sku: '',
    title: '',
    totalUnitsSold: 0,
    marketplacesData: {} as { [key: string]: Marketplace },
  })
  const totalGrossRevenue = tableData.reduce((total: number, product: ProductPerformance) => total + product.grossRevenue, 0)
  const totalExpenses = tableData.reduce((total: number, product: ProductPerformance) => total + getProductNetExpenses(product, selectedMarketplace.storeId), 0)

  const totalProfit = tableData.reduce((total: number, product: ProductPerformance) => total + getProductNetProfit(product, selectedMarketplace.storeId), 0)

  const totalMargin = totalGrossRevenue === 0 ? 0 : ((totalGrossRevenue - totalExpenses) / totalGrossRevenue) * 100
  const totalRoi = getProductsTotalRoi(tableData, selectedMarketplace.storeId)

  const caseInsensitiveSort = (rowA: ProductPerformance, rowB: ProductPerformance) => {
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
  const sortGrossRevenue = (rowA: ProductPerformance, rowB: ProductPerformance) => {
    const a = rowA.grossRevenue
    const b = rowB.grossRevenue
    if (a > b) {
      return 1
    }
    if (b > a) {
      return -1
    }
    return 0
  }
  const sortExpenses = (rowA: ProductPerformance, rowB: ProductPerformance) => {
    const a = getProductNetExpenses(rowA, selectedMarketplace.storeId)
    const b = getProductNetExpenses(rowB, selectedMarketplace.storeId)
    if (a > b) {
      return 1
    }
    if (b > a) {
      return -1
    }
    return 0
  }
  const sortProfit = (rowA: ProductPerformance, rowB: ProductPerformance) => {
    const a = getProductNetProfit(rowA, selectedMarketplace.storeId)
    const b = getProductNetProfit(rowB, selectedMarketplace.storeId)
    if (a > b) {
      return 1
    }
    if (b > a) {
      return -1
    }
    return 0
  }
  const sortMargin = (rowA: ProductPerformance, rowB: ProductPerformance) => {
    const a = getProductMargin(rowA, selectedMarketplace.storeId)
    const b = getProductMargin(rowB, selectedMarketplace.storeId)
    if (a > b) {
      return 1
    }
    if (b > a) {
      return -1
    }
    return 0
  }
  const sortRoi = (rowA: ProductPerformance, rowB: ProductPerformance) => {
    const a = getProductRoi(rowA, selectedMarketplace.storeId)
    const b = getProductRoi(rowB, selectedMarketplace.storeId)
    if (a === null && b === null) return 0
    if (a === null) return 1
    if (b === null) return -1
    if (a > b) {
      return 1
    }
    if (b > a) {
      return -1
    }
    return 0
  }
  const sortRefunds = (rowA: ProductPerformance, rowB: ProductPerformance) => {
    const a = rowA.refundsQty
    const b = rowB.refundsQty
    if (a > b) {
      return 1
    }
    if (b > a) {
      return -1
    }
    return 0
  }
  const sortUnitsSold = (rowA: ProductPerformance, rowB: ProductPerformance) => {
    const a = rowA.unitsSold
    const b = rowB.unitsSold
    if (a > b) {
      return 1
    }
    if (b > a) {
      return -1
    }
    return 0
  }

  const columns: any = [
    {
      name: <span className='font-semibold text-[13px]'>Product</span>,
      selector: (row: ProductPerformance) => {
        return (
          <div className='my-1 flex justify-between items-center gap-2'>
            <div
              style={{
                width: '30px',
                minWidth: '30px',
                height: '30px',
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
            <div>
              <div className='flex flex-row justify-start items-center text-[11.2px]'>
                <Link href={`/product/${row.inventoryId}/${row.sku}`}>
                  <p className='m-0 p-0 text-primary font-semibold text-[13px]'>{row.sku}</p>
                </Link>
                <CopyTextToClipboard text={row.sku} label='SKU' />
              </div>

              <p className='m-0 p-0 text-black font-semibold text-[11.2px] text-wrap'>{row.title}</p>
              <p className='m-0 p-0 text-black font-normal text-[11.2px] flex flex-row justify-start items-center'>
                {row.asin && (
                  <>
                    {`ASIN: `}
                    <a
                      href={`https://www.amazon.${state.currentRegion == 'us' ? 'com' : 'es'}/dp/${row.asin}`}
                      target='blank'
                      rel='noopener noreferrer'
                      className='font-light'
                      style={{ textDecoration: 'none' }}>
                      {row.asin}
                    </a>
                    <CopyTextToClipboard text={row.asin} label='ASIN' />
                  </>
                )}
                {row.barcode && (
                  <>
                    UPC:<span className='font-light text-muted-foreground'>{row.barcode}</span>
                    <CopyTextToClipboard text={row.barcode} label='UPC' />
                  </>
                )}
              </p>
            </div>
          </div>
        )
      },
      sortable: true,
      left: true,
      compact: true,
      grow: 2.5,
      sortFunction: caseInsensitiveSort,
    },
    {
      name: <span className='font-semibold text-[13px] text-center'>Supplier</span>,
      selector: (row: ProductPerformance) => {
        return (
          <>
            <p className='w-full m-0 p-0 text-left text-[11.2px] font-bold'>{row.supplier}</p>
            <p className='w-full m-0 p-0 text-left text-[11.2px]'>{row.brand}</p>
            <p className='w-full m-0 p-0 text-left text-[11.2px]'>{row.category}</p>
          </>
        )
      },
      // center: true,
      // sortable: true,
      compact: true,
      hide: 'md',
    },
    {
      name: (
        <div className='text-center flex flex-col justify-center items-center gap-1'>
          <span className='font-semibold text-[13px]'>Gross Revenue</span>
          <span className={'font-normal text-[16.25px] ' + (totalGrossRevenue > 0 ? 'text-primary' : 'text-destructive')}>{FormatCurrency(state.currentRegion, totalGrossRevenue)}</span>
        </div>
      ),
      selector: (row: ProductPerformance) => {
        return <span>{FormatCurrency(state.currentRegion, row?.grossRevenue)}</span>
      },
      center: true,
      sortable: true,
      compact: true,
      sortFunction: sortGrossRevenue,
    },
    {
      name: (
        <div className='text-center flex flex-col justify-center items-center gap-1'>
          <span className='font-semibold text-[13px]'>Expenses</span>
          <span className={'font-normal text-[16.25px] ' + (totalExpenses > 0 ? 'text-destructive' : 'text-primary')}>{FormatCurrency(state.currentRegion, totalExpenses)}</span>
        </div>
      ),
      selector: (row: ProductPerformance) => {
        return <span>{FormatCurrency(state.currentRegion, getProductNetExpenses(row, selectedMarketplace.storeId))}</span>
      },
      center: true,
      sortable: true,
      compact: true,
      sortFunction: sortExpenses,
    },
    {
      name: (
        <div className='text-center flex flex-col justify-center items-center gap-1'>
          <span className='font-semibold text-[13px]'>Profit</span>
          <span className={'font-normal text-[16.25px] ' + (totalProfit > 0 ? 'text-primary' : 'text-destructive')}>{FormatCurrency(state.currentRegion, totalProfit)}</span>
        </div>
      ),
      selector: (row: ProductPerformance) => {
        const netProfit = getProductNetProfit(row, selectedMarketplace.storeId)

        return <span className={netProfit >= 0 ? 'text-black' : 'text-destructive'}>{FormatCurrency(state.currentRegion, netProfit)}</span>
      },
      center: true,
      sortable: true,
      compact: true,
      sortFunction: sortProfit,
    },
    {
      name: (
        <div className='text-center flex flex-col justify-center items-center gap-1'>
          <span className='font-semibold text-[13px]'>Margin</span>
          <span className={'font-normal text-[16.25px] ' + (totalMargin > 0 ? 'text-primary' : 'text-destructive')}>{FormatIntPercentage(state.currentRegion, totalMargin)}%</span>
        </div>
      ),
      selector: (row: ProductPerformance) => {
        const margin = getProductMargin(row, selectedMarketplace.storeId)

        if (row.grossRevenue === 0) {
          return <span>0%</span>
        } else {
          return <span className={margin >= 0 ? 'text-black' : 'text-destructive'}>{FormatIntPercentage(state.currentRegion, margin)}%</span>
        }
      },
      center: true,
      sortable: true,
      compact: true,
      sortFunction: sortMargin,
    },
    {
      name: (
        <div className='text-center flex flex-col justify-center items-center gap-1'>
          <span className='font-semibold text-[13px]'>ROI</span>
          <span className={'font-normal text-[16.25px] ' + (totalRoi === null ? 'text-muted-foreground' : totalRoi > 0 ? 'text-primary' : 'text-destructive')}>
            {totalRoi === null ? 'N/A' : `${FormatIntPercentage(state.currentRegion, totalRoi)}%`}
          </span>
        </div>
      ),
      selector: (row: ProductPerformance) => {
        const roi = getProductRoi(row, selectedMarketplace.storeId)

        if (roi === null) return <span className='text-muted-foreground'>N/A</span>

        return <span className={roi >= 0 ? 'text-black' : 'text-destructive'}>{FormatIntPercentage(state.currentRegion, roi)}%</span>
      },
      center: true,
      sortable: true,
      compact: true,
      sortFunction: sortRoi,
    },
    {
      name: (
        <div className='text-center flex flex-col justify-center items-center gap-1'>
          <span className='font-semibold text-[13px]'>Refunds</span>
          <span
            className={'font-normal text-[16.25px] ' + (tableData.reduce((total: number, product: ProductPerformance) => total + product.refundsQty, 0) > 0 ? 'text-primary' : 'text-muted-foreground')}>
            {FormatIntNumber(
              state.currentRegion,
              tableData.reduce((total: number, product: ProductPerformance) => total + product.refundsQty, 0)
            )}
          </span>
        </div>
      ),
      selector: (row: ProductPerformance) => {
        return <span>{FormatIntNumber(state.currentRegion, row?.refundsQty)}</span>
      },
      center: true,
      sortable: true,
      compact: true,
      sortFunction: sortRefunds,
    },
    {
      name: (
        <div className='text-center flex flex-col justify-center items-center gap-1'>
          <span className='font-semibold text-[13px]'>Units Sold</span>
          <span className='font-normal text-[16.25px] text-primary'>
            {FormatIntNumber(
              state.currentRegion,
              tableData.reduce((total: number, product: ProductPerformance) => total + product.unitsSold, 0)
            )}
          </span>
        </div>
      ),
      selector: (row: ProductPerformance) => {
        return (
          <Button
            variant='ghost'
            className='!text-info hover:bg-[color-mix(in_srgb,var(--info)_10%,transparent)]'
            onClick={() =>
              setshowUnitsSoldDetailsModal({
                showUnitsSoldDetailsModal: true,
                totalUnitsSold: row?.unitsSold,
                sku: row?.sku,
                title: row?.title,
                marketplacesData: row?.marketplaces,
              })
            }>
            {FormatIntNumber(state.currentRegion, row?.unitsSold)}
          </Button>
        )
      },
      center: true,
      sortable: true,
      compact: true,
      sortFunction: sortUnitsSold,
    },
  ]

  return (
    <>
      <DataTable
        columns={columns}
        data={tableData}
        progressPending={pending}
        striped={true}
        // selectableRows
        // onSelectedRowsChange={handleSelectedRows}
        // clearSelectedRows={toggledClearRows}
        expandableRows
        expandableRowsComponent={ProductPerformanceExpandedDetails}
        expandableRowsComponentProps={{ selectedMarketplaceStoreId: selectedMarketplace.storeId }}
        dense
        defaultSortFieldId={3}
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
      {showUnitsSoldDetailsModal.showUnitsSoldDetailsModal && (
        <UnitsSoldDetailsModal showUnitsSoldDetailsModal={showUnitsSoldDetailsModal} setshowUnitsSoldDetailsModal={setshowUnitsSoldDetailsModal} />
      )}
    </>
  )
}

export default ProductPerformanceTable
