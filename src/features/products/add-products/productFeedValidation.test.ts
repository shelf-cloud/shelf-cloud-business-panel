import assert from 'node:assert/strict'

import {
  PRODUCT_FEED_DEFINITIONS,
  normalizeIdentifierType,
  parseProductFeedRows,
  validateProductFeedRows,
} from './productFeedDefinitions'

assert.deepEqual(validateProductFeedRows('identifiers', [['Sku', 'Identifier Type', 'Identifier Value']]), [
  { errorLine: 0, errorMessage: 'No product Information', value: 'No Data Found' },
])

assert.deepEqual(validateProductFeedRows('identifiers', [['Sku', 'Identifier Type'], ['SKU-1', 'EAN']]), [
  {
    errorLine: 1,
    errorMessage: 'Products Identifiers columns do not match. Expected: Sku, Identifier Type, Identifier Value',
    value: 'Sku, Identifier Type',
  },
])

assert.deepEqual(validateProductFeedRows('identifiers', [[...PRODUCT_FEED_DEFINITIONS.identifiers.headers], ['SKU-1', 'UPC', '123']]), [
  { errorLine: 2, errorMessage: 'Identifier Type: Valid values: EAN, Barcode, Walmart Code, FBA, Other', value: 'UPC' },
])

assert.equal(normalizeIdentifierType('Walmart Code'), 'WalmartCode')

assert.deepEqual(parseProductFeedRows('identifiers', [[...PRODUCT_FEED_DEFINITIONS.identifiers.headers], ['SKU-1', 'Walmart Code', 'WM-123']]), [
  { sku: 'SKU-1', type: 'WalmartCode', value: 'WM-123' },
])

assert.deepEqual(validateProductFeedRows('reorderingPoint', [[...PRODUCT_FEED_DEFINITIONS.reorderingPoint.headers], ['SKU-1', 'YES', '2', '30', '45', '10']]), [
  { errorLine: 2, errorMessage: 'isActive: Valid values: TRUE or FALSE', value: 'YES' },
])

assert.deepEqual(validateProductFeedRows('reorderingPoint', [[...PRODUCT_FEED_DEFINITIONS.reorderingPoint.headers], ['SKU-1', 'TRUE', '-1', '30', '45', '10']]), [
  { errorLine: 2, errorMessage: 'orderFrequency: Required - Greater or Equal than 0', value: '-1' },
])

assert.deepEqual(parseProductFeedRows('reorderingPoint', [[...PRODUCT_FEED_DEFINITIONS.reorderingPoint.headers], ['SKU-1', 'TRUE', '2', '30', '45', '10']]), [
  {
    sku: 'SKU-1',
    isActive: true,
    orderFrequency: 2,
    leadTimeSC: 30,
    daysOfStockSC: 45,
    manualLeadTime: 10,
  },
])
