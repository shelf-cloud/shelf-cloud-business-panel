import { NextApiHandler } from 'next'

import { convertToModelMessages } from 'ai'

import { FORECAST_CHAT_SYSTEM_PROMPT, buildForecastChatPrompt } from '@/features/ai-chat/server'
import { forecastChatRequestSchema } from '@/features/ai-chat/server-schema'
import { ForecastChatContext, ForecastChatRequestMessage } from '@/features/ai-chat/types'
import { generate_bsnss_agent, getForecastModelMetadata, resolveForecastModelId } from '@/features/reordering-points/get-ai-agent'
import { enforceContentLength, enforceContentType, enforceRateLimit, getAuthorizedTenant, rejectMethod } from '@/lib/security/server'

const MAX_FORECAST_CHAT_BODY_BYTES = 100_000

const forecastChat: NextApiHandler = async (request, response) => {
  if (rejectMethod(request, response, ['POST'])) {
    return
  }

  const tenant = await getAuthorizedTenant(request, response)

  if (tenant == null) {
    return
  }

  if (
    enforceRateLimit(request, response, {
      key: `forecast-chat:${tenant.businessId}`,
      limit: 8,
      windowMs: 60_000,
    })
  ) {
    return
  }

  if (enforceContentType(request, response, ['application/json'])) {
    return
  }

  if (enforceContentLength(request, response, MAX_FORECAST_CHAT_BODY_BYTES)) {
    return
  }

  const parsedBody = forecastChatRequestSchema.safeParse(request.body)

  if (!parsedBody.success) {
    response.status(400).json({
      error: true,
      message: 'Invalid forecast chat request.',
      issues: parsedBody.error.flatten(),
    })
    return
  }

  try {
    const { context, messages } = parsedBody.data as unknown as { context: ForecastChatContext; messages: ForecastChatRequestMessage[] }
    const resolvedModelId = resolveForecastModelId(context.selectedForecast.model)
    const modelMetadata = getForecastModelMetadata(context.selectedForecast.model)
    const agent = await generate_bsnss_agent({
      modelId: resolvedModelId,
      systemPrompt: FORECAST_CHAT_SYSTEM_PROMPT,
    })
    const { originalMessages, prompt } = await buildForecastChatPrompt(context, messages)
    const modelMessages = await convertToModelMessages(originalMessages)
    const hiddenContextMessages = prompt.slice(0, prompt.length - modelMessages.length)
    const result = await agent.stream({
      prompt: [...hiddenContextMessages, ...modelMessages],
    })

    result.pipeUIMessageStreamToResponse(response, {
      originalMessages,
      messageMetadata: () => ({
        model: modelMetadata.id,
      }),
    })
  } catch (error) {
    console.error('forecast-chat-error', error)

    if (!response.headersSent) {
      response.status(500).json({
        error: true,
        message: 'Unable to analyze this forecast right now.',
      })
    } else {
      response.end()
    }
  }
}

export default forecastChat
