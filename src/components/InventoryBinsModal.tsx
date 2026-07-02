import { useContext } from 'react'

import AppContext from '@context/AppContext'
import axios from 'axios'
import DataTable from 'react-data-table-component'
// import { Product, RowType } from '@typings'
import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from '@/components/migration-ui'
import useSWR from 'swr'

export interface InventoryBinsResponse {
  error: boolean
  message: string
  warehouses: { [warehouseId: string]: Warehouse }
}

export interface Warehouse {
  name: string
  address: string
  bins: Bin[]
}

export interface Bin {
  qty: number
  idInventory: number
  idInventoryQuantities: number
  idBin: number
  binName: string
}

const fetcher = (endPoint: string) => axios<InventoryBinsResponse>(endPoint).then((res) => res.data)

function InventoryBinsModal() {
  const { state, setshowInventoryBinsModal } = useContext(AppContext)

  const { data, isValidating } = useSWR(
    state.user.businessId
      ? `/api/products/getProductInventoryBins?region=${state.currentRegion}&inventoryId=${state.modalProductInfo.inventoryId}&businessId=${state.user.businessId}`
      : null,
    fetcher,
    {
      revalidateOnFocus: false,
    }
  )

  const columns: any = [
    {
      name: <span className='tw:font-bold tw:text-[13px]'>Bin</span>,
      selector: (row: { binName: any }) => row.binName,
      sortable: true,
      center: true,
    },
    {
      name: <span className='tw:font-bold tw:text-[13px]'>Quantity</span>,
      selector: (row: { qty: any }) => row.qty,
      sortable: true,
      center: true,
    },
  ]

  return (
    <Modal
      id='myModal'
      isOpen={state.showInventoryBinsModal}
      toggle={() => {
        setshowInventoryBinsModal(!state.showInventoryBinsModal)
      }}>
      <ModalHeader
        className='tw:flex tw:justify-between tw:items-start'
        toggle={() => {
          setshowInventoryBinsModal(!state.showInventoryBinsModal)
        }}>
        <p className='modal-title tw:text-[19.5px]' id='myModalLabel'>
          Warehouse Inventory
        </p>
        <p className='tw:text-[16.25px]'>
          Sku: <span className='tw:text-primary'>{state.modalProductInfo.sku}</span>
        </p>
      </ModalHeader>
      <ModalBody className='tw:flex tw:flex-col tw:gap-4'>
        {!data && isValidating && <p className='tw:text-center tw:text-[16.25px] tw:font-bold'>Loading...</p>}
        {data && Object.values(data.warehouses).every((warehouse) => warehouse.bins.length === 0) && (
          <p className='tw:text-center tw:text-[13px] tw:font-normal'>No inventory quantities found for this product.</p>
        )}
        {data &&
          Object.values(data.warehouses).map((warehouse) => {
            if (!warehouse.bins || warehouse.bins.length === 0) return null
            return (
              <div key={warehouse.address}>
                <h5 className='tw:font-bold tw:mb-0'>{warehouse.name}</h5>
                <p className='tw:m-0 tw:text-[var(--bs-secondary-color)] tw:text-[11.2px]'>{warehouse.address}</p>
                <DataTable columns={columns} data={warehouse.bins} progressPending={isValidating} striped={true} highlightOnHover={true} dense />
              </div>
            )
          })}
      </ModalBody>
      <ModalFooter>
        <Button
          color='light'
          onClick={() => {
            setshowInventoryBinsModal(!state.showInventoryBinsModal)
          }}>
          Close
        </Button>
      </ModalFooter>
    </Modal>
  )
}

export default InventoryBinsModal
