/* eslint-disable react/no-unescaped-entities */
import React from 'react'

import moment from 'moment'
import Flatpickr from 'react-flatpickr'
import { Col, Row } from '@/components/migration-ui'

type Props = {
  user: string
  startDate: string
  endDate: string
  handleChangeDates: Function
}

const DashboardHeader = ({ user, startDate, endDate, handleChangeDates }: Props) => {
  return (
    <React.Fragment>
      <Row className='mb-4 pb-1'>
        <Col xs={12}>
          <div className='flex flex-col justify-between lg:flex-row lg:items-center'>
            <div>
              <h4 className='text-[13px] mb-1'>
                Good Morning, <span className='capitalize'>{user}</span>
              </h4>
              <p className='text-[13px] text-[color:var(--bs-secondary-color)] mb-0'>Here's what's happening with your Inventory today.</p>
            </div>
            <div className='mt-4 lg:mt-0'>
              <form action='#'>
                <div
                  className='flex flex-row items-center justify-between gap-2 w-auto px-4 py-1 rounded-[4.8px] shadow-[0_1px_2px_rgba(56,65,74,0.15)]'
                  style={{ backgroundColor: 'white', minWidth: '230px' }}>
                  <i className='ri-calendar-2-line text-[16.25px]' />
                  <Flatpickr
                    className='border-0 text-[13px] w-full'
                    options={{
                      mode: 'range',
                      dateFormat: 'd M y',
                      defaultDate: [moment(startDate, 'YYYY-MM-DD').format('DD MMM YY'), moment(endDate, 'YYYY-MM-DD').format('DD MMM YY')],
                    }}
                    onChange={(_selectedDates, dateStr) => handleChangeDates(dateStr)}
                  />
                  <i className='ri-arrow-down-s-line' />
                  {/* <div className="input-group-text bg-primary border-primary text-white">
                  </div> */}
                </div>
              </form>
            </div>
          </div>
        </Col>
      </Row>
    </React.Fragment>
  )
}

export default DashboardHeader
