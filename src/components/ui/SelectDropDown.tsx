import { useRef, useState } from 'react'

import { useClickOutside } from '@hooks/useClickOutside'

type Props = {
  formValue: string
  selectionInfo: string[]
  selected: string
  handleSelection: (field: string, value: any, shouldValidate?: boolean | undefined) => void
  error?: boolean
}

const SelectDropDown = ({ formValue, selectionInfo, selected, handleSelection, error }: Props) => {
  const [openDatesMenu, setOpenDatesMenu] = useState(false)
  const selectDropDownElement = useRef<HTMLDivElement | null>(null)

  useClickOutside(selectDropDownElement, () => setOpenDatesMenu(false))

  return (
    <div ref={selectDropDownElement} className='tw:relative tw:mb-0'>
      <button
        type='button'
        className={'tw:flex tw:w-full tw:items-center tw:p-0 tw:bg-transparent tw:rounded-md tw:border tw:border-[#E1E3E5]' + (error ? ' tw:!border-destructive' : '')}
        style={{ cursor: 'pointer' }}
        onClick={() => setOpenDatesMenu(!openDatesMenu)}>
        <span className='tw:flex-1 tw:px-3 tw:py-[0.3rem] tw:text-[13px] tw:text-left' style={{ backgroundColor: 'white', opacity: '100%' }}>
          {selected == '' ? <span className='tw:text-[color:var(--bs-secondary-color)]'>Select</span> : selected}
        </span>
        <span className='tw:flex tw:items-center tw:justify-center tw:px-2' style={{ backgroundColor: 'white', maxWidth: '35px' }} aria-expanded='false'>
          <i className='mdi mdi-chevron-down tw:text-[16.25px]' />
          <span className='tw:sr-only'>Toggle Dropdown</span>
        </span>
      </button>
      <div className={'tw:absolute tw:z-10 tw:mt-1 tw:w-full tw:py-3 tw:px-4 tw:bg-white tw:border tw:border-[#E1E3E5] tw:rounded-md tw:shadow ' + (openDatesMenu ? 'tw:block' : 'tw:hidden')}>
        <div className='tw:flex tw:flex-col tw:justify-start'>
          <div style={{ maxHeight: '25vh', overflowY: 'scroll', scrollbarWidth: 'none' }}>
            {selectionInfo?.map((option) => (
              <button
                type='button'
                key={option}
                className={'tw:block tw:p-0 tw:border-0 tw:bg-transparent tw:text-left tw:no-underline tw:text-inherit tw:mb-2 ' + (selected == `${option}` ? 'tw:font-bold' : '')}
                onClick={() => {
                  handleSelection(formValue, `${option}`)
                  setOpenDatesMenu(false)
                }}>
                {`${option}`}
              </button>
            ))}
          </div>
          <button
            type='button'
            className={'tw:p-0 tw:border-0 tw:bg-transparent tw:no-underline tw:text-[color:var(--bs-secondary-color)] tw:text-right'}
            onClick={() => {
              handleSelection(formValue, '')
              setOpenDatesMenu(false)
            }}>
            Clear
          </button>
        </div>
      </div>
    </div>
  )
}

export default SelectDropDown
