 
import { useContext } from 'react'

import AppContext from '@context/AppContext'
import { FormatCurrency } from '@lib/FormatNumbers'
import { PoBalance } from '@typesTs/purchaseOrders'
import moment from 'moment'
import { Col, Modal, ModalBody, ModalHeader, Row } from '@/components/migration-ui'

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
            <div className='overflow-x-auto'>
              <table className='w-full align-middle mb-0 text-nowrap border [&_tbody_tr:nth-child(odd)]:bg-[color:var(--vz-light)] [&_th]:px-2 [&_th]:py-1 [&_td]:px-2 [&_td]:py-1'>
                <thead className='bg-[color:var(--vz-light)]'>
                  <tr>
                    <th>PO</th>
                    <th>Supplier</th>
                    <th>Date</th>
                    <th className='text-right'>Order Cost</th>
                    <th className='text-right'>Total Paid</th>
                    <th className='text-right'>Arrived Value</th>
                    <th className='text-right'>Balance</th>
                  </tr>
                </thead>
                <tbody className='text-[11.2px]'>
                  {poBalanceList.map((po, index: number) => (
                    <tr key={index}>
                      <td className='text-left'>{po.orderNumber}</td>
                      <td className='text-left'>{po.suppliersName}</td>
                      <td>{moment.utc(po.date).local().format('MM/DD/YYYY')}</td>
                      <td className='text-right'>{FormatCurrency(state.currentRegion, po.totalOrderValue)}</td>
                      <td className='text-right'>{FormatCurrency(state.currentRegion, po.totalPaid)}</td>
                      <td className='text-right'>{FormatCurrency(state.currentRegion, po.totalArrivedQtyValue)}</td>
                      <td className='text-right'>{FormatCurrency(state.currentRegion, po.balance)}</td>
                    </tr>
                  ))}
                  <tr className='bg-light'>
                    <td colSpan={3} className='font-semibold text-right'>
                      TOTAL
                    </td>
                    <td className='font-semibold text-right'>{FormatCurrency(state.currentRegion, totalOrderValue)}</td>
                    <td className='font-semibold text-right'>{FormatCurrency(state.currentRegion, totalPaid)}</td>
                    <td className='font-semibold text-right'>{FormatCurrency(state.currentRegion, totalArrivedQtyValue)}</td>
                    <td className='font-semibold text-right'>{FormatCurrency(state.currentRegion, balance)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Col>
        </Row>
      </ModalBody>
    </Modal>
  )
}

export default PoBalanceListModal
