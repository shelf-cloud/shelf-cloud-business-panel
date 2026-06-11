import { AIForecastForProduct, ReorderingPointsProduct } from '@typesTs/reorderingPoints/reorderingPoints'

const FORECAST_MONTH_DAYS = 30
const MEDIUM_URGENCY_BUFFER_DAYS = 30

export type AIForecastUrgencyResult = {
  urgency: 1 | 2 | 3
  urgencyTag: 'low' | 'medium' | 'high'
  remainingDays: number
  color: 'text-info' | 'text-warning' | 'text-danger'
}

const buildUrgencyResult = (remainingDays: number, leadTime: number): AIForecastUrgencyResult => {
  if (remainingDays < leadTime) {
    return {
      urgency: 3,
      urgencyTag: 'high',
      remainingDays,
      color: 'text-danger',
    }
  }

  if (remainingDays <= leadTime + MEDIUM_URGENCY_BUFFER_DAYS) {
    return {
      urgency: 2,
      urgencyTag: 'medium',
      remainingDays,
      color: 'text-warning',
    }
  }

  return {
    urgency: 1,
    urgencyTag: 'low',
    remainingDays,
    color: 'text-info',
  }
}

export const getAIForecastTotal = (aiForecast?: AIForecastForProduct | null) => {
  if (!Array.isArray(aiForecast?.forecast)) {
    return 0
  }

  return aiForecast.forecast.reduce((total, value) => total + Math.max(0, Number(value) || 0), 0)
}

export const getCurrentAIForecastStock = (product: ReorderingPointsProduct) => {
  return Math.max(
    0,
    product.warehouseQty +
      product.productionQty +
      product.receiving +
      product.fbaQty +
      product.fbaInboundQty +
      product.fbaProduction +
      product.awdQty +
      product.awdInboundQty +
      product.awdProduction
  )
}

export const getAIForecastUrgency = ({
  currentStock,
  leadTime,
  aiForecast,
}: {
  currentStock: number
  leadTime: number
  aiForecast?: AIForecastForProduct | null
}): AIForecastUrgencyResult => {
  const normalizedLeadTime = Math.max(0, Number(leadTime) || 0)
  const normalizedStock = Math.max(0, Number(currentStock) || 0)
  const forecast = Array.isArray(aiForecast?.forecast) ? aiForecast.forecast.map((value) => Math.max(0, Number(value) || 0)) : []

  if (normalizedStock <= 0) {
    return buildUrgencyResult(0, normalizedLeadTime)
  }

  if (forecast.length === 0 || forecast.every((value) => value === 0)) {
    return buildUrgencyResult(Math.max(FORECAST_MONTH_DAYS * 6, normalizedLeadTime + MEDIUM_URGENCY_BUFFER_DAYS + 1), normalizedLeadTime)
  }

  let remainingStock = normalizedStock
  let elapsedDays = 0
  let lastPositiveMonthlyForecast = 0

  for (const monthlyForecast of forecast) {
    if (monthlyForecast <= 0) {
      elapsedDays += FORECAST_MONTH_DAYS
      continue
    }

    lastPositiveMonthlyForecast = monthlyForecast
    const dailyForecast = monthlyForecast / FORECAST_MONTH_DAYS
    const daysUntilStockout = remainingStock / dailyForecast

    if (daysUntilStockout <= FORECAST_MONTH_DAYS) {
      return buildUrgencyResult(Math.max(0, Math.ceil(elapsedDays + daysUntilStockout)), normalizedLeadTime)
    }

    remainingStock -= monthlyForecast
    elapsedDays += FORECAST_MONTH_DAYS
  }

  const dailyForecast = lastPositiveMonthlyForecast / FORECAST_MONTH_DAYS
  const daysUntilStockout = remainingStock / dailyForecast

  if (Number.isFinite(daysUntilStockout)) {
    return buildUrgencyResult(Math.max(0, Math.ceil(elapsedDays + daysUntilStockout)), normalizedLeadTime)
  }

  return buildUrgencyResult(elapsedDays, normalizedLeadTime)
}

export const getProductAIForecastUrgency = (product: ReorderingPointsProduct) => {
  return getAIForecastUrgency({
    currentStock: getCurrentAIForecastStock(product),
    leadTime: product.leadTimeSC + product.daysOfStockSC,
    aiForecast: product.totalAIForecast_1,
  })
}
