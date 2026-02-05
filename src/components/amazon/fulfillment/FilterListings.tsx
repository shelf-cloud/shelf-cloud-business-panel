/* eslint-disable react-hooks/exhaustive-deps */
import { useRouter } from 'next/router'
import React, { useEffect, useRef, useState } from 'react'

import { Form, Formik } from 'formik'
import { Button, Input, Label } from 'reactstrap'

type Props = {
  filters: string
  showHidden: string
  showNotEnough: string
  ShowNoShipDate: string
  masterBoxVisibility?: string
}

const FilterListings = ({ filters, showHidden, showNotEnough, ShowNoShipDate, masterBoxVisibility }: Props) => {
  const router = useRouter()
  const [OpenFilters, setOpenFilters] = useState(false)
  const filterByOthersContainer = useRef<HTMLDivElement | null>(null)

  const initialValues = {
    filters: filters,
    showHidden: showHidden,
    showNotEnough: showNotEnough,
    ShowNoShipDate: ShowNoShipDate,
    masterBoxVisibility: masterBoxVisibility,
  }

  useEffect(() => {
    if (document) {
      document.addEventListener('click', (e: any) => {
        if (filterByOthersContainer.current) {
          if (!filterByOthersContainer.current.contains(e.target)) {
            setOpenFilters(false)
          }
        }
      })
    }
  }, [])

  const handleApplyFilters = (showHidden: string, showNotEnough: string, ShowNoShipDate: string, masterBoxVisibility: string) => {
    let filterString = `/amazon-sellers/fulfillment/sendToAmazon?filters=true`
    if (showHidden || showHidden !== '') filterString += `&showHidden=${showHidden}`
    if (showNotEnough || showNotEnough !== '') filterString += `&showNotEnough=${showNotEnough}`
    if (ShowNoShipDate || ShowNoShipDate !== '') filterString += `&ShowNoShipDate=${ShowNoShipDate}`
    if (masterBoxVisibility || masterBoxVisibility !== '') filterString += `&masterBoxVisibility=${masterBoxVisibility}`
    router.push(filterString, undefined, { shallow: true })
  }

  const handleSubmit = async (values: any) => {
    handleApplyFilters(values.showHidden, values.showNotEnough, values.ShowNoShipDate, values.masterBoxVisibility)
    setOpenFilters(false)
  }

  const handleClearFilters = (setValues: any) => {
    setValues({
      showHidden: '',
      showNotEnough: '',
      ShowNoShipDate: '',
      masterBoxVisibility: '',
    })
    router.push(`/amazon-sellers/fulfillment/sendToAmazon`, undefined, { shallow: true })
    setOpenFilters(false)
  }

  return (
    <div
      ref={filterByOthersContainer}
      className='d-flex flex-column justify-content-center align-items-end gap-2 flex-md-row justify-content-md-between align-items-md-center w-auto'>
      <div className='dropdown'>
        <Button
          color={filters === 'true' ? 'info' : 'light'}
          className='dropdown-toggle fs-7'
          type='button'
          data-bs-toggle='dropdown'
          data-bs-auto-close='outside'
          aria-expanded='false'
          onClick={() => setOpenFilters(!OpenFilters)}>
          Filters
        </Button>
        <div className={'dropdown-menu dropdown-menu-md px-4 py-3' + (OpenFilters ? ' show' : '')}>
          <Formik initialValues={initialValues} onSubmit={(values) => handleSubmit(values)}>
            {({ values, errors, touched, handleBlur, setFieldValue, setValues }) => (
              <Form>
                <div className='d-flex flex-column justify-content-start gap-3'>
                  <div className='form-check form-switch form-switch-right form-switch-sm d-flex flex-row justify-content-start align-items-end'>
                    <Label className='fw-normal fs-7 w-75'>Show hidden products</Label>
                    <Input
                      className='form-check-input code-switcher'
                      type='checkbox'
                      id='showHidden'
                      name='showHidden'
                      checked={values.showHidden === 'true' ? true : false}
                      onChange={(e) => {
                        setFieldValue('showHidden', `${e.target.checked}`)
                      }}
                      onBlur={handleBlur}
                      invalid={touched.showHidden && errors.showHidden ? true : false}
                    />
                  </div>
                  {masterBoxVisibility && (
                    <div className='form-check form-switch form-switch-right form-switch-sm d-flex flex-row justify-content-start align-items-end'>
                      <Label className='fw-normal fs-7 w-75'>Show hidden visibility in Master Boxes</Label>
                      <Input
                        className='form-check-input code-switcher'
                        type='checkbox'
                        id='masterBoxVisibility'
                        name='masterBoxVisibility'
                        checked={values.masterBoxVisibility === 'true' ? true : false}
                        onChange={(e) => {
                          setFieldValue('masterBoxVisibility', `${e.target.checked}`)
                        }}
                        onBlur={handleBlur}
                        invalid={touched.masterBoxVisibility && errors.masterBoxVisibility ? true : false}
                      />
                    </div>
                  )}
                  <div className='form-check form-switch form-switch-right form-switch-sm d-flex flex-row justify-content-start align-items-end'>
                    <Label className='fw-normal fs-7 w-75'>Show With Not Enough Qty</Label>
                    <Input
                      className='form-check-input code-switcher'
                      type='checkbox'
                      id='showNotEnough'
                      name='showNotEnough'
                      checked={values.showNotEnough === 'true' ? true : false}
                      onChange={(e) => {
                        setFieldValue('showNotEnough', `${e.target.checked}`)
                      }}
                      onBlur={handleBlur}
                      invalid={touched.showNotEnough && errors.showNotEnough ? true : false}
                    />
                  </div>
                  <div className='form-check form-switch form-switch-right form-switch-sm d-flex flex-row justify-content-start align-items-end'>
                    <Label className='fw-normal fs-7 w-75'>Show With No Recommended Ship Date</Label>
                    <Input
                      className='form-check-input code-switcher'
                      type='checkbox'
                      id='ShowNoShipDate'
                      name='ShowNoShipDate'
                      checked={values.ShowNoShipDate === 'true' ? true : false}
                      onChange={(e) => {
                        setFieldValue('ShowNoShipDate', `${e.target.checked}`)
                      }}
                      onBlur={handleBlur}
                      invalid={touched.ShowNoShipDate && errors.ShowNoShipDate ? true : false}
                    />
                  </div>
                </div>
                <div className='w-full d-flex justify-content-between align-items-center mt-4'>
                  <span onClick={() => handleClearFilters(setValues)} className='fw-normal m-0 fs-7' style={{ cursor: 'pointer' }}>
                    Clear All
                  </span>
                  <Button color='primary' type='submit' size='sm'>
                    Apply
                  </Button>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </div>
  )
}

export default FilterListings
