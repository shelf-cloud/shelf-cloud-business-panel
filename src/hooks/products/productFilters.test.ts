import type { Product } from '@typings'
import assert from 'node:assert/strict'

import { filterProducts, getProductsForStateChange } from './productFilters'

const makeProduct = (overrides: Partial<Product>): Product =>
  ({
    inventoryId: 1,
    businessId: 1,
    business: 'ShelfCloud',
    image: '',
    title: 'Default Product',
    barcode: '',
    sku: 'DEFAULT',
    note: '',
    asin: '',
    fnSku: '',
    quantity: 0,
    reserved: 0,
    weight: 0,
    length: 0,
    width: 0,
    height: 0,
    boxQty: 0,
    boxWeight: 0,
    boxLength: 0,
    boxWidth: 0,
    boxHeight: 0,
    activeState: true,
    htsCode: '',
    description: '',
    brand: 'Acme',
    category: 'Gadgets',
    defaultPrice: 0,
    msrp: 0,
    map: 0,
    floor: 0,
    ceilling: 0,
    supplier: 'Main Supplier',
    sellerCost: 0,
    inboundShippingCost: 0,
    otherCosts: 0,
    productionTime: 0,
    transitTime: 0,
    recommendedDaysOfStock: 0,
    shippingToFBA: 0,
    buffer: 0,
    itemCondition: 'New',
    identifiers: null,
    ...overrides,
  }) as Product

const products = [
  makeProduct({ inventoryId: 1, title: 'Wireless Charger', sku: 'CHARGE-1', activeState: true, quantity: 0 }),
  makeProduct({ inventoryId: 2, title: 'Phone Case', sku: 'CASE-1', activeState: true, quantity: 4, brand: 'Other' }),
  makeProduct({ inventoryId: 3, title: 'Inactive Cable', sku: 'CABLE-1', activeState: false, quantity: 12, supplier: 'Backup Supplier' }),
]

assert.deepEqual(
  filterProducts(products, {
    searchValue: '',
    brand: 'All',
    supplier: 'All',
    category: 'All',
    condition: 'All',
    status: 'Inactive',
  }).map((product) => product.sku),
  ['CABLE-1']
)

assert.deepEqual(
  filterProducts(products, {
    searchValue: 'wire charge',
    brand: 'Acme',
    supplier: 'All',
    category: 'All',
    condition: 'All',
    status: 'Active',
  }).map((product) => product.sku),
  ['CHARGE-1']
)

assert.deepEqual(
  getProductsForStateChange(products, 0).map((product) => product.sku),
  ['CHARGE-1']
)

assert.deepEqual(
  getProductsForStateChange(products, 1).map((product) => product.sku),
  ['CABLE-1']
)
