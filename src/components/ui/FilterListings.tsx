/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useRef, useState } from 'react'
import { Input } from 'reactstrap'

type Props = {
  filters: {
    showHidden: number
    condition: string
    mapped: string
  }
  setFilters: (prev: any) => void
}

const FilterListings = ({ filters, setFilters }: Props) => {
  const [openDatesMenu, setOpenDatesMenu] = useState(false)
  const FilterListingsContainer = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (document) {
      document.addEventListener('click', (e: any) => {
        if (FilterListingsContainer.current) {
          if (!FilterListingsContainer.current.contains(e.target)) {
            setOpenDatesMenu(false)
          }
        }
      })
    }
  }, [])

  return (
    <div
      ref={FilterListingsContainer}
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
            <span className='fw-semibold'>Condition:</span>
            <div
              className='d-flex flex-row align-items-center justify-content-between gap-2 w-auto px-3 py-0 rounded-3'
              style={{ backgroundColor: 'white', minWidth: '200px', border: '1px solid #E1E3E5' }}>
              <Input
                type='select'
                className='border-0 fs-6 w-100'
                id='type'
                name='type'
                value={filters.condition}
                onChange={(e) => {
                  setFilters((prev: any) => {
                    return { ...prev, condition: e.target.value }
                  })
                  setOpenDatesMenu(false)
                }}>
                <option value='All'>All</option>
                <option value='New'>New</option>
                <option value='Used'>Used</option>
              </Input>
            </div>
            <span className='fw-semibold'>Mapped:</span>
            <div
              className='d-flex flex-row align-items-center justify-content-between gap-2 w-auto px-3 py-0 rounded-3'
              style={{ backgroundColor: 'white', minWidth: '200px', border: '1px solid #E1E3E5' }}>
              <Input
                type='select'
                className='border-0 fs-6 w-100'
                id='type'
                name='type'
                value={filters.mapped}
                onChange={(e) => {
                  setFilters((prev: any) => {
                    return { ...prev, mapped: e.target.value }
                  })
                  setOpenDatesMenu(false)
                }}>
                <option value='All'>All</option>
                <option value='Mapped'>Mapped</option>
                <option value='Not Mapped'>Not Mapped</option>
              </Input>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FilterListings
