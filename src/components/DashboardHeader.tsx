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
      <Row className='tw:mb-4 tw:pb-1'>
        <Col xs={12}>
          <div className='tw:flex tw:flex-col tw:justify-between tw:lg:flex-row tw:lg:items-center'>
            <div>
              <h4 className='tw:text-[13px] tw:mb-1'>
                Good Morning, <span className='tw:capitalize'>{user}</span>
              </h4>
              <p className='tw:text-[13px] tw:text-[color:var(--bs-secondary-color)] tw:mb-0'>Here's what's happening with your Inventory today.</p>
            </div>
            <div className='tw:mt-4 tw:lg:mt-0'>
              <form action='#'>
                <div
                  className='tw:flex tw:flex-row tw:items-center tw:justify-between tw:gap-2 tw:w-auto tw:px-4 tw:py-1 tw:rounded-[4.8px] tw:shadow-[0_1px_2px_rgba(56,65,74,0.15)]'
                  style={{ backgroundColor: 'white', minWidth: '230px' }}>
                  <i className='ri-calendar-2-line tw:text-[16.25px]' />
                  <Flatpickr
                    className='tw:border-0 tw:text-[13px] tw:w-full'
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
