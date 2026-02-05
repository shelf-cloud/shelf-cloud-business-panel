import React, { useContext } from 'react'

import AppContext from '@context/AppContext'
import { LatestOrders } from '@typings'
import moment from 'moment'

type Props = {
  latestOrders: LatestOrders[]
}

const Activity_Product_Details = ({ latestOrders }: Props) => {
  const { setShipmentDetailsModal }: any = useContext(AppContext)
  return (
    <div className='border-start ps-4 py-1 w-100'>
      <p className='fs-4 text-primary fw-semibold'>Recent Activity</p>
      <table className='table table-sm'>
        <thead className='table-light'>
          <tr>
            <th>Date</th>
            <th>Order No.</th>
            <th className='text-center'>Qty</th>
          </tr>
        </thead>
        <tbody className='fs-7'>
          {latestOrders?.length > 0 ? (
            latestOrders
              ?.sort((a, b) => (moment(a.date) > moment(b.date) ? -1 : 1))
              .map((order) => (
                <tr key={order.orderNumber}>
                  <td className='text-nowrap'>{order.date}</td>
                  <td
                    className='text-primary'
                    style={{ cursor: 'pointer' }}
                    onClick={() => setShipmentDetailsModal(true, order.orderId, order.orderNumber, order.orderType, order.status, order.date, false)}>
                    {order.orderNumber}
                  </td>
                  <td className={'text-center ' + (order.isReceiving ? 'text-success' : 'text-danger')}>{order.isReceiving ? `+${order.qty}` : `-${order.qty}`}</td>
                </tr>
              ))
          ) : (
            <tr>
              <td className='text-muted fw-light fst-italic text-center' colSpan={3}>
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
