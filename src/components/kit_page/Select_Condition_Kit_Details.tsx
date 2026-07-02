import { useRef, useState } from 'react'

import { useClickOutside } from '@hooks/useClickOutside'

type Props = {
  selected: string
  handleSelection: (value: string) => void
  errorMessage?: string
}

const styles = {
  noError: { backgroundColor: 'white', border: '1px solid #E1E3E5', cursor: 'pointer' },
  error: { backgroundColor: 'white', border: '1px solid #f06548', cursor: 'pointer' },
}

const Select_Condition_Kit_Details = ({ selected, handleSelection, errorMessage }: Props) => {
  const [openDatesMenu, setOpenDatesMenu] = useState(false)
  const [selectedOption, setSelectedOption] = useState(selected)
  const selectCondition = useRef<HTMLDivElement | null>(null)

  useClickOutside(selectCondition, () => setOpenDatesMenu(false))

  return (
    <div ref={selectCondition} className='relative mb-3'>
      <button type='button' className='flex w-full items-center p-0 bg-transparent rounded-md' style={errorMessage ? styles.error : styles.noError} onClick={() => setOpenDatesMenu(!openDatesMenu)}>
        <span className='flex-1 px-3 py-[0.3rem] text-[13px] text-left' style={{ backgroundColor: 'white', opacity: '100%' }}>
          {selected == '' ? `Select...` : selected}
        </span>
        <span className='flex items-center justify-center px-2' style={{ backgroundColor: 'white', maxWidth: '35px' }} aria-expanded='false'>
          <i className='mdi mdi-chevron-down text-[16.25px]' />
          <span className='sr-only'>Toggle Dropdown</span>
        </span>
      </button>
      <div className={'absolute z-10 mt-1 w-full pt-3 px-4 bg-white border border-[#E1E3E5] rounded-md shadow ' + (openDatesMenu ? 'block' : 'hidden')}>
        <div className='flex flex-col justify-start'>
          <button
            type='button'
            key={'New'}
            className={'block p-0 border-0 bg-transparent text-left no-underline text-inherit mb-3 ' + (selectedOption == 'New' ? 'font-bold' : '')}
            onClick={() => {
              setSelectedOption('New')
              handleSelection('New')
            }}>
            New
          </button>
          <button
            type='button'
            key={'Like New'}
            className={'block p-0 border-0 bg-transparent text-left no-underline text-inherit mb-3 ' + (selectedOption == 'Like New' ? 'font-bold' : '')}
            onClick={() => {
              setSelectedOption('Like New')
              handleSelection('Like New')
            }}>
            Like New
          </button>
          <button
            type='button'
            key={'Used'}
            className={'block p-0 border-0 bg-transparent text-left no-underline text-inherit mb-3 ' + (selectedOption == 'Used' ? 'font-bold' : '')}
            onClick={() => {
              setSelectedOption('Used')
              handleSelection('Used')
            }}>
            Used
          </button>
        </div>
      </div>
    </div>
  )
}

export default Select_Condition_Kit_Details
