/* eslint-disable @next/next/no-img-element */
import { NoImageAdress } from '@lib/assetsConstants'
import Select, { ActionMeta, SingleValue } from 'react-select'

export type SelectOptionType = { value: string | number; label: string; description?: string; imageUrl?: string }
export type SelectSingleValueType = SingleValue<SelectOptionType>

type Props = {
  selected: SelectSingleValueType
  handleSelect: (option: SelectSingleValueType, actionMeta?: ActionMeta<SelectOptionType>) => void
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

const SimpleSelectWithImage = ({
  selected,
  handleSelect,
  options,
  customStyle = 'base',
  placeholder,
  hasError,
  isClearable = false,
  isDisabled = false,
  menuPortalTarget,
  isReadOnly = false,
}: Props) => {
  return (
    <Select
      value={selected}
      placeholder={placeholder}
      onChange={handleSelect}
      options={options}
      isClearable={isClearable}
      isDisabled={isDisabled || isReadOnly}
      menuPortalTarget={menuPortalTarget && document.body}
      styles={getStyle(customStyle, hasError || false)}
      filterOption={(option: { data: SelectOptionType }, inputValue: string) => {
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
        if (allTermsInLabel) return true
        return false
      }}
      formatOptionLabel={(option: SelectOptionType, { context }: { context: 'menu' | 'value' }) => {
        if (context === 'menu') {
          return (
            <div className='d-flex flex-row justify-content-start align-items-center gap-2 fs-7'>
              <div
                style={{
                  width: '22px',
                  height: '22px',
                  margin: '0px',
                  position: 'relative',
                }}>
                <img
                  loading='lazy'
                  src={option.imageUrl}
                  onError={(e) => (e.currentTarget.src = NoImageAdress)}
                  alt='product Image'
                  style={{ objectFit: 'contain', objectPosition: 'center', width: '100%', height: '100%' }}
                />
              </div>
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
            </div>
          )
        }

        return <span>{option.label}</span>
      }}
    />
  )
}

export default SimpleSelectWithImage
