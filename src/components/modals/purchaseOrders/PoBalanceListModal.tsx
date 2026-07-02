 
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
          <Col md={12} className='tw:mt-2'>
            <div className='tw:overflow-x-auto'>
              <table className='tw:w-full tw:align-middle tw:mb-0 tw:text-nowrap tw:border tw:[&_tbody_tr:nth-child(odd)]:bg-[color:var(--vz-light)] tw:[&_th]:px-2 tw:[&_th]:py-1 tw:[&_td]:px-2 tw:[&_td]:py-1'>
                <thead className='tw:bg-[color:var(--vz-light)]'>
                  <tr>
                    <th>PO</th>
                    <th>Supplier</th>
                    <th>Date</th>
                    <th className='tw:text-right'>Order Cost</th>
                    <th className='tw:text-right'>Total Paid</th>
                    <th className='tw:text-right'>Arrived Value</th>
                    <th className='tw:text-right'>Balance</th>
                  </tr>
                </thead>
                <tbody className='tw:text-[11.2px]'>
                  {poBalanceList.map((po, index: number) => (
                    <tr key={index}>
                      <td className='tw:text-left'>{po.orderNumber}</td>
                      <td className='tw:text-left'>{po.suppliersName}</td>
                      <td>{moment.utc(po.date).local().format('MM/DD/YYYY')}</td>
                      <td className='tw:text-right'>{FormatCurrency(state.currentRegion, po.totalOrderValue)}</td>
                      <td className='tw:text-right'>{FormatCurrency(state.currentRegion, po.totalPaid)}</td>
                      <td className='tw:text-right'>{FormatCurrency(state.currentRegion, po.totalArrivedQtyValue)}</td>
                      <td className='tw:text-right'>{FormatCurrency(state.currentRegion, po.balance)}</td>
                    </tr>
                  ))}
                  <tr className='tw:bg-light'>
                    <td colSpan={3} className='tw:font-semibold tw:text-right'>
                      TOTAL
                    </td>
                    <td className='tw:font-semibold tw:text-right'>{FormatCurrency(state.currentRegion, totalOrderValue)}</td>
                    <td className='tw:font-semibold tw:text-right'>{FormatCurrency(state.currentRegion, totalPaid)}</td>
                    <td className='tw:font-semibold tw:text-right'>{FormatCurrency(state.currentRegion, totalArrivedQtyValue)}</td>
                    <td className='tw:font-semibold tw:text-right'>{FormatCurrency(state.currentRegion, balance)}</td>
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
