import React from 'react'
import Select from 'react-select'

type Props = {
  selected: any
  handleSelect: (selected: any) => void
  options: any[]
}

const SimpleSelect = ({ selected, handleSelect, options }: Props) => {
  return <Select value={selected} onChange={handleSelect} options={options} />
}

export default SimpleSelect
