 
import { memo, useContext, useRef, useState } from 'react'

import { useClickOutside } from '@hooks/useClickOutside'

import AppContext from '@context/AppContext'
import { Input } from '@/components/migration-ui'

type Props = {
  searchStatus: string
  setSearchStatus: (searchValue: string) => void
  searchReason: string
  setSearchReason: (searchValue: string) => void
  searchMarketplace: string
  setSearchMarketplace: (searchValue: string) => void
}

const FilterReturns = ({ searchStatus, setSearchStatus, searchReason, setSearchReason, searchMarketplace, setSearchMarketplace }: Props) => {
  const { state }: any = useContext(AppContext)
  const [openDatesMenu, setOpenDatesMenu] = useState(false)
  const filterByOthersContainer = useRef<HTMLDivElement | null>(null)

  useClickOutside(filterByOthersContainer, () => setOpenDatesMenu(false))

  return (
    <div
      ref={filterByOthersContainer}
      className='flex flex-col justify-center items-end gap-2 md:flex-row md:justify-between md:items-center w-auto'>
      <div className='relative'>
        <button
          className='inline-flex h-9 items-center gap-2 rounded-md border border-[#E1E3E5] bg-white px-3 text-sm font-semibold text-foreground whitespace-nowrap'
          type='button'
          aria-expanded='false'
          onClick={() => setOpenDatesMenu(!openDatesMenu)}>
          Filters
        </button>
        <div className={'absolute z-10 mt-1 min-w-[16rem] end-0 bg-white border border-[#E1E3E5] rounded-md shadow px-6 py-4 ' + (openDatesMenu ? 'block' : 'hidden')}>
          <div className='flex flex-col justify-start gap-2'>
            {/* <span className='fw-semibold'>Type:</span>
            <div
              className='d-flex flex-row align-items-center justify-content-between gap-2 w-auto px-3 py-0 rounded-3'
              style={{ backgroundColor: 'white', minWidth: '200px', border: '1px solid #E1E3E5' }}>
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
            </div> */}
            <span className='font-semibold text-[11.2px]'>Status:</span>
            <div
              className='flex flex-row items-center justify-between gap-2 w-auto ps-1 pe-0 py-0 rounded'
              style={{ backgroundColor: 'white', minWidth: '200px', border: '1px solid #E1E3E5' }}>
              <Input
                type='select'
                className='border-0 text-[11.2px] w-full'
                id='type'
                name='type'
                value={searchStatus}
                onChange={(e) => {
                  setSearchStatus(e.target.value)
                  setOpenDatesMenu(false)
                }}>
                <option value=''>All Status</option>
                <option value='Processed'>Processed</option>
                <option value='received'>Received</option>
              </Input>
            </div>
            <span className='font-semibold text-[11.2px]'>Reason:</span>
            <div
              className='flex flex-row items-center justify-between gap-2 w-auto ps-1 pe-0 py-0 rounded'
              style={{ backgroundColor: 'white', minWidth: '200px', border: '1px solid #E1E3E5' }}>
              <Input
                type='select'
                className='border-0 text-[11.2px] w-full'
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
            <span className='font-semibold text-[11.2px]'>Marketplace:</span>
            <div
              className='flex flex-row items-center justify-between gap-2 w-auto ps-1 pe-0 py-0 rounded'
              style={{ backgroundColor: 'white', minWidth: '200px', border: '1px solid #E1E3E5' }}>
              <Input
                type='select'
                className='border-0 text-[11.2px] w-full'
                id='type'
                name='type'
                value={searchMarketplace}
                onChange={(e) => {
                  setSearchMarketplace(e.target.value)
                  setOpenDatesMenu(false)
                }}>
                <option value=''>All Marketplaces</option>
                {state?.user?.[`${state.currentRegion}`]?.marketplaces?.sort().map((market: string, index: number) => (
                  <option key={`${market}-id${index}`} value={market}>
                    {market}
                  </option>
                ))}
              </Input>
            </div>
            <button
              type='button'
              style={{ width: '100%', textAlign: 'right' }}
              onClick={() => {
                // setSearchType('')
                setSearchStatus('')
                setSearchMarketplace('')
                setSearchReason('')
                setOpenDatesMenu(false)
              }}
              className='p-0 border-0 no-underline text-inherit font-normal text-[11.2px] mt-2 bg-transparent'>
              Clear All
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default memo(FilterReturns)
