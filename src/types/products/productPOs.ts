import { PoItemArrivalHistory, PoPaymentHistory } from '@typesTs/purchaseOrders'

export interface ProductPO {
  poId: number
  businessId: number
  suppliersId: number
  suppliersName: string
  orderNumber: string
  date: string
  note: string
  poItems: PoItem[]
  poPayments: PoPaymentHistory[]
  destinationSC: number
}

export interface PoItem {
  sku: string
  orderQty: number
  inboundQty: number
  sellerCost: number
  inventoryId: number
  receivedQty: number
  arrivalHistory: PoItemArrivalHistory[]
}
