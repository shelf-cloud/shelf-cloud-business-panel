/* eslint-disable @next/next/no-img-element */
import { useContext } from 'react'

import AppContext from '@context/AppContext'
import { ReceivingInventory } from '@hooks/receivings/useReceivingInventory'
import { FormatIntNumber } from '@lib/FormatNumbers'
import { NoImageAdress } from '@lib/assetsConstants'
import { Col } from '@/components/migration-ui'

type Props = {
  orderProducts: ReceivingInventory[]
}

const Create_Manual_Receiving_Summary_Tab = ({ orderProducts }: Props) => {
  const { state } = useContext(AppContext)
  return (
    <div className='tw:overflow-auto'>
      <Col md={12}>
        <table className='table table-sm align-middle table-responsive table-nowrap table-striped'>
          <thead className='table-light'>
            <tr key='manualReceivingSummaryTab-header'>
              <th scope='col'>Title / SKU</th>
              <th scope='col'>Supplier</th>
              <th scope='col' className='tw:text-center'>
                Total to Received
              </th>
            </tr>
          </thead>
          <tbody className='tw:text-[11.2px]'>
            {orderProducts.map((item) => (
              <tr key={`summary-item-${item.businessId}-${item.sku}`}>
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
                <td className=''>{item.suppliersName}</td>
                <td className='tw:text-center'>{item.quantity}</td>
              </tr>
            ))}
            <tr key='manualReceivingSummaryTab-footer'>
              <td></td>
              <td className='tw:font-bold tw:text-[13px] tw:text-right'>Total</td>
              <td className='tw:font-bold tw:text-[13px] tw:text-center'>
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
      </Col>
    </div>
  )
}

export default Create_Manual_Receiving_Summary_Tab
