/* eslint-disable @next/next/no-img-element */
import { useEffect, useRef, useState } from 'react'

import { NoImageAdress } from '@lib/assetsConstants'

type Props = {
  selectionInfo: {
    storeId: string
    name: string
    logo: string
  }[]
  selected: {
    storeId: string
    name: string
    logo: string
  }
  handleSelection: ({ storeId, name, logo }: { storeId: string; name: string; logo: string }) => void
  showAllMarketsOption: boolean
}

const SelectMarketplaceDropDown = ({ selectionInfo, selected, handleSelection, showAllMarketsOption }: Props) => {
  const [openDatesMenu, setOpenDatesMenu] = useState(false)
  const selectMarketplace = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (document) {
      document.addEventListener('click', (e: any) => {
        if (selectMarketplace.current) {
          if (!selectMarketplace.current.contains(e.target)) {
            setOpenDatesMenu(false)
          }
        }
      })
    }
  }, [])

  return (
    <div ref={selectMarketplace} className='dropdown'>
      <button
        className='btn btn-light dropdown-toggle d-flex flex-row justify-content-start align-items-center gap-2'
        style={{ backgroundColor: 'white', border: '1px solid #E1E3E5' }}
        type='button'
        data-bs-toggle='dropdown'
        data-bs-auto-close='outside'
        aria-expanded='false'
        onClick={() => setOpenDatesMenu(!openDatesMenu)}>
        {selected.storeId === '9999' || selected.storeId === '' ? (
          <i className='las la-store-alt fs-5 m-0 p-0 text-primary' />
        ) : (
          <div
            style={{
              width: '16px',
              height: '16px',
              margin: '0px',
              position: 'relative',
            }}>
            <img
              loading='lazy'
              src={selected.logo ? selected.logo : NoImageAdress}
              onError={(e) => (e.currentTarget.src = NoImageAdress)}
              alt='product Image'
              style={{ objectFit: 'contain', objectPosition: 'center', width: '100%', height: '100%' }}
            />
          </div>
        )}
        <span className='fw-semibold m-0 p-0 fs-7'>{selected?.name}</span>
      </button>
      <div className={'dropdown-menu w-100 py-3 ps-3 pe-1' + (openDatesMenu ? ' show' : '')} style={{ minWidth: '280px' }}>
        <div className='w-100 d-flex flex-column justify-content-start align-items-start gap-2' style={{ maxHeight: '25vh', overflowY: 'scroll', scrollbarWidth: 'thin' }}>
          {showAllMarketsOption && (
            <div
              key={'9999'}
              className='d-flex flex-row justify-content-start gap-2 align-items-center'
              style={{ cursor: 'pointer' }}
              onClick={() => {
                handleSelection({ storeId: '9999', name: 'All Marketplaces', logo: '' })
                setOpenDatesMenu(false)
              }}>
              <i className='las la-store-alt fs-4 m-0 p-0 text-primary' />
              <span className={'m-0 p-0 text-nowrap ' + (selected.storeId === '9999' ? 'fw-semibold' : '')}>All Marketplaces</span>
            </div>
          )}
          {selectionInfo?.map((option) => (
            <div
              key={option.storeId}
              className='d-flex flex-row justify-content-start gap-2 align-items-center mb-1'
              style={{ cursor: 'pointer' }}
              onClick={() => {
                handleSelection({ storeId: option.storeId, name: option.name, logo: option.logo })
                setOpenDatesMenu(false)
              }}>
              {option.logo !== '' && (
                <div
                  style={{
                    width: '20px',
                    height: '20px',
                    margin: '0px',
                    position: 'relative',
                  }}>
                  <img
                    loading='lazy'
                    src={option.logo ? option.logo : NoImageAdress}
                    onError={(e) => (e.currentTarget.src = NoImageAdress)}
                    alt='product Image'
                    style={{ objectFit: 'contain', objectPosition: 'center', width: '100%', height: '100%' }}
                  />
                </div>
              )}
              <span className={'m-0 p-0 text-nowrap ' + (String(selected.storeId) === option.storeId ? 'fw-bold' : '')}>{option.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default SelectMarketplaceDropDown
