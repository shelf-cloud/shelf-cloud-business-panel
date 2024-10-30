export interface MarketplaceFeesResponse {
    marketplaceFees: { [key: string]: MarketplaceFees }
    error?: string
    message?: string

}
export interface MarketplaceFees {
    name: string
    alias: string | null
    storeId: number
    storeName: string
    logoLink: string
    aliasLogo: string | null
    comissionFee: number
    fixedFee: number
    isCommerceHub: boolean
    payTerms: number
}