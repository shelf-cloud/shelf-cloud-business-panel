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
        className='btn btn-light dropdown-toggle tw:flex tw:flex-row tw:justify-start tw:items-center tw:gap-2'
        style={{ backgroundColor: 'white', border: '1px solid #E1E3E5' }}
        type='button'
        aria-expanded='false'
        onClick={() => setOpenDatesMenu(!openDatesMenu)}>
        <i className='las la-calendar tw:text-[22.75px] tw:m-0 tw:p-0 tw:text-primary' />
        <span className='tw:font-semibold tw:m-0 tw:p-0 tw:text-xs'>{`${showMappedCreateReport.startDate} -> ${showMappedCreateReport.endDate}`}</span>
      </button>
      <div className={'dropdown-menu dropdown-menu-md tw:px-4 tw:py-3' + (openDatesMenu ? ' show' : '')}>
        <div className='tw:flex tw:flex-col tw:justify-start tw:gap-1'>
          <button
            type='button'
            className={'btn btn-link tw:p-0 tw:border-0 tw:text-left tw:no-underline tw:text-inherit ' + (selectedDateFilter == 'today' ? 'tw:font-bold' : '')}
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
            className={'btn btn-link tw:p-0 tw:border-0 tw:text-left tw:no-underline tw:text-inherit ' + (selectedDateFilter == 'yesterday' ? 'tw:font-bold' : '')}
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
            className={'btn btn-link tw:p-0 tw:border-0 tw:text-left tw:no-underline tw:text-inherit ' + (selectedDateFilter == 'thisweek' ? 'tw:font-bold' : '')}
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
            className={'btn btn-link tw:p-0 tw:border-0 tw:text-left tw:no-underline tw:text-inherit ' + (selectedDateFilter == 'lastweek' ? 'tw:font-bold' : '')}
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
            className={'btn btn-link tw:p-0 tw:border-0 tw:text-left tw:no-underline tw:text-inherit ' + (selectedDateFilter == 'past7days' ? 'tw:font-bold' : '')}
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
            className={'btn btn-link tw:p-0 tw:border-0 tw:text-left tw:no-underline tw:text-inherit ' + (selectedDateFilter == 'thismonth' ? 'tw:font-bold' : '')}
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
            className={'btn btn-link tw:p-0 tw:border-0 tw:text-left tw:no-underline tw:text-inherit ' + (selectedDateFilter == 'past3days' ? 'tw:font-bold' : '')}
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
            className={'btn btn-link tw:p-0 tw:border-0 tw:text-left tw:no-underline tw:text-inherit ' + (selectedDateFilter == 'lastmonth' ? 'tw:font-bold' : '')}
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
            className={'btn btn-link tw:p-0 tw:border-0 tw:text-left tw:no-underline tw:text-inherit ' + (selectedDateFilter == 'yeartodate' ? 'tw:font-bold' : '')}
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
            className={'btn btn-link tw:p-0 tw:border-0 tw:text-left tw:no-underline tw:text-inherit ' + (selectedDateFilter == 'lastyear' ? 'tw:font-bold' : '')}
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
          <span className='tw:font-light tw:text-[var(--bs-secondary-color)] tw:text-[11.2px] tw:pb-0 tw:border-t tw:pt-1'>Select Range:</span>
          <Flatpickr
            className={'tw:border-0 tw:text-[13px] tw:w-full tw:py-2 tw:px-2' + (selectedDateFilter == 'picker' ? ' tw:font-bold' : '')}
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
