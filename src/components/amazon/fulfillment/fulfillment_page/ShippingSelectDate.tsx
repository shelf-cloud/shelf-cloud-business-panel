import { useRef } from 'react'

import moment from 'moment'
import Flatpickr from 'react-flatpickr'
import { Button } from '@shadcn/ui/button'

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
      <div key={id} className={'inline-flex items-center justify-center gap-2 whitespace-nowrap text-xs font-medium h-8 px-3 m-0 rounded border border-2 border-[color:var(--border)] '} style={{ backgroundColor: 'white' }}>
        <div className='flex justify-start items-center gap-2'>
          <i className='las la-calendar text-[19.5px] m-0 p-0 text-primary' />
          <Flatpickr
            ref={datePicker}
            key={`${id}-picker`}
            className={'border-0 text-[13px]'}
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
        <Button size='sm' variant='light' className='btn-icon' onClick={() => datePicker.current.flatpickr.clear()}>
          <i className='ri-close-fill text-[16.25px]' />
        </Button>
      )}
    </>
  )
}

export default ShippingSelectDate
