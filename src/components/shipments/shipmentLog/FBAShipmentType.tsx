/* eslint-disable @next/next/no-img-element */
import { useContext } from 'react'

import TooltipComponent from '@components/constants/Tooltip'
import AppContext from '@context/AppContext'
import { FormatCurrency } from '@lib/FormatNumbers'
import { CleanSpecialCharacters } from '@lib/SkuFormatting'
import { NoImageAdress } from '@lib/assetsConstants'
import { KitChildren, Shipment, ShipmentOrderItem } from '@typesTs/shipments/shipments'
import moment from 'moment'
import { Card, CardBody, CardHeader, Col, Row } from 'reactstrap'

import ShipmentCarrierStatusBar from './ShipmentCarrierStatusBar'
import ShipmentTrackingNumber from './ShipmentTrackingNumber'

type Props = {
  data: Shipment
}

const FBAServiceFees = (data: Shipment, currentRegion: string) => {
  switch (true) {
    case !data.isIndividualUnits && data.carrierService == 'Parcel Boxes':
      return `${data.carrierService} - ${FormatCurrency(currentRegion, data.chargesFees.parcelBoxCost!)} per box`
    case !data.isIndividualUnits && data.carrierService == 'LTL':
      return `${data.carrierService} - ${FormatCurrency(currentRegion, data.chargesFees.palletCost!)} per pallet`
    case data.isIndividualUnits:
      return `
            ${data.carrierService} - ${FormatCurrency(currentRegion, data.chargesFees.individualUnitCost!)} per unit
            ${data.carrierService} - ${FormatCurrency(currentRegion, data.chargesFees.parcelBoxCost!)} per box
            ${data.carrierService} - ${FormatCurrency(currentRegion, data.chargesFees.palletCost!)} per pallet
            `
    default:
      return `Type of service...`
  }
}
const FBAShipmentType = ({ data }: Props) => {
  const { state }: any = useContext(AppContext)
  const { currentRegion } = state
  const OrderId = CleanSpecialCharacters(data.orderId)

  return (
    <div className='w-100' style={{ backgroundColor: '#F0F4F7', padding: '0px' }}>
      {data.carrierStatus && (
        <Row>
          <Col xs={12}>
            <ShipmentCarrierStatusBar carrier={data.carrierUsed} currentStatus={data.carrierStatus} />
          </Col>
        </Row>
      )}
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
                    </tr>
                  </thead>
                  <tbody className='fs-7'>
                    {data.orderItems.map((product: ShipmentOrderItem, key) => (
                      <tr key={key} className='border-bottom py-2'>
                        <td className='w-75 fw-semibold'>
                          {product.title || product.name}
                          {product.isKit === true &&
                            product.children.length > 0 &&
                            product.children.map((child: KitChildren) => (
                              <p className='m-0 p-0 text-muted fw-light' key={child.orderChildrenId}>
                                {`- ${child.title === undefined ? child.name : child.title} Qty: ${child.quantity}`}
                              </p>
                            ))}
                        </td>
                        <td className='text-muted'>{product.sku}</td>
                        <td className='text-center'>{product.quantity}</td>
                      </tr>
                    ))}
                    <tr className='bg-light fs-6'>
                      <td></td>
                      <td className='text-start fw-bold text-nowrap'>Total</td>
                      <td className='text-center text-primary fw-semibold'>{data.totalItems}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardBody>
          </Card>
        </Col>
        <Col xs={12} lg={4}>
          <Col xs={12}>
            <Card className='h-100'>
              <CardHeader className='py-3'>
                <h5 className='fw-semibold m-0'>Order Summary</h5>
              </CardHeader>
              <CardBody>
                <Row className='m-0 p-0 d-flex flex-row justify-content-between align-items-start'>
                  <Col xs={6} className='m-0 p-0'>
                    <span className='text-muted fs-7'>Store:</span>
                    <div className='d-flex flex-column justify-content-start align-items-start gap-2'>
                      <img
                        loading='lazy'
                        src={data.channelLogo ? data.channelLogo : NoImageAdress}
                        alt='product Image'
                        id={`ChannelLogo-${data.id}`}
                        style={{
                          width: '20px',
                          height: '20px',
                          objectFit: 'contain',
                        }}
                      />
                      <span className='fs-7 fw-semibold'>{data.storeName}</span>
                    </div>
                    <span className='text-muted fs-7'>Order Date:</span>
                    <p className='fs-7 fw-semibold m-0'>{moment.utc(data.orderDate).format('LL')}</p>
                    <span className='text-muted fs-7'>Closed Date:</span>
                    {data.closedDate && <p className='fs-7 fw-semibold m-0'>{moment.utc(data.closedDate).format('LL')}</p>}
                  </Col>
                  {/* <Col xs={6} className='m-0 p-0'>
                    <table className='table table-sm table-borderless table-nowrap m-0'>
                      <tbody className='fs-7'>
                        <tr className='border-bottom pb-2'>
                          <td className='text-muted'>Subtotal</td>
                          <td className='fw-semibold text-end'>{FormatCurrency(state.currentRegion, data.subtotal)}</td>
                        </tr>
                        <tr className='border-bottom pb-2'>
                          <td className='text-muted'>Shipping</td>
                          <td className='fw-semibold text-end'>{FormatCurrency(state.currentRegion, data.salesShipping > 0 ? data.salesShipping : data.orderShipping)}</td>
                        </tr>
                        <tr className='border-bottom pb-2'>
                          <td className='text-muted'>Tax</td>
                          <td className='fw-semibold text-end'>{FormatCurrency(state.currentRegion, data.salesTax)}</td>
                        </tr>
                        <tr className='border-bottom pb-2'>
                          <td className='text-muted'>Discount</td>
                          <td className='fw-semibold text-end'>{FormatCurrency(state.currentRegion, data.discount)}</td>
                        </tr>
                        <tr>
                          <td className='fw-semibold text-end'>TOTAL Order</td>
                          <td className='text-primary fw-semibold text-end'>{FormatCurrency(state.currentRegion, data.orderTotal)}</td>
                        </tr>
                        <tr>
                          <td className='fw-semibold text-end'>TOTAL Paid</td>
                          <td className='text-primary fw-semibold text-end'>{FormatCurrency(state.currentRegion, data.orderPaid)}</td>
                        </tr>
                      </tbody>
                    </table>
                  </Col> */}
                </Row>
              </CardBody>
            </Card>
          </Col>
          <Col xs={12}>
            <Card className='h-100'>
              <CardHeader className='py-3'>
                <h5 className='fw-semibold m-0'>Shipping</h5>
              </CardHeader>
              <CardBody>
                <table className='table table-sm table-borderless table-nowrap m-0'>
                  <tbody className='fs-7'>
                    <tr>
                      <td className='text-muted text-nowrap'>Carrier:</td>
                      <td className='fw-semibold w-100 capitalize'>{data.carrierUsed}</td>
                    </tr>
                    <tr>
                      <td className='text-muted text-nowrap'>Service Requested:</td>
                      <td className='fw-semibold w-100 capitalize'>{data.carrierService}</td>
                    </tr>
                    <tr>
                      <td className='text-muted text-nowrap'>Service Used:</td>
                      <td className='fw-semibold w-100 capitalize'>{data.carrierType}</td>
                    </tr>
                    <tr>
                      <td className='text-muted text-nowrap'># Of Pallets:</td>
                      <td className='fw-semibold w-100'>{data.numberPallets}</td>
                    </tr>
                    <tr>
                      <td className='text-muted text-nowrap'># Of Boxes:</td>
                      <td className='fw-semibold w-100'>{data.numberBoxes}</td>
                    </tr>
                    {/* <tr>
                      <td className='text-muted text-nowrap'>Customer Name:</td>
                      <td className='fw-semibold w-100 capitalize'>{data.shipName}</td>
                    </tr>
                    <tr>
                      <td className='text-muted text-nowrap'>Address:</td>
                      <td className='fw-semibold w-100 text-wrap'>
                        <p className='m-0 p-0'>{data.shipStreet}</p>
                        <p className='m-0 p-0'>
                          {data.shipCity}, {data.shipState}, {data.shipZipcode}, {data.shipCountry}
                        </p>
                      </td>
                    </tr> */}
                  </tbody>
                </table>
                <div className='px-1 fs-7'>
                  <span className='m-0 text-muted fs-7'>Tracking No.</span>
                  <ShipmentTrackingNumber
                    orderStatus={data.orderStatus}
                    orderType={data.orderType}
                    trackingNumber={data.trackingNumber}
                    trackingLink={data.trackingLink}
                    carrierIcon={data.carrierIcon}
                    carrierService={data.carrierService}
                  />
                </div>
              </CardBody>
            </Card>
          </Col>
          <Col xs={12}>
            <Card>
              <CardHeader className='py-3'>
                <h5 className='fw-semibold m-0'>Charge Details</h5>
              </CardHeader>
              <CardBody>
                <table className='table table-sm table-borderless table-nowrap mb-0'>
                  <tbody className='fs-7'>
                    <tr className='border-bottom pb-2'>
                      <td className='text-muted d-flex flex-row justify-content-start align-items-start'>
                        Pick Pack Charge
                        {data.chargesFees && (
                          <>
                            <i className='ri-information-fill ms-1 fs-6 text-muted' id={`tooltip${OrderId}`}></i>
                            <TooltipComponent target={`tooltip${OrderId}`} text={FBAServiceFees(data, currentRegion)} />
                          </>
                        )}
                      </td>
                      <td className='fw-semibold text-end'>{FormatCurrency(state.currentRegion, data.pickpackCharge)}</td>
                    </tr>
                    <tr className='border-bottom pb-2'>
                      <td className='text-muted'>Shipping Charge</td>
                      <td className='fw-semibold text-end'>{FormatCurrency(state.currentRegion, data.onixShipping)}</td>
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

export default FBAShipmentType
