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
    <div className='tw:w-full' style={{ backgroundColor: '#F0F4F7', padding: '0px' }}>
      <Row>
        <Col xs={12}>
          <Row>
            <Col xs={12}>
              <Card>
                <CardHeader className='tw:py-4'>
                  <h5 className='tw:font-semibold tw:m-0'>Products</h5>
                </CardHeader>
                <CardBody>
                  <div className='table-responsive'>
                    <table className='table table-sm align-middle table-borderless mb-0'>
                      <thead className='table-light'>
                        <tr>
                          <th className='tw:text-center' scope='col'>
                            Image
                          </th>
                          <th scope='col'>Sku</th>
                          <th scope='col'>Title</th>
                          <th className='tw:text-center' scope='col'>
                            Storage Fee
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {products.map((product: StorageProduct, key) => (
                          <tr key={key} className='tw:border-b tw:py-2'>
                            <td>
                              <div className='tw:flex tw:flex-col tw:justify-center tw:items-center tw:gap-2'>
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
                            <td className='tw:w-1/2 tw:text-[11.2px] tw:font-semibold'>{product.title}</td>
                            <td className='tw:text-[11.2px] tw:text-[var(--bs-secondary-color)]'>{product.sku}</td>
                            <td className='tw:text-center'>{FormatCurrency(state.currentRegion, product.storageFee ?? 0)}</td>
                          </tr>
                        ))}
                        <tr className='tw:bg-light'>
                          <td></td>
                          <td></td>
                          <td className='tw:text-right tw:font-bold tw:text-nowrap'>Total</td>
                          <td className='tw:text-center tw:text-primary tw:font-semibold'>{FormatCurrency(state.currentRegion, totalCharge)}</td>
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
