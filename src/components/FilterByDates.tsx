 
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
    <div ref={filterByDates} className='relative inline-block'>
      <button
        className='inline-flex h-9 items-center gap-2 rounded-md border border-[#E1E3E5] bg-white px-3 text-sm font-semibold text-foreground whitespace-nowrap'
        type='button'
        aria-expanded='false'
        onClick={() => setOpenDatesMenu(!openDatesMenu)}>
        <i className='las la-calendar text-base text-primary' />
        <span className='m-0 p-0'>{shipmentsStartDate !== '' || shipmentsEndDate !== '' ? `${shipmentsStartDate} -> ${shipmentsEndDate}` : 'Select Dates'}</span>
        <ChevronDownIcon className='size-4' />
      </button>
      <div
        className={
          'absolute z-50 mt-1 min-w-[16rem] rounded-md border border-[#E1E3E5] bg-white px-4 py-3 shadow-md ' + (openDatesMenu ? 'block' : 'hidden')
        }>
        <div className='flex flex-col justify-start'>
          <button
            type='button'
            className={'p-0 border-0 bg-transparent text-start no-underline text-foreground text-sm hover:text-primary ' + (selectedDateFilter == 'today' ? 'font-bold' : '')}
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
            className={'p-0 border-0 bg-transparent text-start no-underline text-foreground text-sm hover:text-primary ' + (selectedDateFilter == 'yesterday' ? 'font-bold' : '')}
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
            className={'p-0 border-0 bg-transparent text-start no-underline text-foreground text-sm hover:text-primary ' + (selectedDateFilter == 'thisweek' ? 'font-bold' : '')}
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
            className={'p-0 border-0 bg-transparent text-start no-underline text-foreground text-sm hover:text-primary ' + (selectedDateFilter == 'lastweek' ? 'font-bold' : '')}
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
            className={'p-0 border-0 bg-transparent text-start no-underline text-foreground text-sm hover:text-primary ' + (selectedDateFilter == 'past7days' ? 'font-bold' : '')}
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
            className={'p-0 border-0 bg-transparent text-start no-underline text-foreground text-sm hover:text-primary ' + (selectedDateFilter == 'thismonth' ? 'font-bold' : '')}
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
            className={'p-0 border-0 bg-transparent text-start no-underline text-foreground text-sm hover:text-primary ' + (selectedDateFilter == 'past3days' ? 'font-bold' : '')}
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
            className={'p-0 border-0 bg-transparent text-start no-underline text-foreground text-sm hover:text-primary ' + (selectedDateFilter == 'lastmonth' ? 'font-bold' : '')}
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
            className={'p-0 border-0 bg-transparent text-start no-underline text-foreground text-sm hover:text-primary ' + (selectedDateFilter == 'yeartodate' ? 'font-bold' : '')}
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
            className={'p-0 border-0 bg-transparent text-start no-underline text-foreground text-sm hover:text-primary ' + (selectedDateFilter == 'lastyear' ? 'font-bold' : '')}
            onClick={() => {
              setSelectedDateFilter('lastyear')
              setShipmentsStartDate(moment().subtract(1, 'year').startOf('year').format('YYYY-MM-DD'))
              setShipmentsEndDate(moment().subtract(1, 'year').endOf('year').format('YYYY-MM-DD'))
              setOpenDatesMenu(false)
            }}>
            Last Year
          </button>
          <span className='font-light text-muted-foreground text-sm pb-1 border-t pt-1'>Select Range:</span>
          <Flatpickr
            className={'border border-[#E1E3E5] text-sm w-full p-2' + (selectedDateFilter == 'picker' ? ' font-bold' : '')}
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
