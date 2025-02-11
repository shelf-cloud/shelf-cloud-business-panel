export interface StorageDetialsResponse {
  error: boolean
  message: string
  products: { [inventoryId: string]: StorageProduct }
  isValidating: boolean
}

export interface StorageProduct {
  sku: string
  title: string
  image: string
  storageFee: number
}
