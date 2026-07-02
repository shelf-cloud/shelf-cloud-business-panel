/* eslint-disable @next/next/no-img-element */
import Link from 'next/link'
import { useContext, useEffect, useMemo } from 'react'

import AppContext from '@context/AppContext'
import { validateFulfillmentWarehouseUsage } from '@features/amazon/fulfillmentQuantityValidation'
import { FormatIntNumber } from '@lib/FormatNumbers'
import { CleanSpecialCharacters } from '@lib/SkuFormatting'
import { NoImageAdress } from '@lib/assetsConstants'
import { sortBooleans, sortDates, sortNumbers, sortStringsLocaleCompare } from '@lib/helperFunctions'
import { AmazonFulfillmentSku } from '@typesTs/amazon/fulfillments'
import moment from 'moment'
import DataTable from 'react-data-table-component'
import { DebounceInput } from 'react-debounce-input'
import { toast } from 'react-toastify'
import { Button, FormFeedback, UncontrolledTooltip } from '@/components/migration-ui'

type Props = {
  allData: AmazonFulfillmentSku[]
  filteredItems: AmazonFulfillmentSku[]
  setAllData: (allData: AmazonFulfillmentSku[] | ((prev: AmazonFulfillmentSku[]) => AmazonFulfillmentSku[])) => void
  pending: boolean
  setHasInputError: (hasInputError: boolean) => void
  setHasQtyError: (hasQtyError: boolean) => void
  setdimensionsModal: (dimensionsModal: any) => void
  setSelectedRows: (selectedRows: AmazonFulfillmentSku[]) => void
  toggledClearRows: boolean
  setinboundFBAHistoryModal: (prev: any) => void
}

