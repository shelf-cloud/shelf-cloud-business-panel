import { TransportationOption } from '@typesTs/amazon/fulfillments/fulfillment'

export const nonAmazonCarrierOptions = [
  {
    carrier: {
      name: 'DHL',
      alphaCode: 'DHLW',
    },
    preconditions: ['CONFIRMED_DELIVERY_WINDOW'],
    shipmentId: '',
    shippingMode: 'GROUND_SMALL_PARCEL',
    transportationOptionId: '',
    shippingSolution: 'USE_YOUR_OWN_CARRIER',
  },
  {
    carrier: {
      name: 'FedEx',
      alphaCode: 'FDE',
    },
    preconditions: ['CONFIRMED_DELIVERY_WINDOW'],
    shipmentId: '',
    shippingMode: 'GROUND_SMALL_PARCEL',
    transportationOptionId: '',
    shippingSolution: 'USE_YOUR_OWN_CARRIER',
  },
  {
    carrier: {
      name: 'FedEx Ground',
      alphaCode: 'FDEG',
    },
    preconditions: ['CONFIRMED_DELIVERY_WINDOW'],
    shipmentId: '',
    shippingMode: 'GROUND_SMALL_PARCEL',
    transportationOptionId: '',
    shippingSolution: 'USE_YOUR_OWN_CARRIER',
  },
  {
    carrier: {
      name: 'GES (ShipTrack)',
      alphaCode: 'SHFI',
    },
    preconditions: ['CONFIRMED_DELIVERY_WINDOW'],
    shipmentId: '',
    shippingMode: 'GROUND_SMALL_PARCEL',
    transportationOptionId: '',
    shippingSolution: 'USE_YOUR_OWN_CARRIER',
  },
  {
    carrier: {
      name: 'NIUKU (ShipTrack)',
      alphaCode: 'JCRA',
    },
    preconditions: ['CONFIRMED_DELIVERY_WINDOW'],
    shipmentId: '',
    shippingMode: 'GROUND_SMALL_PARCEL',
    transportationOptionId: '',
    shippingSolution: 'USE_YOUR_OWN_CARRIER',
  },
  {
    carrier: {
      name: 'Owl Supply Chain (ShipTrack)',
      alphaCode: 'NSIV',
    },
    preconditions: ['CONFIRMED_DELIVERY_WINDOW'],
    shipmentId: '',
    shippingMode: 'GROUND_SMALL_PARCEL',
    transportationOptionId: '',
    shippingSolution: 'USE_YOUR_OWN_CARRIER',
  },
  {
    carrier: {
      name: 'UPS (non-partnered carrier)',
      alphaCode: 'UPSN',
    },
    preconditions: ['CONFIRMED_DELIVERY_WINDOW'],
    shipmentId: '',
    shippingMode: 'GROUND_SMALL_PARCEL',
    transportationOptionId: '',
    shippingSolution: 'USE_YOUR_OWN_CARRIER',
  },
  {
    carrier: {
      name: 'USPS',
      alphaCode: 'USPS',
    },
    preconditions: ['CONFIRMED_DELIVERY_WINDOW'],
    shipmentId: '',
    shippingMode: 'GROUND_SMALL_PARCEL',
    transportationOptionId: '',
    shippingSolution: 'USE_YOUR_OWN_CARRIER',
  },
] as TransportationOption[]
