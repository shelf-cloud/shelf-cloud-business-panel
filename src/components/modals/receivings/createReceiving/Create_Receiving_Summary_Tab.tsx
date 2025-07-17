/* eslint-disable @next/next/no-img-element */
import { useContext } from 'react'

import AppContext from '@context/AppContext'
import { FormatIntNumber } from '@lib/FormatNumbers'
import { NoImageAdress } from '@lib/assetsConstants'
import { Col } from 'reactstrap'

type Props = {}

const Create_Receiving_Summary_Tab = ({}: Props) => {
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
            </tr>
          </thead>
          <tbody className='fs-7'>
            {Object.entries(state.receivingFromPo.items)
              .sort(([_poIdA, inventoryIdA]: any, [_poIdB, inventoryIdB]: any) => {
                const supplerA = Object.values<any>(inventoryIdA)[0].suppliersName
                const supplerB = Object.values<any>(inventoryIdB)[0].suppliersName
                if (supplerA < supplerB) {
                  return -1
                }
                if (supplerA > supplerB) {
                  return 1
                }
                return 0
              })
              .map(([poId, inventoryId]: any) =>
                Object.entries(inventoryId).map(([inventoryId, item]: any) => (
                  <tr key={`${poId}-${inventoryId}`}>
                    <td>{item.orderNumber}</td>
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
                    <td className='text-center'>{item.receivingQty}</td>
                  </tr>
                ))
              )}
            <tr>
              <td></td>
              <td></td>
              <td className='fw-bold fs-6 text-end'>Total</td>
              <td className='fw-bold fs-6 text-center'>
                {FormatIntNumber(
                  state.currentRegion,
                  Object.entries(state.receivingFromPo.items).reduce((total: number, po: [string, any]) => {
                    const poTotal = Object.entries(po[1]).reduce((subtotal: number, inventoryId: [string, any]) => {
                      return subtotal + inventoryId[1].receivingQty
                    }, 0)
                    return total + poTotal
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

export default Create_Receiving_Summary_Tab
