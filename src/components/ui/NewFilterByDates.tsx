 
import { useRef, useState } from 'react'

import { useClickOutside } from '@hooks/useClickOutside'

import moment from 'moment'
import Flatpickr from 'react-flatpickr'

type Props = {
  filterDates: {
    startDate: string
    endDate: string
  }
  setfilterDates: (prev: any) => void
  handleChangeDatesFromPicker: (dateStr: string) => void
}

const NewFilterByDates = ({ filterDates, setfilterDates, handleChangeDatesFromPicker }: Props) => {
  const [openDatesMenu, setOpenDatesMenu] = useState(false)
  const [selectedDateFilter, setSelectedDateFilter] = useState('picker')
  const filterByDates = useRef<HTMLDivElement | null>(null)

  useClickOutside(filterByDates, () => setOpenDatesMenu(false))

  return (
    <div ref={filterByDates} className='tw:relative'>
      <button
        className='tw:inline-flex tw:h-9 tw:flex-row tw:justify-start tw:items-center tw:gap-2 tw:rounded-md tw:px-3'
        style={{ backgroundColor: 'white', border: '1px solid #E1E3E5' }}
        type='button'
        aria-expanded='false'
        onClick={() => setOpenDatesMenu(!openDatesMenu)}>
        <i className='las la-calendar tw:text-[19.5px] tw:m-0 tw:p-0 tw:text-primary' />
        <span className='tw:font-semibold tw:m-0 tw:p-0 tw:text-[11.2px]'>
          {filterDates.startDate !== '' || filterDates.endDate !== '' ? `${filterDates.startDate} -> ${filterDates.endDate}` : 'Select Dates'}
        </span>
      </button>
      <div className={'tw:absolute tw:z-10 tw:mt-1 tw:px-4 tw:py-3 tw:bg-white tw:border tw:border-[#E1E3E5] tw:rounded-md tw:shadow tw:min-w-[200px]' + (openDatesMenu ? ' show' : '')}>
        <div className='tw:flex tw:flex-col tw:justify-start'>
          <button
            type='button'
            className={'tw:block tw:p-0 tw:border-0 tw:bg-transparent tw:text-left tw:no-underline tw:text-inherit tw:text-[11.2px] ' + (selectedDateFilter == 'today' ? 'tw:font-bold' : '')}
            onClick={() => {
              setSelectedDateFilter('today')
              setfilterDates({
                startDate: moment().format('YYYY-MM-DD'),
                endDate: moment().format('YYYY-MM-DD'),
              })
              setOpenDatesMenu(false)
            }}>
            Today
          </button>
          <button
            type='button'
            className={'tw:block tw:p-0 tw:border-0 tw:bg-transparent tw:text-left tw:no-underline tw:text-inherit tw:text-[11.2px] ' + (selectedDateFilter == 'yesterday' ? 'tw:font-bold' : '')}
            onClick={() => {
              setSelectedDateFilter('yesterday')
              setfilterDates({
                startDate: moment().subtract(1, 'days').format('YYYY-MM-DD'),
                endDate: moment().subtract(1, 'days').format('YYYY-MM-DD'),
              })
              setOpenDatesMenu(false)
            }}>
            Yesterday
          </button>
          <button
            type='button'
            className={'tw:block tw:p-0 tw:border-0 tw:bg-transparent tw:text-left tw:no-underline tw:text-inherit tw:text-[11.2px] ' + (selectedDateFilter == 'thisweek' ? 'tw:font-bold' : '')}
            onClick={() => {
              setSelectedDateFilter('thisweek')
              setfilterDates({
                startDate: moment().startOf('week').format('YYYY-MM-DD'),
                endDate: moment().endOf('week').format('YYYY-MM-DD'),
              })
              setOpenDatesMenu(false)
            }}>
            This Week
          </button>
          <button
            type='button'
            className={'tw:block tw:p-0 tw:border-0 tw:bg-transparent tw:text-left tw:no-underline tw:text-inherit tw:text-[11.2px] ' + (selectedDateFilter == 'lastweek' ? 'tw:font-bold' : '')}
            onClick={() => {
              setSelectedDateFilter('lastweek')
              setfilterDates({
                startDate: moment().subtract(1, 'weeks').startOf('week').format('YYYY-MM-DD'),
                endDate: moment().subtract(1, 'weeks').endOf('week').format('YYYY-MM-DD'),
              })
              setOpenDatesMenu(false)
            }}>
            Last Week
          </button>
          <button
            type='button'
            className={'tw:block tw:p-0 tw:border-0 tw:bg-transparent tw:text-left tw:no-underline tw:text-inherit tw:text-[11.2px] ' + (selectedDateFilter == 'past7days' ? 'tw:font-bold' : '')}
            onClick={() => {
              setSelectedDateFilter('past7days')
              setfilterDates({
                startDate: moment().subtract(7, 'days').format('YYYY-MM-DD'),
                endDate: moment().format('YYYY-MM-DD'),
              })
              setOpenDatesMenu(false)
            }}>
            Past 7 Days
          </button>
          <button
            type='button'
            className={'tw:block tw:p-0 tw:border-0 tw:bg-transparent tw:text-left tw:no-underline tw:text-inherit tw:text-[11.2px] ' + (selectedDateFilter == 'thismonth' ? 'tw:font-bold' : '')}
            onClick={() => {
              setSelectedDateFilter('thismonth')
              setfilterDates({
                startDate: moment().startOf('month').format('YYYY-MM-DD'),
                endDate: moment().endOf('month').format('YYYY-MM-DD'),
              })
              setOpenDatesMenu(false)
            }}>
            This Month
          </button>
          <button
            type='button'
            className={'tw:block tw:p-0 tw:border-0 tw:bg-transparent tw:text-left tw:no-underline tw:text-inherit tw:text-[11.2px] ' + (selectedDateFilter == 'past3days' ? 'tw:font-bold' : '')}
            onClick={() => {
              setSelectedDateFilter('past3days')
              setfilterDates({
                startDate: moment().subtract(1, 'months').format('YYYY-MM-DD'),
                endDate: moment().format('YYYY-MM-DD'),
              })
              setOpenDatesMenu(false)
            }}>
            Past 30 Days
          </button>
          <button
            type='button'
            className={'tw:block tw:p-0 tw:border-0 tw:bg-transparent tw:text-left tw:no-underline tw:text-inherit tw:text-[11.2px] ' + (selectedDateFilter == 'lastmonth' ? 'tw:font-bold' : '')}
            onClick={() => {
              setSelectedDateFilter('lastmonth')
              setfilterDates({
                startDate: moment().subtract(1, 'months').startOf('month').format('YYYY-MM-DD'),
                endDate: moment().subtract(1, 'months').endOf('month').format('YYYY-MM-DD'),
              })
              setOpenDatesMenu(false)
            }}>
            Last Month
          </button>
          <button
            type='button'
            className={'tw:block tw:p-0 tw:border-0 tw:bg-transparent tw:text-left tw:no-underline tw:text-inherit tw:text-[11.2px] ' + (selectedDateFilter == 'yeartodate' ? 'tw:font-bold' : '')}
            onClick={() => {
              setSelectedDateFilter('yeartodate')
              setfilterDates({
                startDate: moment().startOf('year').format('YYYY-MM-DD'),
                endDate: moment().format('YYYY-MM-DD'),
              })
              setOpenDatesMenu(false)
            }}>
            Year to Date
          </button>
          <button
            type='button'
            className={'tw:block tw:p-0 tw:border-0 tw:bg-transparent tw:text-left tw:no-underline tw:text-inherit tw:text-[11.2px] ' + (selectedDateFilter == 'lastyear' ? 'tw:font-bold' : '')}
            onClick={() => {
              setSelectedDateFilter('lastyear')
              setfilterDates({
                startDate: moment().subtract(1, 'year').startOf('year').format('YYYY-MM-DD'),
                endDate: moment().subtract(1, 'year').endOf('year').format('YYYY-MM-DD'),
              })
              setOpenDatesMenu(false)
            }}>
            Last Year
          </button>
          <span className='tw:font-light tw:text-[color:var(--bs-secondary-color)] tw:text-[11.2px] tw:pb-1 tw:border-t tw:border-[color:var(--border)] tw:pt-1'>Select Range:</span>
          <Flatpickr
            className={'tw:border tw:border-[color:var(--border)] tw:text-[13px] tw:w-full tw:p-2 tw:rounded-md' + (selectedDateFilter == 'picker' ? ' tw:font-bold' : '')}
            options={{
              mode: 'range',
              dateFormat: 'd M y',
              defaultDate: [moment(filterDates.startDate, 'YYYY-MM-DD').format('DD MMM YY'), moment(filterDates.endDate, 'YYYY-MM-DD').format('DD MMM YY')],
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

export default NewFilterByDates
