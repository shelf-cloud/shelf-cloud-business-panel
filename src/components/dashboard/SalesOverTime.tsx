import React, { useContext } from 'react'
// import Link from 'next/link'
import { Card, CardBody, CardHeader, Col } from 'reactstrap'
import AppContext from '@context/AppContext'
import moment from 'moment'
import CountUp from 'react-countup'
import SalesOverTimeTimeline from './SalesOverTimeTimeline'

type Props = {
  salesOverTime: { [key: string]: { [key: string]: number } }
}

const SalesOverTime = ({ salesOverTime }: Props) => {
  const { state }: any = useContext(AppContext)
  const totalToday = Object.values(salesOverTime[moment().format('YYYY-MM-DD')]).reduce((a, b) => a + b, 0)
  const totalYesterday = Object.values(salesOverTime[moment().subtract(1, 'days').format('YYYY-MM-DD')]).reduce((a, b) => a + b, 0)

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
            <a className='fs-6 text-muted fw-normal'>
              <i className='las la-clock fs-5 me-1'></i>
              {moment().format('h:mm a')}
              </a>
          </CardHeader>

          <CardBody className='pb-0'>
            <div className='d-flex flex-row justify-content-start align-items-base gap-4'>
              <div>
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
              <div>
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
            </div>
            <SalesOverTimeTimeline salesOverTime={salesOverTime} />
          </CardBody>
        </Card>
      </Col>
    </React.Fragment>
  )
}

export default SalesOverTime
