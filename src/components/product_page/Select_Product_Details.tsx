import React, { useContext, useEffect, useRef, useState } from 'react'
import { Button, Form, Input } from 'reactstrap'
import * as Yup from 'yup'
import { useFormik } from 'formik'
import { useSWRConfig } from 'swr'
import axios from 'axios'
import { toast } from 'react-toastify'
import AppContext from '@context/AppContext'

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
  const filterByDates = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (document) {
      document.addEventListener('click', (e: any) => {
        if (filterByDates.current) {
          if (!filterByDates.current.contains(e.target)) {
            setOpenDatesMenu(false)
          }
        }
      })
    }
  }, [])

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
        toast.success(response.data.msg)
        resetForm()
        mutate(`/api/getProductPageDetails?region=${state.currentRegion}&inventoryId=${inventoryId}&businessId=${state.user.businessId}`)
      } else {
        toast.error(response.data.msg)
      }
    },
  })

  return (
    <div ref={filterByDates} className='dropdown mb-3'>
      <div className='btn-group w-100' style={errorMessage ? styles.error : styles.noError} onClick={() => setOpenDatesMenu(!openDatesMenu)}>
        <button type='button' disabled className='btn btn-light btn-sm form-control fs-6 w-100 text-start' style={{ backgroundColor: 'white', opacity: '100%' }}>
          {selected == '' ? `Select...` : selected}
        </button>
        <button
          type='button'
          disabled
          className='btn btn-light btn-sm dropdown-toggle form-control fs-6dropdown-toggle dropdown-toggle-split'
          style={{ backgroundColor: 'white', maxWidth: '35px' }}
          data-bs-toggle='dropdown'
          data-bs-auto-close='outside'
          aria-expanded='false'>
          <span className='visually-hidden'>Toggle Dropdown</span>
        </button>
      </div>
      {errorMessage ? (
        <p className='text-danger p-0' style={{ fontSize: '0.875em', marginTop: '0.25rem' }}>
          {errorMessage}
        </p>
      ) : null}
      <div className={'dropdown-menu w-100 pt-3 px-4' + (openDatesMenu ? ' show' : '')}>
        <div className='d-flex flex-column justify-content-start'>
          <div style={{maxHeight: '25vh', overflowY: 'scroll'}}>
            {selectionInfo?.map((option) => (
              <p
                key={option}
                className={'m-0 mb-2 ' + (selectedOption == `${option}` ? 'fw-bold' : '')}
                style={{ cursor: 'pointer' }}
                onClick={() => {
                  setSelectedOption(`${option}`)
                  handleSelection(type, `${option}`)
                }}>
                {`- ${option}`}
              </p>
            ))}
          </div>
          <hr className='dropdown-divider' />
          <div className='d-flex flex-column justify-content-start'>
            <div>
              <Form className='d-flex flex-row justify-content-between align-items-center w-100 gap-3 pb-2'>
                <div className='w-100'>
                  <Input
                    type='text'
                    className='form-control fs-6'
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
                <div className='d-flex flex-row justify-content-end align-items-end gap-2 '>
                  <Button
                    type='button'
                    onClick={(event) => {
                      event.stopPropagation()
                      validation.handleSubmit()
                    }}
                    color='primary'
                    className='btn btn-sm m-0 text-nowrap'>
                    Add New
                  </Button>
                </div>
              </Form>
              {validation.touched.name && validation.errors.name ? (
                <span className='text-danger m-0 p-0' style={{ fontSize: '12px' }}>
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
