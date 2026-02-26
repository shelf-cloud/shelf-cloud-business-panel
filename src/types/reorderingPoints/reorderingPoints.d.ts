export interface ReorderingPointsResponse {
  [key: string]: ReorderingPointsProduct
}

export interface ReorderingPointsProduct {
  inventoryId: number
  business: string
  image: string
  title: string
  barcode: string
  sku: string
  asin: string
  fnSku: string
  boxQty: number
  itemVolume: number
  itemBoxVolume: number
  buffer: number
  grossRevenue: number
  expenses: number
  storageCost: number
  unitsSold: number
  recommendedDaysOfStock: number
  daysOfStockSC: number
  daysOfStockFBA: number
  daysOfStockAWD: number
  hideReorderingPoints: boolean
  warehouseQty: number
  productionQty: number
  receiving: number
  fbaQty: number
  fbaInboundQty: number
  fbaProduction: number
  awdQty: number
  awdInboundQty: number
  awdProduction: number
  poDates: { [key: string]: number }
  sellerCost: number
  leadTime: number
  leadTimeSC: number
  leadTimeFBA: number
  leadTimeAWD: number
  note: string
  brand: string
  category: string
  supplier: string
  show: number
  daysRemaining: number
  daysToOrder: number
  urgency: number
  adjustedForecast: number
  variation: number
  order: number
  orderAdjusted: number
  useOrderAdjusted: boolean
  orderSplits: { [split: string]: { order: number; orderAdjusted: number } }
  marketplaces: { [key: string]: ReorderingPointsMarketplace }
  dateList: { [key: string]: DateList }
  totalUnitsSold: { [key: string]: number }
  forecastModel: string
  forecast: { [model: string]: { [date: string]: number } }
  dailyTotalForecast: { [key: string]: number }
  totalSCForecast: number
  totalFBAForecast: number
  totalAWDForecast: number
  monthlyForecast: { [year: string]: { [month: string]: { unitsSoldSC: number; daysWithStockSC: number; unitsSoldFBA: number; daysWithStockFBA: number } } }
  canSendToAWD: boolean
  totalAIForecast_1: { model: string; analysis: string; forecast: number }
  totalAIForecast_2: { model: string; analysis: string; forecast: number }
  comment?: string
}

export interface DateList {
  unitsSold: number
  dailyStock: number
  dailyStockFBA: number
}

export interface ReorderingPointsMarketplace {
  name: string
  storeId: number
  grossRevenue: number
  expenses: number
  totalUnitsSold: number
  unitsSold: { [key: string]: number }
}

export interface ReorderingPointsTimelineResponse {
  dateList: { [key: string]: DateList }
  error?: string
  message?: string
}

export interface ReorderingPointsSalesResponse {
  [key: string]: ReorderingPointsSales
  error?: string
  message?: string
}

export interface ReorderingPointsSales {
  inventoryId: number
  sku: string
  asin: string
  itemVolume: number | number
  grossRevenue: number
  expenses: number
  unitsSold: number
  sellingPrice: number | number
  reimbursementsOrders: any[]
  storageCost: number | number
  marketplaces: { [key: string]: RPSalesMarketplace }
  sellerCost: number | number
  inboundShippingCost: number
  otherCosts: number
  shippingToFBA: number
}

interface RPSalesMarketplace {
  name: string
  storeId: number
  grossRevenue: number
  expenses: number
  totalUnitsSold: number
  comissionFee: number
  fixedFee: number
}
