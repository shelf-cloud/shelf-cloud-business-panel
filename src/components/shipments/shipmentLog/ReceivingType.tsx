import { useContext } from 'react'

import AppContext from '@context/AppContext'
import { FormatCurrency, FormatIntNumber } from '@lib/FormatNumbers'
import { Shipment, ShipmentOrderItem } from '@typesTs/shipments/shipments'
import { Card, CardBody, CardHeader, Col, Row } from 'reactstrap'

type Props = {
  data: Shipment
}

const ReceivingType = ({ data }: Props) => {
  const { state }: any = useContext(AppContext)
  return (
    <div className='w-100' style={{ backgroundColor: '#F0F4F7', padding: '0px' }}>
      <Row>
        <Col xs={12} lg={8}>
          <Card>
            <CardHeader className='py-3'>
              <h5 className='fw-semibold m-0'>Products</h5>
            </CardHeader>
            <CardBody>
              <div className='table-responsive'>
                <table className='table table-sm align-middle table-borderless mb-0'>
                  <thead className='table-light'>
                    <tr>
                      <th scope='col'>Title</th>
                      <th scope='col'>Sku</th>
                      <th className='text-center' scope='col'>
                        Qty
                      </th>
                      <th className='text-center' scope='col'>
                        Qty Received
                      </th>
                    </tr>
                  </thead>
                  <tbody className='fs-7'>
                    {data.orderItems?.map((product: ShipmentOrderItem, key: any) => (
                      <tr key={key} className='border-bottom py-2'>
                        <td className='w-50 fw-semibold'>{product.title || product.name}</td>
                        <td className='text-muted'>{product.sku}</td>
                        <td className='text-center'>{FormatIntNumber(state.currentRegion, Number(product.quantity))}</td>
                        <td className='text-center'>{FormatIntNumber(state.currentRegion, Number(product.qtyReceived))}</td>
                      </tr>
                    ))}
                    <tr className='bg-light'>
                      <td></td>
                      <td className='text-start fs-6 fw-bold text-nowrap'>Total</td>
                      <td className='text-center fw-semibold fs-6 text-primary'>{FormatIntNumber(state.currentRegion, Number(data.totalItems))}</td>
                      <td className='text-center fw-semibold fs-6 text-primary'>{FormatIntNumber(state.currentRegion, Number(data.totalReceivedItems))}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardBody>
          </Card>
        </Col>
        <Col xs={12} lg={4}>
          <Col xl={12}>
            <Card>
              <CardHeader className='py-3'>
                <h5 className='fw-semibold m-0'>Receiving Details</h5>
              </CardHeader>
              <CardBody>
                <table className='table table-sm table-borderless'>
                  <tbody className='fs-7'>
                    <tr>
                      <td className='text-muted text-nowrap'>Type of Service:</td>
                      <td className='fw-semibold w-100'>{data.carrierService}</td>
                    </tr>
                    <tr>
                      <td className='text-muted text-nowrap'># Of Pallets:</td>
                      <td className='fw-semibold w-100'>{data.numberPallets}</td>
                    </tr>
                    <tr>
                      <td className='text-muted text-nowrap'># Of Boxes:</td>
                      <td className='fw-semibold w-100'>{data.numberBoxes}</td>
                    </tr>
                    <tr>
                      <td className='text-muted text-nowrap'>Shrink Wrap:</td>
                      <td className='fw-semibold w-100'>{data.shrinkWrap}</td>
                    </tr>
                    <tr>
                      <td className='text-muted text-nowrap'>Man Hours:</td>
                      <td className='fw-semibold w-100'>{data.manHours}</td>
                    </tr>
                  </tbody>
                </table>
              </CardBody>
            </Card>
          </Col>
          <Col xl={12}>
            <Card>
              <CardHeader className='py-3'>
                <h5 className='fw-semibold m-0'>Charge Details</h5>
              </CardHeader>
              <CardBody>
                <table className='table table-sm table-borderless table-nowrap mb-0'>
                  <tbody className='fs-7'>
                    <tr className='border-bottom pb-2'>
                      <td className='text-muted'>Service</td>
                      <td className='fw-semibold text-end'>{FormatCurrency(state.currentRegion, data.receivingService)}</td>
                    </tr>
                    <tr className='border-bottom pb-2'>
                      <td className='text-muted'>Pallets</td>
                      <td className='fw-semibold text-end'>{FormatCurrency(state.currentRegion, data.receivingPallets)}</td>
                    </tr>
                    <tr className='border-bottom pb-2'>
                      <td className='text-muted'>Wrap Service</td>
                      <td className='fw-semibold text-end'>{FormatCurrency(state.currentRegion, data.receivingWrapService)}</td>
                    </tr>
                    <tr className='border-bottom pb-2'>
                      <td className='text-muted'>Man Hour</td>
                      <td className='fw-semibold text-end'>{FormatCurrency(state.currentRegion, data.manHour)}</td>
                    </tr>
                    <tr className='border-bottom pb-2'>
                      <td className='text-muted'>Extra Charge</td>
                      <td className='fw-semibold text-end'>{FormatCurrency(state.currentRegion, data.extraCharge)}</td>
                    </tr>
                    <tr>
                      <td className='fw-bold'>TOTAL</td>
                      <td className='text-primary fw-semibold text-end'>{FormatCurrency(state.currentRegion, data.totalCharge)}</td>
                    </tr>
                  </tbody>
                </table>
              </CardBody>
            </Card>
          </Col>
          {data.extraComment != '' && (
            <Col xl={12}>
              <Card>
                <CardHeader className='py-3'>
                  <h5 className='fw-semibold m-0'>Order Comment</h5>
                </CardHeader>
                <CardBody>
                  <p>{data.extraComment}</p>
                </CardBody>
              </Card>
            </Col>
          )}
        </Col>
      </Row>
    </div>
  )
}

export default ReceivingType
