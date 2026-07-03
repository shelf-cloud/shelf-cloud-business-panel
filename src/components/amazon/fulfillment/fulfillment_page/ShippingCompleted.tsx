/* eslint-disable @next/next/no-img-element */
import Image from 'next/image'
import { useContext, useState } from 'react'

import boxIcon from '@assets/fulfillments/outbound_box.png'
import palletIcon from '@assets/fulfillments/outbound_pallet.png'
import AppContext from '@context/AppContext'
import useEffectAfterMount from '@hooks/useEffectAfterMount'
import { FormatCurrency, FormatIntNumber, FormatIntPercentage } from '@lib/FormatNumbers'
import { CleanStatus } from '@lib/SkuFormatting'
import { NoImageAdress } from '@lib/assetsConstants'
import { InboundPlan, PlacementOption } from '@typesTs/amazon/fulfillments/fulfillment'
import moment from 'moment'

import { Button } from '@shadcn/ui/button'
import { Card, CardContent, CardHeader } from '@shadcn/ui/card'
import { Label } from '@shadcn/ui/label'
import { Switch } from '@/components/ui/Switch'

import { validateIfPlacementOptionHasSPD } from './shippingLTL/helperFunctions'

type Props = {
  inboundPlan: InboundPlan
}

type FinalShipment = {
  shipmentId: string
  shippingMode: string
  deliveryWindow: string
  loadingDeliveryWindowOptions: boolean
}

