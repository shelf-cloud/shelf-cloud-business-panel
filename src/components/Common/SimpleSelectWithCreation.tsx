import { useCallback } from 'react'

import { ActionMeta, SingleValue } from 'react-select'
import CreatableSelect from 'react-select/creatable'

export type SelectOptionType = { value: string | number; label: string; description?: string }
export type SelectSingleValueType = SingleValue<SelectOptionType>

type Props = {
  selected: SelectSingleValueType
  handleSelect: (option: SelectSingleValueType, actionMeta?: ActionMeta<SelectOptionType>) => void
  handleCreate: (inputValue: string) => void
  options: SelectOptionType[]
  customStyle?: 'sm' | 'base'
  placeholder?: string
  hasError?: boolean
  isClearable?: boolean
  isDisabled?: boolean
  isReadOnly?: boolean
  menuPortalTarget?: HTMLElement
}

type CustomStyles = { [key: string]: any }

const customStyles: CustomStyles = {
  base: {
    control: (provided: any) => ({
      ...provided,
    }),
    valueContainer: (provided: any) => ({
      ...provided,
    }),
    input: (provided: any) => ({
      ...provided,
    }),
    placeholder: (provided: any) => ({
      ...provided,
      color: '#6c757a',
    }),
    indicatorsContainer: (provided: any) => ({
      ...provided,
    }),
  },
  sm: {
    control: (provided: any) => ({
      ...provided,
      minHeight: '30px',
      height: '30px',
    }),
    valueContainer: (provided: any) => ({
      ...provided,
      height: '30px',
      padding: '0 6px',
    }),
    input: (provided: any) => ({
      ...provided,
      margin: '0px',
    }),
    placeholder: (provided: any) => ({
      ...provided,
      color: '#6c757a',
    }),
    indicatorsContainer: (provided: any) => ({
      ...provided,
      height: '30px',
    }),
  },
} as const

const getStyle = (customStyle: string, hasError: boolean) => {
  const style = customStyles[customStyle as keyof CustomStyles]
  if (hasError) {
    return {
      ...style,
      control: (provided: any, state: any) => ({
        ...style.control(provided, state),
        borderColor: '#f06548',
      }),
    }
  }
  return style
}

const SimpleSelectWithCreation = ({
  selected,
  handleSelect,
  handleCreate,
  options,
  customStyle = 'base',
  placeholder,
  hasError,
  isClearable = true,
  isDisabled = false,
  menuPortalTarget,
  isReadOnly = false,
}: Props) => {
  const filterOption = useCallback((option: { data: SelectOptionType }, inputValue: string) => {
    if (!inputValue) return true

    const { label, description } = option.data
    const searchTerms = inputValue.toLowerCase().trim().split(/\s+/)

    const labelLower = label.toLowerCase()
    const allTermsInLabel = searchTerms.every((term) => labelLower.includes(term))

    if (description) {
      const descriptionLower = description.toLowerCase()
      const allTermsInDescription = searchTerms.every((term) => descriptionLower.includes(term))
      if (allTermsInLabel || allTermsInDescription) return true
    }

    return allTermsInLabel
  }, [])

  const formatOptionLabel = useCallback((option: SelectOptionType, { context }: { context: 'menu' | 'value' }) => {
    if (context === 'menu') {
      return (
        <div className='d-flex flex-column gap-0'>
          <span className='fs-7'>{option.label}</span>
          {option.description && (
            <small
              style={{
                fontSize: '0.8em',
                lineHeight: '1.2em',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}>
              {option.description}
            </small>
          )}
        </div>
      )
    }

    return <span>{option.label}</span>
  }, [])

  return (
    <CreatableSelect
      isClearable={isClearable}
      value={selected}
      placeholder={placeholder}
      onChange={handleSelect}
      onCreateOption={handleCreate}
      options={options}
      isDisabled={isDisabled || isReadOnly}
      menuPortalTarget={menuPortalTarget && document.body}
      styles={getStyle(customStyle, hasError || false)}
      filterOption={filterOption}
      formatOptionLabel={formatOptionLabel}
    />
  )
}

export default SimpleSelectWithCreation
