import { ProductPerformance } from '@typesTs/marketplaces/productPerformance'

type MarketplaceStoreId = number | string | null | undefined

export const isAllMarketplacesStore = (storeId: MarketplaceStoreId) => String(storeId) === '9999'

export const getProductNetExpenses = (product: ProductPerformance, selectedMarketplaceStoreId: MarketplaceStoreId) =>
  product.expenses + (isAllMarketplacesStore(selectedMarketplaceStoreId) ? product.storageCost : 0)

export const getProductNetProfit = (product: ProductPerformance, selectedMarketplaceStoreId: MarketplaceStoreId) =>
  product.grossRevenue - getProductNetExpenses(product, selectedMarketplaceStoreId)

export const getProductMargin = (product: ProductPerformance, selectedMarketplaceStoreId: MarketplaceStoreId) => {
  if (product.grossRevenue === 0) return 0

  return (getProductNetProfit(product, selectedMarketplaceStoreId) / product.grossRevenue) * 100
}

export const getProductRoi = (product: ProductPerformance, selectedMarketplaceStoreId: MarketplaceStoreId) => {
  const netExpenses = getProductNetExpenses(product, selectedMarketplaceStoreId)
  const investmentExpenses = netExpenses + product.reimbursements

  if (investmentExpenses <= 0) return null

  const roiProfit = product.grossRevenue - investmentExpenses

  return (roiProfit / investmentExpenses) * 100
}

export const getProductsTotalRoi = (products: ProductPerformance[], selectedMarketplaceStoreId: MarketplaceStoreId) => {
  const grossRevenue = products.reduce((total, product) => total + product.grossRevenue, 0)
  const investmentExpenses = products.reduce((total, product) => total + getProductNetExpenses(product, selectedMarketplaceStoreId) + product.reimbursements, 0)

  if (investmentExpenses <= 0) return null

  return ((grossRevenue - investmentExpenses) / investmentExpenses) * 100
}
