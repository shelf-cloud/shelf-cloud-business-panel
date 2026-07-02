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
    <div className='w-full' style={{ backgroundColor: '#F0F4F7', padding: '0px' }}>
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
            <Col xs={12} lg={6} className='pb-4'>
              <Card className='h-full'>
                <CardHeader className='py-4'>
                  <h5 className='font-semibold m-0'>Order Summary</h5>
                </CardHeader>
                <CardBody>
                  <Row className='m-0 p-0 flex flex-row justify-between items-start'>
                    <Col xs={6} className='m-0 p-0'>
                      <span className='text-[var(--bs-secondary-color)] text-[11.2px]'>Store:</span>
                      <div className='flex flex-col justify-start items-start gap-2'>
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
                        <span className='text-[11.2px] font-semibold'>{data.storeName}</span>
                      </div>
                      <span className='text-[var(--bs-secondary-color)] text-[11.2px]'>Order Date:</span>
                      <p className='text-[11.2px] font-semibold m-0'>{moment.utc(data.orderDate).format('LL')}</p>
                      <span className='text-[var(--bs-secondary-color)] text-[11.2px]'>Closed Date:</span>
                      {data.closedDate && <p className='text-[11.2px] font-semibold m-0'>{moment.utc(data.closedDate).format('LL')}</p>}
                    </Col>
                    <Col xs={6} className='m-0 p-0'>
                      <table className='w-full whitespace-nowrap m-0 text-[11.2px] [&_th]:px-2 [&_th]:py-1 [&_td]:px-2 [&_td]:py-1'>
                        <tbody>
                          <tr className='border-b border-[color:var(--border)]'>
                            <td className='text-[var(--bs-secondary-color)]'>Subtotal</td>
                            <td className='font-semibold text-right'>{FormatCurrency(state.currentRegion, data.subtotal)}</td>
                          </tr>
                          <tr className='border-b border-[color:var(--border)]'>
                            <td className='text-[var(--bs-secondary-color)]'>Shipping</td>
                            <td className='font-semibold text-right'>{FormatCurrency(state.currentRegion, data.salesShipping > 0 ? data.salesShipping : data.orderShipping)}</td>
                          </tr>
                          <tr className='border-b border-[color:var(--border)]'>
                            <td className='text-[var(--bs-secondary-color)]'>Tax</td>
                            <td className='font-semibold text-right'>{FormatCurrency(state.currentRegion, data.salesTax)}</td>
                          </tr>
                          <tr className='border-b border-[color:var(--border)]'>
                            <td className='text-[var(--bs-secondary-color)]'>Discount</td>
                            <td className='font-semibold text-right'>{FormatCurrency(state.currentRegion, data.discount)}</td>
                          </tr>
                          <tr>
                            <td className='font-semibold text-right'>TOTAL Order</td>
                            <td className='text-primary font-semibold text-right'>{FormatCurrency(state.currentRegion, data.orderTotal)}</td>
                          </tr>
                          <tr>
                            <td className='font-semibold text-right'>TOTAL Paid</td>
                            <td className='text-primary font-semibold text-right'>{FormatCurrency(state.currentRegion, data.orderPaid)}</td>
                          </tr>
                        </tbody>
                      </table>
                    </Col>
                  </Row>
                </CardBody>
              </Card>
            </Col>
            <Col xs={12} lg={6} className='pb-4'>
              <Card className='h-full'>
                <CardHeader className='py-4'>
                  <h5 className='font-semibold m-0'>Shipping</h5>
                </CardHeader>
                <CardBody>
                  <table className='w-full whitespace-nowrap m-0 text-[11.2px] [&_th]:px-2 [&_th]:py-1 [&_td]:px-2 [&_td]:py-1'>
                    <tbody>
                      <tr>
                        <td className='text-[var(--bs-secondary-color)] whitespace-nowrap'>Carrier:</td>
                        <td className='font-semibold w-full capitalize'>{data.carrierUsed}</td>
                      </tr>
                      <tr>
                        <td className='text-[var(--bs-secondary-color)] whitespace-nowrap'>Service Requested:</td>
                        <td className='font-semibold w-full capitalize'>{data.carrierService}</td>
                      </tr>
                      <tr>
                        <td className='text-[var(--bs-secondary-color)] whitespace-nowrap'>Service Used:</td>
                        <td className='font-semibold w-full capitalize'>{data.carrierType}</td>
                      </tr>
                      <tr>
                        <td className='text-[var(--bs-secondary-color)] whitespace-nowrap'>Customer Name:</td>
                        <td className='font-semibold w-full capitalize'>
                          <p className='m-0 p-0'>
                            {data.shipName} {data.shipName2}
                          </p>
                          <p className='m-0 p-0'>{data.shipCompany}</p>
                        </td>
                      </tr>
                      <tr>
                        <td className='text-[var(--bs-secondary-color)] whitespace-nowrap'>Address:</td>
                        <td className='font-semibold w-full text-wrap'>
                          <p className='m-0 p-0'>
                            {data.shipStreet} {data.shipStreet2}
                          </p>
                          <p className='m-0 p-0'>
                            {data.shipCity}, {data.shipState}, {data.shipZipcode}, {data.shipCountry}
                          </p>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                  <div className='px-1 text-[11.2px]'>
                    <span className='m-0 text-[var(--bs-secondary-color)] text-[11.2px]'>Tracking No.</span>
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
                <CardHeader className='py-4'>
                  <h5 className='font-semibold m-0'>Products</h5>
                </CardHeader>
                <CardBody>
                  <div className='overflow-x-auto'>
                    <table className='w-full align-middle mb-0 [&_th]:px-2 [&_th]:py-1 [&_td]:px-2 [&_td]:py-1'>
                      <thead className='bg-[color:var(--vz-light)]'>
                        <tr>
                          <th scope='col'>Title</th>
                          <th scope='col'>Sku</th>
                          <th className='text-center' scope='col'>
                            Unit Price
                          </th>
                          <th className='text-center' scope='col'>
                            Qty
                          </th>
                          <th className='text-center' scope='col'>
                            Subtotal
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.orderItems.map((product: ShipmentOrderItem, key) => (
                          <tr key={key} className='border-b border-[color:var(--border)] py-2'>
                            <td className='w-1/2 text-[11.2px] font-semibold'>
                              {product.title || product.name}
                              {product.isKit === true &&
                                product.children.length > 0 &&
                                product.children.map((child: KitChildren) => (
                                  <p className='m-0 p-0 text-[11.2px] text-[var(--bs-secondary-color)] font-light' key={child.orderChildrenId}>
                                    {`- ${child.title === undefined ? child.name : child.title} Qty: ${child.quantity}`}
                                  </p>
                                ))}
                            </td>
                            <td className='text-[11.2px] text-[var(--bs-secondary-color)]'>{product.sku}</td>
                            <td className='text-center'>{FormatCurrency(state.currentRegion, product.unitPrice ?? 0)}</td>
                            <td className='text-center'>{product.quantity}</td>
                            <td className='text-center'>{FormatCurrency(state.currentRegion, (product.unitPrice ?? 0) * product.quantity)}</td>
                          </tr>
                        ))}
                        <tr className='bg-[color:var(--vz-light)]'>
                          <td></td>
                          <td></td>
                          <td className='text-end font-bold text-nowrap'>Total</td>
                          <td className='text-center text-primary font-semibold'>{data.totalItems}</td>
                          <td className='text-center text-primary font-semibold'>
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
              <CardHeader className='py-4'>
                <h5 className='font-semibold m-0'>Charge Details</h5>
              </CardHeader>
              <CardBody>
                <table className='w-full whitespace-nowrap mb-0 [&_th]:px-2 [&_th]:py-1 [&_td]:px-2 [&_td]:py-1'>
                  <tbody className='text-[11.2px]'>
                    <tr className='border-b border-[color:var(--border)] pb-2'>
                      <td className='text-[var(--bs-secondary-color)] flex flex-row justify-start items-start'>
                        Pick Pack Charge
                        {data.chargesFees && (
                          <>
                            <i className='ri-information-fill ms-1 text-[13px] text-[color:var(--bs-secondary-color)]' id={`tooltip${OrderId}`}></i>
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
                      <td className='font-semibold text-end'>{FormatCurrency(state.currentRegion, data.pickpackCharge)}</td>
                    </tr>
                    <tr className='border-b border-[color:var(--border)] pb-2'>
                      <td className='text-[var(--bs-secondary-color)]'>Shipping Charge</td>
                      <td className='font-semibold text-end'>{FormatCurrency(state.currentRegion, data.onixShipping)}</td>
                    </tr>
                    <tr className='border-b border-[color:var(--border)] pb-2'>
                      <td className='text-[var(--bs-secondary-color)]'>Extra Charge</td>
                      <td className='font-semibold text-end'>{FormatCurrency(state.currentRegion, data.extraCharge)}</td>
                    </tr>
                    <tr>
                      <td className='font-bold'>TOTAL</td>
                      <td className='text-primary font-semibold text-end'>{FormatCurrency(state.currentRegion, data.totalCharge)}</td>
                    </tr>
                  </tbody>
                </table>
              </CardBody>
            </Card>
          </Col>
          {data.extraComment != '' && (
            <Col xl={12}>
              <Card>
                <CardHeader className='py-4'>
                  <h5 className='font-semibold m-0'>Order Comment</h5>
                </CardHeader>
                <CardBody>
                  <p>{data.extraComment}</p>
                </CardBody>
              </Card>
            </Col>
          )}
          {showActions && (
            <Row>
              <Col xl={12} className='flex flex-row flex-wrap justify-start items-end gap-2'>
                <Card className='m-0'>
                  {data.carrierService.toLowerCase() !== 'ltl' && state.currentRegion == 'us'
                    ? data.orderStatus == 'shipped' &&
                      data.hasReturn == false &&
                      data.shipCountry == 'US' && (
                        <Button color='warning' className='btn-label btn-sm text-[11.2px] whitespace-nowrap' onClick={() => setModalCreateReturnInfo(data.businessId, data.id)}>
                          <i className='las la-reply label-icon align-middle text-[19.5px] me-2' />
                          Create Return
                        </Button>
                      )
                    : data.orderStatus == 'shipped' &&
                      data.hasReturn == false &&
                      data.shipCountry == 'ES' && (
                        <Button color='warning' className='btn-label btn-sm text-[11.2px] whitespace-nowrap' onClick={() => setModalCreateReturnInfo(data.businessId, data.id)}>
                          <i className='las la-reply label-icon align-middle text-[19.5px] me-2' />
                          Create Return
                        </Button>
                      )}
                  {state.currentRegion == 'us' && data.orderStatus == 'awaiting' && data.goFlowOrderId != 0 && data.trackingNumber == '' && (
                    <Button
                      color='danger'
                      className='btn-label btn-sm text-[11.2px] whitespace-nowrap'
                      onClick={() =>
                        setshowDeleteModal({
                          show: true,
                          orderId: data.id,
                          orderNumber: data.orderNumber,
                          goFlowOrderId: data.goFlowOrderId,
                        })
                      }>
                      <i className='las la-trash-alt label-icon align-middle text-[19.5px] me-2' />
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
