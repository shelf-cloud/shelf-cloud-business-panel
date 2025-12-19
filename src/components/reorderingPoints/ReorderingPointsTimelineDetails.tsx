import { useContext } from 'react'

import AppContext from '@context/AppContext'
import { ExpandedRowProps } from '@hooks/reorderingPoints/useRPProductSale'
import { useRPProductTimeline } from '@hooks/reorderingPoints/useRPProductTimeline'
import { ReorderingPointsProduct } from '@typesTs/reorderingPoints/reorderingPoints'
import { Card, CardBody, CardHeader, Col, Spinner } from 'reactstrap'

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
    <Col xs={8}>
      <Card>
        <CardHeader className='py-3'>
          <h5 className='fw-semibold m-0'>Performance Timeline</h5>
        </CardHeader>
        {!isLoadingProductsTimeline && productTimeline ? (
          <CardBody>
            <ReorderingPointsTimeLine
              productTimeLine={productTimeline?.dateList ?? []}
              leadtime={data.leadTime}
              daysRemaining={data.daysRemaining}
              poDates={data.poDates}
              forecast={data.dailyTotalForecast}
              bestModel={data.forecastModel}
            />
          </CardBody>
        ) : (
          <CardBody>
            <p>
              <Spinner color='primary' size={'sm'} />
              Loading Sales...
            </p>
          </CardBody>
        )}
      </Card>
    </Col>
  )
}

export default ReorderingPointsTimelineDetails
