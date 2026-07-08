import { useContext } from 'react'
import { Bar, BarChart, CartesianGrid, LabelList, XAxis, YAxis } from 'recharts'

import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/shadcn/ui/chart'

import AppContext from '@context/AppContext'
import { FormatCurrency } from '@lib/FormatNumbers'

type TotalCharges = {
  totalpickpackCharge?: number
  totalshippingCharge?: number
  totallabeling?: number
  totalmanHour?: number
  totalextraCharge?: number
  totalreceivingService?: number
  totalreceivingPallets?: number
  totalreceivingWrapService?: number
}

type Props = {
  totalCharges?: TotalCharges
}

const chartConfig = {
  value: {
    label: 'Charge',
    color: '#E8F4FE',
  },
} satisfies ChartConfig

function ChargesChart({ totalCharges }: Props) {
  const { state }: any = useContext(AppContext)

  const chartData = [
    { name: 'Pick and Pack', value: Number(totalCharges?.totalpickpackCharge) || 0 },
    { name: 'Shipping', value: Number(totalCharges?.totalshippingCharge) || 0 },
    { name: 'Labeling', value: Number(totalCharges?.totallabeling) || 0 },
    { name: 'Man Hours', value: Number(totalCharges?.totalmanHour) || 0 },
    { name: 'Extra Charges', value: Number(totalCharges?.totalextraCharge) || 0 },
    {
      name: 'Receiving',
      value: Number((totalCharges?.totalreceivingService || 0) + (totalCharges?.totalreceivingPallets || 0) + (totalCharges?.totalreceivingWrapService || 0)),
    },
  ]

  return (
    <ChartContainer config={chartConfig} className='h-[280px] w-full aspect-auto'>
      <BarChart accessibilityLayer data={chartData} layout='vertical' margin={{ top: 8, right: 32, left: 8, bottom: 8 }}>
        <CartesianGrid horizontal={false} stroke='#000' />
        <XAxis type='number' hide />
        <YAxis dataKey='name' type='category' tickLine={false} axisLine={false} width={100} style={{ fontSize: '14px', fontWeight: 400 }} />
        <ChartTooltip
          cursor={{ fill: 'var(--muted)' }}
          content={
            <ChartTooltipContent
              formatter={(value) => (
                <>
                  <span className='text-muted-foreground'>{chartConfig.value.label}</span>
                  <span className='ml-auto font-mono font-medium text-foreground tabular-nums'>{FormatCurrency(state?.currentRegion, Number(value) || 0)}</span>
                </>
              )}
            />
          }
        />
        <Bar dataKey='value' fill='var(--color-value)' radius={2} name='value' isAnimationActive={false}>
          <LabelList
            dataKey='value'
            position='insideLeft'
            formatter={(value: number) => (value > 0 ? FormatCurrency(state?.currentRegion, value) : '')}
            style={{ fill: '#000', fontSize: '14px', fontWeight: 'bold' }}
          />
        </Bar>
      </BarChart>
    </ChartContainer>
  )
}

export default ChargesChart
