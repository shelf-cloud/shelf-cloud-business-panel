 
import { useEffect, useRef, useState } from 'react'

import moment from 'moment'
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
        className='btn btn-light dropdown-toggle d-flex flex-row justify-content-start align-items-center gap-2'
        style={{ backgroundColor: 'white', border: '1px solid #E1E3E5' }}
        type='button'
        data-bs-toggle='dropdown'
        data-bs-auto-close='outside'
        aria-expanded='false'
        onClick={() => setOpenDatesMenu(!openDatesMenu)}>
        <i className='las la-calendar fs-5 m-0 p-0 text-primary' />
        <span className='fw-semibold m-0 p-0 fs-7'>{shipmentsStartDate !== '' || shipmentsEndDate !== '' ? `${shipmentsStartDate} -> ${shipmentsEndDate}` : 'Select Dates'}</span>
      </button>
      <div className={'dropdown-menu dropdown-menu-md px-4 py-3' + (openDatesMenu ? ' show' : '')}>
        <div className='d-flex flex-column justify-content-start'>
          <p
            className={'fs-7 ' + (selectedDateFilter == 'today' ? 'fw-bold' : '')}
            style={{ cursor: 'pointer' }}
            onClick={() => {
              setSelectedDateFilter('today')
              setShipmentsStartDate(moment().format('YYYY-MM-DD'))
              setShipmentsEndDate(moment().format('YYYY-MM-DD'))
              setOpenDatesMenu(false)
            }}>
            Today
          </p>
          <p
            className={'fs-7 ' + (selectedDateFilter == 'yesterday' ? 'fw-bold' : '')}
            style={{ cursor: 'pointer' }}
            onClick={() => {
              setSelectedDateFilter('yesterday')
              setShipmentsStartDate(moment().subtract(1, 'days').format('YYYY-MM-DD'))
              setShipmentsEndDate(moment().subtract(1, 'days').format('YYYY-MM-DD'))
              setOpenDatesMenu(false)
            }}>
            Yesterday
          </p>
          <p
            className={'fs-7 ' + (selectedDateFilter == 'thisweek' ? 'fw-bold' : '')}
            style={{ cursor: 'pointer' }}
            onClick={() => {
              setSelectedDateFilter('thisweek')
              setShipmentsStartDate(moment().startOf('week').format('YYYY-MM-DD'))
              setShipmentsEndDate(moment().endOf('week').format('YYYY-MM-DD'))
              setOpenDatesMenu(false)
            }}>
            This Week
          </p>
          <p
            className={'fs-7 ' + (selectedDateFilter == 'lastweek' ? 'fw-bold' : '')}
            style={{ cursor: 'pointer' }}
            onClick={() => {
              setSelectedDateFilter('lastweek')
              setShipmentsStartDate(moment().subtract(1, 'weeks').startOf('week').format('YYYY-MM-DD'))
              setShipmentsEndDate(moment().subtract(1, 'weeks').endOf('week').format('YYYY-MM-DD'))
              setOpenDatesMenu(false)
            }}>
            Last Week
          </p>
          <p
            className={'fs-7 ' + (selectedDateFilter == 'past7days' ? 'fw-bold' : '')}
            style={{ cursor: 'pointer' }}
            onClick={() => {
              setSelectedDateFilter('past7days')
              setShipmentsStartDate(moment().subtract(7, 'days').format('YYYY-MM-DD'))
              setShipmentsEndDate(moment().format('YYYY-MM-DD'))
              setOpenDatesMenu(false)
            }}>
            Past 7 Days
          </p>
          <p
            className={'fs-7 ' + (selectedDateFilter == 'thismonth' ? 'fw-bold' : '')}
            style={{ cursor: 'pointer' }}
            onClick={() => {
              setSelectedDateFilter('thismonth')
              setShipmentsStartDate(moment().startOf('month').format('YYYY-MM-DD'))
              setShipmentsEndDate(moment().endOf('month').format('YYYY-MM-DD'))
              setOpenDatesMenu(false)
            }}>
            This Month
          </p>
          <p
            className={'fs-7 ' + (selectedDateFilter == 'past3days' ? 'fw-bold' : '')}
            style={{ cursor: 'pointer' }}
            onClick={() => {
              setSelectedDateFilter('past3days')
              setShipmentsStartDate(moment().subtract(1, 'months').format('YYYY-MM-DD'))
              setShipmentsEndDate(moment().format('YYYY-MM-DD'))
              setOpenDatesMenu(false)
            }}>
            Past 30 Days
          </p>
          <p
            className={'fs-7 ' + (selectedDateFilter == 'lastmonth' ? 'fw-bold' : '')}
            style={{ cursor: 'pointer' }}
            onClick={() => {
              setSelectedDateFilter('lastmonth')
              setShipmentsStartDate(moment().subtract(1, 'months').startOf('month').format('YYYY-MM-DD'))
              setShipmentsEndDate(moment().subtract(1, 'months').endOf('month').format('YYYY-MM-DD'))
              setOpenDatesMenu(false)
            }}>
            Last Month
          </p>
          <p
            className={'fs-7 ' + (selectedDateFilter == 'yeartodate' ? 'fw-bold' : '')}
            style={{ cursor: 'pointer' }}
            onClick={() => {
              setSelectedDateFilter('yeartodate')
              setShipmentsStartDate(moment().startOf('year').format('YYYY-MM-DD'))
              setShipmentsEndDate(moment().format('YYYY-MM-DD'))
              setOpenDatesMenu(false)
            }}>
            Year to Date
          </p>
          <p
            className={'fs-7 ' + (selectedDateFilter == 'lastyear' ? 'fw-bold' : '')}
            style={{ cursor: 'pointer' }}
            onClick={() => {
              setSelectedDateFilter('lastyear')
              setShipmentsStartDate(moment().subtract(1, 'year').startOf('year').format('YYYY-MM-DD'))
              setShipmentsEndDate(moment().subtract(1, 'year').endOf('year').format('YYYY-MM-DD'))
              setOpenDatesMenu(false)
            }}>
            Last Year
          </p>
          <span className='fw-light text-muted fs-7 pb-1 border-top pt-1'>Select Range:</span>
          <Flatpickr
            className={'border-1 border-muted fs-6 w-100 p-2' + (selectedDateFilter == 'picker' ? ' fw-bold' : '')}
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
