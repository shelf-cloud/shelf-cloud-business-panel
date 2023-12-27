/* eslint-disable @next/next/no-img-element */
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { DebounceInput } from 'react-debounce-input'

type Props = {
  data: {
    inventoryId: string
    businessId: number
    image: string
    title: string
    sku: string
  }[]
  showMappedListingModal: {
    show: boolean
    listingSku: string
    listingId: number
    shelfCloudSku: string
    shelfCloudSkuId: number
    currentSkuMapped: string
    currentSkuIdMapped: number
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
      const newDataTable = data.filter((option) => option.sku.toLowerCase().includes(searchValue.toLowerCase()) || option.title.toLowerCase().includes(searchValue.toLowerCase()))
      return newDataTable
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
                key={option.inventoryId}
                className={'m-0 py-2 px-1 d-flex flex-row gap-2 ' + (showMappedListingModal.shelfCloudSku == `${option.sku}` ? 'bg-light' : '')}
                style={{ cursor: 'pointer' }}
                onClick={() => {
                  setshowMappedListingModal((prev: any) => {
                    return {
                      ...prev,
                      shelfCloudSku: option.sku,
                      shelfCloudSkuId: option.inventoryId,
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
                    src={
                      option.image
                        ? option.image
                        : 'https://firebasestorage.googleapis.com/v0/b/etiquetas-fba.appspot.com/o/image%2Fno-image.png?alt=media&token=c2232af5-43f6-4739-84eb-1d4803c44770'
                    }
                    onError={(e) =>
                      (e.currentTarget.src =
                        'https://firebasestorage.googleapis.com/v0/b/etiquetas-fba.appspot.com/o/image%2Fno-image.png?alt=media&token=c2232af5-43f6-4739-84eb-1d4803c44770')
                    }
                    alt='product Image'
                    style={{ objectFit: 'contain', objectPosition: 'center', width: '100%', height: '100%' }}
                  />
                </div>
                <div>
                  <p className='fs-7 m-0 p-0 fw-bold'>{option.sku}</p>
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
