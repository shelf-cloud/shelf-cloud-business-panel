/* eslint-disable @next/next/no-img-element */
import dynamic from 'next/dynamic'
import { ReorderingPointsProduct } from '@typesTs/reorderingPoints/reorderingPoints'
import React, { useContext } from 'react'
import DataTable from 'react-data-table-component'
import Link from 'next/link'
import { FormatCurrency, FormatIntNumber } from '@lib/FormatNumbers'
import AppContext from '@context/AppContext'
import { DebounceInput } from 'react-debounce-input'
import { Badge, Spinner, UncontrolledTooltip } from 'reactstrap'

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
  sortingDirectionAsc: boolean
  loadingForecast: boolean
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
  sortingDirectionAsc,
  loadingForecast,
}: Props) => {
  const { state }: any = useContext(AppContext)

  const handleSelectedRows = ({ selectedRows }: { selectedRows: ReorderingPointsProduct[] }) => {
    setSelectedRows(selectedRows)
  }

  const customStyles = {
    responsiveWrapper: {
      style: {
        height: '74dvh',
        scrollbarWidth: 'thin !important',
      },
    },
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
            Urgency{' '}
            {setField === 'urgency' ? sortingDirectionAsc ? <i className='ri-arrow-down-fill fs-7 text-primary' /> : <i className='ri-arrow-up-fill fs-7 text-primary' /> : null}
          </span>
          <span className={'fs-7 ' + (setField === 'daysRemaining' ? 'fw-bold' : 'text-muted')} style={{ cursor: 'pointer' }} onClick={() => handleSetSorting('daysRemaining')}>
            Remaining Days{' '}
            {setField === 'daysRemaining' ? (
              sortingDirectionAsc ? (
                <i className='ri-arrow-down-fill fs-7 text-primary' />
              ) : (
                <i className='ri-arrow-up-fill fs-7 text-primary' />
              )
            ) : null}
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

            <div className='d-flex flex-row justify-content-center align-items-center gap-1'>
              <span className={'m-0 p-0 text-center fs-7' + (row.daysToOrder <= 0 ? ' text-danger fw-semibold' : '')}>{`${FormatIntNumber(state.currentRegion, row.daysToOrder)} ${
                row.daysToOrder == 1 ? 'day' : 'days'
              }`}</span>
              <i className='fs-5 text-primary las la-info-circle' style={{ cursor: 'pointer' }} id={'DaysToOrderIcon'} />
              <UncontrolledTooltip placement='top' target={'DaysToOrderIcon'} innerClassName='bg-white border border-info border-opacity-50 p-2'>
                <p className='fs-7 text-primary m-0 p-0 mb-0'>Remaining days to place order.</p>
              </UncontrolledTooltip>
            </div>

            <div className='d-flex flex-row justify-content-center align-items-center gap-1'>
              <span className={'m-0 p-0 text-center fs-7' + (row.daysRemaining <= 0 ? ' text-danger fw-semibold' : '')}>{`${FormatIntNumber(
                state.currentRegion,
                row.daysRemaining
              )} ${row.daysRemaining == 1 ? 'day' : 'days'}`}</span>
              <i className='fs-5 text-primary las la-info-circle' style={{ cursor: 'pointer' }} id={'DaysRemaining'} />
              <UncontrolledTooltip placement='top' target={'DaysRemaining'} innerClassName='bg-white border border-info border-opacity-50 p-2'>
                <p className='fs-7 text-primary m-0 p-0 mb-0'>Remaining days of stock.</p>
              </UncontrolledTooltip>
            </div>
          </div>
        )
      },
      sortable: false,
      center: true,
      compact: true,
      // grow: 0,
      // sortFunction: urgencySort,
    },
    {
      name: (
        <span className={'w-100 fs-7 text-center ' + (setField === 'sku' ? 'fw-bold' : 'text-muted')} style={{ cursor: 'pointer' }} onClick={() => handleSetSorting('sku')}>
          Product {setField === 'sku' ? sortingDirectionAsc ? <i className='ri-arrow-down-fill fs-7 text-primary' /> : <i className='ri-arrow-up-fill fs-7 text-primary' /> : null}
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
      compact: false,
      minWidth: 'fit-content',
      width: '280px',
    },
    {
      name: (
        <div className='d-flex flex-column justify-content-center align-items-start'>
          <span className={'fs-7 ' + (setField === 'supplier' ? 'fw-bold' : 'text-muted')} style={{ cursor: 'pointer' }} onClick={() => handleSetSorting('supplier')}>
            Supplier{' '}
            {setField === 'supplier' ? sortingDirectionAsc ? <i className='ri-arrow-down-fill fs-7 text-primary' /> : <i className='ri-arrow-up-fill fs-7 text-primary' /> : null}
          </span>
          <span className={'fs-7 ' + (setField === 'brand' ? 'fw-bold' : 'text-muted')} style={{ cursor: 'pointer' }} onClick={() => handleSetSorting('brand')}>
            Brand{' '}
            {setField === 'brand' ? sortingDirectionAsc ? <i className='ri-arrow-down-fill fs-7 text-primary' /> : <i className='ri-arrow-up-fill fs-7 text-primary' /> : null}
          </span>
        </div>
      ),
      selector: (row: ReorderingPointsProduct) => {
        return (
          <div>
            <p className={'m-0 p-0 fs-7' + (row.supplier === '' ? ' text-muted fw-light fst-italic' : ' fw-semibold')}>{row.supplier === '' ? 'No supplier' : row.supplier}</p>
            <p className={'m-0 p-0 fs-7' + (row.brand === '' ? ' text-muted fw-light fst-italic' : ' fw-semibold')}>{row.brand === '' ? 'No brand' : row.supplier}</p>
          </div>
        )
      },
      sortable: false,
      wrap: true,
      center: false,
      compact: true,
      width: '50px',
      minWidth: 'fit-content',
    },
    {
      name: (
        <div className='text-center d-flex flex-column justify-content-center align-items-center'>
          <span className={'fs-7 ' + (setField === 'warehouseQty' ? 'fw-bold' : 'text-muted')} style={{ cursor: 'pointer' }} onClick={() => handleSetSorting('warehouseQty')}>
            Warehouse{' '}
            {setField === 'warehouseQty' ? (
              sortingDirectionAsc ? (
                <i className='ri-arrow-down-fill fs-7 text-primary' />
              ) : (
                <i className='ri-arrow-up-fill fs-7 text-primary' />
              )
            ) : null}
          </span>
          <span className={'fs-7 ' + (setField === 'fbaQty' ? 'fw-bold' : 'text-muted')} style={{ cursor: 'pointer' }} onClick={() => handleSetSorting('fbaQty')}>
            FBA {setField === 'fbaQty' ? sortingDirectionAsc ? <i className='ri-arrow-down-fill fs-7 text-primary' /> : <i className='ri-arrow-up-fill fs-7 text-primary' /> : null}
          </span>
          <span className={'fs-7 ' + (setField === 'productionQty' ? 'fw-bold' : 'text-muted')} style={{ cursor: 'pointer' }} onClick={() => handleSetSorting('productionQty')}>
            Production{' '}
            {setField === 'productionQty' ? (
              sortingDirectionAsc ? (
                <i className='ri-arrow-down-fill fs-7 text-primary' />
              ) : (
                <i className='ri-arrow-up-fill fs-7 text-primary' />
              )
            ) : null}
          </span>
          <span className={'fs-7 ' + (setField === 'receiving' ? 'fw-bold' : 'text-muted')} style={{ cursor: 'pointer' }} onClick={() => handleSetSorting('receiving')}>
            Receiving{' '}
            {setField === 'receiving' ? sortingDirectionAsc ? <i className='ri-arrow-down-fill fs-7 text-primary' /> : <i className='ri-arrow-up-fill fs-7 text-primary' /> : null}
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
      // grow: 0,
    },
    {
      name: (
        <span
          className={'fs-7 text-wrap text-center ' + (setField === 'totalInventory' ? 'fw-bold' : 'text-muted')}
          style={{ cursor: 'pointer' }}
          onClick={() => handleSetSorting('totalInventory')}>
          Total Inventory{' '}
          {setField === 'totalInventory' ? (
            sortingDirectionAsc ? (
              <i className='ri-arrow-down-fill fs-7 text-primary' />
            ) : (
              <i className='ri-arrow-up-fill fs-7 text-primary' />
            )
          ) : null}
        </span>
      ),
      selector: (row: ReorderingPointsProduct) => FormatIntNumber(state.currentRegion, row.warehouseQty + row.fbaQty + row.productionQty + row.receiving),
      wrap: true,
      sortable: false,
      center: true,
      compact: true,
      // grow: 0,
    },
    {
      name: (
        <div>
          <p className='m-0 mb-1 fw-bold fs-7 text-center'>Total Orders</p>
          <div className='d-flex flex-wrap justify-content-between align-items-center gap-1 text-start'>
            <span className={'fs-7 ' + (setField === '30D' ? 'fw-bold' : 'text-muted')} style={{ cursor: 'pointer' }} onClick={() => handleSetSorting('30D')}>
              30D {setField === '30D' ? sortingDirectionAsc ? <i className='ri-arrow-down-fill fs-7 text-primary' /> : <i className='ri-arrow-up-fill fs-7 text-primary' /> : null}
            </span>
            <span className={'fs-7 ' + (setField === '60D' ? 'fw-bold' : 'text-muted')} style={{ cursor: 'pointer' }} onClick={() => handleSetSorting('60D')}>
              60D {setField === '60D' ? sortingDirectionAsc ? <i className='ri-arrow-down-fill fs-7 text-primary' /> : <i className='ri-arrow-up-fill fs-7 text-primary' /> : null}
            </span>
            <span className={'fs-7 ' + (setField === '90D' ? 'fw-bold' : 'text-muted')} style={{ cursor: 'pointer' }} onClick={() => handleSetSorting('90D')}>
              90D {setField === '90D' ? sortingDirectionAsc ? <i className='ri-arrow-down-fill fs-7 text-primary' /> : <i className='ri-arrow-up-fill fs-7 text-primary' /> : null}
            </span>
            <span className={'fs-7 ' + (setField === '120D' ? 'fw-bold' : 'text-muted')} style={{ cursor: 'pointer' }} onClick={() => handleSetSorting('120D')}>
              120D{' '}
              {setField === '120D' ? sortingDirectionAsc ? <i className='ri-arrow-down-fill fs-7 text-primary' /> : <i className='ri-arrow-up-fill fs-7 text-primary' /> : null}
            </span>
            <span className={'fs-7 ' + (setField === '180D' ? 'fw-bold' : 'text-muted')} style={{ cursor: 'pointer' }} onClick={() => handleSetSorting('180D')}>
              180D{' '}
              {setField === '180D' ? sortingDirectionAsc ? <i className='ri-arrow-down-fill fs-7 text-primary' /> : <i className='ri-arrow-up-fill fs-7 text-primary' /> : null}
            </span>
            <span className={'fs-7 ' + (setField === '365D' ? 'fw-bold' : 'text-muted')} style={{ cursor: 'pointer' }} onClick={() => handleSetSorting('365D')}>
              365D{' '}
              {setField === '365D' ? sortingDirectionAsc ? <i className='ri-arrow-down-fill fs-7 text-primary' /> : <i className='ri-arrow-up-fill fs-7 text-primary' /> : null}
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
      wrap: false,
      sortable: false,
      center: true,
      compact: true,
      minWidth: 'fit-content',
      width: '180px',
    },
    {
      name: (
        <div className='w-100 text-center d-flex flex-column justify-content-center align-items-center'>
          <span className={'fs-7 ' + (setField === 'sellerCost' ? 'fw-bold' : 'text-muted')} style={{ cursor: 'pointer' }} onClick={() => handleSetSorting('sellerCost')}>
            Supplier Cost{' '}
            {setField === 'sellerCost' ? sortingDirectionAsc ? <i className='ri-arrow-down-fill fs-7 text-primary' /> : <i className='ri-arrow-up-fill fs-7 text-primary' /> : null}
          </span>
          <span className={'fs-7 ' + (setField === 'boxQty' ? 'fw-bold' : 'text-muted')} style={{ cursor: 'pointer' }} onClick={() => handleSetSorting('boxQty')}>
            Box Qty{' '}
            {setField === 'boxQty' ? sortingDirectionAsc ? <i className='ri-arrow-down-fill fs-7 text-primary' /> : <i className='ri-arrow-up-fill fs-7 text-primary' /> : null}
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
            Lead Time{' '}
            {setField === 'leadTime' ? sortingDirectionAsc ? <i className='ri-arrow-down-fill fs-7 text-primary' /> : <i className='ri-arrow-up-fill fs-7 text-primary' /> : null}
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
                disabled={loadingForecast}
                debounceTimeout={1000}
                className='form-control form-control-sm fs-7 m-0 w-75 py-0 text-center'
                placeholder='Days of Stock'
                min={0}
                id={`recommendedDaysOfStock-${row.sku}`}
                value={row.recommendedDaysOfStock}
                onChange={(e) => handleDaysOfStockQty(row.sku, parseInt(e.target.value), row.inventoryId)}
              />
              {loadingForecast && <Spinner size={'sm'} color='primary' />}
              <i className='fs-5 text-primary las la-info-circle' style={{ cursor: 'pointer' }} id={'DaysOfStockInfo'} />
              <UncontrolledTooltip placement='top' target={'DaysOfStockInfo'} innerClassName='bg-white border border-info border-opacity-50 p-2'>
                <p className='fs-7 text-primary m-0 p-0 mb-0'>The number of days you want to have stock in addition to the lead time.</p>
              </UncontrolledTooltip>
            </div>
          </div>
        )
      },
      sortable: false,
      left: true,
      compact: true,
    },
    {
      name: (
        <div className='text-center d-flex flex-column justify-content-center align-items-center'>
          <span className={'fs-7 ' + (setField === 'recommendedQty' ? 'fw-bold' : 'text-muted')} style={{ cursor: 'pointer' }} onClick={() => handleSetSorting('recommendedQty')}>
            Recommended{' '}
            {setField === 'recommendedQty' ? (
              sortingDirectionAsc ? (
                <i className='ri-arrow-down-fill fs-7 text-primary' />
              ) : (
                <i className='ri-arrow-up-fill fs-7 text-primary' />
              )
            ) : null}
          </span>
          <span className={'fs-7 ' + (setField === 'forecast' ? 'fw-bold' : 'text-muted')} style={{ cursor: 'pointer' }} onClick={() => handleSetSorting('forecast')}>
            Forecast{' '}
            {setField === 'forecast' ? sortingDirectionAsc ? <i className='ri-arrow-down-fill fs-7 text-primary' /> : <i className='ri-arrow-up-fill fs-7 text-primary' /> : null}
          </span>
          <span
            className={'fs-7 ' + (setField === 'adjustedForecast' ? 'fw-bold' : 'text-muted')}
            style={{ cursor: 'pointer' }}
            onClick={() => handleSetSorting('adjustedForecast')}>
            Adjusted{' '}
            {setField === 'adjustedForecast' ? (
              sortingDirectionAsc ? (
                <i className='ri-arrow-down-fill fs-7 text-primary' />
              ) : (
                <i className='ri-arrow-up-fill fs-7 text-primary' />
              )
            ) : null}
          </span>
        </div>
      ),
      selector: (row: ReorderingPointsProduct) => {
        var forecast = 0
        Object.entries(row.forecast).map(([model, date]) => {
          if (model === row.forecastModel) {
            forecast =
              Object.values(date).reduce((total, unitsSold) => total + (unitsSold <= 0 ? 0 : unitsSold < 1 ? 1 : unitsSold), 0) -
                (row.warehouseQty + row.fbaQty + row.productionQty + row.receiving) <
              0
                ? 0
                : Object.values(date).reduce((total, unitsSold) => total + (unitsSold <= 0 ? 0 : unitsSold < 1 ? 1 : unitsSold), 0) -
                  (row.warehouseQty + row.fbaQty + row.productionQty + row.receiving)
          }
        })

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
            <UncontrolledTooltip placement='top' target={'Recommended_Qty'} innerClassName='bg-white border border-info border-opacity-50 p-2'>
              <p className='fs-7 text-primary m-0 p-0 mb-0'>Lead Time + Days of Stock x Daily Sales Last 30 Days - Total Inventory</p>
            </UncontrolledTooltip>

            <p className='m-0 p-0 text-center' id={`forecast_${row.sku}`}>
              {FormatIntNumber(state.currentRegion, forecast)}
            </p>
            <UncontrolledTooltip placement='bottom' target={`forecast_${row.sku}`} innerClassName='bg-white border border-info border-opacity-50 p-2'>
              <p className='fs-7 text-primary m-0 p-0 mb-0'>{`Forecast Model: ${row.forecastModel} - Total Inventory`}</p>
              <table className='table table-sm'>
                <thead>
                  <tr>
                    <th className='fs-7 text-primary'>Model</th>
                    <th className='fs-7 text-primary'>Forecast</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(row.forecast).map(([model, date], index) => (
                    <tr key={index}>
                      <td className='fs-7'>{model.substring(0, 5)}</td>
                      <td className='fs-7'>
                        {FormatIntNumber(
                          state.currentRegion,
                          Object.values(date).reduce((total, unitsSold) => total + (unitsSold <= 0 ? 0 : unitsSold < 1 ? 1 : unitsSold), 0) -
                            (row.warehouseQty + row.fbaQty + row.productionQty + row.receiving)
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </UncontrolledTooltip>

            <p className='m-0 p-0 text-center' id={`Adjustedforecast_${row.sku}`}>
              {FormatIntNumber(state.currentRegion, row.adjustedForecast)}
            </p>
            <UncontrolledTooltip placement='top' target={`Adjustedforecast_${row.sku}`} innerClassName='bg-white border border-info border-opacity-50 p-2'>
              <p className='fs-7 text-primary m-0 p-0 mb-0'>
                {row.adjustedForecast !== 0
                  ? `Sales variation adjustment comparing same previous months. Variation: ${(row.variation * 100).toFixed(1)}%`
                  : 'It is not possible to calculate variation based on the information available.'}
              </p>
            </UncontrolledTooltip>
          </div>
        )
      },
      sortable: false,
      center: true,
      compact: true,
    },
    {
      name: (
        <span
          className={'w-fit fs-7 text-wrap text-center ' + (setField === 'ExponentialSmoothing' ? 'fw-bold' : 'text-muted')}
          style={{ cursor: 'pointer' }}
          onClick={() => handleSetSorting('ExponentialSmoothing')}>
          ExpoSm{' '}
          {setField === 'ExponentialSmoothing' ? (
            sortingDirectionAsc ? (
              <i className='ri-arrow-down-fill fs-7 text-primary' />
            ) : (
              <i className='ri-arrow-up-fill fs-7 text-primary' />
            )
          ) : null}
        </span>
      ),
      selector: (row: ReorderingPointsProduct) => {
        const forecast =
          Object.values(row.forecast['ExponentialSmoothing']).reduce((total, unitsSold) => total + (unitsSold <= 0 ? 0 : unitsSold < 1 ? 1 : unitsSold), 0) -
          (row.warehouseQty + row.fbaQty + row.productionQty + row.receiving)

        return FormatIntNumber(state.currentRegion, forecast)
      },
      // wrap: true,
      sortable: false,
      center: true,
      compact: true,
      width: '80px',
      minWidth: 'fit-content',
    },
    {
      name: (
        <span
          className={'fs-7 text-wrap text-center ' + (setField === 'AutoREG' ? 'fw-bold' : 'text-muted')}
          style={{ cursor: 'pointer' }}
          onClick={() => handleSetSorting('AutoREG')}>
          AutoREG{' '}
          {setField === 'AutoREG' ? sortingDirectionAsc ? <i className='ri-arrow-down-fill fs-7 text-primary' /> : <i className='ri-arrow-up-fill fs-7 text-primary' /> : null}
        </span>
      ),
      selector: (row: ReorderingPointsProduct) => {
        const forecast =
          Object.values(row.forecast['AutoREG']).reduce((total, unitsSold) => total + (unitsSold <= 0 ? 0 : unitsSold < 1 ? 1 : unitsSold), 0) -
          (row.warehouseQty + row.fbaQty + row.productionQty + row.receiving)

        return FormatIntNumber(state.currentRegion, forecast)
      },
      sortable: false,
      center: true,
      compact: true,
      width: '80px',
      minWidth: 'fit-content',
    },
    {
      name: (
        <span className={'fs-7 text-wrap text-center ' + (setField === 'VAR' ? 'fw-bold' : 'text-muted')} style={{ cursor: 'pointer' }} onClick={() => handleSetSorting('VAR')}>
          VAR {setField === 'VAR' ? sortingDirectionAsc ? <i className='ri-arrow-down-fill fs-7 text-primary' /> : <i className='ri-arrow-up-fill fs-7 text-primary' /> : null}
        </span>
      ),
      selector: (row: ReorderingPointsProduct) => {
        const forecast =
          Object.values(row.forecast['VAR']).reduce((total, unitsSold) => total + (unitsSold <= 0 ? 0 : unitsSold < 1 ? 1 : unitsSold), 0) -
          (row.warehouseQty + row.fbaQty + row.productionQty + row.receiving)

        return FormatIntNumber(state.currentRegion, forecast)
      },
      sortable: false,
      center: true,
      compact: true,
      width: '80px',
      minWidth: 'fit-content',
    },
    {
      name: (
        <span className={'fs-7 text-wrap text-center ' + (setField === 'Naive' ? 'fw-bold' : 'text-muted')} style={{ cursor: 'pointer' }} onClick={() => handleSetSorting('Naive')}>
          Naive {setField === 'Naive' ? sortingDirectionAsc ? <i className='ri-arrow-down-fill fs-7 text-primary' /> : <i className='ri-arrow-up-fill fs-7 text-primary' /> : null}
        </span>
      ),
      selector: (row: ReorderingPointsProduct) => {
        const forecast =
          Object.values(row.forecast['Naive']).reduce((total, unitsSold) => total + (unitsSold <= 0 ? 0 : unitsSold < 1 ? 1 : unitsSold), 0) -
          (row.warehouseQty + row.fbaQty + row.productionQty + row.receiving)

        return FormatIntNumber(state.currentRegion, forecast)
      },
      // wrap: true,
      sortable: false,
      center: true,
      compact: true,
      // grow: 0,
    },
    {
      name: (
        <span className={'fs-7 text-wrap text-center ' + (setField === 'ARDL' ? 'fw-bold' : 'text-muted')} style={{ cursor: 'pointer' }} onClick={() => handleSetSorting('ARDL')}>
          ARDL {setField === 'ARDL' ? sortingDirectionAsc ? <i className='ri-arrow-down-fill fs-7 text-primary' /> : <i className='ri-arrow-up-fill fs-7 text-primary' /> : null}
        </span>
      ),
      selector: (row: ReorderingPointsProduct) => {
        const forecast =
          Object.values(row.forecast['ARDL']).reduce((total, unitsSold) => total + (unitsSold <= 0 ? 0 : unitsSold < 1 ? 1 : unitsSold), 0) -
          (row.warehouseQty + row.fbaQty + row.productionQty + row.receiving)

        return FormatIntNumber(state.currentRegion, forecast)
      },
      sortable: false,
      center: true,
      compact: true,
      width: '80px',
      minWidth: 'fit-content',
    },
    {
      name: (
        <span
          className={'fs-7 text-wrap text-center ' + (setField === 'ARDL_seasonal' ? 'fw-bold' : 'text-muted')}
          style={{ cursor: 'pointer' }}
          onClick={() => handleSetSorting('ARDL_seasonal')}>
          ARDL_S{' '}
          {setField === 'ARDL_seasonal' ? (
            sortingDirectionAsc ? (
              <i className='ri-arrow-down-fill fs-7 text-primary' />
            ) : (
              <i className='ri-arrow-up-fill fs-7 text-primary' />
            )
          ) : null}
        </span>
      ),
      selector: (row: ReorderingPointsProduct) => {
        const forecast =
          Object.values(row.forecast['ARDL_seasonal']).reduce((total, unitsSold) => total + (unitsSold <= 0 ? 0 : unitsSold < 1 ? 1 : unitsSold), 0) -
          (row.warehouseQty + row.fbaQty + row.productionQty + row.receiving)

        return FormatIntNumber(state.currentRegion, forecast)
      },
      sortable: false,
      center: true,
      compact: true,
      width: '80px',
      minWidth: 'fit-content',
    },
    {
      name: (
        <div className='text-center d-flex flex-column justify-content-center align-items-center'>
          <span className={'fs-7 ' + (setField === 'order' ? 'fw-bold' : 'text-muted')} style={{ cursor: 'pointer' }} onClick={() => handleSetSorting('order')}>
            Order Qty{' '}
            {setField === 'order' ? sortingDirectionAsc ? <i className='ri-arrow-down-fill fs-7 text-primary' /> : <i className='ri-arrow-up-fill fs-7 text-primary' /> : null}
          </span>
          <span className={'fs-7 ' + (setField === 'orderAdjusted' ? 'fw-bold' : 'text-muted')} style={{ cursor: 'pointer' }} onClick={() => handleSetSorting('orderAdjusted')}>
            Adjusted Master Boxes{' '}
            {setField === 'orderAdjusted' ? (
              sortingDirectionAsc ? (
                <i className='ri-arrow-down-fill fs-7 text-primary' />
              ) : (
                <i className='ri-arrow-up-fill fs-7 text-primary' />
              )
            ) : null}
          </span>
        </div>
      ),
      selector: (row: ReorderingPointsProduct) => {
        return (
          <div className='d-flex flex-column justify-content-start align-items-end gap-2 w-100 px-1'>
            <div className='w-100 d-flex flex-row justify-content-between align-items-center gap-2'>
              <DebounceInput
                type='number'
                // minLength={1}
                disabled={row.supplier === '' ? false : selectedSupplier !== '' && selectedSupplier !== row.supplier}
                debounceTimeout={400}
                className='form-control form-control-sm fs-7 m-0 py-0 w-75 text-center'
                placeholder='Order Qty'
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
              {selectedSupplier !== '' && selectedSupplier !== row.supplier && (
                <UncontrolledTooltip placement='top' target={`orderQty-${row.sku}`} innerClassName='bg-white border border-info border-opacity-50 p-2'>
                  <p className='fs-7 text-primary m-0 p-0 mb-0'>All products of the order must be from the same supplier.</p>
                </UncontrolledTooltip>
              )}
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
      compact: false,
      width: '150px',
      minWidth: 'fit-content',
    },
  ]

  return (
    <>
      <DataTable
        columns={columns}
        data={filterDataTable}
        progressPending={pending}
        responsive
        fixedHeader
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
        customStyles={customStyles}
      />
    </>
  )
}

export default ReorderingPointsTable
