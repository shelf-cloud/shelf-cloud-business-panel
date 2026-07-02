'use client'

import { useEffect, useMemo, useRef, useState } from 'react'

import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import { ChevronLeftIcon, ChevronRightIcon, Clock3 } from 'lucide-react'

import { Badge } from '@/components/shadcn/ui/badge'
import { Button } from '@/components/shadcn/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/shadcn/ui/card'
import { Separator } from '@/components/shadcn/ui/separator'
import { FormatIntNumber } from '@/lib/FormatNumbers'
import { cn } from '@/lib/shadcn/utils'

import { ReorderInput_v2 } from '../reordering-points/ai-helpers-v2'
import Conversation from './Conversation'
import PromptInput from './PromptInput'
import StarterPrompts from './StarterPrompts'
import { FORECAST_CHAT_STARTER_PROMPTS } from './constants'
import { createForecastSeedMessage, getForecastChatId, getForecastSeedMessageId, toForecastChatRequestMessages } from './helpers'
import { ForecastChatContext, ForecastChatModelNumber, ForecastChatSelectedForecast, ForecastChatUrgencyThresholds } from './types'

type Props = {
  businessId: string
  region: string
  chatSessionKey: number
  modelNumber: ForecastChatModelNumber
  product: ReorderInput_v2
  selectedForecast: ForecastChatSelectedForecast
  urgencyThresholds: ForecastChatUrgencyThresholds
  isLeftColumnOpen: boolean
  onToggleLeftColumn: () => void
}

