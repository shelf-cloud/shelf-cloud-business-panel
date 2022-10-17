import React from 'react'
import { Card, CardBody, CardHeader, Col, Row } from 'reactstrap'
// import Animation from '@components/Common/Animation'
import { OrderRowType, ShipmentOrderItem } from '@typings'

// import dynamic from 'next/dynamic';
// const Animation = dynamic(() => import('@components/Common/Animation'), {
//     ssr: false
// });

type Props = {
  data: OrderRowType
}

const ShipmentType = ({ data }: Props) => {
  return (
    <div style={{ backgroundColor: '#f3f3f9', padding: '10px' }}>
      <Row>
        <Col xl={4}>
          <Card>
            <CardHeader className="d-flex flex-row justify-content-between align-items-center position-relative">
              <h5 className="fw-bold">Shipping</h5>
              {/* <div style={{ position: 'absolute', right: '0px' }}>
                <Animation
                  src="https://cdn.lordicon.com/uetqnvvg.json"
                  colors="primary:#405189,secondary:#0ab39c"
                  style={{ width: '50px', height: '50px' }}
                />
              </div> */}
            </CardHeader>
            <CardBody>
              <table className="table table-sm">
                <tbody>
                  <tr>
                    <td className="fw-bold">Service Requested:</td>
                    <td>{data.carrierService}</td>
                  </tr>
                  <tr>
                    <td className="fw-bold">Service Used:</td>
                    <td>{data.carrierType}</td>
                  </tr>
                  <tr>
                    <td className="fw-bold">Customer Name:</td>
                    <td>{data.shipName}</td>
                  </tr>
                  <tr>
                    <td className="fw-bold">Address:</td>
                    <td>
                      {data.shipStreet}, {data.shipCity}, {data.shipState},{' '}
                      {data.shipZipcode}, {data.shipCountry}
                    </td>
                  </tr>
                </tbody>
              </table>
            </CardBody>
          </Card>
        </Col>
        <Col xl={8}>
          <Card>
            <CardHeader>
              <h5 className="fw-bold">Products</h5>
            </CardHeader>
            <CardBody>
              <div className="table-responsive table-card">
                <table className="table table-sm align-middle table-borderless mb-0">
                  <thead className="table-light text-muted">
                    <tr>
                      <th scope="col">Title</th>
                      <th scope="col">Sku</th>
                      <th scope="col">Unit Price</th>
                      <th scope="col">Qty</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.orderItems.map((product: ShipmentOrderItem, key) => (
                      <tr key={key}>
                        <td className="w-75 fs-15 fw-bold text-primary">
                          {product.name || ''}
                        </td>
                        <td className="fs-15">{product.sku}</td>
                        <td className="text-center">
                          $ {product.unitPrice.toFixed(2)}
                        </td>
                        <td className="text-center">{product.quantity}</td>
                      </tr>
                    ))}
                    <tr className="bg-primary text-white fw-bolder">
                      <td></td>
                      <td></td>
                      <td className="text-end">Total QTY</td>
                      <td className="text-center">{data.totalItems}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardBody>
          </Card>
        </Col>
      </Row>
      <Row>
        <Col xl={4}>
          <Card>
            <CardHeader>
              <h5 className="fw-bold">Charge Details</h5>
            </CardHeader>
            <CardBody>
              <table className="table table-sm table-bordered table-nowrap mb-0">
                <tbody>
                  <tr>
                    <td className="fw-bold">Pick Pack Charge</td>
                    <td>$ {data.pickpackCharge.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td className="fw-bold">Shipping Charge</td>
                    <td>$ {data.onixShipping.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td className="fw-bold">Extra Charge</td>
                    <td>$ {data.extraCharge.toFixed(2)}</td>
                  </tr>
                  <tr className="bg-primary text-white fw-semibold">
                    <td className="fw-bold">TOTAL</td>
                    <td>$ {data.totalCharge.toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>
            </CardBody>
          </Card>
        </Col>
        <Col xl={6}>
          <div className="lastSection_container"></div>
        </Col>
      </Row>
    </div>
  )
}

export default ShipmentType
