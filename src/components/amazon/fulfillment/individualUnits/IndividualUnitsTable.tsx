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
  setinboundFBAHistoryModal: (prev: any) => void
}

const IndividualUnitsTable = ({ allData, filteredItems, setAllData, pending, setHasInputError, setHasQtyError, setinboundFBAHistoryModal }: Props) => {
  const { state, setModalProductInfo } = useContext(AppContext)

  useEffect(() => {
    return () => setHasInputError(false)
  }, [setHasInputError])

  useEffect(() => {
    return () => setHasQtyError(false)
  }, [setHasQtyError])

  const handleOrderQty = (value: string, msku: string) => {
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
          totalSendToAmazon: Number(value),
        }
      })
    )
  }

  const { exceededSkus, missingAvailabilitySkus } = useMemo(() => validateFulfillmentWarehouseUsage(allData, 'individual-units'), [allData])

  const rowValidationByMsku = useMemo(() => {
    return allData.reduce(
      (validationByMsku, row) => {
        const numericOrderQty = Number(row.orderQty)
        const hasPositiveOrderQty = numericOrderQty > 0
        const hasInvalidChildQty = row.isKit && (row.children ?? []).some((child) => !Number.isInteger(Number(child.qty)) || Number(child.qty) <= 0)
        const hasInputError =
          (hasPositiveOrderQty && row.hasIndividualUnitsDimensionsError) ||
          (hasPositiveOrderQty && (numericOrderQty < 0 || !Number.isInteger(numericOrderQty) || (!row.isKit && numericOrderQty > row.quantity))) ||
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
      when: (row: AmazonFulfillmentSku) => Number(row.quantity) <= 0,
      classNames: ['bg-warning/25'],
    },
    {
      when: (row: AmazonFulfillmentSku) => Number(row.orderQty) > 0,
      classNames: ['bg-success/25'],
    },
    {
      when: (row: AmazonFulfillmentSku) => {
        const rowValidation = rowValidationByMsku[row.msku]
        return Boolean(rowValidation?.hasInputError || rowValidation?.hasExceededQtyError || rowValidation?.hasMissingAvailabilityError)
      },
      classNames: ['bg-danger/25'],
    },
  ]

  const columns: any = [
    {
      name: <span className='font-bold text-[13px]'>Image</span>,
      selector: (row: AmazonFulfillmentSku) => {
        return (
          <Link href={row.isKit ? `/kit/${row.inventoryId}/${row.sku}` : `/product/${row.inventoryId}/${row.sku}`} target='blank' rel='noopener noreferrer' tabIndex={-1}>
            <div
              className='my-2'
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
      name: <span className='font-bold text-[13px]'>Amazon SKU Details</span>,
      selector: (row: AmazonFulfillmentSku) => {
        if (row.isKit) {
          return (
            <div className='flex flex-col justify-start items-start my-2'>
              <Link href={`/kit/${row.inventoryId}/${row.sku}`} style={{ cursor: 'pointer' }} target='blank' rel='noopener noreferrer' tabIndex={-1}>
                <p className='m-0 p-0 text-[11.2px] font-semibold text-black'>{row.title || `${row.product_name.substring(0, 80)}...`}</p>
              </Link>
              <div className='flex flex-wrap justify-start items-center'>
                <p className='m-0 p-0 text-[11.2px]'>{`${row.msku}`}</p>
                <i
                  className='ri-file-copy-line text-[13px] my-0 mx-1 p-0 text-[color:var(--bs-secondary-color)]'
                  style={{ cursor: 'pointer' }}
                  onClick={() => {
                    navigator.clipboard.writeText(row.msku)
                    toast('SKU copied!')
                  }}
                />
              </div>
              <div className='flex flex-wrap justify-start items-center'>
                <a
                  tabIndex={-1}
                  href={`https://www.amazon.${state.currentRegion == 'us' ? 'com' : 'es'}/dp/${row.asin}`}
                  target='blank'
                  rel='noopener noreferrer'
                  className='font-light text-[11.2px]'>
                  {`ASIN: ${row.asin}`}
                </a>
                <i
                  className='ri-file-copy-line text-[13px] my-0 mx-1 p-0 text-[color:var(--bs-secondary-color)]'
                  style={{ cursor: 'pointer' }}
                  onClick={() => {
                    navigator.clipboard.writeText(row.asin)
                    toast('ASIN copied!')
                  }}
                />
              </div>
              <p className='text-[11.2px] m-0 p-0 text-[var(--bs-secondary-color)]'>
                Label Owner: <span className='text-black'>{row.labelOwner}</span> Prep Owner: <span className='text-black'>{row.prepOwner}</span>
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
            <div className='flex flex-col justify-start items-start'>
              <Link href={`/product/${row.inventoryId}/${row.sku}`} style={{ cursor: 'pointer' }} target='blank' rel='noopener noreferrer' tabIndex={-1}>
                <p className='m-0 p-0 text-[11.2px] font-semibold text-black'>{row.title || `${row.product_name.substring(0, 80)}...`}</p>
              </Link>
              <div className='flex flex-wrap justify-start items-center'>
                <p className='m-0 p-0 text-[11.2px]'>{`${row.msku}`}</p>
                <i
                  className='ri-file-copy-line text-[13px] my-0 mx-1 p-0 text-[color:var(--bs-secondary-color)]'
                  style={{ cursor: 'pointer' }}
                  onClick={() => {
                    navigator.clipboard.writeText(row.msku)
                    toast('SKU copied!')
                  }}
                />
              </div>
              <div className='flex flex-wrap justify-start items-center'>
                <a
                  tabIndex={-1}
                  href={`https://www.amazon.${state.currentRegion == 'us' ? 'com' : 'es'}/dp/${row.asin}`}
                  target='blank'
                  rel='noopener noreferrer'
                  className='font-light text-[11.2px]'>
                  {`ASIN: ${row.asin}`}
                </a>
                <i
                  className='ri-file-copy-line text-[13px] my-0 mx-1 p-0 text-[color:var(--bs-secondary-color)]'
                  style={{ cursor: 'pointer' }}
                  onClick={() => {
                    navigator.clipboard.writeText(row.asin)
                    toast('ASIN copied!')
                  }}
                />
              </div>
              <p className='text-[11.2px] m-0 p-0 text-[var(--bs-secondary-color)]'>
                Label Owner: <span className='text-black'>{row.labelOwner}</span> Prep Owner: <span className='text-black'>{row.prepOwner}</span>
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
      name: <span className='font-bold text-[13px]'>SC SKU</span>,
      selector: (row: AmazonFulfillmentSku) => {
        return (
          <div className='text-center'>
            <p className='m-0 p-0 text-[11.2px]'>{row.shelfcloud_sku}</p>
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
      name: <span className='font-bold text-[13px]'>Type</span>,
      selector: (cell: any) => {
        if (cell.isKit) {
          return <span className='badge uppercase bg-[color-mix(in_srgb,var(--bs-info)_10%,transparent)] text-info p-2'>kit</span>
        } else {
          return <span className='badge uppercase bg-[color-mix(in_srgb,var(--bs-primary)_10%,transparent)] text-primary p-2'>product</span>
        }
      },
      sortable: true,
      compact: true,
      center: true,
      sortFunction: (rowA: AmazonFulfillmentSku, rowB: AmazonFulfillmentSku) => sortBooleans(rowA.isKit, rowB.isKit),
    },
    {
      name: <span className='font-bold text-[11.2px]'>Amazon FBA</span>,
      selector: (row: AmazonFulfillmentSku) => {
        return (
          <div className='flex flex-col justify-start items-start my-1 text-[11.2px]'>
            <span className='m-0 p-0 font-semibold'>
              <span className='text-[var(--bs-secondary-color)] font-light'>Fulfillable: </span>
              {FormatIntNumber(state.currentRegion, row.afn_fulfillable_quantity)}
            </span>
            <span className='m-0 p-0 font-semibold'>
              <span className='text-[var(--bs-secondary-color)] font-light'>Reserved: </span>
              {FormatIntNumber(state.currentRegion, row.afn_reserved_quantity)}
            </span>
            <span className='m-0 p-0 font-semibold'>
              <span className='text-[var(--bs-secondary-color)] font-light'>Unsellable: </span>
              {FormatIntNumber(state.currentRegion, row.afn_unsellable_quantity)}
            </span>
            <div className='m-0 p-0 font-semibold flex flex-row justify-end items-center gap-1'>
              <span className='text-[var(--bs-secondary-color)] font-light'>Inbound: </span>
              {FormatIntNumber(state.currentRegion, row.afn_inbound_receiving_quantity + row.afn_inbound_shipped_quantity + row.afn_inbound_working_quantity)}
              {row.fbaShipments.length > 0 && (
                <Button
                  color='light'
                  outline
                  className='p-0 m-0 btn btn-sm btn-icon btn-ghost-info'
                  onClick={() => setinboundFBAHistoryModal({ show: true, sku: row.shelfcloud_sku, msku: row.msku, shipments: row.fbaShipments })}>
                  <i className='ri-information-fill p-0 m-0 text-[13px] text-info' />
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
      name: <span className='font-bold text-[11.2px]'>Amazon AWD</span>,
      selector: (row: AmazonFulfillmentSku) => {
        return (
          <div className='flex flex-col justify-start items-start my-1 text-[11.2px]'>
            <span className='m-0 p-0 font-semibold'>
              <span className='text-[var(--bs-secondary-color)] font-light'>On Hand: </span>
              {FormatIntNumber(state.currentRegion, row.awd_onHand_qty)}
            </span>
            <span className='m-0 p-0 font-semibold'>
              <span className='text-[var(--bs-secondary-color)] font-light'>Inbound: </span>
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
          <p className='m-0 mb-1 font-bold text-[13px] text-center'>FBA Sales</p>
        </div>
      ),
      selector: (row: AmazonFulfillmentSku) => {
        return (
          <div className='flex flex-row justify-start items-center gap-2 my-2 text-[11.2px]'>
            <div className='flex flex-col justify-start items-center gap-2' style={{ overflow: 'unset', textOverflow: 'unset' }}>
              <div>
                <span className='font-semibold'>1D: </span>
                <span>{FormatIntNumber(state.currentRegion, row.totalUnitsSold['1D'])}</span>
              </div>
              <div>
                <span className='font-semibold'>3D: </span>
                <span>{FormatIntNumber(state.currentRegion, row.totalUnitsSold['3D'])}</span>
              </div>
              <div>
                <span className='font-semibold'>7D: </span>
                <span>{FormatIntNumber(state.currentRegion, row.totalUnitsSold['7D'])}</span>
              </div>
            </div>
            <div className='flex flex-col justify-center items-center gap-2' style={{ overflow: 'unset', textOverflow: 'unset' }}>
              <div>
                <span className='font-semibold'>15D: </span>
                <span>{FormatIntNumber(state.currentRegion, row.totalUnitsSold['15D'])}</span>
              </div>
              <div>
                <span className='font-semibold'>30D: </span>
                <span>{FormatIntNumber(state.currentRegion, row.totalUnitsSold['30D'])}</span>
              </div>
              <div>
                <span className='font-semibold'>60D: </span>
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
      name: <span className='font-bold text-[13px] text-center'>Warehouse Qty</span>,
      selector: (cell: AmazonFulfillmentSku) => {
        if (cell.isKit) {
          return <span className='text-info text-[11.2px]'>{FormatIntNumber(state.currentRegion, cell.quantity)}</span>
        }
        return (
          <>
            <Button
              tabIndex={-1}
              color='info'
              outline
              className='btn btn-ghost-info text-[11.2px]'
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
      name: <span className='font-bold text-[13px] text-center'>Recommended Ship Date</span>,
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
      name: <span className='font-bold text-[13px] text-center'>Recommended Replenishment</span>,
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
        <span className='font-bold text-[13px] text-center'>
          Order Qty <br /> (Individual Units)
        </span>
      ),
      selector: (row: AmazonFulfillmentSku) => {
        const rowValidation = rowValidationByMsku[row.msku]
        return (
          <>
            <DebounceInput
              type='number'
              minLength={1}
              onWheel={(e: any) => e.currentTarget.blur()}
              debounceTimeout={300}
              disabled={row.hasIndividualUnitsDimensionsError || row.quantity <= 0}
              className='form-control text-[13px]'
              placeholder={row?.quantity! <= 0 ? 'Not Enough Qty' : 'Order Qty...'}
              value={row.orderQty}
              onClick={(e: any) => e.target.select()}
              onChange={(e) => {
                handleOrderQty(e.target.value, row.msku)
              }}
              max={row.quantity}
              invalid={Boolean(rowValidation?.hasInputError)}
            />
            {rowValidation?.hasInputError ? (
              <FormFeedback className='text-left text-[11.2px]' type='invalid'>
                Quantity Error
              </FormFeedback>
            ) : null}
            {rowValidation?.hasExceededQtyError ? <span className='text-[11.2px] font-normal text-danger text-wrap'>Quantity Exceeded</span> : null}
            {rowValidation?.hasMissingAvailabilityError ? <span className='text-[11.2px] font-normal text-danger text-wrap'>Unable to verify available warehouse quantity</span> : null}
          </>
        )
      },
      sortable: false,
      center: true,
      compact: true,
      width: '130px',
      minWidth: 'fit-content',
    },
    {
      name: <span className='font-bold text-[13px] text-center'>Total To Amazon</span>,
      selector: (row: AmazonFulfillmentSku) =>
        row.totalSendToAmazon > 0 ? (
          <p className='m-0 text-[16.25px] text-center font-semibold'>
            {FormatIntNumber(state.currentRegion, row.totalSendToAmazon)} <span className='text-[11.2px] font-normal'>{row.totalSendToAmazon > 1 ? 'Units' : 'Unit'}</span>
          </p>
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
        defaultSortFieldId={9}
        defaultSortAsc={true}
        conditionalRowStyles={conditionalRowStyles}
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

export default IndividualUnitsTable
