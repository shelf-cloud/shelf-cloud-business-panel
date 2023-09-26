import { LatestOrders } from '@typings'
import React from 'react'

type Props = {
  latestOrders: LatestOrders[]
}

const Activity_Product_Details = ({ latestOrders }: Props) => {
  return (
    <div className='border-start ps-4 py-2 w-100'>
      <p className='fs-4 text-primary fw-semibold'>Recent Activity</p>
      <table className='table table-sm'>
        <thead>
          <tr className='text-center'>
            <th>Date</th>
            <th>Order No.</th>
            <th>Qty</th>
          </tr>
        </thead>
        <tbody>
          {latestOrders?.length > 0 ? (
            latestOrders?.map((order) => (
              <tr key={order.orderNumber} className='text-center'>
                <td>{order.date}</td>
                <td>{order.orderNumber}</td>
                <td className='text-danger'>-{order.qty}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td className='text-muted fw-light fst-italic text-center' colSpan={3}>No Records</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

export default Activity_Product_Details
