import { AIForecastForProduct, ReorderingPointsMonthlyForecastValue, ReorderingPointsProduct, Urgency } from '@/types/reorderingPoints/reorderingPoints'

import { ReorderInput } from '../reordering-points/ai-schema'

export type ForecastChatModelNumber = 1 | 2 | 3

export type ForecastChatSelectedForecast = Pick<
  AIForecastForProduct,
  'model' | 'analysis' | 'forecast' | 'daysUntilNextOrder' | 'recommendedOrderDate' | 'urgencyTag' | 'stockoutRiskDate' | 'notes'
>

export type ForecastChatProductSnapshot = Pick<
  ReorderingPointsProduct,
  | 'inventoryId'
  | 'sku'
  | 'title'
  | 'asin'
  | 'boxQty'
  | 'sellerCost'
  | 'leadTimeSC'
  | 'leadTimeFBA'
  | 'leadTimeAWD'
  | 'daysOfStockSC'
  | 'daysOfStockFBA'
  | 'daysOfStockAWD'
  | 'warehouseQty'
  | 'productionQty'
  | 'receiving'
  | 'fbaQty'
  | 'fbaInboundQty'
  | 'awdQty'
  | 'awdInboundQty'
  | 'totalUnitsSold'
  | 'productTrendTag'
> & {
  monthlyForecast: { [year: string]: { [month: string]: ReorderingPointsMonthlyForecastValue } }
  warehousePODates: {
    warehouse: { [date: string]: number | null }
    fba: { [date: string]: number | null }
  }
}

export type ForecastChatUrgencyThresholds = Pick<Urgency, 'rpShowFBA' | 'rpShowAWD' | 'highAlertMax' | 'mediumAlertMax' | 'lowAlertMax'>

export type ForecastChatContext = {
  modelNumber: ForecastChatModelNumber
  selectedForecast: ForecastChatSelectedForecast
  product: ReorderInput
  urgencyThresholds: ForecastChatUrgencyThresholds
}

export type ForecastChatRequestMessage = {
  id: string
  role: 'assistant' | 'user'
  parts: Array<{
    type: 'text'
    text: string
  }>
}

export type ForecastChatRequestBody = {
  context: ForecastChatContext
  messages: ForecastChatRequestMessage[]
}
