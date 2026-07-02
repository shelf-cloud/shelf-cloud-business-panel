import { useRef, useState } from 'react'

import { useClickOutside } from '@hooks/useClickOutside'
import moment from 'moment'
import Flatpickr from 'react-flatpickr'

type Props = {
  showMappedCreateReport: {
    show: boolean
    loading: boolean
    reportType: string
    startDate: string
    endDate: string
    productsSelected: string
  }
  setshowMappedCreateReport: (prev: any) => void
  handleChangeDatesFromPicker: (dateStr: string) => void
}

const SelectRangeDates = ({ showMappedCreateReport, setshowMappedCreateReport, handleChangeDatesFromPicker }: Props) => {
  const [openDatesMenu, setOpenDatesMenu] = useState(false)
  const [selectedDateFilter, setSelectedDateFilter] = useState('picker')
  const selectDates = useRef<HTMLDivElement | null>(null)

  useClickOutside(selectDates, () => setOpenDatesMenu(false))

  return (
    <div ref={selectDates} className='dropdown'>
      <button
        className='btn btn-light dropdown-toggle flex flex-row justify-start items-center gap-2'
        style={{ backgroundColor: 'white', border: '1px solid #E1E3E5' }}
        type='button'
        aria-expanded='false'
        onClick={() => setOpenDatesMenu(!openDatesMenu)}>
        <i className='las la-calendar text-[22.75px] m-0 p-0 text-primary' />
        <span className='font-semibold m-0 p-0 text-xs'>{`${showMappedCreateReport.startDate} -> ${showMappedCreateReport.endDate}`}</span>
      </button>
      <div className={'dropdown-menu dropdown-menu-md px-4 py-3' + (openDatesMenu ? ' show' : '')}>
        <div className='flex flex-col justify-start gap-1'>
          <button
            type='button'
            className={'btn btn-link p-0 border-0 text-left no-underline text-inherit ' + (selectedDateFilter == 'today' ? 'font-bold' : '')}
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
          </button>
          <button
            type='button'
            className={'btn btn-link p-0 border-0 text-left no-underline text-inherit ' + (selectedDateFilter == 'yesterday' ? 'font-bold' : '')}
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
          </button>
          <button
            type='button'
            className={'btn btn-link p-0 border-0 text-left no-underline text-inherit ' + (selectedDateFilter == 'thisweek' ? 'font-bold' : '')}
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
          </button>
          <button
            type='button'
            className={'btn btn-link p-0 border-0 text-left no-underline text-inherit ' + (selectedDateFilter == 'lastweek' ? 'font-bold' : '')}
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
          </button>
          <button
            type='button'
            className={'btn btn-link p-0 border-0 text-left no-underline text-inherit ' + (selectedDateFilter == 'past7days' ? 'font-bold' : '')}
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
          </button>
          <button
            type='button'
            className={'btn btn-link p-0 border-0 text-left no-underline text-inherit ' + (selectedDateFilter == 'thismonth' ? 'font-bold' : '')}
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
          </button>
          <button
            type='button'
            className={'btn btn-link p-0 border-0 text-left no-underline text-inherit ' + (selectedDateFilter == 'past3days' ? 'font-bold' : '')}
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
          </button>
          <button
            type='button'
            className={'btn btn-link p-0 border-0 text-left no-underline text-inherit ' + (selectedDateFilter == 'lastmonth' ? 'font-bold' : '')}
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
          </button>
          <button
            type='button'
            className={'btn btn-link p-0 border-0 text-left no-underline text-inherit ' + (selectedDateFilter == 'yeartodate' ? 'font-bold' : '')}
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
          </button>
          <button
            type='button'
            className={'btn btn-link p-0 border-0 text-left no-underline text-inherit ' + (selectedDateFilter == 'lastyear' ? 'font-bold' : '')}
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
          </button>
          <span className='font-light text-[var(--bs-secondary-color)] text-[11.2px] pb-0 border-t pt-1'>Select Range:</span>
          <Flatpickr
            className={'border-0 text-[13px] w-full py-2 px-2' + (selectedDateFilter == 'picker' ? ' font-bold' : '')}
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
