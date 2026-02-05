 
import { useEffect, useRef, useState } from 'react'

import { Input } from 'reactstrap'

type Props = {
  type: string
  setInvoiceType: (type: string) => void
}

const FilterCheckNumber = ({ type, setInvoiceType }: Props) => {
  const [openDatesMenu, setOpenDatesMenu] = useState(false)
  const FilterCheckNumberContainer = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (document) {
      document.addEventListener('click', (e: any) => {
        if (FilterCheckNumberContainer.current) {
          if (!FilterCheckNumberContainer.current.contains(e.target)) {
            setOpenDatesMenu(false)
          }
        }
      })
    }
  }, [])

  return (
    <div
      ref={FilterCheckNumberContainer}
      className='d-flex flex-column justify-content-center align-items-end gap-2 flex-md-row justify-content-md-between align-items-md-center w-auto'>
      <div className='dropdown'>
        <button
          className='btn btn-light dropdown-toggle'
          style={{ backgroundColor: 'white', border: '1px solid #E1E3E5' }}
          type='button'
          data-bs-toggle='dropdown'
          data-bs-auto-close='outside'
          aria-expanded='false'
          onClick={() => setOpenDatesMenu(!openDatesMenu)}>
          Filters
        </button>
        <div className={'dropdown-menu dropdown-menu-md px-4 py-3' + (openDatesMenu ? ' show' : '')}>
          <div className='d-flex flex-column justify-content-start gap-2'>
            <span className='fw-semibold'>Type:</span>
            <div
              className='d-flex flex-row align-items-center justify-content-between gap-2 w-auto px-3 py-0 rounded-3'
              style={{ backgroundColor: 'white', minWidth: '200px', border: '1px solid #E1E3E5' }}>
              <Input
                type='select'
                className='border-0 fs-6 w-100'
                id='type'
                name='type'
                value={type}
                onChange={(e) => {
                  setOpenDatesMenu(false)
                  setInvoiceType(e.target.value)
                }}>
                <option value='all'>All</option>
                <option value='invoices'>Invoice</option>
                <option value='deductions'>Deductions</option>
              </Input>
            </div>
            <span
              style={{ width: '100%', cursor: 'pointer', textAlign: 'right' }}
              onClick={() => {
                setInvoiceType('all')
                setOpenDatesMenu(false)
              }}
              className='text-muted mt-2 fs-7'>
              Clear All
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FilterCheckNumber
