import React from 'react'
import { Card, CardBody, CardHeader, Col, Row } from 'reactstrap'
import { Children, KitRow } from '@typings'

type Props = {
  data: KitRow
}

const KitType = ({ data }: Props) => {
  return (
    <div style={{ backgroundColor: '#F0F4F7', padding: '10px' }}>
      <Row>
        <Col xl={12}>
          <Card className='m-0'>
            <CardHeader className='py-3'>
              <h5 className='fw-semibold m-0'>Kit Children</h5>
            </CardHeader>
            <CardBody>
              <div className='table-responsive'>
                <table className='table table-sm align-middle table-borderless mb-0'>
                  <thead className='table-light'>
                    <tr>
                      <th scope='col'>Title</th>
                      <th scope='col'>Sku</th>
                      <th className='text-center' scope='col'>
                        Kit Qty
                      </th>
                      <th className='text-center' scope='col'>
                        Warehouse Qty
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.children.map((product: Children, key) => (
                      <tr key={key} className='border-bottom py-2'>
                        <td className='w-50 fs-6 fw-semibold'>{product.title || ''}</td>
                        <td className='fs-6 text-muted'>{product.sku}</td>
                        <td className='text-center'>{product.qty}</td>
                        <td className='text-center'>{product.available}</td>
                      </tr>
                    ))}
                    <tr>
                      <td></td>
                      <td className='text-end fs-5 fw-bold text-nowrap'>Total Qty</td>
                      <td className='text-center fs-5 text-primary'>
                        {data.children.reduce((total, product: Children) => total + Number(product.qty), 0)}
                      </td>
                      <td></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default KitType
