import { useContext, useEffect, useState } from 'react'
import { CartesianGrid, Line, LineChart, ReferenceLine, XAxis, YAxis } from 'recharts'

import { ChartConfig, ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from '@/components/shadcn/ui/chart'

import AppContext from '@context/AppContext'
import { FormatIntNumber } from '@lib/FormatNumbers'
import moment from 'moment'
import { Button } from '@shadcn/ui/button'

type TimeLineEntry = {
  unitsSold: number
  dailyStock: number
  dailyStockFBA: number
}

type Props = {
  productTimeLine: Record<string, TimeLineEntry>
  leadtime: number
  daysRemaining: number
  poDates: Record<string, number>
  forecast?: Record<string, number>
  bestModel?: unknown
}

const chartConfig = {
  unitsSold: { label: 'Units Sold', color: '#3577f1' },
  forecast: { label: 'Forecast', color: '#0ab39c' },
  dailyStock: { label: 'Daily Stock', color: '#f7b84b' },
} satisfies ChartConfig

const EVENT_COLORS = {
  today: '#0ab39c',
  leadTime: '#2980B9',
  outOfStock: '#E74C3C',
  poArrival: '#A569BD',
}

type TimelineMarkerLabelProps = {
  label: string
  color: string
  viewBox?: { x?: number; y?: number }
}

const TimelineMarkerLabel = ({ label, color, viewBox }: TimelineMarkerLabelProps) => {
  if (typeof viewBox?.x !== 'number' || typeof viewBox?.y !== 'number') return null

  return (
    <g transform={`translate(${viewBox.x - 10}, ${viewBox.y})`}>
      <rect width='20' height='80' rx='4' fill={color} />
      <text x='10' y='40' fill='white' textAnchor='middle' dominantBaseline='middle' transform='rotate(-90 10 40)' fontSize='11' fontWeight='600'>
        {label}
      </text>
    </g>
  )
}

const ReorderingPointsTimeLine = ({ productTimeLine, leadtime, daysRemaining, poDates, forecast, bestModel }: Props) => {
  void bestModel
  const { state }: any = useContext(AppContext)
  const [grouping, setGrouping] = useState<'daily' | 'weekly' | 'monthly'>('daily')
  const [currentDateIndex, setcurrentDateIndex] = useState(0)

  const today = moment().startOf('day').format('YYYY-MM-DD')
  const currentStartOfWeek = moment().startOf('week').format('YYYY-MM-DD')
  const currentMonth = moment().format('YYYY-MM')
  const dateAfterLeadTime = moment().startOf('day').add(leadtime, 'days').format('YYYY-MM-DD')
  const OutOfStockDate = moment().startOf('day').add(daysRemaining, 'days').format('YYYY-MM-DD')

  const dailytimeLineSorted = Object.keys(productTimeLine)
    .sort()
    .reduce((result: Record<string, TimeLineEntry>, key) => {
      result[key] = productTimeLine[key]
      return result
    }, {})

  const weeklyTimeLineSorted = Object.keys(productTimeLine)
    .sort()
    .reduce((result: Record<string, TimeLineEntry>, key) => {
      const weekYear = `${moment(key).startOf('week').format('YYYY-MM-DD')}`
      if (result[weekYear] === undefined) {
        result[weekYear] = {
          unitsSold: productTimeLine[key].unitsSold,
          dailyStock: productTimeLine[key].dailyStock,
          dailyStockFBA: productTimeLine[key].dailyStockFBA,
        }
      } else {
        result[weekYear].unitsSold += productTimeLine[key].unitsSold
      }
      return result
    }, {})

  const monthlyTimeLineSorted = Object.keys(productTimeLine)
    .sort()
    .reduce((result: Record<string, TimeLineEntry>, key) => {
      const weekYear = `${moment(key).year()}-${moment(key).format('MM')}`
      if (result[weekYear] === undefined) {
        result[weekYear] = {
          unitsSold: productTimeLine[key].unitsSold,
          dailyStock: productTimeLine[key].dailyStock,
          dailyStockFBA: productTimeLine[key].dailyStockFBA,
        }
      } else {
        result[weekYear].unitsSold += productTimeLine[key].unitsSold
      }
      return result
    }, {})

  const dailytimeForecast = forecast
    ? Object.entries(forecast).reduce((result: Record<string, number>, [date, unitsSold]) => {
        result[moment(date).startOf('day').format('YYYY-MM-DD')] = Math.ceil(unitsSold)
        return result
      }, {})
    : {}

  const weeklyForecast = forecast
    ? Object.entries(forecast).reduce((result: Record<string, number>, [date, unitsSold]) => {
        const weekYear = `${moment(date).startOf('week').format('YYYY-MM-DD')}`
        result[weekYear] = (result[weekYear] || 0) + Math.ceil(unitsSold)
        return result
      }, {})
    : {}

  const monthlyForecast = forecast
    ? Object.entries(forecast).reduce((result: Record<string, number>, [date, unitsSold]) => {
        const weekYear = `${moment(date).year()}-${moment(date).format('MM')}`
        result[weekYear] = (result[weekYear] || 0) + Math.ceil(unitsSold)
        return result
      }, {})
    : {}

  const timeLineSorted = grouping === 'daily' ? dailytimeLineSorted : grouping === 'weekly' ? weeklyTimeLineSorted : monthlyTimeLineSorted
  const forecastSorted = grouping === 'daily' ? dailytimeForecast : grouping === 'weekly' ? weeklyForecast : monthlyForecast

  useEffect(() => {
    if (grouping === 'daily') {
      setcurrentDateIndex(Object.keys(timeLineSorted).indexOf(today))
    } else if (grouping === 'weekly') {
      setcurrentDateIndex(Object.keys(timeLineSorted).indexOf(currentStartOfWeek))
    } else if (grouping === 'monthly') {
      setcurrentDateIndex(Object.keys(timeLineSorted).indexOf(currentMonth))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [grouping])

  const timeLineKeys = Object.keys(timeLineSorted)
  const forecastKeys = Object.keys(forecastSorted)
  const allDates = Array.from(new Set([...timeLineKeys, ...forecastKeys])).sort()

  const minTimestamp = timeLineKeys.length ? new Date(timeLineKeys[0]).getTime() : undefined
  const maxTimestamp = timeLineKeys.length ? new Date(timeLineKeys[timeLineKeys.length - 1]).getTime() : undefined

  const chartData = allDates.map((date) => {
    const idx = timeLineKeys.indexOf(date)
    const withinRange = idx !== -1 && idx <= currentDateIndex
    const item = timeLineSorted[date]
    return {
      date,
      timestamp: new Date(date).getTime(),
      unitsSold: withinRange && item ? item.unitsSold : null,
      dailyStock: withinRange && item ? item.dailyStock + item.dailyStockFBA : null,
      forecast: forecastSorted[date] !== undefined ? forecastSorted[date] : null,
    }
  })

  return (
    <>
      <div className='px-6 m-0 flex flex-row justify-start items-center gap-2'>
        <Button size='sm' variant={grouping === 'daily' ? 'default' : 'light'} onClick={() => setGrouping('daily')}>
          Daily
        </Button>
        <Button size='sm' variant={grouping === 'weekly' ? 'default' : 'light'} onClick={() => setGrouping('weekly')}>
          Weekly
        </Button>
        <Button size='sm' variant={grouping === 'monthly' ? 'default' : 'light'} onClick={() => setGrouping('monthly')}>
          Monthly
        </Button>
      </div>
      <ChartContainer config={chartConfig} className='h-[330px] w-full aspect-auto'>
        <LineChart accessibilityLayer data={chartData} margin={{ top: 24, right: 16, left: 8, bottom: 8 }}>
          <CartesianGrid vertical={false} strokeDasharray='3 3' />
          <XAxis
            dataKey='timestamp'
            type='number'
            domain={minTimestamp !== undefined && maxTimestamp !== undefined ? [minTimestamp, maxTimestamp] : ['dataMin', 'dataMax']}
            tickFormatter={(value) => new Date(value).toLocaleDateString()}
            tickLine={false}
            axisLine={false}
          />
          <YAxis yAxisId='left' tickLine={false} axisLine={false} width={60} tickFormatter={(value) => FormatIntNumber(state?.currentRegion, Number(value) || 0)} />
          <YAxis yAxisId='right' orientation='right' tickLine={false} axisLine={false} width={60} tickFormatter={(value) => FormatIntNumber(state?.currentRegion, Number(value) || 0)} />
          <ChartTooltip
            cursor={{ stroke: 'var(--muted-foreground)', strokeDasharray: '4 4' }}
            content={
              <ChartTooltipContent
                labelFormatter={(_, payload) => payload?.[0]?.payload?.date}
                formatter={(value, name) => (
                  <>
                    <span className='text-muted-foreground'>{chartConfig[name as keyof typeof chartConfig]?.label || name}</span>
                    <span className='ml-auto font-mono font-medium text-foreground tabular-nums'>{FormatIntNumber(state?.currentRegion, Number(value) || 0)}</span>
                  </>
                )}
              />
            }
          />
          <ChartLegend content={<ChartLegendContent />} />
          <ReferenceLine
            yAxisId='left'
            x={new Date(today).getTime()}
            stroke={EVENT_COLORS.today}
            strokeDasharray='2 2'
            label={<TimelineMarkerLabel label='Today' color={EVENT_COLORS.today} />}
          />
          <ReferenceLine
            yAxisId='left'
            x={new Date(dateAfterLeadTime).getTime()}
            stroke={EVENT_COLORS.leadTime}
            strokeDasharray='2 2'
            label={<TimelineMarkerLabel label='Lead Time' color={EVENT_COLORS.leadTime} />}
          />
          <ReferenceLine
            yAxisId='left'
            x={new Date(OutOfStockDate).getTime()}
            stroke={EVENT_COLORS.outOfStock}
            strokeDasharray='2 2'
            label={<TimelineMarkerLabel label='Out Of Stock' color={EVENT_COLORS.outOfStock} />}
          />
          {Object.entries(poDates).map(([date]) => {
            const arrivalDate = moment(date).startOf('day').add(leadtime, 'days').format('YYYY-MM-DD')
            return (
              <ReferenceLine
                key={date}
                yAxisId='left'
                x={new Date(arrivalDate).getTime()}
                stroke={EVENT_COLORS.poArrival}
                strokeDasharray='2 2'
                label={<TimelineMarkerLabel label='PO Arrival' color={EVENT_COLORS.poArrival} />}
              />
            )
          })}
          <Line
            yAxisId='left'
            dataKey='unitsSold'
            type='monotone'
            stroke='var(--color-unitsSold)'
            strokeWidth={2}
            dot={grouping === 'daily' ? false : { r: 4 }}
            name='unitsSold'
            isAnimationActive={false}
          />
          <Line
            yAxisId='left'
            dataKey='forecast'
            type='monotone'
            stroke='var(--color-forecast)'
            strokeWidth={2}
            dot={grouping === 'daily' ? false : { r: 4 }}
            connectNulls
            name='forecast'
            isAnimationActive={false}
          />
          <Line
            yAxisId='right'
            dataKey='dailyStock'
            type='monotone'
            stroke='var(--color-dailyStock)'
            strokeWidth={3}
            dot={grouping === 'daily' ? false : { r: 4 }}
            name='dailyStock'
            isAnimationActive={false}
          />
        </LineChart>
      </ChartContainer>
    </>
  )
}

export default ReorderingPointsTimeLine
