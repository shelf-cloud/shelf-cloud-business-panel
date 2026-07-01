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
    <div ref={selectProduct} className='tw:relative tw:mb-3'>
      <button type='button' className='tw:flex tw:w-full tw:items-center tw:p-0 tw:bg-transparent tw:rounded-md' style={errorMessage ? styles.error : styles.noError} onClick={() => setOpenDatesMenu(!openDatesMenu)}>
        <span className='tw:flex-1 tw:px-3 tw:py-[0.3rem] tw:text-[13px] tw:text-left' style={{ backgroundColor: 'white', opacity: '100%' }}>
          {selected == '' ? `Select...` : selected}
        </span>
        <span className='tw:flex tw:items-center tw:justify-center tw:px-2' style={{ backgroundColor: 'white', maxWidth: '35px' }} aria-expanded='false'>
          <i className='mdi mdi-chevron-down tw:text-[16.25px]' />
          <span className='tw:sr-only'>Toggle Dropdown</span>
        </span>
      </button>
      {errorMessage ? (
        <p className='tw:text-destructive tw:p-0' style={{ fontSize: '0.875em', marginTop: '0.25rem' }}>
          {errorMessage}
        </p>
      ) : null}
      <div className={'tw:absolute tw:z-10 tw:mt-1 tw:w-full tw:pt-3 tw:px-4 tw:bg-white tw:border tw:border-[#E1E3E5] tw:rounded-md tw:shadow ' + (openDatesMenu ? 'tw:block' : 'tw:hidden')}>
        <div className='tw:flex tw:flex-col tw:justify-start'>
          <div style={{ maxHeight: '25vh', overflowY: 'scroll' }}>
            {selectionInfo?.map((option) => (
              <button
                type='button'
                key={option}
                className={'tw:block tw:p-0 tw:border-0 tw:bg-transparent tw:text-left tw:no-underline tw:text-inherit tw:mb-2 ' + (selectedOption == `${option}` ? 'tw:font-bold' : '')}
                onClick={() => {
                  setSelectedOption(`${option}`)
                  handleSelection(type, `${option}`)
                }}>
                {`- ${option}`}
              </button>
            ))}
          </div>
          <hr className='tw:my-2 tw:border-[color:var(--border)]' />
          <div className='tw:flex tw:flex-col tw:justify-start'>
            <div>
              <Form className='tw:flex tw:flex-row tw:justify-between tw:items-center tw:w-full tw:gap-3 tw:pb-2'>
                <div className='tw:w-full'>
                  <Input
                    type='text'
                    className='tw:text-[13px]'
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
                <div className='tw:flex tw:flex-row tw:justify-end tw:items-end tw:gap-2'>
                  <Button
                    type='button'
                    onClick={(event) => {
                      event.stopPropagation()
                      validation.handleSubmit()
                    }}
                    color='primary'
                    size='sm'
                    className='tw:m-0 tw:text-nowrap'>
                    Add New
                  </Button>
                </div>
              </Form>
              {validation.touched.name && validation.errors.name ? (
                <span className='tw:text-destructive tw:m-0 tw:p-0' style={{ fontSize: '12px' }}>
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
