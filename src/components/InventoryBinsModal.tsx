import React, { useState, useEffect, useContext } from 'react'
import {
  Button,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from 'reactstrap'
import AppContext from '@context/AppContext'
import axios from 'axios'
// import { Product, RowType } from '@typings'
import DataTable from 'react-data-table-component'

type Props = {}

function InventoryBinsModal({}: Props) {
  const { state, setshowInventoryBinsModal }: any = useContext(AppContext)
  const [loading, setLoading] = useState(true)
  const [bins, setBins] = useState([])

  useEffect(() => {
    const bringProductBins = async () => {
      const response = await axios(
        `/api/getProductInventoryBins?inventoryId=${state.modalProductInfo.inventoryId}&businessId=${state.modalProductInfo.businessId}`
      )
      setBins(response.data)
      setLoading(false)
    }
    bringProductBins()
    return () => {
      setLoading(true)
      setBins([])
    }
  }, [state.modalProductInfo.businessId, state.modalProductInfo.inventoryId])

  const columns: any = [
    {
      name: <span className="fw-bolder fs-5">Bin</span>,
      selector: (row: { binName: any }) => row.binName,
      sortable: true,
      center: true,
    },
    {
      name: <span className="fw-bolder fs-5">Quantity</span>,
      selector: (row: { qty: any }) => row.qty,
      sortable: true,
      center: true,
    },
  ]
  return (
    <Modal
      id="myModal"
      isOpen={state.showInventoryBinsModal}
      toggle={() => {
        setshowInventoryBinsModal(!state.showInventoryBinsModal)
      }}
    >
      <ModalHeader
        toggle={() => {
          setshowInventoryBinsModal(!state.showInventoryBinsModal)
        }}
      >
        <p className="modal-title fs-3" id="myModalLabel">
          Current Warehouse Inventory
        </p>
        <p className='fs-5'>SKU: {state.modalProductInfo.sku}</p>
      </ModalHeader>
      <ModalBody>
        <DataTable
          columns={columns}
          data={bins}
          progressPending={loading}
          striped={true}
          highlightOnHover={true}
          dense
        />
      </ModalBody>
      <ModalFooter>
        <Button
          color="light"
          onClick={() => {
            setshowInventoryBinsModal(!state.showInventoryBinsModal)
          }}
        >
          Close
        </Button>
      </ModalFooter>
    </Modal>
  )
}

export default InventoryBinsModal
