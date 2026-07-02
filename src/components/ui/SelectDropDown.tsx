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
    <div ref={selectDropDownElement} className='relative mb-0'>
      <button
        type='button'
        className={'flex w-full items-center p-0 bg-transparent rounded-md border border-[#E1E3E5]' + (error ? ' !border-destructive' : '')}
        style={{ cursor: 'pointer' }}
        onClick={() => setOpenDatesMenu(!openDatesMenu)}>
        <span className='flex-1 px-3 py-[0.3rem] text-[13px] text-left' style={{ backgroundColor: 'white', opacity: '100%' }}>
          {selected == '' ? <span className='text-[color:var(--bs-secondary-color)]'>Select</span> : selected}
        </span>
        <span className='flex items-center justify-center px-2' style={{ backgroundColor: 'white', maxWidth: '35px' }} aria-expanded='false'>
          <i className='mdi mdi-chevron-down text-[16.25px]' />
          <span className='sr-only'>Toggle Dropdown</span>
        </span>
      </button>
      <div className={'absolute z-10 mt-1 w-full py-3 px-4 bg-white border border-[#E1E3E5] rounded-md shadow ' + (openDatesMenu ? 'block' : 'hidden')}>
        <div className='flex flex-col justify-start'>
          <div style={{ maxHeight: '25vh', overflowY: 'scroll', scrollbarWidth: 'none' }}>
            {selectionInfo?.map((option) => (
              <button
                type='button'
                key={option}
                className={'block p-0 border-0 bg-transparent text-left no-underline text-inherit mb-2 ' + (selected == `${option}` ? 'font-bold' : '')}
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
            className={'p-0 border-0 bg-transparent no-underline text-[color:var(--bs-secondary-color)] text-right'}
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
