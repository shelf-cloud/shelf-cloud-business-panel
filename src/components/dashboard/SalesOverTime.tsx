import React, { useContext } from 'react'
// import Link from 'next/link'
import { Card, CardBody, CardHeader, Col, UncontrolledTooltip } from 'reactstrap'
import AppContext from '@context/AppContext'
import moment from 'moment'
import CountUp from 'react-countup'
import SalesOverTimeTimeline from './SalesOverTimeTimeline'
import { SalesOverTimeMarketplace, SalesOverTimeResponse } from '@typesTs/dashboard/salesOverTime'
import { FormatCurrency } from '@lib/FormatNumbers'

type Props = {
  salesOverTime: SalesOverTimeResponse
}

const SalesOverTime = ({ salesOverTime }: Props) => {
  const { state }: any = useContext(AppContext)
  const currentDate = moment.utc().local().format('YYYY-MM-DD')
  const previousDate = moment.utc().local().subtract(1, 'days').format('YYYY-MM-DD')
  console.log(currentDate, previousDate)
  const totalToday = salesOverTime?.orders[currentDate] ? Object.values(salesOverTime?.orders[currentDate]).reduce((a, b) => a + b, 0) : 0
  const totalYesterday = salesOverTime?.orders[previousDate] ? Object.values(salesOverTime?.orders[previousDate]).reduce((a, b) => a + b, 0) : 0

  const currentSortedMarketplaces = Object.values(salesOverTime.marketplaces)
    .sort((a, b) => {
      if (a.salesOverTime[currentDate] > b.salesOverTime[currentDate]) {
        return -1
      }
      if (a.salesOverTime[currentDate] < b.salesOverTime[currentDate]) {
        return 1
      }
      return 0
    })
    .filter((marketplace: SalesOverTimeMarketplace) => marketplace.salesOverTime[currentDate] > 0)

  const previousSortedMarketplaces = Object.values(salesOverTime.marketplaces)
    .sort((a, b) => {
      if (a.salesOverTime[previousDate] > b.salesOverTime[previousDate]) {
        return -1
      }
      if (a.salesOverTime[previousDate] < b.salesOverTime[previousDate]) {
        return 1
      }
      return 0
    })
    .filter((marketplace: SalesOverTimeMarketplace) => marketplace.salesOverTime[previousDate] > 0)

  let salesDiff = 0
  if (totalToday > 0 && totalYesterday > 0) {
    salesDiff = ((totalToday - totalYesterday) / totalYesterday) * 100
  }
  return (
    <React.Fragment>
      <Col>
        <Card>
          <CardHeader className='align-items-center d-flex justify-content-between'>
            <h4 className='card-title mb-0 flex-grow-1'>Sales Over Time</h4>
            <span className='fs-6 text-muted fw-normal'>
              <i className='las la-clock fs-5 me-1'></i>
              {moment().format('h:mm a')}
            </span>
          </CardHeader>

          <CardBody className='pb-0'>
            <div className='d-flex flex-row justify-content-start align-items-base gap-4'>
              <div id={'SalesOverTimeCurrent'}>
                <p className='m-0 p-0 fw-medium'>
                  Today <span className={'fw-semibold fs-7 ms-2 ' + (salesDiff > 0 ? 'text-success' : 'text-danger')}>{salesDiff.toFixed(2)}%</span>
                </p>
                <p className='m-0 p-0 fw-semibold fs-5'>
                  <span className='counter-value'>
                    <CountUp
                      start={0}
                      prefix={state.currentRegion == 'us' ? '$ ' : ''}
                      suffix={state.currentRegion == 'eu' ? ' €' : ''}
                      separator={state.currentRegion == 'us' ? '.' : ','}
                      end={totalToday}
                      decimals={2}
                      duration={1}
                    />
                  </span>
                </p>
              </div>
              <UncontrolledTooltip
                placement='right'
                target={'SalesOverTimeCurrent'}
                autohide={false}
                popperClassName='bg-white shadow px-3 pt-3 rounded-2'
                innerClassName='text-black bg-white p-0'
                style={{ maxHeight: '300px', overflowY: 'hidden', overflowX: 'hidden', scrollbarWidth: 'none' }}>
                <p className='fs-5 text-primary m-0 p-0 fw-bold mb-2'>Today</p>
                <table
                  className='pb-1 table table-striped table-bordered table-sm table-responsive text-nowrap shadow'
                  style={{ height: '270px', display: 'block', overflowY: 'scroll', overflowX: 'hidden', scrollbarWidth: 'none' }}>
                  <thead>
                    <tr>
                      <th>Marketplace</th>
                      <th>Sales</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentSortedMarketplaces.map((marketplace: SalesOverTimeMarketplace, index: number) => (
                      <tr key={index}>
                        <td className='text-start'>{marketplace.name}</td>
                        <td className='text-end'>{FormatCurrency(state.currentRegion, marketplace.salesOverTime[currentDate])}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </UncontrolledTooltip>
              <div id={'SalesOverTimePrevious'}>
                <p className='m-0 p-0 fw-medium'>Yesterday</p>
                <p className='m-0 p-0 fw-semibold fs-5'>
                  <span className='counter-value'>
                    <CountUp
                      start={0}
                      prefix={state.currentRegion == 'us' ? '$ ' : ''}
                      suffix={state.currentRegion == 'eu' ? ' €' : ''}
                      separator={state.currentRegion == 'us' ? '.' : ','}
                      end={totalYesterday}
                      decimals={2}
                      duration={1}
                    />
                  </span>
                </p>
              </div>
              <UncontrolledTooltip
                placement='right'
                target={'SalesOverTimePrevious'}
                autohide={false}
                popperClassName='bg-white shadow px-3 py-3 rounded-2'
                innerClassName='text-black bg-white p-0'
                style={{ maxHeight: '300px', overflowY: 'hidden', overflowX: 'hidden', scrollbarWidth: 'none' }}>
                <p className='fs-5 text-primary m-0 p-0 fw-bold mb-2'>Yesterday</p>
                <table
                  className='pb-1 table table-striped table-bordered table-sm table-responsive text-nowrap shadow'
                  style={{ height: '270px', display: 'block', overflowY: 'scroll', overflowX: 'hidden', scrollbarWidth: 'none' }}>
                  <thead>
                    <tr>
                      <th>Marketplace</th>
                      <th>Sales</th>
                    </tr>
                  </thead>
                  <tbody>
                    {previousSortedMarketplaces.map((marketplace: SalesOverTimeMarketplace, index: number) => (
                      <tr key={index}>
                        <td className='text-start'>{marketplace.name}</td>
                        <td className='text-end'>{FormatCurrency(state.currentRegion, marketplace.salesOverTime[previousDate])}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </UncontrolledTooltip>
            </div>
            <SalesOverTimeTimeline salesOverTime={salesOverTime.orders} />
          </CardBody>
        </Card>
      </Col>
    </React.Fragment>
  )
}

export default SalesOverTime
