import { Listing } from '@typesTs/amazon/listings'

export interface MKP_Response {
  [sku: string]: MKP_Product
}

export interface MKP_Product {
  inventoryId: number
  business: string
  image: string
  title: string
  barcode: string
  sku: string
  asin: string
  fnSku: string
  brand: string
  category: string
  supplier: string
  marketplaces: { [storeId: string]: MKP_Marketplaces }
  sellerCost: number
  inboundShippingCost: number
  otherCosts: number
  shippingToFBA: number
  listings: Listing[]
}

export interface MKP_Marketplaces {
  name: string
  storeId: number
  comissionFee: number
  fixedFee: number
  logo: string
  shippingToMarketpalce: number
  storeOtherCosts: number
  notes: string
  currency: string
  actualPrice: number
  totalFees: number
  proposedPrice: number
  proposedMargin: number
  fbaHandlingFee: number
  unitsSold: MKP_Marketplaces_UnitsSold
}

export interface MKP_Marketplaces_UnitsSold {
  '1M': number
  '1Y': number
}

export interface MKP_Product_Table {
  inventoryId: number
  business: string
  image: string
  title: string
  barcode: string
  sku: string
  asin: string
  fnSku: string
  brand: string
  category: string
  supplier: string
  sellerCost: number
  inboundShippingCost: number
  otherCosts: number
  shippingToFBA: number
  listings: any
  name: string
  storeId: number
  comissionFee: number
  fixedFee: number
  logo: string
  shippingToMarketpalce: number
  storeOtherCosts: number
  notes: string
  currency: string
  actualPrice: number
  totalFees: number
  proposedPrice: number
  proposedMargin: number
  fbaHandlingFee: number
  unitsSold: MKP_Marketplaces_UnitsSold
}
