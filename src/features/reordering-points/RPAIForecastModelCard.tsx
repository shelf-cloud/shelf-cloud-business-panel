import { Badge } from '@components/shadcn/ui/badge'
import { Card, CardContent, CardHeader } from '@components/shadcn/ui/card'
import { FormatIntNumber } from '@lib/FormatNumbers'
import { addDays, format } from 'date-fns'
import { Sparkles } from 'lucide-react'
import { CartesianGrid, Line, LineChart, ReferenceDot, ReferenceLine, XAxis, YAxis } from 'recharts'

import { Button } from '@/components/shadcn/ui/button'
import { ChartConfig, ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from '@/components/shadcn/ui/chart'
import type { ForecastChatModelNumber, ForecastChatUrgencyThresholds } from '@/features/ai-chat/types'
import { FORECAST_HORIZON_DAYS, FORECAST_HORIZON_MONTHS, FORECAST_MONTH_DAYS } from '@/lib/aiForecastConstants'
import { getCurrentAIForecastStock, getProductAIForecastUrgency } from '@/lib/getAIForecastUrgency'
import type { AIForecastUrgencyResult } from '@/lib/getAIForecastUrgency'
import { AIForecastForProduct, ReorderingPointsProduct } from '@/types/reorderingPoints/reorderingPoints'

type Props = {
  modelNumber: ForecastChatModelNumber
  model: string
  analysis: string
  forecast: number[]
  region: string
  product: ReorderingPointsProduct
  productForecast: AIForecastForProduct
  urgencyThresholds: ForecastChatUrgencyThresholds
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

const chartConfig = {
  stock: {
    label: 'Projected stock',
    color: 'var(--warning)',
  },
  forecastSales: {
    label: 'Monthly forecast',
    color: 'var(--primary)',
  },
} satisfies ChartConfig

const EVENT_COLORS = {
  today: 'var(--info)',
  orderArrival: 'var(--primary)',
  stockout: 'var(--destructive)',
}

const URGENCY_BADGE_VARIANTS: Record<AIForecastUrgencyResult['urgencyTag'], 'outline' | 'secondary' | 'warning' | 'destructive'> = {
  none: 'outline',
  low: 'secondary',
  medium: 'warning',
  high: 'destructive',
}

type TimelineMarkerLabelProps = {
  label: string
  color: string
  viewBox?: {
    x?: number
    y?: number
  }
}

const TimelineMarkerLabel = ({ label, color, viewBox }: TimelineMarkerLabelProps) => {
  if (typeof viewBox?.x !== 'number' || typeof viewBox?.y !== 'number') return null

  return (
    <g transform={`translate(${viewBox.x - 12}, ${viewBox.y + 12})`}>
      <rect width='24' height='92' rx='4' fill={color} />
      <text x='12' y='46' fill='white' textAnchor='middle' dominantBaseline='middle' transform='rotate(-90 12 46)' fontSize='12' fontWeight='600'>
        {label}
      </text>
    </g>
  )
}

const buildForecastChartData = ({ currentStock, forecast, startDate }: { currentStock: number; forecast: number[]; startDate: Date }) => {
  const normalizedForecast = Array.from({ length: FORECAST_HORIZON_MONTHS }, (_, index) => Math.max(0, Number(forecast[index]) || 0))
  let remainingStock = Math.max(0, Number(currentStock) || 0)

  return Array.from({ length: FORECAST_HORIZON_DAYS + 1 }, (_, day) => {
    if (day > 0) {
      const monthIndex = Math.min(Math.floor((day - 1) / FORECAST_MONTH_DAYS), normalizedForecast.length - 1)
      remainingStock = Math.max(0, remainingStock - normalizedForecast[monthIndex] / FORECAST_MONTH_DAYS)
    }

    const monthBoundaryForecast = day > 0 && day % FORECAST_MONTH_DAYS === 0 ? normalizedForecast[day / FORECAST_MONTH_DAYS - 1] : null
    const date = addDays(startDate, day)

    return {
      day,
      date,
      label: day === 0 ? 'Today' : format(date, 'dd MMM yyyy'),
      stock: Number(remainingStock.toFixed(2)),
      forecastSales: monthBoundaryForecast,
    }
  })
}

const RPAIForecastModelCard = ({ modelNumber, model, analysis, forecast, region, product, productForecast, urgencyThresholds, onAnalyze }: Props) => {
  if (!model || !analysis) return null

  const forecastValue = Array.isArray(forecast) ? forecast.reduce((total, value) => total + Number(value || 0), 0) : forecast
  const aiUrgency = getProductAIForecastUrgency(product, urgencyThresholds)
  const currentStock = getCurrentAIForecastStock(product)
  const leadTimeDays = Math.max(0, Number(product.leadTimeSC + product.daysOfStockSC) || 0)
  const today = new Date()
  const chartData = buildForecastChartData({ currentStock, forecast: Array.isArray(forecast) ? forecast : [], startDate: today })
  const shouldShowOrderArrivalMarker = leadTimeDays >= 0 && leadTimeDays <= FORECAST_HORIZON_DAYS
  const stockoutPoint = chartData.find((point) => point.day > 0 && point.stock <= 0)
  const shouldShowStockoutMarker = Boolean(stockoutPoint)

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
        <span className='tw:text-sm tw:text-muted-foreground'>9 months forecast</span>
        <div className='tw:flex tw:flex-row tw:items-baseline tw:gap-1'>
          <span className='tw:text-3xl tw:font-bold tw:text-foreground tw:tabular-nums'>{FormatIntNumber(region, forecastValue)}</span>
          <span className='tw:text-sm tw:text-muted-foreground'>units</span>
        </div>
        <div className='tw:grid tw:grid-cols-2 tw:gap-2 tw:sm:grid-cols-4'>
          <div className='tw:flex tw:flex-col tw:gap-1 tw:rounded-md tw:border tw:border-border tw:bg-muted/30 tw:p-2'>
            <span className='tw:text-xs tw:font-medium tw:text-muted-foreground'>Current stock</span>
            <span className='tw:text-sm tw:font-semibold tw:text-foreground tw:tabular-nums'>{FormatIntNumber(region, currentStock)}</span>
          </div>
          <div className='tw:flex tw:flex-col tw:gap-1 tw:rounded-md tw:border tw:border-border tw:bg-muted/30 tw:p-2'>
            <span className='tw:text-xs tw:font-medium tw:text-muted-foreground'>Days to order</span>
            <span className='tw:text-sm tw:font-semibold tw:text-foreground tw:tabular-nums'>{FormatIntNumber(region, aiUrgency.daysToOrder)}</span>
            <span className='tw:text-xs tw:text-muted-foreground tw:tabular-nums'>Stock: {FormatIntNumber(region, aiUrgency.remainingDays)} days</span>
          </div>
          <div className='tw:flex tw:flex-col tw:gap-1 tw:rounded-md tw:border tw:border-border tw:bg-muted/30 tw:p-2'>
            <span className='tw:text-xs tw:font-medium tw:text-muted-foreground'>Urgency</span>
            <Badge variant={URGENCY_BADGE_VARIANTS[aiUrgency.urgencyTag]} className='tw:capitalize'>
              {aiUrgency.urgencyTag}
            </Badge>
          </div>
          <div className='tw:flex tw:flex-col tw:gap-1 tw:rounded-md tw:border tw:border-border tw:bg-muted/30 tw:p-2'>
            <span className='tw:text-xs tw:font-medium tw:text-muted-foreground'>Order arrival</span>
            <span className='tw:text-sm tw:font-semibold tw:text-foreground tw:tabular-nums'>{FormatIntNumber(region, leadTimeDays)} days</span>
          </div>
        </div>
        <div className='tw:rounded-md tw:border tw:border-border tw:bg-background tw:p-3'>
          <div className='tw:mb-2 tw:flex tw:flex-row tw:items-center tw:justify-between tw:gap-2'>
            <div className='tw:flex tw:flex-col tw:gap-0'>
              <span className='tw:text-sm tw:font-semibold tw:text-foreground'>Inventory Timeline</span>
              <span className='tw:text-xs tw:text-muted-foreground'>9 month forecast from {format(today, 'dd MMM yyyy')}</span>
            </div>
            <Badge variant='outline'>Monthly</Badge>
          </div>
          <ChartContainer config={chartConfig} className='tw:h-[300px] tw:w-full tw:aspect-auto'>
            <LineChart accessibilityLayer data={chartData} margin={{ top: 18, right: 14, left: 0, bottom: 10 }}>
              <CartesianGrid vertical={false} strokeDasharray='3 3' />
              <XAxis
                dataKey='day'
                tickLine={false}
                axisLine={false}
                tickMargin={10}
                minTickGap={18}
                tickFormatter={(value) => format(addDays(today, Number(value) || 0), Number(value) === 0 ? 'dd MMM' : 'MMM yy')}
              />
              <YAxis tickLine={false} axisLine={false} tickMargin={8} width={44} tickFormatter={(value) => FormatIntNumber(region, Number(value) || 0)} />
              <ChartTooltip
                cursor={{ stroke: 'var(--muted-foreground)', strokeDasharray: '4 4' }}
                content={
                  <ChartTooltipContent
                    labelFormatter={(_, payload) => payload[0]?.payload?.label}
                    formatter={(value, name) => {
                      const label = name === 'stock' ? chartConfig.stock.label : chartConfig.forecastSales.label

                      return (
                        <>
                          <span className='tw:text-muted-foreground'>{label}</span>
                          <span className='tw:ml-auto tw:font-mono tw:font-medium tw:text-foreground tw:tabular-nums'>{FormatIntNumber(region, Number(value) || 0)}</span>
                        </>
                      )
                    }}
                  />
                }
              />
              <ChartLegend content={<ChartLegendContent />} />
              <ReferenceLine y={0} stroke='var(--border)' />
              <ReferenceLine x={0} stroke={EVENT_COLORS.today} strokeDasharray='2 2' label={<TimelineMarkerLabel label='Today' color={EVENT_COLORS.today} />} />
              {shouldShowOrderArrivalMarker && (
                <ReferenceLine
                  x={leadTimeDays}
                  stroke={EVENT_COLORS.orderArrival}
                  strokeDasharray='2 2'
                  label={<TimelineMarkerLabel label='Order Arrives' color={EVENT_COLORS.orderArrival} />}
                />
              )}
              {shouldShowStockoutMarker && (
                <ReferenceLine
                  x={stockoutPoint?.day}
                  stroke={EVENT_COLORS.stockout}
                  strokeDasharray='2 2'
                  label={<TimelineMarkerLabel label='Out Of Stock' color={EVENT_COLORS.stockout} />}
                />
              )}
              {stockoutPoint && <ReferenceDot x={stockoutPoint.day} y={stockoutPoint.stock} r={5} fill={EVENT_COLORS.stockout} stroke='var(--background)' />}
              <Line dataKey='stock' type='monotone' stroke='var(--color-stock)' strokeWidth={3} dot={false} activeDot={{ r: 5 }} name='stock' isAnimationActive={false} />
              <Line
                dataKey='forecastSales'
                type='monotone'
                stroke='var(--color-forecastSales)'
                strokeWidth={3}
                dot={{ r: 6 }}
                connectNulls
                name='forecastSales'
                isAnimationActive={false}
              />
            </LineChart>
          </ChartContainer>
        </div>
        <div className='tw:border-l-2 tw:pl-3 tw:py-1' style={{ borderColor: ACCENT_COLORS[modelNumber] }}>
          <p className='tw:text-sm tw:text-muted-foreground tw:leading-relaxed tw:m-0'>{analysis}</p>
        </div>
        {/* <div className='tw:space-y-1'> */}
        {/* <div className='tw:flex tw:flex-row tw:items-baseline tw:gap-3'>
            <p className='tw:my-0!'>Urgency Analysis</p>
            <Badge variant={BADGE_VARIANTS[modelNumber]} className='tw:capitalize'>
              {productForecast.urgencyTag}
            </Badge>
          </div> */}
        {/* <div className='tw:flex tw:flex-row tw:items-baseline tw:gap-3'>
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
        </div> */}
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
