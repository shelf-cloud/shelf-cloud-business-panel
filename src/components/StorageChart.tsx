import { useContext } from 'react'
import { CartesianGrid, Line, LineChart, XAxis } from 'recharts'

import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/shadcn/ui/chart'

import AppContext from '@context/AppContext'
import { FormatCurrency } from '@lib/FormatNumbers'

type Props = {
  storageInvoices: number[]
  storageDates: string[]
}

const chartConfig = {
  value: {
    label: 'Storage Fees',
    color: '#3577f1',
  },
} satisfies ChartConfig

function StorageChart({ storageInvoices, storageDates }: Props) {
  const { state }: any = useContext(AppContext)

  const chartData = (storageDates || []).map((date, index) => ({
    date,
    value: Number(storageInvoices?.[index]) || 0,
  }))

  return (
    <ChartContainer config={chartConfig} className='h-[180px] w-full aspect-auto'>
      <LineChart accessibilityLayer data={chartData} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
        <CartesianGrid vertical={false} strokeDasharray='3 3' />
        <XAxis dataKey='date' tickLine={false} axisLine={false} hide />
        <ChartTooltip
          cursor={{ stroke: 'var(--muted-foreground)', strokeDasharray: '4 4' }}
          content={
            <ChartTooltipContent
              labelFormatter={(_, payload) => payload?.[0]?.payload?.date}
              formatter={(value) => (
                <>
                  <span className='text-muted-foreground'>{chartConfig.value.label}</span>
                  <span className='ml-auto font-mono font-medium text-foreground tabular-nums'>{FormatCurrency(state?.currentRegion, Number(value) || 0)}</span>
                </>
              )}
            />
          }
        />
        <Line dataKey='value' type='monotone' stroke='var(--color-value)' strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 5 }} name='value' isAnimationActive={false} />
      </LineChart>
    </ChartContainer>
  )
}

export default StorageChart
