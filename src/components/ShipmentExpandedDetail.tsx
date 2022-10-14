import { OrderRowType } from '@typings'
import React from 'react'
import { ExpanderComponentProps } from 'react-data-table-component'
import { Card, CardBody, CardHeader, Col, Row } from 'reactstrap'
import Animation from '@components/Common/Animation'

const ShipmentExpandedDetail: React.FC<
  ExpanderComponentProps<OrderRowType>
> = ({ data }) => {
  return (
    <div>
      {data.orderType == 'Shipment' && (
        <Card>
          <Row>
            <Col xl={4}>
              <Card>
                <CardHeader className="d-flex flex-row justify-content-between align-items-center">
                  <h5 className="m-0 fw-bold">Shipping</h5>
                  {/* <Animation src="https://cdn.lordicon.com/uetqnvvg.json"/> */}
                </CardHeader>
                <CardBody>
                  <table>
                    <tbody>
                      <tr>
                        <td>Service Requested:</td>
                        <td>{data.carrierService}</td>
                      </tr>
                      <tr>
                        <td>Service Used:</td>
                        <td>{data.carrierType}</td>
                      </tr>
                      <tr>
                        <td>Customer Name:</td>
                        <td>{data.shipName}</td>
                      </tr>
                      <tr>
                        <td>Address:</td>
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
                    <table className="table table-sm table-nowrap align-middle table-borderless mb-0">
                      <thead className="table-light text-muted">
                        <tr>
                          <th scope="col">Title</th>
                          <th scope="col">Sku</th>
                          <th scope="col">Unit Price</th>
                          <th scope="col">Qty</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.orderItems.map((product, key) => (
                          <tr key={key}>
                            <td>
                              <h5 className="fs-15 fw-bold text-primary">
                                {product.name}
                              </h5>
                            </td>
                            <td>
                              <h5 className="fs-15">{product.sku}</h5>
                            </td>
                            <td>$ {product.unitPrice.toFixed(2)}</td>
                            <td>{product.quantity}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardBody>
              </Card>
            </Col>
          </Row>
          <Row>
            <Col xl={6}>
              <Card>
                <CardHeader>
                  <h5 className="fw-bold">Charge Details</h5>
                </CardHeader>
              </Card>
            </Col>
            <Col xl={6}>
              <div className="lastSection_container"></div>
            </Col>
          </Row>
        </Card>
      )}
    </div>
  )
}

export default ShipmentExpandedDetail
