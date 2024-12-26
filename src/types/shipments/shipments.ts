export interface ShipmentDetialsResponse {
  error: boolean
  message: string
  shipment: Shipment
  isValidating: boolean
}

export interface Shipment {
  carrierIcon: string
  trackingLink: string
  id: number
  businessId: string
  orderId: string
  orderNumber: string
  poNumber: string | null
  goFlowOrderId: number
  orderDate: string
  closedDate?: string
  orderStatus: string
  orderType: string
  trackingNumber: string
  pickpackCharge: number
  shippingCharge: number
  labeling: number
  receivingService: number
  receivingPallets: number
  receivingWrapService: number
  manHour: number
  extraCharge: number
  chargesFees: ChargesFees
  shipName: string
  shipStreet: string
  shipCity: string
  shipState: string
  shipZipcode: string
  shipCountry: string
  subtotal: number
  salesShipping: number
  salesTax: number
  discount: number
  orderTotal: number
  orderPaid: number
  orderShipping: number
  carrierService: string
  carrierUsed: string
  carrierType: string
  carrierStatus?: string
  carrierShipping: number
  onixShipping: number
  storeId: string
  channelName: string
  storeName: string
  channelLogo: string
  orderItems: ShipmentOrderItem[]
  totalItems: number
  numberPallets: number
  numberBoxes: number
  shrinkWrap: number
  manHours: number
  manualChanges: boolean
  manualChangesShipping: boolean
  invoiced: boolean
  proofOfShipped: string
  totalCharge: number
  totalReceivedItems?: number
  isThird: boolean
  thirdInfo: string
  labelsName: string
  palletLabelsName?: string
  hasReturn: boolean
  returns: string[]
  returnRMA?: string
  returnId: number
  returnState?: 'pending' | 'complete' | 'partial refund' | 'refund' | 'cancelled' | 'on hold'
  returnOrigin?: 'shipment' | 'return'
  extraComment: string
  individualUnitsPlan?: IndividualUnitsPlan
  isIndividualUnits?: boolean
  totalIndividualUnits?: number
  isReceivingFromPo?: boolean
}

export interface ShipmentOrderItem {
  sku: string
  upc: string
  name: string
  isKit: boolean
  title: string
  children: KitChildren[]
  quantity: number
  productId: string
  unitPrice: number
  businessId: number
  orderItemId: string
  fulfillmentSku: string
  warehouseLocation: string
  poNumber?: string
  qtyReceived?: number
  state?: string
}

export interface KitChildren {
  sku: string
  name: string
  title: string
  quantity: number
  businessId: number
  fulfillmentSku: string
  orderChildrenId: string
  warehouseLocation: string
}

interface Plan {
  items: {
    sku: string
    name: string
    image: string
    cartons: {
      boxId: number
      qtyInBox: number
    }[]
    qtyToShip: number
  }[]
  cartons: {
    box: {
      width: number
      height: number
      length: number
      weight: number
    }
    skus: {
      sku: string
      qtyInBox: number
    }[]
    boxId: number
  }[]
}
interface IndividualUnitsPlan {
  plan: Plan
  state: string
}

interface ChargesFees {
  orderCost?: number
  extraItemOrderCost?: number
  shippingPercentageCost?: number
  palletCost?: number
  labelCost?: number
  parcelBoxCost?: number
  '40HQ-FL'?: number
  '40HQ-P'?: number
  '20HQ-FL'?: number
  '20HQ-P'?: number
  receivingPallets?: number
  receivingManHour?: number
  receivingPalletCost?: number
  receivingWrapService?: number
  minQtyForIndividualUnitsOrder?: number
  individualUnitCost?: number
}
