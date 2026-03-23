import { UIMessage } from 'ai'

import { FORECAST_CHAT_MAX_MESSAGE_COUNT, FORECAST_CHAT_SEED_MESSAGE_PREFIX } from './constants'
import { ForecastChatContext, ForecastChatModelNumber, ForecastChatRequestMessage } from './types'

const normalizeUrgencyTag = (value?: string | null) => {
  const normalizedValue = value?.trim().toLowerCase()

  switch (normalizedValue) {
    case 'high':
      return 'High'
    case 'medium':
      return 'Medium'
    case 'low':
      return 'Low'
    case 'none':
      return 'None'
    default:
      return 'Unknown'
  }
}

const formatDateValue = (value?: string | null) => {
  if (!value) {
    return 'Not projected'
  }

  return value
}

export const getForecastChatId = (sku: string, modelNumber: ForecastChatModelNumber) => {
  return `forecast-chat-${sku}-${modelNumber}`
}

export const getForecastSeedMessageId = (sku: string, modelNumber: ForecastChatModelNumber) => {
  return `${FORECAST_CHAT_SEED_MESSAGE_PREFIX}-${sku}-${modelNumber}`
}

export const buildForecastSeedSummary = ({ modelNumber, product, selectedForecast }: ForecastChatContext) => {
  const urgencyTag = normalizeUrgencyTag(selectedForecast.urgencyTag)

  return [
    `Saved forecast continuation for SKU ${product.sku} using Model ${modelNumber}${selectedForecast.model ? ` (${selectedForecast.model})` : ''}.`,
    `Recommended quantity: ${selectedForecast.forecast} units. Urgency: ${urgencyTag}. Order in ${selectedForecast.daysUntilNextOrder} day${selectedForecast.daysUntilNextOrder === 1 ? '' : 's'} on ${selectedForecast.recommendedOrderDate}.`,
    `Stockout risk date: ${formatDateValue(selectedForecast.stockoutRiskDate)}.`,
    `Original analysis: ${selectedForecast.analysis}`,
    selectedForecast.notes ? `Notes: ${selectedForecast.notes}` : '',
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

export const getUrgencyBadgeVariant = (urgencyTag?: string | null): 'destructive' | 'warning' | 'secondary' => {
  switch (normalizeUrgencyTag(urgencyTag)) {
    case 'High':
      return 'destructive'
    case 'Medium':
      return 'warning'
    default:
      return 'secondary'
  }
}
