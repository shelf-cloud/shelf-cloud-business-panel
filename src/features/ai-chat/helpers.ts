import { UIMessage } from 'ai'

import { FORECAST_CHAT_MAX_MESSAGE_COUNT, FORECAST_CHAT_SEED_MESSAGE_PREFIX } from './constants'
import { ForecastChatContext, ForecastChatModelNumber, ForecastChatRequestMessage } from './types'

export const getForecastChatId = (sku: string, modelNumber: ForecastChatModelNumber) => {
  return `forecast-chat-${sku}-${modelNumber}`
}

export const getForecastSeedMessageId = (sku: string, modelNumber: ForecastChatModelNumber) => {
  return `${FORECAST_CHAT_SEED_MESSAGE_PREFIX}-${sku}-${modelNumber}`
}

export const buildForecastSeedSummary = ({ modelNumber, product, selectedForecast }: ForecastChatContext) => {
  const monthlyForecast = selectedForecast.forecast.map((value, index) => `Month ${index + 1}: ${value}`).join(', ')
  const forecastTotal = selectedForecast.forecast.reduce((total, value) => total + Number(value || 0), 0)

  return [
    `Saved forecast continuation for SKU ${product.sku} using Model ${modelNumber}${selectedForecast.model ? ` (${selectedForecast.model})` : ''}.`,
    `Total 6-month sales forecast: ${forecastTotal} units.`,
    `Monthly forecast breakdown: ${monthlyForecast}.`,
    `Original analysis: ${selectedForecast.analysis}`,
  ]
    .filter(Boolean)
    .join('\n')
}

export const createForecastSeedMessage = (context: ForecastChatContext): UIMessage => {
  return {
    id: getForecastSeedMessageId(context.product.sku, context.modelNumber),
    role: 'assistant',
    parts: [
      {
        type: 'text',
        text: buildForecastSeedSummary(context),
      },
    ],
  }
}

export const toForecastChatRequestMessages = (messages: UIMessage[], seedMessageId: string): ForecastChatRequestMessage[] => {
  return messages
    .filter((message): message is UIMessage & { role: 'assistant' | 'user' } => (message.role === 'assistant' || message.role === 'user') && message.id !== seedMessageId)
    .map(
      (message): ForecastChatRequestMessage => ({
        id: message.id,
        role: message.role,
        parts: message.parts
          .filter((part): part is Extract<(typeof message.parts)[number], { type: 'text' }> => part.type === 'text')
          .map((part) => ({
            type: 'text' as const,
            text: part.text,
          }))
          .filter((part) => part.text.trim().length > 0),
      })
    )
    .filter((message) => message.parts.length > 0)
}

export const pruneForecastChatMessages = (messages: ForecastChatRequestMessage[]) => {
  return messages.slice(-FORECAST_CHAT_MAX_MESSAGE_COUNT)
}

export const getMessageText = (message: UIMessage) => {
  return message.parts
    .filter((part): part is Extract<(typeof message.parts)[number], { type: 'text' }> => part.type === 'text')
    .map((part) => part.text)
    .join('\n')
}
