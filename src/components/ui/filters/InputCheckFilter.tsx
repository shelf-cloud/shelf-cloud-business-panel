import React from 'react'

import { Label } from '@shadcn/ui/label'
import { Switch } from '@/components/ui/Switch'

type Props = {
  inputLabel: string
  inputName: string
  value: boolean
  isInvalid: boolean
  error?: string
  handleChange: (value: boolean) => void
  handleBlur: {
    (e: React.FocusEvent<any>): void
    <T = any>(fieldOrEvent: T): T extends string ? (e: any) => void : void
  }
}

const InputCheckFilter = ({ inputLabel, inputName, value, handleChange, handleBlur }: Props) => {
  return (
    <div className='flex flex-row justify-start items-center gap-2'>
      <Label className='mb-0'>{inputLabel}</Label>
      <Switch
        id={inputName}
        name={inputName}
        checked={value}
        onChange={(e) => {
          handleChange(e.target.checked)
        }}
        onBlur={handleBlur}
      />
    </div>
  )
}

export default InputCheckFilter
