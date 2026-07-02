import Link from 'next/link'
import React, { useContext } from 'react'

import AppContext from '@context/AppContext'
import moment from 'moment'
import CountUp from 'react-countup'
import { Card, CardBody, Col, Row } from '@/components/migration-ui'

const StorageWidgets = ({ previousCharge, previousChargeDate, currentBalance, binsUSed }) => {
  const { state } = useContext(AppContext)
  const currentMonthDays = moment().format('D') - 1
  return (
    <React.Fragment>
      <Row className='tw:w-full tw:md:w-1/2 tw:xl:w-2/3 tw:gap-2'>
        <Col>
          <div className='tw:shadow-none tw:mb-0 tw:border-l tw:ps-2'>
            <div className='tw:p-0'>
              <div className='tw:flex tw:items-center'>
                <div className='tw:grow tw:overflow-hidden'>
                  <p className='tw:uppercase tw:font-semibold tw:text-primary tw:truncate tw:mb-0'>Previous Month Charge</p>
                </div>
              </div>
              <div className='tw:flex tw:items-end tw:justify-between tw:mt-1'>
                <div>
                  <h4 className='tw:text-[22px] tw:font-semibold ff-secondary'>
                    <span className='counter-value'>
                      <CountUp
                        start={0}
                        prefix={state.currentRegion == 'us' ? '$ ' : ''}
                        suffix={state.currentRegion == 'eu' ? ' €' : ''}
                        separator={state.currentRegion == 'us' ? '.' : ','}
                        end={previousCharge}
                        decimals={2}
                        duration={1}
                      />
                    </span>
                  </h4>
                  <span className='tw:text-[var(--bs-secondary-color)]'>{previousChargeDate}</span>
                </div>
              </div>
            </div>
          </div>
        </Col>
        <Col>
          <div className='tw:shadow-none tw:mb-0 tw:border-l tw:ps-2'>
            <div className='tw:p-0'>
              <div className='tw:flex tw:items-center'>
                <div className='tw:grow tw:overflow-hidden'>
                  <p className='tw:uppercase tw:font-semibold tw:text-primary tw:truncate tw:mb-0'>Current Storage Balance</p>
                </div>
              </div>
              <div className='tw:flex tw:items-end tw:justify-between tw:mt-1'>
                <div>
                  <h4 className='tw:text-[22px] tw:font-semibold ff-secondary'>
                    <span className='counter-value'>
                      <CountUp
                        start={0}
                        prefix={state.currentRegion == 'us' ? '$ ' : ''}
                        suffix={state.currentRegion == 'eu' ? ' €' : ''}
                        separator={state.currentRegion == 'us' ? '.' : ','}
                        end={currentBalance}
                        decimals={2}
                        duration={1}
                      />
                    </span>
                  </h4>
                  <span className='tw:text-[var(--bs-secondary-color)]'>{currentMonthDays} accumulated days</span>
                </div>
              </div>
            </div>
          </div>
        </Col>
        <Col>
          <div className='tw:shadow-none tw:mb-0 tw:border-l tw:ps-2'>
            <div className='tw:p-0'>
              <div className='tw:flex tw:items-center'>
                <div className='tw:grow tw:overflow-hidden'>
                  <p className='tw:uppercase tw:font-semibold tw:text-primary tw:truncate tw:mb-0'>Current Bins Used</p>
                </div>
              </div>
              <div className='tw:flex tw:items-end tw:justify-between tw:mt-1'>
                <div>
                  <h4 className='tw:text-[22px] tw:font-semibold ff-secondary'>
                    <span className='counter-value'>
                      <CountUp
                        start={0}
                        // prefix={'$'}
                        // suffix={item.suffix}
                        separator={'.'}
                        end={binsUSed}
                        decimals={0}
                        duration={1}
                      />
                    </span>
                  </h4>
                </div>
              </div>
            </div>
          </div>
        </Col>
      </Row>
    </React.Fragment>
  )
}

export default StorageWidgets
