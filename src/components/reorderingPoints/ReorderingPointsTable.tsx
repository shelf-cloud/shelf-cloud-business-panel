/* eslint-disable @next/next/no-img-element */
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useCallback, useContext } from 'react'

import CopyTextToClipboard from '@components/ui/CopyTextToClipboard'
import AppContext from '@context/AppContext'
import { RPProductConfig } from '@hooks/reorderingPoints/useRPProductConfig'
import { ExpandedRowProps } from '@hooks/reorderingPoints/useRPProductSale'
import { SplitNames } from '@hooks/reorderingPoints/useRPSplits'
import { SimpleInputModal } from '@hooks/ui/useInputModal'
import { FormatCurrency, FormatIntNumber } from '@lib/FormatNumbers'
import { NoImageAdress } from '@lib/assetsConstants'
import { ReorderingPointsProduct } from '@typesTs/reorderingPoints/reorderingPoints'
import DataTable from 'react-data-table-component'
import { DebounceInput } from 'react-debounce-input'
import { Badge, Button, DropdownItem, DropdownMenu, DropdownToggle, UncontrolledDropdown, UncontrolledTooltip } from 'reactstrap'

const ReorderingPointsExpandedDetails = dynamic(() => import('./ReorderingPointsExpandedDetails'), {
  ssr: false,
})

type Props = {
  filterDataTable: ReorderingPointsProduct[]
  pending: boolean
  handleOrderQty: (sku: string, orderQty: number) => void
  handleSplitsOrderQty: (sku: string, orderQty: number, splitIndex: string) => void
  handleUseAdjustedQty: (sku: string, state: boolean) => void
  setSelectedRows: (selectedRows: ReorderingPointsProduct[]) => void
  toggledClearRows: boolean
  selectedSupplier: string
  setSelectedSupplier: (selectedSupplier: string) => void
  setError: (skus: any) => void
  setSalesModal: (prev: any) => void
  setField: string
  handleSetSorting: (field: string) => void
  sortingDirectionAsc: boolean
  splits: { isSplitting: boolean; splitsQty: number }
  splitNames: SplitNames
  setRPProductConfig: (prev: RPProductConfig) => void
  setValuesAndOpen: (newValue: SimpleInputModal) => void
  expandedRowProps: ExpandedRowProps
}

