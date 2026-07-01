import Link from 'next/link'
import React, { useContext } from 'react'

import AppContext from '@context/AppContext'
import moment from 'moment'
import CountUp from 'react-countup'
import { Card, CardBody, Col, Row, UncontrolledTooltip } from '@/components/migration-ui'

const ProductWidgets = ({ onhand, currentStorageBalance, binsUsed, inventoryValue }) => {
  const { state } = useContext(AppContext)
  const currentMonthDays = moment().format('D') - 1
  return (
    <React.Fragment>
      <Row className='tw:gap-2'>
        <Col>
          <div className='tw:shadow-none tw:mb-0 tw:ps-2'>
            <div className='tw:p-0'>
              <div className='tw:flex tw:items-center'>
                <div className='tw:grow tw:overflow-hidden'>
                  <p className='tw:uppercase tw:font-semibold tw:text-primary tw:truncate tw:mb-0'>Inventory</p>
                </div>
              </div>
              <div className='tw:flex tw:items-end tw:justify-between tw:mt-1'>
                <div>
                  <h4 className='tw:text-[19.5px] tw:font-semibold'>
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
          <div className='tw:shadow-none tw:mb-0 tw:border-l tw:border-[color:var(--border)] tw:ps-2'>
            <div className='tw:p-0'>
              <div className='tw:flex tw:items-center'>
                <div className='tw:grow tw:overflow-hidden'>
                  <p className='tw:uppercase tw:font-semibold tw:text-primary tw:truncate tw:mb-0'>Est. Storage Monthly Cost</p>
                </div>
              </div>
              <div className='tw:flex tw:items-end tw:justify-between tw:mt-1'>
                <div>
                  <h4 className='tw:text-[19.5px] tw:font-semibold'>
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
          <div className='tw:shadow-none tw:mb-0 tw:border-l tw:border-[color:var(--border)] tw:ps-2'>
            <div className='tw:p-0'>
              <div className='tw:flex tw:items-center'>
                <div className='tw:grow tw:overflow-hidden'>
                  <p className='tw:uppercase tw:font-semibold tw:text-primary tw:truncate tw:mb-0'>Current Bins Used</p>
                </div>
              </div>
              <div className='tw:flex tw:items-end tw:justify-between tw:mt-1'>
                <div>
                  <h4 className='tw:text-[19.5px] tw:font-semibold'>
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
          <div className='tw:shadow-none tw:mb-0 tw:border-l tw:border-[color:var(--border)] tw:ps-2'>
            <div className='tw:p-0'>
              <div className='tw:flex tw:items-center'>
                <div className='tw:grow tw:overflow-hidden'>
                  <p className='tw:uppercase tw:font-semibold tw:text-primary tw:truncate tw:mb-0'>Inventory Value</p>
                </div>
              </div>
              <div className='tw:flex tw:items-end tw:justify-between tw:mt-1'>
                <div>
                  {inventoryValue > 0 ? (
                    <h4 className='tw:text-[19.5px] tw:font-semibold'>
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
                      <UncontrolledTooltip placement='bottom' target='inventoryValue' innerClassName='tw:bg-white tw:text-primary tw:shadow'>
                        {`Landed Cost * On Hand Inventory`}
                      </UncontrolledTooltip>
                    </h4>
                  ) : (
                    <span className='tw:text-[19.5px] tw:text-[color:var(--bs-secondary-color)] tw:font-light'>No Cost</span>
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
