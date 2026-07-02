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
    <div id={id} ref={selectCarrier} className='tw:relative tw:mb-0 tw:w-full'>
      <button
        type='button'
        className={'tw:flex tw:items-center tw:w-full tw:p-0 tw:bg-transparent tw:border tw:border-2 tw:rounded ' + (!disabled && selected == '' ? 'tw:border-danger' : 'tw:border-primary')}
        onClick={() => (disabled ? null : setOpenDatesMenu(!openDatesMenu))}
        disabled={disabled}
        style={{ cursor: 'pointer' }}>
        <span className='tw:py-[0.3rem] tw:text-[11.2px] tw:w-full tw:text-left tw:px-2' style={{ backgroundColor: disabled ? 'lightgrey' : 'white', opacity: '100%' }}>
          {selected == '' ? <span className='tw:text-[var(--bs-secondary-color)]'>Select</span> : selected}
        </span>
        <span
          className='tw:flex tw:items-center tw:justify-center tw:text-[13px] tw:border-l tw:border-[color:var(--border)]'
          style={{ backgroundColor: disabled ? 'lightgrey' : 'white', maxWidth: '35px', width: '35px', alignSelf: 'stretch' }}
          aria-expanded='false'>
          <span className='tw:sr-only'>Toggle Dropdown</span>
        </span>
      </button>
      <div id={`${id}-menu`} className={'tw:absolute tw:z-10 tw:mt-1 tw:w-full tw:bg-white tw:border tw:border-[#E1E3E5] tw:rounded-md tw:shadow tw:py-4 tw:px-6 ' + (openDatesMenu ? 'tw:block' : 'tw:hidden')}>
        <div className='tw:flex tw:flex-col tw:justify-start'>
          <div style={{ maxHeight: '25vh', overflowY: 'scroll', scrollbarWidth: 'none' }}>
            {selectionInfo?.map((option) => (
              <button
                type='button'
                key={`${option.carrier.alphaCode}-${option.transportationOptionId}-${option.shipmentId}`}
                className={'tw:text-reset tw:block tw:p-0 tw:border-0 tw:text-left tw:no-underline tw:text-[11.2px] tw:mb-2 tw:bg-transparent ' + (selected == `${option.carrier.name}` ? 'tw:font-bold' : '')}
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
            className={'tw:p-0 tw:border-0 tw:no-underline tw:text-[var(--bs-secondary-color)] tw:text-right tw:text-[11.2px] tw:bg-transparent tw:w-full'}
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
