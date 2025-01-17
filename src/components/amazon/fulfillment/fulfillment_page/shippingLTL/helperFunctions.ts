import { TransportationOption, TransportationOptionShipment } from '@typesTs/amazon/fulfillments/fulfillment'
import moment from 'moment'

export const findLtlAlphaCode = (transportationOptions: TransportationOptionShipment) => {
  const shipments = Object.values(transportationOptions)
  const alphaCodeData: Record<string, { totalCost: number; shipmentCount: number }> = {}

  for (const shipment of shipments) {
    const seenAlphaCodes = new Set<string>()

    for (const option of shipment.filter((option) => option.shippingSolution === 'AMAZON_PARTNERED_CARRIER' && option.shippingMode === 'FREIGHT_LTL')) {
      const { alphaCode } = option.carrier

      if (seenAlphaCodes.has(alphaCode)) continue
      seenAlphaCodes.add(alphaCode)

      if (!alphaCodeData[alphaCode]) {
        alphaCodeData[alphaCode] = { totalCost: 0, shipmentCount: 0 }
      }

      alphaCodeData[alphaCode].shipmentCount += 1

      if (option.quote) {
        alphaCodeData[alphaCode].totalCost += option.quote.cost.amount
      }
    }
  }

  let optimalAlphaCode
  let minCost = Infinity

  for (const [alphaCode, { totalCost, shipmentCount }] of Object.entries(alphaCodeData)) {
    // Check if the alphaCode is present in all shipments
    if (shipmentCount === shipments.length && totalCost < minCost) {
      minCost = totalCost
      optimalAlphaCode = alphaCode
    }
  }

  return optimalAlphaCode || Object.keys(alphaCodeData)[0]
}

export const validateIfPlacementOptionHasSPD = (transportationOptions: TransportationOptionShipment) => {
  const shipments = Object.values(transportationOptions)

  for (const shipment of shipments) {
    if (
      (shipment
        .filter((option) => option.shippingSolution === 'AMAZON_PARTNERED_CARRIER' && option.shippingMode === 'GROUND_SMALL_PARCEL')
        .sort((a, b) => a.quote?.cost.amount! - b.quote?.cost.amount!)[0]?.quote?.cost.amount! || 0) <= 0
    )
      return false
  }
}

export const setInitialLTLTransportationOptions = (transportationOptions: TransportationOptionShipment) => {
  const ltlAlphaCode = findLtlAlphaCode(transportationOptions)
  const shipments = Object.values(transportationOptions)

  const selectedTransportationOptions = {} as { [shipmentId: string]: { shipmentId: string; transportationOptionId: string; cost: number; ltlAlphaCode: string } }

  for (const shipment of shipments) {
    const selectedOption = shipment
      .filter((option) => option.shippingSolution === 'AMAZON_PARTNERED_CARRIER' && option.shippingMode === 'FREIGHT_LTL' && option.carrier.alphaCode === ltlAlphaCode)
      .sort((a, b) => a.quote?.cost.amount! - b.quote?.cost.amount!)[0]

    selectedTransportationOptions[selectedOption.shipmentId] = {
      shipmentId: selectedOption.shipmentId,
      transportationOptionId: selectedOption.transportationOptionId,
      cost: selectedOption.quote?.cost.amount!,
      ltlAlphaCode: selectedOption.carrier.alphaCode,
    }
  }

  return selectedTransportationOptions
}

export const setShipmentLTLTransportationOption = (transportationOptions: TransportationOption[], newLTLAlphaCode: string) => {
  const selectedOption = transportationOptions
    .filter((option) => option.shippingSolution === 'AMAZON_PARTNERED_CARRIER' && option.shippingMode === 'FREIGHT_LTL' && option.carrier.alphaCode === newLTLAlphaCode)
    .sort((a, b) => (moment(a.carrierAppointment?.startTime) > moment(b.carrierAppointment?.startTime) ? 1 : -1))[0]

  return {
    shipmentId: selectedOption.shipmentId,
    transportationOptionId: selectedOption.transportationOptionId,
    cost: selectedOption.quote?.cost.amount!,
    ltlAlphaCode: newLTLAlphaCode,
  }
}

export const setLTLTransportationOption = (transportationOptions: TransportationOption[], transportationOptionId: string) => {
  const selectedOption = transportationOptions.find((option) => option.transportationOptionId === transportationOptionId)!

  return {
    shipmentId: selectedOption.shipmentId,
    transportationOptionId: selectedOption.transportationOptionId,
    cost: selectedOption.quote?.cost.amount!,
    ltlAlphaCode: selectedOption.carrier.alphaCode,
  }
}
