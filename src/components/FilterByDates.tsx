 
import { useRef, useState } from 'react'

import { useClickOutside } from '@hooks/useClickOutside'

import { ChevronDownIcon } from 'lucide-react'
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

  useClickOutside(filterByDates, () => setOpenDatesMenu(false))

  return (
    <div ref={filterByDates} className='tw:relative tw:inline-block'>
      <button
        className='tw:inline-flex tw:h-9 tw:items-center tw:gap-2 tw:rounded-md tw:border tw:border-[#E1E3E5] tw:bg-white tw:px-3 tw:text-sm tw:font-semibold tw:text-foreground tw:whitespace-nowrap'
        type='button'
        aria-expanded='false'
        onClick={() => setOpenDatesMenu(!openDatesMenu)}>
        <i className='las la-calendar tw:text-base tw:text-primary' />
        <span className='tw:m-0 tw:p-0'>{shipmentsStartDate !== '' || shipmentsEndDate !== '' ? `${shipmentsStartDate} -> ${shipmentsEndDate}` : 'Select Dates'}</span>
        <ChevronDownIcon className='tw:size-4' />
      </button>
      <div
        className={
          'tw:absolute tw:z-50 tw:mt-1 tw:min-w-[16rem] tw:rounded-md tw:border tw:border-[#E1E3E5] tw:bg-white tw:px-4 tw:py-3 tw:shadow-md ' + (openDatesMenu ? 'tw:block' : 'tw:hidden')
        }>
        <div className='d-flex flex-column justify-content-start'>
          <button
            type='button'
            className={'tw:p-0 tw:border-0 tw:bg-transparent tw:text-start tw:no-underline tw:text-foreground tw:text-sm tw:hover:text-primary ' + (selectedDateFilter == 'today' ? 'tw:font-bold' : '')}
            onClick={() => {
              setSelectedDateFilter('today')
              setShipmentsStartDate(moment().format('YYYY-MM-DD'))
              setShipmentsEndDate(moment().format('YYYY-MM-DD'))
              setOpenDatesMenu(false)
            }}>
            Today
          </button>
          <button
            type='button'
            className={'tw:p-0 tw:border-0 tw:bg-transparent tw:text-start tw:no-underline tw:text-foreground tw:text-sm tw:hover:text-primary ' + (selectedDateFilter == 'yesterday' ? 'tw:font-bold' : '')}
            onClick={() => {
              setSelectedDateFilter('yesterday')
              setShipmentsStartDate(moment().subtract(1, 'days').format('YYYY-MM-DD'))
              setShipmentsEndDate(moment().subtract(1, 'days').format('YYYY-MM-DD'))
              setOpenDatesMenu(false)
            }}>
            Yesterday
          </button>
          <button
            type='button'
            className={'tw:p-0 tw:border-0 tw:bg-transparent tw:text-start tw:no-underline tw:text-foreground tw:text-sm tw:hover:text-primary ' + (selectedDateFilter == 'thisweek' ? 'tw:font-bold' : '')}
            onClick={() => {
              setSelectedDateFilter('thisweek')
              setShipmentsStartDate(moment().startOf('week').format('YYYY-MM-DD'))
              setShipmentsEndDate(moment().endOf('week').format('YYYY-MM-DD'))
              setOpenDatesMenu(false)
            }}>
            This Week
          </button>
          <button
            type='button'
            className={'tw:p-0 tw:border-0 tw:bg-transparent tw:text-start tw:no-underline tw:text-foreground tw:text-sm tw:hover:text-primary ' + (selectedDateFilter == 'lastweek' ? 'tw:font-bold' : '')}
            onClick={() => {
              setSelectedDateFilter('lastweek')
              setShipmentsStartDate(moment().subtract(1, 'weeks').startOf('week').format('YYYY-MM-DD'))
              setShipmentsEndDate(moment().subtract(1, 'weeks').endOf('week').format('YYYY-MM-DD'))
              setOpenDatesMenu(false)
            }}>
            Last Week
          </button>
          <button
            type='button'
            className={'tw:p-0 tw:border-0 tw:bg-transparent tw:text-start tw:no-underline tw:text-foreground tw:text-sm tw:hover:text-primary ' + (selectedDateFilter == 'past7days' ? 'tw:font-bold' : '')}
            onClick={() => {
              setSelectedDateFilter('past7days')
              setShipmentsStartDate(moment().subtract(7, 'days').format('YYYY-MM-DD'))
              setShipmentsEndDate(moment().format('YYYY-MM-DD'))
              setOpenDatesMenu(false)
            }}>
            Past 7 Days
          </button>
          <button
            type='button'
            className={'tw:p-0 tw:border-0 tw:bg-transparent tw:text-start tw:no-underline tw:text-foreground tw:text-sm tw:hover:text-primary ' + (selectedDateFilter == 'thismonth' ? 'tw:font-bold' : '')}
            onClick={() => {
              setSelectedDateFilter('thismonth')
              setShipmentsStartDate(moment().startOf('month').format('YYYY-MM-DD'))
              setShipmentsEndDate(moment().endOf('month').format('YYYY-MM-DD'))
              setOpenDatesMenu(false)
            }}>
            This Month
          </button>
          <button
            type='button'
            className={'tw:p-0 tw:border-0 tw:bg-transparent tw:text-start tw:no-underline tw:text-foreground tw:text-sm tw:hover:text-primary ' + (selectedDateFilter == 'past3days' ? 'tw:font-bold' : '')}
            onClick={() => {
              setSelectedDateFilter('past3days')
              setShipmentsStartDate(moment().subtract(1, 'months').format('YYYY-MM-DD'))
              setShipmentsEndDate(moment().format('YYYY-MM-DD'))
              setOpenDatesMenu(false)
            }}>
            Past 30 Days
          </button>
          <button
            type='button'
            className={'tw:p-0 tw:border-0 tw:bg-transparent tw:text-start tw:no-underline tw:text-foreground tw:text-sm tw:hover:text-primary ' + (selectedDateFilter == 'lastmonth' ? 'tw:font-bold' : '')}
            onClick={() => {
              setSelectedDateFilter('lastmonth')
              setShipmentsStartDate(moment().subtract(1, 'months').startOf('month').format('YYYY-MM-DD'))
              setShipmentsEndDate(moment().subtract(1, 'months').endOf('month').format('YYYY-MM-DD'))
              setOpenDatesMenu(false)
            }}>
            Last Month
          </button>
          <button
            type='button'
            className={'tw:p-0 tw:border-0 tw:bg-transparent tw:text-start tw:no-underline tw:text-foreground tw:text-sm tw:hover:text-primary ' + (selectedDateFilter == 'yeartodate' ? 'tw:font-bold' : '')}
            onClick={() => {
              setSelectedDateFilter('yeartodate')
              setShipmentsStartDate(moment().startOf('year').format('YYYY-MM-DD'))
              setShipmentsEndDate(moment().format('YYYY-MM-DD'))
              setOpenDatesMenu(false)
            }}>
            Year to Date
          </button>
          <button
            type='button'
            className={'tw:p-0 tw:border-0 tw:bg-transparent tw:text-start tw:no-underline tw:text-foreground tw:text-sm tw:hover:text-primary ' + (selectedDateFilter == 'lastyear' ? 'tw:font-bold' : '')}
            onClick={() => {
              setSelectedDateFilter('lastyear')
              setShipmentsStartDate(moment().subtract(1, 'year').startOf('year').format('YYYY-MM-DD'))
              setShipmentsEndDate(moment().subtract(1, 'year').endOf('year').format('YYYY-MM-DD'))
              setOpenDatesMenu(false)
            }}>
            Last Year
          </button>
          <span className='tw:font-light tw:text-[color:var(--bs-secondary-color)] tw:text-sm tw:pb-1 tw:border-t tw:pt-1'>Select Range:</span>
          <Flatpickr
            className={'tw:border tw:border-[#E1E3E5] tw:text-sm tw:w-full tw:p-2' + (selectedDateFilter == 'picker' ? ' tw:font-bold' : '')}
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
