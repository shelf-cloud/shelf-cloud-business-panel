import { useRouter } from 'next/router'
import { memo } from 'react'

import SimpleSelect, { SelectSingleValueType } from '@components/Common/SimpleSelect'
import InputCheckFilter from '@components/ui/filters/InputCheckFilter'
import { useMarketplaceListingsQueries } from '@hooks/products/useMarketplaceListingsQuery'
import { Form, Formik } from 'formik'
import { Button } from '@shadcn/ui/button'
import { Card, CardContent } from '@shadcn/ui/card'
import { Label } from '@shadcn/ui/label'
import * as Yup from 'yup'

type Props = {
  supplierOptions: string[]
  brandOptions: string[]
  categoryOptions: string[]
  setFilterOpen: (value: boolean) => void
}

const MKL_Filters = ({ supplierOptions, brandOptions, categoryOptions, setFilterOpen }: Props) => {
  const { listingsFilter, setListingsFilter } = useMarketplaceListingsQueries()
  const { showMKHidden, showMapped, showDiscontinued, supplier, brand, category } = listingsFilter
  const supplierOptionsList = supplierOptions.map((option) => ({ value: option, label: option }))
  const brandOptionsList = brandOptions.map((option) => ({ value: option, label: option }))
  const categoryOptionsList = categoryOptions.map((option) => ({ value: option, label: option }))

  const router = useRouter()

  const initialValues = {
    showMKHidden: showMKHidden,
    showMapped: showMapped,
    showDiscontinued: showDiscontinued,
    supplier: supplier,
    brand: brand,
    category: category,
  }

  const validationSchema = Yup.object({
    showMKHidden: Yup.boolean(),
    showMapped: Yup.boolean(),
    showDiscontinued: Yup.boolean(),
  })

  const handleSubmit = async (values: any) => {
    setListingsFilter({
      marketplace: router.query.marketplace ? (router.query.marketplace as string) : '',
      filters: 'true',
      showMKHidden: values.showMKHidden,
      showMapped: values.showMapped,
      showDiscontinued: values.showDiscontinued,
      supplier: values.supplier,
      brand: values.brand,
      category: values.category,
    })
    setFilterOpen(false)
  }

  const handleClearFilters = (setValues: any) => {
    setListingsFilter({
      marketplace: router.query.marketplace ? (router.query.marketplace as string) : '',
      filters: 'false',
      showMKHidden: false,
      showMapped: false,
      showDiscontinued: false,
      supplier: 'All',
      brand: 'All',
      category: 'All',
    })
    setValues({
      showMKHidden: false,
      showMapped: false,
      showDiscontinued: false,
      supplier: 'All',
      brand: 'All',
      category: 'All',
    })
  }

  return (
    <Card className='mb-0' style={{ zIndex: '999' }}>
      <CardContent className='w-full'>
        <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={(values) => handleSubmit(values)}>
          {({ values, errors, touched, handleBlur, setFieldValue, setValues }) => (
            <Form>
              <div className='flex flex-wrap -mx-3 mt-2'>
                <div className='px-3 md:w-3/12'>
                  <div className='mb-3 createOrder_inputs'>
                    <Label htmlFor='lastNameinput' className='form-label'>
                      Suppliers
                    </Label>
                    <SimpleSelect
                      customStyle='sm'
                      selected={supplierOptionsList.find((option) => option.value === values.supplier) || { value: '', label: 'Select...' }}
                      handleSelect={(option: SelectSingleValueType) => {
                        setFieldValue('supplier', option!.value)
                      }}
                      options={supplierOptionsList}
                    />
                  </div>
                </div>
                <div className='px-3 md:w-3/12'>
                  <div className='mb-3 createOrder_inputs'>
                    <Label htmlFor='lastNameinput' className='form-label'>
                      Brands
                    </Label>
                    <SimpleSelect
                      customStyle='sm'
                      selected={brandOptionsList.find((option) => option.value === values.brand) || { value: '', label: 'Select...' }}
                      handleSelect={(option: SelectSingleValueType) => {
                        setFieldValue('brand', option!.value)
                      }}
                      options={brandOptionsList}
                    />
                  </div>
                </div>
                <div className='px-3 md:w-3/12'>
                  <div className='mb-3 createOrder_inputs'>
                    <Label htmlFor='lastNameinput' className='form-label'>
                      Categories
                    </Label>
                    <SimpleSelect
                      customStyle='sm'
                      selected={categoryOptionsList.find((option) => option.value === values.category) || { value: '', label: 'Select...' }}
                      handleSelect={(option: SelectSingleValueType) => {
                        setFieldValue('category', option!.value)
                      }}
                      options={categoryOptionsList}
                    />
                  </div>
                </div>
              </div>
              <div className='px-3 w-full flex flex-row flex-wrap justify-between items-center gap-4'>
                <div className='px-3 w-full md:w-7/12 flex flex-row flex-wrap justify-start items-center gap-6'>
                  <InputCheckFilter
                    inputLabel='Show Mapped'
                    inputName='showMapped'
                    value={values.showMapped || false}
                    isInvalid={touched.showMapped && errors.showMapped ? true : false}
                    handleChange={(checked: boolean) => {
                      setFieldValue('showMapped', checked)
                    }}
                    handleBlur={handleBlur}
                  />
                  <InputCheckFilter
                    inputLabel='Show Marketplace Hidden'
                    inputName='showMKHidden'
                    value={values.showMKHidden || false}
                    isInvalid={touched.showMKHidden && errors.showMKHidden ? true : false}
                    handleChange={(checked: boolean) => {
                      setFieldValue('showMKHidden', checked)
                    }}
                    handleBlur={handleBlur}
                  />
                  <InputCheckFilter
                    inputLabel='Show Discontinued'
                    inputName='showDiscontinued'
                    value={values.showDiscontinued || false}
                    isInvalid={touched.showDiscontinued && errors.showDiscontinued ? true : false}
                    handleChange={(checked: boolean) => {
                      setFieldValue('showDiscontinued', checked)
                    }}
                    handleBlur={handleBlur}
                  />
                </div>

                <div className='px-3 w-full md:w-4/12'>
                  <div className='flex flex-row justify-end items-center gap-4'>
                    <Button type='button' variant='light' className='text-[11.2px]' onClick={() => handleClearFilters(setValues)}>
                      Clear
                    </Button>
                    <Button type='submit' className='text-[11.2px]'>
                      Apply Filters
                    </Button>
                  </div>
                </div>
              </div>
            </Form>
          )}
        </Formik>
      </CardContent>
    </Card>
  )
}

export default memo(MKL_Filters)
