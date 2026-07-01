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

const Select_Condition_Product_Details = ({ selected, handleSelection, errorMessage }: Props) => {
  const [openDatesMenu, setOpenDatesMenu] = useState(false)
  const [selectedOption, setSelectedOption] = useState(selected)
  const selectCondition = useRef<HTMLDivElement | null>(null)

  useClickOutside(selectCondition, () => setOpenDatesMenu(false))

  return (
    <div ref={selectCondition} className='tw:relative tw:mb-3'>
      <button type='button' className='tw:flex tw:w-full tw:items-center tw:p-0 tw:bg-transparent tw:rounded-md' style={errorMessage ? styles.error : styles.noError} onClick={() => setOpenDatesMenu(!openDatesMenu)}>
        <span className='tw:flex-1 tw:px-3 tw:py-[0.3rem] tw:text-[13px] tw:text-left' style={{ backgroundColor: 'white', opacity: '100%' }}>
          {selected == '' ? `Select...` : selected}
        </span>
        <span className='tw:flex tw:items-center tw:justify-center tw:px-2' style={{ backgroundColor: 'white', maxWidth: '35px' }} aria-expanded='false'>
          <i className='mdi mdi-chevron-down tw:text-[16.25px]' />
          <span className='tw:sr-only'>Toggle Dropdown</span>
        </span>
      </button>
      <div className={'tw:absolute tw:z-10 tw:mt-1 tw:w-full tw:pt-3 tw:px-4 tw:bg-white tw:border tw:border-[#E1E3E5] tw:rounded-md tw:shadow ' + (openDatesMenu ? 'tw:block' : 'tw:hidden')}>
        <div className='tw:flex tw:flex-col tw:justify-start'>
          <button
            type='button'
            key={'New'}
            className={'tw:block tw:p-0 tw:border-0 tw:bg-transparent tw:text-left tw:no-underline tw:text-inherit tw:mb-3 ' + (selectedOption == 'New' ? 'tw:font-bold' : '')}
            onClick={() => {
              setSelectedOption('New')
              handleSelection('New')
            }}>
            New
          </button>
          <button
            type='button'
            key={'Like New'}
            className={'tw:block tw:p-0 tw:border-0 tw:bg-transparent tw:text-left tw:no-underline tw:text-inherit tw:mb-3 ' + (selectedOption == 'Like New' ? 'tw:font-bold' : '')}
            onClick={() => {
              setSelectedOption('Like New')
              handleSelection('Like New')
            }}>
            Like New
          </button>
          <button
            type='button'
            key={'Used'}
            className={'tw:block tw:p-0 tw:border-0 tw:bg-transparent tw:text-left tw:no-underline tw:text-inherit tw:mb-3 ' + (selectedOption == 'Used' ? 'tw:font-bold' : '')}
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

export default Select_Condition_Product_Details
