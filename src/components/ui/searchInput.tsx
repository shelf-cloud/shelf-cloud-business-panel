import React from 'react'
import { DebounceInput } from 'react-debounce-input'

type Props = {
  searchValue: string
  setSearchValue: React.Dispatch<React.SetStateAction<string>>
  background: keyof typeof BACKGROUND_COLORS
  minLength?: number
  debounceTimeout?: number
  placeholder?: string
}

const BACKGROUND_COLORS = {
  none: null,
  white: 'bg-white',
}

const SearchInput = ({ searchValue, setSearchValue, background, minLength = 1, debounceTimeout = 500, placeholder = 'Search...' }: Props) => {
  return (
    <div className='col-12 col-md-4'>
      <div className='app-search p-0 col-12'>
        <div className='position-relative d-flex rounded-3 w-100 overflow-hidden' style={{ border: '1px solid #E1E3E5' }}>
          <DebounceInput
            type='text'
            minLength={minLength}
            debounceTimeout={debounceTimeout}
            className={`form-control fs-6 ${BACKGROUND_COLORS[background]}`}
            placeholder={placeholder}
            id='search-options'
            value={searchValue}
            onKeyDown={(e) => (e.key == 'Enter' ? e.preventDefault() : null)}
            onChange={(e) => setSearchValue(e.target.value)}
          />
          <span className='mdi mdi-magnify search-widget-icon fs-4'></span>
          <span
            className={`d-flex align-items-center justify-content-center ${BACKGROUND_COLORS[background]}`}
            style={{
              cursor: 'pointer',
              backgroundColor: '#f3f3f9',
            }}
            onClick={() => setSearchValue('')}>
            <i className='mdi mdi-window-close fs-4 m-0 px-2 py-0 text-muted' />
          </span>
        </div>
      </div>
    </div>
  )
}

export default SearchInput
