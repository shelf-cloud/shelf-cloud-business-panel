import dynamic from 'next/dynamic'

import { SelectOptionType, SelectSingleValueType } from '@components/Common/SimpleSelect'
import { useFormik } from 'formik'
import { Label } from 'reactstrap'
import * as Yup from 'yup'

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
  validationSchema: Yup.ObjectSchema<any>
  submitAddNewOption: (values: { name: string }) => Promise<{ error: boolean }>
}

const SelectSingleFilterWithCreation = ({ inputLabel, inputName, placeholder, options, selected, handleSelect, error, validationSchema, submitAddNewOption }: Props) => {
  const validation = useFormik({
    enableReinitialize: true,
    initialValues: {
      name: '',
    },
    validationSchema: validationSchema,
    onSubmit: async (values, { resetForm }) => {
      const response = await submitAddNewOption(values)
      if (!response?.error) {
        resetForm()
      }
    },
  })

  return (
    <div id={`select-container-${inputName}`} className='mb-2'>
      <Label htmlFor={inputLabel} className='form-label fs-7'>
        {inputLabel}
      </Label>
      <SimpleSelectWithCreation
        selected={selected}
        options={options}
        handleSelect={handleSelect}
        handleCreate={(newValue: string) => {
          validation.setFieldValue('name', newValue).then(() => {
            validation.handleSubmit()
          })
        }}
        customStyle='sm'
        placeholder={placeholder}
        hasError={Boolean(error)}
      />
      <ErrorInputLabel error={error} />
      {validation.touched.name && validation.errors.name ? <span className='text-danger m-0 p-0 fs-7'>{validation.errors.name}</span> : null}
    </div>
  )
}

export default SelectSingleFilterWithCreation
