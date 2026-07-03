import Link from 'next/link'
import React, { useContext } from 'react'

import AppContext from '@context/AppContext'
import moment from 'moment'
import CountUp from 'react-countup'

const KitWidgets = ({ onhand, currentStorageBalance, binsUsed, inventoryValue }) => {
  const { state } = useContext(AppContext)
  const currentMonthDays = moment().format('D') - 1
  return (
    <React.Fragment>
      <div className='flex flex-wrap -mx-3 gap-2'>
        <div className='px-3 flex-1 basis-0'>
          <div className='shadow-none mb-0 ps-2'>
            <div className='p-0'>
              <div className='flex items-center'>
                <div className='grow overflow-hidden'>
                  <p className='uppercase font-semibold text-primary truncate mb-0'>Inventory</p>
                </div>
              </div>
              <div className='flex items-end justify-between mt-1'>
                <div>
                  <h4 className='text-[19.5px] font-semibold'>
                    <span className='counter-value'>
                      <CountUp start={0} end={onhand} decimals={0} duration={1} />
                    </span>
                  </h4>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className='px-3 flex-1 basis-0'>
          <div className='shadow-none mb-0 border-l border-[color:var(--border)] ps-2'>
            <div className='p-0'>
              <div className='flex items-center'>
                <div className='grow overflow-hidden'>
                  <p className='uppercase font-semibold text-primary truncate mb-0'>Children</p>
                </div>
              </div>
              <div className='flex items-end justify-between mt-1'>
                <div>
                  <h4 className='text-[19.5px] font-semibold'>
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
        </div>
      </div>
    </React.Fragment>
  )
}

export default KitWidgets
