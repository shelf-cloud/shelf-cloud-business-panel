import React from 'react'

import { Label, Switch } from '@/components/migration-ui'

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
    <div className='form-check form-switch form-switch-right form-switch-md tw:flex tw:flex-row tw:justify-start tw:items-center'>
      <Label className='form-label'>{inputLabel}</Label>
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
