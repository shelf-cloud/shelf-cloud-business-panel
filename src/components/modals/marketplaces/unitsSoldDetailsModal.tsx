import { Marketplace } from '@typesTs/marketplaces/productPerformance'
import React from 'react'
import DataTable from 'react-data-table-component'
import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap'

type Props = {
  showUnitsSoldDetailsModal: {
    showUnitsSoldDetailsModal: boolean
    totalUnitsSold: number
    sku: string
    title: string
    marketplacesData: { [key: string]: Marketplace }
  }
  setshowUnitsSoldDetailsModal: (prev: any) => void
}

function UnitsSoldDetailsModal({ showUnitsSoldDetailsModal, setshowUnitsSoldDetailsModal }: Props) {
  const sortedTableData = Object.values(showUnitsSoldDetailsModal.marketplacesData)
    .filter((market) => market.totalUnitsSold > 0)
    .sort((a, b) => {
      if (a.totalUnitsSold > b.totalUnitsSold) {
        return -1
      }
      if (a.totalUnitsSold < b.totalUnitsSold) {
        return 1
      }
      return 0
    })

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
    {
      name: <span className='fw-semibold fs-5'></span>,
      selector: (row: Marketplace) => `${((row.totalUnitsSold / showUnitsSoldDetailsModal.totalUnitsSold) * 100).toFixed(2)} %`,
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
          totalUnitsSold: 0,
          sku: '',
          title: '',
          marketplacesData: [],
        })
      }}>
      <ModalHeader
        toggle={() => {
          setshowUnitsSoldDetailsModal({
            showUnitsSoldDetailsModal: false,
            totalUnitsSold: 0,
            sku: '',
            title: '',
            marketplacesData: [],
          })
        }}>
        <p className='m-0 p-0 fw-bold fs-5'>Units Sold by Marketplace</p>
        <p className='m-0 p-0 fw-normal fs-5'>{showUnitsSoldDetailsModal.title}</p>
        <p className='m-0 p-0 fw-light fs-5'>{showUnitsSoldDetailsModal.sku}</p>
      </ModalHeader>
      <ModalBody>
        <DataTable columns={columns} data={sortedTableData} striped={true} highlightOnHover={true} dense />
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
