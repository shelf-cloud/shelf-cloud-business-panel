export interface MarketplaceFeesResponse {
    marketplaceFees: { [key: string]: MarketplaceFees }
    error?: string
    message?: string

}
export interface MarketplaceFees {
    name: string
    storeId: number
    storeName: string
    logoLink: string
    comissionFee: number
    fixedFee: number
    isCommerceHub: boolean
    payTerms: number
}