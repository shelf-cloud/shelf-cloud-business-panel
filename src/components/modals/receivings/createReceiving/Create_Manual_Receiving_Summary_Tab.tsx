/* eslint-disable @next/next/no-img-element */
import { useContext } from 'react'

import AppContext from '@context/AppContext'
import { ReceivingInventory } from '@hooks/receivings/useReceivingInventory'
import { FormatIntNumber } from '@lib/FormatNumbers'
import { NoImageAdress } from '@lib/assetsConstants'

type Props = {
  orderProducts: ReceivingInventory[]
}

const Create_Manual_Receiving_Summary_Tab = ({ orderProducts }: Props) => {
  const { state } = useContext(AppContext)
  return (
    <div className='overflow-auto'>
      <div className='px-3 w-full'>
        <table className='w-full align-middle mb-0 whitespace-nowrap [&_th]:px-2 [&_th]:py-1 [&_td]:px-2 [&_td]:py-1 [&_tbody_tr:nth-child(odd)]:bg-[color:var(--vz-light)]'>
          <thead className='bg-[color:var(--vz-light)]'>
            <tr key='manualReceivingSummaryTab-header'>
              <th scope='col'>Title / SKU</th>
              <th scope='col'>Supplier</th>
              <th scope='col' className='text-center'>
                Total to Received
              </th>
            </tr>
          </thead>
          <tbody className='text-[11.2px]'>
            {orderProducts.map((item) => (
              <tr key={`summary-item-${item.businessId}-${item.sku}`}>
                <td className='text-center'>
                  <div className='flex flex-row justify-start items-center gap-2'>
                    <div
                      style={{
                        width: '40px',
                        height: '35px',
                        margin: '0px',
                        position: 'relative',
                      }}>
                      <img
                        loading='lazy'
                        src={item.image ? item.image : NoImageAdress}
                        alt='product Image'
                        style={{ objectFit: 'contain', objectPosition: 'center', width: '100%', height: '100%' }}
                      />
                    </div>
                    <div className='text-left'>
                      <p className='text-nowrap m-0 font-semibold'>{item.title}</p>
                      <p className='text-nowrap m-0'>{item.sku}</p>
                    </div>
                  </div>
                </td>
                <td className=''>{item.suppliersName}</td>
                <td className='text-center'>{item.quantity}</td>
              </tr>
            ))}
            <tr key='manualReceivingSummaryTab-footer'>
              <td></td>
              <td className='font-bold text-[13px] text-right'>Total</td>
              <td className='font-bold text-[13px] text-center'>
                {FormatIntNumber(
                  state.currentRegion,
                  orderProducts.reduce((total: number, item) => {
                    return total + item.quantity
                  }, 0)
                )}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Create_Manual_Receiving_Summary_Tab
