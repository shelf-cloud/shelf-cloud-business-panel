export interface ProductsWidgetsResponse {
  totalQty: number
  totalSellerValue: number
  totalLandedValue: number
  inventoryTimeline: InventoryTimeline
}

export interface InventoryTimeline {
  dailyQty: number[]
  dailySellerValue: number[]
  dailyLandedValue: number[]
  dates: string[]
}

export interface FBAProductsWidgetResponse {
  totalQty: number
  totalSellerValue: number
  totalLandedValue: number
}
