import Link from 'next/link'
import React, { useContext } from 'react'

import AppContext from '@context/AppContext'
import moment from 'moment'
import CountUp from 'react-countup'

const StorageWidgets = ({ previousCharge, previousChargeDate, currentBalance, binsUSed }) => {
  const { state } = useContext(AppContext)
  const currentMonthDays = moment().format('D') - 1
  return (
    <React.Fragment>
      <div className='flex flex-wrap -mx-3 w-full md:w-1/2 xl:w-2/3 gap-2'>
        <div className='px-3 flex-1 basis-0'>
          <div className='shadow-none mb-0 border-l ps-2'>
            <div className='p-0'>
              <div className='flex items-center'>
                <div className='grow overflow-hidden'>
                  <p className='uppercase font-semibold text-primary truncate mb-0'>Previous Month Charge</p>
                </div>
              </div>
              <div className='flex items-end justify-between mt-1'>
                <div>
                  <h4 className='text-[22px] font-semibold ff-secondary'>
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
                  <span className='text-[var(--bs-secondary-color)]'>{previousChargeDate}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className='px-3 flex-1 basis-0'>
          <div className='shadow-none mb-0 border-l ps-2'>
            <div className='p-0'>
              <div className='flex items-center'>
                <div className='grow overflow-hidden'>
                  <p className='uppercase font-semibold text-primary truncate mb-0'>Current Storage Balance</p>
                </div>
              </div>
              <div className='flex items-end justify-between mt-1'>
                <div>
                  <h4 className='text-[22px] font-semibold ff-secondary'>
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
                  <span className='text-[var(--bs-secondary-color)]'>{currentMonthDays} accumulated days</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className='px-3 flex-1 basis-0'>
          <div className='shadow-none mb-0 border-l ps-2'>
            <div className='p-0'>
              <div className='flex items-center'>
                <div className='grow overflow-hidden'>
                  <p className='uppercase font-semibold text-primary truncate mb-0'>Current Bins Used</p>
                </div>
              </div>
              <div className='flex items-end justify-between mt-1'>
                <div>
                  <h4 className='text-[22px] font-semibold ff-secondary'>
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
        </div>
      </div>
    </React.Fragment>
  )
}

export default StorageWidgets
