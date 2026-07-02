/* eslint-disable @next/next/no-img-element */
import { useContext } from 'react'

import AppContext from '@context/AppContext'
import { FormatIntNumber } from '@lib/FormatNumbers'
import { NoImageAdress } from '@lib/assetsConstants'
import { Col } from '@/components/migration-ui'

type Props = {}

const Create_Receiving_Boxes_Box = ({}: Props) => {
  const { state } = useContext(AppContext)
  return (
    <div>
      <div className='tw:flex tw:flex-row tw:justify-between tw:items-center tw:gap-4 tw:mb-2'>
        <p className='tw:m-0 tw:font-bold tw:text-[16.25px]'>All Products in 1 Box</p>
      </div>
      <Col md={12} className='tw:overflow-auto'>
        <table className='table table-sm align-middle table-responsive table-nowrap table-striped'>
          <thead className='table-light'>
            <tr>
              <th scope='col'>PO Number</th>
              <th scope='col'>Supplier</th>
              <th scope='col'>Title / SKU</th>
              <th scope='col' className='tw:text-center'>
                Total to Received
              </th>
            </tr>
          </thead>
          <tbody className='tw:text-[11.2px]'>
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
                    <td className='tw:text-center'>{item.receivingQty}</td>
                  </tr>
                ))
              )}
            <tr>
              <td></td>
              <td></td>
              <td className='tw:font-bold tw:text-[13px] tw:text-right'>Total</td>
              <td className='tw:font-bold tw:text-[13px] tw:text-center'>
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

export default Create_Receiving_Boxes_Box
