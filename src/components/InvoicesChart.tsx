import { useContext } from 'react'
import { Cell, Pie, PieChart } from 'recharts'

import { ChartConfig, ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from '@/components/shadcn/ui/chart'

import AppContext from '@context/AppContext'
import { FormatCurrency } from '@lib/FormatNumbers'

type Props = {
  billingStatus: number[]
}

const LABELS = ['Pending Payment', 'Overdue Payment', 'Not Invoiced']
const COLORS = ['#0AB39C', '#F06548', '#4481FD']

const chartConfig = {
  'Pending Payment': { label: 'Pending Payment', color: COLORS[0] },
  'Overdue Payment': { label: 'Overdue Payment', color: COLORS[1] },
  'Not Invoiced': { label: 'Not Invoiced', color: COLORS[2] },
} satisfies ChartConfig

function InvoicesChart({ billingStatus }: Props) {
  const { state }: any = useContext(AppContext)

  const chartData = LABELS.map((label, index) => ({
    name: label,
    value: Number(billingStatus?.[index]) || 0,
    fill: COLORS[index],
  }))

  return (
    <ChartContainer config={chartConfig} className='h-[280px] w-full aspect-auto'>
      <PieChart accessibilityLayer margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
        <ChartTooltip
          content={
            <ChartTooltipContent
              nameKey='name'
              formatter={(value, name) => (
                <>
                  <span className='text-muted-foreground'>{name}</span>
                  <span className='ml-auto font-mono font-medium text-foreground tabular-nums'>{FormatCurrency(state?.currentRegion, Number(value) || 0)}</span>
                </>
              )}
            />
          }
        />
        <Pie data={chartData} dataKey='value' nameKey='name' label={({ value }) => FormatCurrency(state?.currentRegion, Number(value) || 0)} isAnimationActive={false}>
          {chartData.map((entry) => (
            <Cell key={entry.name} fill={entry.fill} />
          ))}
        </Pie>
        <ChartLegend content={<ChartLegendContent nameKey='name' />} />
      </PieChart>
    </ChartContainer>
  )
}

export default InvoicesChart
