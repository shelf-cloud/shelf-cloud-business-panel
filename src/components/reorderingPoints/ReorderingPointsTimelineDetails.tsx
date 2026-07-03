import { useContext } from 'react'

import AppContext from '@context/AppContext'
import { ExpandedRowProps } from '@hooks/reorderingPoints/useRPProductSale'
import { useRPProductTimeline } from '@hooks/reorderingPoints/useRPProductTimeline'
import { ReorderingPointsProduct } from '@typesTs/reorderingPoints/reorderingPoints'
import { Card, CardContent, CardHeader } from '@shadcn/ui/card'
import { Spinner } from '@shadcn/ui/spinner'

import ReorderingPointsTimeLine from './ReorderingPointsTimeLine'

type Props = {
  data: ReorderingPointsProduct
  expandedRowProps?: ExpandedRowProps
}

const ReorderingPointsTimelineDetails = ({ data, expandedRowProps }: Props) => {
  const { state }: any = useContext(AppContext)
  const { session } = expandedRowProps!
  const { productTimeline, isLoadingProductsTimeline } = useRPProductTimeline({ session, state, sku: data.sku })
  return (
    <div className='px-3 w-2/3'>
      <Card>
        <CardHeader className='py-3'>
          <h5 className='font-semibold m-0'>Performance Timeline</h5>
        </CardHeader>
        {!isLoadingProductsTimeline && productTimeline ? (
          <CardContent>
            <ReorderingPointsTimeLine
              productTimeLine={productTimeline?.dateList ?? []}
              leadtime={data.leadTime}
              daysRemaining={data.daysRemaining}
              poDates={data.poDates}
              forecast={data.dailyTotalForecast}
              bestModel={data.forecastModel}
            />
          </CardContent>
        ) : (
          <CardContent>
            <p>
              <Spinner className='text-primary' />
              Loading Sales...
            </p>
          </CardContent>
        )}
      </Card>
    </div>
  )
}

export default ReorderingPointsTimelineDetails
