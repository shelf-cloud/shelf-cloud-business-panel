import assert from 'node:assert/strict'

import { getAIForecastUrgency } from './getAIForecastUrgency'

const thresholds = {
  highAlertMax: 20,
  mediumAlertMax: 30,
  lowAlertMax: 45,
}

const forecast = {
  model: 'test',
  analysis: 'test forecast',
  forecast: [30, 30, 30, 30, 30, 30],
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
    remainingDays: 180,
    daysToOrder: 110,
    color: 'text-success',
  }
)
