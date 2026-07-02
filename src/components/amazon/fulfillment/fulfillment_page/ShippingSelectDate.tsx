import { useRef } from 'react'

import moment from 'moment'
import Flatpickr from 'react-flatpickr'
import { Button } from '@/components/migration-ui'

type Props = {
  id: string
  selectedDate: string
  minDate: string
  maxDate?: string
  setnewDate: (dateStr: string) => void
  clearDate?: boolean
}

const ShippingSelectDate = ({ id, selectedDate, minDate, maxDate, setnewDate, clearDate }: Props) => {
  const datePicker = useRef<any>(null)
  return (
    <>
      <div key={id} className={'btn btn-sm tw:m-0 tw:rounded tw:border tw:border-2 tw:border-[color:var(--border)] '} style={{ backgroundColor: 'white' }}>
        <div className='tw:flex tw:justify-start tw:items-center tw:gap-2'>
          <i className='las la-calendar tw:text-[19.5px] tw:m-0 tw:p-0 tw:text-primary' />
          <Flatpickr
            ref={datePicker}
            key={`${id}-picker`}
            className={'tw:border-0 tw:text-[13px]'}
            options={{
              mode: 'single',
              position: 'auto',
              dateFormat: 'm/d/Y',
              defaultDate: selectedDate !== '' ? moment(selectedDate, 'MM/DD/YYYY').format('MM/DD/YYYY') : undefined,
              minDate: minDate,
              maxDate: maxDate ? maxDate : undefined,
            }}
            onChange={(_selectedDates, dateStr) => {
              setnewDate(dateStr)
            }}
          />
        </div>
      </div>
      {clearDate && (
        <Button size='sm' color='light' className='btn-icon' onClick={() => datePicker.current.flatpickr.clear()}>
          <i className='ri-close-fill tw:text-[16.25px]' />
        </Button>
      )}
    </>
  )
}

export default ShippingSelectDate
