import { useContext } from 'react'

import AppContext from '@context/AppContext'
import { LatestOrders } from '@typings'
import moment from 'moment'

type Props = {
  latestOrders: LatestOrders[]
}

const Activity_Product_Details = ({ latestOrders }: Props) => {
  const { setShipmentDetailsModal }: any = useContext(AppContext)
  return (
    <div className='border-l border-[color:var(--border)] ps-4 py-1 w-full'>
      <p className='text-[19.5px] text-primary font-semibold'>Recent Activity</p>
      <table className='w-full text-[11.2px]'>
        <thead className='bg-[color:var(--vz-light)]'>
          <tr>
            <th className='px-2 py-1'>Date</th>
            <th className='px-2 py-1'>Order No.</th>
            <th className='px-2 py-1 text-center'>Qty</th>
          </tr>
        </thead>
        <tbody>
          {latestOrders?.length > 0 ? (
            latestOrders
              ?.sort((a, b) => (moment(a.date) > moment(b.date) ? -1 : 1))
              .map((order) => (
                <tr key={order.orderNumber} className='border-t border-[color:var(--border)]'>
                  <td className='px-2 py-1 text-nowrap'>{order.date}</td>
                  <td
                    className='px-2 py-1 text-primary'
                    style={{ cursor: 'pointer' }}
                    onClick={() => setShipmentDetailsModal(true, order.orderId, order.orderNumber, order.orderType, order.status, order.date, false)}>
                    {order.orderNumber}
                  </td>
                  <td className={'px-2 py-1 text-center ' + (order.isReceiving ? 'text-success' : 'text-destructive')}>{order.isReceiving ? `+${order.qty}` : `-${order.qty}`}</td>
                </tr>
              ))
          ) : (
            <tr>
              <td className='text-[color:var(--bs-secondary-color)] font-light italic text-center px-2 py-1' colSpan={3}>
                No Records
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

export default Activity_Product_Details
