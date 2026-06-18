import { encode } from '@toon-format/toon'
import { ToolLoopAgent } from 'ai'
import { z } from 'zod'

import { FORECAST_HORIZON_MONTHS } from '@/lib/aiForecastConstants'
import { ReorderingPointsProduct } from '@/types/reorderingPoints/reorderingPoints'

import { getContext } from './constants'

export type DailyProductData = {
  [sku: string]: DailyProductDataEntry[]
}

export type DailyProductDataEntry = {
  date: string
  warehouseUnitsSold: number
  warehouseDailyStock: number
  warehouseOrders: number
  fbaUnitsSold: number
  fbaDailyStock: number
  fbaOrders: number
}

export const get_ai_v2_system_prompt = async () => {
  const general = `# Inventory Sales Forecasting Expert
    ## Role & Goal
    You are an Analyst Forecast Expert. Given the product data lead time, current stock, and historical daily: warehouse units sold, warehouse daily stock, warehouse orders, FBA units sold, FBA daily stock, FBA orders, your primary objective is to make an accurate sales forecasts for the next 9 months.
    
    ## Analytical Integrity
    - Use only the provided structured data.
    - Do not infer missing inputs, fabricate history, or invent replacement data.
    - Analysis and notes may explain confidence, discrepancies, or risk, but they must never override hard inventory or timing.
    Return **only** a valid JSON object. No commentary, no bullet points, no tables, no code blocks, no clarifying questions.`

  const objective = `## Main Objective
    Goal: return the most accurate sales forecast possible for the next 9 months.
    Given the provided Product Data, output:
    - a brief analysis (very short) of the product's sales trends, seasonality, demand patterns, and any relevant insights that can be derived from the data. This analysis should be concise and directly inform the forecast.
    - a 9-month sales forecast for the product, based on the provided data and your analysis. an array of 9 integers, each representing the forecasted sales for the next 9 months respectively.`

  let bsnss_systemPrompt = `${general}\n\n${objective}\n\n${getContext()}\n\n`

  return bsnss_systemPrompt
}

export type ReorderInput_v2 = {
  sku: string
  title: string
  leadTimeDays: number
  currentStock: number
  dailyData: DailyProductDataEntry[] | null
}

export const buildProductPrompt_v2 = (product: ReorderingPointsProduct, dailyData: DailyProductDataEntry[] | null = null): ReorderInput_v2 => {
  const { sku, title, leadTimeSC, warehouseQty, productionQty, receiving, fbaQty, fbaInboundQty, fbaProduction, awdQty, awdInboundQty, awdProduction } = product

  return {
    sku: sku,
    title: title,
    leadTimeDays: leadTimeSC,
    currentStock: warehouseQty + productionQty + receiving + fbaQty + fbaInboundQty + fbaProduction + awdQty + awdInboundQty + awdProduction,
    dailyData: dailyData,
  }
}

export const buildUserMessage = (input: ReorderInput_v2) => {
  const toon = encode(input, {
    indent: 2,
    delimiter: ',',
    keyFolding: 'off',
    flattenDepth: Infinity,
  })
  return `Product Data:\n
  \`\`\`toon\n
  ${toon}\n
  \`\`\`
  `
}

type ForecastAgent = ToolLoopAgent<never, any, any>

export type GetAIForecastForProductResult = {
  error: boolean
  message?: string
  analysis?: {
    error: boolean
    parsed: {
      analysis: string
      forecast: number[]
    }
  }
}

export const get_ai_forecast_for_product_v2 = async (
  product: ReorderingPointsProduct,
  dailyData: DailyProductDataEntry[],
  agent: ForecastAgent
): Promise<GetAIForecastForProductResult> => {
  return get_single_ai_forecast_attempt({
    input: buildProductPrompt_v2(product, dailyData),
    agent,
  })
}

const get_single_ai_forecast_attempt = async ({ input, agent }: { input: ReorderInput_v2; agent: ForecastAgent }): Promise<GetAIForecastForProductResult> => {
  try {
    // const productPrompt = buildUserMessage(input)

    const first = await agent.generate({
      prompt: JSON.stringify(input),
    })

    let analysisResult = safeParseJson(first.text)

    return {
      error: false,
      analysis: analysisResult,
    }
  } catch (error) {
    return {
      error: true,
      message: error instanceof Error ? error.message : String(error),
    }
  }
}

export const ReorderOutputSchema = z.object({
  analysis: z.string().min(1),
  forecast: z.array(z.number()).length(FORECAST_HORIZON_MONTHS),
})

export type ReorderOutput = z.infer<typeof ReorderOutputSchema>

export const safeParseJson = (input: string) => {
  try {
    return { error: false, parsed: JSON.parse(input) }
  } catch (error) {
    return { error: true, parsed: input.trim() }
  }
}