const MasterBoxesTable = ({
  allData,
  filteredItems,
  setAllData,
  pending,
  setHasInputError,
  setHasQtyError,
  setSelectedRows,
  toggledClearRows,
  setinboundFBAHistoryModal,
}: Props) => {
  const { state, setModalProductInfo } = useContext(AppContext)

  useEffect(() => {
    return () => setHasInputError(false)
  }, [setHasInputError])

  useEffect(() => {
    return () => setHasQtyError(false)
  }, [setHasQtyError])

  const handleOrderQty = (value: string, msku: string, qtyBox: number) => {
    setAllData((previousData) =>
      previousData.map((item) => {
        if (item.msku !== msku) {
          return item
        }

        if (value === '' || Number(value) === 0) {
          return {
            ...item,
            orderQty: '',
            totalSendToAmazon: 0,
          }
        }

        return {
          ...item,
          orderQty: value,
          totalSendToAmazon: Number(value) * qtyBox,
        }
      })
    )
  }

  const handleSelectedRows = ({ selectedRows }: { selectedRows: AmazonFulfillmentSku[] }) => {
    setSelectedRows(selectedRows)
  }

  const { exceededSkus, missingAvailabilitySkus } = useMemo(() => validateFulfillmentWarehouseUsage(allData, 'master-boxes'), [allData])

  const rowValidationByMsku = useMemo(() => {
    return allData.reduce(
      (validationByMsku, row) => {
        const numericOrderQty = Number(row.orderQty)
        const hasPositiveOrderQty = numericOrderQty > 0
        const hasInvalidBoxQty = !Number.isInteger(Number(row.boxQty)) || Number(row.boxQty) <= 0
        const hasInvalidChildQty = row.isKit && (row.children ?? []).some((child) => !Number.isInteger(Number(child.qty)) || Number(child.qty) <= 0)
        const hasInputError =
          (hasPositiveOrderQty && row.hasError) ||
          (hasPositiveOrderQty && (numericOrderQty < 0 || !Number.isInteger(numericOrderQty) || numericOrderQty > row.maxOrderQty)) ||
          (hasPositiveOrderQty && hasInvalidBoxQty) ||
          (hasPositiveOrderQty && row.isKit && (!(row.children && row.children?.length > 0) || hasInvalidChildQty))
        const hasExceededQtyError = row.isKit ? (row.children ?? []).some((child) => Boolean(exceededSkus[child.sku])) : Boolean(exceededSkus[row.shelfcloud_sku])
        const hasMissingAvailabilityError = row.isKit && hasPositiveOrderQty ? (row.children ?? []).some((child) => Boolean(missingAvailabilitySkus[child.sku])) : false

        validationByMsku[row.msku] = {
          hasInputError,
          hasExceededQtyError,
          hasMissingAvailabilityError,
        }

        return validationByMsku
      },
      {} as Record<string, { hasInputError: boolean; hasExceededQtyError: boolean; hasMissingAvailabilityError: boolean }>
    )
  }, [allData, exceededSkus, missingAvailabilitySkus])

  const hasInputError = useMemo(() => Object.values(rowValidationByMsku).some((rowValidation) => rowValidation.hasInputError), [rowValidationByMsku])
  const hasQtyError = useMemo(() => Object.keys(exceededSkus).length > 0 || Object.keys(missingAvailabilitySkus).length > 0, [exceededSkus, missingAvailabilitySkus])

  useEffect(() => {
    setHasInputError(hasInputError)
  }, [hasInputError, setHasInputError])

  useEffect(() => {
    setHasQtyError(hasQtyError)
  }, [hasQtyError, setHasQtyError])

  const conditionalRowStyles = [
    {
      when: (row: AmazonFulfillmentSku) => Number(row.maxOrderQty) == 0,
      classNames: ['tw:bg-warning/25'],
    },
    {
      when: (row: AmazonFulfillmentSku) => Number(row.orderQty) > 0,
      classNames: ['tw:bg-success/25'],
    },
    {
      when: (row: AmazonFulfillmentSku) => {
        const rowValidation = rowValidationByMsku[row.msku]
        return Boolean(rowValidation?.hasInputError || rowValidation?.hasExceededQtyError || rowValidation?.hasMissingAvailabilityError)
      },
      classNames: ['tw:bg-danger/25'],
    },
  ]

  const columns: any = [
    {
      name: <span className='tw:font-bold tw:text-[11.2px]'>Image</span>,
      selector: (row: AmazonFulfillmentSku) => {
        return (
          <Link href={row.isKit ? `/kit/${row.inventoryId}/${row.sku}` : `/product/${row.inventoryId}/${row.sku}`} target='blank' rel='noopener noreferrer' tabIndex={-1}>
            <div
              className='tw:my-2'
              style={{
                width: '50px',
                height: '50px',
                margin: '2px 0px',
                position: 'relative',
              }}>
              <img
                loading='lazy'
                src={row.image ? row.image : NoImageAdress}
                alt='product Image'
                style={{ objectFit: 'contain', objectPosition: 'center', width: '100%', height: '100%' }}
              />
            </div>
          </Link>
        )
      },
      sortable: false,
      center: true,
      compact: true,
      width: '80px',
    },
    {
      name: <span className='tw:font-bold tw:text-[11.2px]'>Amazon SKU Details</span>,
      selector: (row: AmazonFulfillmentSku) => {
        if (row.isKit) {
          return (
            <div className='tw:flex tw:flex-col tw:justify-start tw:items-start tw:my-2'>
              <Link href={`/kit/${row.inventoryId}/${row.sku}`} style={{ cursor: 'pointer' }} target='blank' rel='noopener noreferrer' tabIndex={-1}>
                <p className='tw:m-0 tw:p-0 tw:text-[11.2px] tw:font-semibold tw:text-black'>{row.title || `${row.product_name.substring(0, 80)}...`}</p>
              </Link>
              <div className='tw:flex tw:flex-wrap tw:justify-start tw:items-center'>
                <p className='tw:m-0 tw:p-0 tw:text-[11.2px]'>{`${row.msku}`}</p>
                <i
                  className='ri-file-copy-line tw:text-[13px] tw:my-0 tw:mx-1 tw:p-0 tw:text-[color:var(--bs-secondary-color)]'
                  style={{ cursor: 'pointer' }}
                  onClick={() => {
                    navigator.clipboard.writeText(row.msku)
                    toast('SKU copied!')
                  }}
                />
              </div>
              <div className='tw:flex tw:flex-wrap tw:justify-start tw:items-center'>
                <a
                  tabIndex={-1}
                  href={`https://www.amazon.${state.currentRegion == 'us' ? 'com' : 'es'}/dp/${row.asin}`}
                  target='blank'
                  rel='noopener noreferrer'
                  className='tw:font-light tw:text-[11.2px]'>
                  {`ASIN: ${row.asin}`}
                </a>
                <i
                  className='ri-file-copy-line tw:text-[13px] tw:my-0 tw:mx-1 tw:p-0 tw:text-[color:var(--bs-secondary-color)]'
                  style={{ cursor: 'pointer' }}
                  onClick={() => {
                    navigator.clipboard.writeText(row.asin)
                    toast('ASIN copied!')
                  }}
                />
              </div>
              <p className='tw:text-[11.2px] tw:m-0 tw:p-0 tw:text-[var(--bs-secondary-color)]'>
                Label Owner: <span className='tw:text-black'>{row.labelOwner}</span> Prep Owner: <span className='tw:text-black'>{row.prepOwner}</span>
              </p>
              <div>
                {row.children?.map((child) => (
                  <li
                    style={{ margin: '0px', fontSize: '10px' }}
                    key={child.idInventory}>{`${child.title} | ${child.sku} | Available: ${child.available} | Used: ${child.qty}`}</li>
                ))}
              </div>
            </div>
          )
        } else {
          return (
            <div className='tw:flex tw:flex-col tw:justify-start tw:items-start'>
              <Link href={`/product/${row.inventoryId}/${row.sku}`} style={{ cursor: 'pointer' }} target='blank' rel='noopener noreferrer' tabIndex={-1}>
                <p className='tw:m-0 tw:p-0 tw:text-[11.2px] tw:font-semibold tw:text-black'>{row.title || `${row.product_name.substring(0, 80)}...`}</p>
              </Link>
              <div className='tw:flex tw:flex-wrap tw:justify-start tw:items-center'>
                <p className='tw:m-0 tw:p-0 tw:text-[11.2px]'>{`${row.msku}`}</p>
                <i
                  className='ri-file-copy-line tw:text-[13px] tw:my-0 tw:mx-1 tw:p-0 tw:text-[color:var(--bs-secondary-color)]'
                  style={{ cursor: 'pointer' }}
                  onClick={() => {
                    navigator.clipboard.writeText(row.msku)
                    toast('SKU copied!')
                  }}
                />
              </div>
              <div className='tw:flex tw:flex-wrap tw:justify-start tw:items-center'>
                <a
                  tabIndex={-1}
                  href={`https://www.amazon.${state.currentRegion == 'us' ? 'com' : 'es'}/dp/${row.asin}`}
                  target='blank'
                  rel='noopener noreferrer'
                  className='tw:font-light tw:text-[11.2px]'>
                  {`ASIN: ${row.asin}`}
                </a>
                <i
                  className='ri-file-copy-line tw:text-[13px] tw:my-0 tw:mx-1 tw:p-0 tw:text-[color:var(--bs-secondary-color)]'
                  style={{ cursor: 'pointer' }}
                  onClick={() => {
                    navigator.clipboard.writeText(row.asin)
                    toast('ASIN copied!')
                  }}
                />
              </div>
              <p className='tw:text-[11.2px] tw:m-0 tw:p-0 tw:text-[var(--bs-secondary-color)]'>
                Label Owner: <span className='tw:text-black'>{row.labelOwner}</span> Prep Owner: <span className='tw:text-black'>{row.prepOwner}</span>
              </p>
            </div>
          )
        }
      },
      sortable: false,
      center: false,
      compact: false,
      wrap: true,
      minWidth: 'fit-content',
      width: '300px',
      sortFunction: (rowA: AmazonFulfillmentSku, rowB: AmazonFulfillmentSku) => sortStringsLocaleCompare(rowA.product_name, rowB.product_name),
    },
    {
      name: <span className='tw:font-bold tw:text-[11.2px]'>SC SKU</span>,
      selector: (row: AmazonFulfillmentSku) => {
        return (
          <div className='tw:text-center'>
            <p className='tw:m-0 tw:p-0 tw:text-[11.2px]'>{row.shelfcloud_sku}</p>
            {/* <p className='m-0 p-0 d-inline-flex flex-row justify-content-center align-items-center gap-1'>
              <span
                className='text-primary fs-7'
                style={{ cursor: 'pointer' }}
                onClick={() =>
                  setdimensionsModal({
                    show: true,
                    inventoryId: row.inventoryId,
                    isKit: row.isKit,
                    msku: row.msku,
                    asin: row.asin,
                    scSKU: row.shelfcloud_sku,
                    boxQty: row.boxQty,
                    shelfCloudDimensions: row.amzDimensions ?? { boxLength: row.boxLength, boxWidth: row.boxWidth, boxHeight: row.boxHeight, boxWeight: row.boxWeight },
                    amazonDimensions: row.dimensions.package,
                  })
                }>
                Dimensions
              </span>
              {row.hasError && (
                <>
                  <i className='ri-information-fill m-0 p-0 fs-5 text-danger' id={`tooltipFBABoxesErrors${row.inventoryId}`}></i>
                  <UncontrolledTooltip
                    placement='right'
                    target={`tooltipFBABoxesErrors${row.inventoryId}`}
                    popperClassName='bg-white shadow p-3 tw:rounded'
                    style={{ display: 'inline-table' }}
                    innerClassName='text-black bg-white p-0 position-relative'>
                    <p className='fs-6 text-primary m-0 p-0 fw-bold text-start mb-2'>SKU Errors</p>
                    <table className='table table-striped table-bordered table-sm table-responsive px-2 m-0'>
                      <tbody className='fs-7 text-start'>
                        {row.maxOrderQty <= 0 ? (
                          <tr>
                            <td>{`There's not enough stock to fill a master box`}</td>
                          </tr>
                        ) : null}
                        {!row.amzDimensions || row.amzDimensions.boxLength === 0 ? (
                          <tr>
                            <td>Box Length has to be greater than 0</td>
                          </tr>
                        ) : null}
                        {!row.amzDimensions || row.amzDimensions.boxWidth === 0 ? (
                          <tr>
                            <td>Box Width has to be greater than 0</td>
                          </tr>
                        ) : null}
                        {!row.amzDimensions || row.amzDimensions.boxHeight === 0 ? (
                          <tr>
                            <td>Box Height has to be greater than 0</td>
                          </tr>
                        ) : null}
                        {!row.amzDimensions || row.amzDimensions.boxWeight === 0 ? (
                          <tr>
                            <td>Box Weight is 0</td>
                          </tr>
                        ) : null}
                        {!row.amzDimensions || (row.boxWeight > 50 && row.boxQty > 1) ? (
                          <tr>
                            <td>Box Weight must not exceed 50 lb</td>
                          </tr>
                        ) : null}
                        {row.boxQty === 0 ? (
                          <tr>
                            <td>Box Quantity is 0</td>
                          </tr>
                        ) : null}
                        {row.hasDimensionsError && (
                          <tr>
                            <td>
                              {(() => {
                                const amzItemVolume = row.dimensions.package.length.value * row.dimensions.package.width.value * row.dimensions.package.height.value
                                const amzBoxVolume = amzItemVolume * row.boxQty
                                const amzBoxTenPercent = amzBoxVolume * 0.1
                                const scboxVolume = row.amzDimensions ? row.amzDimensions.boxLength * row.amzDimensions.boxWidth * row.amzDimensions.boxHeight : 0
                                if (scboxVolume < amzBoxVolume - amzBoxTenPercent) {
                                  return (
                                    <>
                                      <p className='m-0 p-0'>{`ShelfCloud Box dimensions do not meet the expected minimum volume ${FormatIntPercentage(
                                        state.currentRegion,
                                        amzBoxVolume
                                      )} - 10%:`}</p>
                                      <p className='m-0 p-0 tw:text-[var(--bs-secondary-color)] tw:text-nowrap'>
                                        Amazon Box Volume:{' '}
                                        <span className='text-black tw:font-semibold'>{FormatIntPercentage(state.currentRegion, amzBoxVolume - amzBoxTenPercent)} inch3</span>
                                      </p>
                                      <p className='m-0 p-0 tw:text-[var(--bs-secondary-color)] tw:text-nowrap'>
                                        ShelfCloud Box Volume: <span className='text-black tw:font-semibold'>{FormatIntPercentage(state.currentRegion, scboxVolume)} inch3</span>
                                      </p>
                                    </>
                                  )
                                } else {
                                  return null
                                }
                              })()}
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </UncontrolledTooltip>
                </>
              )}
            </p> */}
          </div>
        )
      },
      sortable: true,
      wrap: false,
      center: true,
      sortFunction: (rowA: AmazonFulfillmentSku, rowB: AmazonFulfillmentSku) => sortStringsLocaleCompare(rowA.shelfcloud_sku, rowB.shelfcloud_sku),
      compact: true,
    },
    {
      name: <span className='tw:font-bold tw:text-[11.2px]'>Type</span>,
      selector: (cell: any) => {
        if (cell.isKit) {
          return <span className='badge tw:uppercase tw:bg-[color-mix(in_srgb,var(--bs-info)_10%,transparent)] tw:text-info tw:p-2'>kit</span>
        } else {
          return <span className='badge tw:uppercase tw:bg-[color-mix(in_srgb,var(--bs-primary)_10%,transparent)] tw:text-primary tw:p-2'>product</span>
        }
      },
      sortable: true,
      compact: true,
      center: true,
      sortFunction: (rowA: AmazonFulfillmentSku, rowB: AmazonFulfillmentSku) => sortBooleans(rowA.isKit, rowB.isKit),
    },
    {
      name: <span className='tw:font-bold tw:text-[11.2px]'>Amazon FBA</span>,
      selector: (row: AmazonFulfillmentSku) => {
        return (
          <div className='tw:flex tw:flex-col tw:justify-start tw:items-start tw:my-1 tw:text-[11.2px]'>
            <span className='tw:m-0 tw:p-0 tw:font-semibold'>
              <span className='tw:text-[var(--bs-secondary-color)] tw:font-light'>Fulfillable: </span>
              {FormatIntNumber(state.currentRegion, row.afn_fulfillable_quantity)}
            </span>
            <span className='tw:m-0 tw:p-0 tw:font-semibold'>
              <span className='tw:text-[var(--bs-secondary-color)] tw:font-light'>Reserved: </span>
              {FormatIntNumber(state.currentRegion, row.afn_reserved_quantity)}
            </span>
            <span className='tw:m-0 tw:p-0 tw:font-semibold'>
              <span className='tw:text-[var(--bs-secondary-color)] tw:font-light'>Unsellable: </span>
              {FormatIntNumber(state.currentRegion, row.afn_unsellable_quantity)}
            </span>
            <div className='tw:m-0 tw:p-0 tw:font-semibold tw:flex tw:flex-row tw:justify-end tw:items-center tw:gap-1'>
              <span className='tw:text-[var(--bs-secondary-color)] tw:font-light'>Inbound: </span>
              {FormatIntNumber(state.currentRegion, row.afn_inbound_receiving_quantity + row.afn_inbound_shipped_quantity + row.afn_inbound_working_quantity)}
              {row.fbaShipments.length > 0 && (
                <Button
                  color='light'
                  outline
                  className='tw:p-0 tw:m-0 btn btn-sm btn-icon btn-ghost-info'
                  onClick={() => setinboundFBAHistoryModal({ show: true, sku: row.shelfcloud_sku, msku: row.msku, shipments: row.fbaShipments })}>
                  <i className='ri-information-fill tw:p-0 tw:m-0 tw:text-[13px] tw:text-info' />
                </Button>
              )}
            </div>
          </div>
        )
      },
      sortable: true,
      left: true,
      compact: true,
      width: '100px',
      minWidth: 'fit-content',
      sortFunction: (rowA: AmazonFulfillmentSku, rowB: AmazonFulfillmentSku) => sortNumbers(rowA.afn_fulfillable_quantity, rowB.afn_fulfillable_quantity),
    },
    {
      name: <span className='tw:font-bold tw:text-[11.2px]'>Amazon AWD</span>,
      selector: (row: AmazonFulfillmentSku) => {
        return (
          <div className='tw:flex tw:flex-col tw:justify-start tw:items-start tw:my-1 tw:text-[11.2px]'>
            <span className='tw:m-0 tw:p-0 tw:font-semibold'>
              <span className='tw:text-[var(--bs-secondary-color)] tw:font-light'>On Hand: </span>
              {FormatIntNumber(state.currentRegion, row.awd_onHand_qty)}
            </span>
            <span className='tw:m-0 tw:p-0 tw:font-semibold'>
              <span className='tw:text-[var(--bs-secondary-color)] tw:font-light'>Inbound: </span>
              {FormatIntNumber(state.currentRegion, row.awd_inbound_qty)}
            </span>
          </div>
        )
      },
      sortable: true,
      left: true,
      compact: true,
      width: '100px',
      minWidth: 'fit-content',
      sortFunction: (rowA: AmazonFulfillmentSku, rowB: AmazonFulfillmentSku) => sortNumbers(rowA.awd_onHand_qty, rowB.awd_onHand_qty),
    },
    {
      name: (
        <div>
          <p className='tw:m-0 tw:mb-1 tw:font-bold tw:text-[11.2px] tw:text-center'>FBA Sales</p>
        </div>
      ),
      selector: (row: AmazonFulfillmentSku) => {
        return (
          <div className='tw:flex tw:flex-row tw:justify-start tw:items-center tw:gap-2 tw:my-2 tw:text-[11.2px]'>
            <div className='tw:flex tw:flex-col tw:justify-start tw:items-center tw:gap-2' style={{ overflow: 'unset', textOverflow: 'unset' }}>
              <div>
                <span className='tw:font-semibold'>1D: </span>
                <span>{FormatIntNumber(state.currentRegion, row.totalUnitsSold['1D'])}</span>
              </div>
              <div>
                <span className='tw:font-semibold'>3D: </span>
                <span>{FormatIntNumber(state.currentRegion, row.totalUnitsSold['3D'])}</span>
              </div>
              <div>
                <span className='tw:font-semibold'>7D: </span>
                <span>{FormatIntNumber(state.currentRegion, row.totalUnitsSold['7D'])}</span>
              </div>
            </div>
            <div className='tw:flex tw:flex-col tw:justify-center tw:items-center tw:gap-2' style={{ overflow: 'unset', textOverflow: 'unset' }}>
              <div>
                <span className='tw:font-semibold'>15D: </span>
                <span>{FormatIntNumber(state.currentRegion, row.totalUnitsSold['15D'])}</span>
              </div>
              <div>
                <span className='tw:font-semibold'>30D: </span>
                <span>{FormatIntNumber(state.currentRegion, row.totalUnitsSold['30D'])}</span>
              </div>
              <div>
                <span className='tw:font-semibold'>60D: </span>
                <span>{FormatIntNumber(state.currentRegion, row.totalUnitsSold['60D'])}</span>
              </div>
            </div>
          </div>
        )
      },
      wrap: false,
      sortable: false,
      center: true,
      compact: true,
      minWidth: 'fit-content',
      width: '140px',
    },
    {
      name: <span className='tw:font-bold tw:text-[11.2px] tw:text-center'>Warehouse Qty</span>,
      selector: (cell: AmazonFulfillmentSku) => {
        if (cell.isKit) {
          return <span className='tw:text-info tw:text-[11.2px]'>{FormatIntNumber(state.currentRegion, cell.quantity)}</span>
        }
        return (
          <>
            <Button
              tabIndex={-1}
              color='info'
              outline
              className='btn btn-ghost-info tw:text-[11.2px]'
              id={`reservedMasterQty${CleanSpecialCharacters(cell.sku)}`}
              onClick={() => {
                setModalProductInfo(cell.inventoryId, cell.sku)
              }}>
              {FormatIntNumber(state.currentRegion, cell.quantity < 0 ? 0 : cell.quantity)}
            </Button>
            <UncontrolledTooltip placement='right' target={`reservedMasterQty${CleanSpecialCharacters(cell.sku)}`}>
              {`Reserved ${cell.reserved}`}
            </UncontrolledTooltip>
          </>
        )
      },
      sortable: true,
      compact: true,
      center: true,
      wrap: false,
      width: '100px',
      minWidth: 'fit-content',
      sortFunction: (rowA: AmazonFulfillmentSku, rowB: AmazonFulfillmentSku) => sortNumbers(rowA.quantity, rowB.quantity),
    },
    {
      name: <span className='tw:font-bold tw:text-[11.2px]'>Qty/Box</span>,
      selector: (row: AmazonFulfillmentSku) => row.boxQty,
      sortable: true,
      center: true,
      compact: true,
      width: '80px',
      minWidth: 'fit-content',
      style: {
        fontSize: '0.7rem',
      },
    },
    {
      name: <span className='tw:font-bold tw:text-[11.2px] tw:text-center'>Recommended Ship Date</span>,
      selector: (row: AmazonFulfillmentSku) => (row.recommendedShipDate ? moment.utc(row.recommendedShipDate).local().format('MMM DD') : 'N/A'),
      sortable: true,
      center: true,
      compact: true,
      width: '120px',
      minWidth: 'fit-content',
      style: {
        fontSize: '0.7rem',
      },
      conditionalCellStyles: [
        {
          when: (row: AmazonFulfillmentSku) => moment(row.recommendedShipDate).isBefore(moment().add(1, 'days'), 'day'),
          style: {
            backgroundColor: 'rgba(240, 101, 72, 0.25)',
            // color: 'white',
            // '&:hover': {
            //   cursor: 'pointer',
            // },
          },
        },
        {
          when: (row: AmazonFulfillmentSku) => moment(row.recommendedShipDate).isBetween(moment().add(1, 'days'), moment().add(7, 'days'), 'day'),
          style: {
            backgroundColor: 'rgba(247, 184, 75, 0.25)',
            // color: 'white',
            // '&:hover': {
            //   cursor: 'pointer',
            // },
          },
        },
      ],
      sortFunction: (rowA: AmazonFulfillmentSku, rowB: AmazonFulfillmentSku) => sortDates(rowA.recommendedShipDate, rowB.recommendedShipDate),
    },
    {
      name: <span className='tw:font-bold tw:text-[11.2px] tw:text-center'>Recommended Replenishment</span>,
      selector: (row: AmazonFulfillmentSku) => row.recommendedReplenishmentQty,
      sortable: true,
      center: true,
      compact: false,
      width: '150px',
      minWidth: 'fit-content',
      style: {
        fontSize: '0.7rem',
      },
    },
    {
      name: (
        <span className='tw:font-bold tw:text-[11.2px] tw:text-center'>
          Order Qty <br /> <span className='tw:text-nowrap'>(Master Boxes)</span>
        </span>
      ),
      selector: (row: AmazonFulfillmentSku) => {
        const rowValidation = rowValidationByMsku[row.msku]
        return (
          <>
            <DebounceInput
              type='number'
              minLength={1}
              debounceTimeout={300}
              disabled={row.hasError || row.maxOrderQty <= 0}
              className='form-control tw:text-[13px]'
              placeholder={row?.maxOrderQty! <= 0 ? 'Not Enough Qty' : 'Order Qty...'}
              value={row.orderQty}
              onClick={(e: any) => e.target.select()}
              onChange={(e) => {
                handleOrderQty(e.target.value, row.msku, row?.boxQty || 0)
              }}
              max={row.maxOrderQty}
              invalid={Boolean(rowValidation?.hasInputError)}
            />
            {rowValidation?.hasInputError ? (
              <FormFeedback className='tw:text-left tw:text-[11.2px]' type='invalid'>
                Quantity Error
              </FormFeedback>
            ) : null}
            {rowValidation?.hasExceededQtyError ? <span className='tw:text-[11.2px] tw:font-normal tw:text-danger tw:text-wrap'>Quantity Exceeded</span> : null}
            {rowValidation?.hasMissingAvailabilityError ? <span className='tw:text-[11.2px] tw:font-normal tw:text-danger tw:text-wrap'>Unable to verify available warehouse quantity</span> : null}
          </>
        )
      },
      sortable: false,
      center: true,
      compact: true,
      width: '110px',
      minWidth: 'fit-content',
      sortFunction: (rowA: AmazonFulfillmentSku, rowB: AmazonFulfillmentSku) => sortNumbers(Number(rowA.orderQty), Number(rowB.orderQty)),
    },
    {
      name: <span className='tw:font-bold tw:text-[11.2px] tw:text-center'>Total To Amazon</span>,
      selector: (row: AmazonFulfillmentSku) =>
        row.totalSendToAmazon > 0 ? (
          <div>
            <p className='tw:m-0 tw:text-center tw:font-semibold'>
              {FormatIntNumber(state.currentRegion, parseInt(row.orderQty))} <span className='tw:text-[11.2px] tw:font-normal'>{parseInt(row.orderQty) > 1 ? 'Boxes' : 'Box'}</span>
            </p>
            <p className='tw:m-0 tw:text-center tw:font-semibold'>
              {FormatIntNumber(state.currentRegion, row.totalSendToAmazon)} <span className='tw:text-[11.2px] tw:font-normal'>{row.totalSendToAmazon > 1 ? 'Units' : 'Unit'}</span>
            </p>
          </div>
        ) : (
          0
        ),
      sortable: true,
      center: true,
      compact: true,
    },
  ]

  return (
    <>
      <DataTable
        columns={columns}
        data={filteredItems}
        progressPending={pending}
        striped={true}
        defaultSortFieldId={10}
        defaultSortAsc={true}
        conditionalRowStyles={conditionalRowStyles}
        selectableRows
        onSelectedRowsChange={handleSelectedRows}
        clearSelectedRows={toggledClearRows}
        pagination={filteredItems.length > 100 ? true : false}
        paginationPerPage={100}
        paginationRowsPerPageOptions={[100, 200, 500]}
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

export default MasterBoxesTable
