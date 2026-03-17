import { ToolLoopAgent } from 'ai'

import { MODEL_OPTIONS, SYSTEM_PROMPT } from './constants'

export const DEFAULT_FORECAST_MODEL_ID = MODEL_OPTIONS['openai-4.1nano'].id

const MODEL_OPTION_VALUES = Object.values(MODEL_OPTIONS)

// const normalizeModelValue = (value?: string | null) => value?.trim().toLowerCase()

export const resolveForecastModelId = (_modelValue?: string | null) => {
  return MODEL_OPTIONS['openai-5.3-chat'].id
  // const normalizedModelValue = normalizeModelValue(modelValue)

  // if (!normalizedModelValue) {
  //   return DEFAULT_FORECAST_MODEL_ID
  // }

  // const matchedModel = Object.entries(MODEL_OPTIONS).find(([key, option]) => {
  //   return [key, option.id, option.name].some((candidate) => normalizeModelValue(candidate) === normalizedModelValue)
  // })

  // return matchedModel?.[1].id ?? DEFAULT_FORECAST_MODEL_ID
}

export const getForecastModelMetadata = (modelValue?: string | null) => {
  const resolvedId = resolveForecastModelId(modelValue)

  return MODEL_OPTION_VALUES.find((option) => option.id === resolvedId) ?? MODEL_OPTIONS['openai-4.1nano']
}

export const generate_bsnss_agent = async ({ modelId = DEFAULT_FORECAST_MODEL_ID, systemPrompt = SYSTEM_PROMPT }: { modelId?: string; systemPrompt?: string }) => {
  return new ToolLoopAgent({
    model: modelId,
    instructions: systemPrompt,
    maxOutputTokens: 1200,
    temperature: 0.1,
  })
}
