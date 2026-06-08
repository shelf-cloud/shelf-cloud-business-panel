import assert from 'node:assert/strict'

import { buildCreateReportRequest, getSelectedReportProducts, parseSelectedProductIds } from '../../features/reports/reportHelpers'

const products = [
  { inventoryId: 10, sku: 'SKU-10' },
  { inventoryId: 20, sku: 'SKU-20' },
  { inventoryId: 30, sku: 'SKU-30' },
]

assert.deepEqual(parseSelectedProductIds('[10,"20","bad"]'), [10, 20])
assert.deepEqual(parseSelectedProductIds('not-json'), [])

assert.deepEqual(getSelectedReportProducts(products, '[20,10]'), [
  { id: 10, sku: 'SKU-10' },
  { id: 20, sku: 'SKU-20' },
])

assert.deepEqual(
  buildCreateReportRequest({
    baseUrl: 'https://server.test',
    reportType: 'productsReport',
    region: 'us',
    businessId: '55',
    businessName: 'Simplex 90 & Co',
    startDate: '2026-01-01',
    endDate: '2026-01-31',
    products: [{ id: 10, sku: 'SKU-10' }],
  }),
  {
    url: 'https://server.test/api/reports/createReport/productsReport?region=us&businessId=55',
    body: {
      businessName: 'Simplex 90 & Co',
      startDate: '2026-01-01',
      endDate: '2026-01-31',
      products: [{ id: 10, sku: 'SKU-10' }],
    },
  }
)

assert.deepEqual(
  buildCreateReportRequest({
    baseUrl: 'https://server.test',
    reportType: 'shipmentsReport',
    region: 'eu',
    businessId: '77',
    businessName: 'Simplex 90 & Co',
    startDate: '2026-02-01',
    endDate: '2026-02-28',
    products: [],
  }),
  {
    url: 'https://server.test/api/reports/createReport/shipmentsReport?region=eu&businessId=77&businessName=Simplex+90+%26+Co&startDate=2026-02-01&endDate=2026-02-28',
    body: {},
  }
)
