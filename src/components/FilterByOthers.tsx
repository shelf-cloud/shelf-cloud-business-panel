/* eslint-disable react-hooks/exhaustive-deps */
import AppContext from '@context/AppContext'
import React, { useContext, useEffect, useRef, useState } from 'react'
import { Input } from 'reactstrap'

type Props = {
  searchType: string
  setSearchType: (searchValue: string) => void
  searchStatus: string
  setSearchStatus: (searchValue: string) => void
  searchMarketplace: string
  setSearchMarketplace: (searchValue: string) => void
}

const FilterByOthers = ({ searchType, setSearchType, searchStatus, setSearchStatus, searchMarketplace, setSearchMarketplace }: Props) => {
  const { state }: any = useContext(AppContext)
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
            <span className='fw-semibold'>Type:</span>
            <div
              className='d-flex flex-row align-items-center justify-content-between gap-2 w-auto px-3 py-0 rounded-3'
              style={{ backgroundColor: 'white', minWidth: '200px', border: '1px solid #E1E3E5' }}>
              {/* <i className='ri-truck-line fs-5' /> */}
              <Input
                type='select'
                className='border-0 fs-6 w-100'
                id='type'
                name='type'
                value={searchType}
                onChange={(e) => {
                  setSearchType(e.target.value)
                  setOpenDatesMenu(false)
                }}>
                <option value=''>All Types</option>
                <option value='Wholesale'>Wholesale</option>
                <option value='Shipment'>Shipment</option>
                <option value='Return'>Return</option>
              </Input>
            </div>
            <span className='fw-semibold'>Status:</span>
            <div
              className='d-flex flex-row align-items-center justify-content-between gap-2 w-auto px-3 py-0 rounded-3'
              style={{ backgroundColor: 'white', minWidth: '200px', border: '1px solid #E1E3E5' }}>
              {/* <i className='ri-truck-line fs-5' /> */}
              <Input
                type='select'
                className='border-0 fs-6 w-100'
                id='type'
                name='type'
                value={searchStatus}
                onChange={(e) => {
                  setSearchStatus(e.target.value)
                  setOpenDatesMenu(false)
                }}>
                <option value=''>All Status</option>
                <option value='on_hold'>On Hold</option>
                <option value='awating'>Awating</option>
                <option value='shipped'>Shipped</option>
                <option value='cancelled'>Cancelled</option>
              </Input>
            </div>
            <span className='fw-semibold'>Marketplace:</span>
            <div
              className='d-flex flex-row align-items-center justify-content-between gap-2 w-auto px-3 py-0 rounded-3'
              style={{ backgroundColor: 'white', minWidth: '200px', border: '1px solid #E1E3E5' }}>
              {/* <i className='ri-truck-line fs-5' /> */}
              <Input
                type='select'
                className='border-0 fs-6 w-100'
                id='type'
                name='type'
                value={searchMarketplace}
                onChange={(e) => {
                  setSearchMarketplace(e.target.value)
                  setOpenDatesMenu(false)
                }}>
                <option value=''>All Marketplaces</option>
                {state?.user?.[`${state.currentRegion}`]?.marketplaces.map((market: string, index: number) => (
                  <option key={`${market}-id${index}`} value={market}>
                    {market}
                  </option>
                ))}
              </Input>
            </div>
            <span
              style={{ width: '100%', cursor: 'pointer', textAlign: 'right' }}
              onClick={() => {
                setSearchType('')
                setSearchStatus('')
                setSearchMarketplace('')
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

export default FilterByOthers
