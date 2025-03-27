export interface PoPaymentHistory {
  date: string
  amount: number
  comment?: string
}

export interface PoItemArrivalHistory {
  date: string
  receivingOrder: string
  quantity: number
}

export interface PurchaseOrderItem {
  sku: string
  orderQty: number
  inboundQty: number
  sellerCost: number
  inventoryId: number
  receivedQty: number
  receivingOrderQty: number
  arrivalHistory: PoItemArrivalHistory[]
  title: string
  asin: string
  barcode: string
  image: string
  note?: string
  boxQty?: number
  sellerCost?: number
  itemVolume: number
}

export interface PurchaseOrder {
  poId: number
  businessId: number
  suppliersId: number
  suppliersName: string
  orderNumber: string
  date: string
  isOpen: boolena
  note: string
  poPayments: PoPaymentHistory[]
  poItems: PurchaseOrderItem[]
  hasSplitting: boolean
  splits: { [splitId: string]: Split }
  destinationSC: boolean
  warehouseId: number
  warehouseName: string
  isSCDestination: boolean
}

export interface Split {
  items: PurchaseOrderItem[]
  splitId: number
  splitName: string
  destination: Destination
}

export interface Destination {
  id: number
  label: string
}

export interface PoItemForCreateReceiving {
  poId: number
  orderNumber: string
  inventoryId: number
  sku: string
  receivingQty: number
  title: string
  image: string
  businessId: string
  suppliersName: string
}

export interface PurchaseOrderBySuppliers {
  suppliersName: string
  orders: PurchaseOrder[]
}
export interface PurchaseOrderBySkus {
  sku: string
  inventoryId?: number
  title: string
  asin: string
  barcode: string
  image: string
  orders: PurchaseOrder[]
}

export interface SkuToAddPo {
  inventoryId: number
  businessId: number
  sellerCost: number
  image: string
  title: string
  barcode: string
  sku: string
  asin: string
  fnSku: string
}

export interface POBalanceResponse {
  balance: number
  po: PoBalance[]
}

export interface PoBalance {
  poId: number
  suppliersName: string
  orderNumber: string
  date: string
  totalOrderQty: number
  totalOrderValue: number
  totalArrivedQty: number
  totalArrivedQtyValue: number
  totalPendingQty: number
  totalPendingQtyValue: number
  pendingBalance: number
  balance: number
  totalPaid: number
}
