/* eslint-disable @next/next/no-img-element */
import Image from 'next/image'
import { useContext, useMemo, useState } from 'react'

import boxIcon from '@assets/fulfillments/outbound_box.png'
import palletIcon from '@assets/fulfillments/outbound_pallet.png'
import AppContext from '@context/AppContext'
import useEffectAfterMount from '@hooks/useEffectAfterMount'
import { FormatCurrency, FormatIntNumber, FormatIntPercentage } from '@lib/FormatNumbers'
import { NoImageAdress } from '@lib/assetsConstants'
import { DeliveryWindowsOptions, DeliveryWindowsResponse, InboundPlan, PlacementOption, WaitingReponses } from '@typesTs/amazon/fulfillments/fulfillment'
import axios from 'axios'
import moment from 'moment'
// import SelectShippingCarrier from './SelectShippingCarrier'
import { toast } from 'react-toastify'

import { Alert, Button, Card, CardBody, CardHeader, Col, Input, Label, Row, Spinner, Switch } from '@/components/migration-ui'

import ShippingSelectDate from './ShippingSelectDate'
import { regenerateFBAPlacementOptions } from './helperFunctions/fbaRegenerate'
import SelectLTLFreightReadyDate from './shippingLTL/SelectLTLFreightReadyDate'
import { commonPlacementOptionCarriers, setInitialLTLTransportationOptions, validateIfPlacementOptionHasSPD } from './shippingLTL/helperFunctions'

type Props = {
  sessionToken: string
  inboundPlan: InboundPlan
  handlePlacementExpired: (inboundPlanId: string) => void
  handleNextStep: (confirmChargesInfo: any) => void
  watingRepsonse: WaitingReponses
}

type FinalShipment = {
  shipmentId: string
  shippingMode: string
  // shippingCarrier: string
  // nonAmazonCarrier: string
  deliveryWindow: string
  // shippingFeeSelected: number
  // transportationOptionId: string
  loadingDeliveryWindowOptions: boolean
}

