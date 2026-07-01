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
    <div className='tw:border-l tw:border-[color:var(--border)] tw:ps-4 tw:py-1 tw:w-full'>
      <p className='tw:text-[19.5px] tw:text-primary tw:font-semibold'>Recent Activity</p>
      <table className='tw:w-full tw:text-[11.2px]'>
        <thead className='tw:bg-[color:var(--vz-light)]'>
          <tr>
            <th className='tw:px-2 tw:py-1'>Date</th>
            <th className='tw:px-2 tw:py-1'>Order No.</th>
            <th className='tw:px-2 tw:py-1 tw:text-center'>Qty</th>
          </tr>
        </thead>
        <tbody>
          {latestOrders?.length > 0 ? (
            latestOrders
              ?.sort((a, b) => (moment(a.date) > moment(b.date) ? -1 : 1))
              .map((order) => (
                <tr key={order.orderNumber} className='tw:border-t tw:border-[color:var(--border)]'>
                  <td className='tw:px-2 tw:py-1 tw:text-nowrap'>{order.date}</td>
                  <td
                    className='tw:px-2 tw:py-1 tw:text-primary'
                    style={{ cursor: 'pointer' }}
                    onClick={() => setShipmentDetailsModal(true, order.orderId, order.orderNumber, order.orderType, order.status, order.date, false)}>
                    {order.orderNumber}
                  </td>
                  <td className={'tw:px-2 tw:py-1 tw:text-center ' + (order.isReceiving ? 'tw:text-success' : 'tw:text-destructive')}>{order.isReceiving ? `+${order.qty}` : `-${order.qty}`}</td>
                </tr>
              ))
          ) : (
            <tr>
              <td className='tw:text-[color:var(--bs-secondary-color)] tw:font-light tw:italic tw:text-center tw:px-2 tw:py-1' colSpan={3}>
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
