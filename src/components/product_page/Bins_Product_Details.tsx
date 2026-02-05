import React, { useContext } from 'react'

import AppContext from '@context/AppContext'
import { FormatCurrency } from '@lib/FormatNumbers'
import { ProductBins } from '@typings'

type Props = {
  bins: ProductBins[]
}

const Bins_Product_Details = ({ bins }: Props) => {
  const { state }: any = useContext(AppContext)
  return (
    <div className='border-start ps-4 py-1 w-100'>
      <p className='fs-4 text-primary fw-semibold'>Storage Bins</p>
      <table className='table table-sm'>
        <thead className='table-light'>
          <tr className='text-center'>
            <th>Name</th>
            <th>Est. Cost</th>
            <th>Qty</th>
          </tr>
        </thead>
        <tbody className='fs-7'>
          {bins?.length > 0 ? (
            bins?.map((order) => (
              <tr key={order.binName} className='text-center'>
                <td>{order.binName}</td>
                <td>{FormatCurrency(state.currentRegion, order.binBalance)}</td>
                <td>{order.quantity}</td>
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

export default Bins_Product_Details
