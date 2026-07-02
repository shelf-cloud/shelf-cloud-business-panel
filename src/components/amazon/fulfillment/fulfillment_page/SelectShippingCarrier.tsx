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
    <div id={id} ref={selectCarrier} className='dropdown tw:mb-0 tw:w-full'>
      <button
        type='button'
        className={'btn-group form-control form-control-sm tw:w-full tw:p-0 tw:bg-transparent tw:border tw:border-2 ' + (!disabled && selected == '' ? 'tw:border-danger' : 'tw:border-primary')}
        onClick={() => (disabled ? null : setOpenDatesMenu(!openDatesMenu))}
        disabled={disabled}
        style={{ cursor: 'pointer' }}>
        <span className='btn btn-light btn-sm tw:py-0 tw:text-[11.2px] tw:w-full tw:text-left' style={{ backgroundColor: disabled ? 'lightgrey' : 'white', opacity: '100%' }}>
          {selected == '' ? <span className='tw:text-[var(--bs-secondary-color)]'>Select</span> : selected}
        </span>
        <span
          className='btn btn-light btn-sm dropdown-toggle dropdown-toggle-split tw:text-[13px]'
          style={{ backgroundColor: disabled ? 'lightgrey' : 'white', maxWidth: '35px' }}
          aria-expanded='false'>
          <span className='visually-hidden'>Toggle Dropdown</span>
        </span>
      </button>
      <div id={`${id}-menu`} className={'dropdown-menu tw:w-full tw:py-4 tw:px-6' + (openDatesMenu ? ' show' : '')}>
        <div className='tw:flex tw:flex-col tw:justify-start'>
          <div style={{ maxHeight: '25vh', overflowY: 'scroll', scrollbarWidth: 'none' }}>
            {selectionInfo?.map((option) => (
              <button
                type='button'
                key={`${option.carrier.alphaCode}-${option.transportationOptionId}-${option.shipmentId}`}
                className={'btn btn-link text-reset tw:block tw:p-0 tw:border-0 tw:text-left tw:no-underline tw:text-[11.2px] tw:mb-2 ' + (selected == `${option.carrier.name}` ? 'tw:font-bold' : '')}
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
            className={'btn btn-link tw:p-0 tw:border-0 tw:no-underline tw:text-[var(--bs-secondary-color)] tw:text-right tw:text-[11.2px]'}
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
