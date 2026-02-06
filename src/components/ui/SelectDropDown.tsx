import { useEffect, useRef, useState } from 'react'

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

  useEffect(() => {
    if (document) {
      document.addEventListener('click', (e: any) => {
        if (selectDropDownElement.current) {
          if (!selectDropDownElement.current.contains(e.target)) {
            setOpenDatesMenu(false)
          }
        }
      })
    }
  }, [])

  return (
    <div ref={selectDropDownElement} className='dropdown mb-0'>
      <div
        className={'btn-group w-100 form-control form-control-sm p-0' + (error ? ' border border-danger' : '')}
        style={{ cursor: 'pointer' }}
        onClick={() => setOpenDatesMenu(!openDatesMenu)}>
        <button type='button' disabled className='btn btn-light btn-sm py-0 fs-6 w-100 text-start' style={{ backgroundColor: 'white', opacity: '100%' }}>
          {selected == '' ? <span className='text-muted'>Select</span> : selected}
        </button>
        <button
          type='button'
          disabled
          className='btn btn-light btn-sm dropdown-toggle fs-6 dropdown-toggle dropdown-toggle-split'
          style={{ backgroundColor: 'white', maxWidth: '35px' }}
          data-bs-toggle='dropdown'
          data-bs-auto-close='outside'
          aria-expanded='false'>
          <span className='visually-hidden'>Toggle Dropdown</span>
        </button>
      </div>
      <div className={'dropdown-menu w-100 py-3 px-4' + (openDatesMenu ? ' show' : '')}>
        <div className='d-flex flex-column justify-content-start'>
          <div style={{ maxHeight: '25vh', overflowY: 'scroll', scrollbarWidth: 'none' }}>
            {selectionInfo?.map((option) => (
              <p
                key={option}
                className={'m-0 mb-2 ' + (selected == `${option}` ? 'fw-bold' : '')}
                style={{ cursor: 'pointer' }}
                onClick={() => {
                  handleSelection(formValue, `${option}`)
                  setOpenDatesMenu(false)
                }}>
                {`${option}`}
              </p>
            ))}
          </div>
          <p
            className={'mt-2 mb-0 text-muted text-end'}
            style={{ cursor: 'pointer' }}
            onClick={() => {
              handleSelection(formValue, '')
              setOpenDatesMenu(false)
            }}>
            Clear
          </p>
        </div>
      </div>
    </div>
  )
}

export default SelectDropDown
