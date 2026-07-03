import { useRouter } from 'next/router'
import { memo } from 'react'

import SimpleSelect, { SelectSingleValueType } from '@components/Common/SimpleSelect'
import InputCheckFilter from '@components/ui/filters/InputCheckFilter'
import InputNumberFilter from '@components/ui/filters/InputNumberFilter'
import InputPercentageFilter from '@components/ui/filters/InputPercentageFilter'
import { COMPARE_NUMBER_OPERATORS } from '@components/ui/filters/constants'
import { Form, Formik } from 'formik'
import { Button } from '@shadcn/ui/button'
import { Card, CardContent } from '@shadcn/ui/card'
import { Label } from '@shadcn/ui/label'
import * as Yup from 'yup'

export type MKP_FiltersType = {
  units1monthmin: string
  units1monthmax: string
  units1yearmin: string
  units1yearmax: string
  margin: string
  marginoperator: string
  showOnlyOnWatch: boolean
  supplier: string
  brand: string
  category: string
}

type Props = {
  filters: MKP_FiltersType
  supplierOptions: string[]
  brandOptions: string[]
  categoryOptions: string[]
  handleApplyFilters: (filters: MKP_FiltersType) => void
  setFilterOpen: (value: boolean) => void
  activeTab: string
}

const MKP_Filters = ({ filters, supplierOptions, brandOptions, categoryOptions, handleApplyFilters, setFilterOpen, activeTab }: Props) => {
  const { units1monthmin, units1monthmax, units1yearmin, units1yearmax, margin, marginoperator, showOnlyOnWatch, supplier, brand, category } = filters

  const supplierOptionsList = supplierOptions.map((option) => ({ value: option, label: option }))
  const brandOptionsList = brandOptions.map((option) => ({ value: option, label: option }))
  const categoryOptionsList = categoryOptions.map((option) => ({ value: option, label: option }))

  const router = useRouter()

  const initialValues = {
    units1monthmin: units1monthmin,
    units1monthmax: units1monthmax,
    units1yearmin: units1yearmin,
    units1yearmax: units1yearmax,
    margin: margin,
    marginoperator: marginoperator,
    showOnlyOnWatch: showOnlyOnWatch,
    supplier: supplier,
    brand: brand,
    category: category,
  }

  const validationSchema = Yup.object({
    units1monthmin: Yup.number().min(0, 'Must be greater than 0'),
    units1monthmax: Yup.number().min(0, 'Must be greater than 0'),
    units1yearmin: Yup.number().min(0, 'Must be greater than 0'),
    units1yearmax: Yup.number().min(0, 'Must be greater than 0'),
    margin: Yup.number().when('marginoperator', {
      is: (val: string) => val !== '' && val !== undefined,
      then: Yup.number().min(0, 'Must be greater than 0').required('Margin is required when margin operator is selected'),
      otherwise: Yup.number().notRequired(),
    }),
    marginoperator: Yup.lazy(() =>
      Yup.string().when(['margin'], {
        is: (val: number) => val >= 0 && val !== undefined,
        then: Yup.string().required('Margin operator is required when margin is greater than or equal to 0'),
        otherwise: Yup.string(),
      })
    ),
    showOnlyOnWatch: Yup.boolean(),
  })

  const handleSubmit = async (values: any) => {
    handleApplyFilters({ ...values })
  }

  const handleClearFilters = (setValues: any) => {
    setValues({
      units1monthmin: '',
      units1monthmax: '',
      units1yearmin: '',
      units1yearmax: '',
      margin: '',
      marginoperator: '',
      showOnlyOnWatch: '',
      supplier: '',
      brand: '',
      category: '',
    })
    router.push('/marketplaces/marketplacePricing', undefined, { shallow: true })
    setFilterOpen(false)
  }

  return (
    <Card className='mb-0' style={{ zIndex: '999' }}>
      <CardContent className='w-full'>
        <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={(values) => handleSubmit(values)}>
          {({ values, errors, touched, handleChange, handleBlur, setFieldValue, setValues }) => (
            <Form>
              <div className='flex flex-wrap -mx-3'>
                <div className='px-3 w-full md:w-3/12'>
                  <div className='mb-3 createOrder_inputs'>
                    <Label htmlFor='lastNameinput' className='mb-2'>
                      Units Sold 1 Month
                    </Label>
                    <div className='flex flex-row justify-between items-end gap-1'>
                      <InputNumberFilter
                        inputName='units1monthmin'
                        value={values.units1monthmin}
                        isInvalid={touched.units1monthmin && errors.units1monthmin ? true : false}
                        handleChange={handleChange}
                        handleBlur={handleBlur}
                        placeholder='Units Sold'
                      />
                      <span className='text-[11.2px] text-muted-foreground p-0 m-0'>min</span>
                      <InputNumberFilter
                        inputName='units1monthmax'
                        value={values.units1monthmax}
                        isInvalid={touched.units1monthmax && errors.units1monthmax ? true : false}
                        handleChange={handleChange}
                        handleBlur={handleBlur}
                        placeholder='Units Sold'
                      />
                      <span className='text-[11.2px] text-muted-foreground p-0 m-0'>max</span>
                    </div>
                    {touched.units1monthmin && errors.units1monthmin ? <div className='text-sm text-destructive'>{errors.units1monthmin}</div> : null}
                    {touched.units1monthmax && errors.units1monthmax ? <div className='text-sm text-destructive'>{errors.units1monthmax}</div> : null}
                  </div>
                </div>
                <div className='px-3 w-full md:w-3/12'>
                  <div className='mb-3 createOrder_inputs'>
                    <Label htmlFor='lastNameinput' className='mb-2'>
                      Units Sold 1 Year
                    </Label>
                    <div className='flex flex-row justify-between items-end gap-1'>
                      <InputNumberFilter
                        inputName='units1yearmin'
                        value={values.units1yearmin}
                        isInvalid={touched.units1yearmin && errors.units1yearmin ? true : false}
                        handleChange={handleChange}
                        handleBlur={handleBlur}
                        placeholder='Units Sold'
                      />
                      <span className='text-[11.2px] text-muted-foreground p-0 m-0'>min</span>
                      <InputNumberFilter
                        inputName='units1yearmax'
                        value={values.units1yearmax}
                        isInvalid={touched.units1yearmax && errors.units1yearmax ? true : false}
                        handleChange={handleChange}
                        handleBlur={handleBlur}
                        placeholder='Units Sold'
                      />
                      <span className='text-[11.2px] text-muted-foreground p-0 m-0'>max</span>
                    </div>
                    {touched.units1yearmin && errors.units1yearmin ? <div className='text-sm text-destructive'>{errors.units1yearmin}</div> : null}
                    {touched.units1yearmax && errors.units1yearmax ? <div className='text-sm text-destructive'>{errors.units1yearmax}</div> : null}
                  </div>
                </div>
                {activeTab === 'byMarketplace' && (
                  <div className='px-3 w-full md:w-5/12'>
                    <div className='mb-3 createOrder_inputs'>
                      <Label htmlFor='lastNameinput' className='mb-2'>
                        Margin
                      </Label>
                      <div className='grid gap-2' style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(0, 1fr))' }}>
                        <SimpleSelect
                          customStyle='sm'
                          placeholder='Select'
                          selected={COMPARE_NUMBER_OPERATORS.find((option) => option.value === values.marginoperator) || { value: '', label: 'Select...' }}
                          handleSelect={(option: SelectSingleValueType) => {
                            setFieldValue('marginoperator', option!.value)
                          }}
                          options={COMPARE_NUMBER_OPERATORS}
                        />
                        <InputPercentageFilter
                          inputName='margin'
                          value={values.margin}
                          isInvalid={touched.margin && errors.margin ? true : false}
                          handleChange={handleChange}
                          handleBlur={handleBlur}
                          error={errors.margin}
                        />
                      </div>
                      {errors.marginoperator ? <p className='m-0 p-0 mt-1 text-[11.2px] text-danger'>{errors.marginoperator}</p> : null}
                    </div>
                  </div>
                )}
              </div>
              <div className='flex flex-wrap -mx-3 mt-2'>
                <div className='px-3 md:w-3/12'>
                  <div className='mb-3 createOrder_inputs'>
                    <Label htmlFor='lastNameinput' className='mb-2'>
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
                    <Label htmlFor='lastNameinput' className='mb-2'>
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
                    <Label htmlFor='lastNameinput' className='mb-2'>
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
                {activeTab === 'byMarketplace' ? (
                  <div className='px-3 w-full md:w-7/12 flex flex-row flex-wrap justify-start items-center gap-6'>
                    <InputCheckFilter
                      inputLabel='Show only On Watch Products'
                      inputName='showOnlyOnWatch'
                      value={values.showOnlyOnWatch || false}
                      isInvalid={touched.showOnlyOnWatch && errors.showOnlyOnWatch ? true : false}
                      handleChange={(checked: boolean) => {
                        setFieldValue('showOnlyOnWatch', checked)
                      }}
                      handleBlur={handleBlur}
                    />
                  </div>
                ) : (
                  <div></div>
                )}
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

export default memo(MKP_Filters)
