import { type ToolLoopAgent } from 'ai'
import axios from 'axios'

import { ReorderingPointsProduct, Urgency } from '@/types/reorderingPoints/reorderingPoints'

import { AIModelForecastResult, AIModelProductTrendResult, ReorderInput } from './ai-schema'
import { BusinessPromptResponse, build_bsnss_system_prompt } from './business-prompt'

const BSSNSS_SYSTEM_PROMPT_CACHE_TTL_MS = 5 * 60 * 1000

type BssnssSystemPromptCacheEntry = {
  value?: string
  expiresAt: number
  pending?: Promise<string>
}

const bssnssSystemPromptCache = new Map<string, BssnssSystemPromptCacheEntry>()

const getBssnssSystemPromptCacheKey = ({ region, businessId }: { region: string; businessId: string }) => `RP_SystemPrompt${region}:${businessId}`

export const clear_bssnss_system_prompt_cache = ({ region, businessId }: { region?: string; businessId?: string } = {}) => {
  if (!region || !businessId) {
    bssnssSystemPromptCache.clear()
    return
  }

  bssnssSystemPromptCache.delete(getBssnssSystemPromptCacheKey({ region, businessId }))
}

export type GetAIModelForecastInBulkResult = {
  status: string
  value: GetAIForecastForProductResult
}

export type GetAIForecastForProductResult = {
  error: boolean
  message?: string
  modelUsed: string
  analysis?: AIModelForecastResult['analysis']
}

export const get_ai_forecast_for_product = async (
  product: ReorderingPointsProduct,
  agent: ToolLoopAgent,
  modelUsed: string,
  urgencyThresholds: Urgency
): Promise<GetAIForecastForProductResult> => {
  const { sku, urgency } = product

  const productInput = buildProductPrompt(product, urgencyThresholds)

  let aiForecast: AIModelForecastResult = { error: false, analysis: undefined }

  try {
    const productPrompt = buildUserMessage(productInput)

    // Attempt 1: full payload
    const first = await agent.generate({
      prompt: productPrompt,
    })
    let analysisResult = safeParseJson(first.text)

    // Attempt 2: compact payload if parse failed OR model hit length
    let secondFinishReason: string | undefined
    let secondText = ''
    if (analysisResult.error || first.finishReason === 'length') {
      const second = await agent.generate({
        prompt: productPrompt,
      })
      secondFinishReason = second.finishReason
      secondText = second.text
      analysisResult = safeParseJson(second.text)
    }

    if (analysisResult.error) {
      const diagnostic = [
        `AI Forecasting - JSON parse error for SKU ${sku} - URG:${urgency}`,
        `firstFinishReason:${String(first.finishReason)}`,
        secondFinishReason ? `secondFinishReason:${String(secondFinishReason)}` : '',
        `firstTextLen:${first.text?.length || 0}`,
        secondText ? `secondTextLen:${secondText.length}` : '',
        `firstPreview:${previewText(first.text)}`,
        secondText ? `secondPreview:${previewText(secondText)}` : '',
      ]
        .filter(Boolean)
        .join(' | ')

      throw new Error(diagnostic)
    }

    aiForecast = { error: false, analysis: analysisResult.parsed } as AIModelForecastResult

    if (aiForecast.error || !aiForecast.analysis) {
      throw new Error(`AI Forecasting error for SKU ${sku} - URG:${urgency}: ${aiForecast.message || 'Unknown error'}`)
    }

    return {
      error: false,
      analysis: aiForecast.analysis,
      modelUsed,
    }
  } catch (error) {
    const err = error as any

    return {
      error: true,
      message: err?.message ?? 'Unknown error',
      modelUsed,
    }
  }
}

export type GetAIModelProductTrendInBulkResult = {
  status: string
  value: GetAIModelProductTrendResult
}

export type GetAIModelProductTrendResult = {
  error: boolean
  message?: string
  modelUsed: string
  trend?: AIModelProductTrendResult['trend']
}

