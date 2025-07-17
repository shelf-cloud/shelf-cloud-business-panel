/* eslint-disable @next/next/no-img-element */
import { useContext } from 'react'

import AppContext from '@context/AppContext'
import { FormatIntNumber } from '@lib/FormatNumbers'
import { NoImageAdress } from '@lib/assetsConstants'
import { ShipmentOrderItem } from '@typings'
import { Col } from 'reactstrap'

type Props = {
  orderItems: ShipmentOrderItem[]
  handleDeleteItem: (poId: number, sku: string, quantity: number, inventoryId: number, splitId: number | undefined) => void
}

const Edit_Receiving_Summary_Tab = ({ orderItems, handleDeleteItem }: Props) => {
  const { state } = useContext(AppContext)
  return (
    <div className='overflow-auto'>
      <Col md={12}>
        <table className='table table-sm align-middle table-responsive table-nowrap table-striped'>
          <thead className='table-light'>
            <tr>
              <th scope='col'>PO Number</th>
              <th scope='col'>Supplier</th>
              <th scope='col'>Title / SKU</th>
              <th scope='col' className='text-center'>
                Total to Received
              </th>
              <th></th>
            </tr>
          </thead>
          <tbody className='fs-7'>
            {orderItems
              .sort((itemA, itemB) => itemA.poNumber!.localeCompare(itemB.poNumber!))
              .map((item) => (
                <tr key={`${item.poId}-${item.inventoryId}`}>
                  <td>{item.poNumber}</td>
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
                  <td>
                    <i
                      className='fs-4 text-danger las la-trash-alt'
                      style={{ cursor: 'pointer' }}
                      onClick={() => handleDeleteItem(item.poId!, item.sku, item.quantity, item.inventoryId!, item.splitId)}
                    />
                  </td>
                </tr>
              ))}
            <tr>
              <td></td>
              <td></td>
              <td className='fw-bold fs-6 text-end'>Total</td>
              <td className='fw-bold fs-6 text-center'>
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
