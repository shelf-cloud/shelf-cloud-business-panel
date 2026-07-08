import { useContext, useState } from 'react'
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts'

import { ChartConfig, ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from '@/components/shadcn/ui/chart'

import AppContext from '@context/AppContext'
import { FormatCurrency, FormatIntNumber } from '@lib/FormatNumbers'
import moment from 'moment'
import { Button } from '@shadcn/ui/button'

type TimeLineEntry = {
  grossRevenue: number
  expenses: number
  unitsSold: number
}

type Props = {
  productTimeLine: Record<string, TimeLineEntry>
}

const chartConfig = {
  grossRevenue: { label: 'Gross Revenue', color: '#3577f1' },
  expenses: { label: 'Expenses', color: '#f06548' },
  profit: { label: 'Profit', color: '#0ab39c' },
  units: { label: 'Units', color: '#f7b84b' },
} satisfies ChartConfig

const ProductPerformanceTimeline = ({ productTimeLine }: Props) => {
  const { state }: any = useContext(AppContext)
  const [grouping, setGrouping] = useState<'daily' | 'weekly' | 'monthly'>('daily')

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
          grossRevenue: productTimeLine[key].grossRevenue,
          expenses: productTimeLine[key].expenses,
          unitsSold: productTimeLine[key].unitsSold,
        }
      } else {
        result[weekYear].grossRevenue += productTimeLine[key].grossRevenue
        result[weekYear].expenses += productTimeLine[key].expenses
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
          grossRevenue: productTimeLine[key].grossRevenue,
          expenses: productTimeLine[key].expenses,
          unitsSold: productTimeLine[key].unitsSold,
        }
      } else {
        result[weekYear].grossRevenue += productTimeLine[key].grossRevenue
        result[weekYear].expenses += productTimeLine[key].expenses
        result[weekYear].unitsSold += productTimeLine[key].unitsSold
      }
      return result
    }, {})

  const timeLineSorted = grouping === 'daily' ? dailytimeLineSorted : grouping === 'weekly' ? weeklyTimeLineSorted : monthlyTimeLineSorted

  const chartData = Object.entries(timeLineSorted).map(([date, item]) => ({
    date,
    timestamp: new Date(date).getTime(),
    grossRevenue: Number(Number(item.grossRevenue).toFixed(2)),
    expenses: Number(Number(item.expenses).toFixed(2)),
    profit: Number(Number(item.grossRevenue - item.expenses).toFixed(2)),
    units: Number(Number(item.unitsSold).toFixed(2)),
  }))

  const currencyKeys = new Set(['grossRevenue', 'expenses', 'profit'])

  return (
    <>
      <div className='px-4 m-0 flex flex-row justify-start items-center gap-2'>
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
        <LineChart accessibilityLayer data={chartData} margin={{ top: 8, right: 16, left: 8, bottom: 8 }}>
          <CartesianGrid vertical={false} strokeDasharray='3 3' />
          <XAxis dataKey='timestamp' type='number' domain={['dataMin', 'dataMax']} tickFormatter={(value) => new Date(value).toLocaleDateString()} tickLine={false} axisLine={false} />
          <YAxis yAxisId='left' tickLine={false} axisLine={false} width={70} tickFormatter={(value) => FormatCurrency(state?.currentRegion, Number(value) || 0)} />
          <YAxis yAxisId='right' orientation='right' tickLine={false} axisLine={false} width={60} tickFormatter={(value) => FormatIntNumber(state?.currentRegion, Number(value) || 0)} />
          <ChartTooltip
            cursor={{ stroke: 'var(--muted-foreground)', strokeDasharray: '4 4' }}
            content={
              <ChartTooltipContent
                labelFormatter={(_, payload) => payload?.[0]?.payload?.date}
                formatter={(value, name) => (
                  <>
                    <span className='text-muted-foreground'>{chartConfig[name as keyof typeof chartConfig]?.label || name}</span>
                    <span className='ml-auto font-mono font-medium text-foreground tabular-nums'>
                      {currencyKeys.has(String(name)) ? FormatCurrency(state?.currentRegion, Number(value) || 0) : FormatIntNumber(state?.currentRegion, Number(value) || 0)}
                    </span>
                  </>
                )}
              />
            }
          />
          <ChartLegend content={<ChartLegendContent />} />
          <Line yAxisId='left' dataKey='grossRevenue' type='monotone' stroke='var(--color-grossRevenue)' strokeWidth={2} dot={grouping === 'daily' ? false : { r: 4 }} name='grossRevenue' isAnimationActive={false} />
          <Line yAxisId='left' dataKey='expenses' type='monotone' stroke='var(--color-expenses)' strokeWidth={2} dot={grouping === 'daily' ? false : { r: 4 }} name='expenses' isAnimationActive={false} />
          <Line yAxisId='left' dataKey='profit' type='monotone' stroke='var(--color-profit)' strokeWidth={2} dot={grouping === 'daily' ? false : { r: 4 }} name='profit' isAnimationActive={false} />
          <Line yAxisId='right' dataKey='units' type='monotone' stroke='var(--color-units)' strokeWidth={2} dot={grouping === 'daily' ? false : { r: 4 }} name='units' isAnimationActive={false} />
        </LineChart>
      </ChartContainer>
    </>
  )
}

export default ProductPerformanceTimeline
