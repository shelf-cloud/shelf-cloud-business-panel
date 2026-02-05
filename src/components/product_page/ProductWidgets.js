import Link from 'next/link'
import React, { useContext } from 'react'

import AppContext from '@context/AppContext'
import moment from 'moment'
import CountUp from 'react-countup'
import { Card, CardBody, Col, Row, UncontrolledTooltip } from 'reactstrap'

const ProductWidgets = ({ onhand, currentStorageBalance, binsUsed, inventoryValue }) => {
  const { state } = useContext(AppContext)
  const currentMonthDays = moment().format('D') - 1
  return (
    <React.Fragment>
      <Row className='gap-2'>
        <Col>
          <div className='shadow-none mb-0 ps-2'>
            <div className='p-0'>
              <div className='d-flex align-items-center'>
                <div className='flex-grow-1 overflow-hidden'>
                  <p className='text-uppercase fw-semibold text-primary text-truncate mb-0'>Inventory</p>
                </div>
              </div>
              <div className='d-flex align-items-end justify-content-between mt-1'>
                <div>
                  <h4 className='fs-4 fw-semibold'>
                    <span className='counter-value'>
                      <CountUp start={0} end={onhand} decimals={0} duration={1} />
                    </span>
                  </h4>
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
                  <p className='text-uppercase fw-semibold text-primary text-truncate mb-0'>Est. Storage Monthly Cost</p>
                </div>
              </div>
              <div className='d-flex align-items-end justify-content-between mt-1'>
                <div>
                  <h4 className='fs-4 fw-semibold'>
                    <span className='counter-value'>
                      <CountUp
                        start={0}
                        prefix={state.currentRegion == 'us' ? '$ ' : ''}
                        suffix={state.currentRegion == 'eu' ? ' €' : ''}
                        separator={state.currentRegion == 'us' ? '.' : ','}
                        end={currentStorageBalance}
                        decimals={2}
                        duration={1}
                      />
                    </span>
                  </h4>
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
                  <h4 className='fs-4 fw-semibold'>
                    <span className='counter-value'>
                      <CountUp
                        start={0}
                        // prefix={'$'}
                        // suffix={item.suffix}
                        separator={'.'}
                        end={binsUsed}
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
        <Col>
          <div className='shadow-none mb-0 border-start ps-2'>
            <div className='p-0'>
              <div className='d-flex align-items-center'>
                <div className='flex-grow-1 overflow-hidden'>
                  <p className='text-uppercase fw-semibold text-primary text-truncate mb-0'>Inventory Value</p>
                </div>
              </div>
              <div className='d-flex align-items-end justify-content-between mt-1'>
                <div>
                  {inventoryValue > 0 ? (
                    <h4 className='fs-4 fw-semibold'>
                      <span className='counter-value' id='inventoryValue'>
                        <CountUp
                          start={0}
                          prefix={state.currentRegion == 'us' ? '$ ' : ''}
                          suffix={state.currentRegion == 'eu' ? ' €' : ''}
                          separator={state.currentRegion == 'us' ? '.' : ','}
                          end={inventoryValue}
                          decimals={2}
                          duration={1}
                        />
                      </span>
                      <UncontrolledTooltip placement='bottom' target='inventoryValue' innerClassName='bg-white text-primary shadow'>
                        {`Landed Cost * On Hand Inventory`}
                      </UncontrolledTooltip>
                    </h4>
                  ) : (
                    <span className='fs-4 text-muted fw-light'>No Cost</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Col>
      </Row>
    </React.Fragment>
  )
}

export default ProductWidgets