export const get_product_trend_tag = async (
  product: ReorderingPointsProduct,
  agent: ToolLoopAgent,
  modelUsed: string,
  urgencyThresholds: Urgency
): Promise<GetAIModelProductTrendResult> => {
  const { sku } = product

  const productInput = buildProductPrompt(product, urgencyThresholds)

  let aiForecast: AIModelProductTrendResult = { error: false, trend: undefined }

  try {
    const productPrompt = buildUserMessage(productInput)

    // Attempt 1: full payload
    const first = await agent.generate({
      prompt: productPrompt,
    })
    let analysisResult = safeParseJson(first.text)

    // Attempt 2: compact payload if parse failed OR model hit length
    let secondFinishReason: string | undefined
    let secondText = ''
    if (analysisResult.error || first.finishReason === 'length') {
      const second = await agent.generate({
        prompt: productPrompt,
      })
      secondFinishReason = second.finishReason
      secondText = second.text
      analysisResult = safeParseJson(second.text)
    }

    if (analysisResult.error) {
      const diagnostic = [
        `AI Sales Trend - JSON parse error for SKU ${sku}`,
        `firstFinishReason:${String(first.finishReason)}`,
        secondFinishReason ? `secondFinishReason:${String(secondFinishReason)}` : '',
        `firstTextLen:${first.text?.length || 0}`,
        secondText ? `secondTextLen:${secondText.length}` : '',
        `firstPreview:${previewText(first.text)}`,
        secondText ? `secondPreview:${previewText(secondText)}` : '',
      ]
        .filter(Boolean)
        .join(' | ')

      throw new Error(diagnostic)
    }

    aiForecast = { error: false, trend: analysisResult.parsed } as AIModelProductTrendResult

    if (aiForecast.error || !aiForecast.trend) {
      throw new Error(`AI Sales Trend error for SKU ${sku}: ${aiForecast.message || 'Unknown error'}`)
    }

    return {
      error: false,
      trend: aiForecast.trend,
      modelUsed,
    }
  } catch (error) {
    const err = error as any

    return {
      error: true,
      message: err?.message ?? 'Unknown error',
      modelUsed,
    }
  }
}

export const get_bssnss_system_prompt = async ({ region, businessId }: { region: string; businessId: string }) => {
  const cacheKey = getBssnssSystemPromptCacheKey({ region, businessId })
  const cachedEntry = bssnssSystemPromptCache.get(cacheKey)

  if (cachedEntry?.value && cachedEntry.expiresAt > Date.now()) {
    return cachedEntry.value
  }

  if (cachedEntry?.pending) {
    return cachedEntry.pending
  }

  const pending = (async () => {
    try {
      const { data } = await axios.get<BusinessPromptResponse>(
        `${process.env.API_DOMAIN_SERVICES}/${region}/api/reorderingPoints/get-business-prompt.php?businessId=${businessId}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.TARS_API_AUTH_TOKEN}`,
          },
        }
      )

      const resolvedPrompt = build_bsnss_system_prompt(data.prompt)

      bssnssSystemPromptCache.set(cacheKey, {
        value: resolvedPrompt,
        expiresAt: Date.now() + BSSNSS_SYSTEM_PROMPT_CACHE_TTL_MS,
      })

      return resolvedPrompt
    } catch (error) {
      console.error('get_bssnss_system_prompt_error', {
        region,
        businessId,
        message: error instanceof Error ? error.message : 'Unknown error',
      })

      const fallbackPrompt = cachedEntry?.value ?? build_bsnss_system_prompt(null)

      bssnssSystemPromptCache.set(cacheKey, {
        value: fallbackPrompt,
        expiresAt: Date.now() + BSSNSS_SYSTEM_PROMPT_CACHE_TTL_MS,
      })

      return fallbackPrompt
    }
  })()

  bssnssSystemPromptCache.set(cacheKey, {
    value: cachedEntry?.value,
    expiresAt: cachedEntry?.expiresAt ?? 0,
    pending,
  })

  return pending
}

