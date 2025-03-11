/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @next/next/no-img-element */
import AppContext from '@context/AppContext'
import { FormatCurrency, FormatIntNumber, FormatIntPercentage } from '@lib/FormatNumbers'
import { InboundPlan, PlacementOption } from '@typesTs/amazon/fulfillments/fulfillment'
import moment from 'moment'
import React, { useContext, useState } from 'react'
import { Button, Card, CardBody, CardHeader, Col, Input, Label, Row } from 'reactstrap'
import Image from 'next/image'
import boxIcon from '@assets/fulfillments/outbound_box.png'
import palletIcon from '@assets/fulfillments/outbound_pallet.png'
import useEffectAfterMount from '@hooks/useEffectAfterMount'
import { validateIfPlacementOptionHasSPD } from './shippingLTL/helperFunctions'
import { NoImageAdress } from '@lib/assetsConstants'
import { CleanStatus } from '@lib/SkuFormatting'

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
    <div className='w-100 px-3'>
      {/* PLACEMENT OPTIONS */}
      <div>
        <p className='fs-5 fw-bold'>Selected inbound placement</p>
        <p className='my-1 p-0 fs-7'>Your shipping carrier costs are additional and are not included in the inbound placement service fee.</p>
        <div className='d-flex flex-row flex-wrap justify-content-start align-items-start gap-3 py-3'>
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
                    'mw-100 px-2 py-0 my-0 shadow-sm ' + ((placementOptionSelected.placementOptionId === placementOption.placementOptionId || inboundPlan.placementOptionId === placementOption.placementOptionId) && 'border border-3 border-success')
                  }>
                  <CardBody>
                    <p className='mt-2 mb-1 p-0 fw-semibold fs-4'>
                      <span>{placementOption.shipmentIds.length}</span> {placementOption.shipmentIds.length > 1 ? 'Shipments' : 'Shipment'}
                      {placementOptionSelected.placementOptionId === placementOption.placementOptionId && <i className={'ri-checkbox-circle-fill align-middle ms-2 fs-4 text-success'} />}
                    </p>
                    <p className='m-0 p-0 fs-7'>
                      Status: <span className='fw-bold text-info'>{placementOption.status}</span>
                    </p>
                    <p className='m-0 p-0 fs-7'>
                      Expires: <span className='text-danger'>{moment.utc(placementOption.expiration).local().format('LL h:mm a')}</span>
                    </p>

                    {placementOption.fees.map((fee, feeIndex) => (
                      <p key={feeIndex} className='my-2 p-0 fs-7'>
                        {fee.target} <span className='fw-semibold'>{FormatCurrency(state.currentRegion, fee.value.amount)}</span> {fee.value.code}
                      </p>
                    ))}

                    {placementOption.discounts.map((discount, discountIndex) => (
                      <p key={discountIndex} className='my-2 p-0 fs-7'>
                        {discount.target} <span className='fw-semibold'>{FormatCurrency(state.currentRegion, discount.value.amount)}</span> {discount.value.code}
                      </p>
                    ))}
                    <p className='m-0 fs-7 text-muted fw-light'>ID: {placementOption.placementOptionId}</p>
                  </CardBody>
                </Card>
              )
          )}
        </div>
      </div>

      {/* SAME SHIPPING MODE */}
      <div>
        <p className='fs-5 fw-bold'>Shipping mode</p>
        <div className='form-check form-switch form-switch-sm d-flex justify-content-start align-items-center gap-2 p-0 my-3'>
          <Input className='form-check-input ms-0' type='checkbox' role='switch' id='showShippingMode' name='showShippingMode' disabled={true} checked={finalShippingCharges.sameShippingMode} />
          <Label className='check-form-label m-0 fw-normal' for='showShippingMode'>
            Shipping mode will be same for all shipments
          </Label>
        </div>
        {finalShippingCharges.sameShippingMode ? (
          <div className='d-flex justify-content-start align-items-start gap-3'>
            <Card className={'shadow-sm ' + (finalShippingCharges.shippingMode === 'SPD' && 'border border-3 border-success')}>
              <CardBody className='d-flex justify-content-start align-items-center gap-1'>
                <div
                  className='my-2'
                  style={{
                    width: '80px',
                    height: '50px',
                    margin: '2px 0px',
                    position: 'relative',
                  }}>
                  <Image src={boxIcon} alt='box_icon' className='object-contain' />
                </div>
                <div>
                  <p className='m-0 p-0 fs-7 fw-semibold'>Small Parcel Delivery (SPD)</p>
                  <p className='m-0 p-0 fs-7'>{inboundPlan.totalSpdFees > 0 ? `Starting at ${FormatCurrency(state.currentRegion, inboundPlan.totalSpdFees)}` : <span className='text-danger fw-semibold'>Not Available</span>}</p>
                </div>
              </CardBody>
            </Card>
            <Card className={'shadow-sm ' + (finalShippingCharges.shippingMode === 'LTL' && 'border border-3 border-success')}>
              <CardBody className='d-flex justify-content-start align-items-center gap-1'>
                <div
                  className='my-2'
                  style={{
                    width: '80px',
                    height: '50px',
                    margin: '2px 0px',
                    position: 'relative',
                  }}>
                  <Image src={palletIcon} alt='box_icon' className='object-contain' />
                </div>
                <div>
                  <p className='m-0 p-0 fs-7 fw-semibold'>Less than and Full TruckLoad (LTL/FTL)</p>
                  <p className='m-0 p-0 fs-7'>
                    {inboundPlan.totalLtlFees > 0 ? <>Estimates Starting at {FormatCurrency(state.currentRegion, inboundPlan.totalLtlFees)}</> : <span className='m-0 p-0 text-danger'>One or more shipments do not have LTL/FTL options.</span>}
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
          <p className='fs-5 fw-bold'>Select Shipping Carrier</p>
          <Row className='my-3 d-flex gap-3'>
            <Col xs='12' lg='3'>
              <Card className={'m-0 shadow-sm ' + (finalShippingCharges.sameShippingCarrier === 'amazon' && 'border border-3 border-success')}>
                <CardBody>
                  <p className='m-0 p-0 fs-7 fw-semibold'>UPS (Amazon Partnered Carrier)*</p>
                  <p className='m-0 p-0 fs-7'>Pickup cost is NOT Included with the rate</p>
                  <p className='m-0 p-0 fs-5 fw-bold'>
                    {(Object.values(inboundPlan.transportationOptions[placementOptionSelected.placementOptionId]).reduce((total, shipment) => {
                      const subtotal = shipment.filter((option) => option.shippingSolution === 'AMAZON_PARTNERED_CARRIER' && option.shippingMode === 'GROUND_SMALL_PARCEL').sort((a, b) => a.quote?.cost.amount! - b.quote?.cost.amount!)[0]?.quote?.cost
                        .amount!
                      return total + subtotal
                    }, 0) || 0) > 0 ? (
                      FormatCurrency(
                        state.currentRegion,
                        inboundPlan.transportationOptions[placementOptionSelected.placementOptionId]
                          ? Object.values(inboundPlan.transportationOptions[placementOptionSelected.placementOptionId]).reduce((total, shipment) => {
                              const subtotal = shipment.filter((option) => option.shippingSolution === 'AMAZON_PARTNERED_CARRIER' && option.shippingMode === 'GROUND_SMALL_PARCEL').sort((a, b) => a.quote?.cost.amount! - b.quote?.cost.amount!)[0]
                                ?.quote?.cost.amount!
                              return total + subtotal
                            }, 0) || 0
                          : 0
                      )
                    ) : (
                      <span className='text-danger fw-semibold'>Not Available</span>
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
        <p className='fs-5 fw-bold'>Number of shipments: {placementOptionSelected.shipmentIds.length}</p>
        <div className='d-flex flex-row flex-wrap justify-content-start align-items-start gap-3'>
          {placementOptionSelected.shipmentIds.map((shipmentId, shipmentIndex) => (
            <Card key={shipmentId} className='m-0 shadow-sm' style={{ width: 'fit-content', maxWidth: '430px', zIndex: placementOptionSelected.shipmentIds.length - shipmentIndex }}>
              <CardHeader>
                <p className='m-0 p-0 fw-bold fs-6'>Shipment #{shipmentIndex + 1}</p>
                <p className='m-0 p-0 fs-7 text-muted fw-light'>ID: {shipmentId}</p>
              </CardHeader>
              <CardBody>
                <p className='m-0 fs-7'>
                  <span className='text-primary'>Ship From: </span>
                  {inboundPlan.confirmedShipments[shipmentId]?.shipment.source.address.name}, {inboundPlan.confirmedShipments[shipmentId]?.shipment.source.address.addressLine1},{' '}
                  {inboundPlan.confirmedShipments[shipmentId]?.shipment.source.address.city}, {inboundPlan.confirmedShipments[shipmentId]?.shipment.source.address.stateOrProvinceCode},{' '}
                  {inboundPlan.confirmedShipments[shipmentId]?.shipment.source.address.postalCode}, {inboundPlan.confirmedShipments[shipmentId]?.shipment.source.address.countryCode}
                </p>
                <p className='m-0 fs-7'>
                  <span className='text-primary'>Ship to: </span>
                  {inboundPlan.confirmedShipments[shipmentId]?.shipment.destination.warehouseId} - {inboundPlan.confirmedShipments[shipmentId]?.shipment.destination.address.addressLine1},{' '}
                  {inboundPlan.confirmedShipments[shipmentId]?.shipment.destination.address.city}, {inboundPlan.confirmedShipments[shipmentId]?.shipment.destination.address.stateOrProvinceCode},{' '}
                  {inboundPlan.confirmedShipments[shipmentId]?.shipment.destination.address.countryCode}
                </p>
                <p className='my-2 p-0 fw-semibold fs-7'>Shipment Contents</p>
                <div className='d-flex flex-row flex-nowrap justify-content-between align-items-start'>
                  <div>
                    <p className='m-0 p-0 fs-7'>
                      Boxes: <span className='fw-bold'>{inboundPlan.confirmedShipments[shipmentId].shipmentBoxes.boxes.reduce((total, item) => total + item.quantity, 0)}</span>
                    </p>
                    <p className='m-0 p-0 fs-7'>
                      SKUs: <span className='fw-bold'>{inboundPlan.confirmedShipments[shipmentId].shipmentItems.items.length}</span>
                    </p>
                    <p className='m-0 p-0 fs-7'>
                      Units:{' '}
                      <span className='fw-bold'>
                        {inboundPlan.confirmedShipments[shipmentId].shipmentBoxes.boxes.reduce((total, item) => {
                          const totalitems = item.items.reduce((total, item) => total + item.quantity, 0) * item.quantity
                          return total + totalitems
                        }, 0)}
                      </span>
                    </p>
                    <p className='m-0 p-0 fs-7'>
                      Weight:{' '}
                      <span className='fw-bold'>
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
                  <div className='d-flex flex-row flex-nowrap justify-content-end align-items-center gap-2'>
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
                              src={inboundPlan.skus_details[item.msku].image ? inboundPlan.skus_details[item.msku].image : NoImageAdress}
                              alt='product Image'
                              style={{ objectFit: 'contain', objectPosition: 'center', width: '100%', height: '100%' }}
                            />
                          </div>
                        )
                    )}
                    {inboundPlan.confirmedShipments[shipmentId].shipmentItems.items.length > 3 && <p>+{inboundPlan.confirmedShipments[shipmentId].shipmentItems.items.length - 3}</p>}
                  </div>
                </div>
                <div>
                  {/* SAME SHIPPING MODE && AMAZON */}
                  {finalShippingCharges.sameShippingMode && finalShippingCharges.shippingMode === 'SPD' && finalShippingCharges.sameShippingCarrier === 'amazon' ? (
                    <p className='m-0 mt-3 p-0 fs-7 text-end'>
                      <span className='fw-semibold'>
                        {inboundPlan.transportationOptions[placementOptionSelected.placementOptionId][shipmentId][0].quote?.cost.amount! > 0 ? (
                          `Estimated Carrier Charges: ${FormatCurrency(state.currentRegion, inboundPlan.transportationOptions[placementOptionSelected.placementOptionId][shipmentId][0].quote?.cost.amount!)}`
                        ) : (
                          <span className='text-danger fw-semibold'>Not Available</span>
                        )}
                      </span>
                    </p>
                  ) : null}

                  {/* SAME SHIPPING MODE && LTL */}
                  {finalShippingCharges.sameShippingMode && finalShippingCharges.shippingMode === 'LTL' ? (
                    <>
                      <div className='my-3'>
                        <p className='m-0 p-0 fw-semibold fs-7'>Pallet estimates:</p>
                        <table className='table table-sm table-borderless table-responsive'>
                          <tbody className='fs-7'>
                            <tr>
                              <td>
                                Pallets: <span className='fw-semibold'>{FormatIntNumber(state.currentRegion, inboundPlan.confirmedShipments[shipmentId].shipmentPallets?.pallets!.length ?? 1)}</span>
                              </td>
                              <td>
                                Total Weight:{' '}
                                <span className='fw-semibold'>
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
                                <span className='fw-semibold'>
                                  {FormatIntPercentage(
                                    state.currentRegion,
                                    inboundPlan.confirmedShipments[shipmentId].shipmentPallets?.pallets!.reduce((total, box) => total + box.dimensions.width * box.dimensions.height * box.dimensions.length * box.quantity, 0)
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
                        <p className='m-0 mt-3 p-0 fs-7 text-start'>
                          Carrier: <span className='fw-semibold'>{inboundPlan.transportationOptions[placementOptionSelected.placementOptionId][shipmentId][0].carrier.alphaCode}</span>
                        </p>
                        <p className='m-0 p-0 fs-7 text-start'>
                          Pick up: <span className='fw-semibold'>{moment(inboundPlan.transportationOptions[placementOptionSelected.placementOptionId][shipmentId][0].carrierAppointment?.startTime).format('LL')}</span>
                        </p>
                        <p className='m-0 p-0 fs-7 text-end'>
                          {inboundPlan.transportationOptions[placementOptionSelected.placementOptionId][shipmentId][0].quote?.cost.amount! > 0 ? (
                            <>
                              Estimated Carrier Charges: <span className='fw-semibold'>{FormatCurrency(state.currentRegion, inboundPlan.transportationOptions[placementOptionSelected.placementOptionId][shipmentId][0].quote?.cost.amount!)}</span>
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
                    <div className='my-3'>
                      <p className='m-0 p-0 fw-semibold fs-7'>Shipping Mode:</p>
                      <div className='my-2 d-flex flex-column justify-content-start align-items-start gap-2'>
                        {/* SHIPPING MODE SPD */}
                        <div className='d-flex flex-row justify-content-start align-items-center gap-3'>
                          <Input
                            className='my-0'
                            type='radio'
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
                            <Image src={boxIcon} alt='box_icon' className='object-contain' />
                          </div>
                          <div>
                            <p className='m-0 p-0 fs-7 fw-semibold'>Small Parcel Delivery (SPD)</p>
                            <p className='m-0 p-0 fs-7'>
                              {inboundPlan.transportationOptions[placementOptionSelected.placementOptionId][shipmentId][0].shippingMode.includes('PARCEL') ? (
                                `Starting at ${FormatCurrency(state.currentRegion, inboundPlan.transportationOptions[placementOptionSelected.placementOptionId][shipmentId][0].quote?.cost.amount!)}`
                              ) : (
                                <span className='m-0 p-0 text-danger'>Not Available</span>
                              )}
                            </p>
                          </div>
                        </div>

                        {/* SHIPPING MODE LTL */}
                        <div className='d-flex flex-column justify-content-start align-items-center gap-2'>
                          <div className='d-flex flex-row justify-content-start align-items-center gap-3'>
                            <Input
                              className='my-0'
                              type='radio'
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
                              <Image src={palletIcon} alt='box_icon' className='object-contain' />
                            </div>
                            <div>
                              <p className='m-0 p-0 fs-7 fw-semibold'>Less than and Full TruckLoad (LTL/FTL)</p>
                              <p className='m-0 p-0 fs-7'>
                                {inboundPlan.transportationOptions[placementOptionSelected.placementOptionId][shipmentId][0].shippingMode.includes('LTL') ? (
                                  <>Estimates Starting at {FormatCurrency(state.currentRegion, inboundPlan.transportationOptions[placementOptionSelected.placementOptionId][shipmentId][0].quote?.cost.amount ?? 0)}</>
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
                          <p className='m-0 p-0 fw-semibold fs-7'>Carrier:</p>
                          <div className='my-2 d-flex flex-column justify-content-start align-items-start gap-2'>
                            {/* CARRIER AMAZON PARTNERED */}
                            <div className='d-flex flex-row justify-content-start align-items-center gap-3'>
                              <Input className='my-0' type='radio' id={`shippingCarrierAmazon-${shipmentId}`} name={`shippingCarrierAmazon-${shipmentId}`} checked={finalShippingCharges.sameShippingCarrier === 'amazon'} />
                              <div className={'' + (finalShippingCharges.sameShippingCarrier !== 'amazon' && 'text-muted')}>
                                <p className='m-0 p-0 fs-7'>{`${inboundPlan.transportationOptions[placementOptionSelected.placementOptionId][shipmentId][0].carrier.alphaCode} (${CleanStatus(
                                  inboundPlan.transportationOptions[placementOptionSelected.placementOptionId][shipmentId][0].shippingSolution
                                )})`}</p>
                                <p className='m-0 p-0 fs-7 fw-bold'>
                                  {inboundPlan.transportationOptions[placementOptionSelected.placementOptionId][shipmentId][0].shippingMode.includes('PARCEL') ? (
                                    FormatCurrency(state.currentRegion, inboundPlan.transportationOptions[placementOptionSelected.placementOptionId][shipmentId][0].quote?.cost.amount!)
                                  ) : (
                                    <span className='text-danger fw-semibold'>Not Available</span>
                                  )}
                                </p>
                              </div>
                            </div>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className='my-3'>
                            <p className='m-0 p-0 fw-semibold fs-7'>Pallet estimates:</p>
                            <table className='table table-sm table-borderless table-responsive'>
                              <tbody className='fs-7'>
                                <tr>
                                  <td>
                                    Pallets: <span className='fw-semibold'>{FormatIntNumber(state.currentRegion, inboundPlan.confirmedShipments[shipmentId].shipmentPallets?.pallets!.length ?? 1)}</span>
                                  </td>
                                  <td>
                                    Total Weight:{' '}
                                    <span className='fw-semibold'>
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
                                    <span className='fw-semibold'>
                                      {FormatIntPercentage(
                                        state.currentRegion,
                                        inboundPlan.confirmedShipments[shipmentId].shipmentPallets?.pallets!.reduce((total, box) => total + box.dimensions.width * box.dimensions.height * box.dimensions.length * box.quantity, 0)
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
                            <p className='m-0 mt-3 p-0 fs-7 text-start'>
                              Carrier:{' '}
                              <span className='fw-semibold'>
                                {inboundPlan.transportationOptions[placementOptionSelected.placementOptionId][shipmentId][0].carrier.alphaCode ||
                                  inboundPlan.transportationOptions[placementOptionSelected.placementOptionId][shipmentId][0].carrier.name}
                              </span>
                            </p>
                            <p className='m-0 p-0 fs-7 text-start'>
                              Pick up:{' '}
                              <span className='fw-semibold'>
                                {moment(
                                  inboundPlan.transportationOptions[placementOptionSelected.placementOptionId][shipmentId][0].carrierAppointment?.startTime || inboundPlan.confirmedShipments[shipmentId]?.shipment.dates.readyToShipWindow.start
                                ).format('LL')}
                              </span>
                            </p>
                            <p className='m-0 p-0 fs-7 text-end'>
                              {inboundPlan.transportationOptions[placementOptionSelected.placementOptionId][shipmentId][0].quote?.cost.amount! > 0 ? (
                                <>
                                  Estimated Carrier Charges: <span className='fw-semibold'>{FormatCurrency(state.currentRegion, inboundPlan.transportationOptions[placementOptionSelected.placementOptionId][shipmentId][0].quote?.cost.amount!)}</span>
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
                    <div className='mt-3'>
                      <p className='m-0 my-3 p-0 text-muted fs-7'>* The Amazon Partnered Carrier program offers discounted shipping rates, the convenience of buying and printing shipping labels when you create shipments, and automated tracking.</p>
                    </div>
                  )}
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      </div>

      {/* TOTAL ESTIMATED FEES */}
      <Row className='my-3'>
        <Col xs='12' lg='8'></Col>
        <Col xs='12' lg='4'>
          <table className='table table-sm fs-7'>
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
              <tr className='fw-bold'>
                <td>Total estimated prep, labeling, placement, and shipping fees (other fees may apply):</td>
                <td>{FormatCurrency(state.currentRegion, inboundPlan.totalFees)}</td>
              </tr>
            </tbody>
          </table>
          {inboundPlan.fulfillmentType === 'Master Boxes' && (
            <div className='d-flex justify-content-end align-items-center'>
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
