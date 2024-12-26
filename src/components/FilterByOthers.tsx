/* eslint-disable react-hooks/exhaustive-deps */
import AppContext from '@context/AppContext'
import React, { useContext, useEffect, useRef, useState } from 'react'
import { ButtonGroup, Dropdown, DropdownMenu, DropdownToggle } from 'reactstrap'
import SimpleSelect from './Common/SimpleSelect'

type filter = {
  value: string
  label: string
}

type Props = {
  searchType: filter
  setSearchType: (selectedOption: filter) => void
  searchStatus: filter
  setSearchStatus: (selectedOption: filter) => void
  searchMarketplace: filter
  setSearchMarketplace: (selectedOption: filter) => void
}

const TYPE_OPTIONS = [
  { value: '', label: 'All' },
  { value: 'Wholesale', label: 'Wholesale' },
  { value: 'Shipment', label: 'Shipment' },
  { value: 'FBA Shipment', label: 'FBA Shipment' },
]

const STATUS_OPTIONS = [
  { value: '', label: 'All' },
  { value: 'on_hold', label: 'On Hold' },
  { value: 'awaiting', label: 'Awaiting' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'cancelled', label: 'Cancelled' },
]

const FilterByOthers = ({ searchType, setSearchType, searchStatus, setSearchStatus, searchMarketplace, setSearchMarketplace }: Props) => {
  const { state }: any = useContext(AppContext)
  const [isFiltersOpen, setOpenFilters] = useState(false)
  const filterByOthersContainer = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (document) {
      document.addEventListener('click', (e: any) => {
        if (filterByOthersContainer.current) {
          if (!filterByOthersContainer.current.contains(e.target)) {
            setOpenFilters(false)
          }
        }
      })
    }
  }, [])

  return (
    <>
      <ButtonGroup>
        <Dropdown isOpen={isFiltersOpen} toggle={() => setOpenFilters(!isFiltersOpen)}>
          <DropdownToggle caret className='fs-7' style={{ backgroundColor: 'white', border: '1px solid #E1E3E5' }} color='light'>
            Filters
          </DropdownToggle>
          <DropdownMenu style={{ backgroundColor: 'white', minWidth: '250px', border: '1px solid #E1E3E5' }}>
            <div className={'px-4 py-3'}>
              <div className='d-flex flex-column justify-content-start gap-2'>
                <span className='fs-7 fw-normal'>Filter By Type:</span>
                <SimpleSelect
                  selected={searchType}
                  handleSelect={(option) => {
                    setSearchType(option)
                    setOpenFilters(false)
                  }}
                  options={TYPE_OPTIONS}
                />

                <span className='fs-7 fw-normal'>Filter By Status:</span>
                <SimpleSelect
                  selected={searchStatus}
                  handleSelect={(option) => {
                    setSearchStatus(option)
                    setOpenFilters(false)
                  }}
                  options={STATUS_OPTIONS}
                />

                {state?.user?.[`${state.currentRegion}`]?.marketplacesIds && (
                  <>
                    <span className='fs-7 fw-normal'>Filter By Store:</span>
                    <SimpleSelect
                      selected={searchMarketplace}
                      handleSelect={(option) => {
                        setSearchMarketplace(option)
                        setOpenFilters(false)
                      }}
                      options={[
                        { value: '', label: 'All Stores' },
                        ...state?.user?.[`${state.currentRegion}`]?.marketplacesIds?.sort().map((market: any) => ({ value: market.value, label: market.label })),
                      ]}
                    />
                  </>
                )}

                <span
                  style={{ width: '100%', cursor: 'pointer', textAlign: 'right' }}
                  onClick={() => {
                    setSearchType({ value: '', label: 'All' })
                    setSearchStatus({ value: '', label: 'All' })
                    setSearchMarketplace({ value: '', label: 'All Stores' })
                    setOpenFilters(false)
                  }}
                  className='text-muted mt-2 fs-7'>
                  Clear All
                </span>
              </div>
            </div>
          </DropdownMenu>
        </Dropdown>
      </ButtonGroup>
    </>
  )
}

export default FilterByOthers
