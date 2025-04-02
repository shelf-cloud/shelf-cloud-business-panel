import React from 'react'
import Select from 'react-select'

export type SelectOptionType = { value: string | number; label: string }

type Props = {
  selected: any
  handleSelect: (option: SelectOptionType) => void
  options: SelectOptionType[]
  customStyle?: 'sm' | 'base'
  placeholder?: string
  hasError?: boolean
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
    };
  }
  return style
}

const SimpleSelect = ({ selected, handleSelect, options, customStyle = 'base', placeholder, hasError }: Props) => {
  return <Select value={selected} placeholder={placeholder} onChange={handleSelect} options={options} styles={getStyle(customStyle, hasError || false)} />
}

export default SimpleSelect
