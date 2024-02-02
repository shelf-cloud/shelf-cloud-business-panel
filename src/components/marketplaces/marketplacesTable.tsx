/* eslint-disable @next/next/no-img-element */
import AppContext from '@context/AppContext'
import { FormatCurrency, FormatIntNumber } from '@lib/FormatNumbers'
import { ProductPerformance } from '@typesTs/marketplaces/productPerformance'
import React, { useContext } from 'react'
import DataTable from 'react-data-table-component'

type Props = {
  tableData: ProductPerformance[]
  pending: boolean
}

const MarketplacesTable = ({ tableData, pending }: Props) => {
  const { state }: any = useContext(AppContext)

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
    const a = rowA?.grossRevenue - (rowA?.expenses + rowA?.productCost + rowA?.shippingCost)
    const b = rowB?.grossRevenue - (rowB?.expenses + rowB?.productCost + rowB?.shippingCost)
    if (a > b) {
      return 1
    }
    if (b > a) {
      return -1
    }
    return 0
  }
  const sortMargin = (rowA: ProductPerformance, rowB: ProductPerformance) => {
    const a = rowA?.grossRevenue === 0 ? 0 : ((rowA?.grossRevenue - (rowA?.expenses + rowA?.productCost + rowA?.shippingCost)) / rowA?.grossRevenue) * 100
    const b = rowB?.grossRevenue === 0 ? 0 : ((rowB?.grossRevenue - (rowB?.expenses + rowB?.productCost + rowB?.shippingCost)) / rowB?.grossRevenue) * 100
    if (a > b) {
      return 1
    }
    if (b > a) {
      return -1
    }
    return 0
  }
  const sortRoi = (rowA: ProductPerformance, rowB: ProductPerformance) => {
    const a =
      rowA?.expenses + rowA?.productCost + rowA?.shippingCost === 0
        ? 0
        : ((rowA.grossRevenue - (rowA?.expenses + rowA?.productCost + rowA?.shippingCost)) / (rowA?.expenses + rowA?.productCost + rowA?.shippingCost)) * 100
    const b =
      rowB?.expenses + rowB?.productCost + rowB?.shippingCost === 0
        ? 0
        : ((rowB.grossRevenue - (rowB?.expenses + rowB?.productCost + rowB?.shippingCost)) / (rowB?.expenses + rowB?.productCost + rowB?.shippingCost)) * 100
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
      name: <span className='fw-bolder fs-6'>Product</span>,
      selector: (row: ProductPerformance) => {
        return (
          <div className='my-1 d-flex justify-content-between align-items-center gap-2'>
            <div
              style={{
                width: '30px',
                height: '30px',
                margin: '0px',
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
            <div>
              <p className='m-0 p-0 text-primary fw-semibold fs-6'>{row.sku}</p>
              <p className='m-0 p-0 text-black fw-normal fs-7'>
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
                  </>
                )}
                {row.barcode && (
                  <>
                    {` UPC:`} <span className='fw-light text-muted'>{row.barcode}</span>
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
      name: <span className='fw-bolder fs-6 text-center'>Gross Revenue</span>,
      selector: (row: ProductPerformance) => {
        return <span>{FormatCurrency(state.currentRegion, row?.grossRevenue)}</span>
      },
      center: true,
      sortable: true,
      compact: true,
      sortFunction: sortGrossRevenue,
    },
    {
      name: <span className='fw-bolder fs-6'>Expenses</span>,
      selector: (row: ProductPerformance) => {
        return <span>{FormatCurrency(state.currentRegion, row?.expenses + row?.productCost + row?.shippingCost)}</span>
      },
      center: true,
      sortable: true,
      compact: true,
      sortFunction: sortExpenses,
    },
    {
      name: <span className='fw-bolder fs-6'>Profit</span>,
      selector: (row: ProductPerformance) => {
        return (
          <span className={row?.grossRevenue - (row?.expenses + row?.productCost + row?.shippingCost) >= 0 ? 'text-black' : 'text-danger'}>
            {FormatCurrency(state.currentRegion, row?.grossRevenue - (row?.expenses + row?.productCost + row?.shippingCost))}
          </span>
        )
      },
      center: true,
      sortable: true,
      compact: true,
      sortFunction: sortProfit,
    },
    {
      name: <span className='fw-bolder fs-6'>Margin</span>,
      selector: (row: ProductPerformance) => {
        if (row?.grossRevenue === 0) {
          return <span>0%</span>
        } else {
          return (
            <span className={((row?.grossRevenue - (row?.expenses + row?.productCost + row?.shippingCost)) / row?.grossRevenue) * 100 >= 0 ? 'text-black' : 'text-danger'}>
              {FormatIntNumber(state.currentRegion, ((row?.grossRevenue - (row?.expenses + row?.productCost + row?.shippingCost)) / row?.grossRevenue) * 100)}%
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
      name: <span className='fw-bolder fs-6'>ROI</span>,
      selector: (row: ProductPerformance) => {
        if (row?.expenses + row.productCost + row.shippingCost == 0) {
          return <span>0%</span>
        } else {
          return (
            <span
              className={
                ((row.grossRevenue - (row?.expenses + row?.productCost + row?.shippingCost)) / (row?.expenses + row?.productCost + row?.shippingCost)) * 100 >= 0
                  ? 'text-black'
                  : 'text-danger'
              }>
              {FormatIntNumber(
                state.currentRegion,
                ((row.grossRevenue - (row?.expenses + row?.productCost + row?.shippingCost)) / (row?.expenses + row?.productCost + row?.shippingCost)) * 100
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
      name: <span className='fw-bolder fs-6'>Refunds</span>,
      selector: (row: ProductPerformance) => {
        return <span>{FormatIntNumber(state.currentRegion, row?.refundsQty)}</span>
      },
      center: true,
      sortable: true,
      compact: true,
      sortFunction: sortRefunds,
    },
    {
      name: <span className='fw-bolder fs-6'>Units Sold</span>,
      selector: (row: ProductPerformance) => {
        return <span>{FormatIntNumber(state.currentRegion, row?.unitsSold)}</span>
      },
      center: true,
      sortable: true,
      compact: true,
      sortFunction: sortUnitsSold,
    },
  ]

  return (
    <DataTable
      columns={columns}
      data={tableData}
      progressPending={pending}
      striped={true}
      // selectableRows
      // onSelectedRowsChange={handleSelectedRows}
      // clearSelectedRows={toggledClearRows}
      expandableRows
      // expandableRowsComponent={ProductPerformancesExpandedDetail}
      // expandableRowsComponentProps={{ apiMutateLink: apiMutateLink }}
      dense
      defaultSortFieldId={2}
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
  )
}

export default MarketplacesTable
