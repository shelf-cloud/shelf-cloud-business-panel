import React from 'react'
import Select from 'react-select'

type Props = {
  selected: any
  handleSelect: (selected: any) => void
  options: any[]
  customStyle?: 'sm' | 'base'
  placeholder?: string
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
}

const SimpleSelect = ({ selected, handleSelect, options, customStyle, placeholder }: Props) => {
  return <Select value={selected} placeholder={placeholder} onChange={handleSelect} options={options} styles={customStyle ? customStyles[customStyle as keyof CustomStyles] : customStyles['base']} />
}

export default SimpleSelect
