/* eslint-disable @next/next/no-img-element */
import AppContext from '@context/AppContext'
import { NoImageAdress } from '@lib/assetsConstants'
import { FormatCurrency } from '@lib/FormatNumbers'
import { StorageProduct } from '@typesTs/storage/storage'
import React, { useContext } from 'react'
import { Card, CardBody, CardHeader, Col, Row } from 'reactstrap'

type Props = {
  data: { [inventoryId: string]: StorageProduct }
  totalCharge: number
}

const StorageType = ({ data, totalCharge }: Props) => {
  const { state }: any = useContext(AppContext)
  const products = Object.values(data)
  return (
    <div className='w-100' style={{ backgroundColor: '#F0F4F7', padding: '0px' }}>
      <Row>
        <Col xs={12}>
          <Row>
            <Col xs={12}>
              <Card>
                <CardHeader className='py-3'>
                  <h5 className='fw-semibold m-0'>Products</h5>
                </CardHeader>
                <CardBody>
                  <div className='table-responsive'>
                    <table className='table table-sm align-middle table-borderless mb-0'>
                      <thead className='table-light'>
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
                          <tr key={key} className='border-bottom py-2'>
                            <td>
                              <div className='d-flex flex-column justify-content-center align-items-center gap-2'>
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
                            <td className='w-50 fs-7 fw-semibold'>{product.title}</td>
                            <td className='fs-7 text-muted'>{product.sku}</td>
                            <td className='text-center'>{FormatCurrency(state.currentRegion, product.storageFee ?? 0)}</td>
                          </tr>
                        ))}
                        <tr className='bg-light'>
                          <td></td>
                          <td></td>
                          <td className='text-end fw-bold text-nowrap'>Total</td>
                          <td className='text-center text-primary fw-semibold'>{FormatCurrency(state.currentRegion, totalCharge)}</td>
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
