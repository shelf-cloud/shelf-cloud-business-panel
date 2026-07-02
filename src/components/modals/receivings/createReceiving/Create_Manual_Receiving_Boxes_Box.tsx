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
      <div className='tw:flex tw:flex-row tw:justify-between tw:items-center tw:gap-4 tw:mb-2'>
        <p className='tw:m-0 tw:font-bold tw:text-[16.25px]'>All Products in 1 Box</p>
      </div>
      <Col md={12} className='tw:overflow-auto'>
        <table className='tw:w-full tw:align-middle tw:mb-0 tw:whitespace-nowrap tw:[&_th]:px-2 tw:[&_th]:py-1 tw:[&_td]:px-2 tw:[&_td]:py-1 tw:[&_tbody_tr:nth-child(odd)]:bg-[color:var(--vz-light)]'>
          <thead className='tw:bg-[color:var(--vz-light)]'>
            <tr>
              <th scope='col'>Title / SKU</th>
              <th scope='col' className='tw:text-center'>
                Total to Received
              </th>
            </tr>
          </thead>
          <tbody className='tw:text-[11.2px]'>
            {orderProducts
              .sort((itemA, itemB) => sortStringsLocaleCompare(itemA.sku, itemB.sku))
              .map((item) => (
                <tr key={`${item.inventoryId}`}>
                  <td className='tw:text-center'>
                    <div className='tw:flex tw:flex-row tw:justify-start tw:items-center tw:gap-2'>
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
                      <div className='tw:text-left'>
                        <p className='tw:text-nowrap tw:m-0 tw:font-semibold'>{item.title}</p>
                        <p className='tw:text-nowrap tw:m-0'>{item.sku}</p>
                      </div>
                    </div>
                  </td>
                  <td className='tw:text-center'>{item.quantity}</td>
                </tr>
              ))}
            <tr>
              <td className='tw:font-bold tw:text-[13px] tw:text-right'>Total</td>
              <td className='tw:font-bold tw:text-[13px] tw:text-center'>
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
