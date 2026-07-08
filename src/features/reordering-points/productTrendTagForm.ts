export const PRODUCT_TREND_OPTIONS = ['Normal', 'Low Sales', 'Seasonal'] as const

export type ProductTrendOption = (typeof PRODUCT_TREND_OPTIONS)[number]