export const buildProductPrompt = (product: ReorderingPointsProduct, urgencyThresholds: Urgency): ReorderInput => {
  const {
    sku,
    title,
    asin,
    boxQty,
    sellerCost,
    leadTimeSC,
    leadTimeFBA,
    leadTimeAWD,
    daysOfStockSC,
    daysOfStockFBA,
    daysOfStockAWD,
    warehouseQty,
    productionQty,
    receiving,
    fbaQty,
    fbaInboundQty,
    awdQty,
    awdInboundQty,
    totalUnitsSold,
    dailyForecast,
    warehousePODates,
    productTrendTag,
  } = product

  const { highAlertMax, mediumAlertMax, lowAlertMax } = urgencyThresholds

  return {
    forecastingMethod: productTrendTag.useAITrend ? (productTrendTag.aiTrend ?? 'Normal') : (productTrendTag.bsnssTrend ?? 'Normal'),
    sku: sku,
    title: title,
    asin: asin,
    unitsPerCase: boxQty > 0 ? boxQty : 1,
    sellerCost: sellerCost,

    leadTimeDaysFromSellerToWarehouse: leadTimeSC,
    warehouseTargetDaysAfterLeadTime: daysOfStockSC,
    leadTimeDaysFromWarehouseToFBA: 7, // This is an assumption; ideally, we would have this data point
    leadTimeDaysFromSellerToFBA: leadTimeFBA,
    fbaTargetDaysAfterLeadTime: daysOfStockFBA,
    leadTimeDaysFromSellerToAWD: leadTimeAWD,
    awdTargetDaysAfterLeadTime: daysOfStockAWD, // Assuming AWD has similar target days as FBA; adjust if needed

    purchaseOrders: {
      ToWarehouse: warehousePODates.warehouse
        ? Object.entries(warehousePODates.warehouse).map(([date, quantity]) => ({
            OrderDate: date,
            quantity: quantity || 0,
          }))
        : [],
      ToFBA: warehousePODates.fba
        ? Object.entries(warehousePODates.fba).map(([date, quantity]) => ({
            OrderDate: date,
            quantity: quantity || 0,
          }))
        : [],
    },

    inventory: {
      warehouseQty: warehouseQty,
      warehouseInboundQty: receiving,
      warehouseProductionQty: productionQty,
      fbaQty: fbaQty,
      fbaInboundQty: fbaInboundQty,
      fbaProductionQty: 0,
      awdQty: awdQty,
      awdInboundQty: awdInboundQty,
      awdProductionQty: 0,
    },
    totalsSales: {
      last30days: totalUnitsSold['30D'],
      last60days: totalUnitsSold['60D'],
      last90days: totalUnitsSold['90D'],
      last120days: totalUnitsSold['120D'],
      last180days: totalUnitsSold['180D'],
      last365days: totalUnitsSold['365D'],
    },

    dailyInfo: Object.entries(dailyForecast)
      .sort(([dateA], [dateB]) => new Date(dateA).getTime() - new Date(dateB).getTime())
      .map(([date, values]) => ({
        date: date,
        warehouseSoldUnits: values.unitsSoldSC,
        warehouseStock: values.daysWithStockSC,
        warehouseOrders: values.ordersSC,
        fbaSoldUnits: values.unitsSoldFBA,
        fbaStock: values.daysWithStockFBA,
        fbaOrders: values.ordersFBA,
      })),

    // monthly: Object.entries(monthlyForecast)
    //   .sort(([yearA], [yearB]) => parseInt(yearA) - parseInt(yearB))
    //   .flatMap(([year, months]) =>
    //     Object.entries(months)
    //       .sort(([monthA], [monthB]) => parseInt(monthA) - parseInt(monthB))
    //       .map(([month, values]) => ({
    //         month: `${year}-${month}`,
    //         warehouseSoldUnits: values.unitsSoldSC,
    //         warehouseDaysWithStock: values.daysWithStockSC,
    //         warehouseOrders: values.ordersSC,
    //         fbaSoldUnits: values.unitsSoldFBA,
    //         fbaDaysWithStock: values.daysWithStockFBA,
    //         fbaOrders: values.ordersFBA,
    //       }))
    //   ),

    urgencyThresholds: {
      high: highAlertMax ?? 20,
      medium: mediumAlertMax ?? 30,
      low: lowAlertMax ?? 40,
    },
  }
}

export const buildUserMessage = (input: ReorderInput) => {
  return `Product Reordering Data (JSON): ${JSON.stringify(input)}`
}

export const safeParseJson = (input: string) => {
  try {
    return { error: false, parsed: JSON.parse(input) }
  } catch (error) {
    return { error: true, parsed: input.trim() }
  }
}

export const previewText = (value: unknown, max = 350) => {
  const raw = typeof value === 'string' ? value : JSON.stringify(value)
  return (raw || '').replace(/\s+/g, ' ').slice(0, max)
}
