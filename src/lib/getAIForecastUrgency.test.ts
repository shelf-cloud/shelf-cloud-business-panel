import type { ReorderingPointsProduct } from '@typesTs/reorderingPoints/reorderingPoints'
import assert from 'node:assert/strict'

import { getAIForecastDemandBetweenDays, getAIForecastUrgency, getProductAIForecastCoverageQty } from './getAIForecastUrgency'

const thresholds = {
  highAlertMax: 20,
  mediumAlertMax: 30,
  lowAlertMax: 45,
}

const forecast = {
  model: 'test',
  analysis: 'test forecast',
  forecast: [30, 30, 30, 30, 30, 30, 30, 30, 30],
}

assert.deepEqual(
  getAIForecastUrgency({
    currentStock: 100,
    leadTime: 70,
    aiForecast: forecast,
    thresholds,
  }),
  {
    urgency: 2,
    urgencyTag: 'medium',
    remainingDays: 100,
    daysToOrder: 30,
    color: 'text-warning',
  }
)

assert.equal(getAIForecastDemandBetweenDays([10, 20, 30], 15, 30), 15)
assert.equal(getAIForecastDemandBetweenDays([10, 20, 30], 60, 60), 30)

const createCoverageProduct = (overrides: Partial<ReorderingPointsProduct> = {}): ReorderingPointsProduct =>
  ({
    warehouseQty: 0,
    productionQty: 0,
    receiving: 0,
    fbaQty: 0,
    fbaInboundQty: 0,
    fbaProduction: 0,
    awdQty: 0,
    awdInboundQty: 0,
    awdProduction: 0,
    leadTimeSC: 180,
    orderFrequency: 4,
    daysOfStockSC: 30,
    totalAIForecast_1: {
      model: 'test',
      analysis: 'test forecast',
      forecast: [10, 20, 30, 40, 50, 60, 70, 80, 90],
    },
    ...overrides,
  }) as ReorderingPointsProduct

assert.equal(getProductAIForecastCoverageQty(createCoverageProduct()), 355)
assert.equal(getProductAIForecastCoverageQty(createCoverageProduct({ warehouseQty: 50 })), 305)
assert.equal(getProductAIForecastCoverageQty(createCoverageProduct({ warehouseQty: 300 })), 55)
assert.equal(getProductAIForecastCoverageQty(createCoverageProduct({ totalAIForecast_1: { ...forecast, forecast: [30, 30, 30] } })), 90)
assert.equal(
  getProductAIForecastCoverageQty(
    createCoverageProduct({
      warehouseQty: 7,
      leadTimeSC: 104,
      orderFrequency: 4,
      daysOfStockSC: 30,
      totalAIForecast_1: { ...forecast, forecast: [30, 30, 30, 30, 30, 30, 30, 30, 30] },
    })
  ),
  155
)
assert.equal(
  getProductAIForecastCoverageQty(
    createCoverageProduct({
      warehouseQty: 7,
      leadTimeSC: 104,
      orderFrequency: 12,
      daysOfStockSC: 30,
      totalAIForecast_1: { ...forecast, forecast: [30, 30, 30, 30, 30, 30, 30, 30, 30] },
    })
  ),
  211
)

assert.deepEqual(
  getAIForecastUrgency({
    currentStock: 40,
    leadTime: 70,
    aiForecast: forecast,
    thresholds,
  }),
  {
    urgency: 3,
    urgencyTag: 'high',
    remainingDays: 40,
    daysToOrder: -30,
    color: 'text-danger',
  }
)

assert.equal(getAIForecastUrgency({ currentStock: 90, leadTime: 70, aiForecast: forecast, thresholds }).urgencyTag, 'high')
assert.equal(getAIForecastUrgency({ currentStock: 100, leadTime: 70, aiForecast: forecast, thresholds }).urgencyTag, 'medium')
assert.equal(getAIForecastUrgency({ currentStock: 115, leadTime: 70, aiForecast: forecast, thresholds }).urgencyTag, 'low')
assert.equal(getAIForecastUrgency({ currentStock: 116, leadTime: 70, aiForecast: forecast, thresholds }).urgencyTag, 'none')

assert.deepEqual(
  getAIForecastUrgency({
    currentStock: 0,
    leadTime: 70,
    aiForecast: forecast,
    thresholds,
  }),
  {
    urgency: 3,
    urgencyTag: 'high',
    remainingDays: 0,
    daysToOrder: -70,
    color: 'text-danger',
  }
)

assert.deepEqual(
  getAIForecastUrgency({
    currentStock: 10,
    leadTime: 70,
    aiForecast: { ...forecast, forecast: [] },
    thresholds,
  }),
  {
    urgency: 0,
    urgencyTag: 'none',
    remainingDays: 270,
    daysToOrder: 200,
    color: 'text-success',
  }
)

assert.deepEqual(
  getAIForecastUrgency({
    currentStock: 210,
    leadTime: 70,
    aiForecast: forecast,
    thresholds,
  }),
  {
    urgency: 0,
    urgencyTag: 'none',
    remainingDays: 210,
    daysToOrder: 140,
    color: 'text-success',
  }
)
