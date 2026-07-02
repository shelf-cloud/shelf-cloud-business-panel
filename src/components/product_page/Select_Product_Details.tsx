import { useContext, useRef, useState } from 'react'

import { useClickOutside } from '@hooks/useClickOutside'

import AppContext from '@context/AppContext'
import axios from 'axios'
import { useFormik } from 'formik'
import { toast } from 'react-toastify'
import { Button, Form, Input } from '@/components/migration-ui'
import { useSWRConfig } from 'swr'
import * as Yup from 'yup'

type Props = {
  inventoryId?: number
  type: string
  addEndpoint: string
  selectionInfo: string[]
  selected: string
  handleSelection: (type: string, value: string) => void
  errorMessage?: string
}

const styles = {
  noError: { backgroundColor: 'white', border: '1px solid #E1E3E5', cursor: 'pointer' },
  error: { backgroundColor: 'white', border: '1px solid #f06548', cursor: 'pointer' },
}

const Select_Product_Details = ({ inventoryId, type, addEndpoint, selectionInfo, selected, handleSelection, errorMessage }: Props) => {
  const { mutate } = useSWRConfig()
  const { state }: any = useContext(AppContext)
  const [openDatesMenu, setOpenDatesMenu] = useState(false)
  const [selectedOption, setSelectedOption] = useState(selected)
  const selectProduct = useRef<HTMLDivElement | null>(null)

  useClickOutside(selectProduct, () => setOpenDatesMenu(false))

  const validation = useFormik({
    enableReinitialize: true,
    initialValues: {
      name: '',
    },
    validationSchema: Yup.object({
      name: Yup.string()
        .matches(/^[a-zA-Z0-9-\s]+$/, `Invalid special characters: " ' @ ~ , ...`)
        .max(200, 'Name is to Long')
        .required(`Enter ${type} Name`),
    }),
    onSubmit: async (values, { resetForm }) => {
      const response = await axios.post(`/api/settings/${addEndpoint}?region=${state.currentRegion}&businessId=${state.user.businessId}`, {
        productInfo: values,
      })
      if (!response.data.error) {
        toast.success(response.data.message)
        resetForm()
        mutate(`/api/getProductPageDetails?region=${state.currentRegion}&inventoryId=${inventoryId}&businessId=${state.user.businessId}`)
      } else {
        toast.error(response.data.message)
      }
    },
  })

  return (
    <div ref={selectProduct} className='relative mb-3'>
      <button type='button' className='flex w-full items-center p-0 bg-transparent rounded-md' style={errorMessage ? styles.error : styles.noError} onClick={() => setOpenDatesMenu(!openDatesMenu)}>
        <span className='flex-1 px-3 py-[0.3rem] text-[13px] text-left' style={{ backgroundColor: 'white', opacity: '100%' }}>
          {selected == '' ? `Select...` : selected}
        </span>
        <span className='flex items-center justify-center px-2' style={{ backgroundColor: 'white', maxWidth: '35px' }} aria-expanded='false'>
          <i className='mdi mdi-chevron-down text-[16.25px]' />
          <span className='sr-only'>Toggle Dropdown</span>
        </span>
      </button>
      {errorMessage ? (
        <p className='text-destructive p-0' style={{ fontSize: '0.875em', marginTop: '0.25rem' }}>
          {errorMessage}
        </p>
      ) : null}
      <div className={'absolute z-10 mt-1 w-full pt-3 px-4 bg-white border border-[#E1E3E5] rounded-md shadow ' + (openDatesMenu ? 'block' : 'hidden')}>
        <div className='flex flex-col justify-start'>
          <div style={{ maxHeight: '25vh', overflowY: 'scroll' }}>
            {selectionInfo?.map((option) => (
              <button
                type='button'
                key={option}
                className={'block p-0 border-0 bg-transparent text-left no-underline text-inherit mb-2 ' + (selectedOption == `${option}` ? 'font-bold' : '')}
                onClick={() => {
                  setSelectedOption(`${option}`)
                  handleSelection(type, `${option}`)
                }}>
                {`- ${option}`}
              </button>
            ))}
          </div>
          <hr className='my-2 border-[color:var(--border)]' />
          <div className='flex flex-col justify-start'>
            <div>
              <Form className='flex flex-row justify-between items-center w-full gap-3 pb-2'>
                <div className='w-full'>
                  <Input
                    type='text'
                    className='text-[13px]'
                    placeholder='Name...'
                    id='name'
                    name='name'
                    bsSize='sm'
                    onChange={validation.handleChange}
                    onBlur={validation.handleBlur}
                    value={validation.values.name || ''}
                    invalid={validation.touched.name && validation.errors.name ? true : false}
                  />
                </div>
                <div className='flex flex-row justify-end items-end gap-2'>
                  <Button
                    type='button'
                    onClick={(event) => {
                      event.stopPropagation()
                      validation.handleSubmit()
                    }}
                    color='primary'
                    size='sm'
                    className='m-0 text-nowrap'>
                    Add New
                  </Button>
                </div>
              </Form>
              {validation.touched.name && validation.errors.name ? (
                <span className='text-destructive m-0 p-0' style={{ fontSize: '12px' }}>
                  {validation.errors.name}
                </span>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Select_Product_Details
