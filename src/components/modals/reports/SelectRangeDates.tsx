/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useRef, useState } from 'react'

import moment from 'moment'
import Flatpickr from 'react-flatpickr'

type Props = {
  showMappedCreateReport: {
    show: boolean
    loading: boolean
    reportType: string
    startDate: string
    endDate: string
  }
  setshowMappedCreateReport: (prev: any) => void
  handleChangeDatesFromPicker: (dateStr: string) => void
}

const SelectRangeDates = ({ showMappedCreateReport, setshowMappedCreateReport, handleChangeDatesFromPicker }: Props) => {
  const [openDatesMenu, setOpenDatesMenu] = useState(false)
  const [selectedDateFilter, setSelectedDateFilter] = useState('picker')
  const selectDates = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (document) {
      document.addEventListener('click', (e: any) => {
        if (selectDates.current) {
          if (!selectDates.current.contains(e.target)) {
            setOpenDatesMenu(false)
          }
        }
      })
    }
  }, [])

  return (
    <div ref={selectDates} className='dropdown'>
      <button
        className='btn btn-light dropdown-toggle d-flex flex-row justify-content-start align-items-center gap-2'
        style={{ backgroundColor: 'white', border: '1px solid #E1E3E5' }}
        type='button'
        data-bs-toggle='dropdown'
        data-bs-auto-close='outside'
        aria-expanded='false'
        onClick={() => setOpenDatesMenu(!openDatesMenu)}>
        <i className='las la-calendar fs-3 m-0 p-0 text-primary' />
        <span className='fw-semibold m-0 p-0'>{`${showMappedCreateReport.startDate} -> ${showMappedCreateReport.endDate}`}</span>
      </button>
      <div className={'dropdown-menu dropdown-menu-md px-4 py-3' + (openDatesMenu ? ' show' : '')}>
        <div className='d-flex flex-column justify-content-start'>
          <p
            className={selectedDateFilter == 'today' ? 'fw-bold' : ''}
            style={{ cursor: 'pointer' }}
            onClick={() => {
              setSelectedDateFilter('today')
              setshowMappedCreateReport((prev: any) => {
                return {
                  ...prev,
                  startDate: moment().format('YYYY-MM-DD'),
                  endDate: moment().format('YYYY-MM-DD'),
                }
              })
              setOpenDatesMenu(false)
            }}>
            Today
          </p>
          <p
            className={selectedDateFilter == 'yesterday' ? 'fw-bold' : ''}
            style={{ cursor: 'pointer' }}
            onClick={() => {
              setSelectedDateFilter('yesterday')
              setshowMappedCreateReport((prev: any) => {
                return {
                  ...prev,
                  startDate: moment().subtract(1, 'days').format('YYYY-MM-DD'),
                  endDate: moment().subtract(1, 'days').format('YYYY-MM-DD'),
                }
              })
              setOpenDatesMenu(false)
            }}>
            Yesterday
          </p>
          <p
            className={selectedDateFilter == 'thisweek' ? 'fw-bold' : ''}
            style={{ cursor: 'pointer' }}
            onClick={() => {
              setSelectedDateFilter('thisweek')
              setshowMappedCreateReport((prev: any) => {
                return {
                  ...prev,
                  startDate: moment().startOf('week').format('YYYY-MM-DD'),
                  endDate: moment().endOf('week').format('YYYY-MM-DD'),
                }
              })
              setOpenDatesMenu(false)
            }}>
            This Week
          </p>
          <p
            className={selectedDateFilter == 'lastweek' ? 'fw-bold' : ''}
            style={{ cursor: 'pointer' }}
            onClick={() => {
              setSelectedDateFilter('lastweek')
              setshowMappedCreateReport((prev: any) => {
                return {
                  ...prev,
                  startDate: moment().subtract(1, 'weeks').startOf('week').format('YYYY-MM-DD'),
                  endDate: moment().subtract(1, 'weeks').endOf('week').format('YYYY-MM-DD'),
                }
              })
              setOpenDatesMenu(false)
            }}>
            Last Week
          </p>
          <p
            className={selectedDateFilter == 'past7days' ? 'fw-bold' : ''}
            style={{ cursor: 'pointer' }}
            onClick={() => {
              setSelectedDateFilter('past7days')
              setshowMappedCreateReport((prev: any) => {
                return {
                  ...prev,
                  startDate: moment().subtract(7, 'days').format('YYYY-MM-DD'),
                  endDate: moment().format('YYYY-MM-DD'),
                }
              })
              setOpenDatesMenu(false)
            }}>
            Past 7 Days
          </p>
          <p
            className={selectedDateFilter == 'thismonth' ? 'fw-bold' : ''}
            style={{ cursor: 'pointer' }}
            onClick={() => {
              setSelectedDateFilter('thismonth')
              setshowMappedCreateReport((prev: any) => {
                return {
                  ...prev,
                  startDate: moment().startOf('month').format('YYYY-MM-DD'),
                  endDate: moment().endOf('month').format('YYYY-MM-DD'),
                }
              })
              setOpenDatesMenu(false)
            }}>
            This Month
          </p>
          <p
            className={selectedDateFilter == 'past3days' ? 'fw-bold' : ''}
            style={{ cursor: 'pointer' }}
            onClick={() => {
              setSelectedDateFilter('past3days')
              setshowMappedCreateReport((prev: any) => {
                return {
                  ...prev,
                  startDate: moment().subtract(30, 'days').format('YYYY-MM-DD'),
                  endDate: moment().format('YYYY-MM-DD'),
                }
              })
              setOpenDatesMenu(false)
            }}>
            Past 30 Days
          </p>
          <p
            className={selectedDateFilter == 'lastmonth' ? 'fw-bold' : ''}
            style={{ cursor: 'pointer' }}
            onClick={() => {
              setSelectedDateFilter('lastmonth')
              setshowMappedCreateReport((prev: any) => {
                return {
                  ...prev,
                  startDate: moment().subtract(1, 'months').startOf('month').format('YYYY-MM-DD'),
                  endDate: moment().subtract(1, 'months').endOf('month').format('YYYY-MM-DD'),
                }
              })
              setOpenDatesMenu(false)
            }}>
            Last Month
          </p>
          <p
            className={selectedDateFilter == 'yeartodate' ? 'fw-bold' : ''}
            style={{ cursor: 'pointer' }}
            onClick={() => {
              setSelectedDateFilter('yeartodate')
              setshowMappedCreateReport((prev: any) => {
                return {
                  ...prev,
                  startDate: moment().startOf('year').format('YYYY-MM-DD'),
                  endDate: moment().format('YYYY-MM-DD'),
                }
              })
              setOpenDatesMenu(false)
            }}>
            Year to Date
          </p>
          <p
            className={selectedDateFilter == 'lastyear' ? 'fw-bold' : ''}
            style={{ cursor: 'pointer' }}
            onClick={() => {
              setSelectedDateFilter('lastyear')
              setshowMappedCreateReport((prev: any) => {
                return {
                  ...prev,
                  startDate: moment().subtract(1, 'year').startOf('year').format('YYYY-MM-DD'),
                  endDate: moment().subtract(1, 'year').endOf('year').format('YYYY-MM-DD'),
                }
              })
              setOpenDatesMenu(false)
            }}>
            Last Year
          </p>
          <span className='fw-light text-muted fs-7 pb-1 border-top pt-1'>Select Range:</span>
          <Flatpickr
            className={'border-0 fs-6 w-100 py-2 px-2' + (selectedDateFilter == 'picker' ? ' fw-bold' : '')}
            options={{
              mode: 'range',
              dateFormat: 'd M y',
              defaultDate: [moment(showMappedCreateReport.startDate, 'YYYY-MM-DD').format('DD MMM YY'), moment(showMappedCreateReport.endDate, 'YYYY-MM-DD').format('DD MMM YY')],
            }}
            onChange={(_selectedDates, dateStr) => {
              setSelectedDateFilter('picker')
              handleChangeDatesFromPicker(dateStr)
            }}
          />
        </div>
      </div>
    </div>
  )
}

export default SelectRangeDates
