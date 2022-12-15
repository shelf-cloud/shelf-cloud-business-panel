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

const WholeSaleType = ({ data }: Props) => {
  return (
    <div style={{ backgroundColor: '#F0F4F7', padding: '10px' }}>
      <Row>
        <Col xl={4}>
          <Col xl={12}>
            <Card>
              <CardHeader className="py-3">
                <h5 className="fw-semibold m-0">Shipping</h5>
              </CardHeader>
              <CardBody>
                <table className="table table-sm table-borderless">
                  <tbody>
                    <tr>
                      <td className="text-muted text-nowrap">
                        Service Requested:
                      </td>
                      <td className="fw-semibold w-100">
                        {data.carrierService}
                      </td>
                    </tr>
                    <tr>
                      <td className="text-muted text-nowrap">Service Used:</td>
                      <td className="fw-semibold w-100">{data.carrierType}</td>
                    </tr>
                    <tr>
                      <td className="text-muted text-nowrap"># Of Pallets:</td>
                      <td className="fw-semibold w-100">
                        {data.numberPallets}
                      </td>
                    </tr>
                    <tr>
                      <td className="text-muted text-nowrap"># Of Boxes:</td>
                      <td className="fw-semibold w-100">{data.numberBoxes}</td>
                    </tr>
                    {data.isThird && (
                      <tr>
                        <td className="text-muted text-nowrap">
                          Third Party Shipping Info:
                        </td>
                        <td className="fw-semibold w-100">{data.thirdInfo}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </CardBody>
            </Card>
          </Col>
          <Col xl={12}>
            <Card>
              <CardHeader className="py-3">
                <h5 className="fw-semibold m-0">Charge Details</h5>
              </CardHeader>
              <CardBody>
                <table className="table table-sm table-borderless table-nowrap mb-0">
                  <tbody>
                    <tr className="border-bottom pb-2">
                      <td className="text-muted">Pick Pack Charge</td>
                      <td className="fw-semibold text-end">
                        $ {data.pickpackCharge.toFixed(2)}
                      </td>
                    </tr>
                    <tr className="border-bottom pb-2">
                      <td className="text-muted">Shipping Charge</td>
                      <td className="fw-semibold text-end">
                        $ {data.onixShipping.toFixed(2)}
                      </td>
                    </tr>
                    <tr className="border-bottom pb-2">
                      <td className="text-muted">Labeling</td>
                      <td className="fw-semibold text-end">
                        $ {data.labeling.toFixed(2)}
                      </td>
                    </tr>
                    <tr className="border-bottom pb-2">
                      <td className="text-muted">Man Hour</td>
                      <td className="fw-semibold text-end">
                        $ {data.manHour.toFixed(2)}
                      </td>
                    </tr>
                    <tr className="border-bottom pb-2">
                      <td className="text-muted">Extra Charge</td>
                      <td className="fw-semibold text-end">
                        $ {data.extraCharge.toFixed(2)}
                      </td>
                    </tr>
                    <tr>
                      <td className="fw-bold">TOTAL</td>
                      <td className="text-primary fw-semibold text-end">
                        $ {data.totalCharge.toFixed(2)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </CardBody>
            </Card>
          </Col>
          {data.extraComment != '' && (
            <Col xl={12}>
              <Card>
                <CardHeader className="py-3">
                  <h5 className="fw-semibold m-0">Order Comment</h5>
                </CardHeader>
                <CardBody>
                  <p>{data.extraComment}</p>
                </CardBody>
              </Card>
            </Col>
          )}
        </Col>
        <Col xl={8}>
          <Card>
            <CardHeader className="py-3">
              <h5 className="fw-semibold m-0">Products</h5>
            </CardHeader>
            <CardBody>
              <div className="table-responsive">
                <table className="table table-sm align-middle table-borderless mb-0">
                  <thead className="table-light">
                    <tr>
                      <th scope="col">Title</th>
                      <th scope="col">Sku</th>
                      <th className="text-center" scope="col">
                        Qty
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.orderItems.map((product: ShipmentOrderItem, key) => (
                      <tr key={key} className="border-bottom py-2">
                        <td className="w-75 fs-6 fw-semibold">
                          {product.name || ''}
                        </td>
                        <td className="fs-6 text-muted">{product.sku}</td>
                        <td className="text-center">{product.quantity}</td>
                      </tr>
                    ))}
                    <tr>
                      <td className="text-start fs-5 fw-bold text-nowrap">
                        Total QTY
                      </td>
                      <td></td>
                      <td className="text-center fw-bold fs-5 text-primary">
                        {data.totalItems}
                      </td>
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
          <Card className="m-0">
            {data.proofOfShipped != '' && data.proofOfShipped != null && (
              <a href={data.proofOfShipped} target="blank">
                <Button color="info" className="btn-label">
                  <i className="las la-truck label-icon align-middle fs-3 me-2" />
                  Proof Of Shipped
                </Button>
              </a>
            )}

            {data.labelsName != '' && (
              <a
                href={`https://firebasestorage.googleapis.com/v0/b/etiquetas-fba.appspot.com/o/shelf-cloud%2F${data.labelsName}?alt=media&token=837cdbcf-11ab-4555-9697-50f1c6a3d0e3`}
                target="blank"
              >
                <Button color="secondary" className="btn-label">
                  <i className="las la-toilet-paper label-icon align-middle fs-3 me-2" />
                  Labels
                </Button>
              </a>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default WholeSaleType
