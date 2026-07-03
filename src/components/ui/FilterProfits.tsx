import { useRouter } from 'next/router'
import { useContext } from 'react'

import AppContext from '@context/AppContext'
import { Form, Formik } from 'formik'
import * as Yup from 'yup'

import { Button } from '@shadcn/ui/button'
import { Input } from '@shadcn/ui/input'
import { Label } from '@shadcn/ui/label'
import { InputGroup, InputGroupText } from '@/components/ui/InputGroup'
import { Switch } from '@/components/ui/Switch'

import SelectDropDown from './SelectDropDown'

type Props = {
  grossmin: string
  grossmax: string
  profitmin: string
  profitmax: string
  unitsmin: string
  unitsmax: string
  supplier: string
  brand: string
  category: string
  showWithSales: string
  supplierOptions: string[]
  brandOptions: string[]
  categoryOptions: string[]
  handleApplyFilters: (
    grossmin: string,
    grossmax: string,
    profitmin: string,
    profitmax: string,
    unitsmin: string,
    unitsmax: string,
    supplier: string,
    brand: string,
    category: string,
    showWithSales: string
  ) => void
  setFilterOpen: (value: boolean) => void
  destination: string
}

const FilterProfits = ({
  grossmin,
  grossmax,
  profitmin,
  profitmax,
  unitsmin,
  unitsmax,
  supplier,
  brand,
  category,
  showWithSales,
  supplierOptions,
  brandOptions,
  categoryOptions,
  handleApplyFilters,
  setFilterOpen,
  destination,
}: Props) => {
  const { state }: any = useContext(AppContext)
  const router = useRouter()

  const initialValues = {
    grossRevenueMin: grossmin,
    grossRevenueMax: grossmax,
    netProfitMin: profitmin,
    netProfitMax: profitmax,
    unitsSoldMin: unitsmin,
    unitsSoldMax: unitsmax,
    supplier: supplier,
    brand: brand,
    category: category,
    showWithSales: showWithSales,
  }

  const validationSchema = Yup.object({
    grossRevenueMin: Yup.number().min(0, 'Must be greater than 0'),
    grossRevenueMax: Yup.number().min(0, 'Must be greater than 0'),
  })

  const handleSubmit = async (values: any) => {
    handleApplyFilters(
      values.grossRevenueMin,
      values.grossRevenueMax,
      values.netProfitMin,
      values.netProfitMax,
      values.unitsSoldMin,
      values.unitsSoldMax,
      values.supplier,
      values.brand,
      values.category,
      values.showWithSales
    )
  }

  const handleClearFilters = (setValues: any) => {
    setValues({
      grossRevenueMin: '',
      grossRevenueMax: '',
      netProfitMin: '',
      netProfitMax: '',
      unitsSoldMin: '',
      unitsSoldMax: '',
      supplier: '',
      brand: '',
      category: '',
      showWithSales: 'true',
    })
    router.push(`/marketplaces/${destination}`, undefined, { shallow: true })
    setFilterOpen(false)
  }

  return (
    <div>
      <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={(values) => handleSubmit(values)}>
        {({ values, errors, touched, handleChange, handleBlur, setFieldValue, setValues }) => (
          <Form>
            <div className='flex flex-wrap -mx-3'>
              <div className='px-3 md:w-3/12'>
                <div className='mb-3 createOrder_inputs'>
                  <Label htmlFor='lastNameinput'>
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
                        value={values.grossRevenueMin || ''}
                        aria-invalid={(touched.grossRevenueMin && errors.grossRevenueMin ? true : false) || undefined}
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
                        value={values.grossRevenueMax || ''}
                        aria-invalid={(touched.grossRevenueMax && errors.grossRevenueMax ? true : false) || undefined}
                      />
                    </InputGroup>
                  </div>
                </div>
              </div>
              <div className='px-3 md:w-3/12'>
                <div className='mb-3 createOrder_inputs'>
                  <Label htmlFor='lastNameinput'>
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
                        value={values.netProfitMin || ''}
                        aria-invalid={(touched.netProfitMin && errors.netProfitMin ? true : false) || undefined}
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
                        value={values.netProfitMax || ''}
                        aria-invalid={(touched.netProfitMax && errors.netProfitMax ? true : false) || undefined}
                      />
                    </InputGroup>
                  </div>
                </div>
              </div>
              <div className='px-3 md:w-3/12'>
                <div className='mb-3 createOrder_inputs'>
                  <Label htmlFor='lastNameinput'>
                    Units Sold
                  </Label>
                  <div className='flex flex-row justify-between items-center gap-2'>
                    <Input
                      type='number'
                      className='text-[13px] m-0 h-8 text-xs'
                      style={{ padding: '0.2rem 0.9rem' }}
                      placeholder='Min'
                      id='unitsSoldMin'
                      name='unitsSoldMin'
                      min={0}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      value={values.unitsSoldMin || ''}
                      aria-invalid={(touched.unitsSoldMin && errors.unitsSoldMin ? true : false) || undefined}
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
                      value={values.unitsSoldMax || ''}
                      aria-invalid={(touched.unitsSoldMax && errors.unitsSoldMax ? true : false) || undefined}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className='flex flex-wrap -mx-3 mt-2'>
              <div className='px-3 md:w-3/12'>
                <div className='mb-3 createOrder_inputs'>
                  <Label htmlFor='lastNameinput'>
                    Suppliers
                  </Label>
                  <SelectDropDown formValue={'supplier'} selectionInfo={supplierOptions} selected={values.supplier} handleSelection={setFieldValue} />
                </div>
              </div>
              <div className='px-3 md:w-3/12'>
                <div className='mb-3 createOrder_inputs'>
                  <Label htmlFor='lastNameinput'>
                    Brands
                  </Label>
                  <SelectDropDown formValue={'brand'} selectionInfo={brandOptions} selected={values.brand} handleSelection={setFieldValue} />
                </div>
              </div>
              <div className='px-3 md:w-3/12'>
                <div className='mb-3 createOrder_inputs'>
                  <Label htmlFor='lastNameinput'>
                    Categories
                  </Label>
                  <SelectDropDown formValue={'category'} selectionInfo={categoryOptions} selected={values.category} handleSelection={setFieldValue} />
                </div>
              </div>
            </div>
            <div className='px-3 md:w-full flex flex-row justify-between items-center'>
              <div className='px-3 md:w-3/12'>
                <div className='flex flex-row justify-start items-center'>
                  <Label>Show products with NO Sales</Label>
                  <Switch
                    id='showWithSales'
                    name='showWithSales'
                    checked={values.showWithSales === 'true' ? true : false}
                    onChange={(e) => {
                      setFieldValue('showWithSales', `${e.target.checked}`)
                    }}
                    onBlur={handleBlur}
                  />
                </div>
              </div>
              <div className='flex flex-row justify-end items-center gap-3'>
                <Button type='button' variant='light' className='text-[13px]' onClick={() => handleClearFilters(setValues)}>
                  Clear
                </Button>
                <Button type='submit' className='text-[13px]'>
                  Apply Filters
                </Button>
              </div>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  )
}

export default FilterProfits
