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
    <div className='tw:overflow-auto'>
      <Col md={12}>
        <table className='tw:w-full tw:align-middle tw:mb-0 tw:whitespace-nowrap tw:[&_th]:px-2 tw:[&_th]:py-1 tw:[&_td]:px-2 tw:[&_td]:py-1 tw:[&_tbody_tr:nth-child(odd)]:bg-[color:var(--vz-light)]'>
          <thead className='tw:bg-[color:var(--vz-light)]'>
            <tr key='edit-receiving-summary-header'>
              {isReceivingFromPo && <th scope='col'>PO Number</th>}
              <th scope='col'>Supplier</th>
              <th scope='col'>Title / SKU</th>
              <th scope='col' className='tw:text-center'>
                Total to Received
              </th>
              <th></th>
            </tr>
          </thead>
          <tbody className='tw:text-[11.2px]'>
            {orderItems
              .sort((itemA, itemB) => (itemA.poNumber ? itemA.poNumber!.localeCompare(itemB.poNumber!) : itemA.sku.localeCompare(itemB.sku)))
              .map((item) => (
                <tr key={`${item.poId}-${item.inventoryId}`}>
                  {isReceivingFromPo && <td>{item.poNumber}</td>}
                  <td className='tw:font-bold tw:text-[13px]'>{item.suppliersName}</td>
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
                  <td>
                    <i
                      className='tw:text-[19.5px] tw:text-danger las la-trash-alt'
                      style={{ cursor: 'pointer' }}
                      onClick={() => handleDeleteItem(item.poId!, item.sku, item.quantity, item.inventoryId!, item.splitId)}
                    />
                  </td>
                </tr>
              ))}
            <tr key='edit-receiving-summary-total-footer' className='tw:bg-light'>
              {isReceivingFromPo && <td></td>}
              <td></td>
              <td className='tw:font-bold tw:text-[13px] tw:text-right'>Total</td>
              <td className='tw:font-bold tw:text-[13px] tw:text-center'>
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
