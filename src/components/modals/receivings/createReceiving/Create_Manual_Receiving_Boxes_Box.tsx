/* eslint-disable @next/next/no-img-element */
import { useContext } from 'react'

import AppContext from '@context/AppContext'
import { ReceivingInventory } from '@hooks/receivings/useReceivingInventory'
import { FormatIntNumber } from '@lib/FormatNumbers'
import { NoImageAdress } from '@lib/assetsConstants'
import { sortStringsLocaleCompare } from '@lib/helperFunctions'
import { Col } from 'reactstrap'

type Props = {
  orderProducts: ReceivingInventory[]
}

const Create_Manual_Receiving_Boxes_Box = ({ orderProducts }: Props) => {
  const { state } = useContext(AppContext)
  return (
    <div>
      <div className='d-flex flex-row justify-content-between align-items-center gap-3 mb-2'>
        <p className='m-0 fw-bold fs-5'>All Products in 1 Box</p>
      </div>
      <Col md={12} className='overflow-auto'>
        <table className='table table-sm align-middle table-responsive table-nowrap table-striped'>
          <thead className='table-light'>
            <tr>
              <th scope='col'>Title / SKU</th>
              <th scope='col' className='text-center'>
                Total to Received
              </th>
            </tr>
          </thead>
          <tbody className='fs-7'>
            {orderProducts
              .sort((itemA, itemB) => sortStringsLocaleCompare(itemA.sku, itemB.sku))
              .map((item) => (
                <tr key={`${item.inventoryId}`}>
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
            <tr>
              <td className='fw-bold fs-6 text-end'>Total</td>
              <td className='fw-bold fs-6 text-center'>
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
