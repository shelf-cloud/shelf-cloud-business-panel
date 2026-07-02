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
    <Card className='border-border shadow-md! gap-2!'>
      <CardHeader className='px-4'>
        <div className='flex flex-row items-center gap-2 flex-wrap'>
          <Badge variant={BADGE_VARIANTS[modelNumber]}>Model</Badge>
          <code className='text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-md font-mono border border-border' title='Model algorithm'>
            {model}
          </code>
        </div>
      </CardHeader>
      <CardContent className='px-4 pb-2 flex flex-col gap-3'>
        <span className='text-sm text-muted-foreground'>9 months forecast</span>
        <div className='flex flex-row items-baseline gap-1'>
          <span className='text-3xl font-bold text-foreground tabular-nums'>{FormatIntNumber(region, forecastValue)}</span>
          <span className='text-sm text-muted-foreground'>units</span>
        </div>
        <div className='grid grid-cols-2 gap-2 sm:grid-cols-4'>
          <div className='flex flex-col gap-1 rounded-md border border-border bg-muted/30 p-2'>
            <span className='text-xs font-medium text-muted-foreground'>Current stock</span>
            <span className='text-sm font-semibold text-foreground tabular-nums'>{FormatIntNumber(region, currentStock)}</span>
          </div>
          <div className='flex flex-col gap-1 rounded-md border border-border bg-muted/30 p-2'>
            <span className='text-xs font-medium text-muted-foreground'>Days to order</span>
            <span className='text-sm font-semibold text-foreground tabular-nums'>{FormatIntNumber(region, aiUrgency.daysToOrder)}</span>
            <span className='text-xs text-muted-foreground tabular-nums'>Stock: {FormatIntNumber(region, aiUrgency.remainingDays)} days</span>
          </div>
          <div className='flex flex-col gap-1 rounded-md border border-border bg-muted/30 p-2'>
            <span className='text-xs font-medium text-muted-foreground'>Urgency</span>
            <Badge variant={URGENCY_BADGE_VARIANTS[aiUrgency.urgencyTag]} className='capitalize'>
              {aiUrgency.urgencyTag}
            </Badge>
          </div>
          <div className='flex flex-col gap-1 rounded-md border border-border bg-muted/30 p-2'>
            <span className='text-xs font-medium text-muted-foreground'>Order arrival</span>
            <span className='text-sm font-semibold text-foreground tabular-nums'>{FormatIntNumber(region, leadTimeDays)} days</span>
          </div>
        </div>
        <div className='rounded-md border border-border bg-background p-3'>
          <div className='mb-2 flex flex-row items-center justify-between gap-2'>
            <div className='flex flex-col gap-0'>
              <span className='text-sm font-semibold text-foreground'>Inventory Timeline</span>
              <span className='text-xs text-muted-foreground'>9 month forecast from {format(today, 'dd MMM yyyy')}</span>
            </div>
            <Badge variant='outline'>Monthly</Badge>
          </div>
          <ChartContainer config={chartConfig} className='h-[300px] w-full aspect-auto'>
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
                          <span className='text-muted-foreground'>{label}</span>
                          <span className='ml-auto font-mono font-medium text-foreground tabular-nums'>{FormatIntNumber(region, Number(value) || 0)}</span>
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
        <div className='border-l-2 pl-3 py-1' style={{ borderColor: ACCENT_COLORS[modelNumber] }}>
          <p className='text-sm text-muted-foreground leading-relaxed m-0'>{analysis}</p>
        </div>
        {/* <div className='space-y-1'> */}
        {/* <div className='flex flex-row items-baseline gap-3'>
            <p className='my-0!'>Urgency Analysis</p>
            <Badge variant={BADGE_VARIANTS[modelNumber]} className='capitalize'>
              {productForecast.urgencyTag}
            </Badge>
          </div> */}
        {/* <div className='flex flex-row items-baseline gap-3'>
            <p className='my-0!'>Days until next order</p>
            <span className='text-xs text-muted-foreground'>{FormatIntNumber(region, productForecast.daysUntilNextOrder)} days</span>
          </div>
          <div className='flex flex-row items-baseline gap-3'>
            <p className='my-0!'>Recommended Order Date</p>
            <span className='text-xs text-muted-foreground'>{moment(productForecast.recommendedOrderDate).format('DD MMM YYYY')}</span>
          </div>
          <div className='flex flex-row items-baseline gap-3'>
            <p className='my-0!'>Notes</p>
            <span className='text-xs text-muted-foreground'>{productForecast.notes}</span>
          </div>
        </div> */}
        <div className='flex justify-end'>
          <Button variant='secondary' size='sm' onClick={() => onAnalyze(modelNumber, productForecast)}>
            <Sparkles className='size-3.5 shrink-0' />
            Analyze with AI
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default RPAIForecastModelCard
