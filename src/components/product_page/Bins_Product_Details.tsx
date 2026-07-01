import { useContext } from 'react'

import AppContext from '@context/AppContext'
import { FormatCurrency } from '@lib/FormatNumbers'
import { ProductBins } from '@typings'

type Props = {
  bins: ProductBins[]
}

const Bins_Product_Details = ({ bins }: Props) => {
  const { state }: any = useContext(AppContext)
  return (
    <div className='tw:border-l tw:border-[color:var(--border)] tw:ps-4 tw:py-1 tw:w-full'>
      <p className='tw:text-[19.5px] tw:text-primary tw:font-semibold'>Storage Bins</p>
      <table className='tw:w-full tw:text-[11.2px]'>
        <thead className='tw:bg-[color:var(--vz-light)]'>
          <tr className='tw:text-center'>
            <th className='tw:px-2 tw:py-1'>Name</th>
            <th className='tw:px-2 tw:py-1'>Est. Cost</th>
            <th className='tw:px-2 tw:py-1'>Qty</th>
          </tr>
        </thead>
        <tbody>
          {bins?.length > 0 ? (
            bins?.map((order) => (
              <tr key={order.binName} className='tw:text-center tw:border-t tw:border-[color:var(--border)]'>
                <td className='tw:px-2 tw:py-1'>{order.binName}</td>
                <td className='tw:px-2 tw:py-1'>{FormatCurrency(state.currentRegion, order.binBalance)}</td>
                <td className='tw:px-2 tw:py-1'>{order.quantity}</td>
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

export default Bins_Product_Details
