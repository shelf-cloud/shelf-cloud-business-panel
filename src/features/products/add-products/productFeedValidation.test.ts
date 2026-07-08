import assert from 'node:assert/strict'

import { PRODUCT_FEED_DEFINITIONS, normalizeIdentifierType, parseProductFeedRows, validateProductFeedRows } from './productFeedDefinitions'

const REORDERING_POINT_HEADERS = ['Sku', 'Is Active in Reordering Points', 'Order Frequency (Weeks)', 'Lead Time (Days)', 'Days Of Stock After Lead Time (Days)', 'Manual Lead Time']
const DIMENSIONS_HEADERS = [
  'Sku',
  'Unit Weight',
  'Unit Length',
  'Unit Width',
  'Unit Height',
  'Carton Box Quantity',
  'Carton Box Weight',
  'Carton Box Length',
  'Carton Box Width',
  'Carton Box Height',
]

assert.deepEqual(validateProductFeedRows('identifiers', [['Sku', 'Identifier Type', 'Identifier Value']]), [
  { errorLine: 0, errorMessage: 'No product Information', value: 'No Data Found' },
])

assert.deepEqual(
  validateProductFeedRows('identifiers', [
    ['Sku', 'Identifier Type'],
    ['SKU-1', 'EAN'],
  ]),
  [
    {
      errorLine: 1,
      errorMessage: 'Products Identifiers columns do not match. Expected: Sku, Identifier Type, Identifier Value',
      value: 'Sku, Identifier Type',
    },
  ]
)

assert.deepEqual(validateProductFeedRows('identifiers', [[...PRODUCT_FEED_DEFINITIONS.identifiers.headers], ['SKU-1', 'UPC', '123']]), [
  { errorLine: 2, errorMessage: 'Identifier Type: Valid values: EAN, Barcode, Walmart Code, FBA, Other', value: 'UPC' },
])

assert.equal(normalizeIdentifierType('Walmart Code'), 'WalmartCode')

assert.deepEqual(parseProductFeedRows('identifiers', [[...PRODUCT_FEED_DEFINITIONS.identifiers.headers], ['SKU-1', 'Walmart Code', 'WM-123']]), [
  { sku: 'SKU-1', identifiers: [{ type: 'WalmartCode', value: 'WM-123' }] },
])

assert.deepEqual(
  parseProductFeedRows('identifiers', [
    [...PRODUCT_FEED_DEFINITIONS.identifiers.headers],
    ['SKU-1', 'EAN', '1234567890123'],
    ['SKU-2', 'Barcode', '111222333'],
    ['SKU-1', 'FBA', 'X001ABC'],
  ]),
  [
    {
      sku: 'SKU-1',
      identifiers: [
        { type: 'EAN', value: '1234567890123' },
        { type: 'FBA', value: 'X001ABC' },
      ],
    },
    { sku: 'SKU-2', identifiers: [{ type: 'Barcode', value: '111222333' }] },
  ]
)

assert.deepEqual(validateProductFeedRows('reorderingPoint', [REORDERING_POINT_HEADERS, ['SKU-1', 'TRUE', '2', '30', '45', 'FALSE']]), [])

assert.deepEqual(validateProductFeedRows('reorderingPoint', [REORDERING_POINT_HEADERS, ['SKU-1', 'YES', '2', '30', '45', 'TRUE']]), [
  { errorLine: 2, errorMessage: 'isActive: Valid values: TRUE or FALSE', value: 'YES' },
])

assert.deepEqual(validateProductFeedRows('reorderingPoint', [REORDERING_POINT_HEADERS, ['SKU-1', 'TRUE', '-1', '30', '45', 'TRUE']]), [
  { errorLine: 2, errorMessage: 'orderFrequency: Required - Greater or Equal than 0', value: '-1' },
])

assert.deepEqual(validateProductFeedRows('reorderingPoint', [REORDERING_POINT_HEADERS, ['SKU-1', 'TRUE', '2', '30', '45', '10']]), [
  { errorLine: 2, errorMessage: 'manualLeadTime: Valid values: TRUE or FALSE', value: '10' },
])

assert.deepEqual(parseProductFeedRows('reorderingPoint', [REORDERING_POINT_HEADERS, ['SKU-1', 'TRUE', '2', '30', '45', 'FALSE']]), [
  {
    sku: 'SKU-1',
    isActive: true,
    orderFrequency: 2,
    leadTimeSC: 30,
    daysOfStockSC: 45,
    manualLeadTime: false,
  },
])

assert.deepEqual(validateProductFeedRows('dimensions', [DIMENSIONS_HEADERS, ['SKU-1', '1.5', '2', '3', '4', '5', '6', '7', '8', '9']]), [])

assert.deepEqual(validateProductFeedRows('dimensions', [DIMENSIONS_HEADERS, ['SKU-1', '0', '2', '3', '4', '5', '6', '7', '8', '9']]), [
  { errorLine: 2, errorMessage: 'weight: Required - Greater than 0', value: '0' },
])

assert.deepEqual(validateProductFeedRows('dimensions', [DIMENSIONS_HEADERS, ['SKU-1', '1', '2', '3', '4', '5.5', '6', '7', '8', '9']]), [
  { errorLine: 2, errorMessage: 'boxQty: Required - Integer - Greater than 0', value: '5.5' },
])

assert.deepEqual(parseProductFeedRows('dimensions', [DIMENSIONS_HEADERS, ['SKU-1', '1.5', '2', '3', '4', '5', '6', '7', '8', '9']]), [
  {
    sku: 'SKU-1',
    weight: 1.5,
    length: 2,
    width: 3,
    height: 4,
    boxQty: 5,
    boxWeight: 6,
    boxLength: 7,
    boxWidth: 8,
    boxHeight: 9,
  },
])
