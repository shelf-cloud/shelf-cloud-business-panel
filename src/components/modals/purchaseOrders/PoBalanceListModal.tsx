 
import { useContext } from 'react'

import AppContext from '@context/AppContext'
import { FormatCurrency } from '@lib/FormatNumbers'
import { PoBalance } from '@typesTs/purchaseOrders'
import moment from 'moment'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@shadcn/ui/dialog'

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
    <Dialog
      open={!!poBalanceListModal.show}
      onOpenChange={(open) => {
        if (!open)
          setpoBalanceListModal({
            show: false,
          })
      }}>
      <DialogContent aria-describedby={undefined} className='max-h-[90vh] overflow-y-auto sm:!max-w-3xl'>
        <DialogHeader className='pr-6'>
          <DialogTitle id='myModalLabel'>PO Balance List</DialogTitle>
        </DialogHeader>
        <div style={{ maxHeight: '80svh', scrollbarWidth: 'thin', overflowY: 'scroll' }}>
        <div className='flex flex-wrap -mx-3'>
          <div className='px-3 md:w-full mt-2'>
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
          </div>
        </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default PoBalanceListModal
