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
    <div ref={selectProductMappedDiv} className='dropdown tw:mb-4'>
      {showMappedListingModal.currentSkuMapped !== '' ? (
        <div className='tw:w-full'>
          <p className='tw:px-4 tw:m-0 tw:py-0 tw:text-[16.25px] tw:font-semibold'>{showMappedListingModal.currentSkuMapped}</p>
        </div>
      ) : (
        <button type='button' className='btn-group tw:w-full tw:p-0 tw:border-0 tw:bg-transparent' onClick={() => setOpenSelectionList(!openSelectionList)}>
          <span className='btn btn-light btn-sm form-control tw:text-[13px] tw:w-full tw:text-left' style={{ backgroundColor: 'white', opacity: '100%' }}>
            {showMappedListingModal.shelfCloudSku == '' ? `Select...` : showMappedListingModal.shelfCloudSku}
          </span>
          <span
            className='btn btn-light btn-sm dropdown-toggle form-control tw:text-[13px] dropdown-toggle dropdown-toggle-split'
            style={{ backgroundColor: 'white', maxWidth: '35px' }}
            aria-expanded='false'>
            <span className='visually-hidden'>Toggle Dropdown</span>
          </span>
        </button>
      )}
      <div className={'dropdown-menu tw:w-full tw:py-4 tw:px-4' + (openSelectionList ? ' show' : '')}>
        <div className='tw:w-full tw:mb-4'>
          <div className='app-search tw:flex tw:flex-row tw:justify-end tw:items-center tw:p-0'>
            <div className='tw:relative tw:flex tw:rounded-lg tw:w-full tw:overflow-hidden' style={{ border: '1px solid #E1E3E5' }}>
              <DebounceInput
                type='text'
                minLength={3}
                debounceTimeout={300}
                className='form-control input_background_white tw:text-[13px] tw:py-0'
                placeholder='Search...'
                id='search-options-mapped'
                value={searchValue}
                onKeyDown={(e) => (e.key == 'Enter' ? e.preventDefault() : null)}
                onChange={(e) => setSearchValue(e.target.value)}
              />
              <span className='mdi mdi-magnify search-widget-icon fs-5'></span>
              <button
                type='button'
                aria-label='Clear search'
                className='tw:flex tw:items-center tw:justify-center input_background_white'
                style={{ border: 0 }}
                onClick={() => setSearchValue('')}>
                <i className='mdi mdi-window-close fs-5 m-0 px-2 py-0 text-muted' />
              </button>
            </div>
          </div>
        </div>

        <div className='tw:flex tw:flex-col tw:justify-start'>
          <div style={{ maxHeight: '30vh', overflowY: 'scroll' }}>
            {filterSelectionList?.map((option) => (
              <button
                type='button'
                key={`${option.sku}-${option.inventoryId}`}
                className={'btn btn-link tw:w-full tw:border-0 tw:text-left tw:no-underline text-reset tw:m-0 tw:py-2 tw:px-1 tw:flex tw:flex-row tw:gap-2 ' + (showMappedListingModal.shelfCloudSku == `${option.sku}` ? 'tw:bg-light' : '')}
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
                  className='tw:inline-block tw:shrink-0'
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
                <span className='tw:inline-flex tw:flex-col'>
                  <span className='tw:text-[11.2px] tw:m-0 tw:p-0 tw:font-bold'>{option.sku}</span>
                  <span className='tw:text-[11.2px] tw:font-semibold tw:text-primary tw:m-0 tw:p-0'>{option.isKit ? 'Kit' : 'Product'}</span>
                  <span className='tw:text-[11.2px] tw:text-[var(--bs-secondary-color)] tw:m-0 tw:p-0'>{option.title}</span>
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
