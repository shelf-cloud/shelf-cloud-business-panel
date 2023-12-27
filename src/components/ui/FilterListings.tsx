/* eslint-disable react-hooks/exhaustive-deps */
import { useRouter } from 'next/router'
import React, { useEffect, useRef, useState } from 'react'
import { Input } from 'reactstrap'

type Props = {
  showHidden: string
  condition: string
  mapped: string
}

const FilterListings = ({ showHidden, condition, mapped }: Props) => {
  const router = useRouter()
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
                value={condition}
                onChange={(e) => {
                  setOpenDatesMenu(false)
                  router.replace(`/amazon-sellers/listings?showHidden=${parseInt(showHidden)}&condition=${e.target.value}&mapped=${mapped}`)
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
                value={mapped}
                onChange={(e) => {
                  setOpenDatesMenu(false)
                  router.replace(`/amazon-sellers/listings?showHidden=${parseInt(showHidden)}&condition=${condition}&mapped=${e.target.value}`)
                }}>
                <option value='All'>All</option>
                <option value='Mapped'>Mapped</option>
                <option value='Not Mapped'>Not Mapped</option>
              </Input>
            </div>
            <span
              style={{ width: '100%', cursor: 'pointer', textAlign: 'right' }}
              onClick={() => {
                router.replace(`/amazon-sellers/listings?showHidden=${parseInt(showHidden)}&condition=All&mapped=All`)
                setOpenDatesMenu(false)
              }}
              className='fw-normal mt-2'>
              Clear All
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FilterListings
