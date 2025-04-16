import React from 'react'
import { DebounceInput } from 'react-debounce-input'

type Props = {
  searchValue: string
  setSearchValue: React.Dispatch<React.SetStateAction<string>>
  background: keyof typeof BACKGROUND_COLORS
  minLength?: number
  debounceTimeout?: number
  placeholder?: string
  widths?: string
}

const BACKGROUND_COLORS = {
  none: '#f3f3f9',
  white: '#fff',
}

const SearchInput = ({ searchValue, setSearchValue, background, minLength = 1, debounceTimeout = 500, placeholder = 'Search...', widths = 'col-12 col-md-4' }: Props) => {
  return (
    <div className={widths}>
      <div className='col-12 d-flex flex-row flex-nowrap justify-content-around align-items-center rounded-3 overflow-hidden' style={{ border: '1px solid #E1E3E5', backgroundColor: BACKGROUND_COLORS[background] }}>
        <span
          className='mdi mdi-magnify fs-4 m-0 ps-2 pe-0 py-0 text-muted'
          style={{
            backgroundColor: BACKGROUND_COLORS[background],
          }}
        />
        <DebounceInput
          type='text'
          minLength={minLength}
          debounceTimeout={debounceTimeout}
          className='form-control form-control-sm border-0 fs-6 py-2'
          style={{
            backgroundColor: BACKGROUND_COLORS[background],
          }}
          placeholder={placeholder}
          id='search-options'
          value={searchValue}
          onKeyDown={(e) => (e.key == 'Enter' ? e.preventDefault() : null)}
          onChange={(e) => setSearchValue(e.target.value)}
        />
        <span
          className='d-flex align-items-center justify-content-center'
          style={{
            cursor: 'pointer',
            backgroundColor: BACKGROUND_COLORS[background],
          }}
          onClick={() => setSearchValue('')}>
          <i className='mdi mdi-window-close fs-4 m-0 px-2 py-0 text-muted' />
        </span>
      </div>
    </div>
  )
}

export default SearchInput
