import AppContext from '@context/AppContext'
import { ReorderingPointsProduct } from '@typesTs/reorderingPoints/reorderingPoints'
import React, { useContext } from 'react'
import { ExpanderComponentProps } from 'react-data-table-component'
import { Card, CardBody, CardHeader, Col, Row, UncontrolledTooltip } from 'reactstrap'
import { FormatCurrency, FormatIntNumber } from '@lib/FormatNumbers'
import ReorderingPointsTimeLine from './ReorderingPointsTimeLine'
import { CleanSpecialCharacters } from '@lib/SkuFormatting'

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
                  {`${FormatIntNumber(state.currentRegion, data.itemVolume)} ${state.currentRegion === 'us' ? 'in³' : 'cm³'}`}
                </span>
                <span className='fs-7'>
                  <span className='fw-semibold'>{`Box Volume: `}</span>
                  {`${FormatIntNumber(state.currentRegion, data.itemBoxVolume)} ${state.currentRegion === 'us' ? 'in³' : 'cm³'}`}
                </span>
              </div>
            </CardHeader>
            <CardBody style={{ overflowX: 'scroll', scrollbarWidth: 'none' }}>
              <p className='m-0 p-0 fw-bold'>Sales By Marketplaces</p>
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
                    <td className='text-end'>
                      <i className='fs-6 me-1 text-primary las la-info-circle' style={{ cursor: 'pointer' }} id={`salesTotalMsj${CleanSpecialCharacters(data.sku)}`} />
                      <UncontrolledTooltip
                        placement='top'
                        target={`salesTotalMsj${CleanSpecialCharacters(data.sku)}`}
                        innerClassName='bg-white border border-info border-opacity-50 p-2'>
                        <p className='fs-7 text-primary m-0 p-0 mb-0'>{`Storage Cost: ${FormatCurrency(state.currentRegion, data.storageCost)}`}</p>
                      </UncontrolledTooltip>
                      {FormatCurrency(state.currentRegion, data.grossRevenue - data.expenses - data.storageCost)}
                    </td>
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
              <ReorderingPointsTimeLine
                productTimeLine={data.dateList}
                leadtime={data.leadTime}
                daysRemaining={data.daysRemaining}
                poDates={data.poDates}
                forecast={data.forecast}
                bestModel={data.forecastModel}
              />
            </CardBody>
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default ReorderingPointsExpandedDetails
