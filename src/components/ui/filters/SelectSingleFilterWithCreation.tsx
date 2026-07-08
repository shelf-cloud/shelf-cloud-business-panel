import dynamic from 'next/dynamic'

import { SelectOptionType, SelectSingleValueType } from '@components/Common/SimpleSelect'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import type { z } from 'zod'

import { Label } from '@shadcn/ui/label'

import ErrorInputLabel from '../forms/ErrorInputLabel'

const SimpleSelectWithCreation = dynamic(() => import('@components/Common/SimpleSelectWithCreation'), {
  ssr: false,
  loading: () => <div style={{ minHeight: '30px' }} />,
})

type Props = {
  inputLabel: string
  inputName: string
  placeholder: string
  selected: SelectSingleValueType
  options: SelectOptionType[]
  handleSelect: (option: SelectSingleValueType) => void
  error?: string | undefined
  validationSchema: z.ZodType<{ name: string }, { name: string }>
  submitAddNewOption: (values: { name: string }) => Promise<{ error: boolean }>
}

const SelectSingleFilterWithCreation = ({ inputLabel, inputName, placeholder, options, selected, handleSelect, error, validationSchema, submitAddNewOption }: Props) => {
  const validation = useForm<{ name: string }>({
    resolver: zodResolver(validationSchema),
    defaultValues: { name: '' },
  })

  const nameError = validation.formState.errors.name?.message

  return (
    <div id={`select-container-${inputName}`} className='mb-2'>
      <Label htmlFor={inputLabel} className='mb-2 inline-block text-sm'>
        {inputLabel}
      </Label>
      <SimpleSelectWithCreation
        selected={selected}
        options={options}
        handleSelect={handleSelect}
        handleCreate={(newValue: string) => {
          validation.setValue('name', newValue)
          validation.handleSubmit(async (values) => {
            const response = await submitAddNewOption(values)
            if (!response?.error) {
              validation.reset({ name: '' })
            }
          })()
        }}
        customStyle='sm'
        placeholder={placeholder}
        hasError={Boolean(error)}
      />
      <ErrorInputLabel error={error} />
      {nameError ? <span className='text-destructive m-0 p-0 text-sm'>{nameError}</span> : null}
    </div>
  )
}

export default SelectSingleFilterWithCreation
