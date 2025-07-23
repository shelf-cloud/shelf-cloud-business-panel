/* eslint-disable @next/next/no-img-element */
import { useContext } from 'react'

import AppContext from '@context/AppContext'
import { FormatIntNumber } from '@lib/FormatNumbers'
import { NoImageAdress } from '@lib/assetsConstants'
import { ShipmentOrderItem } from '@typings'
import { Col } from 'reactstrap'

type Props = {
  orderItems: ShipmentOrderItem[]
  isReceivingFromPo: boolean
}

const Edit_Receiving_Boxes_Box = ({ orderItems, isReceivingFromPo }: Props) => {
  const { state } = useContext(AppContext)
  return (
    <div>
      <div className='d-flex flex-row justify-content-between align-items-center gap-3 mb-2'>
        <p className='m-0 fw-bold fs-5'>All Products in 1 Box</p>
      </div>
      <Col md={12} className='overflow-auto'>
        <table className='table table-sm align-middle table-responsive table-nowrap table-striped'>
          <thead className='table-light'>
            <tr key='edit-receiving-boxes-box-total-header'>
              {isReceivingFromPo && (
                <th scope='col' className='text-start'>
                  PO Numbers
                </th>
              )}
              <th scope='col'>Supplier</th>
              <th scope='col'>Title / SKU</th>
              <th scope='col' className='text-center'>
                Total to Received
              </th>
            </tr>
          </thead>
          <tbody className='fs-7'>
            {orderItems
              .sort((itemA, itemB) => (isReceivingFromPo ? itemA.poNumber!.localeCompare(itemB.poNumber!) : itemA.sku.localeCompare(itemB.sku)))
              .map((item) => (
                <tr key={`${item.poId}-${item.inventoryId}`}>
                  {isReceivingFromPo && <td>{item.poNumber}</td>}
                  <td className='fw-bold fs-6'>{item.suppliersName}</td>
                  <td className='text-center'>
                    <div className='d-flex flex-row justify-content-start align-items-center gap-2'>
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
                      <div className='text-start'>
                        <p className='text-nowrap m-0 fw-semibold'>{item.title}</p>
                        <p className='text-nowrap m-0'>{item.sku}</p>
                      </div>
                    </div>
                  </td>
                  <td className='text-center'>{item.quantity}</td>
                </tr>
              ))}
            <tr key='edit-receiving-boxes-box-total-footer'>
              {isReceivingFromPo && <td></td>}
              <td></td>
              <td className='fw-bold fs-6 text-end'>Total</td>
              <td className='fw-bold fs-6 text-center'>
                {FormatIntNumber(
                  state.currentRegion,
                  orderItems.reduce((total: number, item: ShipmentOrderItem) => {
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

export default Edit_Receiving_Boxes_Box
