import React, { useContext, useEffect, useState } from 'react'
import { Button, Card, CardBody, CardHeader, Col, Row } from 'reactstrap'
// import Animation from '@components/Common/Animation'
import { OrderRowType, ShipmentOrderItem } from '@typings'
import { FormatCurrency, FormatIntNumber } from '@lib/FormatNumbers'
import TooltipComponent from '../constants/Tooltip'
import AppContext from '@context/AppContext'
import Confirm_Delete_Item_From_Receiving from '../modals/receivings/Confirm_Delete_Item_From_Receiving'
import { CleanSpecialCharacters } from '@lib/SkuFormatting'
import EditManualReceivingLog from './EditManualReceivingLog'
import AddSkuToManualReceivingLog from './AddSkuToManualReceivingLog'

// import dynamic from 'next/dynamic';
// const Animation = dynamic(() => import('@components/Common/Animation'), {
//     ssr: false
// });

type Props = {
  data: OrderRowType
  mutateReceivings?: () => void
}

export type DeleteSKUFromReceivingModalType = {
  show: boolean
  orderId: number
  orderNumber: string
  sku: string
  title: string
  poNumber: string
  poId: number
  isReceivingFromPo: boolean
}

const ReceivingType = ({ data, mutateReceivings }: Props) => {
  const { state }: any = useContext(AppContext)
  const [serviceFee, setServiceFee] = useState('')

  const [deleteSKUModal, setDeleteSKUModal] = useState<DeleteSKUFromReceivingModalType>({
    show: false,
    orderId: 0,
    orderNumber: '',
    sku: '',
    title: '',
    poNumber: '',
    poId: 0,
    isReceivingFromPo: false,
  })

  const [showEditOrderQty, setshowEditOrderQty] = useState({
    show: false,
    receivingId: 0,
    orderNumber: '',
    receivingItems: [] as ShipmentOrderItem[],
  })

  const [addSkuToReceiving, setAddSkuToReceiving] = useState({
    show: false,
    receivingId: 0,
    orderNumber: '',
    receivingItems: [] as string[],
  })

  useEffect(() => {
    if (data.chargesFees) {
      switch (data.carrierService) {
        case '20HQ-P':
          setServiceFee(`${data.carrierService} - ${FormatCurrency(state.currentRegion, data.chargesFees['20HQ-P']!)}`)
          break
        case '40HQ-P':
          setServiceFee(`${data.carrierService} - ${FormatCurrency(state.currentRegion, data.chargesFees['40HQ-P']!)}`)
          break
        case '20HQ-FL':
          setServiceFee(`${data.carrierService} - ${FormatCurrency(state.currentRegion, data.chargesFees['20HQ-FL']!)}`)
          break
        case '40HQ-FL':
          setServiceFee(`${data.carrierService} - ${FormatCurrency(state.currentRegion, data.chargesFees['40HQ-FL']!)}`)
          break
        case 'Pallets':
          setServiceFee(`${data.carrierService} - ${FormatCurrency(state.currentRegion, data.chargesFees.receivingPallets!)} per pallet`)
          break
        case 'Parcel':
          setServiceFee(`${data.carrierService} - ${FormatCurrency(state.currentRegion, data.chargesFees.parcelBoxCost!)} per box`)
          break
        default:
          setServiceFee(`Type of service...`)
      }
    }

    return () => {
      setServiceFee('')
    }
  }, [data, state.currentRegion])

  const OrderId = CleanSpecialCharacters(data.orderId!)

  return (
    <div style={{ backgroundColor: '#F0F4F7', padding: '10px' }}>
      <Row>
        <Col sm={3}>
          <Col sm={12}>
            <Card>
              <CardHeader className='py-2'>
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
          <Col sm={12}>
            <Card>
              <CardHeader className='py-2'>
                <h5 className='fw-semibold m-0'>Charge Details</h5>
              </CardHeader>
              <CardBody>
                <table className='table table-sm table-borderless table-nowrap mb-0'>
                  <tbody className='fs-7'>
                    <tr className='border-bottom pb-2'>
                      <td className='text-muted d-flex flex-row justify-content-start align-items-start'>
                        Service
                        {data.chargesFees && (
                          <>
                            <i className='ri-information-fill ms-1 fs-6 text-muted' id={`tooltipService${OrderId}`}></i>
                            <TooltipComponent target={`tooltipService${OrderId}`} text={serviceFee} />
                          </>
                        )}
                      </td>
                      <td className='fw-semibold text-end'>{FormatCurrency(state.currentRegion, data.receivingService!)}</td>
                    </tr>
                    <tr className='border-bottom pb-2'>
                      <td className='text-muted'>
                        Pallets
                        {data.chargesFees && (
                          <>
                            <i className='ri-information-fill ms-1 fs-6 text-muted' id={`tooltipPallet${OrderId}`}></i>
                            <TooltipComponent target={`tooltipPallet${OrderId}`} text={`${FormatCurrency(state.currentRegion, data.chargesFees.receivingPalletCost!)} per pallet`} />
                          </>
                        )}
                      </td>
                      <td className='fw-semibold text-end'>{FormatCurrency(state.currentRegion, data.receivingPallets!)}</td>
                    </tr>
                    <tr className='border-bottom pb-2'>
                      <td className='text-muted d-flex flex-row justify-content-start align-items-start'>
                        Wrap Service
                        {data.chargesFees && (
                          <>
                            <i className='ri-information-fill ms-1 fs-6 text-muted' id={`tooltipWrap${OrderId}`}></i>
                            <TooltipComponent target={`tooltipWrap${OrderId}`} text={`${FormatCurrency(state.currentRegion, data.chargesFees.receivingWrapService!)} per wrap`} />
                          </>
                        )}
                      </td>
                      <td className='fw-semibold text-end'>{FormatCurrency(state.currentRegion, data.receivingWrapService!)}</td>
                    </tr>
                    <tr className='border-bottom pb-2'>
                      <td className='text-muted d-flex flex-row justify-content-start align-items-start'>
                        Man Hour
                        {data.chargesFees && (
                          <>
                            <i className='ri-information-fill ms-1 fs-6 text-muted' id={`tooltipHour${OrderId}`}></i>
                            <TooltipComponent target={`tooltipHour${OrderId}`} text={`${FormatCurrency(state.currentRegion, data.chargesFees.receivingManHour!)} per hour`} />
                          </>
                        )}
                      </td>
                      <td className='fw-semibold text-end'>{FormatCurrency(state.currentRegion, data.manHour!)}</td>
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
            <Col sm={12}>
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
        <Col sm={9}>
          <Card className='mb-3'>
            <CardHeader className='py-2 d-flex flex-row justify-content-between'>
              <h5 className='fw-semibold m-0'>Products</h5>
              {!data.isReceivingFromPo && data.orderStatus !== 'received' && (
                <div className='d-flex flex-row justify-content-end gap-3 align-items-center'>
                  <i
                    className='las la-edit fs-4 text-primary m-0 p-0'
                    style={{ cursor: 'pointer' }}
                    onClick={() =>
                      setshowEditOrderQty({
                        show: true,
                        receivingId: data.id,
                        orderNumber: data.orderNumber,
                        receivingItems: data.orderItems,
                      })
                    }
                  />
                  <i
                    className='fs-4 text-success las la-plus-circle'
                    style={{ cursor: 'pointer' }}
                    onClick={() => setAddSkuToReceiving({ show: true, receivingId: data.id, orderNumber: data.orderNumber, receivingItems: data.orderItems.map((item) => item.sku) })}
                  />
                </div>
              )}
            </CardHeader>
            <CardBody>
              <div className='table-responsive'>
                <table className='table table-sm align-middle table-borderless mb-0'>
                  <thead className='table-light'>
                    <tr>
                      <th scope='col'>Title</th>
                      {data.orderItems.some((product: ShipmentOrderItem) => (product.poNumber ? true : false)) && <th scope='col'>PO</th>}
                      <th scope='col'>Sku</th>
                      <th className='text-center' scope='col'>
                        Qty
                      </th>
                      <th className='text-center' scope='col'>
                        Qty Received
                      </th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody className='fs-7'>
                    {data.orderItems.map((product: ShipmentOrderItem, key) => (
                      <tr key={key} className='border-bottom py-2 w-100'>
                        <td className='fw-semibold'>{product.name || ''}</td>
                        {product.poNumber && <td className='fw-normal text-nowrap'>{product.poNumber}</td>}
                        <td className='text-muted'>{product.sku}</td>
                        <td className='text-center'>{FormatIntNumber(state.currentRegion, Number(product.quantity))}</td>
                        <td className='text-center'>{FormatIntNumber(state.currentRegion, Number(product.qtyReceived))}</td>
                        <td>
                          {(data.orderStatus == 'awaiting' || data.orderStatus == 'awaiting_shipment') && product.qtyReceived! <= 0 && (
                            <i
                              className='fs-5 text-danger las la-trash-alt'
                              style={{ cursor: 'pointer' }}
                              onClick={() =>
                                setDeleteSKUModal({
                                  show: true,
                                  orderId: data.id,
                                  orderNumber: data.orderNumber,
                                  sku: product.sku,
                                  title: product.name,
                                  poNumber: product.poNumber ? product.poNumber : '',
                                  poId: product.poId ? product.poId : 0,
                                  isReceivingFromPo: data.isReceivingFromPo ? true : false,
                                })
                              }
                            />
                          )}
                        </td>
                      </tr>
                    ))}
                    <tr>
                      <td className='text-start fs-6 fw-bold text-nowrap'>Total</td>
                      {data.orderItems.some((product: ShipmentOrderItem) => (product.poNumber ? true : false)) && <td></td>}
                      <td></td>
                      <td className='text-center fw-semibold fs-6 text-primary'>{FormatIntNumber(state.currentRegion, Number(data.totalItems))}</td>
                      <td className='text-center fw-semibold fs-6 text-primary'>{FormatIntNumber(state.currentRegion, Number(data.totalReceivedItems))}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardBody>
          </Card>
          <Row className='mb-2'>
            <Col sm={12} className='d-flex flex-row justify-content-end align-items-end'>
              <div className='m-0 d-flex flex-row justify-content-end align-items-end gap-2'>
                {!data.isReceivingFromPo && data.orderStatus !== 'received' && (
                  <a href={data.proofOfShipped} target='blank'>
                    <Button color='info' className='btn-label fs-7'>
                      <i className='las la-truck label-icon align-middle fs-5 me-2' />
                      Proof Of Received
                    </Button>
                  </a>
                )}
              </div>
            </Col>
          </Row>
        </Col>
      </Row>
      {deleteSKUModal.show && <Confirm_Delete_Item_From_Receiving deleteSKUModal={deleteSKUModal} setDeleteSKUModal={setDeleteSKUModal} mutateReceivings={mutateReceivings} />}
      {showEditOrderQty.show && <EditManualReceivingLog showEditOrderQty={showEditOrderQty} setshowEditOrderQty={setshowEditOrderQty} mutateReceivings={mutateReceivings} />}
      {addSkuToReceiving.show && <AddSkuToManualReceivingLog addSkuToReceiving={addSkuToReceiving} setshowAddSkuToManualReceiving={setAddSkuToReceiving} mutateReceivings={mutateReceivings} />}
    </div>
  )
}

export default ReceivingType
