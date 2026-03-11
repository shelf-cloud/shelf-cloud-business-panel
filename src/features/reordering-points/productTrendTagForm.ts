import * as Yup from 'yup'

export const PRODUCT_TREND_OPTIONS = ['Normal', 'Low Sales', 'Seasonal'] as const

export type ProductTrendOption = (typeof PRODUCT_TREND_OPTIONS)[number]

export const productTrendValueSchema = Yup.mixed<ProductTrendOption>()
  .oneOf([...PRODUCT_TREND_OPTIONS], 'Invalid trend')
  .required('Required')

export const productTrendFormSchema = Yup.object({
  bsnssTrend: productTrendValueSchema,
  useAITrend: Yup.boolean().required(),
})

export const bulkProductTrendFormSchema = Yup.object({
  bsnssTrend: productTrendValueSchema.required('Select a business trend'),
})
