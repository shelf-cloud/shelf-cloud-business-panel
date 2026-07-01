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
        className='btn btn-light dropdown-toggle d-flex flex-row justify-content-start align-items-center gap-2'
        style={{ backgroundColor: 'white', border: '1px solid #E1E3E5' }}
        type='button'
        aria-expanded='false'
        onClick={() => setOpenDatesMenu(!openDatesMenu)}>
        <i className='las la-calendar fs-3 m-0 p-0 text-primary' />
        <span className='fw-semibold m-0 p-0 tw:text-xs'>{`${showMappedCreateReport.startDate} -> ${showMappedCreateReport.endDate}`}</span>
      </button>
      <div className={'dropdown-menu dropdown-menu-md px-4 py-3' + (openDatesMenu ? ' show' : '')}>
        <div className='d-flex flex-column justify-content-start gap-1'>
          <button
            type='button'
            className={'btn btn-link p-0 border-0 text-start text-decoration-none text-reset ' + (selectedDateFilter == 'today' ? 'fw-bold' : '')}
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
            className={'btn btn-link p-0 border-0 text-start text-decoration-none text-reset ' + (selectedDateFilter == 'yesterday' ? 'fw-bold' : '')}
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
            className={'btn btn-link p-0 border-0 text-start text-decoration-none text-reset ' + (selectedDateFilter == 'thisweek' ? 'fw-bold' : '')}
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
            className={'btn btn-link p-0 border-0 text-start text-decoration-none text-reset ' + (selectedDateFilter == 'lastweek' ? 'fw-bold' : '')}
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
            className={'btn btn-link p-0 border-0 text-start text-decoration-none text-reset ' + (selectedDateFilter == 'past7days' ? 'fw-bold' : '')}
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
            className={'btn btn-link p-0 border-0 text-start text-decoration-none text-reset ' + (selectedDateFilter == 'thismonth' ? 'fw-bold' : '')}
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
            className={'btn btn-link p-0 border-0 text-start text-decoration-none text-reset ' + (selectedDateFilter == 'past3days' ? 'fw-bold' : '')}
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
            className={'btn btn-link p-0 border-0 text-start text-decoration-none text-reset ' + (selectedDateFilter == 'lastmonth' ? 'fw-bold' : '')}
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
            className={'btn btn-link p-0 border-0 text-start text-decoration-none text-reset ' + (selectedDateFilter == 'yeartodate' ? 'fw-bold' : '')}
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
            className={'btn btn-link p-0 border-0 text-start text-decoration-none text-reset ' + (selectedDateFilter == 'lastyear' ? 'fw-bold' : '')}
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
          <span className='fw-light text-muted fs-7 pb-0 border-top pt-1'>Select Range:</span>
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
