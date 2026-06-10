import { z } from 'zod'

const FORECAST_CHAT_MAX_MESSAGES_SCHEMA = 24

const textPartSchema = z.object({
  type: z.literal('text'),
  text: z.string().trim().min(1).max(4000),
})

const requestMessageSchema = z.object({
  id: z.string().min(1).max(200),
  role: z.enum(['assistant', 'user']),
  parts: z.array(textPartSchema).min(1).max(8),
})

const selectedForecastSchema = z.object({
  model: z.string().max(200),
  analysis: z.string().min(1).max(4000),
  forecast: z.array(z.number().int().min(0)).length(6),
})

const dailyProductDataEntrySchema = z.object({
  date: z.string().min(1).max(40),
  warehouseUnitsSold: z.number().finite().min(0),
  warehouseDailyStock: z.number().finite().min(0),
  warehouseOrders: z.number().finite().min(0),
  fbaUnitsSold: z.number().finite().min(0),
  fbaDailyStock: z.number().finite().min(0),
  fbaOrders: z.number().finite().min(0),
})

const reorderInputSchema = z.object({
  sku: z.string().min(1).max(200),
  title: z.string().min(1).max(1000),
  leadTimeDays: z.number().int().min(0),
  currentStock: z.number().finite().min(0),
  dailyData: z.array(dailyProductDataEntrySchema).nullable(),
})

const urgencyThresholdSchema = z.object({
  rpShowFBA: z.boolean(),
  rpShowAWD: z.boolean(),
  highAlertMax: z.number().int().min(0).max(365),
  mediumAlertMax: z.number().int().min(0).max(365),
  lowAlertMax: z.number().int().min(0).max(365),
})

export const forecastChatRequestSchema = z
  .object({
    context: z.object({
      modelNumber: z.union([z.literal(1), z.literal(2), z.literal(3)]),
      selectedForecast: selectedForecastSchema,
      product: reorderInputSchema,
      urgencyThresholds: urgencyThresholdSchema,
    }),
    messages: z.array(requestMessageSchema).max(FORECAST_CHAT_MAX_MESSAGES_SCHEMA),
  })
  .superRefine((value, ctx) => {
    const { highAlertMax, mediumAlertMax, lowAlertMax } = value.context.urgencyThresholds

    if (mediumAlertMax <= highAlertMax) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['context', 'urgencyThresholds', 'mediumAlertMax'],
        message: 'mediumAlertMax must be greater than highAlertMax.',
      })
    }

    if (lowAlertMax <= mediumAlertMax) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['context', 'urgencyThresholds', 'lowAlertMax'],
        message: 'lowAlertMax must be greater than mediumAlertMax.',
      })
    }
  })

export type ForecastChatParsedRequest = z.infer<typeof forecastChatRequestSchema>
