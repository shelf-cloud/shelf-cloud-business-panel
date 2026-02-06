/* eslint-disable @next/next/no-img-element */
import Link from 'next/link'
import React, { useContext } from 'react'

import AppContext from '@context/AppContext'
import { FormatIntNumber } from '@lib/FormatNumbers'
import { ProductSummary } from '@typings'
import { Card, CardBody, CardHeader, Col } from 'reactstrap'

type Props = {
  products: ProductSummary[] | undefined
}

const MostInvenotryList = ({ products }: Props) => {
  const { state }: any = useContext(AppContext)
  return (
    <React.Fragment>
      <Col>
        <Card>
          <CardHeader className='align-items-center d-flex justify-content-between'>
            <h4 className='card-title mb-0 flex-grow-1'>Stock Inventory</h4>
            <Link href={'/Products?brand=All&supplier=All&category=All&condition=All'} className='fs-6 text-primary fw-normal'>
              View All Products
            </Link>
          </CardHeader>

          <CardBody>
            <div className='table-responsive table-card'>
              <table className='table table-hover table-centered align-middle mb-0'>
                <thead>
                  <tr className='fw-semibold'>
                    <td>Image</td>
                    <td>Name</td>
                    <td>SKU</td>
                    <td>Quantity</td>
                  </tr>
                </thead>
                <tbody>
                  {(products || []).map((item, key) => (
                    <tr key={key}>
                      <td>
                        <div className='avatar-sm bg-light rounded p-1 me-2'>
                          <img
                            loading='lazy'
                            src={item.image}
                            alt='Product Img'
                            style={{ objectFit: 'contain', objectPosition: 'center', width: '100%', height: '100%' }}
                            className='img-fluid d-block'
                          />
                        </div>
                      </td>
                      <td>
                        <span className='fs-6 mw-30'>{item.title}</span>
                      </td>
                      <td>
                        <span className='text-muted'>{item.sku}</span>
                      </td>
                      <td>
                        <h5 className='fs-14 my-1 fw-normal text-center'>{FormatIntNumber(state.currentRegion, item.totalQty)}</h5>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardBody>
        </Card>
      </Col>
    </React.Fragment>
  )
}

export default MostInvenotryList
