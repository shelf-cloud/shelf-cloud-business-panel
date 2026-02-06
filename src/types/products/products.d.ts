export interface ProductsDetails {
  id: number
  inventoryId: number
  businessId: number
  isKit: boolean
  image: string
  title: string
  description: string
  brand: string
  category: string
  sku: string
  asin: string
  fnsku: string
  barcode: string
  weight: number
  length: number
  width: number
  height: number
  boxQty: number
  boxWeight: number
  boxLength: number
  boxWidth: number
  boxHeight: number
  activeState: boolean
  note: string
  htsCode: string
  defaultPrice: number
  msrp: number
  map: number
  floor: number
  ceilling: number
  supplier: string
  sellerCost: number
  inboundShippingCost: number
  otherCosts: number
  productionTime: number
  transitTime: number
  shippingToFBA: number
  buffer: number
  itemCondition: string
  identifiers: Identifier[] | null
}

export interface Identifier {
  type: string
  value: string
}
