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
import { Button } from '@/components/migration-ui'

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
      name: <span className='tw:font-semibold tw:text-[13px]'>Product</span>,
      selector: (row: ProductPerformance) => {
        return (
          <div className='tw:my-1 tw:flex tw:justify-between tw:items-center tw:gap-2'>
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
              <div className='tw:flex tw:flex-row tw:justify-start tw:items-center tw:text-[11.2px]'>
                <Link href={`/product/${row.inventoryId}/${row.sku}`}>
                  <p className='tw:m-0 tw:p-0 tw:text-primary tw:font-semibold tw:text-[13px]'>{row.sku}</p>
                </Link>
                <CopyTextToClipboard text={row.sku} label='SKU' />
              </div>

              <p className='tw:m-0 tw:p-0 tw:text-black tw:font-semibold tw:text-[11.2px] tw:text-wrap'>{row.title}</p>
              <p className='tw:m-0 tw:p-0 tw:text-black tw:font-normal tw:text-[11.2px] tw:flex tw:flex-row tw:justify-start tw:items-center'>
                {row.asin && (
                  <>
                    {`ASIN: `}
                    <a
                      href={`https://www.amazon.${state.currentRegion == 'us' ? 'com' : 'es'}/dp/${row.asin}`}
                      target='blank'
                      rel='noopener noreferrer'
                      className='tw:font-light'
                      style={{ textDecoration: 'none' }}>
                      {row.asin}
                    </a>
                    <CopyTextToClipboard text={row.asin} label='ASIN' />
                  </>
                )}
                {row.barcode && (
                  <>
                    UPC:<span className='tw:font-light tw:text-[color:var(--bs-secondary-color)]'>{row.barcode}</span>
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
      name: <span className='tw:font-semibold tw:text-[13px] tw:text-center'>Supplier</span>,
      selector: (row: ProductPerformance) => {
        return (
          <>
            <p className='tw:w-full tw:m-0 tw:p-0 tw:text-left tw:text-[11.2px] tw:font-bold'>{row.supplier}</p>
            <p className='tw:w-full tw:m-0 tw:p-0 tw:text-left tw:text-[11.2px]'>{row.brand}</p>
            <p className='tw:w-full tw:m-0 tw:p-0 tw:text-left tw:text-[11.2px]'>{row.category}</p>
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
        <div className='tw:text-center tw:flex tw:flex-col tw:justify-center tw:items-center tw:gap-1'>
          <span className='tw:font-semibold tw:text-[13px]'>Gross Revenue</span>
          <span className={'tw:font-normal tw:text-[16.25px] ' + (totalGrossRevenue > 0 ? 'tw:text-primary' : 'tw:text-destructive')}>{FormatCurrency(state.currentRegion, totalGrossRevenue)}</span>
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
        <div className='tw:text-center tw:flex tw:flex-col tw:justify-center tw:items-center tw:gap-1'>
          <span className='tw:font-semibold tw:text-[13px]'>Expenses</span>
          <span className={'tw:font-normal tw:text-[16.25px] ' + (totalExpenses > 0 ? 'tw:text-destructive' : 'tw:text-primary')}>{FormatCurrency(state.currentRegion, totalExpenses)}</span>
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
        <div className='tw:text-center tw:flex tw:flex-col tw:justify-center tw:items-center tw:gap-1'>
          <span className='tw:font-semibold tw:text-[13px]'>Profit</span>
          <span className={'tw:font-normal tw:text-[16.25px] ' + (totalProfit > 0 ? 'tw:text-primary' : 'tw:text-destructive')}>{FormatCurrency(state.currentRegion, totalProfit)}</span>
        </div>
      ),
      selector: (row: ProductPerformance) => {
        const netProfit = getProductNetProfit(row, selectedMarketplace.storeId)

        return <span className={netProfit >= 0 ? 'tw:text-black' : 'tw:text-destructive'}>{FormatCurrency(state.currentRegion, netProfit)}</span>
      },
      center: true,
      sortable: true,
      compact: true,
      sortFunction: sortProfit,
    },
    {
      name: (
        <div className='tw:text-center tw:flex tw:flex-col tw:justify-center tw:items-center tw:gap-1'>
          <span className='tw:font-semibold tw:text-[13px]'>Margin</span>
          <span className={'tw:font-normal tw:text-[16.25px] ' + (totalMargin > 0 ? 'tw:text-primary' : 'tw:text-destructive')}>{FormatIntPercentage(state.currentRegion, totalMargin)}%</span>
        </div>
      ),
      selector: (row: ProductPerformance) => {
        const margin = getProductMargin(row, selectedMarketplace.storeId)

        if (row.grossRevenue === 0) {
          return <span>0%</span>
        } else {
          return <span className={margin >= 0 ? 'tw:text-black' : 'tw:text-destructive'}>{FormatIntPercentage(state.currentRegion, margin)}%</span>
        }
      },
      center: true,
      sortable: true,
      compact: true,
      sortFunction: sortMargin,
    },
    {
      name: (
        <div className='tw:text-center tw:flex tw:flex-col tw:justify-center tw:items-center tw:gap-1'>
          <span className='tw:font-semibold tw:text-[13px]'>ROI</span>
          <span className={'tw:font-normal tw:text-[16.25px] ' + (totalRoi === null ? 'tw:text-[color:var(--bs-secondary-color)]' : totalRoi > 0 ? 'tw:text-primary' : 'tw:text-destructive')}>
            {totalRoi === null ? 'N/A' : `${FormatIntPercentage(state.currentRegion, totalRoi)}%`}
          </span>
        </div>
      ),
      selector: (row: ProductPerformance) => {
        const roi = getProductRoi(row, selectedMarketplace.storeId)

        if (roi === null) return <span className='tw:text-[color:var(--bs-secondary-color)]'>N/A</span>

        return <span className={roi >= 0 ? 'tw:text-black' : 'tw:text-destructive'}>{FormatIntPercentage(state.currentRegion, roi)}%</span>
      },
      center: true,
      sortable: true,
      compact: true,
      sortFunction: sortRoi,
    },
    {
      name: (
        <div className='tw:text-center tw:flex tw:flex-col tw:justify-center tw:items-center tw:gap-1'>
          <span className='tw:font-semibold tw:text-[13px]'>Refunds</span>
          <span
            className={'tw:font-normal tw:text-[16.25px] ' + (tableData.reduce((total: number, product: ProductPerformance) => total + product.refundsQty, 0) > 0 ? 'tw:text-primary' : 'tw:text-[color:var(--bs-secondary-color)]')}>
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
        <div className='tw:text-center tw:flex tw:flex-col tw:justify-center tw:items-center tw:gap-1'>
          <span className='tw:font-semibold tw:text-[13px]'>Units Sold</span>
          <span className='tw:font-normal tw:text-[16.25px] tw:text-primary'>
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
            color='ghost'
            className='tw:!text-info tw:hover:bg-[color-mix(in_srgb,var(--info)_10%,transparent)]'
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
