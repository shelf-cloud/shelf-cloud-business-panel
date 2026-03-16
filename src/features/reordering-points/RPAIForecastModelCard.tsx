import { Badge } from '@components/shadcn/ui/badge'
import { Card, CardContent, CardHeader } from '@components/shadcn/ui/card'
import { FormatIntNumber } from '@lib/FormatNumbers'
import { Sparkles } from 'lucide-react'
import moment from 'moment'

import { Button } from '@/components/shadcn/ui/button'
import { ForecastChatModelNumber } from '@/features/ai-chat/types'
import { AIForecastForProduct } from '@/types/reorderingPoints/reorderingPoints'

type Props = {
  modelNumber: ForecastChatModelNumber
  model: string
  analysis: string
  forecast: number
  region: string
  productForecast: AIForecastForProduct
  onAnalyze: (modelNumber: ForecastChatModelNumber, productForecast: AIForecastForProduct) => void
}

const BADGE_VARIANTS: Record<number, 'default' | 'secondary' | 'outline'> = {
  1: 'default',
  2: 'secondary',
  3: 'outline',
}

const ACCENT_COLORS: Record<number, string> = {
  1: '#4481FD',
  2: '#6c757d',
  3: '#9ca3af',
}

const RPAIForecastModelCard = ({ modelNumber, model, analysis, forecast, region, productForecast, onAnalyze }: Props) => {
  if (!model || !analysis) return null

  return (
    <Card className='tw:border-border tw:shadow-md! tw:gap-2!'>
      <CardHeader className='tw:px-4'>
        <div className='tw:flex tw:flex-row tw:items-center tw:gap-2 tw:flex-wrap'>
          <Badge variant={BADGE_VARIANTS[modelNumber]}>Model</Badge>
          <code className='tw:text-xs tw:bg-muted tw:text-muted-foreground tw:px-2 tw:py-0.5 tw:rounded-md tw:font-mono tw:border tw:border-border' title='Model algorithm'>
            {model}
          </code>
        </div>
      </CardHeader>
      <CardContent className='tw:px-4 tw:pb-2 tw:flex tw:flex-col tw:gap-3'>
        <div className='tw:flex tw:flex-row tw:items-baseline tw:gap-1'>
          <span className='tw:text-3xl tw:font-bold tw:text-foreground tw:tabular-nums'>{FormatIntNumber(region, forecast)}</span>
          <span className='tw:text-sm tw:text-muted-foreground'>units</span>
        </div>
        <div className='tw:border-l-2 tw:pl-3 tw:py-1' style={{ borderColor: ACCENT_COLORS[modelNumber] }}>
          <p className='tw:text-sm tw:text-muted-foreground tw:leading-relaxed tw:m-0'>{analysis}</p>
        </div>
        <div className='tw:space-y-1'>
          <div className='tw:flex tw:flex-row tw:items-baseline tw:gap-3'>
            <p className='tw:my-0!'>Urgency Analysis</p>
            <Badge variant={BADGE_VARIANTS[modelNumber]} className='tw:capitalize'>
              {productForecast.urgencyTag}
            </Badge>
          </div>
          <div className='tw:flex tw:flex-row tw:items-baseline tw:gap-3'>
            <p className='tw:my-0!'>Days until next order</p>
            <span className='tw:text-xs tw:text-muted-foreground'>{FormatIntNumber(region, productForecast.daysUntilNextOrder)} days</span>
          </div>
          <div className='tw:flex tw:flex-row tw:items-baseline tw:gap-3'>
            <p className='tw:my-0!'>Recommended Order Date</p>
            <span className='tw:text-xs tw:text-muted-foreground'>{moment(productForecast.recommendedOrderDate).format('DD MMM YYYY')}</span>
          </div>
          <div className='tw:flex tw:flex-row tw:items-baseline tw:gap-3'>
            <p className='tw:my-0!'>Notes</p>
            <span className='tw:text-xs tw:text-muted-foreground'>{productForecast.notes}</span>
          </div>
        </div>
        <div className='tw:flex tw:justify-end'>
          <Button variant='secondary' size='sm' onClick={() => onAnalyze(modelNumber, productForecast)}>
            <Sparkles className='tw:size-3.5 tw:shrink-0' />
            Analyze with AI
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default RPAIForecastModelCard
