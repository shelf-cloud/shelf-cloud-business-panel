import { useContext } from 'react'

import AppContext from '@context/AppContext'
import axios from 'axios'
import DataTable from 'react-data-table-component'
// import { Product, RowType } from '@typings'
import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap'
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
      name: <span className='fw-bolder fs-6'>Bin</span>,
      selector: (row: { binName: any }) => row.binName,
      sortable: true,
      center: true,
    },
    {
      name: <span className='fw-bolder fs-6'>Quantity</span>,
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
        className='flex justify-content-between align-items-start'
        toggle={() => {
          setshowInventoryBinsModal(!state.showInventoryBinsModal)
        }}>
        <p className='modal-title fs-4' id='myModalLabel'>
          Warehouse Inventory
        </p>
        <p className='fs-5'>
          Sku: <span className='text-primary'>{state.modalProductInfo.sku}</span>
        </p>
      </ModalHeader>
      <ModalBody className='d-flex flex-column gap-3'>
        {!data && isValidating && <p className='text-center fs-5 fw-bold'>Loading...</p>}
        {data && Object.values(data.warehouses).every((warehouse) => warehouse.bins.length === 0) && (
          <p className='text-center fs-6 fw-normal'>No inventory quantities found for this product.</p>
        )}
        {data &&
          Object.values(data.warehouses).map((warehouse) => {
            if (!warehouse.bins || warehouse.bins.length === 0) return null
            return (
              <div key={warehouse.address}>
                <h5 className='fw-bold mb-0'>{warehouse.name}</h5>
                <p className='m-0 text-muted fs-7'>{warehouse.address}</p>
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
