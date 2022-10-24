import React from 'react'
import { Button, Card, CardBody, CardHeader, Col, Row } from 'reactstrap'
// import Animation from '@components/Common/Animation'
import { OrderRowType, ShipmentOrderItem } from '@typings'

// import dynamic from 'next/dynamic';
// const Animation = dynamic(() => import('@components/Common/Animation'), {
//     ssr: false
// });

type Props = {
  data: OrderRowType
}

const ReceivingType = ({ data }: Props) => {
  return (
    <div style={{ backgroundColor: '#f3f3f9', padding: '10px' }}>
      <Row>
        <Col xl={4}>
          <Col xl={12}>
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
                      <td className="fw-bold">Type of Service:</td>
                      <td>{data.carrierService}</td>
                    </tr>
                    <tr>
                      <td className="fw-bold"># Of Pallets:</td>
                      <td>{data.numberPallets}</td>
                    </tr>
                    <tr>
                      <td className="fw-bold"># Of Boxes:</td>
                      <td>{data.numberBoxes}</td>
                    </tr>
                    <tr>
                      <td className="fw-bold">Shrink Wrap:</td>
                      <td>{data.shrinkWrap}</td>
                    </tr>
                    <tr>
                      <td className="fw-bold">Man Hours:</td>
                      <td>{data.manHours}</td>
                    </tr>
                  </tbody>
                </table>
              </CardBody>
            </Card>
          </Col>
          <Col xl={12}>
            <Card>
              <CardHeader>
                <h5 className="fw-bold">Charge Details</h5>
              </CardHeader>
              <CardBody>
                <table className="table table-sm table-bordered table-nowrap mb-0">
                  <tbody>
                    <tr>
                      <td className="fw-bold">Service</td>
                      <td>$ {data.receivingService.toFixed(2)}</td>
                    </tr>
                    <tr>
                      <td className="fw-bold">Pallets</td>
                      <td>$ {data.receivingPallets.toFixed(2)}</td>
                    </tr>
                    <tr>
                      <td className="fw-bold">Wrap Service</td>
                      <td>$ {data.receivingWrapService.toFixed(2)}</td>
                    </tr>
                    <tr>
                      <td className="fw-bold">Man Hour</td>
                      <td>$ {data.manHour.toFixed(2)}</td>
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
                      <th scope="col">Qty</th>
                      <th scope="col">Qty Received</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.orderItems.map((product: ShipmentOrderItem, key) => (
                      <tr key={key}>
                        <td className="w-75 fs-15 fw-bold text-primary">
                          {product.name || ''}
                        </td>
                        <td className="fs-15">{product.sku}</td>
                        <td className="text-center">{product.quantity}</td>
                        <td className="text-center">{product.qtyReceived}</td>
                      </tr>
                    ))}
                    <tr className="bg-primary text-white fw-bolder">
                      <td></td>
                      <td className="text-end text-nowrap">Total QTY</td>
                      <td className="text-center">{data.totalItems}</td>
                      <td className="text-center">{data.totalReceivedItems}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardBody>
          </Card>
        </Col>
      </Row>
      <Row>
        <Col xl={12} className="d-flex justify-content-end align-items-end">
          <Card>
            {data.proofOfShipped != '' && data.proofOfShipped != null && (
              <a href={data.proofOfShipped} target="blank">
                <Button color="info" className="btn-label">
                  <i className="las la-truck label-icon align-middle fs-16 me-2" />
                  Proof Of Received
                </Button>
              </a>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default ReceivingType
