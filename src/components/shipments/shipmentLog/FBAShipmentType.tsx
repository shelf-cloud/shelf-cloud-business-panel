/* eslint-disable @next/next/no-img-element */
import { useContext } from 'react'

import TooltipComponent from '@components/constants/Tooltip'
import AppContext from '@context/AppContext'
import { FormatCurrency } from '@lib/FormatNumbers'
import { CleanSpecialCharacters } from '@lib/SkuFormatting'
import { NoImageAdress } from '@lib/assetsConstants'
import { KitChildren, Shipment, ShipmentOrderItem } from '@typesTs/shipments/shipments'
import moment from 'moment'
import { Card, CardContent, CardHeader } from '@shadcn/ui/card'

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
    <div className='w-full' style={{ backgroundColor: '#F0F4F7', padding: '0px' }}>
      {data.carrierStatus && (
        <div className='flex flex-wrap -mx-3'>
          <div className='px-3 w-full'>
            <ShipmentCarrierStatusBar carrier={data.carrierUsed} currentStatus={data.carrierStatus} />
          </div>
        </div>
      )}
      <div className='flex flex-wrap -mx-3'>
        <div className='px-3 w-full lg:w-8/12'>
          <Card>
            <CardHeader className='py-4'>
              <h5 className='font-semibold m-0'>Products</h5>
            </CardHeader>
            <CardContent>
              <div className='overflow-x-auto'>
                <table className='w-full align-middle mb-0 [&_th]:px-2 [&_th]:py-1 [&_td]:px-2 [&_td]:py-1'>
                  <thead className='bg-[color:var(--vz-light)]'>
                    <tr>
                      <th scope='col'>Title</th>
                      <th scope='col'>Sku</th>
                      <th className='text-center' scope='col'>
                        Qty
                      </th>
                    </tr>
                  </thead>
                  <tbody className='text-[11.2px]'>
                    {data.orderItems.map((product: ShipmentOrderItem, key) => (
                      <tr key={key} className='border-b py-2'>
                        <td className='w-3/4 font-semibold'>
                          {product.title || product.name}
                          {product.isKit === true &&
                            product.children.length > 0 &&
                            product.children.map((child: KitChildren) => (
                              <p className='m-0 p-0 text-muted-foreground font-light' key={child.orderChildrenId}>
                                {`- ${child.title === undefined ? child.name : child.title} Qty: ${child.quantity}`}
                              </p>
                            ))}
                        </td>
                        <td className='text-muted-foreground'>{product.sku}</td>
                        <td className='text-center'>{product.quantity}</td>
                      </tr>
                    ))}
                    <tr className='bg-light text-[13px]'>
                      <td></td>
                      <td className='text-left font-bold text-nowrap'>Total</td>
                      <td className='text-center text-primary font-semibold'>{data.totalItems}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
        <div className='px-3 w-full lg:w-4/12'>
          <div className='px-3 w-full'>
            <Card className='h-full'>
              <CardHeader className='py-4'>
                <h5 className='font-semibold m-0'>Order Summary</h5>
              </CardHeader>
              <CardContent>
                <div className='flex flex-wrap -mx-3 m-0 p-0 flex flex-row justify-between items-start'>
                  <div className='px-3 w-6/12 m-0 p-0'>
                    <span className='text-muted-foreground text-[11.2px]'>Store:</span>
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
                    <span className='text-muted-foreground text-[11.2px]'>Order Date:</span>
                    <p className='text-[11.2px] font-semibold m-0'>{moment.utc(data.orderDate).format('LL')}</p>
                    <span className='text-muted-foreground text-[11.2px]'>Closed Date:</span>
                    {data.closedDate && <p className='text-[11.2px] font-semibold m-0'>{moment.utc(data.closedDate).format('LL')}</p>}
                  </div>
                  {/* <Col xs={6} className='m-0 p-0'>
                    <table className='table table-sm table-borderless table-nowrap m-0'>
                      <tbody className='text-[11.2px]'>
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
                </div>
              </CardContent>
            </Card>
          </div>
          <div className='px-3 w-full'>
            <Card className='h-full'>
              <CardHeader className='py-4'>
                <h5 className='font-semibold m-0'>Shipping</h5>
              </CardHeader>
              <CardContent>
                <table className='w-full whitespace-nowrap m-0 [&_th]:px-2 [&_th]:py-1 [&_td]:px-2 [&_td]:py-1'>
                  <tbody className='text-[11.2px]'>
                    <tr>
                      <td className='text-muted-foreground text-nowrap'>Carrier:</td>
                      <td className='font-semibold w-full capitalize'>{data.carrierUsed}</td>
                    </tr>
                    <tr>
                      <td className='text-muted-foreground text-nowrap'>Service Requested:</td>
                      <td className='font-semibold w-full capitalize'>{data.carrierService}</td>
                    </tr>
                    <tr>
                      <td className='text-muted-foreground text-nowrap'>Service Used:</td>
                      <td className='font-semibold w-full capitalize'>{data.carrierType}</td>
                    </tr>
                    <tr>
                      <td className='text-muted-foreground text-nowrap'># Of Pallets:</td>
                      <td className='font-semibold w-full'>{data.numberPallets}</td>
                    </tr>
                    <tr>
                      <td className='text-muted-foreground text-nowrap'># Of Boxes:</td>
                      <td className='font-semibold w-full'>{data.numberBoxes}</td>
                    </tr>
                    {/* <tr>
                      <td className='text-muted text-nowrap'>Customer Name:</td>
                      <td className='fw-semibold w-full capitalize'>{data.shipName}</td>
                    </tr>
                    <tr>
                      <td className='text-muted text-nowrap'>Address:</td>
                      <td className='fw-semibold w-full text-wrap'>
                        <p className='m-0 p-0'>{data.shipStreet}</p>
                        <p className='m-0 p-0'>
                          {data.shipCity}, {data.shipState}, {data.shipZipcode}, {data.shipCountry}
                        </p>
                      </td>
                    </tr> */}
                  </tbody>
                </table>
                <div className='px-1 text-[11.2px]'>
                  <span className='m-0 text-muted-foreground text-[11.2px]'>Tracking No.</span>
                  <ShipmentTrackingNumber
                    orderStatus={data.orderStatus}
                    orderType={data.orderType}
                    trackingNumber={data.trackingNumber}
                    trackingLink={data.trackingLink}
                    carrierIcon={data.carrierIcon}
                    carrierService={data.carrierService}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
          <div className='px-3 w-full'>
            <Card>
              <CardHeader className='py-4'>
                <h5 className='font-semibold m-0'>Charge Details</h5>
              </CardHeader>
              <CardContent>
                <table className='w-full whitespace-nowrap mb-0 [&_th]:px-2 [&_th]:py-1 [&_td]:px-2 [&_td]:py-1'>
                  <tbody className='text-[11.2px]'>
                    <tr className='border-b pb-2'>
                      <td className='text-muted-foreground flex flex-row justify-start items-start'>
                        Pick Pack Charge
                        {data.chargesFees && (
                          <>
                            <i className='ri-information-fill ms-1 text-[13px] text-muted-foreground' id={`tooltip${OrderId}`}></i>
                            <TooltipComponent target={`tooltip${OrderId}`} text={FBAServiceFees(data, currentRegion)} />
                          </>
                        )}
                      </td>
                      <td className='font-semibold text-right'>{FormatCurrency(state.currentRegion, data.pickpackCharge)}</td>
                    </tr>
                    <tr className='border-b pb-2'>
                      <td className='text-muted-foreground'>Shipping Charge</td>
                      <td className='font-semibold text-right'>{FormatCurrency(state.currentRegion, data.onixShipping)}</td>
                    </tr>
                    <tr className='border-b pb-2'>
                      <td className='text-muted-foreground'>Extra Charge</td>
                      <td className='font-semibold text-right'>{FormatCurrency(state.currentRegion, data.extraCharge)}</td>
                    </tr>
                    <tr>
                      <td className='font-bold'>TOTAL</td>
                      <td className='text-primary font-semibold text-right'>{FormatCurrency(state.currentRegion, data.totalCharge)}</td>
                    </tr>
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </div>
          {data.extraComment != '' && (
            <div className='px-3 xl:w-full'>
              <Card>
                <CardHeader className='py-4'>
                  <h5 className='font-semibold m-0'>Order Comment</h5>
                </CardHeader>
                <CardContent>
                  <p>{data.extraComment}</p>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default FBAShipmentType