const ShippingCompleted = ({ inboundPlan }: Props) => {
  const { state }: any = useContext(AppContext)
  const [placementOptionSelected, setplacementOptionSelected] = useState<PlacementOption>(inboundPlan.placementOptions[0])
  const [finalShippingCharges, setfinalShippingCharges] = useState({
    inboundPlanId: inboundPlan.inboundPlanId,
    sameShipDate: true,
    shipDate: '',
    sameShippingMode: inboundPlan.sameShippingMode,
    shippingMode: inboundPlan.shippingMode,
    sameShippingCarrier: !inboundPlan.placementOptionId ? 'amazon' : inboundPlan.sameShippingCarrier,
    nonAmazonCarrier: '',
    nonAmazonAlphaCode: '',
    placementOptionIdSelected: inboundPlan.placementOptionId,
    shipments: inboundPlan.placementOptions
      .find((placementOption) => inboundPlan.placementOptionId === placementOption.placementOptionId)
      ?.shipmentIds.reduce((acc: { [shipmentId: string]: FinalShipment }, shipmentId) => {
        acc[shipmentId] = {
          shipmentId: shipmentId,
          shippingMode: validateIfPlacementOptionHasSPD(inboundPlan.transportationOptions[inboundPlan.placementOptionId]) ? 'SPD' : 'LTL',
          deliveryWindow: '',
          loadingDeliveryWindowOptions: false,
        }
        return acc
      }, {}) as { [shipmentId: string]: FinalShipment },
  })

  useEffectAfterMount(() => {
    if (!inboundPlan.transportationOptions || Object.values(inboundPlan.transportationOptions).length === 0) return

    const chosenPlacementOption = inboundPlan.placementOptions[0]
    if (chosenPlacementOption) {
      setplacementOptionSelected(chosenPlacementOption)
      setfinalShippingCharges((prev) => {
        return {
          ...prev,
          sameShippingMode: inboundPlan.sameShippingMode,
          shippingMode: inboundPlan.shippingMode,
          sameShippingCarrier: inboundPlan.sameShippingCarrier,
          nonAmazonCarrier: '',
          nonAmazonAlphaCode: '',
          placementOptionIdSelected: chosenPlacementOption.placementOptionId,
          shipments: chosenPlacementOption.shipmentIds.reduce((acc: { [shipmentId: string]: FinalShipment }, shipmentId) => {
            acc[shipmentId] = {
              shipmentId: shipmentId,
              shippingMode: validateIfPlacementOptionHasSPD(inboundPlan.transportationOptions[chosenPlacementOption.placementOptionId]) ? 'SPD' : 'LTL',
              deliveryWindow: '',
              loadingDeliveryWindowOptions: false,
            }
            return acc
          }, {}),
        }
      })
    }
  }, [inboundPlan.placementOptions, inboundPlan.transportationOptions])

  return (
    <div className='w-full px-4'>
      {/* PLACEMENT OPTIONS */}
      <div>
        <p className='text-[16.25px] font-bold'>Selected inbound placement</p>
        <p className='my-1 p-0 text-[11.2px]'>Your shipping carrier costs are additional and are not included in the inbound placement service fee.</p>
        <div className='flex flex-row flex-wrap justify-start items-start gap-4 py-4'>
          {inboundPlan.placementOptions.map(
            (placementOption) =>
              Object.values(inboundPlan.transportationOptions[placementOption.placementOptionId]).reduce((total, shipment) => {
                const subtotal = shipment.length
                return total + subtotal
              }, 0) > 0 &&
              Object.values(inboundPlan.transportationOptions[placementOption.placementOptionId]).reduce((total, shipment) => {
                const subtotal =
                  shipment.find((option) => option.shippingSolution === 'AMAZON_PARTNERED_CARRIER' && option.shippingMode === 'GROUND_SMALL_PARCEL')?.quote?.cost.amount! ||
                  shipment.find((option) => option.shippingSolution === 'AMAZON_PARTNERED_CARRIER' && option.shippingMode === 'FREIGHT_LTL')?.quote?.cost.amount!
                return total + subtotal
              }, 0) > 0 && (
                <Card
                  key={placementOption.placementOptionId}
                  className={
                    'max-w-full px-2 py-0 my-0 shadow-[0_0.125rem_0.25rem_rgba(0,0,0,0.075)] ' +
                    ((placementOptionSelected.placementOptionId === placementOption.placementOptionId || inboundPlan.placementOptionId === placementOption.placementOptionId) &&
                      'border border-[3px] border-success')
                  }>
                  <CardContent>
                    <p className='mt-2 mb-1 p-0 font-semibold text-[19.5px]'>
                      <span>{placementOption.shipmentIds.length}</span> {placementOption.shipmentIds.length > 1 ? 'Shipments' : 'Shipment'}
                      {placementOptionSelected.placementOptionId === placementOption.placementOptionId && (
                        <i className={'ri-checkbox-circle-fill align-middle ms-2 text-[19.5px] text-success'} />
                      )}
                    </p>
                    <p className='m-0 p-0 text-[11.2px]'>
                      Status: <span className='font-bold text-info'>{placementOption.status}</span>
                    </p>
                    <p className='m-0 p-0 text-[11.2px]'>
                      Expires: <span className='text-danger'>{moment.utc(placementOption.expiration).local().format('LL h:mm a')}</span>
                    </p>

                    {placementOption.fees.map((fee, feeIndex) => (
                      <p key={feeIndex} className='my-2 p-0 text-[11.2px]'>
                        {fee.target} <span className='font-semibold'>{FormatCurrency(state.currentRegion, fee.value.amount)}</span> {fee.value.code}
                      </p>
                    ))}

                    {placementOption.discounts.map((discount, discountIndex) => (
                      <p key={discountIndex} className='my-2 p-0 text-[11.2px]'>
                        {discount.target} <span className='font-semibold'>{FormatCurrency(state.currentRegion, discount.value.amount)}</span> {discount.value.code}
                      </p>
                    ))}
                    <p className='m-0 text-[11.2px] text-muted-foreground font-light'>ID: {placementOption.placementOptionId}</p>
                  </CardContent>
                </Card>
              )
          )}
        </div>
      </div>
      {/* SAME SHIPPING MODE */}
      <div>
        <p className='text-[16.25px] font-bold'>Shipping mode</p>
        <div className='flex justify-start items-center gap-2 p-0 my-4'>
          <Switch id='showShippingMode' name='showShippingMode' disabled={true} checked={finalShippingCharges.sameShippingMode} />
          <Label className='check-form-label m-0 font-normal' htmlFor='showShippingMode'>
            Shipping mode will be same for all shipments
          </Label>
        </div>
        {finalShippingCharges.sameShippingMode ? (
          <div className='flex justify-start items-start gap-4'>
            <Card className={'shadow-[0_0.125rem_0.25rem_rgba(0,0,0,0.075)] ' + (finalShippingCharges.shippingMode === 'SPD' && 'border border-[3px] border-success')}>
              <CardContent className='flex justify-start items-center gap-1'>
                <div
                  className='my-2'
                  style={{
                    width: '80px',
                    height: '50px',
                    margin: '2px 0px',
                    position: 'relative',
                  }}>
                  <Image
                    src={boxIcon}
                    alt='box_icon'
                    className='object-contain'
                    style={{
                      maxWidth: '100%',
                      height: 'auto',
                    }}
                  />
                </div>
                <div>
                  <p className='m-0 p-0 text-[11.2px] font-semibold'>Small Parcel Delivery (SPD)</p>
                  <p className='m-0 p-0 text-[11.2px]'>
                    {inboundPlan.totalSpdFees > 0 ? (
                      `Starting at ${FormatCurrency(state.currentRegion, inboundPlan.totalSpdFees)}`
                    ) : (
                      <span className='text-danger font-semibold'>Not Available</span>
                    )}
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card className={'shadow-[0_0.125rem_0.25rem_rgba(0,0,0,0.075)] ' + (finalShippingCharges.shippingMode === 'LTL' && 'border border-[3px] border-success')}>
              <CardContent className='flex justify-start items-center gap-1'>
                <div
                  className='my-2'
                  style={{
                    width: '80px',
                    height: '50px',
                    margin: '2px 0px',
                    position: 'relative',
                  }}>
                  <Image
                    src={palletIcon}
                    alt='box_icon'
                    className='object-contain'
                    style={{
                      maxWidth: '100%',
                      height: 'auto',
                    }}
                  />
                </div>
                <div>
                  <p className='m-0 p-0 text-[11.2px] font-semibold'>Less than and Full TruckLoad (LTL/FTL)</p>
                  <p className='m-0 p-0 text-[11.2px]'>
                    {inboundPlan.totalLtlFees > 0 ? (
                      <>Estimates Starting at {FormatCurrency(state.currentRegion, inboundPlan.totalLtlFees)}</>
                    ) : (
                      <span className='m-0 p-0 text-danger'>One or more shipments do not have LTL/FTL options.</span>
                    )}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : null}
      </div>
      {/* SAME SHIPPING CARRIER */}
      {finalShippingCharges.sameShippingMode && finalShippingCharges.shippingMode === 'SPD' ? (
        <div>
          <p className='text-[16.25px] font-bold'>Select Shipping Carrier</p>
          <div className='flex flex-wrap -mx-3 my-4 flex gap-4'>
            <div className='px-3 w-full lg:w-3/12'>
              <Card className={'m-0 shadow-[0_0.125rem_0.25rem_rgba(0,0,0,0.075)] ' + (finalShippingCharges.sameShippingCarrier === 'amazon' && 'border border-[3px] border-success')}>
                <CardContent>
                  <p className='m-0 p-0 text-[11.2px] font-semibold'>UPS (Amazon Partnered Carrier)*</p>
                  <p className='m-0 p-0 text-[11.2px]'>Pickup cost is NOT Included with the rate</p>
                  <p className='m-0 p-0 text-[16.25px] font-bold'>
                    {(Object.values(inboundPlan.transportationOptions[placementOptionSelected.placementOptionId]).reduce((total, shipment) => {
                      const subtotal = shipment
                        .filter((option) => option.shippingSolution === 'AMAZON_PARTNERED_CARRIER' && option.shippingMode === 'GROUND_SMALL_PARCEL')
                        .sort((a, b) => a.quote?.cost.amount! - b.quote?.cost.amount!)[0]?.quote?.cost.amount!
                      return total + subtotal
                    }, 0) || 0) > 0 ? (
                      FormatCurrency(
                        state.currentRegion,
                        inboundPlan.transportationOptions[placementOptionSelected.placementOptionId]
                          ? Object.values(inboundPlan.transportationOptions[placementOptionSelected.placementOptionId]).reduce((total, shipment) => {
                              const subtotal = shipment
                                .filter((option) => option.shippingSolution === 'AMAZON_PARTNERED_CARRIER' && option.shippingMode === 'GROUND_SMALL_PARCEL')
                                .sort((a, b) => a.quote?.cost.amount! - b.quote?.cost.amount!)[0]?.quote?.cost.amount!
                              return total + subtotal
                            }, 0) || 0
                          : 0
                      )
                    ) : (
                      <span className='text-danger font-semibold'>Not Available</span>
                    )}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      ) : null}
      {/* SHIPMENTS */}
      <div>
        <p className='text-[16.25px] font-bold'>Number of shipments: {placementOptionSelected.shipmentIds.length}</p>
        <div className='flex flex-row flex-wrap justify-start items-start gap-4'>
          {placementOptionSelected.shipmentIds.map((shipmentId, shipmentIndex) => (
            <Card
              key={shipmentId}
              className='m-0 shadow-[0_0.125rem_0.25rem_rgba(0,0,0,0.075)]'
              style={{ width: 'fit-content', maxWidth: '430px', zIndex: placementOptionSelected.shipmentIds.length - shipmentIndex }}>
              <CardHeader>
                <p className='m-0 p-0 font-bold text-[13px]'>Shipment #{shipmentIndex + 1}</p>
                <p className='m-0 p-0 text-[11.2px] text-muted-foreground font-light'>ID: {shipmentId}</p>
              </CardHeader>
              <CardContent>
                <p className='m-0 text-[11.2px]'>
                  <span className='text-primary'>Ship From: </span>
                  {inboundPlan.confirmedShipments[shipmentId]?.shipment.source.address.name}, {inboundPlan.confirmedShipments[shipmentId]?.shipment.source.address.addressLine1},{' '}
                  {inboundPlan.confirmedShipments[shipmentId]?.shipment.source.address.city},{' '}
                  {inboundPlan.confirmedShipments[shipmentId]?.shipment.source.address.stateOrProvinceCode},{' '}
                  {inboundPlan.confirmedShipments[shipmentId]?.shipment.source.address.postalCode},{' '}
                  {inboundPlan.confirmedShipments[shipmentId]?.shipment.source.address.countryCode}
                </p>
                <p className='m-0 text-[11.2px]'>
                  <span className='text-primary'>Ship to: </span>
                  {inboundPlan.confirmedShipments[shipmentId]?.shipment.destination.warehouseId} -{' '}
                  {inboundPlan.confirmedShipments[shipmentId]?.shipment.destination.address.addressLine1},{' '}
                  {inboundPlan.confirmedShipments[shipmentId]?.shipment.destination.address.city},{' '}
                  {inboundPlan.confirmedShipments[shipmentId]?.shipment.destination.address.stateOrProvinceCode},{' '}
                  {inboundPlan.confirmedShipments[shipmentId]?.shipment.destination.address.countryCode}
                </p>
                <p className='my-2 p-0 font-semibold text-[11.2px]'>Shipment Contents</p>
                <div className='flex flex-row flex-nowrap justify-between items-start'>
                  <div>
                    <p className='m-0 p-0 text-[11.2px]'>
                      Boxes: <span className='font-bold'>{inboundPlan.confirmedShipments[shipmentId].shipmentBoxes.boxes.reduce((total, item) => total + item.quantity, 0)}</span>
                    </p>
                    <p className='m-0 p-0 text-[11.2px]'>
                      SKUs: <span className='font-bold'>{inboundPlan.confirmedShipments[shipmentId].shipmentItems.items.length}</span>
                    </p>
                    <p className='m-0 p-0 text-[11.2px]'>
                      Units:{' '}
                      <span className='font-bold'>
                        {inboundPlan.confirmedShipments[shipmentId].shipmentBoxes.boxes.reduce((total, item) => {
                          const totalitems = item.items.reduce((total, item) => total + item.quantity, 0) * item.quantity
                          return total + totalitems
                        }, 0)}
                      </span>
                    </p>
                    <p className='m-0 p-0 text-[11.2px]'>
                      Weight:{' '}
                      <span className='font-bold'>
                        {FormatIntPercentage(
                          state.currentRegion,
                          inboundPlan.confirmedShipments[shipmentId].shipmentBoxes.boxes.reduce((total, item) => {
                            const totalitems = item.weight.value * item.quantity
                            return total + totalitems
                          }, 0)
                        )}{' '}
                        Lb
                      </span>
                    </p>
                  </div>
                  <div className='flex flex-row flex-nowrap justify-end items-center gap-2'>
                    {inboundPlan.confirmedShipments[shipmentId].shipmentItems.items.map(
                      (item, itemIndex) =>
                        itemIndex <= 2 && (
                          <div
                            key={`${shipmentId}-${itemIndex}`}
                            className='my-2'
                            style={{
                              width: '50px',
                              height: '50px',
                              margin: '2px 0px',
                              position: 'relative',
                            }}>
                            <img
                              loading='lazy'
                              src={inboundPlan.skus_details[item.msku]?.image ? inboundPlan.skus_details[item.msku]?.image : NoImageAdress}
                              alt={item.msku || 'SKU'}
                              style={{ objectFit: 'contain', objectPosition: 'center', width: '100%', height: '100%' }}
                            />
                          </div>
                        )
                    )}
                    {inboundPlan.confirmedShipments[shipmentId].shipmentItems.items.length > 3 && (
                      <p>+{inboundPlan.confirmedShipments[shipmentId].shipmentItems.items.length - 3}</p>
                    )}
                  </div>
                </div>
                <div>
                  {/* SAME SHIPPING MODE && AMAZON */}
                  {finalShippingCharges.sameShippingMode && finalShippingCharges.shippingMode === 'SPD' && finalShippingCharges.sameShippingCarrier === 'amazon' ? (
                    <p className='m-0 mt-4 p-0 text-[11.2px] text-right'>
                      <span className='font-semibold'>
                        {inboundPlan.transportationOptions[placementOptionSelected.placementOptionId][shipmentId][0].quote?.cost.amount! > 0 ? (
                          `Estimated Carrier Charges: ${FormatCurrency(state.currentRegion, inboundPlan.transportationOptions[placementOptionSelected.placementOptionId][shipmentId][0].quote?.cost.amount!)}`
                        ) : (
                          <span className='text-danger font-semibold'>Not Available</span>
                        )}
                      </span>
                    </p>
                  ) : null}

                  {/* SAME SHIPPING MODE && LTL */}
                  {finalShippingCharges.sameShippingMode && finalShippingCharges.shippingMode === 'LTL' ? (
                    <>
                      <div className='my-4'>
                        <p className='m-0 p-0 font-semibold text-[11.2px]'>Pallet estimates:</p>
                        <div className='overflow-x-auto'>
                          <table className='w-full align-middle mb-0 [&_th]:px-2 [&_th]:py-1 [&_td]:px-2 [&_td]:py-1'>
                            <tbody className='text-[11.2px]'>
                              <tr>
                                <td>
                                  Pallets:{' '}
                                  <span className='font-semibold'>
                                    {FormatIntNumber(state.currentRegion, inboundPlan.confirmedShipments[shipmentId].shipmentPallets?.pallets!.length ?? 1)}
                                  </span>
                                </td>
                                <td>
                                  Total Weight:{' '}
                                  <span className='font-semibold'>
                                    {FormatIntPercentage(
                                      state.currentRegion,
                                      inboundPlan.confirmedShipments[shipmentId].shipmentPallets?.pallets!.reduce((total, pallet) => total + pallet.weight.value, 0)
                                    )}{' '}
                                    lb
                                  </span>
                                </td>
                              </tr>
                              <tr>
                                <td>Value: --</td>
                                <td>
                                  Total Volume:{' '}
                                  <span className='font-semibold'>
                                    {FormatIntPercentage(
                                      state.currentRegion,
                                      inboundPlan.confirmedShipments[shipmentId].shipmentPallets?.pallets!.reduce(
                                        (total, box) => total + box.dimensions.width * box.dimensions.height * box.dimensions.length * box.quantity,
                                        0
                                      )
                                    )}{' '}
                                    inch3
                                  </span>
                                </td>
                              </tr>
                              <tr>
                                <td>Frieght Class: --</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                        <p className='m-0 mt-4 p-0 text-[11.2px] text-left'>
                          Carrier:{' '}
                          <span className='font-semibold'>{inboundPlan.transportationOptions[placementOptionSelected.placementOptionId][shipmentId][0].carrier.alphaCode}</span>
                        </p>
                        <p className='m-0 p-0 text-[11.2px] text-left'>
                          Pick up:{' '}
                          <span className='font-semibold'>
                            {moment(inboundPlan.transportationOptions[placementOptionSelected.placementOptionId][shipmentId][0].carrierAppointment?.startTime).format('LL')}
                          </span>
                        </p>
                        <p className='m-0 p-0 text-[11.2px] text-right'>
                          {inboundPlan.transportationOptions[placementOptionSelected.placementOptionId][shipmentId][0].quote?.cost.amount! > 0 ? (
                            <>
                              Estimated Carrier Charges:{' '}
                              <span className='font-semibold'>
                                {FormatCurrency(
                                  state.currentRegion,
                                  inboundPlan.transportationOptions[placementOptionSelected.placementOptionId][shipmentId][0].quote?.cost.amount!
                                )}
                              </span>
                            </>
                          ) : (
                            'Estimate Not Available'
                          )}
                        </p>
                      </div>
                    </>
                  ) : null}

                  {/* DIFFERENT SHIPPING MODE */}
                  {!finalShippingCharges.sameShippingMode && (
                    <div className='my-4'>
                      <p className='m-0 p-0 font-semibold text-[11.2px]'>Shipping Mode:</p>
                      <div className='my-2 flex flex-col justify-start items-start gap-2'>
                        {/* SHIPPING MODE SPD */}
                        <div className='flex flex-row justify-start items-center gap-4'>
                          <input
                            type='radio'
                            className='my-0 size-4 shrink-0 border border-input-border accent-primary rounded-full'
                            id={`shippingModeSPD-${shipmentId}`}
                            name={`shippingModeSPD-${shipmentId}`}
                            disabled={true}
                            checked={inboundPlan.transportationOptions[placementOptionSelected.placementOptionId][shipmentId][0].shippingMode.includes('PARCEL')}
                          />
                          <div
                            className='m-0'
                            style={{
                              width: '50px',
                              height: '40px',
                              margin: '2px 0px',
                              position: 'relative',
                            }}>
                            <Image
                              src={boxIcon}
                              alt='box_icon'
                              className='object-contain'
                              style={{
                                maxWidth: '100%',
                                height: 'auto',
                              }}
                            />
                          </div>
                          <div>
                            <p className='m-0 p-0 text-[11.2px] font-semibold'>Small Parcel Delivery (SPD)</p>
                            <p className='m-0 p-0 text-[11.2px]'>
                              {inboundPlan.transportationOptions[placementOptionSelected.placementOptionId][shipmentId][0].shippingMode.includes('PARCEL') ? (
                                `Starting at ${FormatCurrency(state.currentRegion, inboundPlan.transportationOptions[placementOptionSelected.placementOptionId][shipmentId][0].quote?.cost.amount!)}`
                              ) : (
                                <span className='m-0 p-0 text-danger'>Not Available</span>
                              )}
                            </p>
                          </div>
                        </div>

                        {/* SHIPPING MODE LTL */}
                        <div className='flex flex-col justify-start items-center gap-2'>
                          <div className='flex flex-row justify-start items-center gap-4'>
                            <input
                              type='radio'
                              className='my-0 size-4 shrink-0 border border-input-border accent-primary rounded-full'
                              disabled={true}
                              id={`shippingModeLTL-${shipmentId}`}
                              name={`shippingModeLTL-${shipmentId}`}
                              checked={inboundPlan.transportationOptions[placementOptionSelected.placementOptionId][shipmentId][0].shippingMode.includes('LTL')}
                            />
                            <div
                              className='m-0'
                              style={{
                                width: '50px',
                                height: '40px',
                                margin: '2px 0px',
                                position: 'relative',
                              }}>
                              <Image
                                src={palletIcon}
                                alt='box_icon'
                                className='object-contain'
                                style={{
                                  maxWidth: '100%',
                                  height: 'auto',
                                }}
                              />
                            </div>
                            <div>
                              <p className='m-0 p-0 text-[11.2px] font-semibold'>Less than and Full TruckLoad (LTL/FTL)</p>
                              <p className='m-0 p-0 text-[11.2px]'>
                                {inboundPlan.transportationOptions[placementOptionSelected.placementOptionId][shipmentId][0].shippingMode.includes('LTL') ? (
                                  <>
                                    Estimates Starting at{' '}
                                    {FormatCurrency(
                                      state.currentRegion,
                                      inboundPlan.transportationOptions[placementOptionSelected.placementOptionId][shipmentId][0].quote?.cost.amount ?? 0
                                    )}
                                  </>
                                ) : (
                                  <span className='m-0 p-0 text-danger'>Not Available</span>
                                )}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {inboundPlan.transportationOptions[placementOptionSelected.placementOptionId][shipmentId][0].shippingMode.includes('PARCEL') ? (
                        <>
                          <p className='m-0 p-0 font-semibold text-[11.2px]'>Carrier:</p>
                          <div className='my-2 flex flex-col justify-start items-start gap-2'>
                            {/* CARRIER AMAZON PARTNERED */}
                            <div className='flex flex-row justify-start items-center gap-4'>
                              <input
                                type='radio'
                                className='my-0 size-4 shrink-0 border border-input-border accent-primary rounded-full'
                                id={`shippingCarrierAmazon-${shipmentId}`}
                                name={`shippingCarrierAmazon-${shipmentId}`}
                                checked={finalShippingCharges.sameShippingCarrier === 'amazon'}
                              />
                              <div className={'' + (finalShippingCharges.sameShippingCarrier !== 'amazon' && 'text-muted-foreground')}>
                                <p className='m-0 p-0 text-[11.2px]'>{`${inboundPlan.transportationOptions[placementOptionSelected.placementOptionId][shipmentId][0].carrier.alphaCode} (${CleanStatus(
                                  inboundPlan.transportationOptions[placementOptionSelected.placementOptionId][shipmentId][0].shippingSolution
                                )})`}</p>
                                <p className='m-0 p-0 text-[11.2px] font-bold'>
                                  {inboundPlan.transportationOptions[placementOptionSelected.placementOptionId][shipmentId][0].shippingMode.includes('PARCEL') ? (
                                    FormatCurrency(
                                      state.currentRegion,
                                      inboundPlan.transportationOptions[placementOptionSelected.placementOptionId][shipmentId][0].quote?.cost.amount!
                                    )
                                  ) : (
                                    <span className='text-danger font-semibold'>Not Available</span>
                                  )}
                                </p>
                              </div>
                            </div>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className='my-4'>
                            <p className='m-0 p-0 font-semibold text-[11.2px]'>Pallet estimates:</p>
                            <div className='overflow-x-auto'>
                              <table className='w-full align-middle mb-0 [&_th]:px-2 [&_th]:py-1 [&_td]:px-2 [&_td]:py-1'>
                                <tbody className='text-[11.2px]'>
                                  <tr>
                                    <td>
                                      Pallets:{' '}
                                      <span className='font-semibold'>
                                        {FormatIntNumber(state.currentRegion, inboundPlan.confirmedShipments[shipmentId].shipmentPallets?.pallets!.length ?? 1)}
                                      </span>
                                    </td>
                                    <td>
                                      Total Weight:{' '}
                                      <span className='font-semibold'>
                                        {FormatIntPercentage(
                                          state.currentRegion,
                                          inboundPlan.confirmedShipments[shipmentId].shipmentPallets?.pallets!.reduce((total, pallet) => total + pallet.weight.value, 0)
                                        )}{' '}
                                        lb
                                      </span>
                                    </td>
                                  </tr>
                                  <tr>
                                    <td>Value: --</td>
                                    <td>
                                      Total Volume:{' '}
                                      <span className='font-semibold'>
                                        {FormatIntPercentage(
                                          state.currentRegion,
                                          inboundPlan.confirmedShipments[shipmentId].shipmentPallets?.pallets!.reduce(
                                            (total, box) => total + box.dimensions.width * box.dimensions.height * box.dimensions.length * box.quantity,
                                            0
                                          )
                                        )}{' '}
                                        inch3
                                      </span>
                                    </td>
                                  </tr>
                                  <tr>
                                    <td>Frieght Class: --</td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                            <p className='m-0 mt-4 p-0 text-[11.2px] text-left'>
                              Carrier:{' '}
                              <span className='font-semibold'>
                                {inboundPlan.transportationOptions[placementOptionSelected.placementOptionId][shipmentId][0].carrier.alphaCode ||
                                  inboundPlan.transportationOptions[placementOptionSelected.placementOptionId][shipmentId][0].carrier.name}
                              </span>
                            </p>
                            <p className='m-0 p-0 text-[11.2px] text-left'>
                              Pick up:{' '}
                              <span className='font-semibold'>
                                {moment(
                                  inboundPlan.transportationOptions[placementOptionSelected.placementOptionId][shipmentId][0].carrierAppointment?.startTime ||
                                    inboundPlan.confirmedShipments[shipmentId]?.shipment.dates.readyToShipWindow.start
                                ).format('LL')}
                              </span>
                            </p>
                            <p className='m-0 p-0 text-[11.2px] text-right'>
                              {inboundPlan.transportationOptions[placementOptionSelected.placementOptionId][shipmentId][0].quote?.cost.amount! > 0 ? (
                                <>
                                  Estimated Carrier Charges:{' '}
                                  <span className='font-semibold'>
                                    {FormatCurrency(
                                      state.currentRegion,
                                      inboundPlan.transportationOptions[placementOptionSelected.placementOptionId][shipmentId][0].quote?.cost.amount!
                                    )}
                                  </span>
                                </>
                              ) : (
                                'Estimate Not Available'
                              )}
                            </p>
                          </div>
                        </>
                      )}
                    </div>
                  )}

                  {!finalShippingCharges.sameShippingMode && finalShippingCharges.shipments[shipmentId].shippingMode === 'SPD' && (
                    <div className='mt-4'>
                      <p className='m-0 my-4 p-0 text-muted-foreground text-[11.2px]'>
                        * The Amazon Partnered Carrier program offers discounted shipping rates, the convenience of buying and printing shipping labels when you create shipments,
                        and automated tracking.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      {/* TOTAL ESTIMATED FEES */}
      <div className='flex flex-wrap -mx-3 my-4'>
        <div className='px-3 w-full lg:w-8/12'></div>
        <div className='px-3 w-full lg:w-4/12'>
          <table className='w-full align-middle mb-0 text-[11.2px] [&_th]:px-2 [&_th]:py-1 [&_td]:px-2 [&_td]:py-1'>
            <tbody>
              <tr>
                <td>Total prep and labeling fees:</td>
                <td>{FormatCurrency(state.currentRegion, 0)}</td>
              </tr>
              <tr>
                <td>Total placement fees:</td>
                <td>{FormatCurrency(state.currentRegion, inboundPlan.totalPlacementFees)}</td>
              </tr>
              <tr>
                <td>{inboundPlan.totalSpdFees > 0 ? 'SPD shipping fees:' : 'Total estimated shipping fees:'}</td>
                <td>{FormatCurrency(state.currentRegion, inboundPlan.totalSpdFees)}</td>
              </tr>
              {inboundPlan.totalLtlFees > 0 && (
                <tr>
                  <td>LTL shipping fees:</td>
                  <td>{FormatCurrency(state.currentRegion, inboundPlan.totalLtlFees)}</td>
                </tr>
              )}
              <tr className='font-bold'>
                <td>Total estimated prep, labeling, placement, and shipping fees (other fees may apply):</td>
                <td>{FormatCurrency(state.currentRegion, inboundPlan.totalFees)}</td>
              </tr>
            </tbody>
          </table>
          {inboundPlan.fulfillmentType === 'Master Boxes' && (
            <div className='flex justify-end items-center'>
              <Button disabled={true} variant='success' id='btn_handleNextShipping'>
                Charges Already Confirmed
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ShippingCompleted
