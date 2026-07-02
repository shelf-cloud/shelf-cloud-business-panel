/* eslint-disable @next/next/no-img-element */
import { useContext } from 'react'

import AppContext from '@context/AppContext'
import { FormatIntNumber } from '@lib/FormatNumbers'
import { NoImageAdress } from '@lib/assetsConstants'
import { ShipmentOrderItem } from '@typings'
import { Col } from '@/components/migration-ui'

type Props = {
  orderItems: ShipmentOrderItem[]
  handleDeleteItem: (poId: number, sku: string, quantity: number, inventoryId: number, splitId: number | undefined) => void
  isReceivingFromPo: boolean
}

const Edit_Receiving_Summary_Tab = ({ orderItems, handleDeleteItem, isReceivingFromPo }: Props) => {
  const { state } = useContext(AppContext)
  return (
    <div className='overflow-auto'>
      <Col md={12}>
        <table className='w-full align-middle mb-0 whitespace-nowrap [&_th]:px-2 [&_th]:py-1 [&_td]:px-2 [&_td]:py-1 [&_tbody_tr:nth-child(odd)]:bg-[color:var(--vz-light)]'>
          <thead className='bg-[color:var(--vz-light)]'>
            <tr key='edit-receiving-summary-header'>
              {isReceivingFromPo && <th scope='col'>PO Number</th>}
              <th scope='col'>Supplier</th>
              <th scope='col'>Title / SKU</th>
              <th scope='col' className='text-center'>
                Total to Received
              </th>
              <th></th>
            </tr>
          </thead>
          <tbody className='text-[11.2px]'>
            {orderItems
              .sort((itemA, itemB) => (itemA.poNumber ? itemA.poNumber!.localeCompare(itemB.poNumber!) : itemA.sku.localeCompare(itemB.sku)))
              .map((item) => (
                <tr key={`${item.poId}-${item.inventoryId}`}>
                  {isReceivingFromPo && <td>{item.poNumber}</td>}
                  <td className='font-bold text-[13px]'>{item.suppliersName}</td>
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
                  <td>
                    <i
                      className='text-[19.5px] text-danger las la-trash-alt'
                      style={{ cursor: 'pointer' }}
                      onClick={() => handleDeleteItem(item.poId!, item.sku, item.quantity, item.inventoryId!, item.splitId)}
                    />
                  </td>
                </tr>
              ))}
            <tr key='edit-receiving-summary-total-footer' className='bg-light'>
              {isReceivingFromPo && <td></td>}
              <td></td>
              <td className='font-bold text-[13px] text-right'>Total</td>
              <td className='font-bold text-[13px] text-center'>
                {FormatIntNumber(
                  state.currentRegion,
                  orderItems.reduce((total: number, item) => {
                    return total + item.quantity
                  }, 0)
                )}
              </td>
              <td></td>
            </tr>
          </tbody>
        </table>
      </Col>
    </div>
  )
}

export default Edit_Receiving_Summary_Tab
