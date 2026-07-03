import { Label } from '@shadcn/ui/label'

import SelectMultipleDropDown, { SelectMultipleOptions } from '../SelectMultipleDropDown'

type Props = {
  inputLabel: string
  inputName: string
  value: string
  selectionInfo: SelectMultipleOptions
  selected: string
  handleSelection: (field: string, value: any, shouldValidate?: boolean | undefined) => void
}

const SelectMultipleFilter = ({ inputLabel, inputName, value, selectionInfo, selected, handleSelection }: Props) => {
  return (
    <div id={inputName} className='mb-3 createOrder_inputs'>
      <Label htmlFor='lastNameinput' className='mb-2'>
        {inputLabel}
      </Label>
      <SelectMultipleDropDown formValue={value} selectionInfo={selectionInfo} selected={selected} handleSelection={handleSelection} />
    </div>
  )
}

export default SelectMultipleFilter
