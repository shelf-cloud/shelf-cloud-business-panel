/* eslint-disable @next/next/no-img-element */
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useCallback, useContext } from 'react'

import CopyTextToClipboard from '@components/ui/CopyTextToClipboard'
import SCTooltip from '@components/ui/SCTooltip'
import AppContext from '@context/AppContext'
import { RPProductConfig } from '@hooks/reorderingPoints/useRPProductConfig'
import { ExpandedRowProps } from '@hooks/reorderingPoints/useRPProductSale'
import { SplitNames } from '@hooks/reorderingPoints/useRPSplits'
import { SimpleInputModal } from '@hooks/ui/useInputModal'
import { FormatCurrency, FormatIntNumber } from '@lib/FormatNumbers'
import { NoImageAdress } from '@lib/assetsConstants'
import { Badge as ShadcnBadge } from '@shadcn/ui/badge'
import { ReorderingPointsProduct } from '@typesTs/reorderingPoints/reorderingPoints'
import DataTable from '@components/Common/DataTableSC'
import { DebounceInput } from 'react-debounce-input'
import { Button, DropdownItem, DropdownMenu, DropdownToggle, UncontrolledDropdown, UncontrolledTooltip } from '@/components/migration-ui'

import { getAIForecastTotal, getProductAIForecastCoverageQty, getProductAIForecastUrgency } from '@/lib/getAIForecastUrgency'
import { tableRowTint } from '@/lib/shadcn/dataTableStyles'

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
  handleRegenerateForecast: ({ inventoryId, sku }: { inventoryId: number; sku: string }) => void
  setAIForecastProduct: (product: ReorderingPointsProduct | null) => void
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
  handleRegenerateForecast,
  setAIForecastProduct,
  expandedRowProps,
}: Props) => {
  const { state }: any = useContext(AppContext)
  const { session, startDate, endDate } = expandedRowProps
  const aiUrgencyThresholds = {
    highAlertMax: state?.user?.us?.rphighAlertMax ?? 20,
    mediumAlertMax: state?.user?.us?.rpmediumAlertMax ?? 30,
    lowAlertMax: state?.user?.us?.rplowAlertMax ?? 45,
  }

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
      style: tableRowTint.success,
    },
    {
      when: (row: ReorderingPointsProduct) => Number(row.order) < 0 || !Number.isInteger(Number(row.order)),
      style: tableRowTint.danger,
    },
  ]

  const orderSplitsColumns = useCallback(
    (isSplitting: boolean, splitsQty: number) => {
      if (!isSplitting || splitsQty <= 0 || isNaN(splitsQty))
        return [
          {
            name: (
              <div className='text-center flex flex-col justify-center items-center'>
                <span className={'text-[11.2px] ' + (setField === 'order' ? 'font-bold' : 'text-[var(--bs-secondary-color)]')} style={{ cursor: 'pointer' }} onClick={() => handleSetSorting('order')}>
                  Order Qty{' '}
                  {setField === 'order' ? (
                    sortingDirectionAsc ? (
                      <i className='ri-arrow-down-fill text-[11.2px] text-primary' />
                    ) : (
                      <i className='ri-arrow-up-fill text-[11.2px] text-primary' />
                    )
                  ) : null}
                </span>
                <span
                  className={'text-[11.2px] ' + (setField === 'orderAdjusted' ? 'font-bold' : 'text-[var(--bs-secondary-color)]')}
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleSetSorting('orderAdjusted')}>
                  Adjusted to Box Qty{' '}
                  {setField === 'orderAdjusted' ? (
                    sortingDirectionAsc ? (
                      <i className='ri-arrow-down-fill text-[11.2px] text-primary' />
                    ) : (
                      <i className='ri-arrow-up-fill text-[11.2px] text-primary' />
                    )
                  ) : null}
                </span>
              </div>
            ),
            selector: (row: ReorderingPointsProduct) => {
              return (
                <div className='flex flex-col justify-start items-center gap-2 w-full px-1'>
                  <DebounceInput
                    type='number'
                    disabled={row.supplier === '' ? false : selectedSupplier !== '' && selectedSupplier.toLowerCase() !== row.supplier.toLowerCase()}
                    debounceTimeout={400}
                    className='form-control form-control-sm text-[11.2px] m-0 py-0 w-3/4 text-center'
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
                  <span className='w-3/4 m-0 p-0 text-center text-[11.2px]'>{FormatIntNumber(state.currentRegion, row.orderAdjusted)}</span>
                  {selectedSupplier !== '' && selectedSupplier !== row.supplier && (
                    <UncontrolledTooltip placement='top' target={`orderQty-${row.sku}`} innerClassName='bg-white border border-[color-mix(in_srgb,var(--info)_50%,transparent)] p-2'>
                      <p className='text-[11.2px] text-primary m-0 p-0 mb-0'>All products of the order must be from the same supplier.</p>
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
            <div className='text-center flex flex-col justify-center items-center'>
              <span className={'text-[11.2px] font-bold'}>
                {splitNames[`${splitIndex}`].length > 10 ? `${splitNames[`${splitIndex}`].substring(0, 11)}..` : splitNames[`${splitIndex}`]}
                <Button className='m-0 p-0' color='ghost' size='sm' onClick={() => setValuesAndOpen({ id: `${splitIndex}`, text: splitNames[`${splitIndex}`] })}>
                  <i className='las la-edit text-[16.25px] text-primary m-0 p-0 ' />
                </Button>
              </span>
              <span className={'text-[11.2px] text-[var(--bs-secondary-color)]'}>Order Qty</span>
              <span className='text-[11.2px] text-[var(--bs-secondary-color)]'>Adjusted to Box Qty</span>
            </div>
          ),
          selector: (row: ReorderingPointsProduct) => {
            return (
              <div className='flex flex-col justify-start items-center gap-2 w-full px-1'>
                <DebounceInput
                  type='number'
                  disabled={row.supplier === '' ? false : selectedSupplier !== '' && selectedSupplier.toLowerCase() !== row.supplier.toLowerCase()}
                  debounceTimeout={400}
                  className='form-control form-control-sm text-[11.2px] m-0 py-0 w-3/4 text-center'
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
                <span className='w-3/4 m-0 p-0 text-center text-[11.2px]'>{FormatIntNumber(state.currentRegion, row.orderSplits[`${splitIndex}`]?.orderAdjusted || 0)}</span>
                {selectedSupplier !== '' && selectedSupplier !== row.supplier && (
                  <UncontrolledTooltip placement='top' target={`orderQty-${row.sku}`} innerClassName='bg-white border border-[color-mix(in_srgb,var(--info)_50%,transparent)] p-2'>
                    <p className='text-[11.2px] text-primary m-0 p-0 mb-0'>All products of the order must be from the same supplier.</p>
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
        <div className='text-center flex flex-col justify-center items-center gap-1'>
          <span className={'text-[11.2px] ' + (setField === 'ai_urgency' ? 'font-bold' : 'text-[var(--bs-secondary-color)]')} style={{ cursor: 'pointer' }} onClick={() => handleSetSorting('ai_urgency')}>
            Urgency
            <br />
            Days To Order{' '}
            {setField === 'ai_urgency' ? sortingDirectionAsc ? <i className='ri-arrow-down-fill text-[11.2px] text-primary' /> : <i className='ri-arrow-up-fill text-[11.2px] text-primary' /> : null}
          </span>
        </div>
      ),
      selector: (row: ReorderingPointsProduct) => {
        const aiUrgency = getProductAIForecastUrgency(row, aiUrgencyThresholds)

        return (
          <div className='flex flex-col justify-center items-center gap-1'>
            <i className={`mdi mdi-alert-octagon text-[22.75px] m-0 p-0 ${aiUrgency.color}`} />

            <div className='flex flex-row justify-center items-center gap-1'>
              <span className={`m-0 p-0 text-center text-[11.2px] ${aiUrgency.color}${aiUrgency.urgency === 3 ? ' font-semibold' : ''}`}>{`${FormatIntNumber(
                state.currentRegion,
                aiUrgency.daysToOrder
              )} ${aiUrgency.daysToOrder == 1 ? 'day' : 'days'}`}</span>
              <i className='text-[16.25px] text-primary las la-info-circle' style={{ cursor: 'pointer' }} id={`AI_DaysToOrderIcon-${row.sku}`} />
              <UncontrolledTooltip placement='top' target={`AI_DaysToOrderIcon-${row.sku}`} innerClassName='bg-white border border-[color-mix(in_srgb,var(--info)_50%,transparent)] p-2'>
                <p className='text-[11.2px] text-primary m-0 p-0 mb-0'>{`Projected days left to place an order after lead time (${FormatIntNumber(
                  state.currentRegion,
                  row.leadTimeSC + row.daysOfStockSC
                )} days). AI projected stock remaining: ${FormatIntNumber(state.currentRegion, aiUrgency.remainingDays)} days.`}</p>
              </UncontrolledTooltip>
            </div>
          </div>
        )
      },
      sortable: false,
      center: true,
      compact: true,
    },
    // {
    //   name: (
    //     <div className='text-center flex flex-col justify-center items-center gap-1'>
    //       <span className={'text-[11.2px] ' + (setField === 'urgency' ? 'font-bold' : 'text-[var(--bs-secondary-color)]')} style={{ cursor: 'pointer' }} onClick={() => handleSetSorting('urgency')}>
    //         Urgency{' '}
    //         {setField === 'urgency' ? sortingDirectionAsc ? <i className='ri-arrow-down-fill text-[11.2px] text-primary' /> : <i className='ri-arrow-up-fill text-[11.2px] text-primary' /> : null}
    //       </span>
    //       <span className={'text-[11.2px] ' + (setField === 'daysRemaining' ? 'font-bold' : 'text-[var(--bs-secondary-color)]')} style={{ cursor: 'pointer' }} onClick={() => handleSetSorting('daysRemaining')}>
    //         Remaining Days{' '}
    //         {setField === 'daysRemaining' ? (
    //           sortingDirectionAsc ? (
    //             <i className='ri-arrow-down-fill text-[11.2px] text-primary' />
    //           ) : (
    //             <i className='ri-arrow-up-fill text-[11.2px] text-primary' />
    //           )
    //         ) : null}
    //       </span>
    //     </div>
    //   ),
    //   selector: (row: ReorderingPointsProduct) => {
    //     var color: string = 'text-primary'
    //     switch (row.urgency) {
    //       case 3:
    //         color = 'text-destructive'
    //         break
    //       case 2:
    //         color = 'text-warning'
    //         break
    //       case 1:
    //         color = 'text-info'
    //         break
    //       default:
    //         color = 'text-success'
    //         break
    //     }
    //     return (
    //       <div className='flex flex-col justify-center items-center gap-1'>
    //         <i className={`mdi mdi-alert-octagon text-[22.75px] m-0 p-0 ${color}`} />

    //         <div className='flex flex-row justify-center items-center gap-1'>
    //           <span
    //             className={
    //               'm-0 p-0 text-center text-[11.2px]' + (row.daysToOrder <= 0 ? ' text-destructive fw-semibold' : '')
    //             }>{`${FormatIntNumber(state.currentRegion, row.daysToOrder)} ${row.daysToOrder == 1 ? 'day' : 'days'}`}</span>
    //           <i className='text-[16.25px] text-primary las la-info-circle' style={{ cursor: 'pointer' }} id={'DaysToOrderIcon'} />
    //           <UncontrolledTooltip placement='top' target={'DaysToOrderIcon'} innerClassName='bg-white border border-[color-mix(in_srgb,var(--info)_50%,transparent)] p-2'>
    //             <p className='text-[11.2px] text-primary m-0 p-0 mb-0'>Remaining days to place order.</p>
    //           </UncontrolledTooltip>
    //         </div>

    //         <div className='flex flex-row justify-center items-center gap-1'>
    //           <span
    //             className={
    //               'm-0 p-0 text-center text-[11.2px]' + (row.daysRemaining <= 0 ? ' text-destructive fw-semibold' : '')
    //             }>{`${FormatIntNumber(state.currentRegion, row.daysRemaining)} ${row.daysRemaining == 1 ? 'day' : 'days'}`}</span>
    //           <i className='text-[16.25px] text-primary las la-info-circle' style={{ cursor: 'pointer' }} id={'DaysRemaining'} />
    //           <UncontrolledTooltip placement='top' target={'DaysRemaining'} innerClassName='bg-white border border-[color-mix(in_srgb,var(--info)_50%,transparent)] p-2'>
    //             <p className='text-[11.2px] text-primary m-0 p-0 mb-0'>Remaining days of stock.</p>
    //           </UncontrolledTooltip>
    //         </div>
    //       </div>
    //     )
    //   },
    //   sortable: false,
    //   center: true,
    //   compact: true,
    //   // grow: 0,
    //   // sortFunction: urgencySort,
    // },
    {
      name: (
        <span className={'w-full text-[11.2px] text-center ' + (setField === 'sku' ? 'font-bold' : 'text-[var(--bs-secondary-color)]')} style={{ cursor: 'pointer' }} onClick={() => handleSetSorting('sku')}>
          Product {setField === 'sku' ? sortingDirectionAsc ? <i className='ri-arrow-down-fill text-[11.2px] text-primary' /> : <i className='ri-arrow-up-fill text-[11.2px] text-primary' /> : null}
        </span>
      ),
      selector: (row: ReorderingPointsProduct) => {
        return (
          <div className='my-2 mx-0 flex flex-row justify-start items-center gap-4'>
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
              <div className='flex flex-row justify-start items-center gap-1'>
                <Link href={`/product/${row.inventoryId}/${row.sku}`} target='_blank'>
                  <p className='m-0 p-0 text-primary font-semibold text-[13px]'>{row.sku}</p>
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
                      target='_blank'
                      rel='noopener noreferrer'
                      className='font-light'
                      style={{ textDecoration: 'none' }}>
                      {row.asin}
                    </a>
                    <i className='ri-file-copy-line text-[13px] m-0 p-0 text-[color:var(--bs-secondary-color)]' style={{ cursor: 'pointer' }} onClick={() => navigator.clipboard.writeText(row.asin)} />
                  </div>
                )}
                {row.barcode && (
                  <div>
                    {`UPC: `}
                    <span className='font-light text-[var(--bs-secondary-color)]'>{row.barcode}</span>
                  </div>
                )}
              </span>
              <div className='flex flex-row justify-start items-center gap-1 mt-1'>
                {/* {(row.productTrendTag?.aiTrend || row.productTrendTag?.bsnssTrend) && (
                  <ShadcnBadge variant={'default'} className='text-xs'>
                    <TrendingUpDownIcon className='size-3 mr-2' />
                    {row.productTrendTag.useAITrend ? row.productTrendTag.aiTrend : row.productTrendTag.bsnssTrend}
                  </ShadcnBadge>
                )} */}
                {row.hideReorderingPoints && (
                  <ShadcnBadge variant={'warning'} className='text-xs'>
                    Hidden
                  </ShadcnBadge>
                )}
              </div>
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
        <div className='text-center flex flex-col justify-center items-center py-1'>
          <span className={'text-[11.2px] ' + (setField === 'warehouseQty' ? 'font-bold' : 'text-[var(--bs-secondary-color)]')} style={{ cursor: 'pointer' }} onClick={() => handleSetSorting('warehouseQty')}>
            Warehouse{' '}
            {setField === 'warehouseQty' ? (
              sortingDirectionAsc ? (
                <i className='ri-arrow-down-fill text-[11.2px] text-primary' />
              ) : (
                <i className='ri-arrow-up-fill text-[11.2px] text-primary' />
              )
            ) : null}
          </span>
          <span className={'text-[11.2px] ' + (setField === 'productionQty' ? 'font-bold' : 'text-[var(--bs-secondary-color)]')} style={{ cursor: 'pointer' }} onClick={() => handleSetSorting('productionQty')}>
            Production{' '}
            {setField === 'productionQty' ? (
              sortingDirectionAsc ? (
                <i className='ri-arrow-down-fill text-[11.2px] text-primary' />
              ) : (
                <i className='ri-arrow-up-fill text-[11.2px] text-primary' />
              )
            ) : null}
          </span>
          <span className={'text-[11.2px] ' + (setField === 'receiving' ? 'font-bold' : 'text-[var(--bs-secondary-color)]')} style={{ cursor: 'pointer' }} onClick={() => handleSetSorting('receiving')}>
            Receiving{' '}
            {setField === 'receiving' ? sortingDirectionAsc ? <i className='ri-arrow-down-fill text-[11.2px] text-primary' /> : <i className='ri-arrow-up-fill text-[11.2px] text-primary' /> : null}
          </span>
        </div>
      ),
      selector: (row: ReorderingPointsProduct) => {
        return (
          <div>
            <p className='m-0 p-0 text-right text-[11.2px]'>
              <span className='text-[var(--bs-secondary-color)] font-light'>On Hand: </span>
              <span className='font-semibold'>{row.warehouseQty}</span>
            </p>
            <p className='m-0 p-0 text-right text-[11.2px]'>
              <span className='text-[var(--bs-secondary-color)] font-light'>Prod: </span>
              <span className='font-semibold'>{row.productionQty}</span>
            </p>
            <p className='m-0 p-0 text-right text-[11.2px]'>
              <span className='text-[var(--bs-secondary-color)] font-light'>Inbound: </span>
              <span className='font-semibold'>{row.receiving}</span>
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
              <div className='text-center flex flex-col justify-center items-center py-1'>
                {state.user[state.currentRegion]?.showAmazonTab && state.user[state.currentRegion]?.amazonConnected && (
                  <>
                    <span className={'text-[11.2px] ' + (setField === 'fbaQty' ? 'font-bold' : 'text-[var(--bs-secondary-color)]')} style={{ cursor: 'pointer' }} onClick={() => handleSetSorting('fbaQty')}>
                      FBA{' '}
                      {setField === 'fbaQty' ? (
                        sortingDirectionAsc ? (
                          <i className='ri-arrow-down-fill text-[11.2px] text-primary' />
                        ) : (
                          <i className='ri-arrow-up-fill text-[11.2px] text-primary' />
                        )
                      ) : null}
                    </span>
                    {state.user[state.currentRegion]?.rpShowAWD && (
                      <span className={'text-[11.2px] ' + (setField === 'awdQty' ? 'font-bold' : 'text-[var(--bs-secondary-color)]')} style={{ cursor: 'pointer' }} onClick={() => handleSetSorting('awdQty')}>
                        AWD{' '}
                        {setField === 'awdQty' ? (
                          sortingDirectionAsc ? (
                            <i className='ri-arrow-down-fill text-[11.2px] text-primary' />
                          ) : (
                            <i className='ri-arrow-up-fill text-[11.2px] text-primary' />
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
                    <div className='my-1'>
                      <p className='m-0 p-0 text-right text-[11.2px]'>
                        <span className='text-[var(--bs-secondary-color)] font-bold'>FBA: </span>
                        <span className='font-semibold'>{row.fbaQty}</span>
                      </p>
                      <p className='m-0 p-0 text-right text-[11.2px]'>
                        <span className='text-[var(--bs-secondary-color)] font-light'>Prod: </span>
                        <span className='font-semibold'>{row.fbaProduction}</span>
                      </p>
                      <p className='m-0 p-0 text-right text-[11.2px]'>
                        <span className='text-[var(--bs-secondary-color)] font-light'>Inbound: </span>
                        <span className='font-semibold'>{row.fbaInboundQty}</span>
                      </p>
                      {state.user[state.currentRegion]?.rpShowAWD && <hr className='my-1 mx-0 opacity-50' style={{ borderColor: '#6c757d' }} />}
                      {state.user[state.currentRegion]?.rpShowAWD && (
                        <>
                          <p className='m-0 p-0 text-right text-[11.2px]'>
                            <span className='text-[var(--bs-secondary-color)] font-bold'>AWD: </span>
                            <span className='font-semibold'>{row.awdQty}</span>
                          </p>
                          <p className='m-0 p-0 text-right text-[11.2px]'>
                            <span className='text-[var(--bs-secondary-color)] font-light'>Inbound: </span>
                            <span className='font-semibold'>{row.awdInboundQty}</span>
                          </p>
                          <p className='m-0 p-0 text-right text-[11.2px]'>
                            <span className='text-[var(--bs-secondary-color)] font-light'>Prod: </span>
                            <span className='font-semibold'>{row.awdProduction}</span>
                          </p>
                        </>
                      )}
                    </div>
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
          className={'text-[11.2px] text-wrap text-center ' + (setField === 'totalInventory' ? 'font-bold' : 'text-[var(--bs-secondary-color)]')}
          style={{ cursor: 'pointer' }}
          onClick={() => handleSetSorting('totalInventory')}>
          Total <br /> Inventory{' '}
          {setField === 'totalInventory' ? (
            sortingDirectionAsc ? (
              <i className='ri-arrow-down-fill text-[11.2px] text-primary' />
            ) : (
              <i className='ri-arrow-up-fill text-[11.2px] text-primary' />
            )
          ) : null}
        </span>
      ),
      selector: (row: ReorderingPointsProduct) =>
        FormatIntNumber(
          state.currentRegion,
          row.warehouseQty + row.productionQty + row.receiving + row.fbaQty + row.fbaInboundQty + row.fbaProduction + row.awdQty + row.awdInboundQty + row.awdProduction
        ),
      wrap: true,
      sortable: false,
      center: true,
      compact: true,
    },
    {
      name: (
        <div>
          <p className='m-0 mb-1 font-bold text-[11.2px] text-center'>Total Orders</p>
          <div className='grid gap-1' style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
            <span className={'text-[11.2px] ' + (setField === '30D' ? 'font-bold' : 'text-[var(--bs-secondary-color)]')} style={{ cursor: 'pointer' }} onClick={() => handleSetSorting('30D')}>
              30D {setField === '30D' ? sortingDirectionAsc ? <i className='ri-arrow-down-fill text-[11.2px] text-primary' /> : <i className='ri-arrow-up-fill text-[11.2px] text-primary' /> : null}
            </span>
            <span className={'text-[11.2px] ' + (setField === '60D' ? 'font-bold' : 'text-[var(--bs-secondary-color)]')} style={{ cursor: 'pointer' }} onClick={() => handleSetSorting('60D')}>
              60D {setField === '60D' ? sortingDirectionAsc ? <i className='ri-arrow-down-fill text-[11.2px] text-primary' /> : <i className='ri-arrow-up-fill text-[11.2px] text-primary' /> : null}
            </span>
            <span className={'text-[11.2px] ' + (setField === '90D' ? 'font-bold' : 'text-[var(--bs-secondary-color)]')} style={{ cursor: 'pointer' }} onClick={() => handleSetSorting('90D')}>
              90D {setField === '90D' ? sortingDirectionAsc ? <i className='ri-arrow-down-fill text-[11.2px] text-primary' /> : <i className='ri-arrow-up-fill text-[11.2px] text-primary' /> : null}
            </span>
            <span className={'text-[11.2px] ' + (setField === '120D' ? 'font-bold' : 'text-[var(--bs-secondary-color)]')} style={{ cursor: 'pointer' }} onClick={() => handleSetSorting('120D')}>
              120D{' '}
              {setField === '120D' ? sortingDirectionAsc ? <i className='ri-arrow-down-fill text-[11.2px] text-primary' /> : <i className='ri-arrow-up-fill text-[11.2px] text-primary' /> : null}
            </span>
            <span className={'text-[11.2px] ' + (setField === '180D' ? 'font-bold' : 'text-[var(--bs-secondary-color)]')} style={{ cursor: 'pointer' }} onClick={() => handleSetSorting('180D')}>
              180D{' '}
              {setField === '180D' ? sortingDirectionAsc ? <i className='ri-arrow-down-fill text-[11.2px] text-primary' /> : <i className='ri-arrow-up-fill text-[11.2px] text-primary' /> : null}
            </span>
            <span className={'text-[11.2px] ' + (setField === '365D' ? 'font-bold' : 'text-[var(--bs-secondary-color)]')} style={{ cursor: 'pointer' }} onClick={() => handleSetSorting('365D')}>
              365D{' '}
              {setField === '365D' ? sortingDirectionAsc ? <i className='ri-arrow-down-fill text-[11.2px] text-primary' /> : <i className='ri-arrow-up-fill text-[11.2px] text-primary' /> : null}
            </span>
          </div>
        </div>
      ),
      selector: (row: ReorderingPointsProduct) => {
        return (
          <div className='grid gap-2 my-4 text-[11.2px]' style={{ gridTemplateColumns: 'repeat(2, 1fr)', overflow: 'unset', textOverflow: 'unset' }}>
            <div>
              <span className='font-semibold'>30D: </span>
              <span>{FormatIntNumber(state.currentRegion, row.totalUnitsSold['30D'])}</span>
            </div>
            <div>
              <span className='font-semibold'>120D: </span>
              <span>{FormatIntNumber(state.currentRegion, row.totalUnitsSold['120D'])}</span>
            </div>
            <div>
              <span className='font-semibold'>60D: </span>
              <span>{FormatIntNumber(state.currentRegion, row.totalUnitsSold['60D'])}</span>
            </div>
            <div>
              <span className='font-semibold'>180D: </span>
              <span>{FormatIntNumber(state.currentRegion, row.totalUnitsSold['180D'])}</span>
            </div>
            <div>
              <span className='font-semibold'>90D: </span>
              <span>{FormatIntNumber(state.currentRegion, row.totalUnitsSold['90D'])}</span>
            </div>

            <div>
              <span className='font-semibold'>365D: </span>
              <span>{FormatIntNumber(state.currentRegion, row.totalUnitsSold['365D'])}</span>
            </div>
          </div>
        )
      },
      wrap: false,
      sortable: false,
      left: true,
      compact: true,
      minWidth: 'fit-content',
      width: '130px',
    },
    {
      name: (
        <div className='w-full text-center flex flex-col justify-center items-center'>
          <span className={'text-[11.2px] ' + (setField === 'sellerCost' ? 'font-bold' : 'text-[var(--bs-secondary-color)]')} style={{ cursor: 'pointer' }} onClick={() => handleSetSorting('sellerCost')}>
            Supplier Cost{' '}
            {setField === 'sellerCost' ? sortingDirectionAsc ? <i className='ri-arrow-down-fill text-[11.2px] text-primary' /> : <i className='ri-arrow-up-fill text-[11.2px] text-primary' /> : null}
          </span>
          <span className={'text-[11.2px] ' + (setField === 'boxQty' ? 'font-bold' : 'text-[var(--bs-secondary-color)]')} style={{ cursor: 'pointer' }} onClick={() => handleSetSorting('boxQty')}>
            Box Qty{' '}
            {setField === 'boxQty' ? sortingDirectionAsc ? <i className='ri-arrow-down-fill text-[11.2px] text-primary' /> : <i className='ri-arrow-up-fill text-[11.2px] text-primary' /> : null}
          </span>
        </div>
      ),
      selector: (row: ReorderingPointsProduct) => {
        return (
          <div className='text-[11.2px] my-4'>
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
        <div className='w-full text-center flex flex-col justify-center items-center'>
          <span className={'text-[11.2px] text-[var(--bs-secondary-color)]'}>Lead Time </span>
          <span className={'text-[11.2px] text-[var(--bs-secondary-color)]'}>Safety Stock Days </span>
        </div>
      ),
      selector: (row: ReorderingPointsProduct) => {
        return (
          <div className='text-[11.2px] my-4'>
            <p className='m-0 p-0 text-center font-semibold'>
              {FormatIntNumber(state.currentRegion, row.leadTimeSC)} <span className='text-muted-foreground text-xs'>Days</span>
            </p>
            <p className='m-0 p-0 text-center font-semibold'>
              {FormatIntNumber(state.currentRegion, row.daysOfStockSC)} <span className='text-muted-foreground text-xs'>Days</span>
            </p>
          </div>
        )
      },
      sortable: false,
      center: true,
      compact: true,
    },
    // {
    //   name: (
    //     <div className='text-center flex flex-col justify-center items-center py-1'>
    //       {/* <span className={'fs-7 fw-bold'}>Forecast</span> */}
    //       <span className={'text-[11.2px] ' + (setField === 'totalSCForecast' ? 'font-bold' : 'text-[var(--bs-secondary-color)]')} style={{ cursor: 'pointer' }} onClick={() => handleSetSorting('totalSCForecast')}>
    //         Forecast{' '}
    //         {setField === 'totalSCForecast' ? (
    //           sortingDirectionAsc ? (
    //             <i className='ri-arrow-down-fill text-[11.2px] text-primary' />
    //           ) : (
    //             <i className='ri-arrow-up-fill text-[11.2px] text-primary' />
    //           )
    //         ) : null}
    //       </span>
    //     </div>
    //   ),
    //   selector: (row: ReorderingPointsProduct) => {
    //     return (
    //       <div className='text-[11.2px]'>
    //         <p className='m-0 p-0 text-center' id={'Recommended_Qty'}>
    //           {FormatIntNumber(state.currentRegion, row.totalSCForecast)}
    //         </p>
    //       </div>
    //     )
    //   },
    //   sortable: false,
    //   center: true,
    //   compact: true,
    // },
    {
      name: (
        <div className='text-center flex flex-col justify-center items-center py-1'>
          <span
            className={'text-[11.2px] ' + (setField === 'totalAIForecast_1' ? 'font-bold' : 'text-[var(--bs-secondary-color)]')}
            style={{ cursor: 'pointer' }}
            onClick={() => handleSetSorting('totalAIForecast_1')}>
            AI 9 Month Forecast{' '}
            {setField === 'totalAIForecast_1' ? (
              sortingDirectionAsc ? (
                <i className='ri-arrow-down-fill text-[11.2px] text-primary' />
              ) : (
                <i className='ri-arrow-up-fill text-[11.2px] text-primary' />
              )
            ) : null}
          </span>
        </div>
      ),
      selector: (row: ReorderingPointsProduct) => {
        if (!state.user[state.currentRegion]?.useAiForecast) return <p className='text-center text-[11.2px] text-[var(--bs-secondary-color)]'>Disabled</p>
        const forecastValue = getAIForecastTotal(row.totalAIForecast_1)

        return (
          <div className='text-[11.2px]'>
            {row.totalAIForecast_1.model ? (
              <div className='flex flex-row justify-center items-center gap-2'>
                <p className='m-0 p-0 text-center'>{FormatIntNumber(state.currentRegion, forecastValue)}</p>
                {row.totalAIForecast_1.analysis && (
                  <>
                    <i className='ri-information-fill m-0 text-[16.25px] text-info' id={`ai_forecast_model_1_${row.sku}`}></i>
                    <SCTooltip target={`ai_forecast_model_1_${row.sku}`} placement='right' key={`ai_forecast_model_1_${row.sku}`}>
                      <p className='text-[11.2px] text-primary m-0 p-0'>{row.totalAIForecast_1.analysis}</p>
                    </SCTooltip>
                  </>
                )}
              </div>
            ) : (
              <p className='m-0 p-0 text-center text-danger' id={'ai_recommended_Qty'}>
                No Forecast
              </p>
            )}
          </div>
        )
      },
      sortable: false,
      center: true,
      compact: true,
    },
    {
      name: (
        <div className='text-center flex flex-col justify-center items-center py-1'>
          {/* <span className={'fs-7 fw-bold'}>Forecast</span> */}
          <span className={'text-[11.2px] ' + (setField === 'ai_forecast_qty' ? 'font-bold' : 'text-[var(--bs-secondary-color)]')} style={{ cursor: 'pointer' }} onClick={() => handleSetSorting('ai_forecast_qty')}>
            Forecast{' '}
            {setField === 'ai_forecast_qty' ? (
              sortingDirectionAsc ? (
                <i className='ri-arrow-down-fill text-[11.2px] text-primary' />
              ) : (
                <i className='ri-arrow-up-fill text-[11.2px] text-primary' />
              )
            ) : null}
          </span>
        </div>
      ),
      selector: (row: ReorderingPointsProduct) => {
        const forecastValue = getProductAIForecastCoverageQty(row)
        return (
          <div className='text-[11.2px]'>
            <p className='m-0 p-0 text-center' id={'Recommended_Qty'}>
              {FormatIntNumber(state.currentRegion, forecastValue)}
            </p>
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
        <div className='text-center text-[var(--bs-secondary-color)] flex flex-col justify-center items-center'>
          <span className='text-[11.2px]'>
            Quantity <br /> Used
          </span>
        </div>
      ),
      selector: (row: ReorderingPointsProduct) => {
        return (
          <div className='flex flex-col justify-start items-end gap-2 w-full px-1'>
            <div className='w-full flex flex-row justify-start items-center gap-1'>
              <input
                className='form-check-input m-0 p-0'
                type='checkbox'
                checked={!row.useOrderAdjusted}
                id={`orderCheckbox-${row.sku}`}
                onClick={() => handleUseAdjustedQty(row.sku, false)}
                readOnly
              />
              <span className='text-[11.2px]'>Order</span>
            </div>
            <div className='w-full flex flex-row justify-start items-center gap-1'>
              <input
                className='form-check-input m-0 p-0'
                type='checkbox'
                checked={row.useOrderAdjusted}
                id={`adjustedOrderCheckbox-${row.sku}`}
                onClick={() => handleUseAdjustedQty(row.sku, true)}
                readOnly
              />
              <span className='text-[11.2px]'>Boxes</span>
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
        <span className='text-[11.2px] text-center text-[var(--bs-secondary-color)]'>
          Total <br /> Ordered
        </span>
      ),
      selector: (row: ReorderingPointsProduct) => {
        const totalOrdered = row.useOrderAdjusted ? row.orderAdjusted : row.order
        return <p className='text-[13px] font-semibold text-center'>{FormatIntNumber(state.currentRegion, totalOrdered)}</p>
      },
      sortable: false,
      center: true,
      compact: true,
    },
    {
      name: <span className='text-[11.2px] text-center text-[var(--bs-secondary-color)]'>Actions</span>,
      cell: (row: ReorderingPointsProduct) => {
        return (
          <UncontrolledDropdown className='inline-block' direction='start'>
            <DropdownToggle className='m-0 p-0 rounded bg-[var(--vz-light)]' style={{ border: '1px solid rgba(68, 129, 253, 0.06)' }} tag='button'>
              <i className='mdi mdi-dots-vertical align-middle text-[19.5px] m-0 px-2 py-0' style={{ color: '#919FAF' }} />
            </DropdownToggle>
            <DropdownMenu className='dropdown-menu-end' container={'body'}>
              <DropdownItem className='edit-item-btn' onClick={() => setRPProductConfig({ isOpen: true, product: row })}>
                <i className='ri-settings-3-line align-middle me-2 text-[16.25px] text-black'></i>
                <span className='text-[11.2px] font-normal text-black'>Edit Config</span>
              </DropdownItem>
              {state.user.us.useAiForecast ? (
                <DropdownItem className='edit-item-btn' onClick={() => handleRegenerateForecast({ inventoryId: row.inventoryId, sku: row.sku })}>
                  <i className='mdi mdi-reload align-middle me-2 text-[16.25px] text-primary'></i>
                  <span className='text-[11.2px] font-normal text-black'>Regenerate Forecast</span>
                </DropdownItem>
              ) : null}
              {state.user.us.useAiForecast ? (
                <DropdownItem className='edit-item-btn' onClick={() => setAIForecastProduct(row)}>
                  <i className='las la-brain align-middle me-2 text-[16.25px] text-info'></i>
                  <span className='text-[11.2px] font-normal text-black'>AI Forecast Details</span>
                </DropdownItem>
              ) : null}
              {/* <DownloadProductMD product={row} /> */}
              <DropdownItem
                className='edit-item-btn'
                onClick={() => {
                  setSalesModal({ showSalesModal: true, sku: row.sku, title: row.title, totalUnitsSold: row.totalUnitsSold, marketplaces: row.marketplaces })
                }}>
                <i className='ri-search-eye-line align-middle me-2 text-[16.25px] text-primary'></i>
                <span className='text-[11.2px] font-normal text-black'>Sales By Marketpalce</span>
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
