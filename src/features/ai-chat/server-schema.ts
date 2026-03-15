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
  forecast: z.number().int().min(0),
  daysUntilNextOrder: z.number().int().min(0),
  recommendedOrderDate: z.string().min(1).max(40),
  urgencyTag: z.enum(['High', 'Medium', 'Low', 'high', 'medium', 'low']),
  stockoutRiskDate: z.string().max(40).nullable().optional(),
  notes: z.string().max(4000).optional(),
})

const purchaseOrderSchema = z.object({
  OrderDate: z.string().min(1).max(40),
  quantity: z.number().int().min(0),
})

const reorderInputSchema = z.object({
  forecastingMethod: z.string().min(1).max(100),
  sku: z.string().min(1).max(200),
  title: z.string().min(1).max(1000),
  asin: z.string().max(100).optional().default(''),
  unitsPerCase: z.number().int().min(1),
  sellerCost: z.number().finite().min(0),
  leadTimeDaysFromSellerToWarehouse: z.number().int().min(0),
  warehouseTargetDaysAfterLeadTime: z.number().int().min(0),
  leadTimeDaysFromWarehouseToFBA: z.number().int().min(0),
  leadTimeDaysFromSellerToFBA: z.number().int().min(0),
  fbaTargetDaysAfterLeadTime: z.number().int().min(0),
  leadTimeDaysFromSellerToAWD: z.number().int().min(0),
  awdTargetDaysAfterLeadTime: z.number().int().min(0),
  purchaseOrders: z.object({
    ToWarehouse: z.array(purchaseOrderSchema),
    ToFBA: z.array(purchaseOrderSchema),
  }),
  inventory: z.object({
    warehouseQty: z.number().finite().min(0),
    warehouseInboundQty: z.number().finite().min(0),
    warehouseProductionQty: z.number().finite().min(0),
    fbaQty: z.number().finite().min(0),
    fbaInboundQty: z.number().finite().min(0),
    fbaProductionQty: z.number().finite().min(0),
    awdQty: z.number().finite().min(0),
    awdInboundQty: z.number().finite().min(0),
    awdProductionQty: z.number().finite().min(0),
  }),
  totalsSales: z.object({
    last30days: z.number().finite().min(0),
    last60days: z.number().finite().min(0),
    last90days: z.number().finite().min(0),
    last120days: z.number().finite().min(0),
    last180days: z.number().finite().min(0),
    last365days: z.number().finite().min(0),
  }),
  monthly: z.array(
    z.object({
      month: z.string().min(1).max(10),
      warehouseSoldUnits: z.number().finite().min(0),
      warehouseDaysWithStock: z.number().finite().min(0),
      warehouseOrders: z.number().finite().min(0),
      fbaSoldUnits: z.number().finite().min(0),
      fbaDaysWithStock: z.number().finite().min(0),
      fbaOrders: z.number().finite().min(0),
    })
  ),
  urgencyThresholds: z.object({
    high: z.number().int().min(0).max(365),
    medium: z.number().int().min(0).max(365),
    low: z.number().int().min(0).max(365),
  }),
})

const urgencyThresholdSchema = z.object({
  rpShowFBA: z.boolean(),
  rpShowAWD: z.boolean(),
  highAlertMax: z.number().int().min(0).max(365),
  mediumAlertMax: z.number().int().min(0).max(365),
  lowAlertMax: z.number().int().min(0).max(365),
})

export const forecastChatRequestSchema = z.object({
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

    if (
      value.context.product.urgencyThresholds.high !== highAlertMax ||
      value.context.product.urgencyThresholds.medium !== mediumAlertMax ||
      value.context.product.urgencyThresholds.low !== lowAlertMax
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['context', 'urgencyThresholds'],
        message: 'Forecast prompt urgency thresholds must match the chat context urgency thresholds.',
      })
    }
  })

export type ForecastChatParsedRequest = z.infer<typeof forecastChatRequestSchema>
