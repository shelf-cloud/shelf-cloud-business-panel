import React, { useEffect, useRef, useState } from 'react'

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
    <div ref={filterByDates} className='dropdown mb-3'>
      <div className='btn-group w-100' style={errorMessage ? styles.error : styles.noError} onClick={() => setOpenDatesMenu(!openDatesMenu)}>
        <button type='button' disabled className='btn btn-light btn-sm form-control fs-6 w-100 text-start' style={{ backgroundColor: 'white', opacity: '100%' }}>
          {selected == '' ? `Select...` : selected}
        </button>
        <button
          type='button'
          disabled
          className='btn btn-light btn-sm dropdown-toggle form-control fs-6dropdown-toggle dropdown-toggle-split'
          style={{ backgroundColor: 'white', maxWidth: '35px' }}
          data-bs-toggle='dropdown'
          data-bs-auto-close='outside'
          aria-expanded='false'>
          <span className='visually-hidden'>Toggle Dropdown</span>
        </button>
      </div>
      <div className={'dropdown-menu w-100 pt-3 px-4' + (openDatesMenu ? ' show' : '')}>
        <div className='d-flex flex-column justify-content-start'>
          <p
            key={'New'}
            className={'m-0 mb-3 ' + (selectedOption == 'New' ? 'fw-bold' : '')}
            style={{ cursor: 'pointer' }}
            onClick={() => {
              setSelectedOption('New')
              handleSelection('New')
            }}>
            New
          </p>
          <p
            key={'Like New'}
            className={'m-0 mb-3 ' + (selectedOption == 'Like New' ? 'fw-bold' : '')}
            style={{ cursor: 'pointer' }}
            onClick={() => {
              setSelectedOption('Like New')
              handleSelection('Like New')
            }}>
            Like New
          </p>
          <p
            key={'Used'}
            className={'m-0 mb-3 ' + (selectedOption == 'Used' ? 'fw-bold' : '')}
            style={{ cursor: 'pointer' }}
            onClick={() => {
              setSelectedOption('Used')
              handleSelection('Used')
            }}>
            Used
          </p>
        </div>
      </div>
    </div>
  )
}

export default Select_Condition_Product_Details
