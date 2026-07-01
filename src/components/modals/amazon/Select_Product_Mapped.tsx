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
    <div ref={selectProductMappedDiv} className='dropdown mb-3'>
      {showMappedListingModal.currentSkuMapped !== '' ? (
        <div className='w-100'>
          <p className='px-3 m-0 py-0 fs-5 fw-semibold'>{showMappedListingModal.currentSkuMapped}</p>
        </div>
      ) : (
        <button type='button' className='btn-group w-100 p-0 border-0 bg-transparent' onClick={() => setOpenSelectionList(!openSelectionList)}>
          <span className='btn btn-light btn-sm form-control fs-6 w-100 text-start' style={{ backgroundColor: 'white', opacity: '100%' }}>
            {showMappedListingModal.shelfCloudSku == '' ? `Select...` : showMappedListingModal.shelfCloudSku}
          </span>
          <span
            className='btn btn-light btn-sm dropdown-toggle form-control fs-6dropdown-toggle dropdown-toggle-split'
            style={{ backgroundColor: 'white', maxWidth: '35px' }}
            aria-expanded='false'>
            <span className='visually-hidden'>Toggle Dropdown</span>
          </span>
        </button>
      )}
      <div className={'dropdown-menu w-100 py-3 px-3' + (openSelectionList ? ' show' : '')}>
        <div className='w-100 mb-3'>
          <div className='app-search d-flex flex-row justify-content-end align-items-center p-0'>
            <div className='position-relative d-flex rounded-3 w-100 overflow-hidden' style={{ border: '1px solid #E1E3E5' }}>
              <DebounceInput
                type='text'
                minLength={3}
                debounceTimeout={300}
                className='form-control input_background_white fs-6 py-0'
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
                className='d-flex align-items-center justify-content-center input_background_white'
                style={{ border: 0 }}
                onClick={() => setSearchValue('')}>
                <i className='mdi mdi-window-close fs-5 m-0 px-2 py-0 text-muted' />
              </button>
            </div>
          </div>
        </div>

        <div className='d-flex flex-column justify-content-start'>
          <div style={{ maxHeight: '30vh', overflowY: 'scroll' }}>
            {filterSelectionList?.map((option) => (
              <button
                type='button'
                key={`${option.sku}-${option.inventoryId}`}
                className={'btn btn-link w-100 border-0 text-start text-decoration-none text-reset m-0 py-2 px-1 d-flex flex-row gap-2 ' + (showMappedListingModal.shelfCloudSku == `${option.sku}` ? 'bg-light' : '')}
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
                  className='d-inline-block flex-shrink-0'
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
                <span className='d-inline-flex flex-column'>
                  <span className='fs-7 m-0 p-0 fw-bold'>{option.sku}</span>
                  <span className='fs-7 fw-semibold text-primary m-0 p-0'>{option.isKit ? 'Kit' : 'Product'}</span>
                  <span className='fs-7 text-muted m-0 p-0'>{option.title}</span>
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
