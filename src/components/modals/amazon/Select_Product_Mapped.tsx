/* eslint-disable @next/next/no-img-element */
import { useMemo, useRef, useState } from 'react'

import { useClickOutside } from '@hooks/useClickOutside'

import { NoImageAdress } from '@lib/assetsConstants'
import { DebounceInput } from 'react-debounce-input'

type Props = {
  data: {
    inventoryId: string
    businessId: number
    image: string
    title: string
    sku: string
    isKit: boolean
  }[]
  showMappedListingModal: {
    show: boolean
    listingSku: string
    listingId: number
    shelfCloudSku: string
    shelfCloudSkuId: number
    shelfCloudSkuIsKit: boolean
    currentSkuMapped: string
    currentSkuIdMapped: number
    currentSkuIsKitMapped: boolean
  }
  setshowMappedListingModal: (prev: any) => void
}

const Select_Product_Mapped = ({ data, showMappedListingModal, setshowMappedListingModal }: Props) => {
  const [openSelectionList, setOpenSelectionList] = useState(false)
  const [searchValue, setSearchValue] = useState<any>('')
  const selectProductMappedDiv = useRef<HTMLDivElement | null>(null)

  useClickOutside(selectProductMappedDiv, () => setOpenSelectionList(false))

  const filterSelectionList = useMemo(() => {
    if (!data) {
      return []
    }

    if (searchValue === '') {
      return data
    }

    if (searchValue !== '') {
      return data.filter(
        (option) =>
          option.sku.toLowerCase().includes(searchValue.toLowerCase()) ||
          (searchValue.toLowerCase().includes('kit') && option.isKit) ||
          searchValue.split(' ').every((word: string) => option?.title?.toLowerCase().includes(word.toLowerCase())) ||
          option.title.toLowerCase().includes(searchValue.toLowerCase())
      )
    }
  }, [data, searchValue])

  return (
    <div ref={selectProductMappedDiv} className='dropdown mb-4'>
      {showMappedListingModal.currentSkuMapped !== '' ? (
        <div className='w-full'>
          <p className='px-4 m-0 py-0 text-[16.25px] font-semibold'>{showMappedListingModal.currentSkuMapped}</p>
        </div>
      ) : (
        <button type='button' className='btn-group w-full p-0 border-0 bg-transparent' onClick={() => setOpenSelectionList(!openSelectionList)}>
          <span className='btn btn-light btn-sm block w-full text-[13px] text-left' style={{ backgroundColor: 'white', opacity: '100%' }}>
            {showMappedListingModal.shelfCloudSku == '' ? `Select...` : showMappedListingModal.shelfCloudSku}
          </span>
          <span
            className='btn btn-light btn-sm text-[13px]'
            style={{ backgroundColor: 'white', maxWidth: '35px' }}
            aria-expanded='false'>
            <span className='sr-only'>Toggle Dropdown</span>
          </span>
        </button>
      )}
      <div className={'dropdown-menu w-full py-4 px-4' + (openSelectionList ? ' show' : '')}>
        <div className='w-full mb-4'>
          <div className='app-search flex flex-row justify-end items-center p-0'>
            <div className='relative flex rounded-lg w-full overflow-hidden' style={{ border: '1px solid #E1E3E5' }}>
              <DebounceInput
                type='text'
                minLength={3}
                debounceTimeout={300}
                className='h-9 w-full px-3 rounded-md border border-input bg-input shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 input_background_white text-[13px] py-0'
                placeholder='Search...'
                id='search-options-mapped'
                value={searchValue}
                onKeyDown={(e) => (e.key == 'Enter' ? e.preventDefault() : null)}
                onChange={(e) => setSearchValue(e.target.value)}
              />
              <span className='mdi mdi-magnify search-widget-icon text-[16.25px]'></span>
              <button
                type='button'
                aria-label='Clear search'
                className='flex items-center justify-center input_background_white'
                style={{ border: 0 }}
                onClick={() => setSearchValue('')}>
                <i className='mdi mdi-window-close text-[16.25px] m-0 px-2 py-0 text-[color:var(--bs-secondary-color)]' />
              </button>
            </div>
          </div>
        </div>

        <div className='flex flex-col justify-start'>
          <div style={{ maxHeight: '30vh', overflowY: 'scroll' }}>
            {filterSelectionList?.map((option) => (
              <button
                type='button'
                key={`${option.sku}-${option.inventoryId}`}
                className={'btn btn-link w-full border-0 text-left no-underline text-inherit m-0 py-2 px-1 flex flex-row gap-2 ' + (showMappedListingModal.shelfCloudSku == `${option.sku}` ? 'bg-light' : '')}
                onClick={() => {
                  setshowMappedListingModal((prev: any) => {
                    return {
                      ...prev,
                      shelfCloudSku: option.sku,
                      shelfCloudSkuId: option.inventoryId,
                      shelfCloudSkuIsKit: option.isKit,
                    }
                  })
                  setOpenSelectionList(false)
                }}>
                <span
                  className='inline-block shrink-0'
                  style={{
                    width: '50px',
                    height: '40px',
                    margin: '2px 0px',
                    position: 'relative',
                  }}>
                  <img
                    loading='lazy'
                    src={option.image ? option.image : NoImageAdress}
                    onError={(e) => (e.currentTarget.src = NoImageAdress)}
                    alt={option.title || option.sku || 'Catalog item'}
                    style={{ objectFit: 'contain', objectPosition: 'center', width: '100%', height: '100%' }}
                  />
                </span>
                <span className='inline-flex flex-col'>
                  <span className='text-[11.2px] m-0 p-0 font-bold'>{option.sku}</span>
                  <span className='text-[11.2px] font-semibold text-primary m-0 p-0'>{option.isKit ? 'Kit' : 'Product'}</span>
                  <span className='text-[11.2px] text-[var(--bs-secondary-color)] m-0 p-0'>{option.title}</span>
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Select_Product_Mapped
