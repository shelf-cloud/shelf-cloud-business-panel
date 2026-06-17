import type { AIForecastForProduct, ReorderingPointsProduct } from '@typesTs/reorderingPoints/reorderingPoints'

const FORECAST_MONTH_DAYS = 30

const DEFAULT_URGENCY_THRESHOLDS = {
  highAlertMax: 20,
  mediumAlertMax: 30,
  lowAlertMax: 45,
}

export type AIForecastUrgencyResult = {
  urgency: 0 | 1 | 2 | 3
  urgencyTag: 'none' | 'low' | 'medium' | 'high'
  remainingDays: number
  daysToOrder: number
  color: 'text-success' | 'text-info' | 'text-warning' | 'text-danger'
}

export type AIForecastUrgencyThresholds = {
  highAlertMax?: number
  mediumAlertMax?: number
  lowAlertMax?: number
}

const normalizeThresholdValue = (value: number | undefined, fallback: number) => {
  const normalizedValue = Number(value ?? fallback)
  return Number.isFinite(normalizedValue) ? Math.max(0, normalizedValue) : fallback
}

const normalizeUrgencyThresholds = (thresholds?: AIForecastUrgencyThresholds | null) => ({
  highAlertMax: normalizeThresholdValue(thresholds?.highAlertMax, DEFAULT_URGENCY_THRESHOLDS.highAlertMax),
  mediumAlertMax: normalizeThresholdValue(thresholds?.mediumAlertMax, DEFAULT_URGENCY_THRESHOLDS.mediumAlertMax),
  lowAlertMax: normalizeThresholdValue(thresholds?.lowAlertMax, DEFAULT_URGENCY_THRESHOLDS.lowAlertMax),
})

const buildUrgencyResult = (forecast: number, remainingDays: number, leadTime: number, thresholds?: AIForecastUrgencyThresholds | null): AIForecastUrgencyResult => {
  const normalizedThresholds = normalizeUrgencyThresholds(thresholds)
  const daysToOrder = remainingDays - leadTime

  if (forecast <= 0) {
    return {
      urgency: 0,
      urgencyTag: 'none',
      remainingDays,
      daysToOrder,
      color: 'text-success',
    }
  }

  if (daysToOrder <= normalizedThresholds.highAlertMax) {
    return {
      urgency: 3,
      urgencyTag: 'high',
      remainingDays,
      daysToOrder,
      color: 'text-danger',
    }
  }

  if (daysToOrder <= normalizedThresholds.mediumAlertMax) {
    return {
      urgency: 2,
      urgencyTag: 'medium',
      remainingDays,
      daysToOrder,
      color: 'text-warning',
    }
  }

  if (daysToOrder <= normalizedThresholds.lowAlertMax) {
    return {
      urgency: 1,
      urgencyTag: 'low',
      remainingDays,
      daysToOrder,
      color: 'text-info',
    }
  }

  return {
    urgency: 0,
    urgencyTag: 'none',
    remainingDays,
    daysToOrder,
    color: 'text-success',
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
  thresholds,
}: {
  currentStock: number
  leadTime: number
  aiForecast?: AIForecastForProduct | null
  thresholds?: AIForecastUrgencyThresholds | null
}): AIForecastUrgencyResult => {
  const normalizedLeadTime = Math.max(0, Number(leadTime) || 0)
  const normalizedStock = Math.max(0, Number(currentStock) || 0)
  const normalizedThresholds = normalizeUrgencyThresholds(thresholds)
  const forecast = Array.isArray(aiForecast?.forecast) ? aiForecast.forecast.map((value) => Math.max(0, Number(value) || 0)) : []
  const totalForecast = forecast.reduce((total, value) => total + value, 0)
  if (normalizedStock <= 0) {
    return buildUrgencyResult(totalForecast, 0, normalizedLeadTime, normalizedThresholds)
  }

  if (forecast.length === 0 || forecast.every((value) => value === 0)) {
    return buildUrgencyResult(totalForecast, Math.max(FORECAST_MONTH_DAYS * 6, normalizedLeadTime + normalizedThresholds.lowAlertMax + 1), normalizedLeadTime, normalizedThresholds)
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
      return buildUrgencyResult(totalForecast, Math.max(0, Math.ceil(elapsedDays + daysUntilStockout)), normalizedLeadTime, normalizedThresholds)
    }

    remainingStock -= monthlyForecast
    elapsedDays += FORECAST_MONTH_DAYS
  }

  const dailyForecast = lastPositiveMonthlyForecast / FORECAST_MONTH_DAYS
  const daysUntilStockout = remainingStock / dailyForecast

  if (Number.isFinite(daysUntilStockout)) {
    return buildUrgencyResult(totalForecast, Math.max(0, Math.ceil(elapsedDays + daysUntilStockout)), normalizedLeadTime, normalizedThresholds)
  }

  return buildUrgencyResult(totalForecast, elapsedDays, normalizedLeadTime, normalizedThresholds)
}

export const getProductAIForecastUrgency = (product: ReorderingPointsProduct, thresholds?: AIForecastUrgencyThresholds | null) => {
  return getAIForecastUrgency({
    currentStock: getCurrentAIForecastStock(product),
    leadTime: product.leadTimeSC + product.daysOfStockSC,
    aiForecast: product.totalAIForecast_1,
    thresholds,
  })
}
