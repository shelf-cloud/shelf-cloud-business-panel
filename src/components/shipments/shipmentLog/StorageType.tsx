/* eslint-disable @next/next/no-img-element */
import { useContext } from 'react'

import AppContext from '@context/AppContext'
import { FormatCurrency } from '@lib/FormatNumbers'
import { NoImageAdress } from '@lib/assetsConstants'
import { StorageProduct } from '@typesTs/storage/storage'
import { Card, CardBody, CardHeader, Col, Row } from '@/components/migration-ui'

type Props = {
  data: { [inventoryId: string]: StorageProduct }
  totalCharge: number
}

const StorageType = ({ data, totalCharge }: Props) => {
  const { state }: any = useContext(AppContext)
  const products = Object.values(data)
  return (
    <div className='w-full' style={{ backgroundColor: '#F0F4F7', padding: '0px' }}>
      <Row>
        <Col xs={12}>
          <Row>
            <Col xs={12}>
              <Card>
                <CardHeader className='py-4'>
                  <h5 className='font-semibold m-0'>Products</h5>
                </CardHeader>
                <CardBody>
                  <div className='overflow-x-auto'>
                    <table className='w-full align-middle mb-0 [&_th]:px-2 [&_th]:py-1 [&_td]:px-2 [&_td]:py-1'>
                      <thead className='bg-[color:var(--vz-light)]'>
                        <tr>
                          <th className='text-center' scope='col'>
                            Image
                          </th>
                          <th scope='col'>Sku</th>
                          <th scope='col'>Title</th>
                          <th className='text-center' scope='col'>
                            Storage Fee
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {products.map((product: StorageProduct, key) => (
                          <tr key={key} className='border-b py-2'>
                            <td>
                              <div className='flex flex-col justify-center items-center gap-2'>
                                <img
                                  loading='lazy'
                                  src={product.image ? product.image : NoImageAdress}
                                  alt='product Image'
                                  id={`ChannelLogo-${data.id}`}
                                  style={{
                                    width: '25px',
                                    height: '25px',
                                    objectFit: 'contain',
                                  }}
                                />
                              </div>
                            </td>
                            <td className='w-1/2 text-[11.2px] font-semibold'>{product.title}</td>
                            <td className='text-[11.2px] text-[var(--bs-secondary-color)]'>{product.sku}</td>
                            <td className='text-center'>{FormatCurrency(state.currentRegion, product.storageFee ?? 0)}</td>
                          </tr>
                        ))}
                        <tr className='bg-light'>
                          <td></td>
                          <td></td>
                          <td className='text-right font-bold text-nowrap'>Total</td>
                          <td className='text-center text-primary font-semibold'>{FormatCurrency(state.currentRegion, totalCharge)}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </Col>
      </Row>
    </div>
  )
}

export default StorageType
