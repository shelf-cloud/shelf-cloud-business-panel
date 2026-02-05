import React, { useContext } from 'react'

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
    <div className='py-1 w-100'>
      <table className='table table-sm'>
        <thead>
          <tr className='text-center'>
            <th>Description</th>
            <th>Qty</th>
            <th>Weight</th>
            <th>Length</th>
            <th>Width</th>
            <th>Height</th>
          </tr>
        </thead>
        <tbody>
          <tr className='text-center'>
            <td className='fw-semibold'>Each</td>
            <td>1</td>
            <td>
              {weight} {state.currentRegion !== '' && (state.currentRegion == 'us' ? 'lb' : 'kg')}
            </td>
            <td>
              {length} {state.currentRegion !== '' && (state.currentRegion == 'us' ? 'in' : 'cm')}
            </td>
            <td>
              {width} {state.currentRegion !== '' && (state.currentRegion == 'us' ? 'in' : 'cm')}
            </td>
            <td>
              {height} {state.currentRegion !== '' && (state.currentRegion == 'us' ? 'in' : 'cm')}
            </td>
          </tr>
          <tr className='text-center'>
            <td className='fw-semibold'>Master Box</td>
            <td>{boxQty}</td>
            <td>
              {boxWeight} {state.currentRegion !== '' && (state.currentRegion == 'us' ? 'lb' : 'kg')}
            </td>
            <td>
              {boxLength} {state.currentRegion !== '' && (state.currentRegion == 'us' ? 'in' : 'cm')}
            </td>
            <td>
              {boxWidth} {state.currentRegion !== '' && (state.currentRegion == 'us' ? 'in' : 'cm')}
            </td>
            <td>
              {boxHeight} {state.currentRegion !== '' && (state.currentRegion == 'us' ? 'in' : 'cm')}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

export default Measure_Kit_Details
