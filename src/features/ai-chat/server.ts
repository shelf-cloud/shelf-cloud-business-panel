import { ModelMessage, UIMessage, convertToModelMessages, validateUIMessages } from 'ai'

import { SYSTEM_PROMPT } from '@/features/reordering-points/constants'

import { buildForecastSeedSummary, createForecastSeedMessage, pruneForecastChatMessages } from './helpers'
import { ForecastChatContext, ForecastChatRequestMessage } from './types'

export const FORECAST_CHAT_SYSTEM_PROMPT = `You are continuing a previously completed inventory replenishment forecast conversation.

Your job is to explain the saved forecast result using the provided original forecast prompt, original product input, saved forecast output, and the user's follow-up questions.

Rules:
- Treat the saved forecast as the authoritative completed result for this conversation.
- Explain what likely drove the result from the provided context only.
- Do not claim hidden calculations, unseen backend state, or extra data.
- Do not output JSON unless the user explicitly asks for JSON.
- Do not silently replace or overwrite the saved forecast.
- If the user asks a what-if question, label it clearly as a hypothetical scenario and explain that it is not replacing the saved forecast.
- Be concise, concrete, and analytical.
- ONLY use the provided context to answer questions. Do not make assumptions or use external knowledge.
- If the user asks for changes to the forecast, explain how the forecast would likely change based on the provided context, but do not change the saved forecast.
- If asked for something that is not related to the product, the forecast, or the provided context, respond that you can only answer questions related to the provided context.`

const createHiddenContextMessages = (context: ForecastChatContext, rebuiltProductPrompt: ForecastChatContext['product']): ModelMessage[] => {
  return [
    {
      role: 'user',
      content: `Original forecast system prompt used by the backend:\n${SYSTEM_PROMPT}`,
    },
    {
      role: 'user',
      content: `Selected forecast model metadata:\n${JSON.stringify({
        modelNumber: context.modelNumber,
        model: context.selectedForecast.model,
      })}`,
    },
    {
      role: 'user',
      content: `Original product input that was sent to the forecast agent:\n${JSON.stringify(rebuiltProductPrompt)}`,
    },
    {
      role: 'user',
      content: `Saved forecast output that this conversation must explain:\n${JSON.stringify(context.selectedForecast)}`,
    },
  ]
}

export const createVisibleChatMessages = (context: ForecastChatContext, requestMessages: ForecastChatRequestMessage[]): UIMessage[] => {
  const seedMessage = createForecastSeedMessage(context)

  return [
    seedMessage,
    ...pruneForecastChatMessages(requestMessages).map((message) => ({
      id: message.id,
      role: message.role,
      parts: message.parts.map((part) => ({
        type: 'text' as const,
        text: part.text,
      })),
    })),
  ]
}

export const buildForecastChatPrompt = async (context: ForecastChatContext, requestMessages: ForecastChatRequestMessage[]) => {
  const rebuiltProductPrompt = context.product
  const visibleMessages = createVisibleChatMessages(context, requestMessages)
  const validatedMessages = await validateUIMessages({
    messages: visibleMessages,
  })
  const visibleModelMessages = await convertToModelMessages(validatedMessages)

  return {
    originalMessages: validatedMessages,
    prompt: [...createHiddenContextMessages(context, rebuiltProductPrompt), ...visibleModelMessages],
    rebuiltProductPrompt,
    seedSummary: buildForecastSeedSummary(context),
  }
}
