/* eslint-disable @next/next/no-img-element */
import { useEffect, useMemo, useRef, useState } from 'react'

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

  useEffect(() => {
    if (document) {
      document.addEventListener('click', (e: any) => {
        if (selectProductMappedDiv.current) {
          if (!selectProductMappedDiv.current.contains(e.target)) {
            setOpenSelectionList(false)
          }
        }
      })
    }
  }, [])

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
        <div className='btn-group w-100' onClick={() => setOpenSelectionList(!openSelectionList)}>
          <button type='button' disabled className='btn btn-light btn-sm form-control fs-6 w-100 text-start' style={{ backgroundColor: 'white', opacity: '100%' }}>
            {showMappedListingModal.shelfCloudSku == '' ? `Select...` : showMappedListingModal.shelfCloudSku}
          </button>
          <button
            type='button'
            disabled
            className='btn btn-light btn-sm dropdown-toggle form-control fs-6dropdown-toggle dropdown-toggle-split'
            style={{ backgroundColor: 'white', maxWidth: '35px' }}
            data-bs-toggle='dropdown'
            data-bs-auto-close='outside'
            aria-expanded='false'>
            <span className='visually-hidden'>Toggle Dropdown</span>
          </button>
        </div>
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
              <span
                className='d-flex align-items-center justify-content-center input_background_white'
                style={{
                  cursor: 'pointer',
                }}
                onClick={() => setSearchValue('')}>
                <i className='mdi mdi-window-close fs-5 m-0 px-2 py-0 text-muted' />
              </span>
            </div>
          </div>
        </div>

        <div className='d-flex flex-column justify-content-start'>
          <div style={{ maxHeight: '30vh', overflowY: 'scroll' }}>
            {filterSelectionList?.map((option) => (
              <div
                key={`${option.sku}-${option.inventoryId}`}
                className={'m-0 py-2 px-1 d-flex flex-row gap-2 ' + (showMappedListingModal.shelfCloudSku == `${option.sku}` ? 'bg-light' : '')}
                style={{ cursor: 'pointer' }}
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
                <div
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
                    alt='product Image'
                    style={{ objectFit: 'contain', objectPosition: 'center', width: '100%', height: '100%' }}
                  />
                </div>
                <div>
                  <p className='fs-7 m-0 p-0 fw-bold'>{option.sku}</p>
                  <p className='fs-7 fw-semibold text-primary m-0 p-0'>{option.isKit ? 'Kit' : 'Product'}</p>
                  <p className='fs-7 text-muted m-0 p-0'>{option.title}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Select_Product_Mapped