const ForecastChatPanel = ({ businessId, region, chatSessionKey, modelNumber, product, selectedForecast, urgencyThresholds, isLeftColumnOpen, onToggleLeftColumn }: Props) => {
  const [draft, setDraft] = useState('')
  const bottomRef = useRef<HTMLDivElement | null>(null)

  const context = useMemo<ForecastChatContext>(
    () => ({
      modelNumber,
      selectedForecast,
      product,
      urgencyThresholds,
    }),
    [modelNumber, product, selectedForecast, urgencyThresholds]
  )

  const chatId = useMemo(() => `${getForecastChatId(product.sku, modelNumber)}-${chatSessionKey}`, [chatSessionKey, modelNumber, product.sku])
  const seedMessage = useMemo(() => createForecastSeedMessage(context), [context])
  const seedMessageId = useMemo(() => getForecastSeedMessageId(product.sku, modelNumber), [modelNumber, product.sku])

  const { messages, sendMessage, status, stop, error, clearError } = useChat({
    id: chatId,
    messages: [seedMessage],
    transport: new DefaultChatTransport({
      api: `/api/reorderingPoints/forecast-chat?region=${region}&businessId=${businessId}`,
      prepareSendMessagesRequest: ({ headers, credentials, api, messages }) => ({
        api,
        headers,
        credentials,
        body: {
          context,
          messages: toForecastChatRequestMessages(messages, seedMessageId),
        },
      }),
    }),
  })

  const isStreaming = status === 'submitted' || status === 'streaming'

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages, isStreaming])

  const handleSubmit = async (text: string) => {
    const trimmedText = text.trim()

    if (!trimmedText || isStreaming) {
      return
    }

    clearError()
    setDraft('')

    try {
      await sendMessage({ text: trimmedText })
    } catch {
      setDraft(trimmedText)
    }
  }

  const forecastValue = Array.isArray(selectedForecast.forecast) ? selectedForecast.forecast.reduce((total, value) => total + Number(value || 0), 0) : selectedForecast.forecast
  const monthlyForecast = selectedForecast.forecast.map((value, index) => ({
    label: `M${index + 1}`,
    value,
  }))

  return (
    <div
      className={cn(
        'grid h-full flex-1 gap-2 overflow-auto py-3 transition-all duration-200 ease-out',
        isLeftColumnOpen ? 'lg:grid-cols-[minmax(280px,30%)_minmax(0,100%)]' : 'grid-cols-1'
      )}>
      {isLeftColumnOpen ? (
        <div className='flex min-h-0 flex-col gap-2 pr-1'>
          <Card
            className='overflow-y-auto border-border/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,250,252,0.94))] shadow-md!'
            style={{ scrollbarWidth: 'thin' }}>
            <CardHeader className='px-4'>
              <div className='flex flex-wrap items-start justify-between gap-1'>
                <div className='flex flex-col gap-1'>
                  <CardTitle className='text-base font-semibold!'>Forecast Analysis</CardTitle>
                  <CardDescription className='text-xs'>
                    Continuation of the saved forecast result for this model. Follow-up answers explain the existing decision and label hypotheticals clearly.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className='px-4'>
              <div className='flex flex-col gap-3 text-xs'>
                <div className='rounded-md border border-border bg-muted/30 p-3'>
                  <p className='mb-1! flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground'>
                    <Clock3 className='size-3.5' />6 Month Forecast
                  </p>
                  <p className='m-0! text-base font-semibold text-foreground'>{FormatIntNumber(region, forecastValue)} units</p>
                </div>
                <div className='grid grid-cols-3 gap-2'>
                  {monthlyForecast.map((month) => (
                    <div key={month.label} className='rounded-md border border-border bg-background p-2'>
                      <p className='m-0! text-[11px] font-medium text-muted-foreground'>{month.label}</p>
                      <p className='m-0! text-sm font-semibold text-foreground'>{FormatIntNumber(region, month.value)}</p>
                    </div>
                  ))}
                </div>
              </div>
              <Separator className='my-4' />
              <div className='flex flex-col gap-2'>
                <p className='m-0 text-xs font-semibold uppercase text-muted-foreground'>Original forecast summary</p>
                <p className='m-0 text-xs text-foreground'>{selectedForecast.analysis}</p>
              </div>
            </CardContent>
          </Card>

          <Card
            className='overflow-y-auto border-border/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,250,252,0.94))] shadow-md!'
            style={{ scrollbarWidth: 'thin' }}>
            <CardHeader className='px-4'>
              <CardTitle className='text-base! font-semibold!'>Starter Prompts</CardTitle>
              <CardDescription className='text-xs'>Use one of these to inspect the saved forecast faster.</CardDescription>
            </CardHeader>
            <CardContent className='min-w-0 px-4'>
              <StarterPrompts prompts={FORECAST_CHAT_STARTER_PROMPTS} disabled={isStreaming} onSelect={(prompt) => void handleSubmit(prompt)} />
            </CardContent>
          </Card>
        </div>
      ) : null}

      <div className='flex min-h-0 min-w-0 flex-col'>
        <Card
          className='flex min-h-0 flex-1 flex-col border-border/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,250,252,0.94))] shadow-md! gap-1'
          style={{ scrollbarWidth: 'thin' }}>
          <CardHeader className='px-4'>
            <div className='flex items-center justify-between gap-3'>
              <div>
                <CardTitle className='text-base! font-semibold!'>Chat</CardTitle>
                <CardDescription className='text-xs'>Ask follow-up questions about the saved forecast or test hypothetical scenarios.</CardDescription>
              </div>
              <div className='flex items-center gap-2'>
                <Button
                  type='button'
                  variant='outline'
                  size='icon'
                  className='rounded-full!'
                  aria-label={isLeftColumnOpen ? 'Hide forecast details' : 'Show forecast details'}
                  onClick={onToggleLeftColumn}>
                  {isLeftColumnOpen ? <ChevronLeftIcon className='size-4' /> : <ChevronRightIcon className='size-4' />}
                </Button>
                <Badge variant={isStreaming ? 'default' : 'secondary'}>{isStreaming ? 'Analyzing' : 'Ready'}</Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className='flex min-h-0 flex-1 flex-col gap-2 px-4'>
            {error && (
              <div className='rounded-2xl border border-destructive/30 bg-destructive/5 p-3 text-xs text-destructive space-y-2'>
                <p className='m-0!'>The forecast chat could not respond right now. Please try again.</p>
                <Button variant='ghost' size='sm' onClick={() => clearError()}>
                  Dismiss
                </Button>
              </div>
            )}

            <Conversation messages={messages} isStreaming={isStreaming} bottomRef={bottomRef} />

            <div>
              <PromptInput
                value={draft}
                disabled={isStreaming}
                isStreaming={isStreaming}
                onChange={setDraft}
                onSubmit={() => void handleSubmit(draft)}
                onStop={() => void stop()}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default ForecastChatPanel
