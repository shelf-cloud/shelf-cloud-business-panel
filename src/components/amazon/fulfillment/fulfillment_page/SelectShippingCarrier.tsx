import { useRef, useState } from 'react'

import { useClickOutside } from '@hooks/useClickOutside'

import { TransportationOption } from '@typesTs/amazon/fulfillments/fulfillment'

type Props = {
  id: string
  selectionInfo: TransportationOption[]
  disabled: boolean
  selected: string
  handleSelection: (name: string, alphaCode: string, transportationOptionId: string) => void
}

const SelectShippingCarrier = ({ id, selectionInfo, disabled, selected, handleSelection }: Props) => {
  const [openDatesMenu, setOpenDatesMenu] = useState(false)
  const selectCarrier = useRef<HTMLDivElement | null>(null)

  useClickOutside(selectCarrier, () => setOpenDatesMenu(false))

  return (
    <div id={id} ref={selectCarrier} className='dropdown mb-0 w-100'>
      <button
        type='button'
        className={'btn-group w-100 form-control form-control-sm p-0 bg-transparent border border-2 ' + (!disabled && selected == '' ? 'border-danger' : 'border-primary')}
        onClick={() => (disabled ? null : setOpenDatesMenu(!openDatesMenu))}
        disabled={disabled}
        style={{ cursor: 'pointer' }}>
        <span className='btn btn-light btn-sm py-0 fs-7 w-100 text-start' style={{ backgroundColor: disabled ? 'lightgrey' : 'white', opacity: '100%' }}>
          {selected == '' ? <span className='text-muted'>Select</span> : selected}
        </span>
        <span
          className='btn btn-light btn-sm dropdown-toggle fs-6 dropdown-toggle dropdown-toggle-split'
          style={{ backgroundColor: disabled ? 'lightgrey' : 'white', maxWidth: '35px' }}
          aria-expanded='false'>
          <span className='visually-hidden'>Toggle Dropdown</span>
        </span>
      </button>
      <div id={`${id}-menu`} className={'dropdown-menu w-100 py-3 px-4' + (openDatesMenu ? ' show' : '')}>
        <div className='d-flex flex-column justify-content-start'>
          <div style={{ maxHeight: '25vh', overflowY: 'scroll', scrollbarWidth: 'none' }}>
            {selectionInfo?.map((option) => (
              <button
                type='button'
                key={`${option.carrier.alphaCode}-${option.transportationOptionId}-${option.shipmentId}`}
                className={'btn btn-link d-block p-0 border-0 text-start text-decoration-none text-reset fs-7 mb-2 ' + (selected == `${option.carrier.name}` ? 'fw-bold' : '')}
                onClick={() => {
                  handleSelection(option.carrier.name, option.carrier.alphaCode!, option.transportationOptionId)
                  setOpenDatesMenu(false)
                }}>
                {option.carrier.name}
              </button>
            ))}
          </div>
          <button
            type='button'
            className={'btn btn-link p-0 border-0 text-decoration-none text-muted text-end fs-7'}
            onClick={() => {
              handleSelection('', '', '')
              setOpenDatesMenu(false)
            }}>
            Clear
          </button>
        </div>
      </div>
    </div>
  )
}

export default SelectShippingCarrier
