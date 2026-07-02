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

import { Button, Card, CardBody, CardHeader, Col, Input, Label, Row, Switch } from '@/components/migration-ui'

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
    <div className='tw:w-full tw:px-4'>
      {/* PLACEMENT OPTIONS */}
      <div>
        <p className='tw:text-[16.25px] tw:font-bold'>Selected inbound placement</p>
        <p className='tw:my-1 tw:p-0 tw:text-[11.2px]'>Your shipping carrier costs are additional and are not included in the inbound placement service fee.</p>
        <div className='tw:flex tw:flex-row tw:flex-wrap tw:justify-start tw:items-start tw:gap-4 tw:py-4'>
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
                    'tw:max-w-full tw:px-2 tw:py-0 tw:my-0 tw:shadow-[0_0.125rem_0.25rem_rgba(0,0,0,0.075)] ' +
                    ((placementOptionSelected.placementOptionId === placementOption.placementOptionId || inboundPlan.placementOptionId === placementOption.placementOptionId) &&
                      'tw:border tw:border-[3px] tw:border-success')
                  }>
                  <CardBody>
                    <p className='tw:mt-2 tw:mb-1 tw:p-0 tw:font-semibold tw:text-[19.5px]'>
                      <span>{placementOption.shipmentIds.length}</span> {placementOption.shipmentIds.length > 1 ? 'Shipments' : 'Shipment'}
                      {placementOptionSelected.placementOptionId === placementOption.placementOptionId && (
                        <i className={'ri-checkbox-circle-fill align-middle ms-2 fs-4 text-success'} />
                      )}
                    </p>
                    <p className='tw:m-0 tw:p-0 tw:text-[11.2px]'>
                      Status: <span className='tw:font-bold tw:text-info'>{placementOption.status}</span>
                    </p>
                    <p className='tw:m-0 tw:p-0 tw:text-[11.2px]'>
                      Expires: <span className='tw:text-danger'>{moment.utc(placementOption.expiration).local().format('LL h:mm a')}</span>
                    </p>

                    {placementOption.fees.map((fee, feeIndex) => (
                      <p key={feeIndex} className='tw:my-2 tw:p-0 tw:text-[11.2px]'>
                        {fee.target} <span className='tw:font-semibold'>{FormatCurrency(state.currentRegion, fee.value.amount)}</span> {fee.value.code}
                      </p>
                    ))}

                    {placementOption.discounts.map((discount, discountIndex) => (
                      <p key={discountIndex} className='tw:my-2 tw:p-0 tw:text-[11.2px]'>
                        {discount.target} <span className='tw:font-semibold'>{FormatCurrency(state.currentRegion, discount.value.amount)}</span> {discount.value.code}
                      </p>
                    ))}
                    <p className='tw:m-0 tw:text-[11.2px] tw:text-[var(--bs-secondary-color)] tw:font-light'>ID: {placementOption.placementOptionId}</p>
                  </CardBody>
                </Card>
              )
          )}
        </div>
      </div>
      {/* SAME SHIPPING MODE */}
      <div>
        <p className='tw:text-[16.25px] tw:font-bold'>Shipping mode</p>
        <div className='form-check form-switch form-switch-sm tw:flex tw:justify-start tw:items-center tw:gap-2 tw:p-0 tw:my-4'>
          <Switch id='showShippingMode' name='showShippingMode' disabled={true} checked={finalShippingCharges.sameShippingMode} />
          <Label className='check-form-label tw:m-0 tw:font-normal' for='showShippingMode'>
            Shipping mode will be same for all shipments
          </Label>
        </div>
        {finalShippingCharges.sameShippingMode ? (
          <div className='tw:flex tw:justify-start tw:items-start tw:gap-4'>
            <Card className={'tw:shadow-[0_0.125rem_0.25rem_rgba(0,0,0,0.075)] ' + (finalShippingCharges.shippingMode === 'SPD' && 'tw:border tw:border-[3px] tw:border-success')}>
              <CardBody className='tw:flex tw:justify-start tw:items-center tw:gap-1'>
                <div
                  className='tw:my-2'
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
                  <p className='tw:m-0 tw:p-0 tw:text-[11.2px] tw:font-semibold'>Small Parcel Delivery (SPD)</p>
                  <p className='tw:m-0 tw:p-0 tw:text-[11.2px]'>
                    {inboundPlan.totalSpdFees > 0 ? (
                      `Starting at ${FormatCurrency(state.currentRegion, inboundPlan.totalSpdFees)}`
                    ) : (
                      <span className='tw:text-danger tw:font-semibold'>Not Available</span>
                    )}
                  </p>
                </div>
              </CardBody>
            </Card>
            <Card className={'tw:shadow-[0_0.125rem_0.25rem_rgba(0,0,0,0.075)] ' + (finalShippingCharges.shippingMode === 'LTL' && 'tw:border tw:border-[3px] tw:border-success')}>
              <CardBody className='tw:flex tw:justify-start tw:items-center tw:gap-1'>
                <div
                  className='tw:my-2'
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
                  <p className='tw:m-0 tw:p-0 tw:text-[11.2px] tw:font-semibold'>Less than and Full TruckLoad (LTL/FTL)</p>
                  <p className='tw:m-0 tw:p-0 tw:text-[11.2px]'>
                    {inboundPlan.totalLtlFees > 0 ? (
                      <>Estimates Starting at {FormatCurrency(state.currentRegion, inboundPlan.totalLtlFees)}</>
                    ) : (
                      <span className='tw:m-0 tw:p-0 tw:text-danger'>One or more shipments do not have LTL/FTL options.</span>
                    )}
                  </p>
                </div>
              </CardBody>
            </Card>
          </div>
        ) : null}
      </div>
      {/* SAME SHIPPING CARRIER */}
      {finalShippingCharges.sameShippingMode && finalShippingCharges.shippingMode === 'SPD' ? (
        <div>
          <p className='tw:text-[16.25px] tw:font-bold'>Select Shipping Carrier</p>
          <Row className='tw:my-4 tw:flex tw:gap-4'>
            <Col xs='12' lg='3'>
              <Card className={'tw:m-0 tw:shadow-[0_0.125rem_0.25rem_rgba(0,0,0,0.075)] ' + (finalShippingCharges.sameShippingCarrier === 'amazon' && 'tw:border tw:border-[3px] tw:border-success')}>
                <CardBody>
                  <p className='tw:m-0 tw:p-0 tw:text-[11.2px] tw:font-semibold'>UPS (Amazon Partnered Carrier)*</p>
                  <p className='tw:m-0 tw:p-0 tw:text-[11.2px]'>Pickup cost is NOT Included with the rate</p>
                  <p className='tw:m-0 tw:p-0 tw:text-[16.25px] tw:font-bold'>
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
                      <span className='tw:text-danger tw:font-semibold'>Not Available</span>
                    )}
                  </p>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </div>
      ) : null}
      {/* SHIPMENTS */}
      <div>
        <p className='tw:text-[16.25px] tw:font-bold'>Number of shipments: {placementOptionSelected.shipmentIds.length}</p>
        <div className='tw:flex tw:flex-row tw:flex-wrap tw:justify-start tw:items-start tw:gap-4'>
          {placementOptionSelected.shipmentIds.map((shipmentId, shipmentIndex) => (
            <Card
              key={shipmentId}
              className='tw:m-0 tw:shadow-[0_0.125rem_0.25rem_rgba(0,0,0,0.075)]'
              style={{ width: 'fit-content', maxWidth: '430px', zIndex: placementOptionSelected.shipmentIds.length - shipmentIndex }}>
              <CardHeader>
                <p className='tw:m-0 tw:p-0 tw:font-bold tw:text-[13px]'>Shipment #{shipmentIndex + 1}</p>
                <p className='tw:m-0 tw:p-0 tw:text-[11.2px] tw:text-[var(--bs-secondary-color)] tw:font-light'>ID: {shipmentId}</p>
              </CardHeader>
              <CardBody>
                <p className='tw:m-0 tw:text-[11.2px]'>
                  <span className='tw:text-primary'>Ship From: </span>
                  {inboundPlan.confirmedShipments[shipmentId]?.shipment.source.address.name}, {inboundPlan.confirmedShipments[shipmentId]?.shipment.source.address.addressLine1},{' '}
                  {inboundPlan.confirmedShipments[shipmentId]?.shipment.source.address.city},{' '}
                  {inboundPlan.confirmedShipments[shipmentId]?.shipment.source.address.stateOrProvinceCode},{' '}
                  {inboundPlan.confirmedShipments[shipmentId]?.shipment.source.address.postalCode},{' '}
                  {inboundPlan.confirmedShipments[shipmentId]?.shipment.source.address.countryCode}
                </p>
                <p className='tw:m-0 tw:text-[11.2px]'>
                  <span className='tw:text-primary'>Ship to: </span>
                  {inboundPlan.confirmedShipments[shipmentId]?.shipment.destination.warehouseId} -{' '}
                  {inboundPlan.confirmedShipments[shipmentId]?.shipment.destination.address.addressLine1},{' '}
                  {inboundPlan.confirmedShipments[shipmentId]?.shipment.destination.address.city},{' '}
                  {inboundPlan.confirmedShipments[shipmentId]?.shipment.destination.address.stateOrProvinceCode},{' '}
                  {inboundPlan.confirmedShipments[shipmentId]?.shipment.destination.address.countryCode}
                </p>
                <p className='tw:my-2 tw:p-0 tw:font-semibold tw:text-[11.2px]'>Shipment Contents</p>
                <div className='tw:flex tw:flex-row tw:flex-nowrap tw:justify-between tw:items-start'>
                  <div>
                    <p className='tw:m-0 tw:p-0 tw:text-[11.2px]'>
                      Boxes: <span className='tw:font-bold'>{inboundPlan.confirmedShipments[shipmentId].shipmentBoxes.boxes.reduce((total, item) => total + item.quantity, 0)}</span>
                    </p>
                    <p className='tw:m-0 tw:p-0 tw:text-[11.2px]'>
                      SKUs: <span className='tw:font-bold'>{inboundPlan.confirmedShipments[shipmentId].shipmentItems.items.length}</span>
                    </p>
                    <p className='tw:m-0 tw:p-0 tw:text-[11.2px]'>
                      Units:{' '}
                      <span className='tw:font-bold'>
                        {inboundPlan.confirmedShipments[shipmentId].shipmentBoxes.boxes.reduce((total, item) => {
                          const totalitems = item.items.reduce((total, item) => total + item.quantity, 0) * item.quantity
                          return total + totalitems
                        }, 0)}
                      </span>
                    </p>
                    <p className='tw:m-0 tw:p-0 tw:text-[11.2px]'>
                      Weight:{' '}
                      <span className='tw:font-bold'>
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
                  <div className='tw:flex tw:flex-row tw:flex-nowrap tw:justify-end tw:items-center tw:gap-2'>
                    {inboundPlan.confirmedShipments[shipmentId].shipmentItems.items.map(
                      (item, itemIndex) =>
                        itemIndex <= 2 && (
                          <div
                            key={`${shipmentId}-${itemIndex}`}
                            className='tw:my-2'
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
                    <p className='tw:m-0 tw:mt-4 tw:p-0 tw:text-[11.2px] tw:text-right'>
                      <span className='tw:font-semibold'>
                        {inboundPlan.transportationOptions[placementOptionSelected.placementOptionId][shipmentId][0].quote?.cost.amount! > 0 ? (
                          `Estimated Carrier Charges: ${FormatCurrency(state.currentRegion, inboundPlan.transportationOptions[placementOptionSelected.placementOptionId][shipmentId][0].quote?.cost.amount!)}`
                        ) : (
                          <span className='tw:text-danger tw:font-semibold'>Not Available</span>
                        )}
                      </span>
                    </p>
                  ) : null}

                  {/* SAME SHIPPING MODE && LTL */}
                  {finalShippingCharges.sameShippingMode && finalShippingCharges.shippingMode === 'LTL' ? (
                    <>
                      <div className='tw:my-4'>
                        <p className='tw:m-0 tw:p-0 tw:font-semibold tw:text-[11.2px]'>Pallet estimates:</p>
                        <div className='tw:overflow-x-auto'>
                          <table className='tw:w-full tw:align-middle tw:mb-0 tw:[&_th]:px-2 tw:[&_th]:py-1 tw:[&_td]:px-2 tw:[&_td]:py-1'>
                            <tbody className='tw:text-[11.2px]'>
                              <tr>
                                <td>
                                  Pallets:{' '}
                                  <span className='tw:font-semibold'>
                                    {FormatIntNumber(state.currentRegion, inboundPlan.confirmedShipments[shipmentId].shipmentPallets?.pallets!.length ?? 1)}
                                  </span>
                                </td>
                                <td>
                                  Total Weight:{' '}
                                  <span className='tw:font-semibold'>
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
                                  <span className='tw:font-semibold'>
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
                        <p className='tw:m-0 tw:mt-4 tw:p-0 tw:text-[11.2px] tw:text-left'>
                          Carrier:{' '}
                          <span className='tw:font-semibold'>{inboundPlan.transportationOptions[placementOptionSelected.placementOptionId][shipmentId][0].carrier.alphaCode}</span>
                        </p>
                        <p className='tw:m-0 tw:p-0 tw:text-[11.2px] tw:text-left'>
                          Pick up:{' '}
                          <span className='tw:font-semibold'>
                            {moment(inboundPlan.transportationOptions[placementOptionSelected.placementOptionId][shipmentId][0].carrierAppointment?.startTime).format('LL')}
                          </span>
                        </p>
                        <p className='tw:m-0 tw:p-0 tw:text-[11.2px] tw:text-right'>
                          {inboundPlan.transportationOptions[placementOptionSelected.placementOptionId][shipmentId][0].quote?.cost.amount! > 0 ? (
                            <>
                              Estimated Carrier Charges:{' '}
                              <span className='tw:font-semibold'>
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
                    <div className='tw:my-4'>
                      <p className='tw:m-0 tw:p-0 tw:font-semibold tw:text-[11.2px]'>Shipping Mode:</p>
                      <div className='tw:my-2 tw:flex tw:flex-col tw:justify-start tw:items-start tw:gap-2'>
                        {/* SHIPPING MODE SPD */}
                        <div className='tw:flex tw:flex-row tw:justify-start tw:items-center tw:gap-4'>
                          <Input
                            className='tw:my-0'
                            type='radio'
                            id={`shippingModeSPD-${shipmentId}`}
                            name={`shippingModeSPD-${shipmentId}`}
                            disabled={true}
                            checked={inboundPlan.transportationOptions[placementOptionSelected.placementOptionId][shipmentId][0].shippingMode.includes('PARCEL')}
                          />
                          <div
                            className='tw:m-0'
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
                            <p className='tw:m-0 tw:p-0 tw:text-[11.2px] tw:font-semibold'>Small Parcel Delivery (SPD)</p>
                            <p className='tw:m-0 tw:p-0 tw:text-[11.2px]'>
                              {inboundPlan.transportationOptions[placementOptionSelected.placementOptionId][shipmentId][0].shippingMode.includes('PARCEL') ? (
                                `Starting at ${FormatCurrency(state.currentRegion, inboundPlan.transportationOptions[placementOptionSelected.placementOptionId][shipmentId][0].quote?.cost.amount!)}`
                              ) : (
                                <span className='tw:m-0 tw:p-0 tw:text-danger'>Not Available</span>
                              )}
                            </p>
                          </div>
                        </div>

                        {/* SHIPPING MODE LTL */}
                        <div className='tw:flex tw:flex-col tw:justify-start tw:items-center tw:gap-2'>
                          <div className='tw:flex tw:flex-row tw:justify-start tw:items-center tw:gap-4'>
                            <Input
                              className='tw:my-0'
                              type='radio'
                              disabled={true}
                              id={`shippingModeLTL-${shipmentId}`}
                              name={`shippingModeLTL-${shipmentId}`}
                              checked={inboundPlan.transportationOptions[placementOptionSelected.placementOptionId][shipmentId][0].shippingMode.includes('LTL')}
                            />
                            <div
                              className='tw:m-0'
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
                              <p className='tw:m-0 tw:p-0 tw:text-[11.2px] tw:font-semibold'>Less than and Full TruckLoad (LTL/FTL)</p>
                              <p className='tw:m-0 tw:p-0 tw:text-[11.2px]'>
                                {inboundPlan.transportationOptions[placementOptionSelected.placementOptionId][shipmentId][0].shippingMode.includes('LTL') ? (
                                  <>
                                    Estimates Starting at{' '}
                                    {FormatCurrency(
                                      state.currentRegion,
                                      inboundPlan.transportationOptions[placementOptionSelected.placementOptionId][shipmentId][0].quote?.cost.amount ?? 0
                                    )}
                                  </>
                                ) : (
                                  <span className='tw:m-0 tw:p-0 tw:text-danger'>Not Available</span>
                                )}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {inboundPlan.transportationOptions[placementOptionSelected.placementOptionId][shipmentId][0].shippingMode.includes('PARCEL') ? (
                        <>
                          <p className='tw:m-0 tw:p-0 tw:font-semibold tw:text-[11.2px]'>Carrier:</p>
                          <div className='tw:my-2 tw:flex tw:flex-col tw:justify-start tw:items-start tw:gap-2'>
                            {/* CARRIER AMAZON PARTNERED */}
                            <div className='tw:flex tw:flex-row tw:justify-start tw:items-center tw:gap-4'>
                              <Input
                                className='tw:my-0'
                                type='radio'
                                id={`shippingCarrierAmazon-${shipmentId}`}
                                name={`shippingCarrierAmazon-${shipmentId}`}
                                checked={finalShippingCharges.sameShippingCarrier === 'amazon'}
                              />
                              <div className={'' + (finalShippingCharges.sameShippingCarrier !== 'amazon' && 'tw:text-[var(--bs-secondary-color)]')}>
                                <p className='tw:m-0 tw:p-0 tw:text-[11.2px]'>{`${inboundPlan.transportationOptions[placementOptionSelected.placementOptionId][shipmentId][0].carrier.alphaCode} (${CleanStatus(
                                  inboundPlan.transportationOptions[placementOptionSelected.placementOptionId][shipmentId][0].shippingSolution
                                )})`}</p>
                                <p className='tw:m-0 tw:p-0 tw:text-[11.2px] tw:font-bold'>
                                  {inboundPlan.transportationOptions[placementOptionSelected.placementOptionId][shipmentId][0].shippingMode.includes('PARCEL') ? (
                                    FormatCurrency(
                                      state.currentRegion,
                                      inboundPlan.transportationOptions[placementOptionSelected.placementOptionId][shipmentId][0].quote?.cost.amount!
                                    )
                                  ) : (
                                    <span className='tw:text-danger tw:font-semibold'>Not Available</span>
                                  )}
                                </p>
                              </div>
                            </div>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className='tw:my-4'>
                            <p className='tw:m-0 tw:p-0 tw:font-semibold tw:text-[11.2px]'>Pallet estimates:</p>
                            <div className='tw:overflow-x-auto'>
                              <table className='tw:w-full tw:align-middle tw:mb-0 tw:[&_th]:px-2 tw:[&_th]:py-1 tw:[&_td]:px-2 tw:[&_td]:py-1'>
                                <tbody className='tw:text-[11.2px]'>
                                  <tr>
                                    <td>
                                      Pallets:{' '}
                                      <span className='tw:font-semibold'>
                                        {FormatIntNumber(state.currentRegion, inboundPlan.confirmedShipments[shipmentId].shipmentPallets?.pallets!.length ?? 1)}
                                      </span>
                                    </td>
                                    <td>
                                      Total Weight:{' '}
                                      <span className='tw:font-semibold'>
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
                                      <span className='tw:font-semibold'>
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
                            <p className='tw:m-0 tw:mt-4 tw:p-0 tw:text-[11.2px] tw:text-left'>
                              Carrier:{' '}
                              <span className='tw:font-semibold'>
                                {inboundPlan.transportationOptions[placementOptionSelected.placementOptionId][shipmentId][0].carrier.alphaCode ||
                                  inboundPlan.transportationOptions[placementOptionSelected.placementOptionId][shipmentId][0].carrier.name}
                              </span>
                            </p>
                            <p className='tw:m-0 tw:p-0 tw:text-[11.2px] tw:text-left'>
                              Pick up:{' '}
                              <span className='tw:font-semibold'>
                                {moment(
                                  inboundPlan.transportationOptions[placementOptionSelected.placementOptionId][shipmentId][0].carrierAppointment?.startTime ||
                                    inboundPlan.confirmedShipments[shipmentId]?.shipment.dates.readyToShipWindow.start
                                ).format('LL')}
                              </span>
                            </p>
                            <p className='tw:m-0 tw:p-0 tw:text-[11.2px] tw:text-right'>
                              {inboundPlan.transportationOptions[placementOptionSelected.placementOptionId][shipmentId][0].quote?.cost.amount! > 0 ? (
                                <>
                                  Estimated Carrier Charges:{' '}
                                  <span className='tw:font-semibold'>
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
                    <div className='tw:mt-4'>
                      <p className='tw:m-0 tw:my-4 tw:p-0 tw:text-[var(--bs-secondary-color)] tw:text-[11.2px]'>
                        * The Amazon Partnered Carrier program offers discounted shipping rates, the convenience of buying and printing shipping labels when you create shipments,
                        and automated tracking.
                      </p>
                    </div>
                  )}
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      </div>
      {/* TOTAL ESTIMATED FEES */}
      <Row className='tw:my-4'>
        <Col xs='12' lg='8'></Col>
        <Col xs='12' lg='4'>
          <table className='tw:w-full tw:align-middle tw:mb-0 tw:text-[11.2px] tw:[&_th]:px-2 tw:[&_th]:py-1 tw:[&_td]:px-2 tw:[&_td]:py-1'>
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
              <tr className='tw:font-bold'>
                <td>Total estimated prep, labeling, placement, and shipping fees (other fees may apply):</td>
                <td>{FormatCurrency(state.currentRegion, inboundPlan.totalFees)}</td>
              </tr>
            </tbody>
          </table>
          {inboundPlan.fulfillmentType === 'Master Boxes' && (
            <div className='tw:flex tw:justify-end tw:items-center'>
              <Button disabled={true} color='success' id='btn_handleNextShipping'>
                Charges Already Confirmed
              </Button>
            </div>
          )}
        </Col>
      </Row>
    </div>
  )
}

export default ShippingCompleted
