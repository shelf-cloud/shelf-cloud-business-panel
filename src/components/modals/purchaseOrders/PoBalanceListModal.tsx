 
import { useContext } from 'react'

import AppContext from '@context/AppContext'
import { FormatCurrency } from '@lib/FormatNumbers'
import { PoBalance } from '@typesTs/purchaseOrders'
import moment from 'moment'
import { Col, Modal, ModalBody, ModalHeader, Row } from 'reactstrap'

type Props = {
  poBalanceListModal: {
    show: boolean
  }
  poBalanceList: PoBalance[]
  setpoBalanceListModal: (prev: any) => void
}

const PoBalanceListModal = ({ poBalanceListModal, poBalanceList, setpoBalanceListModal }: Props) => {
  const { state }: any = useContext(AppContext)

  const totalOrderValue = poBalanceList.reduce((total, po) => total + po.totalOrderValue, 0)
  const totalPaid = poBalanceList.reduce((total, po) => total + po.totalPaid, 0)
  const totalArrivedQtyValue = poBalanceList.reduce((total, po) => total + po.totalArrivedQtyValue, 0)
  const balance = poBalanceList.reduce((total, po) => total + po.balance, 0)

  return (
    <Modal
      fade={false}
      size='lg'
      id='InboundFBAHistoryModal'
      isOpen={poBalanceListModal.show}
      toggle={() => {
        setpoBalanceListModal({
          show: false,
        })
      }}>
      <ModalHeader
        toggle={() => {
          setpoBalanceListModal({
            show: false,
          })
        }}
        className='modal-title'
        id='myModalLabel'>
        PO Balance List
      </ModalHeader>
      <ModalBody style={{ maxHeight: '80svh', scrollbarWidth: 'thin', overflowY: 'scroll' }}>
        <Row>
          <Col md={12} className='mt-2'>
            <table className='table table-striped table-bordered table-sm text-nowrap overflow-auto'>
              <thead className='table-light'>
                <tr>
                  <th>PO</th>
                  <th>Supplier</th>
                  <th>Date</th>
                  <th className='text-end'>Order Cost</th>
                  <th className='text-end'>Total Paid</th>
                  <th className='text-end'>Arrived Value</th>
                  <th className='text-end'>Balance</th>
                </tr>
              </thead>
              <tbody className='fs-7'>
                {poBalanceList.map((po, index: number) => (
                  <tr key={index}>
                    <td className='text-start'>{po.orderNumber}</td>
                    <td className='text-start'>{po.suppliersName}</td>
                    <td>{moment.utc(po.date).local().format('MM/DD/YYYY')}</td>
                    <td className='text-end'>{FormatCurrency(state.currentRegion, po.totalOrderValue)}</td>
                    <td className='text-end'>{FormatCurrency(state.currentRegion, po.totalPaid)}</td>
                    <td className='text-end'>{FormatCurrency(state.currentRegion, po.totalArrivedQtyValue)}</td>
                    <td className='text-end'>{FormatCurrency(state.currentRegion, po.balance)}</td>
                  </tr>
                ))}
                <tr className='bg-light'>
                  <td colSpan={3} className='fw-semibold text-end'>
                    TOTAL
                  </td>
                  <td className='fw-semibold text-end'>{FormatCurrency(state.currentRegion, totalOrderValue)}</td>
                  <td className='fw-semibold text-end'>{FormatCurrency(state.currentRegion, totalPaid)}</td>
                  <td className='fw-semibold text-end'>{FormatCurrency(state.currentRegion, totalArrivedQtyValue)}</td>
                  <td className='fw-semibold text-end'>{FormatCurrency(state.currentRegion, balance)}</td>
                </tr>
              </tbody>
            </table>
          </Col>
        </Row>
      </ModalBody>
    </Modal>
  )
}

export default PoBalanceListModal
