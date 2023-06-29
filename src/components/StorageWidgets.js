import React, { useContext } from 'react'
import AppContext from '@context/AppContext'
import { Card, CardBody, Col, Row } from 'reactstrap'
import CountUp from 'react-countup'
import Link from 'next/link'
import moment from 'moment'

const StorageWidgets = ({ previousCharge, previousChargeDate, currentBalance, binsUSed }) => {
  const { state } = useContext(AppContext)
  const currentMonthDays = moment().format('D') - 1
  return (
    <React.Fragment>
      <Row className='col-xs-12 col-md-6 col-xl-8 gap-2'>
        <Col>
          <div className='shadow-none mb-0 border-start ps-2'>
            <div className='p-0'>
              <div className='d-flex align-items-center'>
                <div className='flex-grow-1 overflow-hidden'>
                  <p className='text-uppercase fw-semibold text-primary text-truncate mb-0'>Previous Month Charge</p>
                </div>
              </div>
              <div className='d-flex align-items-end justify-content-between mt-1'>
                <div>
                  <h4 className='fs-22 fw-semibold ff-secondary'>
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
                  <span className='text-muted'>{previousChargeDate}</span>
                </div>
              </div>
            </div>
          </div>
        </Col>
        <Col>
          <div className='shadow-none mb-0 border-start ps-2'>
            <div className='p-0'>
              <div className='d-flex align-items-center'>
                <div className='flex-grow-1 overflow-hidden'>
                  <p className='text-uppercase fw-semibold text-primary text-truncate mb-0'>Current Storage Balance</p>
                </div>
              </div>
              <div className='d-flex align-items-end justify-content-between mt-1'>
                <div>
                  <h4 className='fs-22 fw-semibold ff-secondary'>
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
                  <span className='text-muted'>{currentMonthDays} accumulated days</span>
                </div>
              </div>
            </div>
          </div>
        </Col>
        <Col>
          <div className='shadow-none mb-0 border-start ps-2'>
            <div className='p-0'>
              <div className='d-flex align-items-center'>
                <div className='flex-grow-1 overflow-hidden'>
                  <p className='text-uppercase fw-semibold text-primary text-truncate mb-0'>Current Bins Used</p>
                </div>
              </div>
              <div className='d-flex align-items-end justify-content-between mt-1'>
                <div>
                  <h4 className='fs-22 fw-semibold ff-secondary'>
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
