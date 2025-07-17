export interface CreateReceivingItems {
  [poId: string]: CreateReceivingPO
}

export interface CreateReceivingPO {
  [inventoryId: string]: CreateReceivingItem
}

export interface CreateReceivingItem {
  poId: number
  orderNumber: string
  inventoryId: number
  sku: string
  title: string
  image: string
  businessId: number
  suppliersName: string
  receivingQty: number
  hasSplitting: boolean
  splitId: number | undefined
  boxQty: number
}
