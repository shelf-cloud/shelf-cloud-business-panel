import { useRouter } from 'next/router'
import { useRef, useState } from 'react'

import { useClickOutside } from '@hooks/useClickOutside'
import { Form, Formik } from 'formik'

import { Button, Label, Switch } from '@/components/migration-ui'

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

  useClickOutside(filterByOthersContainer, () => setOpenFilters(false))

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
      className='tw:flex tw:flex-col tw:justify-center tw:items-end tw:gap-2 tw:md:flex-row tw:md:justify-between tw:md:items-center tw:w-auto'>
      <div className='tw:relative'>
        <Button
          color={filters === 'true' ? 'info' : 'light'}
          className='tw:text-[11.2px]'
          type='button'
          aria-expanded='false'
          onClick={() => setOpenFilters(!OpenFilters)}>
          Filters
        </Button>
        <div className={'tw:absolute tw:z-10 tw:mt-1 tw:px-6 tw:py-4 tw:bg-white tw:border tw:rounded-md tw:shadow ' + (OpenFilters ? 'tw:block' : 'tw:hidden')}>
          <Formik initialValues={initialValues} onSubmit={(values) => handleSubmit(values)}>
            {({ values, handleBlur, setFieldValue, setValues }) => (
              <Form>
                <div className='tw:flex tw:flex-col tw:justify-start tw:gap-4'>
                  <div className='form-check form-switch form-switch-right form-switch-sm tw:flex tw:flex-row tw:justify-start tw:items-end'>
                    <Label className='tw:font-normal tw:text-[11.2px] tw:w-3/4'>Show hidden products</Label>
                    <Switch
                      id='showHidden'
                      name='showHidden'
                      checked={values.showHidden === 'true' ? true : false}
                      onChange={(e) => {
                        setFieldValue('showHidden', `${e.target.checked}`)
                      }}
                      onBlur={handleBlur}
                    />
                  </div>
                  {masterBoxVisibility && (
                    <div className='form-check form-switch form-switch-right form-switch-sm tw:flex tw:flex-row tw:justify-start tw:items-end'>
                      <Label className='tw:font-normal tw:text-[11.2px] tw:w-3/4'>Show hidden visibility in Master Boxes</Label>
                      <Switch
                        id='masterBoxVisibility'
                        name='masterBoxVisibility'
                        checked={values.masterBoxVisibility === 'true' ? true : false}
                        onChange={(e) => {
                          setFieldValue('masterBoxVisibility', `${e.target.checked}`)
                        }}
                        onBlur={handleBlur}
                      />
                    </div>
                  )}
                  <div className='form-check form-switch form-switch-right form-switch-sm tw:flex tw:flex-row tw:justify-start tw:items-end'>
                    <Label className='tw:font-normal tw:text-[11.2px] tw:w-3/4'>Show With Not Enough Qty</Label>
                    <Switch
                      id='showNotEnough'
                      name='showNotEnough'
                      checked={values.showNotEnough === 'true' ? true : false}
                      onChange={(e) => {
                        setFieldValue('showNotEnough', `${e.target.checked}`)
                      }}
                      onBlur={handleBlur}
                    />
                  </div>
                  <div className='form-check form-switch form-switch-right form-switch-sm tw:flex tw:flex-row tw:justify-start tw:items-end'>
                    <Label className='tw:font-normal tw:text-[11.2px] tw:w-3/4'>Show With No Recommended Ship Date</Label>
                    <Switch
                      id='ShowNoShipDate'
                      name='ShowNoShipDate'
                      checked={values.ShowNoShipDate === 'true' ? true : false}
                      onChange={(e) => {
                        setFieldValue('ShowNoShipDate', `${e.target.checked}`)
                      }}
                      onBlur={handleBlur}
                    />
                  </div>
                </div>
                <div className='tw:w-full tw:flex tw:justify-between tw:items-center tw:mt-6'>
                  <button type='button' onClick={() => handleClearFilters(setValues)} className='btn btn-link tw:p-0 tw:border-0 tw:no-underline tw:font-normal tw:m-0 tw:text-[11.2px]'>
                    Clear All
                  </button>
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
