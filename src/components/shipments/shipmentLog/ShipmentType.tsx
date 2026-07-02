/* eslint-disable @next/next/no-img-element */
import { useContext, useState } from 'react'

import TooltipComponent from '@components/constants/Tooltip'
import CancelManualOrderConfirmationModal from '@components/modals/orders/shipments/CancelManualOrderConfirmationModal'
import CreateReturnModal from '@components/modals/shipments/CreateReturnModal'
import AppContext from '@context/AppContext'
import { FormatCurrency } from '@lib/FormatNumbers'
import { CleanSpecialCharacters } from '@lib/SkuFormatting'
import { NoImageAdress } from '@lib/assetsConstants'
import { KitChildren, Shipment, ShipmentOrderItem } from '@typesTs/shipments/shipments'
import moment from 'moment'
import { Button, Card, CardBody, CardHeader, Col, Row } from '@/components/migration-ui'

import ShipmentCarrierStatusBar from './ShipmentCarrierStatusBar'
import ShipmentTrackingNumber from './ShipmentTrackingNumber'

type Props = {
  data: Shipment
  showActions: boolean
  mutateShipments?: () => void
}

const ShipmentType = ({ data, showActions, mutateShipments }: Props) => {
  const { state, setModalCreateReturnInfo }: any = useContext(AppContext)
  const [showDeleteModal, setshowDeleteModal] = useState({
    show: false,
    orderId: 0,
    orderNumber: '',
    goFlowOrderId: 0,
  })
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
          <Row>
            <Col xs={12} lg={6} className='tw:pb-4'>
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
                    <Col xs={6} className='tw:m-0 tw:p-0'>
                      <table className='tw:w-full tw:whitespace-nowrap tw:m-0 tw:text-[11.2px] tw:[&_th]:px-2 tw:[&_th]:py-1 tw:[&_td]:px-2 tw:[&_td]:py-1'>
                        <tbody>
                          <tr className='tw:border-b tw:border-[color:var(--border)]'>
                            <td className='tw:text-[var(--bs-secondary-color)]'>Subtotal</td>
                            <td className='tw:font-semibold tw:text-right'>{FormatCurrency(state.currentRegion, data.subtotal)}</td>
                          </tr>
                          <tr className='tw:border-b tw:border-[color:var(--border)]'>
                            <td className='tw:text-[var(--bs-secondary-color)]'>Shipping</td>
                            <td className='tw:font-semibold tw:text-right'>{FormatCurrency(state.currentRegion, data.salesShipping > 0 ? data.salesShipping : data.orderShipping)}</td>
                          </tr>
                          <tr className='tw:border-b tw:border-[color:var(--border)]'>
                            <td className='tw:text-[var(--bs-secondary-color)]'>Tax</td>
                            <td className='tw:font-semibold tw:text-right'>{FormatCurrency(state.currentRegion, data.salesTax)}</td>
                          </tr>
                          <tr className='tw:border-b tw:border-[color:var(--border)]'>
                            <td className='tw:text-[var(--bs-secondary-color)]'>Discount</td>
                            <td className='tw:font-semibold tw:text-right'>{FormatCurrency(state.currentRegion, data.discount)}</td>
                          </tr>
                          <tr>
                            <td className='tw:font-semibold tw:text-right'>TOTAL Order</td>
                            <td className='tw:text-primary tw:font-semibold tw:text-right'>{FormatCurrency(state.currentRegion, data.orderTotal)}</td>
                          </tr>
                          <tr>
                            <td className='tw:font-semibold tw:text-right'>TOTAL Paid</td>
                            <td className='tw:text-primary tw:font-semibold tw:text-right'>{FormatCurrency(state.currentRegion, data.orderPaid)}</td>
                          </tr>
                        </tbody>
                      </table>
                    </Col>
                  </Row>
                </CardBody>
              </Card>
            </Col>
            <Col xs={12} lg={6} className='tw:pb-4'>
              <Card className='tw:h-full'>
                <CardHeader className='tw:py-4'>
                  <h5 className='tw:font-semibold tw:m-0'>Shipping</h5>
                </CardHeader>
                <CardBody>
                  <table className='tw:w-full tw:whitespace-nowrap tw:m-0 tw:text-[11.2px] tw:[&_th]:px-2 tw:[&_th]:py-1 tw:[&_td]:px-2 tw:[&_td]:py-1'>
                    <tbody>
                      <tr>
                        <td className='tw:text-[var(--bs-secondary-color)] tw:whitespace-nowrap'>Carrier:</td>
                        <td className='tw:font-semibold tw:w-full tw:capitalize'>{data.carrierUsed}</td>
                      </tr>
                      <tr>
                        <td className='tw:text-[var(--bs-secondary-color)] tw:whitespace-nowrap'>Service Requested:</td>
                        <td className='tw:font-semibold tw:w-full tw:capitalize'>{data.carrierService}</td>
                      </tr>
                      <tr>
                        <td className='tw:text-[var(--bs-secondary-color)] tw:whitespace-nowrap'>Service Used:</td>
                        <td className='tw:font-semibold tw:w-full tw:capitalize'>{data.carrierType}</td>
                      </tr>
                      <tr>
                        <td className='tw:text-[var(--bs-secondary-color)] tw:whitespace-nowrap'>Customer Name:</td>
                        <td className='tw:font-semibold tw:w-full tw:capitalize'>
                          <p className='tw:m-0 tw:p-0'>
                            {data.shipName} {data.shipName2}
                          </p>
                          <p className='tw:m-0 tw:p-0'>{data.shipCompany}</p>
                        </td>
                      </tr>
                      <tr>
                        <td className='tw:text-[var(--bs-secondary-color)] tw:whitespace-nowrap'>Address:</td>
                        <td className='tw:font-semibold tw:w-full tw:text-wrap'>
                          <p className='tw:m-0 tw:p-0'>
                            {data.shipStreet} {data.shipStreet2}
                          </p>
                          <p className='tw:m-0 tw:p-0'>
                            {data.shipCity}, {data.shipState}, {data.shipZipcode}, {data.shipCountry}
                          </p>
                        </td>
                      </tr>
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
          </Row>
          <Row>
            <Col xs={12}>
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
                            Unit Price
                          </th>
                          <th className='tw:text-center' scope='col'>
                            Qty
                          </th>
                          <th className='tw:text-center' scope='col'>
                            Subtotal
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.orderItems.map((product: ShipmentOrderItem, key) => (
                          <tr key={key} className='tw:border-b tw:border-[color:var(--border)] tw:py-2'>
                            <td className='tw:w-1/2 tw:text-[11.2px] tw:font-semibold'>
                              {product.title || product.name}
                              {product.isKit === true &&
                                product.children.length > 0 &&
                                product.children.map((child: KitChildren) => (
                                  <p className='tw:m-0 tw:p-0 tw:text-[11.2px] tw:text-[var(--bs-secondary-color)] tw:font-light' key={child.orderChildrenId}>
                                    {`- ${child.title === undefined ? child.name : child.title} Qty: ${child.quantity}`}
                                  </p>
                                ))}
                            </td>
                            <td className='tw:text-[11.2px] tw:text-[var(--bs-secondary-color)]'>{product.sku}</td>
                            <td className='tw:text-center'>{FormatCurrency(state.currentRegion, product.unitPrice ?? 0)}</td>
                            <td className='tw:text-center'>{product.quantity}</td>
                            <td className='tw:text-center'>{FormatCurrency(state.currentRegion, (product.unitPrice ?? 0) * product.quantity)}</td>
                          </tr>
                        ))}
                        <tr className='tw:bg-[color:var(--vz-light)]'>
                          <td></td>
                          <td></td>
                          <td className='tw:text-end tw:font-bold tw:text-nowrap'>Total</td>
                          <td className='tw:text-center tw:text-primary tw:font-semibold'>{data.totalItems}</td>
                          <td className='tw:text-center tw:text-primary tw:font-semibold'>
                            {FormatCurrency(
                              state.currentRegion,
                              data.orderItems.reduce((total: number, item: ShipmentOrderItem) => total + (item.unitPrice ?? 0) * item.quantity, 0)
                            )}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </Col>
        <Col xs={12} lg={4}>
          <Col xs={12}>
            <Card>
              <CardHeader className='tw:py-4'>
                <h5 className='tw:font-semibold tw:m-0'>Charge Details</h5>
              </CardHeader>
              <CardBody>
                <table className='tw:w-full tw:whitespace-nowrap tw:mb-0 tw:[&_th]:px-2 tw:[&_th]:py-1 tw:[&_td]:px-2 tw:[&_td]:py-1'>
                  <tbody className='tw:text-[11.2px]'>
                    <tr className='tw:border-b tw:border-[color:var(--border)] tw:pb-2'>
                      <td className='tw:text-[var(--bs-secondary-color)] tw:flex tw:flex-row tw:justify-start tw:items-start'>
                        Pick Pack Charge
                        {data.chargesFees && (
                          <>
                            <i className='ri-information-fill tw:ms-1 tw:text-[13px] tw:text-[color:var(--bs-secondary-color)]' id={`tooltip${OrderId}`}></i>
                            <TooltipComponent
                              target={`tooltip${OrderId}`}
                              text={`${FormatCurrency(state.currentRegion, data.chargesFees.orderCost!)} first item + ${FormatCurrency(
                                state.currentRegion,
                                data.chargesFees.extraItemOrderCost!
                              )} addt'l.`}
                            />
                          </>
                        )}
                      </td>
                      <td className='tw:font-semibold tw:text-end'>{FormatCurrency(state.currentRegion, data.pickpackCharge)}</td>
                    </tr>
                    <tr className='tw:border-b tw:border-[color:var(--border)] tw:pb-2'>
                      <td className='tw:text-[var(--bs-secondary-color)]'>Shipping Charge</td>
                      <td className='tw:font-semibold tw:text-end'>{FormatCurrency(state.currentRegion, data.onixShipping)}</td>
                    </tr>
                    <tr className='tw:border-b tw:border-[color:var(--border)] tw:pb-2'>
                      <td className='tw:text-[var(--bs-secondary-color)]'>Extra Charge</td>
                      <td className='tw:font-semibold tw:text-end'>{FormatCurrency(state.currentRegion, data.extraCharge)}</td>
                    </tr>
                    <tr>
                      <td className='tw:font-bold'>TOTAL</td>
                      <td className='tw:text-primary tw:font-semibold tw:text-end'>{FormatCurrency(state.currentRegion, data.totalCharge)}</td>
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
          {showActions && (
            <Row>
              <Col xl={12} className='tw:flex tw:flex-row tw:flex-wrap tw:justify-start tw:items-end tw:gap-2'>
                <Card className='tw:m-0'>
                  {data.carrierService.toLowerCase() !== 'ltl' && state.currentRegion == 'us'
                    ? data.orderStatus == 'shipped' &&
                      data.hasReturn == false &&
                      data.shipCountry == 'US' && (
                        <Button color='warning' className='btn-label btn-sm tw:text-[11.2px] tw:whitespace-nowrap' onClick={() => setModalCreateReturnInfo(data.businessId, data.id)}>
                          <i className='las la-reply label-icon tw:align-middle tw:text-[19.5px] tw:me-2' />
                          Create Return
                        </Button>
                      )
                    : data.orderStatus == 'shipped' &&
                      data.hasReturn == false &&
                      data.shipCountry == 'ES' && (
                        <Button color='warning' className='btn-label btn-sm tw:text-[11.2px] tw:whitespace-nowrap' onClick={() => setModalCreateReturnInfo(data.businessId, data.id)}>
                          <i className='las la-reply label-icon tw:align-middle tw:text-[19.5px] tw:me-2' />
                          Create Return
                        </Button>
                      )}
                  {state.currentRegion == 'us' && data.orderStatus == 'awaiting' && data.goFlowOrderId != 0 && data.trackingNumber == '' && (
                    <Button
                      color='danger'
                      className='btn-label btn-sm tw:text-[11.2px] tw:whitespace-nowrap'
                      onClick={() =>
                        setshowDeleteModal({
                          show: true,
                          orderId: data.id,
                          orderNumber: data.orderNumber,
                          goFlowOrderId: data.goFlowOrderId,
                        })
                      }>
                      <i className='las la-trash-alt label-icon tw:align-middle tw:text-[19.5px] tw:me-2' />
                      Cancel Order
                    </Button>
                  )}
                </Card>
              </Col>
            </Row>
          )}
        </Col>
      </Row>
      {state.showCreateReturnModal && <CreateReturnModal data={data} mutateShipments={mutateShipments} />}
      {showDeleteModal.show && <CancelManualOrderConfirmationModal showDeleteModal={showDeleteModal} setshowDeleteModal={setshowDeleteModal} mutateShipments={mutateShipments} />}
    </div>
  )
}

export default ShipmentType
