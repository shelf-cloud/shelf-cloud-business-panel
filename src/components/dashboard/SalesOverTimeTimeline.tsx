import { useContext } from 'react'
import { Area, CartesianGrid, ComposedChart, Line, XAxis, YAxis } from 'recharts'

import { ChartConfig, ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from '@/components/shadcn/ui/chart'

import AppContext from '@context/AppContext'
import { FormatCurrency } from '@lib/FormatNumbers'
import moment from 'moment'

const TIMELINE = [
  '12 AM',
  '1 AM',
  '2 AM',
  '3 AM',
  '4 AM',
  '5 AM',
  '6 AM',
  '7 AM',
  '8 AM',
  '9 AM',
  '10 AM',
  '11 AM',
  '12 PM',
  '1 PM',
  '2 PM',
  '3 PM',
  '4 PM',
  '5 PM',
  '6 PM',
  '7 PM',
  '8 PM',
  '9 PM',
  '10 PM',
  '11 PM',
]

const CUURENTHOUR = moment().format('h A')

const chartConfig = {
  Today: { label: 'Today', color: '#3577f1' },
  Yesterday: { label: 'Yesterday', color: '#999d9c' },
} satisfies ChartConfig

type Props = {
  salesOverTime?: { [key: string]: { [key: string]: number } }
}
const SalesOverTimeTimeline = ({ salesOverTime }: Props) => {
  const { state }: any = useContext(AppContext)
  const currentHourIndex = TIMELINE.indexOf(CUURENTHOUR)
  const YESTERDAY = moment.utc().local().subtract(1, 'days').format('YYYY-MM-DD')
  const TODAY = moment.utc().local().format('YYYY-MM-DD')

  const todayValues = salesOverTime?.[TODAY] ? Object.values(salesOverTime[TODAY]) : []
  const yesterdayValues = salesOverTime?.[YESTERDAY] ? Object.values(salesOverTime[YESTERDAY]) : []

  const chartData = TIMELINE.map((hour, index) => ({
    hour,
    Today: index <= currentHourIndex ? Number(todayValues[index]) || 0 : null,
    Yesterday: yesterdayValues[index] !== undefined ? Number(yesterdayValues[index]) || 0 : null,
  }))

  return (
    <div style={{ width: '100%', height: '315px' }}>
      <ChartContainer config={chartConfig} className='h-[300px] w-full aspect-auto'>
        <ComposedChart accessibilityLayer data={chartData} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
          <CartesianGrid vertical={false} strokeDasharray='3 3' />
          <XAxis dataKey='hour' tickLine={false} axisLine={false} tickMargin={8} />
          <YAxis
            tickLine={false}
            axisLine={false}
            width={70}
            tickFormatter={(value) => FormatCurrency(state?.currentRegion, Number(value) || 0)}
          />
          <ChartTooltip
            cursor={{ stroke: 'var(--muted-foreground)', strokeDasharray: '4 4' }}
            content={
              <ChartTooltipContent
                formatter={(value, name) => (
                  <>
                    <span className='text-muted-foreground'>{chartConfig[name as keyof typeof chartConfig]?.label || name}</span>
                    <span className='ml-auto font-mono font-medium text-foreground tabular-nums'>{FormatCurrency(state?.currentRegion, Number(value) || 0)}</span>
                  </>
                )}
              />
            }
          />
          <ChartLegend content={<ChartLegendContent />} />
          <defs>
            <linearGradient id='yesterdayFill' x1='0' y1='0' x2='0' y2='1'>
              <stop offset='5%' stopColor='var(--color-Yesterday)' stopOpacity={0.05} />
              <stop offset='95%' stopColor='var(--color-Yesterday)' stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <Area
            dataKey='Yesterday'
            type='monotone'
            stroke='var(--color-Yesterday)'
            strokeWidth={1}
            strokeDasharray='5 5'
            fill='url(#yesterdayFill)'
            dot={{ r: 3 }}
            connectNulls
            name='Yesterday'
            isAnimationActive={false}
          />
          <Line dataKey='Today' type='monotone' stroke='var(--color-Today)' strokeWidth={2} dot={{ r: 3 }} connectNulls name='Today' isAnimationActive={false} />
        </ComposedChart>
      </ChartContainer>
    </div>
  )
}

export default SalesOverTimeTimeline
