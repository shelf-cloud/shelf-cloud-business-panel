 
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
    <div ref={filterByDates} className='relative'>
      <button
        className='inline-flex h-9 flex-row justify-start items-center gap-2 rounded-md px-3'
        style={{ backgroundColor: 'white', border: '1px solid #E1E3E5' }}
        type='button'
        aria-expanded='false'
        onClick={() => setOpenDatesMenu(!openDatesMenu)}>
        <i className='las la-calendar text-[19.5px] m-0 p-0 text-primary' />
        <span className='font-semibold m-0 p-0 text-[11.2px]'>
          {filterDates.startDate !== '' || filterDates.endDate !== '' ? `${filterDates.startDate} -> ${filterDates.endDate}` : 'Select Dates'}
        </span>
      </button>
      <div className={'absolute z-10 mt-1 px-4 py-3 bg-white border border-[#E1E3E5] rounded-md shadow min-w-[200px]' + (openDatesMenu ? ' show' : '')}>
        <div className='flex flex-col justify-start'>
          <button
            type='button'
            className={'block p-0 border-0 bg-transparent text-left no-underline text-inherit text-[11.2px] ' + (selectedDateFilter == 'today' ? 'font-bold' : '')}
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
            className={'block p-0 border-0 bg-transparent text-left no-underline text-inherit text-[11.2px] ' + (selectedDateFilter == 'yesterday' ? 'font-bold' : '')}
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
            className={'block p-0 border-0 bg-transparent text-left no-underline text-inherit text-[11.2px] ' + (selectedDateFilter == 'thisweek' ? 'font-bold' : '')}
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
            className={'block p-0 border-0 bg-transparent text-left no-underline text-inherit text-[11.2px] ' + (selectedDateFilter == 'lastweek' ? 'font-bold' : '')}
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
            className={'block p-0 border-0 bg-transparent text-left no-underline text-inherit text-[11.2px] ' + (selectedDateFilter == 'past7days' ? 'font-bold' : '')}
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
            className={'block p-0 border-0 bg-transparent text-left no-underline text-inherit text-[11.2px] ' + (selectedDateFilter == 'thismonth' ? 'font-bold' : '')}
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
            className={'block p-0 border-0 bg-transparent text-left no-underline text-inherit text-[11.2px] ' + (selectedDateFilter == 'past3days' ? 'font-bold' : '')}
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
            className={'block p-0 border-0 bg-transparent text-left no-underline text-inherit text-[11.2px] ' + (selectedDateFilter == 'lastmonth' ? 'font-bold' : '')}
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
            className={'block p-0 border-0 bg-transparent text-left no-underline text-inherit text-[11.2px] ' + (selectedDateFilter == 'yeartodate' ? 'font-bold' : '')}
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
            className={'block p-0 border-0 bg-transparent text-left no-underline text-inherit text-[11.2px] ' + (selectedDateFilter == 'lastyear' ? 'font-bold' : '')}
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
          <span className='font-light text-muted-foreground text-[11.2px] pb-1 border-t border-[color:var(--border)] pt-1'>Select Range:</span>
          <Flatpickr
            className={'border border-[color:var(--border)] text-[13px] w-full p-2 rounded-md' + (selectedDateFilter == 'picker' ? ' font-bold' : '')}
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
