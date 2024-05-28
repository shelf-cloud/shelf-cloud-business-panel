/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useRef, useState } from 'react'
import { Input } from 'reactstrap'

type Props = {
  searchStatus: string
  setSearchStatus: (searchValue: string) => void
  searchReason: string
  setSearchReason: (searchValue: string) => void
}

const FilterUnsellables = ({ searchStatus, setSearchStatus, searchReason, setSearchReason }: Props) => {
  const [openDatesMenu, setOpenDatesMenu] = useState(false)
  const filterByOthersContainer = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (document) {
      document.addEventListener('click', (e: any) => {
        if (filterByOthersContainer.current) {
          if (!filterByOthersContainer.current.contains(e.target)) {
            setOpenDatesMenu(false)
          }
        }
      })
    }
  }, [])

  return (
    <div
      ref={filterByOthersContainer}
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
            <span className='fw-semibold fs-7'>Status:</span>
            <div
              className='d-flex flex-row align-items-center justify-content-between gap-2 w-auto ps-1 pe-0 py-0 rounded-3'
              style={{ backgroundColor: 'white', minWidth: '200px', border: '1px solid #E1E3E5' }}>
              <Input
                type='select'
                className='border-0 fs-7 w-100'
                id='type'
                name='type'
                value={searchStatus}
                onChange={(e) => {
                  setSearchStatus(e.target.value)
                  setOpenDatesMenu(false)
                }}>
                <option value=''>All Status</option>
                <option value='unsellable'>Unsellable</option>
                <option value='converted'>Converted Sellable</option>
                <option value='dispose'>Dispose</option>
              </Input>
            </div>
            <span className='fw-semibold fs-7'>Reason:</span>
            <div
              className='d-flex flex-row align-items-center justify-content-between gap-2 w-auto ps-1 pe-0 py-0 rounded-3'
              style={{ backgroundColor: 'white', minWidth: '200px', border: '1px solid #E1E3E5' }}>
              <Input
                type='select'
                className='border-0 fs-7 w-100'
                id='type'
                name='type'
                value={searchReason}
                onChange={(e) => {
                  setSearchReason(e.target.value)
                  setOpenDatesMenu(false)
                }}>
                <option value=''>All Reasons</option>
                <option value='Damaged'>Damaged</option>
                <option value='Wrong Address'>Wrong Address</option>
                <option value='Missing Information'>Missing Information</option>
                <option value='Return'>Return</option>
                <option value='Undeliverable'>Undeliverable</option>
                <option value='Other'>Other</option>
              </Input>
            </div>
            <span
              style={{ width: '100%', cursor: 'pointer', textAlign: 'right' }}
              onClick={() => {
                // setSearchType('')
                setSearchStatus('')
                setSearchReason('')
                setOpenDatesMenu(false)
              }}
              className='fw-normal fs-7 mt-2'>
              Clear All
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FilterUnsellables
