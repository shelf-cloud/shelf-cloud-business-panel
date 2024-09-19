import React, { useRef } from 'react'
import moment from 'moment'
import Flatpickr from 'react-flatpickr'
import { Button } from 'reactstrap'

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
      <div key={id} className={'btn btn-sm m-0 rounded border border-2 ' + (selectedDate !== '' ? 'border-primary' : 'border-danger')} style={{ backgroundColor: 'white' }}>
        <div className='d-flex justify-content-start align-items-center gap-2'>
          <i className='las la-calendar fs-4 m-0 p-0 text-primary' />
          <Flatpickr
            ref={datePicker}
            key={`${id}-picker`}
            className={'border-0 fs-6'}
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
          <i className='ri-close-fill fs-5' />
        </Button>
      )}
    </>
  )
}

export default ShippingSelectDate
