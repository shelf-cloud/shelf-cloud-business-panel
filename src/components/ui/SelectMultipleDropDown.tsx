import React, { useEffect, useRef, useState } from 'react'

type Props = {
  formValue: string
  selectionInfo: {
    [key: string]: {
      label: string
      icon: string
      color: string
    }
  }
  selected: string
  handleSelection: (field: string, value: any, shouldValidate?: boolean | undefined) => void
}

const SelectMultipleDropDown = ({ formValue, selectionInfo, selected, handleSelection }: Props) => {
  const [openDatesMenu, setOpenDatesMenu] = useState(false)
  const selectMultiple = useRef<HTMLDivElement | null>(null)

  const selectedParsed: number[] = selected !== undefined ? JSON.parse(selected) : []

  useEffect(() => {
    if (document) {
      document.addEventListener('click', (e: any) => {
        if (selectMultiple.current) {
          if (!selectMultiple.current.contains(e.target)) {
            setOpenDatesMenu(false)
          }
        }
      })
    }
  }, [])

  return (
    <div ref={selectMultiple} className='dropdown mb-3'>
      <div className='btn-group w-100 form-control form-control-sm p-0' onClick={() => setOpenDatesMenu(!openDatesMenu)}>
        <button type='button' disabled className='btn btn-light btn-sm py-0 fs-6 w-100 text-start' style={{ backgroundColor: 'white', opacity: '100%' }}>
          {selectedParsed.length === 0 ? <span className='text-muted'>Select</span> : selectedParsed.map((value) => `${selectionInfo[value].label}, `)}
        </button>
        <button
          type='button'
          disabled
          className='btn btn-light btn-sm dropdown-toggle fs-6dropdown-toggle dropdown-toggle-split'
          style={{ backgroundColor: 'white', maxWidth: '35px' }}
          data-bs-toggle='dropdown'
          data-bs-auto-close='outside'
          aria-expanded='false'>
          <span className='visually-hidden'>Toggle Dropdown</span>
        </button>
      </div>
      <div className={'dropdown-menu w-100 py-3 px-4' + (openDatesMenu ? ' show' : '')}>
        <div className='d-flex flex-column justify-content-start'>
          <div style={{ maxHeight: '25vh', overflowY: 'scroll', scrollbarWidth: 'thin' }}>
            {Object.entries(selectionInfo)?.map(([value, option]) => (
              <p
                key={value}
                className={'m-0 mb-2 ' + (selectedParsed.includes(parseInt(value)) ? 'fw-bold' : '')}
                style={{ cursor: 'pointer' }}
                onClick={() => {
                  const newSelected = selectedParsed.includes(parseInt(value)) ? selectedParsed.filter((item) => item !== parseInt(value)) : [...selectedParsed, parseInt(value)]
                  handleSelection(formValue, `[${newSelected.toString()}]`)
                }}>
                {option.icon && <i className={`${option.icon} ${option.color}`} />}
                {`${option.label}`}
              </p>
            ))}
          </div>
          <p
            className={'mt-2 mb-0 text-muted text-end'}
            style={{ cursor: 'pointer' }}
            onClick={() => {
              handleSelection(formValue, '[]')
              setOpenDatesMenu(false)
            }}>
            Clear
          </p>
        </div>
      </div>
    </div>
  )
}

export default SelectMultipleDropDown
