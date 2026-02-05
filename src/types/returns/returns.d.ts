export interface ReturnList {
  [key: string]: ReturnType
}

export interface ReturnType {
  shipmentOrderNumber: string
  totalOrderItems: number
  returns: { [key: string]: ReturnOrder }
}

export interface ReturnOrder {
  id: number
  businessId: number
  orderId: string
  orderNumber: string
  goFlowOrderId: number
  orderDate: string
  closedDate: string
  orderStatus: string
  orderType: string
  trackingNumber: string
  trackingLink: string
  carrierIcon: string
  pickpackCharge: number
  shippingCharge: number
  labeling: number
  receivingService: number
  receivingPallets: number
  receivingWrapService: number
  manHour: number
  extraCharge: number
  chargesFees: { [key: string]: number }
  shipName: string
  shipStreet: string
  shipCity: string
  shipState: string
  shipZipcode: string
  shipCountry: string
  orderTotal: number
  orderPaid: number
  orderShipping: number
  carrierService: string
  carrierUsed: string
  carrierType: string
  carrierShipping: number
  onixShipping: number
  storeId: number
  channelName: string
  storeName: string
  channelLogo: string
  orderItems: OrderItem[]
  totalItems: number
  totalReceivedItems: number
  numberPallets: number
  numberBoxes: number
  shrinkWrap: number
  manHours: number
  manualChanges: boolean
  manualChangesShipping: boolean
  invoiced: boolean
  proofOfShipped: null
  isThird: boolean
  thirdInfo: null
  labelsName: string
  palletLabelsName: string
  hasReturn: boolean
  returnId: number
  returnState: string
  returnOrigin: string
  returnRMA: string
  returnReason: null | string
  extraComment: string
  individualUnitsPlan: string
  isIndividualUnits: boolean
  totalIndividualUnits: number
  totalCharge: number
}

export interface OrderItem {
  sku: string
  upc: string
  state: string
  title?: string
  businessId: number
  inventoryId: number
  qtyReceived: number
  name?: string
  quantity: number
}
