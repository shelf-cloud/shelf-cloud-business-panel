import React from 'react'

import { FormGroup, Label } from 'reactstrap'

import SelectMultipleDropDown from '../SelectMultipleDropDown'

type Props = {
  inputLabel: string
  inputName: string
  value: string
  selectionInfo: {
    [key: string]: {
      label: string
      icon: string
      color: string
    }
  }
  selected: string
  handleSelection: (field: string, value: any, shouldValidate?: boolean | undefined) => void
}

const SelectMultipleFilter = ({ inputLabel, inputName, value, selectionInfo, selected, handleSelection }: Props) => {
  return (
    <FormGroup id={inputName} className='createOrder_inputs'>
      <Label htmlFor='lastNameinput' className='form-label'>
        {inputLabel}
      </Label>
      <SelectMultipleDropDown formValue={value} selectionInfo={selectionInfo} selected={selected} handleSelection={handleSelection} />
    </FormGroup>
  )
}

export default SelectMultipleFilter