const ReorderingPointsTable = ({
  filterDataTable,
  pending,
  handleOrderQty,
  handleSplitsOrderQty,
  handleUseAdjustedQty,
  setSelectedRows,
  toggledClearRows,
  selectedSupplier,
  setSelectedSupplier,
  setError,
  setSalesModal,
  setField,
  handleSetSorting,
  sortingDirectionAsc,
  splits,
  splitNames,
  setRPProductConfig,
  setValuesAndOpen,
  expandedRowProps,
}: Props) => {
  const { state }: any = useContext(AppContext)
  const { session, startDate, endDate } = expandedRowProps

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

  const orderSplitsColumns = useCallback(
    (isSplitting: boolean, splitsQty: number) => {
      if (!isSplitting || splitsQty <= 0 || isNaN(splitsQty))
        return [
          {
            name: (
              <div className='text-center d-flex flex-column justify-content-center align-items-center'>
                <span className={'fs-7 ' + (setField === 'order' ? 'fw-bold' : 'text-muted')} style={{ cursor: 'pointer' }} onClick={() => handleSetSorting('order')}>
                  Order Qty{' '}
                  {setField === 'order' ? (
                    sortingDirectionAsc ? (
                      <i className='ri-arrow-down-fill fs-7 text-primary' />
                    ) : (
                      <i className='ri-arrow-up-fill fs-7 text-primary' />
                    )
                  ) : null}
                </span>
                <span
                  className={'fs-7 ' + (setField === 'orderAdjusted' ? 'fw-bold' : 'text-muted')}
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleSetSorting('orderAdjusted')}>
                  Adjusted to Box Qty{' '}
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
                <div className='d-flex flex-column justify-content-start align-items-center gap-2 w-100 px-1'>
                  <DebounceInput
                    type='number'
                    disabled={row.supplier === '' ? false : selectedSupplier !== '' && selectedSupplier.toLowerCase() !== row.supplier.toLowerCase()}
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
                        if (row.supplier !== '') setSelectedSupplier(row.supplier)
                        setError((prev: string[]) => prev.filter((sku) => sku !== row.sku))
                        handleOrderQty(row.sku, parseInt(e.target.value))
                      }
                    }}
                  />
                  <span className='w-75 m-0 p-0 text-center fs-7'>{FormatIntNumber(state.currentRegion, row.orderAdjusted)}</span>
                  {selectedSupplier !== '' && selectedSupplier !== row.supplier && (
                    <UncontrolledTooltip placement='top' target={`orderQty-${row.sku}`} innerClassName='bg-white border border-info border-opacity-50 p-2'>
                      <p className='fs-7 text-primary m-0 p-0 mb-0'>All products of the order must be from the same supplier.</p>
                    </UncontrolledTooltip>
                  )}
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

      return Array(splitsQty)
        .fill(0)
        .map((_, splitIndex) => ({
          name: (
            <div className='text-center d-flex flex-column justify-content-center align-items-center'>
              <span className={'fs-7 fw-bold'}>
                {splitNames[`${splitIndex}`].length > 10 ? `${splitNames[`${splitIndex}`].substring(0, 11)}..` : splitNames[`${splitIndex}`]}
                <Button className='m-0 p-0' color='ghost' size='sm' onClick={() => setValuesAndOpen({ id: `${splitIndex}`, text: splitNames[`${splitIndex}`] })}>
                  <i className='las la-edit fs-5 text-primary m-0 p-0 ' />
                </Button>
              </span>
              <span className={'fs-7 text-muted'}>Order Qty</span>
              <span className='fs-7 text-muted'>Adjusted to Box Qty</span>
            </div>
          ),
          selector: (row: ReorderingPointsProduct) => {
            return (
              <div className='d-flex flex-column justify-content-start align-items-center gap-2 w-100 px-1'>
                <DebounceInput
                  type='number'
                  disabled={row.supplier === '' ? false : selectedSupplier !== '' && selectedSupplier.toLowerCase() !== row.supplier.toLowerCase()}
                  debounceTimeout={400}
                  className='form-control form-control-sm fs-7 m-0 py-0 w-75 text-center'
                  placeholder='Order Qty'
                  min={0}
                  id={`orderQty-${row.sku}`}
                  value={!row.orderSplits[`${splitIndex}`]?.order || row.orderSplits[`${splitIndex}`]?.order === 0 ? '' : row.orderSplits[`${splitIndex}`].order}
                  onChange={(e) => {
                    if (parseInt(e.target.value) < 0) {
                      setError((prev: string[]) => [...prev, row.sku])
                      handleSplitsOrderQty(row.sku, parseInt(e.target.value), `${splitIndex}`)
                    } else {
                      if (row.supplier !== '') setSelectedSupplier(row.supplier)
                      setError((prev: string[]) => prev.filter((sku) => sku !== row.sku))
                      handleSplitsOrderQty(row.sku, parseInt(e.target.value), `${splitIndex}`)
                    }
                  }}
                />
                <span className='w-75 m-0 p-0 text-center fs-7'>{FormatIntNumber(state.currentRegion, row.orderSplits[`${splitIndex}`]?.orderAdjusted || 0)}</span>
                {selectedSupplier !== '' && selectedSupplier !== row.supplier && (
                  <UncontrolledTooltip placement='top' target={`orderQty-${row.sku}`} innerClassName='bg-white border border-info border-opacity-50 p-2'>
                    <p className='fs-7 text-primary m-0 p-0 mb-0'>All products of the order must be from the same supplier.</p>
                  </UncontrolledTooltip>
                )}
              </div>
            )
          },
          sortable: false,
          center: true,
          compact: true,
        }))
    },
    [
      handleOrderQty,
      handleSetSorting,
      handleSplitsOrderQty,
      selectedSupplier,
      setError,
      setField,
      setSelectedSupplier,
      setValuesAndOpen,
      sortingDirectionAsc,
      splitNames,
      state.currentRegion,
    ]
  )

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
              <span
                className={
                  'm-0 p-0 text-center fs-7' + (row.daysToOrder <= 0 ? ' text-danger fw-semibold' : '')
                }>{`${FormatIntNumber(state.currentRegion, row.daysToOrder)} ${row.daysToOrder == 1 ? 'day' : 'days'}`}</span>
              <i className='fs-5 text-primary las la-info-circle' style={{ cursor: 'pointer' }} id={'DaysToOrderIcon'} />
              <UncontrolledTooltip placement='top' target={'DaysToOrderIcon'} innerClassName='bg-white border border-info border-opacity-50 p-2'>
                <p className='fs-7 text-primary m-0 p-0 mb-0'>Remaining days to place order.</p>
              </UncontrolledTooltip>
            </div>

            <div className='d-flex flex-row justify-content-center align-items-center gap-1'>
              <span
                className={
                  'm-0 p-0 text-center fs-7' + (row.daysRemaining <= 0 ? ' text-danger fw-semibold' : '')
                }>{`${FormatIntNumber(state.currentRegion, row.daysRemaining)} ${row.daysRemaining == 1 ? 'day' : 'days'}`}</span>
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
          <div className='my-2 mx-0 d-flex flex-row justify-content-start align-items-center gap-3'>
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
            <div className='w-100'>
              <div className='d-flex flex-row justify-content-start align-items-center gap-1'>
                <Link href={`/product/${row.inventoryId}/${row.sku}`} target='_blank'>
                  <p className='m-0 p-0 text-primary fw-semibold fs-6'>{row.sku}</p>
                </Link>
                <CopyTextToClipboard text={row.sku} label='SKU' />
              </div>
              <p className='m-0 p-0 text-black fw-semibold fs-7 text-wrap'>{row.title}</p>
              <span className='m-0 p-0 text-black fw-normal fs-7 d-flex flex-wrap justify-content-start align-items-center'>
                {row.asin && (
                  <div className='d-flex flex-nowrap justify-content-start align-items-center' style={{ gap: '2px' }}>
                    {`ASIN: `}
                    <a
                      href={`https://www.amazon.${state.currentRegion == 'us' ? 'com' : 'es'}/dp/${row.asin}`}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='fw-light'
                      style={{ textDecoration: 'none' }}>
                      {row.asin}
                    </a>
                    <i className='ri-file-copy-line fs-6 m-0 p-0 text-muted' style={{ cursor: 'pointer' }} onClick={() => navigator.clipboard.writeText(row.asin)} />
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
      left: true,
      compact: true,
      minWidth: 'fit-content',
      width: '280px',
    },
    {
      name: (
        <div className='text-center d-flex flex-column justify-content-center align-items-center py-1'>
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
            <p className='m-0 p-0 text-end fs-7'>
              <span className='text-muted fw-light'>On Hand: </span>
              <span className='fw-semibold'>{row.warehouseQty}</span>
            </p>
            <p className='m-0 p-0 text-end fs-7'>
              <span className='text-muted fw-light'>Prod: </span>
              <span className='fw-semibold'>{row.productionQty}</span>
            </p>
            <p className='m-0 p-0 text-end fs-7'>
              <span className='text-muted fw-light'>Inbound: </span>
              <span className='fw-semibold'>{row.receiving}</span>
            </p>
          </div>
        )
      },
      sortable: false,
      center: true,
      compact: true,
      // grow: 0,
    },
    ...(state.user[state.currentRegion]?.showAmazonTab && state.user[state.currentRegion]?.amazonConnected
      ? [
          {
            name: (
              <div className='text-center d-flex flex-column justify-content-center align-items-center py-1'>
                {state.user[state.currentRegion]?.showAmazonTab && state.user[state.currentRegion]?.amazonConnected && (
                  <>
                    <span className={'fs-7 ' + (setField === 'fbaQty' ? 'fw-bold' : 'text-muted')} style={{ cursor: 'pointer' }} onClick={() => handleSetSorting('fbaQty')}>
                      FBA{' '}
                      {setField === 'fbaQty' ? (
                        sortingDirectionAsc ? (
                          <i className='ri-arrow-down-fill fs-7 text-primary' />
                        ) : (
                          <i className='ri-arrow-up-fill fs-7 text-primary' />
                        )
                      ) : null}
                    </span>
                    {state.user[state.currentRegion]?.rpShowAWD && (
                      <span className={'fs-7 ' + (setField === 'awdQty' ? 'fw-bold' : 'text-muted')} style={{ cursor: 'pointer' }} onClick={() => handleSetSorting('awdQty')}>
                        AWD{' '}
                        {setField === 'awdQty' ? (
                          sortingDirectionAsc ? (
                            <i className='ri-arrow-down-fill fs-7 text-primary' />
                          ) : (
                            <i className='ri-arrow-up-fill fs-7 text-primary' />
                          )
                        ) : null}
                      </span>
                    )}
                  </>
                )}
              </div>
            ),
            selector: (row: ReorderingPointsProduct) => {
              return (
                <div>
                  {state.user[state.currentRegion]?.showAmazonTab && state.user[state.currentRegion]?.amazonConnected && (
                    <>
                      <p className='m-0 p-0 text-end fs-7'>
                        <span className='text-muted fw-light'>FBA: </span>
                        <span className='fw-semibold'>{row.fbaQty}</span>
                      </p>
                      {state.user[state.currentRegion]?.rpShowAWD && (
                        <>
                          <p className='m-0 p-0 text-end fs-7'>
                            <span className='text-muted fw-light'>AWD: </span>
                            <span className='fw-semibold'>{row.awdQty}</span>
                          </p>
                          <p className='m-0 p-0 text-end fs-7'>
                            <span className='text-muted fw-light'>Inbound: </span>
                            <span className='fw-semibold'>{row.awdInboundQty}</span>
                          </p>
                        </>
                      )}
                    </>
                  )}
                </div>
              )
            },
            sortable: false,
            center: true,
            compact: true,
            // grow: 0,
          },
        ]
      : []),
    {
      name: (
        <span
          className={'fs-7 text-wrap text-center ' + (setField === 'totalInventory' ? 'fw-bold' : 'text-muted')}
          style={{ cursor: 'pointer' }}
          onClick={() => handleSetSorting('totalInventory')}>
          Total <br /> Inventory{' '}
          {setField === 'totalInventory' ? (
            sortingDirectionAsc ? (
              <i className='ri-arrow-down-fill fs-7 text-primary' />
            ) : (
              <i className='ri-arrow-up-fill fs-7 text-primary' />
            )
          ) : null}
        </span>
      ),
      selector: (row: ReorderingPointsProduct) =>
        FormatIntNumber(state.currentRegion, row.warehouseQty + row.fbaQty + row.productionQty + row.receiving + row.awdQty + row.awdInboundQty),
      wrap: true,
      sortable: false,
      center: true,
      compact: true,
    },
    {
      name: (
        <div>
          <p className='m-0 mb-1 fw-bold fs-7 text-center'>Total Orders</p>
          <div className='d-grid gap-1' style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
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
          <div className='d-grid gap-2 my-3 fs-7' style={{ gridTemplateColumns: 'repeat(2, 1fr)', overflow: 'unset', textOverflow: 'unset' }}>
            <div>
              <span className='fw-semibold'>30D: </span>
              <span>{FormatIntNumber(state.currentRegion, row.totalUnitsSold['30D'])}</span>
            </div>
            <div>
              <span className='fw-semibold'>120D: </span>
              <span>{FormatIntNumber(state.currentRegion, row.totalUnitsSold['120D'])}</span>
            </div>
            <div>
              <span className='fw-semibold'>60D: </span>
              <span>{FormatIntNumber(state.currentRegion, row.totalUnitsSold['60D'])}</span>
            </div>
            <div>
              <span className='fw-semibold'>180D: </span>
              <span>{FormatIntNumber(state.currentRegion, row.totalUnitsSold['180D'])}</span>
            </div>
            <div>
              <span className='fw-semibold'>90D: </span>
              <span>{FormatIntNumber(state.currentRegion, row.totalUnitsSold['90D'])}</span>
            </div>

            <div>
              <span className='fw-semibold'>365D: </span>
              <span>{FormatIntNumber(state.currentRegion, row.totalUnitsSold['365D'])}</span>
            </div>
          </div>
        )
      },
      wrap: false,
      sortable: false,
      center: true,
      compact: true,
      minWidth: 'fit-content',
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
          <div className='fs-7 my-3'>
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
        <div className='text-center d-flex flex-column justify-content-center align-items-center py-1'>
          {/* <span className={'fs-7 fw-bold'}>Forecast</span> */}
          <span className={'fs-7 ' + (setField === 'totalSCForecast' ? 'fw-bold' : 'text-muted')} style={{ cursor: 'pointer' }} onClick={() => handleSetSorting('totalSCForecast')}>
            Forecast{' '}
            {setField === 'totalSCForecast' ? (
              sortingDirectionAsc ? (
                <i className='ri-arrow-down-fill fs-7 text-primary' />
              ) : (
                <i className='ri-arrow-up-fill fs-7 text-primary' />
              )
            ) : null}
          </span>
          {/* {state.user[state.currentRegion]?.rpShowFBA && (
            <span
              className={'fs-7 ' + (setField === 'totalFBAForecast' ? 'fw-bold' : 'text-muted')}
              style={{ cursor: 'pointer' }}
              onClick={() => handleSetSorting('totalFBAForecast')}>
              FBA{' '}
              {setField === 'totalFBAForecast' ? (
                sortingDirectionAsc ? (
                  <i className='ri-arrow-down-fill fs-7 text-primary' />
                ) : (
                  <i className='ri-arrow-up-fill fs-7 text-primary' />
                )
              ) : null}
            </span>
          )}
          {state.user[state.currentRegion]?.rpShowAWD && (
            <span
              className={'fs-7 ' + (setField === 'totalAWDForecast' ? 'fw-bold' : 'text-muted')}
              style={{ cursor: 'pointer' }}
              onClick={() => handleSetSorting('totalAWDForecast')}>
              AWD{' '}
              {setField === 'totalAWDForecast' ? (
                sortingDirectionAsc ? (
                  <i className='ri-arrow-down-fill fs-7 text-primary' />
                ) : (
                  <i className='ri-arrow-up-fill fs-7 text-primary' />
                )
              ) : null}
            </span>
          )} */}
        </div>
      ),
      selector: (row: ReorderingPointsProduct) => {
        return (
          <div className='fs-7'>
            <p className='m-0 p-0 text-center' id={'Recommended_Qty'}>
              {FormatIntNumber(state.currentRegion, row.totalSCForecast)}
            </p>
            {/* {state.user[state.currentRegion]?.rpShowFBA && (
              <p className='m-0 p-0 text-center' id={`forecast_${row.sku}`}>
                {FormatIntNumber(state.currentRegion, row.totalFBAForecast)}
              </p>
            )}
            {state.user[state.currentRegion]?.rpShowAWD && (
              <p className={'m-0 p-0 text-center ' + (!row.canSendToAWD ? 'text-danger text-decoration-line-through' : '')} id={`Adjustedforecast_${row.sku}`}>
                {FormatIntNumber(state.currentRegion, row.totalAWDForecast)}
              </p>
            )} */}
          </div>
        )
      },
      sortable: false,
      center: true,
      compact: true,
    },
    ...orderSplitsColumns(splits.isSplitting, splits.splitsQty),
    {
      name: (
        <div className='text-center text-muted d-flex flex-column justify-content-center align-items-center'>
          <span className='fs-7'>
            Quantity <br /> Used
          </span>
        </div>
      ),
      selector: (row: ReorderingPointsProduct) => {
        return (
          <div className='d-flex flex-column justify-content-start align-items-end gap-2 w-100 px-1'>
            <div className='w-100 d-flex flex-row justify-content-start align-items-center gap-1'>
              <input
                className='form-check-input m-0 p-0'
                type='checkbox'
                checked={!row.useOrderAdjusted}
                id={`orderCheckbox-${row.sku}`}
                onClick={() => handleUseAdjustedQty(row.sku, false)}
                readOnly
              />
              <span className='fs-7'>Order</span>
            </div>
            <div className='w-100 d-flex flex-row justify-content-start align-items-center gap-1'>
              <input
                className='form-check-input m-0 p-0'
                type='checkbox'
                checked={row.useOrderAdjusted}
                id={`adjustedOrderCheckbox-${row.sku}`}
                onClick={() => handleUseAdjustedQty(row.sku, true)}
                readOnly
              />
              <span className='fs-7'>Boxes</span>
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
        <span className='fs-7 text-center text-muted'>
          Total <br /> Ordered
        </span>
      ),
      selector: (row: ReorderingPointsProduct) => {
        const totalOrdered = row.useOrderAdjusted ? row.orderAdjusted : row.order
        return <p className='fs-6 fw-semibold text-center'>{FormatIntNumber(state.currentRegion, totalOrdered)}</p>
      },
      sortable: false,
      center: true,
      compact: true,
    },
    {
      name: <span className='fs-7 text-center text-muted'>Actions</span>,
      cell: (row: ReorderingPointsProduct) => {
        return (
          <UncontrolledDropdown className='dropdown d-inline-block' direction='start'>
            <DropdownToggle className='btn btn-light btn-sm m-0 p-0' style={{ border: '1px solid rgba(68, 129, 253, 0.06)' }} tag='button'>
              <i className='mdi mdi-dots-vertical align-middle fs-4 m-0 px-2 py-0' style={{ color: '#919FAF' }} />
            </DropdownToggle>
            <DropdownMenu className='dropdown-menu-end' container={'body'}>
              <DropdownItem className='edit-item-btn' onClick={() => setRPProductConfig({ isOpen: true, product: row })}>
                <i className='ri-settings-3-line align-middle me-2 fs-5 text-black'></i>
                <span className='fs-7 fw-normal text-dark'>Edit Config</span>
              </DropdownItem>
              <DropdownItem
                className='edit-item-btn'
                onClick={() => {
                  setSalesModal({ showSalesModal: true, sku: row.sku, title: row.title, totalUnitsSold: row.totalUnitsSold, marketplaces: row.marketplaces })
                }}>
                <i className='ri-search-eye-line align-middle me-2 fs-5 text-primary'></i>
                <span className='fs-7 fw-normal text-dark'>Sales By Marketpalce</span>
              </DropdownItem>
            </DropdownMenu>
          </UncontrolledDropdown>
        )
      },
      sortable: false,
      compact: false,
      width: 'fit-content',
    },
  ]

  return (
    <div style={{ height: '82dvh', scrollbarWidth: 'thin' }}>
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
        expandableRows={true}
        expandableRowsComponent={ReorderingPointsExpandedDetails}
        expandableRowsComponentProps={{ expandedRowProps: { session, state, startDate, endDate } }}
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
    </div>
  )
}

export default ReorderingPointsTable
