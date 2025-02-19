export interface AmazonFulfillmentSku {
  id: number
  businessUniqId: string
  isKit: boolean
  sku: string
  msku: string
  fnsku: string
  asin: string
  product_name: string
  title: string
  condition: string
  price: number
  mfn_listing_exists: number
  mfn_fulfillable_quantity: number
  afn_listing_exists: number
  afn_warehouse_quantity: number
  afn_fulfillable_quantity: number
  afn_unsellable_quantity: number
  afn_reserved_quantity: number
  afn_total_quantity: number
  afn_inbound_working_quantity: number
  afn_inbound_shipped_quantity: number
  afn_inbound_receiving_quantity: number
  shelfcloud_sku: string
  shelfcloud_sku_id: number
  image: null | string
  brand: string | null
  show: number
  quantity: number
  reserved: number
  inventoryId: number
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
  amzDimensions: AmzDimensions | null
  showForMasterBoxes: boolean
  maxOrderQty: number
  orderQty: string
  totalSendToAmazon: number
  children?: Child[]
  recommendedReplenishmentQty: number
  recommendedShipDate: string
  recommendedAction: string
  totalDaysOfSupply: number
  salesLast30Days: number
  unitsSoldLast30Days: number
  expiration: string
  labelOwner: 'NONE' | 'SELLER' | 'AMAZON'
  prepOwner: 'NONE' | 'SELLER' | 'AMAZON'
  dimensions: {
    marketplaceId: string
    item: Dimensions
    package: Dimensions
  }
  hasError: boolean
  hasDimensionsError: boolean
  hasIndividualUnitsDimensionsError: boolean
  totalUnitsSold: { [key: string]: number }
  fbaShipments: FBAShipmentHisotry[]
}

type FBAShipmentHisotry = { id: string; shipmentId: string; status: string; createdAt: string; receivedQty: number; shipmentQty: number }

interface AmzDimensions {
  boxWidth: number
  boxHeight: number
  boxLength: number
  boxWeight: number
}

interface Dimensions {
  height: Dimension
  length: Dimension
  weight: Dimension
  width: Dimension
}

interface Dimension {
  unit: string
  value: number
}

export interface Child {
  qty: number
  sku: string
  title: string
  idInventory: number
  available: number
  maxKits: number
}

type FilterProps = {
  filters?: string
  urgency?: string
  grossmin?: string
  grossmax?: string
  profitmin?: string
  profitmax?: string
  unitsmin?: string
  unitsmax?: string
  supplier?: string
  brand?: string
  category?: string
  showHidden?: string
  show0Days?: string
  showNotEnough?: string
  ShowNoShipDate?: string
  masterBoxVisibility?: string
}

export interface AmazonMarketplace {
  marketplaceId: string
  countryCode: string
  marketplaceName: string
  currency: string
}
