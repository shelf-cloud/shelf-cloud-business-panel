export interface CheckSummaryResponse {
    error: boolean
    message: string
    offset: string
    search: string | null
    checks: CheckSummaryType[]
}

export interface CheckSummaryType {
    storeId: number
    checkDate: string
    orderTotal: number
    checkTotal: number
    deductions: number
    charges: number
    checkNumber: string
    storeName: string
    channelLogo: string
    payterms: number
}