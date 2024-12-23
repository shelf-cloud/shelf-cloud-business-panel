/* eslint-disable @next/next/no-img-element */
import AppContext from '@context/AppContext'
import { FormatCurrency, FormatIntNumber, FormatIntPercentage } from '@lib/FormatNumbers'
import { ProductPerformance, Marketplace } from '@typesTs/marketplaces/productPerformance'
import React, { useContext, useState } from 'react'
import DataTable from 'react-data-table-component'
import ProductPerformanceExpandedDetails from './productPerformanceExpandedDetails'
import UnitsSoldDetailsModal from '@components/modals/marketplaces/unitsSoldDetailsModal'
import { Button } from 'reactstrap'
import Link from 'next/link'
import { NoImageAdress } from '@lib/assetsConstants'

type Props = {
  tableData: ProductPerformance[]
  pending: boolean
  selectedMarketplace: {
    storeId: number
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
  const totalExpenses =
    selectedMarketplace.storeId === 9999
      ? tableData.reduce((total: number, product: ProductPerformance) => total + product.expenses + product.storageCost, 0)
      : tableData.reduce((total: number, product: ProductPerformance) => total + product.expenses, 0)

  const totalProfit =
    selectedMarketplace.storeId === 9999
      ? tableData.reduce((total: number, product: ProductPerformance) => total + (product.grossRevenue - (product.expenses + product.storageCost)), 0)
      : tableData.reduce((total: number, product: ProductPerformance) => total + (product.grossRevenue - product.expenses), 0)

  const totalMargin = ((totalGrossRevenue - totalExpenses) / totalGrossRevenue) * 100
  const totalRoi = ((totalGrossRevenue - totalExpenses) / totalExpenses) * 100

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
    const a = rowA.expenses
    const b = rowB.expenses
    if (a > b) {
      return 1
    }
    if (b > a) {
      return -1
    }
    return 0
  }
  const sortProfit = (rowA: ProductPerformance, rowB: ProductPerformance) => {
    const a = rowA?.grossRevenue - rowA?.expenses
    const b = rowB?.grossRevenue - rowB?.expenses
    if (a > b) {
      return 1
    }
    if (b > a) {
      return -1
    }
    return 0
  }
  const sortMargin = (rowA: ProductPerformance, rowB: ProductPerformance) => {
    const a = rowA?.grossRevenue === 0 ? 0 : ((rowA?.grossRevenue - rowA?.expenses) / rowA?.grossRevenue) * 100
    const b = rowB?.grossRevenue === 0 ? 0 : ((rowB?.grossRevenue - rowB?.expenses) / rowB?.grossRevenue) * 100
    if (a > b) {
      return 1
    }
    if (b > a) {
      return -1
    }
    return 0
  }
  const sortRoi = (rowA: ProductPerformance, rowB: ProductPerformance) => {
    const a = rowA?.expenses === 0 ? 0 : ((rowA.grossRevenue - rowA?.expenses) / rowA?.expenses) * 100
    const b = rowB?.expenses === 0 ? 0 : ((rowB.grossRevenue - rowB?.expenses) / rowB?.expenses) * 100
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
      name: <span className='fw-semibold fs-6'>Product</span>,
      selector: (row: ProductPerformance) => {
        return (
          <div className='my-1 d-flex justify-content-between align-items-center gap-2'>
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
              <Link href={`/product/${row.inventoryId}/${row.sku}`} passHref>
                <a>
                  <p className='m-0 p-0 text-primary fw-semibold fs-6'>{row.sku}</p>
                </a>
              </Link>
              <p className='m-0 p-0 text-black fw-semibold fs-7 text-wrap'>{row.title}</p>
              <p className='m-0 p-0 text-black fw-normal fs-7 d-flex flex-row justify-content-start align-items-center'>
                {row.asin && (
                  <>
                    {`ASIN: `}
                    <a
                      href={`https://www.amazon.${state.currentRegion == 'us' ? 'com' : 'es'}/dp/${row.asin}`}
                      target='blank'
                      className='fw-light'
                      style={{ textDecoration: 'none' }}>
                      {row.asin}
                    </a>
                    <i className='ri-file-copy-line fs-5 my-0 mx-2 p-0 text-muted' style={{ cursor: 'pointer' }} onClick={() => navigator.clipboard.writeText(row.asin)} />
                  </>
                )}
                {row.barcode && (
                  <>
                    UPC:<span className='fw-light text-muted'>{row.barcode}</span>
                  </>
                )}
              </p>
            </div>
          </div>
        )
      },
      sortable: true,
      center: false,
      compact: false,
      grow: 2,
      sortFunction: caseInsensitiveSort,
    },
    {
      name: <span className='fw-semibold fs-6 text-center'>Supplier</span>,
      selector: (row: ProductPerformance) => {
        return (
          <>
            <p className='w-100 m-0 p-0 text-start fs-7 fw-bold'>{row.supplier}</p>
            <p className='w-100 m-0 p-0 text-start fs-7'>{row.brand}</p>
            <p className='w-100 m-0 p-0 text-start fs-7'>{row.category}</p>
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
        <div className='text-center d-flex flex-column justify-content-center align-item-center gap-1'>
          <span className='fw-semibold fs-6'>Gross Revenue</span>
          <span className={'fw-normal fs-5 ' + (totalGrossRevenue > 0 ? 'text-primary' : 'text-danger')}>{FormatCurrency(state.currentRegion, totalGrossRevenue)}</span>
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
        <div className='text-center d-flex flex-column justify-content-center align-item-center gap-1'>
          <span className='fw-semibold fs-6'>Expenses</span>
          <span className={'fw-normal fs-5 ' + (totalExpenses > 0 ? 'text-primary' : 'text-danger')}>{FormatCurrency(state.currentRegion, totalExpenses)}</span>
        </div>
      ),
      selector: (row: ProductPerformance) => {
        return <span>{FormatCurrency(state.currentRegion, selectedMarketplace.storeId === 9999 ? row?.expenses + row?.storageCost : row?.expenses)}</span>
      },
      center: true,
      sortable: true,
      compact: true,
      sortFunction: sortExpenses,
    },
    {
      name: (
        <div className='text-center d-flex flex-column justify-content-center align-item-center gap-1'>
          <span className='fw-semibold fs-6'>Profit</span>
          <span className={'fw-normal fs-5 ' + (totalProfit > 0 ? 'text-primary' : 'text-danger')}>{FormatCurrency(state.currentRegion, totalProfit)}</span>
        </div>
      ),
      selector: (row: ProductPerformance) => {
        return (
          <span className={row?.grossRevenue - (selectedMarketplace.storeId === 9999 ? row?.expenses + row?.storageCost : row?.expenses) >= 0 ? 'text-black' : 'text-danger'}>
            {FormatCurrency(state.currentRegion, row?.grossRevenue - (selectedMarketplace.storeId === 9999 ? row?.expenses + row?.storageCost : row?.expenses))}
          </span>
        )
      },
      center: true,
      sortable: true,
      compact: true,
      sortFunction: sortProfit,
    },
    {
      name: (
        <div className='text-center d-flex flex-column justify-content-center align-item-center gap-1'>
          <span className='fw-semibold fs-6'>Margin</span>
          <span className={'fw-normal fs-5 ' + (totalMargin > 0 ? 'text-primary' : 'text-danger')}>{FormatIntPercentage(state.currentRegion, totalMargin)}%</span>
        </div>
      ),
      selector: (row: ProductPerformance) => {
        if (row?.grossRevenue === 0) {
          return <span>0%</span>
        } else {
          return (
            <span
              className={
                ((row?.grossRevenue - (selectedMarketplace.storeId === 9999 ? row?.expenses + row?.storageCost : row?.expenses)) / row?.grossRevenue) * 100 >= 0
                  ? 'text-black'
                  : 'text-danger'
              }>
              {FormatIntPercentage(
                state.currentRegion,
                ((row?.grossRevenue - (selectedMarketplace.storeId === 9999 ? row?.expenses + row?.storageCost : row?.expenses)) / row?.grossRevenue) * 100
              )}
              %
            </span>
          )
        }
      },
      center: true,
      sortable: true,
      compact: true,
      sortFunction: sortMargin,
    },
    {
      name: (
        <div className='text-center d-flex flex-column justify-content-center align-item-center gap-1'>
          <span className='fw-semibold fs-6'>ROI</span>
          <span className={'fw-normal fs-5 ' + (totalRoi > 0 ? 'text-primary' : 'text-danger')}>{FormatIntPercentage(state.currentRegion, totalRoi)}%</span>
        </div>
      ),
      selector: (row: ProductPerformance) => {
        if (row?.expenses + row.productCost + row.shippingCost == 0) {
          return <span>0%</span>
        } else {
          return (
            <span
              className={
                ((row.grossRevenue - (selectedMarketplace.storeId === 9999 ? row?.expenses + row?.storageCost : row?.expenses)) /
                  (selectedMarketplace.storeId === 9999 ? row?.expenses + row?.storageCost : row?.expenses)) *
                  100 >=
                0
                  ? 'text-black'
                  : 'text-danger'
              }>
              {FormatIntPercentage(
                state.currentRegion,
                ((row.grossRevenue - (selectedMarketplace.storeId === 9999 ? row?.expenses + row?.storageCost : row?.expenses)) /
                  (selectedMarketplace.storeId === 9999 ? row?.expenses + row?.storageCost : row?.expenses)) *
                  100
              )}
              %
            </span>
          )
        }
      },
      center: true,
      sortable: true,
      compact: true,
      sortFunction: sortRoi,
    },
    {
      name: (
        <div className='text-center d-flex flex-column justify-content-center align-item-center gap-1'>
          <span className='fw-semibold fs-6'>Refunds</span>
          <span
            className={'fw-normal fs-5 ' + (tableData.reduce((total: number, product: ProductPerformance) => total + product.refundsQty, 0) > 0 ? 'text-primary' : 'text-muted')}>
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
        <div className='text-center d-flex flex-column justify-content-center align-item-center gap-1'>
          <span className='fw-semibold fs-6'>Units Sold</span>
          <span className='fw-normal fs-5 text-primary'>
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
            color='info'
            outline
            className='btn btn-ghost-info'
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
