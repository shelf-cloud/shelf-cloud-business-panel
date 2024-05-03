/* eslint-disable @next/next/no-img-element */
import dynamic from 'next/dynamic'
import { ReorderingPointsProduct } from '@typesTs/reorderingPoints/reorderingPoints'
import React, { useContext } from 'react'
import DataTable from 'react-data-table-component'
import Link from 'next/link'
import { FormatCurrency, FormatIntNumber } from '@lib/FormatNumbers'
import AppContext from '@context/AppContext'
import { DebounceInput } from 'react-debounce-input'
import { Badge, UncontrolledTooltip } from 'reactstrap'
const ReorderingPointsExpandedDetails = dynamic(() => import('./ReorderingPointsExpandedDetails'), {
  ssr: false,
})
// import ReorderingPointsExpandedDetails from './ReorderingPointsExpandedDetails'

type Props = {
  filterDataTable: ReorderingPointsProduct[]
  pending: boolean
  loadingSales: boolean
  handleOrderQty: (sku: string, orderQty: number) => void
  handleUseAdjustedQty: (sku: string, state: boolean) => void
  setSelectedRows: (selectedRows: ReorderingPointsProduct[]) => void
  toggledClearRows: boolean
  selectedSupplier: string
  setSelectedSupplier: (selectedSupplier: string) => void
  setError: (skus: any) => void
  setSalesModal: (prev: any) => void
  handleDaysOfStockQty: (sku: string, daysOfStockQty: number, inventoryId: number) => void
  setField: string
  handleSetSorting: (field: string) => void
}

