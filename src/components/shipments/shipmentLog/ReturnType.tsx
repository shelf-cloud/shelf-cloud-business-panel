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
import { Button, Card, CardBody, CardHeader, Col, Row, Spinner } from 'reactstrap'

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
            <Col xs={12} lg={6} className='pb-3'>
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
                    <Col xs={6} className='m-0 p-0'>
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
                    </Col>
                  </Row>
                </CardBody>
              </Card>
            </Col>
            <Col xs={12} lg={6} className='pb-3'>
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
                        <td className='text-muted text-nowrap'>Customer Name:</td>
                        <td className='fw-semibold w-100 capitalize'>{data.shipName}</td>
                      </tr>
                      <tr>
                        <td className='text-muted text-nowrap'># Of Pallets:</td>
                        <td className='fw-semibold w-100'>{data.numberPallets}</td>
                      </tr>
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
          </Row>
          <Row>
            <Col xs={12}>
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
                          <th scope='col'>Condition</th>
                          <th className='text-center' scope='col'>
                            Qty
                          </th>
                          <th className='text-center' scope='col'>
                            Qty Received
                          </th>
                        </tr>
                      </thead>
                      <tbody className='fs-7'>
                        {data.orderItems.map((product: ShipmentOrderItem, key) => (
                          <tr key={key} className='border-bottom py-2'>
                            <td className='w-50 fw-semibold'>{product.name || product.title}</td>
                            <td className='text-muted'>{product.sku}</td>
                            <td className='text-muted text-capitalize'>{product.state}</td>
                            <td className='text-center'>{product.quantity || product.qtyReceived}</td>
                            <td className='text-center'>{product.qtyReceived ? product.qtyReceived : product.quantity}</td>
                          </tr>
                        ))}
                        <tr className='bg-light'>
                          <td></td>
                          <td></td>
                          <td className='text-start fs-6 fw-bold text-nowrap'>Total</td>
                          <td className='text-center fs-6 text-primary'>
                            {data.orderItems.reduce((total, item: ShipmentOrderItem) => total + (item.quantity ?? item.qtyReceived), 0)}
                          </td>
                          <td className='text-center fs-6 text-primary'>
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
                            <TooltipComponent target={`tooltip${OrderId}`} text={serviceFee} />
                          </>
                        )}
                      </td>
                      <td className='fw-semibold text-end'>{FormatCurrency(state.currentRegion, data.pickpackCharge!)}</td>
                    </tr>
                    <tr className='border-bottom pb-2'>
                      <td className='text-muted'>Shipping Charge</td>
                      <td className='fw-semibold text-end'>{FormatCurrency(state.currentRegion, data.onixShipping!)}</td>
                    </tr>
                    <tr className='border-bottom pb-2'>
                      <td className='text-muted'>Extra Charge</td>
                      <td className='fw-semibold text-end'>{FormatCurrency(state.currentRegion, data.extraCharge!)}</td>
                    </tr>
                    <tr>
                      <td className='fw-bold'>TOTAL</td>
                      <td className='text-primary fw-semibold text-end'>{FormatCurrency(state.currentRegion, data.totalCharge!)}</td>
                    </tr>
                  </tbody>
                </table>
              </CardBody>
            </Card>
          </Col>
          {data.extraComment != '' && (
            <Col xs={12}>
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
          {showActions && (
            <Row>
              <Col xs={12} className='d-flex flex-row flex-wrap justify-content-start align-items-end gap-2'>
                {data.returnOrigin === 'shipment' && (
                  <Card className='m-0'>
                    {loadingLabel ? (
                      <Button color='secondary' className='btn-label btn-sm fs-7 text-nowrap'>
                        <i className='las la-toilet-paper label-icon align-middle fs-3 me-2' />
                        <Spinner color='light' size={'sm'} />
                      </Button>
                    ) : (
                      <Button color='secondary' className='btn-label btn-sm fs-7 text-nowrap' onClick={() => handlePrintingLabel()}>
                        <i className='las la-toilet-paper label-icon align-middle fs-3 me-2' />
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
