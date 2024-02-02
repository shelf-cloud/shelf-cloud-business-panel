/* eslint-disable @next/next/no-img-element */
import AppContext from '@context/AppContext'
import React, { useContext, useEffect, useRef, useState } from 'react'

type Props = {
  selectionInfo: {
    storeId: number
    name: string
    logo: string
  }[]
  selected: {
    storeId: number
    name: string
    logo: string
  }
  handleSelection: (prev: any) => void
}

const SelectMarketplaceDropDown = ({ selectionInfo, selected, handleSelection }: Props) => {
  const { state }: any = useContext(AppContext)
  const [openDatesMenu, setOpenDatesMenu] = useState(false)
  const filterByDates = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (document) {
      document.addEventListener('click', (e: any) => {
        if (filterByDates.current) {
          if (!filterByDates.current.contains(e.target)) {
            setOpenDatesMenu(false)
          }
        }
      })
    }
  }, [])

  return (
    <div ref={filterByDates} className='dropdown' style={{ minWidth: '250px' }}>
      <button
        className='btn btn-light dropdown-toggle d-flex flex-row justify-content-start align-items-center gap-2'
        style={{ backgroundColor: 'white', border: '1px solid #E1E3E5' }}
        type='button'
        data-bs-toggle='dropdown'
        data-bs-auto-close='outside'
        aria-expanded='false'
        onClick={() => setOpenDatesMenu(!openDatesMenu)}>
        {selected.storeId === 9999 ? (
          <i className='las la-store-alt fs-4 m-0 p-0 text-primary' />
        ) : (
          <div
            style={{
              width: '20px',
              height: '20px',
              margin: '0px',
              position: 'relative',
            }}>
            <img
              loading='lazy'
              src={
                selected.logo
                  ? selected.logo
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
        )}
        <span className='fw-semibold m-0 p-0'>{selected?.name}</span>
      </button>
      <div className={'dropdown-menu w-100 py-3 px-3' + (openDatesMenu ? ' show' : '')}>
        <div className='d-flex flex-column justify-content-start'>
          <div className='d-flex flex-column justify-content-start gap-2 py-1' style={{ maxHeight: '25vh', overflowY: 'scroll' }}>
            <div
              key={9999}
              className='d-flex flex-row justify-content-start gap-1 align-items-center'
              style={{ cursor: 'pointer' }}
              onClick={() => {
                handleSelection((prev: any) => ({ ...prev, storeId: 9999, name: 'All Marketplaces', logo: '' }))
                setOpenDatesMenu(false)
              }}>
              <i className='las la-store-alt fs-4 m-0 p-0 text-primary' />
              <span className={'m-0 p-0 text-nowrap ' + (selected.storeId === 9999 ? 'fw-semibold' : '')}>All Marketplaces</span>
            </div>
            {state.user[state.currentRegion]?.showAmazonTab && state.user[state.currentRegion]?.amazonConnected && (
              <div
                key={8888}
                className='d-flex flex-row justify-content-start gap-1 align-items-center'
                style={{ cursor: 'pointer' }}
                onClick={() => {
                  handleSelection((prev: any) => ({ ...prev, storeId: 8888, name: 'Amazon FBA', logo: 'https://onixventuregroup.goflow.com/images/channels/amazon.svg' }))
                  setOpenDatesMenu(false)
                }}>
                <div
                  style={{
                    width: '25px',
                    height: '25px',
                    margin: '0px',
                    position: 'relative',
                  }}>
                  <img
                    loading='lazy'
                    src={'https://onixventuregroup.goflow.com/images/channels/amazon.svg'}
                    onError={(e) =>
                      (e.currentTarget.src =
                        'https://firebasestorage.googleapis.com/v0/b/etiquetas-fba.appspot.com/o/image%2Fno-image.png?alt=media&token=c2232af5-43f6-4739-84eb-1d4803c44770')
                    }
                    alt='product Image'
                    style={{ objectFit: 'contain', objectPosition: 'center', width: '100%', height: '100%' }}
                  />
                </div>
                <span className={'m-0 p-0 text-nowrap ' + (selected.storeId === 8888 ? 'fw-semibold' : '')}>Amazon FBA</span>
              </div>
            )}
            {selectionInfo?.map((option) => (
              <div
                key={option.storeId}
                className='d-flex flex-row justify-content-start gap-1 align-items-center'
                style={{ cursor: 'pointer' }}
                onClick={() => {
                  handleSelection((prev: any) => ({ ...prev, storeId: option.storeId, name: option.name, logo: option.logo }))
                  setOpenDatesMenu(false)
                }}>
                {option.logo !== '' && (
                  <div
                    style={{
                      width: '25px',
                      height: '25px',
                      margin: '0px',
                      position: 'relative',
                    }}>
                    <img
                      loading='lazy'
                      src={
                        option.logo
                          ? option.logo
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
                )}
                <span className={'m-0 p-0 text-nowrap ' + (selected.storeId === option.storeId ? 'fw-semibold' : '')}>{option.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default SelectMarketplaceDropDown