const Shipping = ({ sessionToken, inboundPlan, handleNextStep, watingRepsonse }: Props) => {
  const { state }: any = useContext(AppContext)
  const [placementOptionSelected, setplacementOptionSelected] = useState<PlacementOption>(
    !inboundPlan.placementOptionId
      ? inboundPlan.placementOptions[0]
      : inboundPlan.placementOptions.find((placementOption) => inboundPlan.placementOptionId === placementOption.placementOptionId)!
  )
  const [deliveryWindowOptions, setdeliveryWindowOptions] = useState<DeliveryWindowsOptions>({})
  const [finalShippingCharges, setfinalShippingCharges] = useState({
    inboundPlanId: inboundPlan.inboundPlanId,
    sameShipDate: true,
    shipDate: '',
    sameShippingMode: !inboundPlan.placementOptionId ? true : inboundPlan.sameShippingMode,
    shippingMode: !inboundPlan.placementOptionId
      ? validateIfPlacementOptionHasSPD(inboundPlan.transportationOptions[inboundPlan.placementOptions[0].placementOptionId])
        ? 'SPD'
        : 'LTL'
      : inboundPlan.shippingMode,
    sameShippingCarrier: !inboundPlan.placementOptionId ? 'amazon' : inboundPlan.sameShippingCarrier,
    nonAmazonCarrier: '',
    nonAmazonAlphaCode: '',
    placementOptionIdSelected: !inboundPlan.placementOptionId ? inboundPlan.placementOptions[0].placementOptionId : inboundPlan.placementOptionId,
    shipments: !inboundPlan.placementOptionId
      ? inboundPlan.placementOptions[0].shipmentIds.reduce((acc: { [shipmentId: string]: FinalShipment }, shipmentId) => {
          acc[shipmentId] = {
            shipmentId: shipmentId,
            shippingMode: validateIfPlacementOptionHasSPD(inboundPlan.transportationOptions[inboundPlan.placementOptions[0].placementOptionId]) ? 'SPD' : 'LTL',
            deliveryWindow: '',
            loadingDeliveryWindowOptions: false,
          }
          return acc
        }, {})
      : (inboundPlan.placementOptions
          .find((placementOption) => inboundPlan.placementOptionId === placementOption.placementOptionId)
          ?.shipmentIds.reduce((acc: { [shipmentId: string]: FinalShipment }, shipmentId) => {
            acc[shipmentId] = {
              shipmentId: shipmentId,
              shippingMode: validateIfPlacementOptionHasSPD(inboundPlan.transportationOptions[inboundPlan.placementOptionId]) ? 'SPD' : 'LTL',
              deliveryWindow: '',
              loadingDeliveryWindowOptions: false,
            }
            return acc
          }, {}) as { [shipmentId: string]: FinalShipment }),
    ltlTransportationOptions: setInitialLTLTransportationOptions(
      !inboundPlan.placementOptionId
        ? inboundPlan.transportationOptions[inboundPlan.placementOptions[0].placementOptionId]
        : inboundPlan.transportationOptions[inboundPlan.placementOptionId]
    ),
  })

  const placementOptionsExpired = useMemo(() => {
    return inboundPlan.placementOptions.some((placementOption) => {
      return moment.utc(placementOption.expiration).local().isBefore(moment())
    })
  }, [inboundPlan.placementOptions])

  useEffectAfterMount(() => {
    if (!inboundPlan.transportationOptions || Object.values(inboundPlan.transportationOptions).length === 0) return

    if (inboundPlan.placementOptionId) {
      const chosenPlacementOption = inboundPlan.placementOptions.find((placementOption) => inboundPlan.placementOptionId === placementOption.placementOptionId)
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
            ltlTransportationOptions: setInitialLTLTransportationOptions(inboundPlan.transportationOptions[chosenPlacementOption.placementOptionId]),
          }
        })
      }
    } else {
      const placementOption = inboundPlan.placementOptions.find(
        (placementOption) =>
          Object.values(inboundPlan.transportationOptions[placementOption.placementOptionId]).reduce((total, shipment) => {
            const subtotal = shipment
              .filter((option) => option.shippingSolution === 'AMAZON_PARTNERED_CARRIER' && option.shippingMode === 'GROUND_SMALL_PARCEL')
              .sort((a, b) => a.quote?.cost.amount! - b.quote?.cost.amount!)[0]?.quote?.cost.amount!
            return total + subtotal
          }, 0) > 0
      )

      if (placementOption) {
        setplacementOptionSelected(placementOption)
        setfinalShippingCharges((prev) => {
          return {
            ...prev,
            sameShippingMode: true,
            shippingMode: validateIfPlacementOptionHasSPD(inboundPlan.transportationOptions[placementOption.placementOptionId]) ? 'SPD' : 'LTL',
            sameShippingCarrier: 'amazon',
            nonAmazonCarrier: '',
            nonAmazonAlphaCode: '',
            placementOptionIdSelected: placementOption.placementOptionId,
            shipments: placementOption.shipmentIds.reduce((acc: { [shipmentId: string]: FinalShipment }, shipmentId) => {
              acc[shipmentId] = {
                shipmentId: shipmentId,
                shippingMode: validateIfPlacementOptionHasSPD(inboundPlan.transportationOptions[placementOption.placementOptionId]) ? 'SPD' : 'LTL',
                deliveryWindow: '',
                loadingDeliveryWindowOptions: false,
              }
              return acc
            }, {}),
            ltlTransportationOptions: setInitialLTLTransportationOptions(inboundPlan.transportationOptions[placementOption.placementOptionId]),
          }
        })
      }
    }
  }, [inboundPlan.placementOptions, inboundPlan.transportationOptions])

  const handleGetDeliveryWindowOptions = async (placementOptionId: string, shipmentId: string) => {
    if (deliveryWindowOptions[placementOptionId] && deliveryWindowOptions[placementOptionId][shipmentId]) return
    setfinalShippingCharges((prev) => {
      return {
        ...prev,
        shipments: {
          ...prev.shipments,
          [shipmentId]: {
            ...prev.shipments[shipmentId],
            loadingDeliveryWindowOptions: true,
          },
        },
      }
    })
    const generatingDeliveryWindowOptions = toast.loading('Generating Delivery Window Options...')
    await axios
      .get(
        `${process.env.NEXT_PUBLIC_SHELFCLOUD_SERVER_URL}/api/amz_workflow/generateDeliveryWindowOptions/${state.currentRegion}/${state.user.businessId}/${inboundPlan.inboundPlanId}/${placementOptionId}/${shipmentId}`,
        {
          headers: {
            Authorization: `Bearer ${sessionToken}`,
          },
        }
      )
      .then(({ data }: { data: DeliveryWindowsResponse }) => {
        setdeliveryWindowOptions((prev) => {
          return {
            ...prev,
            [data.deliveryWindows.placementOptionId]: {
              ...prev[data.deliveryWindows.placementOptionId],
              [data.deliveryWindows.shipmentId]: data.deliveryWindows.deliveryWindowOptions,
            },
          }
        })
        toast.update(generatingDeliveryWindowOptions, {
          render: 'Delivery Window Options Generated',
          type: 'success',
          isLoading: false,
          autoClose: 3000,
        })
      })
      .catch((error) => {
        console.error(error)
        toast.update(generatingDeliveryWindowOptions, {
          render: 'Error Generating Delivery Window Options',
          type: 'error',
          isLoading: false,
          autoClose: 3000,
        })
      })
    setfinalShippingCharges((prev) => {
      return {
        ...prev,
        shipments: {
          ...prev.shipments,
          [shipmentId]: {
            ...prev.shipments[shipmentId],
            loadingDeliveryWindowOptions: false,
          },
        },
      }
    })
  }

  const totalSPDFees = useMemo(() => {
    if (!inboundPlan.transportationOptions || !inboundPlan.transportationOptions[placementOptionSelected.placementOptionId]) return 0

    if (finalShippingCharges.sameShippingMode) {
      if (finalShippingCharges.shippingMode === 'SPD') {
        if (finalShippingCharges.sameShippingCarrier === 'amazon') {
          return Object.values(inboundPlan.transportationOptions[placementOptionSelected.placementOptionId]).reduce((total, shipment) => {
            const subtotal =
              shipment
                .filter((option) => option.shippingSolution === 'AMAZON_PARTNERED_CARRIER' && option.shippingMode === 'GROUND_SMALL_PARCEL')
                .sort((a, b) => a.quote?.cost.amount! - b.quote?.cost.amount!)[0]?.quote?.cost.amount! || 0
            return total + subtotal
          }, 0)
        }

        if (finalShippingCharges.sameShippingCarrier === 'non-amazon') {
          return 0
        }
      }
    }

    if (!finalShippingCharges.sameShippingMode) {
      return Object.values(finalShippingCharges.shipments).reduce((total, shipment) => {
        if (shipment.shippingMode === 'SPD') {
          if (finalShippingCharges.sameShippingCarrier === 'amazon') {
            return (
              total +
                Object.values(inboundPlan.transportationOptions[placementOptionSelected.placementOptionId][shipment.shipmentId])
                  .filter((option) => option.shippingSolution === 'AMAZON_PARTNERED_CARRIER' && option.shippingMode === 'GROUND_SMALL_PARCEL')
                  .sort((a, b) => a.quote?.cost.amount! - b.quote?.cost.amount!)[0]?.quote?.cost.amount! || 0
            )
          } else {
            return total
          }
        }
        return total
      }, 0)
    }

    return 0
  }, [placementOptionSelected, finalShippingCharges, inboundPlan.transportationOptions])

  const totalLTLFees = useMemo(() => {
    if (!inboundPlan.transportationOptions || !inboundPlan.transportationOptions[placementOptionSelected.placementOptionId]) return 0

    if (finalShippingCharges.sameShippingMode) {
      if (finalShippingCharges.shippingMode === 'LTL') {
        return Object.values(finalShippingCharges.shipments).reduce((total, shipment) => {
          return total + finalShippingCharges.ltlTransportationOptions[shipment.shipmentId].cost
        }, 0)
      }
    }

    if (!finalShippingCharges.sameShippingMode) {
      return Object.values(finalShippingCharges.shipments).reduce((total, shipment) => {
        if (shipment.shippingMode === 'LTL') {
          return total + finalShippingCharges.ltlTransportationOptions[shipment.shipmentId].cost
        } else {
          return total
        }
      }, 0)
    }

    return 0
  }, [placementOptionSelected, finalShippingCharges, inboundPlan.transportationOptions])

  const shippingHasErrors = useMemo(() => {
    if (Object.values(finalShippingCharges.shipments).length === 0) {
      return true
    }

    if (finalShippingCharges.shipDate === '') {
      return true
    }

    if (finalShippingCharges.sameShippingMode) {
      if (finalShippingCharges.shippingMode === 'SPD') {
        if (finalShippingCharges.sameShippingCarrier === 'amazon') {
          if (totalSPDFees === 0) {
            return true
          }
        }
        if (finalShippingCharges.sameShippingCarrier === 'non-amazon') {
          if (finalShippingCharges.nonAmazonCarrier === '' || Object.values(finalShippingCharges.shipments).some((shipment) => shipment.deliveryWindow === '')) {
            return true
          }
        }
      }
    }

    if (!finalShippingCharges.sameShippingMode) {
      if (
        Object.values(finalShippingCharges.shipments).some(
          (shipment) =>
            shipment.shippingMode === 'SPD' &&
            finalShippingCharges.sameShippingCarrier === 'non-amazon' &&
            (finalShippingCharges.nonAmazonCarrier === '' || shipment.deliveryWindow === '')
        )
      ) {
        return true
      }
    }

    return false
  }, [finalShippingCharges, totalSPDFees])

  const searchShipmentSPDFees = (shipmentId: string) => {
    if (finalShippingCharges.sameShippingMode) {
      if (finalShippingCharges.shippingMode === 'SPD') {
        if (finalShippingCharges.sameShippingCarrier === 'amazon') {
          return Object.values(inboundPlan.transportationOptions[finalShippingCharges.placementOptionIdSelected][shipmentId])
            .filter((option) => option.shippingSolution === 'AMAZON_PARTNERED_CARRIER' && option.shippingMode === 'GROUND_SMALL_PARCEL')
            .sort((a, b) => a.quote?.cost.amount! - b.quote?.cost.amount!)[0].quote?.cost.amount!
        }

        if (finalShippingCharges.sameShippingCarrier === 'non-amazon') {
          return 0
        }
      }
    }

    if (!finalShippingCharges.sameShippingMode) {
      return Object.values(inboundPlan.transportationOptions[finalShippingCharges.placementOptionIdSelected][shipmentId])
        .filter((option) => option.shippingSolution === 'AMAZON_PARTNERED_CARRIER' && option.shippingMode === 'GROUND_SMALL_PARCEL')
        .sort((a, b) => a.quote?.cost.amount! - b.quote?.cost.amount!)[0].quote?.cost.amount!
    }

    return 0
  }

  const searchShipmentLTLFees = (shipment: FinalShipment) => {
    if (!inboundPlan.transportationOptions[placementOptionSelected.placementOptionId]) return 0

    if (!finalShippingCharges.sameShippingMode) {
      if (shipment.shippingMode === 'LTL') {
        return finalShippingCharges.ltlTransportationOptions[shipment.shipmentId].cost
      }
    }

    return 0
  }

  const handleConfirmChargesFees = async () => {
    const confirmChargesInfo = {
      inboundPlanId: finalShippingCharges.inboundPlanId,
      placementOptionId: finalShippingCharges.placementOptionIdSelected,
      shipDate: finalShippingCharges.shipDate,
      sameShippingMode: finalShippingCharges.sameShippingMode,
      shippingMode: finalShippingCharges.shippingMode,
      sameShippingCarrier: finalShippingCharges.sameShippingCarrier,
      nonAmazonAlphaCode: finalShippingCharges.nonAmazonAlphaCode,
      shipments: Object.values(finalShippingCharges.shipments).map((shipment) => {
        return {
          shipmentId: shipment.shipmentId,
          shippingMode: shipment.shippingMode,
          deliveryWindow: shipment.deliveryWindow,
          totalSpdFees: searchShipmentSPDFees(shipment.shipmentId),
          totalLtlFees: searchShipmentLTLFees(shipment),
          carrier: '',
        }
      }),
      transportationSelections: Object.values(finalShippingCharges.shipments).map((shipment) => {
        const transportation = {
          shipmentId: shipment.shipmentId,
          transportationOptionId: '',
          contactInformation: {
            phoneNumber: '7542432244',
            email: 'info@shelf-cloud.com',
            name: 'Jose Sanchez',
          },
        }

        if (finalShippingCharges.sameShippingMode) {
          if (finalShippingCharges.shippingMode === 'SPD') {
            if (finalShippingCharges.sameShippingCarrier === 'amazon') {
              transportation.transportationOptionId = Object.values(inboundPlan.transportationOptions[placementOptionSelected.placementOptionId][shipment.shipmentId])
                .filter((option) => option.shippingSolution === 'AMAZON_PARTNERED_CARRIER' && option.shippingMode === 'GROUND_SMALL_PARCEL')
                .sort((a, b) => a.quote?.cost.amount! - b.quote?.cost.amount!)[0].transportationOptionId!
            }

            if (finalShippingCharges.sameShippingCarrier === 'non-amazon') {
              transportation.transportationOptionId = Object.values(inboundPlan.transportationOptions[placementOptionSelected.placementOptionId][shipment.shipmentId]).find(
                (option) => option.carrier.alphaCode === finalShippingCharges.nonAmazonAlphaCode
              )?.transportationOptionId!
            }
          }
          if (finalShippingCharges.shippingMode === 'LTL') {
            transportation.transportationOptionId = finalShippingCharges.ltlTransportationOptions[shipment.shipmentId].transportationOptionId
          }
        }

        if (!finalShippingCharges.sameShippingMode) {
          if (shipment.shippingMode === 'SPD') {
            if (finalShippingCharges.sameShippingCarrier === 'amazon') {
              transportation.transportationOptionId = Object.values(inboundPlan.transportationOptions[placementOptionSelected.placementOptionId][shipment.shipmentId])
                .filter((option) => option.shippingSolution === 'AMAZON_PARTNERED_CARRIER' && option.shippingMode === 'GROUND_SMALL_PARCEL')
                .sort((a, b) => a.quote?.cost.amount! - b.quote?.cost.amount!)[0].transportationOptionId!
            }

            if (finalShippingCharges.sameShippingCarrier === 'non-amazon') {
              transportation.transportationOptionId = Object.values(inboundPlan.transportationOptions[placementOptionSelected.placementOptionId][shipment.shipmentId]).find(
                (option) => option.carrier.alphaCode === finalShippingCharges.nonAmazonAlphaCode
              )?.transportationOptionId!
            }
          }

          if (shipment.shippingMode === 'LTL') {
            transportation.transportationOptionId = finalShippingCharges.ltlTransportationOptions[shipment.shipmentId].transportationOptionId
          }
        }

        return transportation
      }),
      totalPrepFees: 0,
      totalPlacementFees: placementOptionSelected.fees.reduce((total, fee) => total + fee.value.amount, 0),
      totalSpdFees: totalSPDFees,
      totalLtlFees: totalLTLFees,
      totalFees: placementOptionSelected.fees.reduce((total, fee) => total + fee.value.amount, 0) + totalSPDFees + totalLTLFees,
    }

    for (const transportation of confirmChargesInfo.transportationSelections) {
      const { shipmentId, transportationOptionId } = transportation

      const carrier = inboundPlan.transportationOptions[placementOptionSelected.placementOptionId][shipmentId].find(
        (option) => option.transportationOptionId === transportationOptionId
      )?.carrier.name!

      confirmChargesInfo.shipments.find((s) => s.shipmentId === shipmentId)!.carrier = carrier || ''
    }

    handleNextStep(confirmChargesInfo)
  }

  return (
    <>
      {!watingRepsonse.shippingExpired ? (
        <div className='w-full px-4'>
          {/* SHIP DATE */}
          <div className='mb-4'>
            <p className='text-[16.25px] font-bold'>Ship Date</p>
            <p className='my-1 mb-2 p-0 text-[11.2px]'>*Shipping date will be the same for all shipments</p>
            {inboundPlan.shipDate ? (
              <div className='btn btn-sm m-0 rounded border border-2 border-success' style={{ backgroundColor: 'white', cursor: 'default' }}>
                <span className='text-[13px] m-0 p-4 font-semibold'>{moment(inboundPlan.shipDate).format('MM/DD/YYYY')}</span>
              </div>
            ) : (
              <ShippingSelectDate
                id={`deliveryWindowSelect-shipDate`}
                selectedDate={finalShippingCharges.shipDate}
                minDate={moment().format('MM/DD/YYYY')}
                maxDate={moment().add(19, 'day').format('MM/DD/YYYY')}
                setnewDate={(newdate) =>
                  setfinalShippingCharges((prev) => {
                    return { ...prev, shipDate: newdate }
                  })
                }
              />
            )}
          </div>

          {!watingRepsonse.transportationOptions && inboundPlan.transportationOptions ? (
            <>
              {/* PLACEMENT OPTIONS */}
              <div>
                <p className='text-[16.25px] font-bold'>Select inbound placement service</p>
                <p className='my-1 p-0 text-[11.2px]'>
                  Shipping your inventory to more locations will minimize inbound placement service fees and improve delivery speed to buyers. To receive reduced fees for the
                  Amazon-optimized or Partial shipment split shipping plans, ensure that you complete all shipments and do not delete, abandon, or misroute any shipment splits.
                </p>
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
                          onClick={() => {
                            if (!inboundPlan.steps[3].complete && !inboundPlan.placementOptionId) {
                              setplacementOptionSelected(placementOption)
                              setfinalShippingCharges((prev) => {
                                return {
                                  ...prev,
                                  sameShippingMode: true,
                                  shippingMode: validateIfPlacementOptionHasSPD(inboundPlan.transportationOptions[placementOption.placementOptionId]) ? 'SPD' : 'LTL',
                                  sameShippingCarrier: 'amazon',
                                  nonAmazonCarrier: '',
                                  nonAmazonAlphaCode: '',
                                  placementOptionIdSelected: placementOption.placementOptionId,
                                  shipments: placementOption.shipmentIds.reduce((acc: { [shipmentId: string]: FinalShipment }, shipmentId) => {
                                    acc[shipmentId] = {
                                      shipmentId: shipmentId,
                                      shippingMode: validateIfPlacementOptionHasSPD(inboundPlan.transportationOptions[placementOption.placementOptionId]) ? 'SPD' : 'LTL',
                                      deliveryWindow: '',
                                      loadingDeliveryWindowOptions: false,
                                    }
                                    return acc
                                  }, {}),
                                  ltlTransportationOptions: setInitialLTLTransportationOptions(inboundPlan.transportationOptions[placementOption.placementOptionId]),
                                }
                              })
                            }
                          }}
                          className={
                            'max-w-full px-2 py-0 my-0 shadow-[0_0.125rem_0.25rem_rgba(0,0,0,0.075)] ' +
                            ((placementOptionSelected.placementOptionId === placementOption.placementOptionId ||
                              inboundPlan.placementOptionId === placementOption.placementOptionId) &&
                              'border border-[3px] border-success')
                          }
                          style={{ cursor: 'pointer' }}>
                          <CardBody>
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
                            <p className='m-0 text-[11.2px] text-[var(--bs-secondary-color)] font-light'>ID: {placementOption.placementOptionId}</p>
                          </CardBody>
                        </Card>
                      )
                  )}
                </div>
              </div>

              {/* SAME SHIPPING MODE */}
              <div>
                <p className='text-[16.25px] font-bold'>Shipping mode</p>
                <div className='form-check form-switch form-switch-sm flex justify-start items-center gap-2 p-0 my-4'>
                  <Switch
                    id='showShippingMode'
                    name='showShippingMode'
                    disabled={inboundPlan.steps[3].complete}
                    checked={finalShippingCharges.sameShippingMode}
                    onChange={() => {
                      setfinalShippingCharges((prev) => {
                        return {
                          ...prev,
                          sameShippingMode: !prev.sameShippingMode,
                          shippingMode: 'SPD',
                          sameShippingCarrier: 'amazon',
                          nonAmazonCarrier: '',
                          nonAmazonAlphaCode: '',
                        }
                      })
                    }}
                  />
                  <Label className='check-form-label m-0 font-normal' for='showShippingMode'>
                    Shipping mode will be same for all shipments
                  </Label>
                </div>
                {!finalShippingCharges.sameShippingMode && (
                  <Row>
                    <Col xs='12' lg='8' xl='6'>
                      <Alert color='secondary' className='alert-border-left'>
                        <i className='ri-error-warning-line me-4 align-middle text-[16.25px]' />
                        Please select the shipping mode that you will use for each shipment
                      </Alert>
                    </Col>
                  </Row>
                )}
                {finalShippingCharges.sameShippingMode && (
                  <div className='flex justify-start items-start gap-4'>
                    <Card
                      onClick={() => {
                        if (
                          (Object.values(inboundPlan.transportationOptions[placementOptionSelected.placementOptionId]).reduce((total, shipment) => {
                            const subtotal = shipment
                              .filter((option) => option.shippingSolution === 'AMAZON_PARTNERED_CARRIER' && option.shippingMode === 'GROUND_SMALL_PARCEL')
                              .sort((a, b) => a.quote?.cost.amount! - b.quote?.cost.amount!)[0]?.quote?.cost.amount!
                            return total + subtotal
                          }, 0) || 0) <= 0
                        )
                          return
                        setfinalShippingCharges((prev) => {
                          return { ...prev, shippingMode: 'SPD', sameShippingCarrier: 'amazon', nonAmazonCarrier: '', nonAmazonAlphaCode: '' }
                        })
                      }}
                      className={'shadow-[0_0.125rem_0.25rem_rgba(0,0,0,0.075)] ' + (finalShippingCharges.shippingMode === 'SPD' && 'border border-[3px] border-success')}
                      style={{ cursor: 'pointer' }}>
                      <CardBody className='flex justify-start items-center gap-1'>
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
                            {Object.values(inboundPlan.transportationOptions[placementOptionSelected.placementOptionId]).reduce((total, shipment) => {
                              const subtotal = shipment
                                .filter((option) => option.shippingSolution === 'AMAZON_PARTNERED_CARRIER' && option.shippingMode === 'GROUND_SMALL_PARCEL')
                                .sort((a, b) => a.quote?.cost.amount! - b.quote?.cost.amount!)[0]?.quote?.cost.amount!
                              return total + subtotal
                            }, 0) > 0 ? (
                              `Starting at ${FormatCurrency(
                                state.currentRegion,
                                inboundPlan.transportationOptions[placementOptionSelected.placementOptionId]
                                  ? Object.values(inboundPlan.transportationOptions[placementOptionSelected.placementOptionId]).reduce((total, shipment) => {
                                      const subtotal = shipment
                                        .filter((option) => option.shippingSolution === 'AMAZON_PARTNERED_CARRIER' && option.shippingMode === 'GROUND_SMALL_PARCEL')
                                        .sort((a, b) => a.quote?.cost.amount! - b.quote?.cost.amount!)[0]?.quote?.cost.amount!
                                      return total + subtotal
                                    }, 0) || 0
                                  : 0
                              )}`
                            ) : (
                              <span className='text-danger font-semibold'>Not Available</span>
                            )}
                          </p>
                        </div>
                      </CardBody>
                    </Card>
                    <Card
                      onClick={() =>
                        !inboundPlan.steps[3].complete &&
                        Object.values(inboundPlan.transportationOptions[placementOptionSelected.placementOptionId]).every((shipment) => {
                          return shipment.some((option) => option.shippingSolution === 'AMAZON_PARTNERED_CARRIER' && option.shippingMode === 'FREIGHT_LTL')
                        }) &&
                        setfinalShippingCharges((prev) => {
                          return { ...prev, shippingMode: 'LTL', nonAmazonCarrier: '', nonAmazonAlphaCode: '' }
                        })
                      }
                      className={'shadow-[0_0.125rem_0.25rem_rgba(0,0,0,0.075)] ' + (finalShippingCharges.shippingMode === 'LTL' && 'border border-[3px] border-success')}
                      style={{ cursor: 'pointer' }}>
                      <CardBody className='flex justify-start items-center gap-1'>
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
                            {inboundPlan.transportationOptions[placementOptionSelected.placementOptionId] &&
                            Object.values(inboundPlan.transportationOptions[placementOptionSelected.placementOptionId]).every((shipment) => {
                              return shipment.some((option) => option.shippingSolution === 'AMAZON_PARTNERED_CARRIER' && option.shippingMode === 'FREIGHT_LTL')
                            }) ? (
                              <>
                                Estimates Starting at{' '}
                                {FormatCurrency(
                                  state.currentRegion,
                                  Object.values(finalShippingCharges.ltlTransportationOptions).reduce((total, shipment) => total + shipment.cost, 0)
                                )}
                              </>
                            ) : (
                              <span className='m-0 p-0 text-danger'>One or more shipments do not have LTL/FTL options.</span>
                            )}
                          </p>
                        </div>
                      </CardBody>
                    </Card>
                  </div>
                )}
              </div>

              {/* SAME SHIPPING CARRIER */}
              {finalShippingCharges.sameShippingMode && finalShippingCharges.shippingMode === 'SPD' && (
                <div>
                  <p className='text-[16.25px] font-bold'>Select Shipping Carrier</p>
                  <Row className='my-4 flex gap-4'>
                    <Col xs='12' lg='3'>
                      <Card
                        onClick={() =>
                          setfinalShippingCharges((prev) => {
                            return { ...prev, sameShippingCarrier: 'amazon', nonAmazonCarrier: '', nonAmazonAlphaCode: '' }
                          })
                        }
                        className={'m-0 shadow-[0_0.125rem_0.25rem_rgba(0,0,0,0.075)] ' + (finalShippingCharges.sameShippingCarrier === 'amazon' && 'border border-[3px] border-success')}
                        style={{ cursor: 'pointer' }}>
                        <CardBody>
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
                        </CardBody>
                      </Card>
                    </Col>
                    {/* <Col xs='12' lg='3'>
                      <Card
                        onClick={() =>
                          setfinalShippingCharges((prev) => {
                            return { ...prev, sameShippingCarrier: 'non-amazon' }
                          })
                        }
                        className={'m-0 py-1 shadow-sm ' + (finalShippingCharges.sameShippingCarrier === 'non-amazon' && 'border border-3 border-success')}
                        style={{ zIndex: 9, cursor: 'pointer' }}>
                        <CardBody>
                          <p className='m-0 mb-2 p-0 fs-7 font-semibold'>Non-Amazon Partnered Carrier</p>
                          <SelectShippingCarrier
                            id={`shippingCarrierNonAmazon`}
                            selectionInfo={nonAmazonCarrierOptions}
                            disabled={finalShippingCharges.sameShippingCarrier === 'amazon'}
                            selected={finalShippingCharges.nonAmazonCarrier}
                            handleSelection={(name: string, alphaCode: string) =>
                              setfinalShippingCharges((prev) => {
                                return { ...prev, sameShippingCarrier: 'non-amazon', nonAmazonCarrier: name, nonAmazonAlphaCode: alphaCode }
                              })
                            }
                          />
                        </CardBody>
                      </Card>
                    </Col> */}
                  </Row>
                </div>
              )}

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
                        <p className='m-0 p-0 text-[11.2px] text-[var(--bs-secondary-color)] font-light'>ID: {shipmentId}</p>
                      </CardHeader>
                      <CardBody>
                        <p className='m-0 text-[11.2px]'>
                          <span className='text-primary'>Ship From: </span>
                          {inboundPlan.shipments[shipmentId]?.shipment.source.address.name}, {inboundPlan.shipments[shipmentId]?.shipment.source.address.addressLine1},{' '}
                          {inboundPlan.shipments[shipmentId]?.shipment.source.address.city}, {inboundPlan.shipments[shipmentId]?.shipment.source.address.stateOrProvinceCode},{' '}
                          {inboundPlan.shipments[shipmentId]?.shipment.source.address.postalCode}, {inboundPlan.shipments[shipmentId]?.shipment.source.address.countryCode}
                        </p>
                        <p className='m-0 text-[11.2px]'>
                          <span className='text-primary'>Ship to: </span>
                          {inboundPlan.shipments[shipmentId]?.shipment.destination.warehouseId} - {inboundPlan.shipments[shipmentId]?.shipment.destination.address.addressLine1},{' '}
                          {inboundPlan.shipments[shipmentId]?.shipment.destination.address.city},{' '}
                          {inboundPlan.shipments[shipmentId]?.shipment.destination.address.stateOrProvinceCode},{' '}
                          {inboundPlan.shipments[shipmentId]?.shipment.destination.address.countryCode}
                        </p>
                        <p className='my-2 p-0 font-semibold text-[11.2px]'>Shipment Contents</p>
                        <div className='flex flex-row flex-nowrap justify-between items-start'>
                          <div>
                            <p className='m-0 p-0 text-[11.2px]'>
                              Boxes: <span className='font-bold'>{inboundPlan.shipments[shipmentId].shipmentBoxes.boxes.reduce((total, item) => total + item.quantity, 0)}</span>
                            </p>
                            <p className='m-0 p-0 text-[11.2px]'>
                              SKUs: <span className='font-bold'>{inboundPlan.shipments[shipmentId].shipmentItems.items.length}</span>
                            </p>
                            <p className='m-0 p-0 text-[11.2px]'>
                              Units:{' '}
                              <span className='font-bold'>
                                {inboundPlan.shipments[shipmentId].shipmentBoxes.boxes.reduce((total, item) => {
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
                                  inboundPlan.shipments[shipmentId].shipmentBoxes.boxes.reduce((total, item) => {
                                    const totalitems = item.weight.value * item.quantity
                                    return total + totalitems
                                  }, 0)
                                )}{' '}
                                Lb
                              </span>
                            </p>
                          </div>
                          <div className='flex flex-row flex-nowrap justify-end items-center gap-2'>
                            {inboundPlan.shipments[shipmentId].shipmentItems.items.map(
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
                            {inboundPlan.shipments[shipmentId].shipmentItems.items.length > 3 && <p>+{inboundPlan.shipments[shipmentId].shipmentItems.items.length - 3}</p>}
                          </div>
                        </div>
                        <div>
                          {/* SAME SHIPPING MODE && AMAZON */}
                          {finalShippingCharges.sameShippingMode && finalShippingCharges.shippingMode === 'SPD' && finalShippingCharges.sameShippingCarrier === 'amazon' && (
                            <p className='m-0 mt-4 p-0 text-[11.2px] text-right'>
                              <span className='font-semibold'>
                                {(Object.values(inboundPlan.transportationOptions[placementOptionSelected.placementOptionId][shipmentId])
                                  .filter((option) => option.shippingSolution === 'AMAZON_PARTNERED_CARRIER' && option.shippingMode === 'GROUND_SMALL_PARCEL')
                                  .sort((a, b) => a.quote?.cost.amount! - b.quote?.cost.amount!)[0]?.quote?.cost.amount! || 0) > 0 ? (
                                  `Estimated Carrier Charges: ${FormatCurrency(
                                    state.currentRegion,
                                    inboundPlan.transportationOptions[placementOptionSelected.placementOptionId]
                                      ? Object.values(inboundPlan.transportationOptions[placementOptionSelected.placementOptionId][shipmentId])
                                          .filter((option) => option.shippingSolution === 'AMAZON_PARTNERED_CARRIER' && option.shippingMode === 'GROUND_SMALL_PARCEL')
                                          .sort((a, b) => a.quote?.cost.amount! - b.quote?.cost.amount!)[0]?.quote?.cost.amount! || 0
                                      : 0
                                  )}`
                                ) : (
                                  <span className='text-danger font-semibold'>Not Available</span>
                                )}
                              </span>
                            </p>
                          )}

                          {/* SAME SHIPPING MODE && LTL */}
                          {finalShippingCharges.sameShippingMode && finalShippingCharges.shippingMode === 'LTL' && (
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
                                            {FormatIntNumber(
                                              state.currentRegion,
                                              inboundPlan.generateTransportationOptions[placementOptionSelected.placementOptionId][shipmentId]?.pallets!.length ?? 1
                                            )}
                                          </span>
                                        </td>
                                        <td>
                                          Total Weight:{' '}
                                          <span className='font-semibold'>
                                            {FormatIntPercentage(
                                              state.currentRegion,
                                              inboundPlan.generateTransportationOptions[placementOptionSelected.placementOptionId][shipmentId]?.pallets!.reduce(
                                                (total, pallet) => total + pallet.weight.value,
                                                0
                                              )
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
                                              inboundPlan.shipments[shipmentId]?.shipmentBoxes.boxes.reduce(
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
                                <p className='m-0 mt-4 p-0 text-[11.2px] text-right'>
                                  {inboundPlan.transportationOptions[placementOptionSelected.placementOptionId] &&
                                  Object.values(inboundPlan.transportationOptions[placementOptionSelected.placementOptionId][shipmentId]).some(
                                    (option) => option.shippingSolution === 'AMAZON_PARTNERED_CARRIER' && option.shippingMode === 'FREIGHT_LTL'
                                  ) ? (
                                    <>
                                      Estimated Carrier Charges:{' '}
                                      <span className='font-semibold'>{FormatCurrency(state.currentRegion, finalShippingCharges.ltlTransportationOptions[shipmentId].cost)}</span>
                                    </>
                                  ) : (
                                    'Estimate Not Available'
                                  )}
                                </p>
                              </div>
                              <SelectLTLFreightReadyDate
                                shipmentId={shipmentId}
                                selectedLTLTransportationOption={finalShippingCharges.ltlTransportationOptions[shipmentId]}
                                setfinalShippingCharges={setfinalShippingCharges}
                                commonCarriers={commonPlacementOptionCarriers(inboundPlan.transportationOptions[placementOptionSelected.placementOptionId])}
                                transportationOptions={Object.values(inboundPlan.transportationOptions[placementOptionSelected.placementOptionId][shipmentId])
                                  .filter((option) => option.shippingSolution === 'AMAZON_PARTNERED_CARRIER' && option.shippingMode === 'FREIGHT_LTL')
                                  .sort((a, b) => (moment(a.carrierAppointment?.startTime) > moment(b.carrierAppointment?.startTime) ? 1 : -1))}
                              />
                            </>
                          )}

                          {/* DIFFERENT SHIPPING MODE */}
                          {!finalShippingCharges.sameShippingMode && (
                            <div className='my-4'>
                              <p className='m-0 p-0 font-semibold text-[11.2px]'>Shipping Mode:</p>
                              <div className='my-2 flex flex-col justify-start items-start gap-2'>
                                {/* SHIPPING MODE SPD */}
                                <div className='flex flex-row justify-start items-center gap-4'>
                                  <Input
                                    className='my-0'
                                    type='radio'
                                    style={{ cursor: 'pointer' }}
                                    id={`shippingModeSPD-${shipmentId}`}
                                    name={`shippingModeSPD-${shipmentId}`}
                                    disabled={
                                      (Object.values(inboundPlan.transportationOptions[placementOptionSelected.placementOptionId][shipmentId])
                                        .filter((option) => option.shippingSolution === 'AMAZON_PARTNERED_CARRIER' && option.shippingMode === 'GROUND_SMALL_PARCEL')
                                        .sort((a, b) => a.quote?.cost.amount! - b.quote?.cost.amount!)[0]?.quote?.cost.amount! || 0) <= 0
                                    }
                                    checked={finalShippingCharges.shipments[shipmentId].shippingMode === 'SPD'}
                                    onChange={() =>
                                      setfinalShippingCharges((prev) => {
                                        return {
                                          ...prev,
                                          shipments: {
                                            ...prev.shipments,
                                            [shipmentId]: {
                                              ...prev.shipments[shipmentId],
                                              shippingMode: 'SPD',
                                              transportationOptionId: Object.values(inboundPlan.transportationOptions[placementOptionSelected.placementOptionId][shipmentId])
                                                .filter((option) => option.shippingSolution === 'AMAZON_PARTNERED_CARRIER' && option.shippingMode === 'GROUND_SMALL_PARCEL')
                                                .sort((a, b) => a.quote?.cost.amount! - b.quote?.cost.amount!)[0].transportationOptionId,
                                            },
                                          },
                                        }
                                      })
                                    }
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
                                      {(Object.values(inboundPlan.transportationOptions[placementOptionSelected.placementOptionId][shipmentId])
                                        .filter((option) => option.shippingSolution === 'AMAZON_PARTNERED_CARRIER' && option.shippingMode === 'GROUND_SMALL_PARCEL')
                                        .sort((a, b) => a.quote?.cost.amount! - b.quote?.cost.amount!)[0]?.quote?.cost.amount! || 0) > 0 ? (
                                        `Starting at ${FormatCurrency(
                                          state.currentRegion,
                                          inboundPlan.transportationOptions[placementOptionSelected.placementOptionId]
                                            ? Object.values(inboundPlan.transportationOptions[placementOptionSelected.placementOptionId][shipmentId])
                                                .filter((option) => option.shippingSolution === 'AMAZON_PARTNERED_CARRIER' && option.shippingMode === 'GROUND_SMALL_PARCEL')
                                                .sort((a, b) => a.quote?.cost.amount! - b.quote?.cost.amount!)[0]?.quote?.cost.amount! || 0
                                            : 0
                                        )}`
                                      ) : (
                                        <span className='text-danger font-semibold'>Not Available</span>
                                      )}
                                    </p>
                                  </div>
                                </div>

                                {/* SHIPPING MODE LTL */}
                                <div className='flex flex-col justify-start items-center gap-2'>
                                  <div className='flex flex-row justify-start items-center gap-4'>
                                    <Input
                                      className='my-0'
                                      type='radio'
                                      disabled={
                                        !Object.values(inboundPlan.transportationOptions[placementOptionSelected.placementOptionId][shipmentId]).some(
                                          (option) => option.shippingSolution === 'AMAZON_PARTNERED_CARRIER' && option.shippingMode === 'FREIGHT_LTL'
                                        )
                                      }
                                      style={{ cursor: 'pointer' }}
                                      id={`shippingModeLTL-${shipmentId}`}
                                      name={`shippingModeLTL-${shipmentId}`}
                                      checked={finalShippingCharges.shipments[shipmentId].shippingMode === 'LTL'}
                                      onChange={() =>
                                        Object.values(inboundPlan.transportationOptions[placementOptionSelected.placementOptionId][shipmentId]).some(
                                          (option) => option.shippingSolution === 'AMAZON_PARTNERED_CARRIER' && option.shippingMode === 'FREIGHT_LTL'
                                        ) &&
                                        setfinalShippingCharges((prev) => {
                                          return {
                                            ...prev,
                                            shipments: {
                                              ...prev.shipments,
                                              [shipmentId]: {
                                                ...prev.shipments[shipmentId],
                                                shippingMode: 'LTL',
                                                transportationOptionId: finalShippingCharges.ltlTransportationOptions[shipmentId].transportationOptionId,
                                              },
                                            },
                                          }
                                        })
                                      }
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
                                        {inboundPlan.transportationOptions[placementOptionSelected.placementOptionId] &&
                                        Object.values(inboundPlan.transportationOptions[placementOptionSelected.placementOptionId][shipmentId]).some(
                                          (option) => option.shippingSolution === 'AMAZON_PARTNERED_CARRIER' && option.shippingMode === 'FREIGHT_LTL'
                                        ) ? (
                                          <>Estimates Starting at {FormatCurrency(state.currentRegion, finalShippingCharges.ltlTransportationOptions[shipmentId].cost)}</>
                                        ) : (
                                          <span className='m-0 p-0 text-danger'>Estimate Not Available</span>
                                        )}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {finalShippingCharges.shipments[shipmentId].shippingMode === 'SPD' ? (
                                <>
                                  <p className='m-0 p-0 font-semibold text-[11.2px]'>Carrier:</p>
                                  <div className='my-2 flex flex-col justify-start items-start gap-2'>
                                    {/* CARRIER AMAZON PARTNERED */}
                                    <div className='flex flex-row justify-start items-center gap-4'>
                                      <Input
                                        className='my-0'
                                        type='radio'
                                        style={{ cursor: 'pointer' }}
                                        id={`shippingCarrierAmazon-${shipmentId}`}
                                        name={`shippingCarrierAmazon-${shipmentId}`}
                                        checked={finalShippingCharges.sameShippingCarrier === 'amazon'}
                                        onChange={() =>
                                          setfinalShippingCharges((prev) => {
                                            return {
                                              ...prev,
                                              sameShippingCarrier: 'amazon',
                                              nonAmazonCarrier: '',
                                              nonAmazonAlphaCode: '',
                                              shipments: {
                                                ...prev.shipments,
                                                [shipmentId]: {
                                                  ...prev.shipments[shipmentId],
                                                  shippingMode: 'SPD',
                                                  transportationOptionId: Object.values(inboundPlan.transportationOptions[placementOptionSelected.placementOptionId][shipmentId])
                                                    .filter((option) => option.shippingSolution === 'AMAZON_PARTNERED_CARRIER' && option.shippingMode === 'GROUND_SMALL_PARCEL')
                                                    .sort((a, b) => a.quote?.cost.amount! - b.quote?.cost.amount!)[0].transportationOptionId,
                                                },
                                              },
                                            }
                                          })
                                        }
                                      />
                                      <div className={'' + (finalShippingCharges.sameShippingCarrier !== 'amazon' && 'text-[var(--bs-secondary-color)]')}>
                                        <p className='m-0 p-0 text-[11.2px]'>UPS (Amazon Partnered Carrier)</p>
                                        <p className='m-0 p-0 text-[11.2px] font-bold'>
                                          {(Object.values(inboundPlan.transportationOptions[placementOptionSelected.placementOptionId][shipmentId])
                                            .filter((option) => option.shippingSolution === 'AMAZON_PARTNERED_CARRIER' && option.shippingMode === 'GROUND_SMALL_PARCEL')
                                            .sort((a, b) => a.quote?.cost.amount! - b.quote?.cost.amount!)[0]?.quote?.cost.amount! || 0) > 0 ? (
                                            FormatCurrency(
                                              state.currentRegion,
                                              inboundPlan.transportationOptions[placementOptionSelected.placementOptionId]
                                                ? Object.values(inboundPlan.transportationOptions[placementOptionSelected.placementOptionId][shipmentId])
                                                    .filter((option) => option.shippingSolution === 'AMAZON_PARTNERED_CARRIER' && option.shippingMode === 'GROUND_SMALL_PARCEL')
                                                    .sort((a, b) => a.quote?.cost.amount! - b.quote?.cost.amount!)[0]?.quote?.cost.amount! || 0
                                                : 0
                                            )
                                          ) : (
                                            <span className='text-danger font-semibold'>Not Available</span>
                                          )}
                                        </p>
                                      </div>
                                    </div>

                                    {/* CARRIER NON-AMAZON */}
                                    {/* <div className='d-flex flex-row justify-content-start align-items-center gap-3'>
                                      <Input
                                        className='my-0'
                                        type='radio'
                                        style={{ cursor: 'pointer' }}
                                        id={`shippingCarrierNonAmazon-${shipmentId}`}
                                        name={`shippingCarrierNonAmazon-${shipmentId}`}
                                        checked={finalShippingCharges.sameShippingCarrier === 'non-amazon'}
                                        onChange={() =>
                                          setfinalShippingCharges((prev) => {
                                            return {
                                              ...prev,
                                              sameShippingCarrier: 'non-amazon',
                                              shipments: {
                                                ...prev.shipments,
                                                [shipmentId]: { ...prev.shipments[shipmentId], shippingMode: 'SPD' },
                                              },
                                            }
                                          })
                                        }
                                      />
                                      <div>
                                        <p className={'m-0 p-0 fs-7 ' + (finalShippingCharges.sameShippingCarrier !== 'non-amazon' && 'text-[var(--bs-secondary-color)]')}>
                                          Non-Amazon Partnered Carrier
                                        </p>
                                        <SelectShippingCarrier
                                          id={`shippingCarrierNonAmazonSelect-${shipmentId}`}
                                          selectionInfo={inboundPlan.transportationOptions[placementOptionSelected.placementOptionId][shipmentId].filter(
                                            (option) => option.shippingSolution === 'USE_YOUR_OWN_CARRIER' && option.shippingMode === 'GROUND_SMALL_PARCEL'
                                          )}
                                          disabled={finalShippingCharges.sameShippingCarrier !== 'non-amazon'}
                                          selected={finalShippingCharges.nonAmazonCarrier}
                                          handleSelection={(name: string, alphaCode: string, transportationOptionId: string) =>
                                            setfinalShippingCharges((prev) => {
                                              return {
                                                ...prev,
                                                sameShippingCarrier: 'non-amazon',
                                                nonAmazonCarrier: name,
                                                nonAmazonAlphaCode: alphaCode,
                                                shipments: {
                                                  ...prev.shipments,
                                                  [shipmentId]: {
                                                    ...prev.shipments[shipmentId],
                                                    shippingMode: 'SPD',
                                                    transportationOptionId: transportationOptionId,
                                                  },
                                                },
                                              }
                                            })
                                          }
                                        />
                                      </div>
                                    </div> */}
                                  </div>
                                  <p className='m-0 my-4 p-0 text-[var(--bs-secondary-color)] text-[11.2px]'>The carrier for this SPD shipment must be the same as other SPD shipments.</p>
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
                                                {FormatIntNumber(
                                                  state.currentRegion,
                                                  inboundPlan.generateTransportationOptions[placementOptionSelected.placementOptionId][shipmentId]?.pallets!.length ?? 1
                                                )}
                                              </span>
                                            </td>
                                            <td>
                                              Total Weight:{' '}
                                              <span className='font-semibold'>
                                                {FormatIntPercentage(
                                                  state.currentRegion,
                                                  inboundPlan.generateTransportationOptions[placementOptionSelected.placementOptionId][shipmentId]?.pallets!.reduce(
                                                    (total, pallet) => total + pallet.weight.value,
                                                    0
                                                  )
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
                                                  inboundPlan.shipments[shipmentId]?.shipmentBoxes.boxes.reduce(
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
                                    <p className='m-0 p-0 font-semibold text-[11.2px]'>Carrier:</p>
                                    <p className='text-[11.2px] text-[var(--bs-secondary-color)]'>{`You'll select your LTL carrier in Step 4.`}</p>
                                  </div>
                                  <SelectLTLFreightReadyDate
                                    shipmentId={shipmentId}
                                    selectedLTLTransportationOption={finalShippingCharges.ltlTransportationOptions[shipmentId]}
                                    setfinalShippingCharges={setfinalShippingCharges}
                                    commonCarriers={commonPlacementOptionCarriers(inboundPlan.transportationOptions[placementOptionSelected.placementOptionId])}
                                    transportationOptions={Object.values(inboundPlan.transportationOptions[placementOptionSelected.placementOptionId][shipmentId])
                                      .filter((option) => option.shippingSolution === 'AMAZON_PARTNERED_CARRIER' && option.shippingMode === 'FREIGHT_LTL')
                                      .sort((a, b) => (moment(a.carrierAppointment?.startTime) > moment(b.carrierAppointment?.startTime) ? 1 : -1))}
                                  />
                                </>
                              )}
                            </div>
                          )}

                          {/* DELIVERY WINDOW */}
                          {finalShippingCharges.sameShippingMode && finalShippingCharges.shippingMode === 'SPD' && finalShippingCharges.sameShippingCarrier === 'non-amazon' && (
                            <div className='my-4 '>
                              <p className='m-0 p-0 font-semibold text-[11.2px]'>Delivery Window:</p>
                              <p className='text-[11.2px] text-[var(--bs-secondary-color)]'>
                                The delivery window is when you expect your shipment to arrive at the fulfillment center. This information will help us get your products in stock
                                faster. Choose an estimated 7-day date range. You can update this when you enter tracking details.
                              </p>
                              <ShippingSelectDate
                                id={`deliveryWindowSelect-${shipmentId}`}
                                selectedDate={finalShippingCharges.shipments[shipmentId].deliveryWindow}
                                minDate={moment().add(1, 'day').format('MM/DD/YYYY')}
                                maxDate={moment().add(19, 'day').format('MM/DD/YYYY')}
                                setnewDate={(newdate) => {
                                  handleGetDeliveryWindowOptions(placementOptionSelected.placementOptionId, shipmentId)
                                  setfinalShippingCharges((prev) => {
                                    return { ...prev, shipments: { ...prev.shipments, [shipmentId]: { ...prev.shipments[shipmentId], deliveryWindow: newdate } } }
                                  })
                                }}
                              />
                              {finalShippingCharges.shipments[shipmentId].loadingDeliveryWindowOptions && (
                                <div className='w-full'>
                                  <div className='my-4 flex justify-start items-center gap-4'>
                                    <Spinner color='primary' size={'sm'} />
                                    <p className='m-0 p-0 font-normal text-[11.2px]'>Generating Delivery Window Options...</p>
                                  </div>
                                </div>
                              )}
                              {finalShippingCharges.shipments[shipmentId].deliveryWindow !== '' ? (
                                <>
                                  <p className='m-0 mt-1 p-0 font-semibold text-[11.2px]'>
                                    {`Delivery Window: ${moment(finalShippingCharges.shipments[shipmentId].deliveryWindow, 'MM/DD/YYYY').format('LL')} - ${moment(
                                      deliveryWindowOptions[placementOptionSelected.placementOptionId] &&
                                        deliveryWindowOptions[placementOptionSelected.placementOptionId][shipmentId]?.find(
                                          (option) =>
                                            moment(option.startDate).format('MM/DD/YYYY') ==
                                            moment(finalShippingCharges.shipments[shipmentId].deliveryWindow, 'MM/DD/YYYY').format('MM/DD/YYYY')
                                        )?.endDate
                                    ).format('LL')}`}
                                  </p>
                                  <p className='m-0 p-0 text-[var(--bs-secondary-color)] text-[11.2px]'>
                                    This delivery window can be edited in the final step up to{' '}
                                    {moment(finalShippingCharges.shipments[shipmentId].deliveryWindow, 'MM/DD/YYYY').format('LL')}.
                                  </p>
                                </>
                              ) : (
                                <p className='m-0 mt-1 p-0 font-normal text-[11.2px]'>Delivery Window: Not Selected</p>
                              )}
                            </div>
                          )}
                          {!finalShippingCharges.sameShippingMode &&
                            finalShippingCharges.sameShippingCarrier === 'non-amazon' &&
                            finalShippingCharges.shipments[shipmentId].shippingMode === 'SPD' && (
                              <div className='my-4 '>
                                <p className='m-0 p-0 font-semibold text-[11.2px]'>Delivery Window:</p>
                                <p className='text-[11.2px] text-[var(--bs-secondary-color)]'>
                                  The delivery window is when you expect your shipment to arrive at the fulfillment center. This information will help us get your products in stock
                                  faster. Choose an estimated 7-day date range. You can update this when you enter tracking details.
                                </p>
                                <ShippingSelectDate
                                  id={`deliveryWindowSelect-${shipmentId}`}
                                  selectedDate={finalShippingCharges.shipments[shipmentId].deliveryWindow}
                                  minDate={moment().add(1, 'day').format('MM/DD/YYYY')}
                                  maxDate={moment().add(19, 'day').format('MM/DD/YYYY')}
                                  setnewDate={(newdate) => {
                                    handleGetDeliveryWindowOptions(placementOptionSelected.placementOptionId, shipmentId)
                                    setfinalShippingCharges((prev) => {
                                      return { ...prev, shipments: { ...prev.shipments, [shipmentId]: { ...prev.shipments[shipmentId], deliveryWindow: newdate } } }
                                    })
                                  }}
                                />
                                {finalShippingCharges.shipments[shipmentId].loadingDeliveryWindowOptions && (
                                  <div className='w-full'>
                                    <div className='my-4 flex justify-start items-center gap-4'>
                                      <Spinner color='primary' size={'sm'} />
                                      <p className='m-0 p-0 font-normal text-[11.2px]'>Generating Delivery Window Options...</p>
                                    </div>
                                  </div>
                                )}
                                {finalShippingCharges.shipments[shipmentId].deliveryWindow !== '' ? (
                                  <>
                                    <p className='m-0 mt-1 p-0 font-semibold text-[11.2px]'>
                                      {`Delivery Window: ${moment(finalShippingCharges.shipments[shipmentId].deliveryWindow, 'MM/DD/YYYY').format('LL')} - ${moment(
                                        deliveryWindowOptions[placementOptionSelected.placementOptionId] &&
                                          deliveryWindowOptions[placementOptionSelected.placementOptionId][shipmentId]?.find(
                                            (option) =>
                                              moment(option.startDate).format('MM/DD/YYYY') ==
                                              moment(finalShippingCharges.shipments[shipmentId].deliveryWindow, 'MM/DD/YYYY').format('MM/DD/YYYY')
                                          )?.endDate
                                      ).format('LL')}`}
                                    </p>
                                    <p className='m-0 p-0 text-[var(--bs-secondary-color)] text-[11.2px]'>
                                      This delivery window can be edited in the final step up to{' '}
                                      {moment(finalShippingCharges.shipments[shipmentId].deliveryWindow, 'MM/DD/YYYY').format('LL')}.
                                    </p>
                                  </>
                                ) : (
                                  <p className='m-0 mt-1 p-0 font-normal text-[11.2px]'>Delivery Window: Not Selected</p>
                                )}
                              </div>
                            )}

                          {!finalShippingCharges.sameShippingMode && finalShippingCharges.shipments[shipmentId].shippingMode === 'SPD' && (
                            <div className='mt-4'>
                              <p className='m-0 my-4 p-0 text-[var(--bs-secondary-color)] text-[11.2px]'>
                                * The Amazon Partnered Carrier program offers discounted shipping rates, the convenience of buying and printing shipping labels when you create
                                shipments, and automated tracking.
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
              <Row className='my-4'>
                <Col xs='12' lg='8'>
                  <p className='text-[16.25px] font-bold'>Ready to continue?</p>
                  <p className='text-[11.2px]'>Before we generate the shipping labels for you, take a moment to review the details and check that all is correct.</p>
                </Col>
                <Col xs='12' lg='4'>
                  <table className='w-full align-middle mb-0 text-[11.2px] [&_th]:px-2 [&_th]:py-1 [&_td]:px-2 [&_td]:py-1'>
                    <tbody>
                      <tr>
                        <td>Total prep and labeling fees:</td>
                        <td>{FormatCurrency(state.currentRegion, 0)}</td>
                      </tr>
                      <tr>
                        <td>Total placement fees:</td>
                        <td>
                          {FormatCurrency(
                            state.currentRegion,
                            placementOptionSelected.fees.reduce((total, fee) => total + fee.value.amount, 0)
                          )}
                        </td>
                      </tr>
                      <tr>
                        <td>{totalLTLFees > 0 ? 'SPD shipping fees:' : 'Total estimated shipping fees:'}</td>
                        <td>{FormatCurrency(state.currentRegion, totalSPDFees)}</td>
                      </tr>
                      {totalLTLFees > 0 && (
                        <tr>
                          <td>LTL shipping fees:</td>
                          <td>{FormatCurrency(state.currentRegion, totalLTLFees)}</td>
                        </tr>
                      )}
                      <tr className='font-bold'>
                        <td>Total estimated prep, labeling, placement, and shipping fees (other fees may apply):</td>
                        <td>
                          {FormatCurrency(state.currentRegion, placementOptionSelected.fees.reduce((total, fee) => total + fee.value.amount, 0) + totalSPDFees + totalLTLFees)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                  {placementOptionsExpired && (
                    <div className='flex justify-end items-center'>
                      <Button color='danger' onClick={() => regenerateFBAPlacementOptions(state.currentRegion, state.user.businessId, inboundPlan.inboundPlanId)}>
                        Placement Needs to be Re-Generated
                      </Button>
                    </div>
                  )}
                  {!placementOptionsExpired && inboundPlan.fulfillmentType === 'Master Boxes' && (
                    <div className='flex justify-end items-center'>
                      {!inboundPlan.steps[3].complete ? (
                        <Button disabled={shippingHasErrors || watingRepsonse.boxLabels} color='success' id='btn_handleNextShipping' onClick={handleConfirmChargesFees}>
                          {watingRepsonse.boxLabels ? (
                            <div className='flex gap-4'>
                              <Spinner color='light' size={'sm'} />
                              <span>Confirming Charges and Shipping...</span>
                            </div>
                          ) : (
                            'Accept Charges and Confirm Shipping'
                          )}
                        </Button>
                      ) : (
                        <Button disabled={true} color='success' id='btn_handleNextShipping'>
                          Charges Already Confirmed
                        </Button>
                      )}
                    </div>
                  )}
                </Col>
              </Row>
            </>
          ) : (
            <div className='my-4 flex justify-start items-center gap-4'>
              <Spinner color='primary' />
              <p className='m-0 p-0 font-normal text-[16.25px]'>Generating Inbound Transportation Options, this may take a few minutes...</p>
            </div>
          )}
        </div>
      ) : (
        <div className='w-full px-4'>
          <div className='my-4 flex justify-start items-center gap-4'>
            <Spinner color='primary' />
            <p className='m-0 p-0 font-normal text-[16.25px]'>Placement Options expired, generating new options, this may take a few minutes...</p>
          </div>
        </div>
      )}
    </>
  )
}

export default Shipping
