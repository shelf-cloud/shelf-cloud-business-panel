import { ReorderingPointsMarketplace } from '@typesTs/reorderingPoints/reorderingPoints'
import React from 'react'
import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap'

type Props = {
  salesModal: {
    showSalesModal: boolean
    sku: string
    title: string
    totalUnitsSold: { [key: string]: number }
    marketplaces: { [key: string]: ReorderingPointsMarketplace }
  }
  setSalesModal: (prev: any) => void
}

function ReorderingPointsSalesModal({ salesModal, setSalesModal }: Props) {
  return (
    <Modal
      fade={false}
      size='lg'
      id='unitsSoldDetailsModal'
      isOpen={salesModal.showSalesModal}
      toggle={() => {
        setSalesModal({
          showSalesModal: false,
          sku: '',
          title: '',
          totalUnitsSold: {},
          marketplaces: {},
        })
      }}>
      <ModalHeader
        toggle={() => {
          setSalesModal({
            showSalesModal: false,
            sku: '',
            title: '',
            totalUnitsSold: {},
            marketplaces: {},
          })
        }}>
        Orders by Marketplaces
      </ModalHeader>
      <ModalBody className='overflow-auto'>
        <p className='fs-5 fw-bold m-0 p-0'>
          SKU: <span className='text-primary'>{salesModal.sku}</span>
        </p>
        <p className='fs-6 p-0 fw-semibold'>{salesModal.title}</p>
        <div className='d-flex flex-row justify-content-evenly align-items-start gap-2 mb-5'>
          {/* 30 DAYS */}
          <div>
            <p className='fs-5 fw-bold text-center'>30 Days</p>
            <table className='table table-sm table-border table-nowrap mb-0 fs-7'>
              <thead>
                <tr>
                  <th>Marketpalce</th>
                  <th>Total Orders</th>
                </tr>
              </thead>
              <tbody>
                {Object.values(salesModal.marketplaces)
                  .sort((marketA, marketB) => (marketA.unitsSold['30D'] > marketB.unitsSold['30D'] ? -1 : 1))
                  .map(
                    (marketplace: ReorderingPointsMarketplace, index: number) =>
                      marketplace.unitsSold['30D'] > 0 && (
                        <tr key={index}>
                          <td>{marketplace.name}</td>
                          <td className='text-center'>{marketplace.unitsSold['30D']}</td>
                        </tr>
                      )
                  )}
              </tbody>
              <tfoot>
                <tr>
                  <td className='fw-bold text-end'>Total</td>
                  <td className='text-center'>{salesModal.totalUnitsSold['30D']}</td>
                </tr>
              </tfoot>
            </table>
          </div>
          {/* 60 DAYS */}
          <div>
            <p className='fs-5 fw-bold text-center'>60 Days</p>
            <table className='table table-sm table-border table-nowrap mb-0 fs-7'>
              <thead>
                <tr>
                  <th>Marketpalce</th>
                  <th>Total Orders</th>
                </tr>
              </thead>
              <tbody>
                {Object.values(salesModal.marketplaces)
                  .sort((marketA, marketB) => (marketA.unitsSold['60D'] > marketB.unitsSold['60D'] ? -1 : 1))
                  .map(
                    (marketplace: ReorderingPointsMarketplace, index: number) =>
                      marketplace.unitsSold['60D'] > 0 && (
                        <tr key={index}>
                          <td>{marketplace.name}</td>
                          <td className='text-center'>{marketplace.unitsSold['60D']}</td>
                        </tr>
                      )
                  )}
              </tbody>
              <tfoot>
                <tr>
                  <td className='fw-bold text-end'>Total</td>
                  <td className='text-center'>{salesModal.totalUnitsSold['60D']}</td>
                </tr>
              </tfoot>
            </table>
          </div>
          {/* 90 DAYS */}
          <div>
            <p className='fs-5 fw-bold text-center'>90 Days</p>
            <table className='table table-sm table-border table-nowrap mb-0 fs-7'>
              <thead>
                <tr>
                  <th>Marketpalce</th>
                  <th>Total Orders</th>
                </tr>
              </thead>
              <tbody>
                {Object.values(salesModal.marketplaces)
                  .sort((marketA, marketB) => (marketA.unitsSold['90D'] > marketB.unitsSold['90D'] ? -1 : 1))
                  .map(
                    (marketplace: ReorderingPointsMarketplace, index: number) =>
                      marketplace.unitsSold['90D'] > 0 && (
                        <tr key={index}>
                          <td>{marketplace.name}</td>
                          <td className='text-center'>{marketplace.unitsSold['90D']}</td>
                        </tr>
                      )
                  )}
              </tbody>
              <tfoot>
                <tr>
                  <td className='fw-bold text-end'>Total</td>
                  <td className='text-center'>{salesModal.totalUnitsSold['90D']}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
        <div className='d-flex flex-row justify-content-evenly align-items-start gap-2'>
          {/* 120 DAYS */}
          <div>
            <p className='fs-5 fw-bold text-center'>120 Days</p>
            <table className='table table-sm table-border table-nowrap mb-0 fs-7'>
              <thead>
                <tr>
                  <th>Marketpalce</th>
                  <th>Total Orders</th>
                </tr>
              </thead>
              <tbody>
                {Object.values(salesModal.marketplaces)
                  .sort((marketA, marketB) => (marketA.unitsSold['120D'] > marketB.unitsSold['120D'] ? -1 : 1))
                  .map(
                    (marketplace: ReorderingPointsMarketplace, index: number) =>
                      marketplace.unitsSold['120D'] > 0 && (
                        <tr key={index}>
                          <td>{marketplace.name}</td>
                          <td className='text-center'>{marketplace.unitsSold['120D']}</td>
                        </tr>
                      )
                  )}
              </tbody>
              <tfoot>
                <tr>
                  <td className='fw-bold text-end'>Total</td>
                  <td className='text-center'>{salesModal.totalUnitsSold['120D']}</td>
                </tr>
              </tfoot>
            </table>
          </div>
          {/* 180 DAYS */}
          <div>
            <p className='fs-5 fw-bold text-center'>180 Days</p>
            <table className='table table-sm table-border table-nowrap mb-0 fs-7'>
              <thead>
                <tr>
                  <th>Marketpalce</th>
                  <th>Total Orders</th>
                </tr>
              </thead>
              <tbody>
                {Object.values(salesModal.marketplaces)
                  .sort((marketA, marketB) => (marketA.unitsSold['180D'] > marketB.unitsSold['180D'] ? -1 : 1))
                  .map(
                    (marketplace: ReorderingPointsMarketplace, index: number) =>
                      marketplace.unitsSold['180D'] > 0 && (
                        <tr key={index}>
                          <td>{marketplace.name}</td>
                          <td className='text-center'>{marketplace.unitsSold['180D']}</td>
                        </tr>
                      )
                  )}
              </tbody>
              <tfoot>
                <tr>
                  <td className='fw-bold text-end'>Total</td>
                  <td className='text-center'>{salesModal.totalUnitsSold['180D']}</td>
                </tr>
              </tfoot>
            </table>
          </div>
          {/* 365 DAYS */}
          <div>
            <p className='fs-5 fw-bold text-center'>365 Days</p>
            <table className='table table-sm table-border table-nowrap mb-0 fs-7'>
              <thead>
                <tr>
                  <th>Marketpalce</th>
                  <th>Total Orders</th>
                </tr>
              </thead>
              <tbody>
                {Object.values(salesModal.marketplaces)
                  .sort((marketA, marketB) => (marketA.unitsSold['365D'] > marketB.unitsSold['365D'] ? -1 : 1))
                  .map(
                    (marketplace: ReorderingPointsMarketplace, index: number) =>
                      marketplace.unitsSold['365D'] > 0 && (
                        <tr key={index}>
                          <td>{marketplace.name}</td>
                          <td className='text-center'>{marketplace.unitsSold['365D']}</td>
                        </tr>
                      )
                  )}
              </tbody>
              <tfoot>
                <tr>
                  <td className='fw-bold text-end'>Total</td>
                  <td className='text-center'>{salesModal.totalUnitsSold['365D']}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </ModalBody>
      <ModalFooter>
        <Button
          color='light'
          onClick={() => {
            setSalesModal({
              showSalesModal: false,
              sku: '',
              title: '',
              totalUnitsSold: {},
              marketplaces: {},
            })
          }}>
          Close
        </Button>
      </ModalFooter>
    </Modal>
  )
}

export default ReorderingPointsSalesModal