const ReorderingPointsTable = ({
  filterDataTable,
  pending,
  loadingSales,
  handleOrderQty,
  handleUseAdjustedQty,
  setSelectedRows,
  toggledClearRows,
  selectedSupplier,
  setSelectedSupplier,
  setError,
  setSalesModal,
  handleDaysOfStockQty,
  setField,
  handleSetSorting,
}: Props) => {
  const { state }: any = useContext(AppContext)

  const handleSelectedRows = ({ selectedRows }: { selectedRows: ReorderingPointsProduct[] }) => {
    setSelectedRows(selectedRows)
  }

  const conditionalRowStyles = [
    {
      when: (row: ReorderingPointsProduct) => Number(row.order) > 0,
      classNames: ['bg-success bg-opacity-25'],
    },
    {
      when: (row: ReorderingPointsProduct) => Number(row.order) < 0 || !Number.isInteger(Number(row.order)),
      classNames: ['bg-danger bg-opacity-25'],
    },
  ]

  const columns: any = [
    {
      name: (
        <div className='text-center d-flex flex-column justify-content-center align-items-center gap-1'>
          <span className={'fs-7 ' + (setField === 'urgency' ? 'fw-bold' : 'text-muted')} style={{ cursor: 'pointer' }} onClick={() => handleSetSorting('urgency')}>
            Urgency
          </span>
          <span className={'fs-7 ' + (setField === 'daysRemaining' ? 'fw-bold' : 'text-muted')} style={{ cursor: 'pointer' }} onClick={() => handleSetSorting('daysRemaining')}>
            Remaining Days
          </span>
        </div>
      ),
      selector: (row: ReorderingPointsProduct) => {
        var color: string = 'text-primary'
        switch (row.urgency) {
          case 3:
            color = 'text-danger'
            break
          case 2:
            color = 'text-warning'
            break
          case 1:
            color = 'text-info'
            break
          default:
            color = 'text-success'
            break
        }
        return (
          <div className='d-flex flex-column justify-content-center align-items-center gap-1'>
            <i className={`mdi mdi-alert-octagon fs-3 m-0 p-0 ${color}`} />
            <span className='m-0 p-0 text-center fs-7'>{`${FormatIntNumber(state.currentRegion, row.daysRemaining)} days`}</span>
          </div>
        )
      },
      sortable: false,
      center: true,
      compact: true,
      grow: 0,
      // sortFunction: urgencySort,
    },
    {
      name: (
        <span className={'w-100 fs-7 text-center ' + (setField === 'sku' ? 'fw-bold' : 'text-muted')} style={{ cursor: 'pointer' }} onClick={() => handleSetSorting('sku')}>
          Product
        </span>
      ),
      selector: (row: ReorderingPointsProduct) => {
        return (
          <div className='my-1 d-flex flex-row justify-content-start align-items-center gap-2'>
            <div
              style={{
                width: '45px',
                minWidth: '30px',
                height: '45px',
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
            <div className='w-100'>
              <Link href={`/product/${row.inventoryId}/${row.sku}`} passHref>
                <a>
                  <p className='m-0 p-0 text-primary fw-semibold fs-6'>{row.sku}</p>
                </a>
              </Link>
              <p className='m-0 p-0 text-black fw-semibold fs-7 text-wrap'>{row.title}</p>
              <span className='m-0 p-0 text-black fw-normal fs-7 d-flex flex-wrap justify-content-start align-items-center'>
                {row.asin && (
                  <div className='d-flex flex-wrap justify-content-start align-items-center'>
                    {`ASIN:`}
                    <a
                      href={`https://www.amazon.${state.currentRegion == 'us' ? 'com' : 'es'}/dp/${row.asin}`}
                      target='blank'
                      className='fw-light'
                      style={{ textDecoration: 'none' }}>
                      {row.asin}
                    </a>
                    <i className='ri-file-copy-line fs-5 my-0 mx-1 p-0 text-muted' style={{ cursor: 'pointer' }} onClick={() => navigator.clipboard.writeText(row.asin)} />
                  </div>
                )}
                {row.barcode && (
                  <div>
                    {`UPC: `}
                    <span className='fw-light text-muted'>{row.barcode}</span>
                  </div>
                )}
              </span>
              {row.hideReorderingPoints && (
                <Badge pill color='warning' className='fs-7 fw-normal'>
                  Hidden
                </Badge>
              )}
            </div>
          </div>
        )
      },
      sortable: false,
      center: false,
      compact: true,
      grow: 2,
    },
    {
      name: (
        <div className='d-flex flex-column justify-content-center align-items-start'>
          <span className={'fs-7 ' + (setField === 'supplier' ? 'fw-bold' : 'text-muted')} style={{ cursor: 'pointer' }} onClick={() => handleSetSorting('supplier')}>
            Supplier
          </span>
          <span className={'fs-7 ' + (setField === 'brand' ? 'fw-bold' : 'text-muted')} style={{ cursor: 'pointer' }} onClick={() => handleSetSorting('brand')}>
            Brand
          </span>
        </div>
      ),
      selector: (row: ReorderingPointsProduct) => {
        return (
          <div>
            <p className='m-0 p-0 fs-7 fw-semibold'>{row.supplier}</p>
            <p className='m-0 p-0 fs-7'>{row.brand}</p>
          </div>
        )
      },
      sortable: false,
      wrap: true,
      center: false,
      compact: true,
      grow: 0,
    },
    {
      name: (
        <div className='text-center d-flex flex-column justify-content-center align-items-center'>
          <span className={'fs-7 ' + (setField === 'warehouseQty' ? 'fw-bold' : 'text-muted')} style={{ cursor: 'pointer' }} onClick={() => handleSetSorting('warehouseQty')}>
            Warehouse
          </span>
          <span className={'fs-7 ' + (setField === 'fbaQty' ? 'fw-bold' : 'text-muted')} style={{ cursor: 'pointer' }} onClick={() => handleSetSorting('fbaQty')}>
            FBA
          </span>
          <span className={'fs-7 ' + (setField === 'productionQty' ? 'fw-bold' : 'text-muted')} style={{ cursor: 'pointer' }} onClick={() => handleSetSorting('productionQty')}>
            Production
          </span>
          <span className={'fs-7 ' + (setField === 'receiving' ? 'fw-bold' : 'text-muted')} style={{ cursor: 'pointer' }} onClick={() => handleSetSorting('receiving')}>
            Receiving
          </span>
        </div>
      ),
      selector: (row: ReorderingPointsProduct) => {
        return (
          <div>
            <p className='m-0 p-0 text-center fs-7'>{row.warehouseQty}</p>
            <p className='m-0 p-0 text-center fs-7'>{row.fbaQty}</p>
            <p className='m-0 p-0 text-center fs-7'>{row.productionQty}</p>
            <p className='m-0 p-0 text-center fs-7'>{row.receiving}</p>
          </div>
        )
      },
      sortable: false,
      center: true,
      compact: true,
      grow: 0,
    },
    {
      name: (
        <span
          className={'fs-7 text-wrap text-center ' + (setField === 'totalInventory' ? 'fw-bold' : 'text-muted')}
          style={{ cursor: 'pointer' }}
          onClick={() => handleSetSorting('totalInventory')}>
          Total Inventory
        </span>
      ),
      selector: (row: ReorderingPointsProduct) => FormatIntNumber(state.currentRegion, row.warehouseQty + row.fbaQty + row.productionQty + row.receiving),
      wrap: true,
      sortable: false,
      center: true,
      compact: false,
      grow: 0,
    },
    {
      name: (
        <div>
          <p className='m-0 mb-1 fw-semibold fs-6 text-center'>Total Orders</p>
          <div className='d-flex flex-wrap justify-content-between align-items-center gap-1 text-start'>
            <span className={'fs-7 ' + (setField === '30D' ? 'fw-bold' : 'text-muted')} style={{ cursor: 'pointer' }} onClick={() => handleSetSorting('30D')}>
              30D
            </span>
            <span className={'fs-7 ' + (setField === '60D' ? 'fw-bold' : 'text-muted')} style={{ cursor: 'pointer' }} onClick={() => handleSetSorting('60D')}>
              60D
            </span>
            <span className={'fs-7 ' + (setField === '90D' ? 'fw-bold' : 'text-muted')} style={{ cursor: 'pointer' }} onClick={() => handleSetSorting('90D')}>
              90D
            </span>
            <span className={'fs-7 ' + (setField === '120D' ? 'fw-bold' : 'text-muted')} style={{ cursor: 'pointer' }} onClick={() => handleSetSorting('120D')}>
              120D
            </span>
            <span className={'fs-7 ' + (setField === '180D' ? 'fw-bold' : 'text-muted')} style={{ cursor: 'pointer' }} onClick={() => handleSetSorting('180D')}>
              180D
            </span>
            <span className={'fs-7 ' + (setField === '365D' ? 'fw-bold' : 'text-muted')} style={{ cursor: 'pointer' }} onClick={() => handleSetSorting('365D')}>
              365D
            </span>
          </div>
        </div>
      ),
      selector: (row: ReorderingPointsProduct) => {
        return (
          <>
            <div className='d-flex flex-row justify-content-start align-items-center gap-2 mt-2 fs-7'>
              <div className='d-flex flex-column justify-content-start align-items-center gap-2' style={{ overflow: 'unset', textOverflow: 'unset' }}>
                <div>
                  <span className='fw-semibold'>30D: </span>
                  <span>{FormatIntNumber(state.currentRegion, row.totalUnitsSold['30D'])}</span>
                </div>
                <div>
                  <span className='fw-semibold'>60D: </span>
                  <span>{FormatIntNumber(state.currentRegion, row.totalUnitsSold['60D'])}</span>
                </div>
                <div>
                  <span className='fw-semibold'>90D: </span>
                  <span>{FormatIntNumber(state.currentRegion, row.totalUnitsSold['90D'])}</span>
                </div>
              </div>
              <div className='d-flex flex-column justify-content-center align-items-center gap-2' style={{ overflow: 'unset', textOverflow: 'unset' }}>
                <div>
                  <span className='fw-semibold'>120D: </span>
                  <span>{FormatIntNumber(state.currentRegion, row.totalUnitsSold['120D'])}</span>
                </div>
                <div>
                  <span className='fw-semibold'>180D: </span>
                  <span>{FormatIntNumber(state.currentRegion, row.totalUnitsSold['180D'])}</span>
                </div>
                <div>
                  <span className='fw-semibold'>365D: </span>
                  <span>{FormatIntNumber(state.currentRegion, row.totalUnitsSold['365D'])}</span>
                </div>
              </div>
            </div>
            <p className='text-end m-0 p-0 mb-2'>
              <i
                className='ri-search-eye-line fs-6 text-primary'
                style={{ cursor: 'pointer' }}
                onClick={() => {
                  setSalesModal({ showSalesModal: true, sku: row.sku, title: row.title, totalUnitsSold: row.totalUnitsSold, marketplaces: row.marketplaces })
                }}
              />
            </p>
          </>
        )
      },
      sortable: false,
      center: true,
      compact: true,
      grow: 0,
      style: {
        minWidth: 'fit-content',
      },
    },
    {
      name: (
        <div className='w-100 text-center d-flex flex-column justify-content-center align-items-center'>
          <span className={'fs-7 ' + (setField === 'sellerCost' ? 'fw-bold' : 'text-muted')} style={{ cursor: 'pointer' }} onClick={() => handleSetSorting('sellerCost')}>
            Supplier Cost
          </span>
          <span className={'fs-7 ' + (setField === 'boxQty' ? 'fw-bold' : 'text-muted')} style={{ cursor: 'pointer' }} onClick={() => handleSetSorting('boxQty')}>
            Box Qty
          </span>
        </div>
      ),
      selector: (row: ReorderingPointsProduct) => {
        return (
          <div className='fs-7'>
            <p className='m-0 p-0 text-center'>{FormatCurrency(state.currentRegion, row.sellerCost)}</p>
            <p className='m-0 p-0 text-center'>{row.boxQty}</p>
          </div>
        )
      },
      sortable: false,
      center: true,
      compact: true,
    },
    {
      name: (
        <div className='w-100 text-center d-flex flex-column justify-content-center align-items-center'>
          <span className={'fs-7 ' + (setField === 'leadTime' ? 'fw-bold' : 'text-muted')} style={{ cursor: 'pointer' }} onClick={() => handleSetSorting('leadTime')}>
            Lead Time
          </span>
          <span className={'fs-7 ' + (setField === 'boxQty' ? 'fw-bold' : 'text-muted')}>Days of Stock</span>
        </div>
      ),
      selector: (row: ReorderingPointsProduct) => {
        return (
          <div className='fs-7 d-flex flex-column justify-content-center align-items-center gap-2'>
            <p className={'m-0 p-0 text-center' + (row.leadTime <= 0 ? ' fw-semibold text-danger' : '')}>{`${row.leadTime} days`}</p>
            <div className='w-100 d-flex flex-row justify-content-center align-items-center'>
              <DebounceInput
                type='number'
                debounceTimeout={300}
                className='form-control form-control-sm fs-7 m-0 w-75 py-0 text-center'
                placeholder='Days of Stock'
                min={0}
                id={`recommendedDaysOfStock-${row.sku}`}
                value={row.recommendedDaysOfStock}
                onChange={(e) => handleDaysOfStockQty(row.sku, parseInt(e.target.value), row.inventoryId)}
              />
              <i className='fs-5 text-primary las la-info-circle' style={{ cursor: 'pointer' }} id={'DaysOfStockInfo'} />
              <UncontrolledTooltip placement='top' target={'DaysOfStockInfo'} popperClassName='bg-white px-1 pt-1 rounded-2' innerClassName='shadow bg-white p-0'>
                <p className='fs-7 text-primary m-0 p-0 mb-0'>The number of days you want to have stock in addition to the lead time.</p>
              </UncontrolledTooltip>
            </div>
          </div>
        )
      },
      sortable: false,
      center: true,
      compact: true,
    },
    {
      name: (
        <div className='text-center d-flex flex-column justify-content-center align-items-center'>
          <span className={'fs-7 ' + (setField === 'recommendedQty' ? 'fw-bold' : 'text-muted')} style={{ cursor: 'pointer' }} onClick={() => handleSetSorting('recommendedQty')}>
            Recommended
          </span>
          <span className={'fs-7 ' + (setField === 'forecast' ? 'fw-bold' : 'text-muted')} style={{ cursor: 'pointer' }} onClick={() => handleSetSorting('forecast')}>
            Forecast
          </span>
          <span
            className={'fs-7 ' + (setField === 'adjustedForecast' ? 'fw-bold' : 'text-muted')}
            style={{ cursor: 'pointer' }}
            onClick={() => handleSetSorting('adjustedForecast')}>
            Adjusted
          </span>
        </div>
      ),
      selector: (row: ReorderingPointsProduct) => {
        return (
          <div className='fs-7'>
            <p className='m-0 p-0 text-center' id={'Recommended_Qty'}>
              {FormatIntNumber(
                state.currentRegion,
                Math.ceil(
                  (row.leadTime + row.recommendedDaysOfStock) * (row.totalUnitsSold['30D'] / 30) - (row.warehouseQty + row.fbaQty + row.productionQty + row.receiving) < 0
                    ? 0
                    : Math.ceil(
                        (row.leadTime + row.recommendedDaysOfStock) * (row.totalUnitsSold['30D'] / 30) - (row.warehouseQty + row.fbaQty + row.productionQty + row.receiving)
                      )
                )
              )}
            </p>
            <UncontrolledTooltip placement='top' target={'Recommended_Qty'} popperClassName='bg-white px-1 pt-1 rounded-2' innerClassName='shadow bg-white p-0'>
              <p className='fs-7 text-primary m-0 p-0 mb-0'>Lead Time + Days of Stock x Daily Sales Last 30 Days - Total Inventory</p>
            </UncontrolledTooltip>
            <p className='m-0 p-0 text-center' id={`forecast_${row.sku}`}>
              {FormatIntNumber(
                state.currentRegion,
                Object.values(row.forecast).reduce((total, unitsSold) => total + unitsSold, 0) - (row.warehouseQty + row.fbaQty + row.productionQty + row.receiving) < 0
                  ? 0
                  : Object.values(row.forecast).reduce((total, unitsSold) => total + unitsSold, 0) - (row.warehouseQty + row.fbaQty + row.productionQty + row.receiving)
              )}
            </p>
            <UncontrolledTooltip placement='top' target={`forecast_${row.sku}`} popperClassName='bg-white px-1 pt-1 rounded-2' innerClassName='shadow bg-white p-0'>
              <p className='fs-7 text-primary m-0 p-0 mb-0'>{`Forecast Model: ${row.forecastModel} - Total Inventory`}</p>
            </UncontrolledTooltip>
            <p className='m-0 p-0 text-center'>{FormatIntNumber(state.currentRegion, row.adjustedForecast)}</p>
          </div>
        )
      },
      sortable: false,
      center: true,
      compact: true,
    },
    {
      name: (
        <div className='text-center d-flex flex-column justify-content-center align-items-center'>
          <span className='fw-semibold fs-7'>Order Qty</span>
          <span className='fw-semibold fs-7'>Adjusted Master Boxes</span>
        </div>
      ),
      selector: (row: ReorderingPointsProduct) => {
        return (
          <div className='d-flex flex-column justify-content-start align-items-end gap-2 w-100 px-1'>
            <div className='w-100 d-flex flex-row justify-content-between align-items-center gap-2'>
              <DebounceInput
                type='number'
                // minLength={1}
                disabled={selectedSupplier !== '' && selectedSupplier !== row.supplier}
                debounceTimeout={400}
                className='form-control form-control-sm fs-7 m-0 py-0 w-75 text-center'
                placeholder='Order Qty...'
                min={0}
                id={`orderQty-${row.sku}`}
                value={row.order === 0 ? '' : row.order}
                onChange={(e) => {
                  if (parseInt(e.target.value) < 0) {
                    setError((prev: string[]) => [...prev, row.sku])
                    handleOrderQty(row.sku, parseInt(e.target.value))
                  } else {
                    setSelectedSupplier(row.supplier)
                    setError((prev: string[]) => prev.filter((sku) => sku !== row.sku))
                    handleOrderQty(row.sku, parseInt(e.target.value))
                  }
                }}
              />
              <input
                className='form-check-input m-0 p-0'
                type='checkbox'
                checked={!row.useOrderAdjusted}
                id={`orderCheckbox-${row.sku}`}
                onClick={() => handleUseAdjustedQty(row.sku, false)}
                readOnly
              />
            </div>
            <div className='w-100 d-flex flex-row justify-content-between align-items-center gap-2'>
              <span className='w-75 m-0 p-0 text-center fs-7'>{FormatIntNumber(state.currentRegion, row.orderAdjusted)}</span>
              <input
                className='form-check-input m-0 p-0'
                type='checkbox'
                checked={row.useOrderAdjusted}
                id={`adjustedOrderCheckbox-${row.sku}`}
                onClick={() => handleUseAdjustedQty(row.sku, true)}
                readOnly
              />
            </div>
          </div>
        )
      },
      sortable: false,
      center: true,
      compact: true,
      grow: 1,
    },
  ]

  return (
    <>
      <DataTable
        columns={columns}
        data={filterDataTable}
        progressPending={pending}
        dense
        striped
        selectableRows
        onSelectedRowsChange={handleSelectedRows}
        clearSelectedRows={toggledClearRows}
        expandableRows={!loadingSales}
        expandableRowsComponent={ReorderingPointsExpandedDetails}
        // defaultSortFieldId={0}
        // defaultSortAsc={false}
        // expandableRowsComponentProps={{ selectedMarketplaceStoreId: selectedMarketplace.storeId }}
        pagination={filterDataTable.length > 100 ? true : false}
        paginationPerPage={50}
        paginationRowsPerPageOptions={[50, 100, 200, 500]}
        paginationComponentOptions={{
          rowsPerPageText: 'Products per page:',
          rangeSeparatorText: 'of',
          noRowsPerPage: false,
          selectAllRowsItem: true,
          selectAllRowsItemText: 'All',
        }}
        conditionalRowStyles={conditionalRowStyles}
      />
    </>
  )
}

export default ReorderingPointsTable
