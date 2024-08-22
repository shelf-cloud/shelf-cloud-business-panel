import React from 'react'
import moment from 'moment'
import Flatpickr from 'react-flatpickr'

type Props = {
  id: string
  selectedDate: string
  minDate: string
  setnewDate: (dateStr: string) => void
}

const ShippingSelectDate = ({ id, selectedDate, minDate, setnewDate }: Props) => {
  return (
    <div key={id} className={'btn btn-sm m-0 rounded border border-2 ' + (selectedDate !== '' ? 'border-primary': 'border-danger')} style={{ backgroundColor: 'white' }}>
      <div className='d-flex justify-content-start align-items-center gap-2'>
        <i className='las la-calendar fs-4 m-0 p-0 text-primary' />
        <Flatpickr
          key={`${id}-picker`}
          className={'border-0 fs-6'}
          options={{
            mode: 'single',
            position: 'auto',
            dateFormat: 'm/d/Y',
            defaultDate: selectedDate !== '' ? moment(selectedDate, 'MM/DD/YYYY').format('MM/DD/YYYY') : undefined,
            minDate: minDate,
            maxDate: moment().add(19, 'day').format('MM/DD/YYYY'),
          }}
          onChange={(_selectedDates, dateStr) => {
            setnewDate(dateStr)
          }}
        />
      </div>
    </div>
  )
}

export default ShippingSelectDate
