import { useContext } from 'react'
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts'

import { ChartConfig, ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from '@/components/shadcn/ui/chart'

import AppContext from '@context/AppContext'
import { FormatIntNumber } from '@lib/FormatNumbers'

type Props = {
  dates: string[]
  dailyQty: number[]
  dailySellerValue: number[]
  dailyLandedValue: number[]
}

const chartConfig = {
  dailySellerValue: { label: 'Daily Seller Value', color: '#3577f1' },
  dailyLandedValue: { label: 'Daily Landed Value', color: '#0ab39c' },
  dailyQty: { label: 'Daily Qty', color: '#f7b84b' },
} satisfies ChartConfig

function ProductsQtyTimeline({ dates, dailyQty, dailySellerValue, dailyLandedValue }: Props) {
  const { state }: any = useContext(AppContext)

  const chartData = (dates || []).map((date, index) => ({
    date: new Date(date).getTime(),
    dailySellerValue: Number(dailySellerValue?.[index]) || 0,
    dailyLandedValue: Number(dailyLandedValue?.[index]) || 0,
    dailyQty: Number(dailyQty?.[index]) || 0,
  }))

  return (
    <ChartContainer config={chartConfig} className='h-[400px] w-full aspect-auto'>
      <LineChart accessibilityLayer data={chartData} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
        <CartesianGrid vertical={false} strokeDasharray='3 3' />
        <XAxis dataKey='date' type='number' domain={['dataMin', 'dataMax']} tickFormatter={(value) => new Date(value).toLocaleDateString()} tickLine={false} axisLine={false} />
        <YAxis yAxisId='left' tickLine={false} axisLine={false} width={70} tickFormatter={(value) => FormatIntNumber(state?.currentRegion, Number(value) || 0)} />
        <YAxis yAxisId='right' orientation='right' tickLine={false} axisLine={false} width={70} tickFormatter={(value) => FormatIntNumber(state?.currentRegion, Number(value) || 0)} />
        <ChartTooltip
          cursor={{ stroke: 'var(--muted-foreground)', strokeDasharray: '4 4' }}
          content={
            <ChartTooltipContent
              labelFormatter={(value) => new Date(value).toLocaleDateString()}
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
        <Line yAxisId='left' dataKey='dailySellerValue' type='monotone' stroke='var(--color-dailySellerValue)' strokeWidth={3} dot={{ r: 3 }} name='dailySellerValue' isAnimationActive={false} />
        <Line yAxisId='left' dataKey='dailyLandedValue' type='monotone' stroke='var(--color-dailyLandedValue)' strokeWidth={3} dot={{ r: 3 }} name='dailyLandedValue' isAnimationActive={false} />
        <Line yAxisId='right' dataKey='dailyQty' type='monotone' stroke='var(--color-dailyQty)' strokeWidth={3} dot={{ r: 3 }} name='dailyQty' isAnimationActive={false} />
      </LineChart>
    </ChartContainer>
  )
}

export default ProductsQtyTimeline
