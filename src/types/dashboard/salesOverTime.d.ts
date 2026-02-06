export interface SalesOverTimeResponse {
  orders: { [key: string]: { [key: string]: number } }
  marketplaces: { [key: string]: SalesOverTimeMarketplace }
}

export interface SalesOverTimeMarketplace {
  name: string
  storeId: number | string
  salesOverTime: { [key: string]: number }
}
