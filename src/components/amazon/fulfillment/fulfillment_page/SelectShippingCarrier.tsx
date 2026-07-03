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
    <div id={id} ref={selectCarrier} className='relative mb-0 w-full'>
      <button
        type='button'
        className={'flex items-center w-full p-0 bg-transparent border border-2 rounded ' + (!disabled && selected == '' ? 'border-danger' : 'border-primary')}
        onClick={() => (disabled ? null : setOpenDatesMenu(!openDatesMenu))}
        disabled={disabled}
        style={{ cursor: 'pointer' }}>
        <span className='py-[0.3rem] text-[11.2px] w-full text-left px-2' style={{ backgroundColor: disabled ? 'lightgrey' : 'white', opacity: '100%' }}>
          {selected == '' ? <span className='text-muted-foreground'>Select</span> : selected}
        </span>
        <span
          className='flex items-center justify-center text-[13px] border-l border-[color:var(--border)]'
          style={{ backgroundColor: disabled ? 'lightgrey' : 'white', maxWidth: '35px', width: '35px', alignSelf: 'stretch' }}
          aria-expanded='false'>
          <span className='sr-only'>Toggle Dropdown</span>
        </span>
      </button>
      <div id={`${id}-menu`} className={'absolute z-10 mt-1 w-full bg-white border border-[#E1E3E5] rounded-md shadow py-4 px-6 ' + (openDatesMenu ? 'block' : 'hidden')}>
        <div className='flex flex-col justify-start'>
          <div style={{ maxHeight: '25vh', overflowY: 'scroll', scrollbarWidth: 'none' }}>
            {selectionInfo?.map((option) => (
              <button
                type='button'
                key={`${option.carrier.alphaCode}-${option.transportationOptionId}-${option.shipmentId}`}
                className={'text-reset block p-0 border-0 text-left no-underline text-[11.2px] mb-2 bg-transparent ' + (selected == `${option.carrier.name}` ? 'font-bold' : '')}
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
            className={'p-0 border-0 no-underline text-muted-foreground text-right text-[11.2px] bg-transparent w-full'}
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
