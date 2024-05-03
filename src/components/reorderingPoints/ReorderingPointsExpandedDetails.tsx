import AppContext from '@context/AppContext'
import { ReorderingPointsProduct } from '@typesTs/reorderingPoints/reorderingPoints'
import React, { useContext } from 'react'
import { ExpanderComponentProps } from 'react-data-table-component'
import { Card, CardBody, CardHeader, Col, Row } from 'reactstrap'
import { FormatCurrency, FormatIntNumber } from '@lib/FormatNumbers'
import ReorderingPointsTimeLine from './ReorderingPointsTimeLine'

type Props = {
  data: ReorderingPointsProduct
}

const ReorderingPointsExpandedDetails: React.FC<ExpanderComponentProps<ReorderingPointsProduct>> = ({ data }: Props) => {
  const { state }: any = useContext(AppContext)
  return (
    <div style={{ backgroundColor: '#F0F4F7', padding: '10px' }}>
      <Row>
        <Col xs={4}>
          <Card>
            <CardHeader className='py-3'>
              <h5 className='fw-semibold m-0'>Product Details</h5>
              <div className='mt-2 d-flex flex-column justify-content-start align-items-start gap-1'>
                <span className='fs-7'>
                  <span className='fw-semibold'>{`Unit Volume: `}</span>
                  {`${FormatIntNumber(state.currentRegion, data.itemVolume)} ${state.currentRegion === 'us' ? 'in' : 'cm'}`}
                </span>
                <span className='fs-7'>
                  <span className='fw-semibold'>{`Box Volume: `}</span>
                  {`${FormatIntNumber(state.currentRegion, data.itemBoxVolume)} ${state.currentRegion === 'us' ? 'in' : 'cm'}`}
                </span>
              </div>
            </CardHeader>
            <CardBody style={{ overflowX: 'scroll', scrollbarWidth: 'none' }}>
              <table className='table table-sm table-border table-nowrap mb-0 fs-7'>
                <thead>
                  <tr>
                    <th className='w-fit text-wrap'>Marketplace</th>
                    <th className='w-fit text-end'>Gross Revenue</th>
                    <th className='w-fit text-end'>Net Profit</th>
                    <th className='w-fit text-end'>Units Sold</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.values(data.marketplaces)
                    .sort((marketpalceA, marketpalceB) => (marketpalceA.totalUnitsSold > marketpalceB.totalUnitsSold ? -1 : 1))
                    .map(
                      (marketplace, index) =>
                        marketplace.totalUnitsSold > 0 && (
                          <tr key={index}>
                            <td className='w-50 text-wrap'>{marketplace.name}</td>
                            <td className='text-end align-bottom'>{FormatCurrency(state.currentRegion, marketplace.grossRevenue)}</td>
                            <td className='text-end align-bottom'>{FormatCurrency(state.currentRegion, marketplace.grossRevenue - marketplace.expenses)}</td>
                            <td className='text-center align-bottom'>{FormatIntNumber(state.currentRegion, marketplace.totalUnitsSold)}</td>
                          </tr>
                        )
                    )}
                </tbody>
                <tfoot>
                  <tr>
                    <td className='fw-bold text-end'>Total</td>
                    <td className='text-end'>{FormatCurrency(state.currentRegion, data.grossRevenue)}</td>
                    <td className='text-end'>{FormatCurrency(state.currentRegion, data.grossRevenue - data.expenses)}</td>
                    <td className='text-center'>{FormatIntNumber(state.currentRegion, data.unitsSold)}</td>
                  </tr>
                </tfoot>
              </table>
            </CardBody>
          </Card>
        </Col>
        <Col xs={8}>
          <Card>
            <CardHeader className='py-3'>
              <h5 className='fw-semibold m-0'>Performance Timeline</h5>
            </CardHeader>
            <CardBody>
              <ReorderingPointsTimeLine productTimeLine={data.dateList} leadtime={data.leadTime} daysRemaining={data.daysRemaining} poDates={data.poDates} forecast={data.forecast}/>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default ReorderingPointsExpandedDetails
