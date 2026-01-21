/* eslint-disable @next/next/no-img-element */
import Link from 'next/link'
import { useContext, useEffect, useState } from 'react'

import AppContext from '@context/AppContext'
import { FormatIntNumber } from '@lib/FormatNumbers'
import { CleanSpecialCharacters } from '@lib/SkuFormatting'
import { NoImageAdress } from '@lib/assetsConstants'
import { sortBooleans, sortDates, sortNumbers, sortStringsLocaleCompare } from '@lib/helperFunctions'
import { AmazonFulfillmentSku } from '@typesTs/amazon/fulfillments'
import moment from 'moment'
import DataTable from 'react-data-table-component'
import { DebounceInput } from 'react-debounce-input'
import { toast } from 'react-toastify'
import { Button, FormFeedback, UncontrolledTooltip } from 'reactstrap'

type Props = {
  allData: AmazonFulfillmentSku[]
  filteredItems: AmazonFulfillmentSku[]
  setAllData: (allData: AmazonFulfillmentSku[]) => void
  pending: boolean
  setError: (skus: any) => void
  setHasQtyError: (hasQtyError: boolean) => void
  setinboundFBAHistoryModal: (prev: any) => void
}

const IndividualUnitsTable = ({ allData, filteredItems, setAllData, pending, setError, setHasQtyError, setinboundFBAHistoryModal }: Props) => {
  const { state, setModalProductInfo } = useContext(AppContext)
  const [skusWithError, setSkusWithError] = useState<{ [key: string]: boolean }>({})

  useEffect(() => {
    Object.keys(skusWithError).length > 0 && setHasQtyError(true)
    return () => {
      setHasQtyError(false)
    }
  }, [skusWithError, setHasQtyError])

  const handleOrderQty = (value: string, msku: string) => {
    if (Number(value) == 0 || value == '') {
      const newData: any = allData.map((item) => {
        if (item.msku === msku) {
          item.orderQty = ''
          item.totalSendToAmazon = 0
          return item
        } else {
          return item
        }
      })

      setAllData(newData)
      return
    }
    const totalQtyShip = Number(value)
    const newData: any = allData.map((item) => {
      if (item.msku === msku) {
        item.orderQty = value
        item.totalSendToAmazon = totalQtyShip
        return item
      } else {
        return item
      }
    })
    setAllData(newData)
  }

  const checkQtyError = async (msku: string, shelfcloud_sku: string, addingQtyisKit: boolean) => {
    let currentQtyInOrder = {} as { [key: string]: number }
    let maxOrderQty = {} as { [key: string]: number }

    if (addingQtyisKit) {
      for await (const item of allData) {
        if (item.msku === msku) {
          for await (const child of item.children!) {
            if (!currentQtyInOrder[child.sku]) currentQtyInOrder[child.sku] = 0
            currentQtyInOrder[child.sku] += parseInt(item.orderQty) > 0 ? child.qty * parseInt(item.orderQty) : 0

            for await (const item of allData) {
              if (!item.isKit && item.shelfcloud_sku === child.sku) {
                currentQtyInOrder[child.sku] += parseInt(item.orderQty) > 0 ? parseInt(item.orderQty) : 0
                maxOrderQty[child.sku] = item.quantity!
              }
            }
          }
        }
      }
    } else {
      currentQtyInOrder[shelfcloud_sku] = 0
      maxOrderQty[shelfcloud_sku] = 0

      for await (const item of allData) {
        if (item.isKit) {
          for await (const child of item.children!) {
            if (child.sku === shelfcloud_sku) {
              currentQtyInOrder[shelfcloud_sku] += parseInt(item.orderQty) > 0 ? child.qty * parseInt(item.orderQty) : 0
            }
          }
        } else {
          if (item.shelfcloud_sku === shelfcloud_sku) {
            currentQtyInOrder[shelfcloud_sku] += parseInt(item.orderQty) > 0 ? parseInt(item.orderQty) : 0
            maxOrderQty[shelfcloud_sku] = item.quantity!
          }
        }
      }
    }

    for (const [currentSku, qty] of Object.entries(currentQtyInOrder)) {
      if (qty > maxOrderQty[currentSku]) {
        setSkusWithError((prev: any) => ({ ...prev, [currentSku]: true }))
      } else {
        setSkusWithError((prev: any) => {
          const { [currentSku]: x, ...rest } = prev
          return rest
        })
      }
    }
  }

  const conditionalRowStyles = [
    {
      when: (row: AmazonFulfillmentSku) => Number(row.quantity) <= 0,
      classNames: ['bg-warning bg-opacity-25'],
    },
    {
      when: (row: AmazonFulfillmentSku) => Number(row.orderQty) > 0,
      classNames: ['bg-success bg-opacity-25'],
    },
    {
      when: (row: AmazonFulfillmentSku) =>
        Number(row.orderQty) < 0 ||
        !Number.isInteger(Number(row.orderQty)) ||
        parseInt(row.orderQty) > row.quantity! ||
        skusWithError[row.shelfcloud_sku] === true ||
        row.hasIndividualUnitsDimensionsError,
      classNames: ['bg-danger bg-opacity-25'],
    },
  ]

  const columns: any = [
    {
      name: <span className='fw-bold fs-6'>Image</span>,
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
      name: <span className='fw-bold fs-6'>Amazon SKU Details</span>,
      selector: (row: AmazonFulfillmentSku) => {
        if (row.isKit) {
          return (
            <div className='d-flex flex-column justify-content-start align-items-start my-2'>
              <Link href={`/kit/${row.inventoryId}/${row.sku}`} style={{ cursor: 'pointer' }} target='blank' rel='noopener noreferrer' tabIndex={-1}>
                <p className='m-0 p-0 fs-7 fw-semibold text-black'>{row.title || `${row.product_name.substring(0, 80)}...`}</p>
              </Link>
              <div className='d-flex flex-wrap justify-content-start align-items-center'>
                <p className='m-0 p-0 fs-7'>{`${row.msku}`}</p>
                <i
                  className='ri-file-copy-line fs-6 my-0 mx-1 p-0 text-muted'
                  style={{ cursor: 'pointer' }}
                  onClick={() => {
                    navigator.clipboard.writeText(row.msku)
                    toast('SKU copied!')
                  }}
                />
              </div>
              <div className='d-flex flex-wrap justify-content-start align-items-center'>
                <a
                  tabIndex={-1}
                  href={`https://www.amazon.${state.currentRegion == 'us' ? 'com' : 'es'}/dp/${row.asin}`}
                  target='blank'
                  rel='noopener noreferrer'
                  className='fw-light fs-7'>
                  {`ASIN: ${row.asin}`}
                </a>
                <i
                  className='ri-file-copy-line fs-6 my-0 mx-1 p-0 text-muted'
                  style={{ cursor: 'pointer' }}
                  onClick={() => {
                    navigator.clipboard.writeText(row.asin)
                    toast('ASIN copied!')
                  }}
                />
              </div>
              <p className='fs-7 m-0 p-0 text-muted'>
                Label Owner: <span className='text-dark'>{row.labelOwner}</span> Prep Owner: <span className='text-dark'>{row.prepOwner}</span>
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
            <div className='d-flex flex-column justify-content-start align-items-start'>
              <Link href={`/product/${row.inventoryId}/${row.sku}`} style={{ cursor: 'pointer' }} target='blank' rel='noopener noreferrer' tabIndex={-1}>
                <p className='m-0 p-0 fs-7 fw-semibold text-black'>{row.title || `${row.product_name.substring(0, 80)}...`}</p>
              </Link>
              <div className='d-flex flex-wrap justify-content-start align-items-center'>
                <p className='m-0 p-0 fs-7'>{`${row.msku}`}</p>
                <i
                  className='ri-file-copy-line fs-6 my-0 mx-1 p-0 text-muted'
                  style={{ cursor: 'pointer' }}
                  onClick={() => {
                    navigator.clipboard.writeText(row.msku)
                    toast('SKU copied!')
                  }}
                />
              </div>
              <div className='d-flex flex-wrap justify-content-start align-items-center'>
                <a
                  tabIndex={-1}
                  href={`https://www.amazon.${state.currentRegion == 'us' ? 'com' : 'es'}/dp/${row.asin}`}
                  target='blank'
                  rel='noopener noreferrer'
                  className='fw-light fs-7'>
                  {`ASIN: ${row.asin}`}
                </a>
                <i
                  className='ri-file-copy-line fs-6 my-0 mx-1 p-0 text-muted'
                  style={{ cursor: 'pointer' }}
                  onClick={() => {
                    navigator.clipboard.writeText(row.asin)
                    toast('ASIN copied!')
                  }}
                />
              </div>
              <p className='fs-7 m-0 p-0 text-muted'>
                Label Owner: <span className='text-dark'>{row.labelOwner}</span> Prep Owner: <span className='text-dark'>{row.prepOwner}</span>
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
      name: <span className='fw-bold fs-6'>SC SKU</span>,
      selector: (row: AmazonFulfillmentSku) => {
        return (
          <div className='text-center'>
            <p className='m-0 p-0 fs-7'>{row.shelfcloud_sku}</p>
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
      name: <span className='fw-bold fs-6'>Type</span>,
      selector: (cell: any) => {
        if (cell.isKit) {
          return <span className='badge text-uppercase badge-soft-info p-2'>kit</span>
        } else {
          return <span className='badge text-uppercase badge-soft-primary p-2'>product</span>
        }
      },
      sortable: true,
      compact: true,
      center: true,
      sortFunction: (rowA: AmazonFulfillmentSku, rowB: AmazonFulfillmentSku) => sortBooleans(rowA.isKit, rowB.isKit),
    },
    {
      name: <span className='fw-bold fs-7'>Amazon FBA</span>,
      selector: (row: AmazonFulfillmentSku) => {
        return (
          <div className='d-flex flex-column justify-content-start align-items-start my-1 fs-7'>
            <span className='m-0 p-0 fw-semibold'>
              <span className='text-muted fw-light'>Fulfillable: </span>
              {FormatIntNumber(state.currentRegion, row.afn_fulfillable_quantity)}
            </span>
            <span className='m-0 p-0 fw-semibold'>
              <span className='text-muted fw-light'>Reserved: </span>
              {FormatIntNumber(state.currentRegion, row.afn_reserved_quantity)}
            </span>
            <span className='m-0 p-0 fw-semibold'>
              <span className='text-muted fw-light'>Unsellable: </span>
              {FormatIntNumber(state.currentRegion, row.afn_unsellable_quantity)}
            </span>
            <div className='m-0 p-0 fw-semibold d-flex flex-row justify-content-end align-items-center gap-1'>
              <span className='text-muted fw-light'>Inbound: </span>
              {FormatIntNumber(state.currentRegion, row.afn_inbound_receiving_quantity + row.afn_inbound_shipped_quantity + row.afn_inbound_working_quantity)}
              {row.fbaShipments.length > 0 && (
                <Button
                  color='light'
                  outline
                  className='p-0 m-0 btn btn-sm btn-icon btn-ghost-info'
                  onClick={() => setinboundFBAHistoryModal({ show: true, sku: row.shelfcloud_sku, msku: row.msku, shipments: row.fbaShipments })}>
                  <i className='ri-information-fill p-0 m-0 fs-6 text-info' />
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
      name: <span className='fw-bold fs-7'>Amazon AWD</span>,
      selector: (row: AmazonFulfillmentSku) => {
        return (
          <div className='d-flex flex-column justify-content-start align-items-start my-1 fs-7'>
            <span className='m-0 p-0 fw-semibold'>
              <span className='text-muted fw-light'>On Hand: </span>
              {FormatIntNumber(state.currentRegion, row.awd_onHand_qty)}
            </span>
            <span className='m-0 p-0 fw-semibold'>
              <span className='text-muted fw-light'>Inbound: </span>
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
          <p className='m-0 mb-1 fw-bold fs-6 text-center'>FBA Sales</p>
        </div>
      ),
      selector: (row: AmazonFulfillmentSku) => {
        return (
          <div className='d-flex flex-row justify-content-start align-items-center gap-2 my-2 fs-7'>
            <div className='d-flex flex-column justify-content-start align-items-center gap-2' style={{ overflow: 'unset', textOverflow: 'unset' }}>
              <div>
                <span className='fw-semibold'>1D: </span>
                <span>{FormatIntNumber(state.currentRegion, row.totalUnitsSold['1D'])}</span>
              </div>
              <div>
                <span className='fw-semibold'>3D: </span>
                <span>{FormatIntNumber(state.currentRegion, row.totalUnitsSold['3D'])}</span>
              </div>
              <div>
                <span className='fw-semibold'>7D: </span>
                <span>{FormatIntNumber(state.currentRegion, row.totalUnitsSold['7D'])}</span>
              </div>
            </div>
            <div className='d-flex flex-column justify-content-center align-items-center gap-2' style={{ overflow: 'unset', textOverflow: 'unset' }}>
              <div>
                <span className='fw-semibold'>15D: </span>
                <span>{FormatIntNumber(state.currentRegion, row.totalUnitsSold['15D'])}</span>
              </div>
              <div>
                <span className='fw-semibold'>30D: </span>
                <span>{FormatIntNumber(state.currentRegion, row.totalUnitsSold['30D'])}</span>
              </div>
              <div>
                <span className='fw-semibold'>60D: </span>
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
      name: <span className='fw-bold fs-6 text-center'>Warehouse Qty</span>,
      selector: (cell: AmazonFulfillmentSku) => {
        if (cell.isKit) {
          return <span className='text-info fs-7'>{FormatIntNumber(state.currentRegion, cell.quantity)}</span>
        }
        return (
          <>
            <Button
              tabIndex={-1}
              color='info'
              outline
              className='btn btn-ghost-info fs-7'
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
      name: <span className='fw-bold fs-6 text-center'>Recommended Ship Date</span>,
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
      name: <span className='fw-bold fs-6 text-center'>Recommended Replenishment</span>,
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
        <span className='fw-bold fs-6 text-center'>
          Order Qty <br /> (Individual Units)
        </span>
      ),
      selector: (row: AmazonFulfillmentSku) => {
        return (
          <>
            <DebounceInput
              type='number'
              minLength={1}
              onWheel={(e: any) => e.currentTarget.blur()}
              debounceTimeout={300}
              disabled={row.hasIndividualUnitsDimensionsError || row.quantity <= 0}
              className='form-control fs-6'
              placeholder={row?.quantity! <= 0 ? 'Not Enough Qty' : 'Order Qty...'}
              value={row.orderQty}
              onClick={(e: any) => e.target.select()}
              onChange={async (e) => {
                if (Number(e.target.value) < 0 || !Number.isInteger(Number(e.target.value)) || parseInt(e.target.value) > row.quantity!) {
                  document.getElementById(`Error-${row.msku}`)!.style.display = 'block'
                  setError((prev: string[]) => [...prev, row.msku])
                  handleOrderQty(e.target.value, row.msku)
                  await checkQtyError(row.msku, row.shelfcloud_sku, row.isKit!)
                } else {
                  document.getElementById(`Error-${row.msku}`)!.style.display = 'none'
                  setError((prev: string[]) => prev.filter((msku) => msku !== row.msku))
                  handleOrderQty(e.target.value, row.msku)
                  await checkQtyError(row.msku, row.shelfcloud_sku, row.isKit!)
                }
              }}
              max={row.quantity}
              invalid={Number(row.orderQty) > row.quantity! ? true : false}
            />
            {Number(row.orderQty) > row.quantity! ? (
              <FormFeedback className='text-start' type='invalid'>
                Not enough quantity!
              </FormFeedback>
            ) : null}
            <span className='fs-6 fw-normal text-danger' id={`Error-${row.msku}`} style={{ display: 'none' }}>
              Quantity Error
            </span>
            <span className='fs-6 fw-normal text-danger text-wrap' id={`ErrorQty-${row.msku}`} style={skusWithError[row.shelfcloud_sku] === true ? {} : { display: 'none' }}>
              Quantity Exceeded
            </span>
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
      name: <span className='fw-bold fs-6 text-center'>Total To Amazon</span>,
      selector: (row: AmazonFulfillmentSku) =>
        row.totalSendToAmazon > 0 ? (
          <p className='m-0 fs-5 text-center fw-semibold'>
            {FormatIntNumber(state.currentRegion, row.totalSendToAmazon)} <span className='fs-7 fw-normal'>{row.totalSendToAmazon > 1 ? 'Units' : 'Unit'}</span>
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
        defaultSortFieldId={8}
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
