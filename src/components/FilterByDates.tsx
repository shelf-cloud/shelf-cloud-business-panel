/* eslint-disable react-hooks/exhaustive-deps */
import moment from 'moment'
import React, { useEffect, useRef, useState } from 'react'
import Flatpickr from 'react-flatpickr'

type Props = {
  shipmentsStartDate: string
  shipmentsEndDate: string
  setShipmentsStartDate: (dateStr: string) => void
  setShipmentsEndDate: (dateStr: string) => void
  handleChangeDatesFromPicker: (dateStr: string) => void
}

const FilterByDates = ({ shipmentsStartDate, shipmentsEndDate, setShipmentsStartDate, setShipmentsEndDate, handleChangeDatesFromPicker }: Props) => {
  const [openDatesMenu, setOpenDatesMenu] = useState(false)
  const [selectedDateFilter, setSelectedDateFilter] = useState('picker')
  const filterByDates = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (document) {
      document.addEventListener('click', (e: any) => {
        if (filterByDates.current) {
          if (!filterByDates.current.contains(e.target)) {
            setOpenDatesMenu(false)
          }
        }
      })
    }
  }, [])

  return (
    <div ref={filterByDates} className='dropdown'>
      <button
        className='btn btn-light dropdown-toggle'
        style={{ backgroundColor: 'white', border: '1px solid #E1E3E5' }}
        type='button'
        data-bs-toggle='dropdown'
        data-bs-auto-close='outside'
        aria-expanded='false'
        onClick={() => setOpenDatesMenu(!openDatesMenu)}>
        Filter Dates: <span className='fw-semibold'>{`${shipmentsStartDate} -> ${shipmentsEndDate}`}</span>
      </button>
      <div className={'dropdown-menu dropdown-menu-md px-4' + (openDatesMenu ? ' show' : '')}>
        <div className='d-flex flex-column justify-content-start'>
          <p
            className={selectedDateFilter == 'today' ? 'fw-bold' : ''}
            style={{ cursor: 'pointer' }}
            onClick={() => {
              setSelectedDateFilter('today')
              setShipmentsStartDate(moment().format('YYYY-MM-DD'))
              setShipmentsEndDate(moment().format('YYYY-MM-DD'))
            }}>
            Today
          </p>
          <p
            className={selectedDateFilter == 'yesterday' ? 'fw-bold' : ''}
            style={{ cursor: 'pointer' }}
            onClick={() => {
              setSelectedDateFilter('yesterday')
              setShipmentsStartDate(moment().subtract(1, 'days').format('YYYY-MM-DD'))
              setShipmentsEndDate(moment().subtract(1, 'days').format('YYYY-MM-DD'))
            }}>
            Yesterday
          </p>
          <p
            className={selectedDateFilter == 'thisweek' ? 'fw-bold' : ''}
            style={{ cursor: 'pointer' }}
            onClick={() => {
              setSelectedDateFilter('thisweek')
              setShipmentsStartDate(moment().startOf('week').format('YYYY-MM-DD'))
              setShipmentsEndDate(moment().endOf('week').format('YYYY-MM-DD'))
            }}>
            This Week
          </p>
          <p
            className={selectedDateFilter == 'lastweek' ? 'fw-bold' : ''}
            style={{ cursor: 'pointer' }}
            onClick={() => {
              setSelectedDateFilter('lastweek')
              setShipmentsStartDate(moment().subtract(1, 'weeks').startOf('week').format('YYYY-MM-DD'))
              setShipmentsEndDate(moment().subtract(1, 'weeks').endOf('week').format('YYYY-MM-DD'))
            }}>
            Last Week
          </p>
          <p
            className={selectedDateFilter == 'past7days' ? 'fw-bold' : ''}
            style={{ cursor: 'pointer' }}
            onClick={() => {
              setSelectedDateFilter('past7days')
              setShipmentsStartDate(moment().subtract(7, 'days').format('YYYY-MM-DD'))
              setShipmentsEndDate(moment().format('YYYY-MM-DD'))
            }}>
            Past 7 Days
          </p>
          <p
            className={selectedDateFilter == 'thismonth' ? 'fw-bold' : ''}
            style={{ cursor: 'pointer' }}
            onClick={() => {
              setSelectedDateFilter('thismonth')
              setShipmentsStartDate(moment().startOf('month').format('YYYY-MM-DD'))
              setShipmentsEndDate(moment().endOf('month').format('YYYY-MM-DD'))
            }}>
            This Month
          </p>
          <p
            className={selectedDateFilter == 'past3days' ? 'fw-bold' : ''}
            style={{ cursor: 'pointer' }}
            onClick={() => {
              setSelectedDateFilter('past3days')
              setShipmentsStartDate(moment().subtract(30, 'days').format('YYYY-MM-DD'))
              setShipmentsEndDate(moment().format('YYYY-MM-DD'))
            }}>
            Past 30 Days
          </p>
          <p
            className={selectedDateFilter == 'yeartodate' ? 'fw-bold' : ''}
            style={{ cursor: 'pointer' }}
            onClick={() => {
              setSelectedDateFilter('yeartodate')
              setShipmentsStartDate(moment().startOf('year').format('YYYY-MM-DD'))
              setShipmentsEndDate(moment().format('YYYY-MM-DD'))
            }}>
            Year to Date
          </p>
          {/* <hr className='dropdown-divider' /> */}
          <span className='fw-semibold pb-2 border-top pt-1'>By Dates:</span>
          <Flatpickr
            className={'border-0 fs-6 w-100 py-2 px-2' + (selectedDateFilter == 'picker' ? ' fw-bold' : '')}
            options={{
              mode: 'range',
              dateFormat: 'd M y',
              defaultDate: [moment(shipmentsStartDate, 'YYYY-MM-DD').format('DD MMM YY'), moment(shipmentsEndDate, 'YYYY-MM-DD').format('DD MMM YY')],
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

export default FilterByDates
