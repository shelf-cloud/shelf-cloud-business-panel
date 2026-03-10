import { FormatIntNumber } from '@lib/FormatNumbers'
import { Badge } from '@components/shadcn/ui/badge'
import { Card, CardContent, CardHeader } from '@components/shadcn/ui/card'

type Props = {
  modelNumber: 1 | 2 | 3
  model: string
  analysis: string
  forecast: number
  region: string
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

const RPAIForecastModelCard = ({ modelNumber, model, analysis, forecast, region }: Props) => {
  if (!model || !analysis) return null

  return (
    <Card className='tw:border-border tw:shadow-none'>
      <CardHeader className='tw:pb-3 tw:pt-4 tw:px-4'>
        <div className='tw:flex tw:flex-row tw:items-center tw:gap-2 tw:flex-wrap'>
          <Badge variant={BADGE_VARIANTS[modelNumber]}>Model {modelNumber}</Badge>
          <code
            className='tw:text-xs tw:bg-muted tw:text-muted-foreground tw:px-2 tw:py-0.5 tw:rounded-md tw:font-mono tw:border tw:border-border'
            title='Model algorithm'>
            {model}
          </code>
        </div>
      </CardHeader>
      <CardContent className='tw:px-4 tw:pb-4 tw:pt-0 tw:flex tw:flex-col tw:gap-3'>
        <div className='tw:flex tw:flex-row tw:items-baseline tw:gap-1'>
          <span className='tw:text-3xl tw:font-bold tw:text-foreground tw:tabular-nums'>
            {FormatIntNumber(region, forecast)}
          </span>
          <span className='tw:text-sm tw:text-muted-foreground'>units</span>
        </div>
        <div
          className='tw:border-l-2 tw:pl-3 tw:py-1'
          style={{ borderColor: ACCENT_COLORS[modelNumber] }}>
          <p className='tw:text-sm tw:text-muted-foreground tw:leading-relaxed tw:m-0'>
            {analysis}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

export default RPAIForecastModelCard
