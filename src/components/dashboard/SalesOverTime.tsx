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
          <CardHeader className='tw:flex tw:items-center tw:justify-between'>
            <h4 className='tw:grow tw:mb-0 tw:text-[16px] tw:font-medium tw:text-[#212529]'>Sales Over Time</h4>
            <span className='tw:text-[13px] tw:text-[color:var(--bs-secondary-color)] tw:font-normal'>
              <i className='las la-clock tw:text-[16.25px] tw:me-1'></i>
              {moment().format('h:mm a')}
            </span>
          </CardHeader>

          <CardBody className='tw:pb-0'>
            <div className='tw:flex tw:flex-row tw:justify-start tw:gap-6'>
              <div id={'SalesOverTimePrevious'}>
                <p className='tw:m-0 tw:p-0 tw:font-medium'>Yesterday</p>
                <p className='tw:m-0 tw:p-0 tw:font-semibold tw:text-[16.25px]'>
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
                popperClassName='tw:bg-white tw:shadow-[0_1px_2px_rgba(56,65,74,0.15)] tw:px-4 tw:py-4 tw:rounded-[4px]'
                innerClassName='tw:text-black tw:bg-white tw:p-0'
                style={{ maxHeight: '300px', overflowY: 'hidden', overflowX: 'hidden', scrollbarWidth: 'none' }}>
                <p className='tw:text-[16.25px] tw:text-primary tw:m-0 tw:p-0 tw:font-bold tw:mb-2'>Yesterday</p>
                <table
                  className='tw:pb-1 tw:w-full tw:text-nowrap tw:border tw:shadow-[0_1px_2px_rgba(56,65,74,0.15)] tw:[&_th]:border tw:[&_th]:p-[0.3rem] tw:[&_td]:border tw:[&_td]:p-[0.3rem] tw:[&_tbody_tr:nth-of-type(odd)]:bg-[rgba(0,0,0,0.05)]'
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
                        <td className='tw:text-start'>{marketplace.name}</td>
                        <td className='tw:text-end'>{FormatCurrency(state.currentRegion, marketplace.salesOverTime[previousDate])}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </UncontrolledTooltip>
              <div id={'SalesOverTimeCurrent'}>
                <p className='tw:m-0 tw:p-0 tw:font-medium'>
                  Today <span className={'tw:font-semibold tw:text-[11.2px] tw:ms-2 ' + (salesDiff > 0 ? 'tw:text-success' : 'tw:text-destructive')}>{salesDiff.toFixed(2)}%</span>
                </p>
                <p className='tw:m-0 tw:p-0 tw:font-semibold tw:text-[16.25px]'>
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
                popperClassName='tw:bg-white tw:shadow-[0_1px_2px_rgba(56,65,74,0.15)] tw:px-4 tw:pt-4 tw:rounded-[4px]'
                innerClassName='tw:text-black tw:bg-white tw:p-0'
                style={{ maxHeight: '300px', overflowY: 'hidden', overflowX: 'hidden', scrollbarWidth: 'none' }}>
                <p className='tw:text-[16.25px] tw:text-primary tw:m-0 tw:p-0 tw:font-bold tw:mb-2'>Today</p>
                <table
                  className='tw:pb-1 tw:w-full tw:text-nowrap tw:border tw:shadow-[0_1px_2px_rgba(56,65,74,0.15)] tw:[&_th]:border tw:[&_th]:p-[0.3rem] tw:[&_td]:border tw:[&_td]:p-[0.3rem] tw:[&_tbody_tr:nth-of-type(odd)]:bg-[rgba(0,0,0,0.05)]'
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
                        <td className='tw:text-start'>{marketplace.name}</td>
                        <td className='tw:text-end'>{FormatCurrency(state.currentRegion, marketplace.salesOverTime[currentDate])}</td>
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
