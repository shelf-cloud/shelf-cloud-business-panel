import type { Product } from '@typings'

export type ProductStatusFilter = 'All' | 'Active' | 'Inactive'
export type ProductStateValue = 0 | 1

export type ProductFilterOptions = {
  searchValue: string
  brand: string
  supplier: string
  category: string
  condition: string
  status: ProductStatusFilter
}

const normalize = (value?: string | number | boolean | null) =>
  String(value ?? '')
    .trim()
    .toLowerCase()

const matchesFilter = (value: string | undefined, filter: string) => filter === 'All' || normalize(value) === normalize(filter)

const matchesStatus = (product: Product, status: ProductStatusFilter) => {
  if (status === 'All') return true
  return status === 'Active' ? Boolean(product.activeState) : !product.activeState
}

const matchesSearch = (product: Product, searchValue: string) => {
  const normalizedSearch = normalize(searchValue)
  if (!normalizedSearch) return true

  const searchableValues = [product.title, product.sku, product.asin, product.fnSku, product.barcode].map(normalize)
  const searchWords = normalizedSearch.split(/\s+/).filter(Boolean)

  return searchableValues.some((value) => value.includes(normalizedSearch)) || searchWords.every((word) => normalize(product.title).includes(word))
}

export const filterProducts = (products: Product[], options: ProductFilterOptions) =>
  products.filter(
    (product) =>
      matchesFilter(product.brand, options.brand) &&
      matchesFilter(product.supplier, options.supplier) &&
      matchesFilter(product.category, options.category) &&
      matchesFilter(product.itemCondition, options.condition) &&
      matchesStatus(product, options.status) &&
      matchesSearch(product, options.searchValue)
  )

export const getProductsForStateChange = (products: Product[], newState: ProductStateValue) => {
  if (newState === 1) return products.filter((product) => !product.activeState)
  return products.filter((product) => product.activeState && Number(product.quantity) === 0)
}
