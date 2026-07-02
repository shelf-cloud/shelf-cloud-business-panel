import { useContext } from 'react'

import AppContext from '@context/AppContext'

type Props = {
  weight: number
  length: number
  width: number
  height: number
  boxQty: number
  boxWeight: number
  boxLength: number
  boxWidth: number
  boxHeight: number
}

const Measure_Kit_Details = ({ weight, length, width, height, boxQty, boxWeight, boxLength, boxWidth, boxHeight }: Props) => {
  const { state }: any = useContext(AppContext)

  return (
    <div className='tw:py-1 tw:w-full'>
      <table className='tw:w-full tw:text-[11.2px]'>
        <thead>
          <tr className='tw:text-center'>
            <th className='tw:px-2 tw:py-1'>Description</th>
            <th className='tw:px-2 tw:py-1'>Qty</th>
            <th className='tw:px-2 tw:py-1'>Weight</th>
            <th className='tw:px-2 tw:py-1'>Length</th>
            <th className='tw:px-2 tw:py-1'>Width</th>
            <th className='tw:px-2 tw:py-1'>Height</th>
          </tr>
        </thead>
        <tbody>
          <tr className='tw:text-center tw:border-t tw:border-[color:var(--border)]'>
            <td className='tw:px-2 tw:py-1 tw:font-semibold'>Each</td>
            <td className='tw:px-2 tw:py-1'>1</td>
            <td className='tw:px-2 tw:py-1'>
              {weight} {state.currentRegion !== '' && (state.currentRegion == 'us' ? 'lb' : 'kg')}
            </td>
            <td className='tw:px-2 tw:py-1'>
              {length} {state.currentRegion !== '' && (state.currentRegion == 'us' ? 'in' : 'cm')}
            </td>
            <td className='tw:px-2 tw:py-1'>
              {width} {state.currentRegion !== '' && (state.currentRegion == 'us' ? 'in' : 'cm')}
            </td>
            <td className='tw:px-2 tw:py-1'>
              {height} {state.currentRegion !== '' && (state.currentRegion == 'us' ? 'in' : 'cm')}
            </td>
          </tr>
          <tr className='tw:text-center tw:border-t tw:border-[color:var(--border)]'>
            <td className='tw:px-2 tw:py-1 tw:font-semibold'>Master Box</td>
            <td className='tw:px-2 tw:py-1'>{boxQty}</td>
            <td className='tw:px-2 tw:py-1'>
              {boxWeight} {state.currentRegion !== '' && (state.currentRegion == 'us' ? 'lb' : 'kg')}
            </td>
            <td className='tw:px-2 tw:py-1'>
              {boxLength} {state.currentRegion !== '' && (state.currentRegion == 'us' ? 'in' : 'cm')}
            </td>
            <td className='tw:px-2 tw:py-1'>
              {boxWidth} {state.currentRegion !== '' && (state.currentRegion == 'us' ? 'in' : 'cm')}
            </td>
            <td className='tw:px-2 tw:py-1'>
              {boxHeight} {state.currentRegion !== '' && (state.currentRegion == 'us' ? 'in' : 'cm')}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

export default Measure_Kit_Details
