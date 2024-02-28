import { Marketplace } from '@typesTs/marketplaces/productPerformance'
import React from 'react'
import DataTable from 'react-data-table-component'
import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap'

type Props = {
  showUnitsSoldDetailsModal: {
    showUnitsSoldDetailsModal: boolean
    marketplacesData: { [key: string]: Marketplace }
  }
  setshowUnitsSoldDetailsModal: (prev: any) => void
}

function UnitsSoldDetailsModal({ showUnitsSoldDetailsModal, setshowUnitsSoldDetailsModal }: Props) {
  const columns: any = [
    {
      name: <span className='fw-semibold fs-5'>Marketplace</span>,
      selector: (row: Marketplace) => row.name,
      sortable: true,
      center: true,
    },
    {
      name: <span className='fw-semibold fs-5'>Units Sold</span>,
      selector: (row: Marketplace) => row.totalUnitsSold,
      sortable: true,
      center: true,
    },
  ]
  return (
    <Modal
      fade={false}
      size='md'
      id='unitsSoldDetailsModal'
      isOpen={showUnitsSoldDetailsModal.showUnitsSoldDetailsModal}
      toggle={() => {
        setshowUnitsSoldDetailsModal({
          showUnitsSoldDetailsModal: false,
          marketplacesData: [],
        })
      }}>
      <ModalHeader
        toggle={() => {
          setshowUnitsSoldDetailsModal({
            showUnitsSoldDetailsModal: false,
            marketplacesData: [],
          })
        }}>
        <p className='modal-title fs-3' id='myModalLabel'>
          Unist Solds By Marketplace
        </p>
      </ModalHeader>
      <ModalBody>
        <DataTable
          columns={columns}
          data={Object.values(showUnitsSoldDetailsModal.marketplacesData).filter((market) => market.totalUnitsSold > 0)}
          striped={true}
          highlightOnHover={true}
          dense
        />
      </ModalBody>
      <ModalFooter>
        <Button
          color='light'
          onClick={() => {
            setshowUnitsSoldDetailsModal({
              showUnitsSoldDetailsModal: false,
              marketplacesData: [],
            })
          }}>
          Close
        </Button>
      </ModalFooter>
    </Modal>
  )
}

export default UnitsSoldDetailsModal
