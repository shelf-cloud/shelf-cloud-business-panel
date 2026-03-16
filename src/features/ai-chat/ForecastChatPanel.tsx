'use client'

import { useEffect, useMemo, useRef, useState } from 'react'

import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import { AlertTriangle, CalendarClock, ChevronLeftIcon, ChevronRightIcon, Clock3, ShieldAlert } from 'lucide-react'

import { Badge } from '@/components/shadcn/ui/badge'
import { Button } from '@/components/shadcn/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/shadcn/ui/card'
import { Separator } from '@/components/shadcn/ui/separator'
import { FormatIntNumber } from '@/lib/FormatNumbers'
import { cn } from '@/lib/shadcn/utils'

import { ReorderInput } from '../reordering-points/ai-schema'
import Conversation from './Conversation'
import PromptInput from './PromptInput'
import StarterPrompts from './StarterPrompts'
import { FORECAST_CHAT_STARTER_PROMPTS } from './constants'
import { createForecastSeedMessage, getForecastChatId, getForecastSeedMessageId, getUrgencyBadgeVariant, toForecastChatRequestMessages } from './helpers'
import { ForecastChatContext, ForecastChatModelNumber, ForecastChatSelectedForecast, ForecastChatUrgencyThresholds } from './types'

type Props = {
  businessId: string
  region: string
  chatSessionKey: number
  modelNumber: ForecastChatModelNumber
  product: ReorderInput
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

  return (
    <div
      className={cn(
        'tw:grid tw:h-full tw:flex-1 tw:gap-1 tw:overflow-auto tw:py-3 tw:transition-all tw:duration-200 tw:ease-out',
        isLeftColumnOpen ? 'tw:lg:grid-cols-[minmax(280px,35%)_minmax(0,100%)]' : 'tw:grid-cols-1'
      )}>
      {isLeftColumnOpen ? (
        <div className='tw:flex tw:min-h-0 tw:flex-col tw:gap-2 tw:pr-1'>
          <Card
            className='tw:overflow-y-auto tw:border-border/70 tw:bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,250,252,0.94))] tw:shadow-md!'
            style={{ scrollbarWidth: 'thin' }}>
            <CardHeader className='tw:px-4'>
              <div className='tw:flex tw:flex-wrap tw:items-start tw:justify-between tw:gap-1'>
                <div className='tw:space-y-1'>
                  <CardTitle className='tw:text-base tw:font-semibold!'>Forecast Analysis</CardTitle>
                  <CardDescription className='tw:text-xs'>
                    Continuation of the saved forecast result for this model. Follow-up answers explain the existing decision and label hypotheticals clearly.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className='tw:px-4'>
              <div className='tw:grid tw:grid-cols-2 tw:gap-2 tw:text-xs'>
                <div>
                  <p className='tw:mb-1! tw:flex tw:items-center tw:gap-2 tw:text-xs tw:font-semibold tw:uppercase tw:tracking-[0.08em] tw:text-muted-foreground'>
                    <Clock3 className='tw:size-3.5' />
                    Quantity
                  </p>
                  <p className='tw:m-0! tw:text-base tw:font-semibold tw:text-foreground'>{FormatIntNumber(region, selectedForecast.forecast)} units</p>
                </div>
                <div>
                  <p className='tw:mb-1! tw:flex tw:items-center tw:gap-2 tw:text-xs tw:font-semibold tw:uppercase tw:tracking-[0.08em] tw:text-muted-foreground'>
                    <ShieldAlert className='tw:size-3.5' />
                    Urgency
                  </p>
                  <div className='tw:flex tw:flex-wrap tw:items-center tw:gap-2'>
                    <Badge variant={getUrgencyBadgeVariant(selectedForecast.urgencyTag)}>{selectedForecast.urgencyTag}</Badge>
                    <span className='tw:text-xs tw:text-foreground'>{selectedForecast.daysUntilNextOrder}d to order</span>
                  </div>
                </div>
                <div>
                  <p className='tw:mb-1! tw:flex tw:items-center tw:gap-2 tw:text-xs tw:font-semibold tw:uppercase tw:tracking-[0.08em] tw:text-muted-foreground'>
                    <CalendarClock className='tw:size-3.5' />
                    Order date
                  </p>
                  <p className='tw:m-0! tw:text-xs tw:font-medium tw:text-foreground'>{selectedForecast.recommendedOrderDate}</p>
                </div>
                <div>
                  <p className='tw:mb-1! tw:flex tw:items-center tw:gap-2 tw:text-xs tw:font-semibold tw:uppercase tw:tracking-[0.08em] tw:text-muted-foreground'>
                    <AlertTriangle className='tw:size-3.5' />
                    Stockout risk
                  </p>
                  <p className='tw:m-0! tw:text-xs tw:font-medium tw:text-foreground'>{selectedForecast.stockoutRiskDate ?? 'Not projected'}</p>
                </div>
              </div>
              <Separator className='tw:my-4' />
              <div className='tw:space-y-2'>
                <p className='tw:m-0 tw:text-xs tw:font-semibold tw:uppercase tw:text-muted-foreground'>Original forecast summary</p>
                <p className='tw:m-0 tw:text-xs tw:text-foreground'>{selectedForecast.analysis}</p>
                {selectedForecast.notes ? <p className='tw:m-0 tw:text-xs tw:text-muted-foreground'>{selectedForecast.notes}</p> : null}
              </div>
            </CardContent>
          </Card>

          <Card
            className='tw:overflow-y-auto tw:border-border/70 tw:bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,250,252,0.94))] tw:shadow-md!'
            style={{ scrollbarWidth: 'thin' }}>
            <CardHeader className='tw:px-4'>
              <CardTitle className='tw:text-base! tw:font-semibold!'>Starter Prompts</CardTitle>
              <CardDescription className='tw:text-xs'>Use one of these to inspect the saved forecast faster.</CardDescription>
            </CardHeader>
            <CardContent className='tw:min-w-0 tw:px-4'>
              <StarterPrompts prompts={FORECAST_CHAT_STARTER_PROMPTS} disabled={isStreaming} onSelect={(prompt) => void handleSubmit(prompt)} />
            </CardContent>
          </Card>
        </div>
      ) : null}

      <div className='tw:flex tw:min-h-0 tw:min-w-0 tw:flex-col'>
        <Card
          className='tw:flex tw:min-h-0 tw:flex-1 tw:flex-col tw:border-border/70 tw:bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,250,252,0.94))] tw:shadow-md! tw:gap-1'
          style={{ scrollbarWidth: 'thin' }}>
          <CardHeader className='tw:px-4'>
            <div className='tw:flex tw:items-center tw:justify-between tw:gap-3'>
              <div>
                <CardTitle className='tw:text-base! tw:font-semibold!'>Chat</CardTitle>
                <CardDescription className='tw:text-xs'>Ask follow-up questions about the saved forecast or test hypothetical scenarios.</CardDescription>
              </div>
              <div className='tw:flex tw:items-center tw:gap-2'>
                <Button
                  type='button'
                  variant='outline'
                  size='icon'
                  className='tw:rounded-full!'
                  aria-label={isLeftColumnOpen ? 'Hide forecast details' : 'Show forecast details'}
                  onClick={onToggleLeftColumn}>
                  {isLeftColumnOpen ? <ChevronLeftIcon className='tw:size-4' /> : <ChevronRightIcon className='tw:size-4' />}
                </Button>
                <Badge variant={isStreaming ? 'default' : 'secondary'}>{isStreaming ? 'Analyzing' : 'Ready'}</Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className='tw:flex tw:min-h-0 tw:flex-1 tw:flex-col tw:gap-2 tw:px-4'>
            {error && (
              <div className='tw:rounded-2xl tw:border tw:border-destructive/30 tw:bg-destructive/5 tw:p-3 tw:text-sm tw:text-destructive'>
                <p className='tw:m-0'>The forecast chat could not respond right now. Please try again.</p>
                <Button variant='ghost' size='sm' className='tw:mt-2 tw:h-auto tw:px-0 tw:text-destructive' onClick={() => clearError()}>
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
