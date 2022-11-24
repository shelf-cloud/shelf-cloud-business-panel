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
                      <td className="fw-bold">Service Requested:</td>
                      <td>{data.carrierService}</td>
                    </tr>
                    <tr>
                      <td className="fw-bold">Service Used:</td>
                      <td>{data.carrierType}</td>
                    </tr>
                    <tr>
                      <td className="fw-bold"># Of Pallets:</td>
                      <td>{data.numberPallets}</td>
                    </tr>
                    <tr>
                      <td className="fw-bold"># Of Boxes:</td>
                      <td>{data.numberBoxes}</td>
                    </tr>
                    {data.isThird && (
                      <tr>
                        <td className="fw-bold">Third Party Shipping Info:</td>
                        <td>{data.thirdInfo}</td>
                      </tr>
                    )}
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
                      <td className="fw-bold">Pick Pack Charge</td>
                      <td>$ {data.pickpackCharge.toFixed(2)}</td>
                    </tr>
                    <tr>
                      <td className="fw-bold">Shipping Charge</td>
                      <td>$ {data.onixShipping.toFixed(2)}</td>
                    </tr>
                    <tr>
                      <td className="fw-bold">Labeling</td>
                      <td>$ {data.labeling.toFixed(2)}</td>
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
              <div className="table-responsive">
                <table className="table table-sm align-middle table-borderless mb-0">
                  <thead className="table-light text-muted">
                    <tr>
                      <th scope="col">Title</th>
                      <th scope="col">Sku</th>
                      <th scope="col">Qty</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.orderItems.map((product: ShipmentOrderItem, key) => (
                      <tr key={key}>
                        <td className="w-50 fs-6 fw-semibold text-primary">
                          {product.name || ''}
                        </td>
                        <td className="fs-6">{product.sku}</td>
                        <td className="text-center">{product.quantity}</td>
                      </tr>
                    ))}
                    <tr className="bg-primary text-white fw-bolder">
                      <td></td>
                      <td className="text-end text-nowrap">Total QTY</td>
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
        <Col xl={12} className="d-flex justify-content-end align-items-end">
          <Card>
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
