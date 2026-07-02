/* eslint-disable @next/next/no-img-element */
import { useContext } from 'react'

import TooltipComponent from '@components/constants/Tooltip'
import AppContext from '@context/AppContext'
import { FormatCurrency } from '@lib/FormatNumbers'
import { CleanSpecialCharacters } from '@lib/SkuFormatting'
import { NoImageAdress } from '@lib/assetsConstants'
import { KitChildren, Shipment, ShipmentOrderItem } from '@typesTs/shipments/shipments'
import moment from 'moment'
import { Card, CardBody, CardHeader, Col, Row } from '@/components/migration-ui'

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
    <div className='tw:w-full' style={{ backgroundColor: '#F0F4F7', padding: '0px' }}>
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
            <CardHeader className='tw:py-4'>
              <h5 className='tw:font-semibold tw:m-0'>Products</h5>
            </CardHeader>
            <CardBody>
              <div className='tw:overflow-x-auto'>
                <table className='tw:w-full tw:align-middle tw:mb-0 tw:[&_th]:px-2 tw:[&_th]:py-1 tw:[&_td]:px-2 tw:[&_td]:py-1'>
                  <thead className='tw:bg-[color:var(--vz-light)]'>
                    <tr>
                      <th scope='col'>Title</th>
                      <th scope='col'>Sku</th>
                      <th className='tw:text-center' scope='col'>
                        Qty
                      </th>
                    </tr>
                  </thead>
                  <tbody className='tw:text-[11.2px]'>
                    {data.orderItems.map((product: ShipmentOrderItem, key) => (
                      <tr key={key} className='tw:border-b tw:py-2'>
                        <td className='tw:w-3/4 tw:font-semibold'>
                          {product.title || product.name}
                          {product.isKit === true &&
                            product.children.length > 0 &&
                            product.children.map((child: KitChildren) => (
                              <p className='tw:m-0 tw:p-0 tw:text-[var(--bs-secondary-color)] tw:font-light' key={child.orderChildrenId}>
                                {`- ${child.title === undefined ? child.name : child.title} Qty: ${child.quantity}`}
                              </p>
                            ))}
                        </td>
                        <td className='tw:text-[var(--bs-secondary-color)]'>{product.sku}</td>
                        <td className='tw:text-center'>{product.quantity}</td>
                      </tr>
                    ))}
                    <tr className='tw:bg-light tw:text-[13px]'>
                      <td></td>
                      <td className='tw:text-left tw:font-bold tw:text-nowrap'>Total</td>
                      <td className='tw:text-center tw:text-primary tw:font-semibold'>{data.totalItems}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardBody>
          </Card>
        </Col>
        <Col xs={12} lg={4}>
          <Col xs={12}>
            <Card className='tw:h-full'>
              <CardHeader className='tw:py-4'>
                <h5 className='tw:font-semibold tw:m-0'>Order Summary</h5>
              </CardHeader>
              <CardBody>
                <Row className='tw:m-0 tw:p-0 tw:flex tw:flex-row tw:justify-between tw:items-start'>
                  <Col xs={6} className='tw:m-0 tw:p-0'>
                    <span className='tw:text-[var(--bs-secondary-color)] tw:text-[11.2px]'>Store:</span>
                    <div className='tw:flex tw:flex-col tw:justify-start tw:items-start tw:gap-2'>
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
                      <span className='tw:text-[11.2px] tw:font-semibold'>{data.storeName}</span>
                    </div>
                    <span className='tw:text-[var(--bs-secondary-color)] tw:text-[11.2px]'>Order Date:</span>
                    <p className='tw:text-[11.2px] tw:font-semibold tw:m-0'>{moment.utc(data.orderDate).format('LL')}</p>
                    <span className='tw:text-[var(--bs-secondary-color)] tw:text-[11.2px]'>Closed Date:</span>
                    {data.closedDate && <p className='tw:text-[11.2px] tw:font-semibold tw:m-0'>{moment.utc(data.closedDate).format('LL')}</p>}
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
            <Card className='tw:h-full'>
              <CardHeader className='tw:py-4'>
                <h5 className='tw:font-semibold tw:m-0'>Shipping</h5>
              </CardHeader>
              <CardBody>
                <table className='tw:w-full tw:whitespace-nowrap tw:m-0 tw:[&_th]:px-2 tw:[&_th]:py-1 tw:[&_td]:px-2 tw:[&_td]:py-1'>
                  <tbody className='tw:text-[11.2px]'>
                    <tr>
                      <td className='tw:text-[var(--bs-secondary-color)] tw:text-nowrap'>Carrier:</td>
                      <td className='tw:font-semibold tw:w-full tw:capitalize'>{data.carrierUsed}</td>
                    </tr>
                    <tr>
                      <td className='tw:text-[var(--bs-secondary-color)] tw:text-nowrap'>Service Requested:</td>
                      <td className='tw:font-semibold tw:w-full tw:capitalize'>{data.carrierService}</td>
                    </tr>
                    <tr>
                      <td className='tw:text-[var(--bs-secondary-color)] tw:text-nowrap'>Service Used:</td>
                      <td className='tw:font-semibold tw:w-full tw:capitalize'>{data.carrierType}</td>
                    </tr>
                    <tr>
                      <td className='tw:text-[var(--bs-secondary-color)] tw:text-nowrap'># Of Pallets:</td>
                      <td className='tw:font-semibold tw:w-full'>{data.numberPallets}</td>
                    </tr>
                    <tr>
                      <td className='tw:text-[var(--bs-secondary-color)] tw:text-nowrap'># Of Boxes:</td>
                      <td className='tw:font-semibold tw:w-full'>{data.numberBoxes}</td>
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
                <div className='tw:px-1 tw:text-[11.2px]'>
                  <span className='tw:m-0 tw:text-[var(--bs-secondary-color)] tw:text-[11.2px]'>Tracking No.</span>
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
              <CardHeader className='tw:py-4'>
                <h5 className='tw:font-semibold tw:m-0'>Charge Details</h5>
              </CardHeader>
              <CardBody>
                <table className='tw:w-full tw:whitespace-nowrap tw:mb-0 tw:[&_th]:px-2 tw:[&_th]:py-1 tw:[&_td]:px-2 tw:[&_td]:py-1'>
                  <tbody className='tw:text-[11.2px]'>
                    <tr className='tw:border-b tw:pb-2'>
                      <td className='tw:text-[var(--bs-secondary-color)] tw:flex tw:flex-row tw:justify-start tw:items-start'>
                        Pick Pack Charge
                        {data.chargesFees && (
                          <>
                            <i className='ri-information-fill ms-1 fs-6 text-muted' id={`tooltip${OrderId}`}></i>
                            <TooltipComponent target={`tooltip${OrderId}`} text={FBAServiceFees(data, currentRegion)} />
                          </>
                        )}
                      </td>
                      <td className='tw:font-semibold tw:text-right'>{FormatCurrency(state.currentRegion, data.pickpackCharge)}</td>
                    </tr>
                    <tr className='tw:border-b tw:pb-2'>
                      <td className='tw:text-[var(--bs-secondary-color)]'>Shipping Charge</td>
                      <td className='tw:font-semibold tw:text-right'>{FormatCurrency(state.currentRegion, data.onixShipping)}</td>
                    </tr>
                    <tr className='tw:border-b tw:pb-2'>
                      <td className='tw:text-[var(--bs-secondary-color)]'>Extra Charge</td>
                      <td className='tw:font-semibold tw:text-right'>{FormatCurrency(state.currentRegion, data.extraCharge)}</td>
                    </tr>
                    <tr>
                      <td className='tw:font-bold'>TOTAL</td>
                      <td className='tw:text-primary tw:font-semibold tw:text-right'>{FormatCurrency(state.currentRegion, data.totalCharge)}</td>
                    </tr>
                  </tbody>
                </table>
              </CardBody>
            </Card>
          </Col>
          {data.extraComment != '' && (
            <Col xl={12}>
              <Card>
                <CardHeader className='tw:py-4'>
                  <h5 className='tw:font-semibold tw:m-0'>Order Comment</h5>
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
