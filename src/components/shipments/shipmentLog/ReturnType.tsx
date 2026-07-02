/* eslint-disable @next/next/no-img-element */
import { useContext, useMemo, useState } from 'react'

import TooltipComponent from '@components/constants/Tooltip'
import AppContext from '@context/AppContext'
import { FormatCurrency } from '@lib/FormatNumbers'
import { CleanSpecialCharacters } from '@lib/SkuFormatting'
import { NoImageAdress } from '@lib/assetsConstants'
import { Shipment, ShipmentOrderItem } from '@typesTs/shipments/shipments'
import axios from 'axios'
import moment from 'moment'
import { Button, Card, CardBody, CardHeader, Col, Row, Spinner } from '@/components/migration-ui'

import ShipmentCarrierStatusBar from './ShipmentCarrierStatusBar'
import ShipmentTrackingNumber from './ShipmentTrackingNumber'

type Props = {
  data: Shipment
  showActions: boolean
  mutateShipments?: () => void
}

const ReturnType = ({ data, showActions, mutateShipments }: Props) => {
  const { state }: any = useContext(AppContext)
  const [loadingLabel, setLoadingLabel] = useState(false)
  const OrderId = CleanSpecialCharacters(data.orderId)

  const serviceFee = useMemo(() => {
    if (data.chargesFees) {
      switch (true) {
        case !data.isIndividualUnits && data.carrierService == 'Parcel Boxes':
          return `${data.carrierService} - ${FormatCurrency(state.currentRegion, data.chargesFees.parcelBoxCost!)} per box`
        case !data.isIndividualUnits && data.carrierService == 'LTL':
          return `${data.carrierService} - ${FormatCurrency(state.currentRegion, data.chargesFees.palletCost!)} per pallet + ${FormatCurrency(state.currentRegion, 0.3)} per item`
        case data.isIndividualUnits:
          return `
                ${data.carrierService} - ${FormatCurrency(state.currentRegion, data.chargesFees.individualUnitCost!)} per unit
                ${data.carrierService} - ${FormatCurrency(state.currentRegion, data.chargesFees.parcelBoxCost!)} per box
                ${data.carrierService} - ${FormatCurrency(state.currentRegion, data.chargesFees.palletCost!)} per pallet
                `
        default:
          return `${FormatCurrency(state.currentRegion, data.chargesFees.orderCost!)} first item + ${FormatCurrency(
            state.currentRegion,
            data.chargesFees.extraItemOrderCost!
          )} addt'l.`
      }
    }
    return ''
  }, [data, state.currentRegion])

  const handlePrintingLabel = async () => {
    setLoadingLabel(true)
    const response: any = await axios(`/api/createLabelForOrder?region=${state.currentRegion}&businessId=${state.user.businessId}&orderId=${data.id}`)

    const linkSource = `data:application/pdf;base64,${response.data}`
    const downloadLink = document.createElement('a')
    const fileName = data.orderNumber + '-shipLabel.pdf'

    downloadLink.href = linkSource
    downloadLink.download = fileName
    downloadLink.click()
    mutateShipments && mutateShipments()
    setLoadingLabel(false)
  }
  return (
    <div style={{ backgroundColor: '#F0F4F7', padding: '10px' }}>
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
                        <td className='tw:font-semibold tw:w-full tw:capitalize'>{data.shipName}</td>
                      </tr>
                      <tr>
                        <td className='tw:text-[var(--bs-secondary-color)] tw:whitespace-nowrap'># Of Pallets:</td>
                        <td className='tw:font-semibold tw:w-full'>{data.numberPallets}</td>
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
                    <table className='tw:w-full tw:align-middle tw:mb-0 tw:text-[11.2px] tw:[&_th]:px-2 tw:[&_th]:py-1 tw:[&_td]:px-2 tw:[&_td]:py-1'>
                      <thead className='tw:bg-[color:var(--vz-light)]'>
                        <tr>
                          <th scope='col'>Title</th>
                          <th scope='col'>Sku</th>
                          <th scope='col'>Condition</th>
                          <th className='tw:text-center' scope='col'>
                            Qty
                          </th>
                          <th className='tw:text-center' scope='col'>
                            Qty Received
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.orderItems.map((product: ShipmentOrderItem, key) => (
                          <tr key={key} className='tw:border-b tw:border-[color:var(--border)]'>
                            <td className='tw:w-1/2 tw:font-semibold'>{product.name || product.title}</td>
                            <td className='tw:text-[var(--bs-secondary-color)]'>{product.sku}</td>
                            <td className='tw:text-[var(--bs-secondary-color)] tw:capitalize'>{product.state}</td>
                            <td className='tw:text-center'>{product.quantity || product.qtyReceived}</td>
                            <td className='tw:text-center'>{product.qtyReceived ? product.qtyReceived : product.quantity}</td>
                          </tr>
                        ))}
                        <tr className='tw:bg-[var(--vz-light)]'>
                          <td></td>
                          <td></td>
                          <td className='tw:text-left tw:text-[13px] tw:font-bold tw:whitespace-nowrap'>Total</td>
                          <td className='tw:text-center tw:text-[13px] tw:text-primary'>
                            {data.orderItems.reduce((total, item: ShipmentOrderItem) => total + (item.quantity ?? item.qtyReceived), 0)}
                          </td>
                          <td className='tw:text-center tw:text-[13px] tw:text-primary'>
                            {data.orderItems.reduce((total, item: ShipmentOrderItem) => total + (item.qtyReceived ? item.qtyReceived : item.quantity), 0)}
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
                <table className='tw:w-full tw:whitespace-nowrap tw:mb-0 tw:text-[11.2px] tw:[&_th]:px-2 tw:[&_th]:py-1 tw:[&_td]:px-2 tw:[&_td]:py-1'>
                  <tbody>
                    <tr className='tw:border-b tw:border-[color:var(--border)]'>
                      <td className='tw:text-[var(--bs-secondary-color)] tw:flex tw:flex-row tw:justify-start tw:items-start'>
                        Pick Pack Charge
                        {data.chargesFees && (
                          <>
                            <i className='ri-information-fill tw:ms-1 tw:text-[13px] tw:text-[var(--bs-secondary-color)]' id={`tooltip${OrderId}`}></i>
                            <TooltipComponent target={`tooltip${OrderId}`} text={serviceFee} />
                          </>
                        )}
                      </td>
                      <td className='tw:font-semibold tw:text-right'>{FormatCurrency(state.currentRegion, data.pickpackCharge!)}</td>
                    </tr>
                    <tr className='tw:border-b tw:border-[color:var(--border)]'>
                      <td className='tw:text-[var(--bs-secondary-color)]'>Shipping Charge</td>
                      <td className='tw:font-semibold tw:text-right'>{FormatCurrency(state.currentRegion, data.onixShipping!)}</td>
                    </tr>
                    <tr className='tw:border-b tw:border-[color:var(--border)]'>
                      <td className='tw:text-[var(--bs-secondary-color)]'>Extra Charge</td>
                      <td className='tw:font-semibold tw:text-right'>{FormatCurrency(state.currentRegion, data.extraCharge!)}</td>
                    </tr>
                    <tr>
                      <td className='tw:font-bold'>TOTAL</td>
                      <td className='tw:text-primary tw:font-semibold tw:text-right'>{FormatCurrency(state.currentRegion, data.totalCharge!)}</td>
                    </tr>
                  </tbody>
                </table>
              </CardBody>
            </Card>
          </Col>
          {data.extraComment != '' && (
            <Col xs={12}>
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
              <Col xs={12} className='tw:flex tw:flex-row tw:flex-wrap tw:justify-start tw:items-end tw:gap-2'>
                {data.returnOrigin === 'shipment' && (
                  <Card className='tw:m-0'>
                    {loadingLabel ? (
                      <Button color='secondary' size='sm' className='btn-label tw:text-[11.2px] tw:whitespace-nowrap'>
                        <i className='las la-toilet-paper label-icon tw:align-middle tw:text-[22.75px] tw:me-2' />
                        <Spinner color='light' size={'sm'} />
                      </Button>
                    ) : (
                      <Button color='secondary' size='sm' className='btn-label tw:text-[11.2px] tw:whitespace-nowrap' onClick={() => handlePrintingLabel()}>
                        <i className='las la-toilet-paper label-icon tw:align-middle tw:text-[22.75px] tw:me-2' />
                        Print Label
                      </Button>
                    )}
                  </Card>
                )}
              </Col>
            </Row>
          )}
        </Col>
      </Row>
    </div>
  )
}

export default ReturnType
