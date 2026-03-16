import { z } from 'zod'

import { ReorderingPointsForecastProducts, Urgency } from '@/types/reorderingPoints/reorderingPoints'

export type ReorderInput = {
  forecastingMethod: string
  sku: string
  title: string
  asin?: string
  unitsPerCase: number
  sellerCost: number

  leadTimeDaysFromSellerToWarehouse: number
  warehouseTargetDaysAfterLeadTime: number
  leadTimeDaysFromWarehouseToFBA: number
  leadTimeDaysFromSellerToFBA: number
  fbaTargetDaysAfterLeadTime: number
  leadTimeDaysFromSellerToAWD: number
  awdTargetDaysAfterLeadTime: number

  purchaseOrders: {
    ToWarehouse: Array<{
      OrderDate: string
      quantity: number
    }>
    ToFBA: Array<{
      OrderDate: string
      quantity: number
    }>
  }

  inventory: {
    warehouseQty: number
    warehouseInboundQty: number
    warehouseProductionQty: number
    fbaQty: number
    fbaInboundQty: number
    fbaProductionQty: number
    awdQty: number
    awdInboundQty: number
    awdProductionQty: number
  }

  totalsSales: {
    last30days: number
    last60days: number
    last90days: number
    last120days: number
    last180days: number
    last365days: number
  }

  monthly: Array<{
    month: string // YYYY-MM
    warehouseSoldUnits: number
    warehouseDaysWithStock: number
    warehouseOrders: number
    fbaSoldUnits: number
    fbaDaysWithStock: number
    fbaOrders: number
  }>

  urgencyThresholds: {
    high: number
    medium: number
    low: number
  }
}

export const ReorderOutputSchema = z.object({
  analysis: z.string().min(1),
  quantityToOrder: z.number().int().nonnegative(),
  daysUntilNextOrder: z.number().int().nonnegative(),
  recommendedOrderDate: z.string(),
  urgencyTag: z.enum(['High', 'Medium', 'Low']),
  stockoutRiskDate: z.string().nullable(),
  notes: z.string(),
})

export type ReorderOutput = z.infer<typeof ReorderOutputSchema>

export type AIModelForecastResult = {
  error: boolean
  analysis?: ReorderOutput
  message?: string
}

export const ProductTrendOutputSchema = z.object({
  analysis: z.string().min(1),
  method: z.enum(['Normal', 'Low Sales']),
})

export type ProductTrendOutput = z.infer<typeof ProductTrendOutputSchema>

export type AIModelProductTrendResult = {
  error: boolean
  trend?: ProductTrendOutput
  message?: string
}

export type ReorderingPointsProductsPreparedResults = { error: boolean; data: ReorderingPointsForecastProducts; urgencyThresholds: Urgency }
