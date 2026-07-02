import React, { useContext } from 'react'

import AppContext from '@context/AppContext'
import { FormatCurrency } from '@lib/FormatNumbers'
import { SalesOverTimeMarketplace, SalesOverTimeResponse } from '@typesTs/dashboard/salesOverTime'
import moment from 'moment'
import CountUp from 'react-countup'
// import Link from 'next/link'
import { Card, CardBody, CardHeader, Col, UncontrolledTooltip } from '@/components/migration-ui'

import SalesOverTimeTimeline from './SalesOverTimeTimeline'

type Props = {
  salesOverTime: SalesOverTimeResponse
}

const SalesOverTime = ({ salesOverTime }: Props) => {
  const { state }: any = useContext(AppContext)
  const currentDate = moment().startOf('day').format('YYYY-MM-DD')
  const previousDate = moment().startOf('day').subtract(1, 'days').format('YYYY-MM-DD')
  const totalToday = salesOverTime?.orders?.[currentDate] ? Object.values(salesOverTime?.orders[currentDate]).reduce((a, b) => a + b, 0) : 0
  const totalYesterday = salesOverTime?.orders?.[previousDate] ? Object.values(salesOverTime?.orders[previousDate]).reduce((a, b) => a + b, 0) : 0

  const currentSortedMarketplaces = Object.values(salesOverTime?.marketplaces || {})
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

  const previousSortedMarketplaces = Object.values(salesOverTime?.marketplaces || {})
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
          <CardHeader className='flex items-center justify-between'>
            <h4 className='grow mb-0 text-[16px] font-medium text-[#212529]'>Sales Over Time</h4>
            <span className='text-[13px] text-[color:var(--bs-secondary-color)] font-normal'>
              <i className='las la-clock text-[16.25px] me-1'></i>
              {moment().format('h:mm a')}
            </span>
          </CardHeader>

          <CardBody className='pb-0'>
            <div className='flex flex-row justify-start gap-6'>
              <div id={'SalesOverTimePrevious'}>
                <p className='m-0 p-0 font-medium'>Yesterday</p>
                <p className='m-0 p-0 font-semibold text-[16.25px]'>
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
                popperClassName='bg-white shadow-[0_1px_2px_rgba(56,65,74,0.15)] px-4 py-4 rounded-[4px]'
                innerClassName='text-black bg-white p-0'
                style={{ maxHeight: '300px', overflowY: 'hidden', overflowX: 'hidden', scrollbarWidth: 'none' }}>
                <p className='text-[16.25px] text-primary m-0 p-0 font-bold mb-2'>Yesterday</p>
                <table
                  className='pb-1 w-full text-nowrap border shadow-[0_1px_2px_rgba(56,65,74,0.15)] [&_th]:border [&_th]:p-[0.3rem] [&_td]:border [&_td]:p-[0.3rem] [&_tbody_tr:nth-of-type(odd)]:bg-[rgba(0,0,0,0.05)]'
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
              <div id={'SalesOverTimeCurrent'}>
                <p className='m-0 p-0 font-medium'>
                  Today <span className={'font-semibold text-[11.2px] ms-2 ' + (salesDiff > 0 ? 'text-success' : 'text-destructive')}>{salesDiff.toFixed(2)}%</span>
                </p>
                <p className='m-0 p-0 font-semibold text-[16.25px]'>
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
                popperClassName='bg-white shadow-[0_1px_2px_rgba(56,65,74,0.15)] px-4 pt-4 rounded-[4px]'
                innerClassName='text-black bg-white p-0'
                style={{ maxHeight: '300px', overflowY: 'hidden', overflowX: 'hidden', scrollbarWidth: 'none' }}>
                <p className='text-[16.25px] text-primary m-0 p-0 font-bold mb-2'>Today</p>
                <table
                  className='pb-1 w-full text-nowrap border shadow-[0_1px_2px_rgba(56,65,74,0.15)] [&_th]:border [&_th]:p-[0.3rem] [&_td]:border [&_td]:p-[0.3rem] [&_tbody_tr:nth-of-type(odd)]:bg-[rgba(0,0,0,0.05)]'
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
            </div>
            <SalesOverTimeTimeline salesOverTime={salesOverTime?.orders} />
          </CardBody>
        </Card>
      </Col>
    </React.Fragment>
  )
}

export default SalesOverTime
