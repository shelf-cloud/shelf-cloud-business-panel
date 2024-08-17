import { TransportationOption } from '@typesTs/amazon/fulfillments/fulfillment'
import React, { useEffect, useRef, useState } from 'react'

type Props = {
  id: string
  selectionInfo: TransportationOption[]
  disabled: boolean
  selected: string
  handleSelection: (name: string, alphaCode: string, transportationOptionId: string) => void
}

const SelectShippingCarrier = ({ id, selectionInfo, disabled, selected, handleSelection }: Props) => {
  const [openDatesMenu, setOpenDatesMenu] = useState(false)
  const filterByDates = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (document) {
      document.addEventListener('click', (e: any) => {
        if (filterByDates.current) {
          if (!filterByDates.current.contains(e.target)) {
            setOpenDatesMenu(false)
          }
        }
      })
    }
  }, [])

  return (
    <div id={id} ref={filterByDates} className='dropdown mb-0 w-100'>
      <div
        className={'btn-group w-100 form-control form-control-sm p-0 border border-2 ' + (!disabled && selected == '' ? 'border-danger' : 'border-primary')}
        onClick={() => (disabled ? null : setOpenDatesMenu(!openDatesMenu))}
        style={{ cursor: 'pointer' }}>
        <button type='button' className='btn btn-light btn-sm py-0 fs-7 w-100 text-start' style={{ backgroundColor: disabled ? 'lightgrey' : 'white', opacity: '100%' }}>
          {selected == '' ? <span className='text-muted'>Select</span> : selected}
        </button>
        <button
          type='button'
          disabled
          className='btn btn-light btn-sm dropdown-toggle fs-6 dropdown-toggle dropdown-toggle-split'
          style={{ backgroundColor: disabled ? 'lightgrey' : 'white', maxWidth: '35px' }}
          data-bs-toggle='dropdown'
          data-bs-auto-close='outside'
          aria-expanded='false'>
          <span className='visually-hidden'>Toggle Dropdown</span>
        </button>
      </div>
      <div id={`${id}-menu`} className={'dropdown-menu w-100 py-3 px-4' + (openDatesMenu ? ' show' : '')}>
        <div className='d-flex flex-column justify-content-start'>
          <div style={{ maxHeight: '25vh', overflowY: 'scroll', scrollbarWidth: 'none' }}>
            {selectionInfo?.map((option) => (
              <p
                key={`${option.carrier.alphaCode}-${option.transportationOptionId}-${option.shipmentId}`}
                className={'m-0 mb-2 fs-7 ' + (selected == `${option.carrier.name}` ? 'fw-bold' : '')}
                style={{ cursor: 'pointer' }}
                onClick={() => {
                  handleSelection(option.carrier.name, option.carrier.alphaCode!, option.transportationOptionId)
                  setOpenDatesMenu(false)
                }}>
                {option.carrier.name}
              </p>
            ))}
          </div>
          <p
            className={'mt-2 mb-0 text-muted text-end fs-7'}
            style={{ cursor: 'pointer' }}
            onClick={() => {
              handleSelection('', '', '')
              setOpenDatesMenu(false)
            }}>
            Clear
          </p>
        </div>
      </div>
    </div>
  )
}

export default SelectShippingCarrier
