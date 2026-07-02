/* eslint-disable @next/next/no-img-element */
import { useContext } from 'react'

import AppContext from '@context/AppContext'
import { ReceivingInventory } from '@hooks/receivings/useReceivingInventory'
import { FormatIntNumber } from '@lib/FormatNumbers'
import { NoImageAdress } from '@lib/assetsConstants'
import { sortStringsLocaleCompare } from '@lib/helperFunctions'
import { Col } from '@/components/migration-ui'

type Props = {
  orderProducts: ReceivingInventory[]
}

const Create_Manual_Receiving_Boxes_Box = ({ orderProducts }: Props) => {
  const { state } = useContext(AppContext)
  return (
    <div>
      <div className='flex flex-row justify-between items-center gap-4 mb-2'>
        <p className='m-0 font-bold text-[16.25px]'>All Products in 1 Box</p>
      </div>
      <Col md={12} className='overflow-auto'>
        <table className='w-full align-middle mb-0 whitespace-nowrap [&_th]:px-2 [&_th]:py-1 [&_td]:px-2 [&_td]:py-1 [&_tbody_tr:nth-child(odd)]:bg-[color:var(--vz-light)]'>
          <thead className='bg-[color:var(--vz-light)]'>
            <tr>
              <th scope='col'>Title / SKU</th>
              <th scope='col' className='text-center'>
                Total to Received
              </th>
            </tr>
          </thead>
          <tbody className='text-[11.2px]'>
            {orderProducts
              .sort((itemA, itemB) => sortStringsLocaleCompare(itemA.sku, itemB.sku))
              .map((item) => (
                <tr key={`${item.inventoryId}`}>
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
                  <td className='text-center'>{item.quantity}</td>
                </tr>
              ))}
            <tr>
              <td className='font-bold text-[13px] text-right'>Total</td>
              <td className='font-bold text-[13px] text-center'>
                {FormatIntNumber(
                  state.currentRegion,
                  orderProducts.reduce((subtotal: number, item) => {
                    return subtotal + item.quantity
                  }, 0)
                )}
              </td>
            </tr>
          </tbody>
        </table>
      </Col>
    </div>
  )
}

export default Create_Manual_Receiving_Boxes_Box
