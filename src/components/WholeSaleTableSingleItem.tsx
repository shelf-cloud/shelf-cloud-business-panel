/* eslint-disable @next/next/no-img-element */
/* eslint-disable react-hooks/exhaustive-deps */
import { useContext, useEffect, useState } from 'react'

import AppContext from '@context/AppContext'
import { CleanSpecialCharacters } from '@lib/SkuFormatting'
import { NoImageAdress } from '@lib/assetsConstants'
import { sortBooleans, sortNumbers, sortStringsLocaleCompare } from '@lib/helperFunctions'
import { wholesaleProductRow } from '@typings'
import DataTable from '@components/Common/DataTableSC'
import { DebounceInput } from 'react-debounce-input'
import { Button, FormFeedback, UncontrolledTooltip } from '@/components/migration-ui'

type Props = {
  allData: wholesaleProductRow[]
  filteredItems: wholesaleProductRow[]
  setAllData: (allData: wholesaleProductRow[]) => void
  pending: boolean
  setError: (skus: any) => void
  setHasQtyError: (hasQtyError: boolean) => void
}

const WholeSaleTableSingleItem = ({ allData, filteredItems, setAllData, pending, setError, setHasQtyError }: Props) => {
  const { setModalProductInfo } = useContext(AppContext)
  const [skusWithError, setSkusWithError] = useState<{ [key: string]: boolean }>({})

  useEffect(() => {
    Object.keys(skusWithError).length > 0 && setHasQtyError(true)
    return () => {
      setHasQtyError(false)
    }
  }, [skusWithError])

  const handleOrderQty = (value: string, sku: string) => {
    if (Number(value) == 0 || value == '') {
      const newData: any = allData.map((item) => {
        if (item.sku === sku) {
          item.orderQty = ''
          item.totalToShip = 0
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
      if (item.sku === sku) {
        item.orderQty = value
        item.totalToShip = totalQtyShip
        return item
      } else {
        return item
      }
    })
    setAllData(newData)
  }

  const checkQtyError = async (sku: string, addingQtyisKit: boolean) => {
    let currentQtyInOrder = {} as { [key: string]: number }
    let maxOrderQty = {} as { [key: string]: number }

    if (addingQtyisKit) {
      for await (const item of allData) {
        if (item.sku === sku) {
          for await (const child of item.children!) {
            if (!currentQtyInOrder[child.sku]) currentQtyInOrder[child.sku] = 0
            currentQtyInOrder[child.sku] += parseInt(item.orderQty) > 0 ? child.qty * parseInt(item.orderQty) : 0

            for await (const item of allData) {
              if (!item.isKit) {
                if (item.sku === child.sku) {
                  currentQtyInOrder[child.sku] += parseInt(item.orderQty) > 0 ? parseInt(item.orderQty) : 0
                  maxOrderQty[child.sku] = item.quantity.quantity!
                }
              }
            }
          }
        }
      }
    } else {
      currentQtyInOrder[sku] = 0
      maxOrderQty[sku] = 0

      for await (const item of allData) {
        if (item.isKit) {
          for await (const child of item.children!) {
            if (child.sku === sku) {
              currentQtyInOrder[sku] += parseInt(item.orderQty) > 0 ? child.qty * parseInt(item.orderQty) : 0
            }
          }
        } else {
          if (item.sku === sku) {
            currentQtyInOrder[sku] += parseInt(item.orderQty) > 0 ? parseInt(item.orderQty) : 0
            maxOrderQty[sku] = item.quantity.quantity!
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
      when: (row: wholesaleProductRow) => Number(row.orderQty) > 0,
      classNames: ['tw:bg-success bg-opacity-25'],
    },
    {
      when: (row: wholesaleProductRow) => Number(row.orderQty) < 0 || !Number.isInteger(Number(row.orderQty)),
      classNames: ['tw:bg-destructive bg-opacity-25'],
    },
    {
      when: (row: wholesaleProductRow) =>
        Number(row.orderQty) > (row?.quantity.quantity || 0) || skusWithError[row.sku] === true || row.children?.some((child) => skusWithError[child.sku] === true) === true,
      classNames: ['tw:bg-destructive bg-opacity-25'],
    },
  ]

  const columns: any = [
    {
      name: <span className='tw:font-semibold tw:text-[13px]'>Image</span>,
      selector: (row: wholesaleProductRow) => {
        return (
          <div
            style={{
              width: '60px',
              height: '40px',
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
        )
      },
      sortable: false,
      center: true,
      compact: true,
      width: '80px',
    },
    {
      name: (
        <span className='tw:font-semibold tw:text-[13px]'>
          Title
          <br />
          SKU
        </span>
      ),
      selector: (row: wholesaleProductRow) => {
        if (row.isKit) {
          return (
            <div className='tw:py-2'>
              <p className='tw:m-0 tw:font-semibold'>{row.title}</p>
              <p className='tw:m-0'>{row.sku}</p>
              <ul className='tw:m-0 tw:ps-4'>
                {row.children?.map((child) => (
                  <li className='tw:m-0 tw:text-[11.2px] tw:text-[var(--bs-secondary-color)]' key={child.idInventory}>{`${child.title} | ${child.sku} | Available: ${child.available} | Used: ${child.qty}`}</li>
                ))}
              </ul>
            </div>
          )
        } else {
          return (
            <div className='tw:py-2'>
              <p className='tw:m-0 tw:font-semibold'>{row.title}</p>
              <p className='tw:m-0'>{row.sku}</p>
            </div>
          )
        }
      },
      sortable: true,
      wrap: true,
      minWidth: '250px',
      grow: 2.5,
      sortFunction: (rowA: wholesaleProductRow, rowB: wholesaleProductRow) => sortStringsLocaleCompare(rowA.title, rowB.title),
      //   compact: true,
    },
    {
      name: (
        <span className='tw:font-semibold tw:text-[13px]'>
          ASIN
          <br />
          UPC
          <br />
          FNSKU
        </span>
      ),
      selector: (row: wholesaleProductRow) => {
        return (
          <div>
            <p className='tw:m-0 tw:text-[11.2px]'>{row.asin}</p>
            <p className='tw:m-0 tw:text-[11.2px]'>{row.barcode}</p>
            <p className='tw:m-0 tw:text-[11.2px]'>{row.fnSku}</p>
          </div>
        )
      },
      sortable: false,
      wrap: true,
      grow: 1,
      compact: true,
    },
    {
      name: <span className='tw:font-semibold tw:text-[13px]'>Type</span>,
      selector: (cell: any) => {
        if (cell.isKit) {
          return <span className='badge tw:uppercase tw:bg-[color-mix(in_srgb,var(--info)_10%,transparent)] tw:text-info tw:p-2'>kit</span>
        } else {
          return <span className='badge tw:uppercase tw:bg-[color-mix(in_srgb,var(--primary)_10%,transparent)] tw:text-primary tw:p-2'>product</span>
        }
      },
      sortable: true,
      compact: true,
      center: true,
      sortFunction: (a: wholesaleProductRow, b: wholesaleProductRow) => sortBooleans(a.isKit!, b.isKit!),
    },
    {
      name: <span className='tw:font-semibold tw:text-[13px]'>Quantity</span>,
      selector: (cell: any) => {
        if (cell.isKit) {
          return cell.quantity.quantity
        } else {
          return (
            <>
              <Button
                color='info'
                outline
                className='btn btn-ghost-info'
                id={`reservedSingleQty${CleanSpecialCharacters(cell.sku)}`}
                onClick={() => {
                  setModalProductInfo(cell.quantity.inventoryId, cell.quantity.sku)
                }}>
                {cell.quantity.quantity}
              </Button>
              <UncontrolledTooltip placement='right' target={`reservedSingleQty${CleanSpecialCharacters(cell.sku)}`}>
                {`Reserved ${cell.quantity.reserved}`}
              </UncontrolledTooltip>
            </>
          )
        }
      },
      sortable: true,
      compact: true,
      center: true,
      sortFunction: (a: wholesaleProductRow, b: wholesaleProductRow) => sortNumbers(a.quantity.quantity!, b.quantity.quantity!),
    },
    {
      name: (
        <span className='tw:font-semibold tw:text-[13px] tw:text-center'>
          Order Qty <br /> (Individual Units)
        </span>
      ),
      selector: (row: wholesaleProductRow) => {
        return (
          <>
            <DebounceInput
              type='number'
              minLength={1}
              debounceTimeout={300}
              disabled={(row?.quantity.quantity || 0) <= 0 ? true : false}
              className='form-control form-control-sm tw:text-[13px]'
              placeholder={(row?.quantity.quantity || 0) <= 0 ? 'Not Enough Qty' : 'Order Qty...'}
              value={row.orderQty}
              onChange={async (e) => {
                if (Number(e.target.value) < 0 || !Number.isInteger(Number(e.target.value)) || parseInt(e.target.value) > row?.quantity.quantity) {
                  document.getElementById(`ErrorSingle-${row.sku}`)!.style.display = 'block'
                  setError((prev: string[]) => [...prev, row.sku])
                  handleOrderQty(e.target.value, row.sku)
                  await checkQtyError(row.sku, row.isKit!)
                } else {
                  document.getElementById(`ErrorSingle-${row.sku}`)!.style.display = 'none'
                  setError((prev: string[]) => prev.filter((sku) => sku !== row.sku))
                  handleOrderQty(e.target.value, row.sku)
                  await checkQtyError(row.sku, row.isKit!)
                }
              }}
              max={row.quantity.quantity}
              invalid={Number(row.orderQty) > (row?.quantity.quantity || 0) ? true : false}
            />
            {Number(row.orderQty) > (row?.quantity.quantity || 0) ? (
              <FormFeedback className='tw:text-left' type='invalid'>
                Not enough quantity!
              </FormFeedback>
            ) : null}
            <span className='tw:text-[13px] tw:font-normal tw:text-danger' id={`ErrorSingle-${row.sku}`} style={{ display: 'none' }}>
              Quantity Error
            </span>
            <span
              className='tw:text-[13px] tw:font-normal tw:text-danger'
              id={`ErrorQty-${row.sku}`}
              style={skusWithError[row.sku] === true || row.children?.some((child) => skusWithError[child.sku] === true) === true ? {} : { display: 'none' }}>
              Available Quantity Exceeded
            </span>
          </>
        )
      },
      sortable: false,
      center: true,
      compact: true,
    },
    {
      name: <span className='tw:font-semibold tw:text-[13px]'>Total To Ship</span>,
      selector: (row: wholesaleProductRow) => Number(row.totalToShip).toFixed(0),
      sortable: true,
      center: true,
      compact: true,
    },
  ]

  return (
    <>
      <DataTable columns={columns} data={filteredItems} progressPending={pending} striped={true} defaultSortFieldId={2} conditionalRowStyles={conditionalRowStyles} />
    </>
  )
}

export default WholeSaleTableSingleItem
