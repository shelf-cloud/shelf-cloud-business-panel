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
    <div className='border-l border-[color:var(--border)] ps-4 py-1 w-full'>
      <p className='text-[19.5px] text-primary font-semibold'>Storage Bins</p>
      <table className='w-full text-[11.2px]'>
        <thead className='bg-[color:var(--vz-light)]'>
          <tr className='text-center'>
            <th className='px-2 py-1'>Name</th>
            <th className='px-2 py-1'>Est. Cost</th>
            <th className='px-2 py-1'>Qty</th>
          </tr>
        </thead>
        <tbody>
          {bins?.length > 0 ? (
            bins?.map((order) => (
              <tr key={order.binName} className='text-center border-t border-[color:var(--border)]'>
                <td className='px-2 py-1'>{order.binName}</td>
                <td className='px-2 py-1'>{FormatCurrency(state.currentRegion, order.binBalance)}</td>
                <td className='px-2 py-1'>{order.quantity}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td className='text-muted-foreground font-light italic text-center px-2 py-1' colSpan={3}>
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
