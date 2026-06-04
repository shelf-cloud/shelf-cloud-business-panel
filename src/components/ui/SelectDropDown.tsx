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
    <div ref={selectDropDownElement} className='dropdown mb-0'>
      <button
        type='button'
        className={'btn-group w-100 form-control form-control-sm p-0 bg-transparent' + (error ? ' border border-danger' : '')}
        style={{ cursor: 'pointer' }}
        onClick={() => setOpenDatesMenu(!openDatesMenu)}>
        <span className='btn btn-light btn-sm py-0 fs-6 w-100 text-start' style={{ backgroundColor: 'white', opacity: '100%' }}>
          {selected == '' ? <span className='text-muted'>Select</span> : selected}
        </span>
        <span
          className='btn btn-light btn-sm dropdown-toggle fs-6 dropdown-toggle dropdown-toggle-split'
          style={{ backgroundColor: 'white', maxWidth: '35px' }}
          data-bs-toggle='dropdown'
          data-bs-auto-close='outside'
          aria-expanded='false'>
          <span className='visually-hidden'>Toggle Dropdown</span>
        </span>
      </button>
      <div className={'dropdown-menu w-100 py-3 px-4' + (openDatesMenu ? ' show' : '')}>
        <div className='d-flex flex-column justify-content-start'>
          <div style={{ maxHeight: '25vh', overflowY: 'scroll', scrollbarWidth: 'none' }}>
            {selectionInfo?.map((option) => (
              <button
                type='button'
                key={option}
                className={'btn btn-link d-block p-0 border-0 text-start text-decoration-none text-reset mb-2 ' + (selected == `${option}` ? 'fw-bold' : '')}
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
            className={'btn btn-link p-0 border-0 text-decoration-none text-muted text-end'}
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
