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
    <div ref={selectCondition} className='dropdown mb-3'>
      <button type='button' className='btn-group w-100 p-0 bg-transparent' style={errorMessage ? styles.error : styles.noError} onClick={() => setOpenDatesMenu(!openDatesMenu)}>
        <span className='btn btn-light btn-sm form-control fs-6 w-100 text-start' style={{ backgroundColor: 'white', opacity: '100%' }}>
          {selected == '' ? `Select...` : selected}
        </span>
        <span
          className='btn btn-light btn-sm dropdown-toggle form-control fs-6dropdown-toggle dropdown-toggle-split'
          style={{ backgroundColor: 'white', maxWidth: '35px' }}
          aria-expanded='false'>
          <span className='visually-hidden'>Toggle Dropdown</span>
        </span>
      </button>
      <div className={'dropdown-menu w-100 pt-3 px-4' + (openDatesMenu ? ' show' : '')}>
        <div className='d-flex flex-column justify-content-start'>
          <button
            type='button'
            key={'New'}
            className={'btn btn-link p-0 border-0 text-start text-decoration-none text-reset mb-3 ' + (selectedOption == 'New' ? 'fw-bold' : '')}
            onClick={() => {
              setSelectedOption('New')
              handleSelection('New')
            }}>
            New
          </button>
          <button
            type='button'
            key={'Like New'}
            className={'btn btn-link p-0 border-0 text-start text-decoration-none text-reset mb-3 ' + (selectedOption == 'Like New' ? 'fw-bold' : '')}
            onClick={() => {
              setSelectedOption('Like New')
              handleSelection('Like New')
            }}>
            Like New
          </button>
          <button
            type='button'
            key={'Used'}
            className={'btn btn-link p-0 border-0 text-start text-decoration-none text-reset mb-3 ' + (selectedOption == 'Used' ? 'fw-bold' : '')}
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
