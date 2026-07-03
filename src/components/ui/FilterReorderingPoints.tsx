import { useRouter } from 'next/router'
import { memo, useContext } from 'react'

import SimpleSelect, { SelectSingleValueType } from '@components/Common/SimpleSelect'
import AppContext from '@context/AppContext'
import { Form, Formik } from 'formik'
import * as Yup from 'yup'

import { Button } from '@shadcn/ui/button'
import { Card, CardContent } from '@shadcn/ui/card'
import { Input } from '@shadcn/ui/input'
import { InputGroup, InputGroupText } from '@/components/ui/InputGroup'
import { Label } from '@shadcn/ui/label'
import { Switch } from '@/components/ui/Switch'

import SelectDropDown from './SelectDropDown'
import SelectMultipleDropDown from './SelectMultipleDropDown'

type Props = {
  urgency: string
  grossmin: string
  grossmax: string
  profitmin: string
  profitmax: string
  unitsrange: string
  unitsmin: string
  unitsmax: string
  supplier: string
  brand: string
  category: string
  trendTag: string
  ai_urgency: string
  showHidden: string
  // show0Days: string
  supplierOptions: string[]
  brandOptions: string[]
  categoryOptions: string[]
  handleApplyFilters: (
    urgency: string,
    grossmin: string,
    grossmax: string,
    profitmin: string,
    profitmax: string,
    unitsrange: string,
    unitsmin: string,
    unitsmax: string,
    supplier: string,
    brand: string,
    category: string,
    trendTag: string,
    ai_urgency: string,
    showHidden: string
    // show0Days: string
  ) => void
  setFilterOpen: (value: boolean) => void
}

const URGENCY_STATES = {
  '3': { label: 'High Alert', icon: 'mdi mdi-alert-octagon', color: 'text-destructive' },
  '2': { label: 'Medium Alert', icon: 'mdi mdi-alert-octagon', color: 'text-warning' },
  '1': { label: 'Low Alert', icon: 'mdi mdi-alert-octagon', color: 'text-info' },
  '0': { label: 'No Alert', icon: 'mdi mdi-alert-octagon', color: 'text-success' },
}

const AI_URGENCY_STATES = {
  high: { label: 'High', icon: 'mdi mdi-alert-octagon', color: 'text-destructive' },
  medium: { label: 'Medium', icon: 'mdi mdi-alert-octagon', color: 'text-warning' },
  low: { label: 'Low', icon: 'mdi mdi-alert-octagon', color: 'text-info' },
  none: { label: 'None', icon: 'mdi mdi-alert-octagon', color: 'text-success' },
}

const UNITS_DAYS_RANGES = {
  '30D': { label: '30 Days', value: '30D' },
  '60D': { label: '60 Days', value: '60D' },
  '90D': { label: '90 Days', value: '90D' },
  '120D': { label: '120 Days', value: '120D' },
  '180D': { label: '180 Days', value: '180D' },
  '365D': { label: '365 Days', value: '365D' },
}

const TREND_TAGS = ['Normal', 'Low Sales', 'Seasonal']

