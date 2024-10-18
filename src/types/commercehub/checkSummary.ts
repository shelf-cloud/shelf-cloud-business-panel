export interface CheckSummaryResponse {
    offset: string
    search: string | null
    checks: CheckSummaryType[]
}

export interface CheckSummaryType {
    storeId: number
    checkDate: string
    invoiceTotal: number
    checkTotal: number
    deductions: number
    cashDiscountTotal: number
    checkNumber: string
    storeName: string
    channelLogo: string
    payterms: number
}