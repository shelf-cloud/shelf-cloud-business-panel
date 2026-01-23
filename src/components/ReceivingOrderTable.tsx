/* eslint-disable @next/next/no-img-element */
import { useContext } from 'react'

import AppContext from '@context/AppContext'
import { ReceivingInventory } from '@hooks/receivings/useReceivingInventory'
import { FormatIntNumber } from '@lib/FormatNumbers'
import { NoImageAdress } from '@lib/assetsConstants'
import { sortNumbers, sortStringsCaseInsensitive } from '@lib/helperFunctions'
import DataTable from 'react-data-table-component'
import { DebounceInput } from 'react-debounce-input'
import { Button } from 'reactstrap'

type Props = {
  data: ReceivingInventory[]
  pending: boolean
  handleOrderQty: (value: number, sku: string) => void
}

const ReceivingOrderTable = ({ data, pending, handleOrderQty }: Props) => {
  const { state, setModalProductInfo } = useContext(AppContext)

  const conditionalRowStyles = [
    {
      when: (row: ReceivingInventory) => row.quantity > 0,
      classNames: ['bg-success bg-opacity-25'],
    },
    {
      when: (row: ReceivingInventory) => row.quantity < 0,
      classNames: ['bg-danger bg-opacity-25'],
    },
  ]

  const columns: any = [
    {
      name: <span className='fw-semibold fs-6'>Image</span>,
      selector: (row: ReceivingInventory) => {
        return (
          <div
            style={{
              width: '40px',
              height: '35px',
              margin: '8px 0px',
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
      name: <span className='fw-semibold fs-6'>Title</span>,
      selector: (row: ReceivingInventory) => <p className='fs-7 m-0 p-0'>{row.title}</p>,

      sortable: true,
      wrap: true,
      grow: 1.5,
      sortFunction: (rowA: ReceivingInventory, rowB: ReceivingInventory) => sortStringsCaseInsensitive(rowA.title, rowB.title),
    },
    {
      name: <span className='fw-semibold fs-6'>SKU</span>,
      selector: (row: ReceivingInventory) => <span className='fs-7'>{row.sku}</span>,
      sortable: true,
      wrap: false,
      compact: true,
      sortFunction: (rowA: ReceivingInventory, rowB: ReceivingInventory) => sortStringsCaseInsensitive(rowA.sku, rowB.sku),
    },
    {
      name: <span className='fw-semibold fs-6'>Supplier</span>,
      selector: (row: ReceivingInventory) => <span className='fs-7'>{row.suppliersName}</span>,
      sortable: true,
      wrap: false,
      compact: true,
      sortFunction: (rowA: ReceivingInventory, rowB: ReceivingInventory) => sortStringsCaseInsensitive(rowA.suppliersName, rowB.suppliersName),
    },
    {
      name: (
        <span className='fw-semibold fs-6 text-center'>
          Master Box <br />
          <span className='fs-7'>(Units/Box)</span>
        </span>
      ),
      selector: (row: ReceivingInventory) => <span className='fs-7'>{FormatIntNumber(state.currentRegion, row.boxQty)}</span>,
      sortable: true,
      center: true,
      wrap: false,
      compact: true,
      sortFunction: (rowA: ReceivingInventory, rowB: ReceivingInventory) => sortNumbers(rowA.boxQty, rowB.boxQty),
    },
    {
      name: <span className='fw-semibold fs-6 text-center'>Inventory</span>,
      selector: (row: ReceivingInventory) => {
        return (
          <Button
            color='info'
            outline
            size='sm'
            className='btn btn-ghost-info'
            onClick={() => {
              setModalProductInfo(row.inventoryId, row.sku)
            }}>
            {FormatIntNumber(state.currentRegion, row.inventoryQuantity)}
          </Button>
        )
      },
      sortable: true,
      compact: true,
      center: true,
      sortFunction: (rowA: ReceivingInventory, rowB: ReceivingInventory) => sortNumbers(rowA.inventoryQuantity, rowB.inventoryQuantity),
    },
    {
      name: (
        <span className='fw-semibold fs-6 text-center'>
          Receiving <br /> Quantity
        </span>
      ),
      selector: (row: ReceivingInventory) => {
        return (
          <>
            <DebounceInput
              type='number'
              minLength={0}
              debounceTimeout={200}
              className='form-control form-control-sm fs-6 mt-1'
              placeholder={'Receiving Qty...'}
              value={row.quantity}
              onFocus={(e: React.FocusEvent<HTMLInputElement>) => e.target.select()}
              onChange={(e) => {
                const inputValue = e.target.value === '' ? 0 : parseInt(e.target.value)
                if (inputValue < 0) {
                  document.getElementById(`Error-${row.sku}`)!.style.display = 'block'
                  handleOrderQty(inputValue, row.sku)
                } else {
                  document.getElementById(`Error-${row.sku}`)!.style.display = 'none'
                  handleOrderQty(inputValue, row.sku)
                }
              }}
              min={0}
            />
            <span className='fs-7 fw-normal text-danger' id={`Error-${row.sku}`} style={{ display: 'none' }}>
              Quantity Error
            </span>
          </>
        )
      },
      sortable: false,
      center: true,
      compact: true,
    },
  ]

  return (
    <>
      <DataTable columns={columns} data={data} progressPending={pending} striped={true} defaultSortFieldId={2} conditionalRowStyles={conditionalRowStyles} dense />
    </>
  )
}

export default ReceivingOrderTable