const FilterReorderingPoints = ({
  urgency,
  grossmin,
  grossmax,
  profitmin,
  profitmax,
  unitsrange,
  unitsmin,
  unitsmax,
  supplier,
  brand,
  category,
  trendTag,
  ai_urgency,
  showHidden,
  // show0Days,
  supplierOptions,
  brandOptions,
  categoryOptions,
  handleApplyFilters,
  setFilterOpen,
}: Props) => {
  const { state }: any = useContext(AppContext)
  const router = useRouter()

  const initialValues = {
    urgency: urgency,
    grossRevenueMin: grossmin,
    grossRevenueMax: grossmax,
    netProfitMin: profitmin,
    netProfitMax: profitmax,
    unitsRange: unitsrange,
    unitsSoldMin: unitsmin,
    unitsSoldMax: unitsmax,
    supplier: supplier,
    brand: brand,
    category: category,
    trendTag: trendTag,
    ai_urgency: ai_urgency,
    showHidden: showHidden,
    // show0Days: show0Days,
  }

  const validationSchema = Yup.object({
    grossRevenueMin: Yup.number().min(0, 'Must be greater than 0'),
    grossRevenueMax: Yup.number().min(0, 'Must be greater than 0'),
  })

  const handleSubmit = async (values: any) => {
    handleApplyFilters(
      values.urgency,
      values.grossRevenueMin,
      values.grossRevenueMax,
      values.netProfitMin,
      values.netProfitMax,
      values.unitsRange,
      values.unitsSoldMin,
      values.unitsSoldMax,
      values.supplier,
      values.brand,
      values.category,
      values.trendTag,
      values.ai_urgency,
      values.showHidden
      // values.show0Days
    )
  }

  const handleClearFilters = (setValues: any) => {
    setValues({
      urgency: '[]',
      grossRevenueMin: '',
      grossRevenueMax: '',
      netProfitMin: '',
      netProfitMax: '',
      unitsrange: '',
      unitsSoldMin: '',
      unitsSoldMax: '',
      supplier: '',
      brand: '',
      category: '',
      trendTag: '',
      ai_urgency: '',
      showHidden: '',
      // show0Days: '',
    })
    router.push('/reorderingPoints', undefined, { shallow: true })
    setFilterOpen(false)
  }

  return (
    <Card className='mb-0' style={{ zIndex: '999' }}>
      <CardContent className='w-full'>
        <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={(values) => handleSubmit(values)}>
          {({ values, errors, touched, handleChange, handleBlur, setFieldValue, setValues }) => (
            <Form>
              <div className='flex flex-wrap -mx-3'>
                <div className='px-3 w-full md:w-2/12'>
                  <div className='mb-3 createOrder_inputs'>
                    <Label htmlFor='lastNameinput' className='mb-2'>
                      Urgency
                    </Label>
                    <SelectMultipleDropDown formValue={'urgency'} selectionInfo={URGENCY_STATES} selected={values.urgency} handleSelection={setFieldValue} />
                  </div>
                </div>
                <div className='px-3 w-full md:w-3/12'>
                  <div className='mb-3 createOrder_inputs'>
                    <Label htmlFor='lastNameinput' className='mb-2'>
                      Gross Revenue
                    </Label>
                    <div className='flex flex-row justify-between items-center gap-2'>
                      <InputGroup size='sm'>
                        <InputGroupText className='text-[16.25px] py-0'>{state.currentRegion === 'us' ? '$' : '€'}</InputGroupText>
                        <Input
                          type='number'
                          className='text-[13px] m-0 h-8 text-xs'
                          style={{ padding: '0.2rem 0.9rem' }}
                          placeholder='Min'
                          id='grossRevenueMin'
                          name='grossRevenueMin'
                          min={0}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          value={values.grossRevenueMin}
                          aria-invalid={touched.grossRevenueMin && errors.grossRevenueMin ? true : undefined}
                        />
                      </InputGroup>
                      <InputGroup size='sm'>
                        <InputGroupText className='text-[16.25px] py-0'>{state.currentRegion === 'us' ? '$' : '€'}</InputGroupText>
                        <Input
                          type='number'
                          className='text-[13px] m-0 h-8 text-xs'
                          style={{ padding: '0.2rem 0.9rem' }}
                          placeholder='Max'
                          id='grossRevenueMax'
                          name='grossRevenueMax'
                          min={values.grossRevenueMin}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          value={values.grossRevenueMax}
                          aria-invalid={touched.grossRevenueMax && errors.grossRevenueMax ? true : undefined}
                        />
                      </InputGroup>
                    </div>
                  </div>
                </div>
                <div className='px-3 w-full md:w-3/12'>
                  <div className='mb-3 createOrder_inputs'>
                    <Label htmlFor='lastNameinput' className='mb-2'>
                      Net Profit
                    </Label>
                    <div className='flex flex-row justify-between items-center gap-2'>
                      <InputGroup size='sm'>
                        <InputGroupText className='text-[16.25px] py-0'>{state.currentRegion === 'us' ? '$' : '€'}</InputGroupText>
                        <Input
                          type='number'
                          className='text-[13px] m-0 h-8 text-xs'
                          style={{ padding: '0.2rem 0.9rem' }}
                          placeholder='Min'
                          id='netProfitMin'
                          name='netProfitMin'
                          min={0}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          value={values.netProfitMin}
                          aria-invalid={touched.netProfitMin && errors.netProfitMin ? true : undefined}
                        />
                      </InputGroup>
                      <InputGroup size='sm'>
                        <InputGroupText className='text-[16.25px] py-0'>{state.currentRegion === 'us' ? '$' : '€'}</InputGroupText>
                        <Input
                          type='number'
                          className='text-[13px] m-0 h-8 text-xs'
                          style={{ padding: '0.2rem 0.9rem' }}
                          placeholder='Max'
                          id='netProfitMax'
                          name='netProfitMax'
                          min={values.grossRevenueMin}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          value={values.netProfitMax}
                          aria-invalid={touched.netProfitMax && errors.netProfitMax ? true : undefined}
                        />
                      </InputGroup>
                    </div>
                  </div>
                </div>
                <div className='px-3 w-full md:w-4/12'>
                  <div className='mb-3 createOrder_inputs'>
                    <Label htmlFor='lastNameinput' className='mb-2'>
                      Units Sold
                    </Label>
                    <div className='flex flex-row justify-between items-center gap-2'>
                      <div className='px-3 w-4/12'>
                        <SimpleSelect
                          selected={UNITS_DAYS_RANGES[values.unitsRange as keyof typeof UNITS_DAYS_RANGES]}
                          handleSelect={(option: SelectSingleValueType) => {
                            handleChange({ target: { name: 'unitsRange', value: option!.value } })
                          }}
                          customStyle='sm'
                          options={Object.values(UNITS_DAYS_RANGES)}
                        />
                      </div>
                      <Input
                        type='number'
                        className='h-8 text-xs m-0'
                        style={{ padding: '0.2rem 0.9rem' }}
                        placeholder='Min'
                        id='unitsSoldMin'
                        name='unitsSoldMin'
                        min={0}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        value={values.unitsSoldMin}
                        aria-invalid={touched.unitsSoldMin && errors.unitsSoldMin ? true : undefined}
                      />
                      <Input
                        type='number'
                        className='text-[13px] m-0 h-8 text-xs'
                        style={{ padding: '0.2rem 0.9rem' }}
                        placeholder='Max'
                        id='unitsSoldMax'
                        name='unitsSoldMax'
                        min={values.grossRevenueMin}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        value={values.unitsSoldMax}
                        aria-invalid={touched.unitsSoldMax && errors.unitsSoldMax ? true : undefined}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className='flex flex-wrap -mx-3 mt-2'>
                <div className='px-3 md:w-3/12'>
                  <div className='mb-3 createOrder_inputs'>
                    <Label htmlFor='supplier' className='mb-2'>
                      Suppliers
                    </Label>
                    <SelectDropDown formValue={'supplier'} selectionInfo={supplierOptions} selected={values.supplier} handleSelection={setFieldValue} />
                  </div>
                </div>
                <div className='px-3 md:w-3/12'>
                  <div className='mb-3 createOrder_inputs'>
                    <Label htmlFor='brand' className='mb-2'>
                      Brands
                    </Label>
                    <SelectDropDown formValue={'brand'} selectionInfo={brandOptions} selected={values.brand} handleSelection={setFieldValue} />
                  </div>
                </div>
                <div className='px-3 md:w-3/12'>
                  <div className='mb-3 createOrder_inputs'>
                    <Label htmlFor='category' className='mb-2'>
                      Categories
                    </Label>
                    <SelectDropDown formValue={'category'} selectionInfo={categoryOptions} selected={values.category} handleSelection={setFieldValue} />
                  </div>
                </div>
                <div className='px-3 md:w-3/12'>
                  <div className='mb-3 createOrder_inputs'>
                    <Label htmlFor='trendTag' className='mb-2'>
                      Trend Tag
                    </Label>
                    <SelectDropDown formValue={'trendTag'} selectionInfo={TREND_TAGS} selected={values.trendTag} handleSelection={setFieldValue} />
                  </div>
                </div>
              </div>
              <div className='px-3 md:w-full flex flex-row flex-wrap justify-between items-center gap-4 mt-2'>
                <div className='px-3 w-full md:w-7/12 flex flex-row flex-wrap justify-start items-center gap-6'>
                  <div className='px-3 w-full md:w-3/12'>
                    <div className='mb-3 createOrder_inputs'>
                      <Label htmlFor='lastNameinput' className='mb-2'>
                        AI Urgency
                      </Label>
                      <SelectMultipleDropDown formValue={'ai_urgency'} selectionInfo={AI_URGENCY_STATES} selected={values.ai_urgency} handleSelection={setFieldValue} />
                    </div>
                  </div>
                  <div className='flex flex-row justify-start items-center'>
                    <Label className='mb-2'>Show hidden products</Label>
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
                </div>
                <div className='px-3 w-full md:w-4/12'>
                  <div className='flex flex-row justify-end items-center gap-4'>
                    <Button type='button' variant='light' className='text-[13px]' onClick={() => handleClearFilters(setValues)}>
                      Clear
                    </Button>
                    <Button type='submit' className='text-[13px] bg-primary'>
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

export default memo(FilterReorderingPoints)
