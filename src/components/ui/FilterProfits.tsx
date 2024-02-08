import React, { useContext } from 'react'
import { Button, Col, FormGroup, Input, InputGroup, InputGroupText, Label, Row } from 'reactstrap'
import * as Yup from 'yup'
import { Formik, Form } from 'formik'
import AppContext from '@context/AppContext'
import SelectDropDown from './SelectDropDown'
import { useRouter } from 'next/router'

type Props = {
  grossmin: string
  grossmax: string
  profitmin: string
  profitmax: string
  unitsmin: string
  unitsmax: string
  supplier: string
  showWithSales: string
  supplierOptions: string[]
  handleApplyFilters: (
    grossmin: string,
    grossmax: string,
    profitmin: string,
    profitmax: string,
    unitsmin: string,
    unitsmax: string,
    supplier: string,
    showWithSales: string
  ) => void
  setFilterOpen: (value: boolean) => void
}

const FilterProfits = ({ grossmin, grossmax, profitmin, profitmax, unitsmin, unitsmax, supplier, showWithSales, supplierOptions, handleApplyFilters, setFilterOpen }: Props) => {
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
    showWithSales: showWithSales,
  }

  const validationSchema = Yup.object({
    grossRevenueMin: Yup.number().min(0, 'Must be greater than 0'),
    grossRevenueMax: Yup.number().min(0, 'Must be greater than 0'),
  })

  const handleSubmit = async (values: any) => {
    console.log('values', values)
    handleApplyFilters(
      values.grossRevenueMin,
      values.grossRevenueMax,
      values.netProfitMin,
      values.netProfitMax,
      values.unitsSoldMin,
      values.unitsSoldMax,
      values.supplier,
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
      showWithSales: '',
    })
    router.push('/marketplaces/productPerformance', undefined, { shallow: true })
    setFilterOpen(false)
  }

  return (
    <div>
      <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={(values) => handleSubmit(values)}>
        {({ values, errors, touched, handleChange, handleBlur, setFieldValue, setValues }) => (
          <Form>
            <Row>
              <Col md={3}>
                <FormGroup className='createOrder_inputs'>
                  <Label htmlFor='lastNameinput' className='form-label'>
                    Gross Revenue
                  </Label>
                  <div className='d-flex flex-row justify-content-between align-items-center gap-2'>
                    <InputGroup size='sm'>
                      <InputGroupText className='fs-5 py-0'>{state.currentRegion === 'us' ? '$' : '€'}</InputGroupText>
                      <Input
                        type='number'
                        className='form-control fs-6 m-0'
                        bsSize='sm'
                        style={{ padding: '0.2rem 0.9rem' }}
                        placeholder='Min'
                        id='grossRevenueMin'
                        name='grossRevenueMin'
                        min={0}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        value={values.grossRevenueMin || ''}
                        invalid={touched.grossRevenueMin && errors.grossRevenueMin ? true : false}
                      />
                    </InputGroup>
                    <InputGroup size='sm'>
                      <InputGroupText className='fs-5 py-0'>{state.currentRegion === 'us' ? '$' : '€'}</InputGroupText>
                      <Input
                        type='number'
                        className='form-control fs-6 m-0'
                        bsSize='sm'
                        style={{ padding: '0.2rem 0.9rem' }}
                        placeholder='Max'
                        id='grossRevenueMax'
                        name='grossRevenueMax'
                        min={values.grossRevenueMin}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        value={values.grossRevenueMax || ''}
                        invalid={touched.grossRevenueMax && errors.grossRevenueMax ? true : false}
                      />
                    </InputGroup>
                  </div>
                </FormGroup>
              </Col>
              <Col md={3}>
                <FormGroup className='createOrder_inputs'>
                  <Label htmlFor='lastNameinput' className='form-label'>
                    Net Profit
                  </Label>
                  <div className='d-flex flex-row justify-content-between align-items-center gap-2'>
                    <InputGroup size='sm'>
                      <InputGroupText className='fs-5 py-0'>{state.currentRegion === 'us' ? '$' : '€'}</InputGroupText>
                      <Input
                        type='number'
                        className='form-control fs-6 m-0'
                        bsSize='sm'
                        style={{ padding: '0.2rem 0.9rem' }}
                        placeholder='Min'
                        id='netProfitMin'
                        name='netProfitMin'
                        min={0}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        value={values.netProfitMin || ''}
                        invalid={touched.netProfitMin && errors.netProfitMin ? true : false}
                      />
                    </InputGroup>
                    <InputGroup size='sm'>
                      <InputGroupText className='fs-5 py-0'>{state.currentRegion === 'us' ? '$' : '€'}</InputGroupText>
                      <Input
                        type='number'
                        className='form-control fs-6 m-0'
                        bsSize='sm'
                        style={{ padding: '0.2rem 0.9rem' }}
                        placeholder='Max'
                        id='netProfitMax'
                        name='netProfitMax'
                        min={values.grossRevenueMin}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        value={values.netProfitMax || ''}
                        invalid={touched.netProfitMax && errors.netProfitMax ? true : false}
                      />
                    </InputGroup>
                  </div>
                </FormGroup>
              </Col>
              <Col md={3}>
                <FormGroup className='createOrder_inputs'>
                  <Label htmlFor='lastNameinput' className='form-label'>
                    Units Sold
                  </Label>
                  <div className='d-flex flex-row justify-content-between align-items-center gap-2'>
                    <Input
                      type='number'
                      className='form-control fs-6 m-0'
                      bsSize='sm'
                      style={{ padding: '0.2rem 0.9rem' }}
                      placeholder='Min'
                      id='unitsSoldMin'
                      name='unitsSoldMin'
                      min={0}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      value={values.unitsSoldMin || ''}
                      invalid={touched.unitsSoldMin && errors.unitsSoldMin ? true : false}
                    />
                    <Input
                      type='number'
                      className='form-control fs-6 m-0'
                      bsSize='sm'
                      style={{ padding: '0.2rem 0.9rem' }}
                      placeholder='Max'
                      id='unitsSoldMax'
                      name='unitsSoldMax'
                      min={values.grossRevenueMin}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      value={values.unitsSoldMax || ''}
                      invalid={touched.unitsSoldMax && errors.unitsSoldMax ? true : false}
                    />
                  </div>
                </FormGroup>
              </Col>
              <Col md={3}>
                <FormGroup className='createOrder_inputs'>
                  <Label htmlFor='lastNameinput' className='form-label'>
                    Suppliers
                  </Label>
                  <SelectDropDown selectionInfo={supplierOptions} selected={values.supplier} handleSelection={setFieldValue} />
                </FormGroup>
              </Col>
            </Row>
            <Row>
              <Col md={3}>
                <div className='form-check form-switch form-switch-right form-switch-md'>
                  <Label className='form-label'>Show products with NO Sales</Label>
                  <Input
                    className='form-check-input code-switcher'
                    type='checkbox'
                    id='showWithSales'
                    name='showWithSales'
                    checked={values.showWithSales === 'true' ? true : false}
                    onChange={(e) => {
                      setFieldValue('showWithSales', `${e.target.checked}`)
                    }}
                    onBlur={handleBlur}
                    invalid={touched.showWithSales && errors.showWithSales ? true : false}
                  />
                </div>
              </Col>
            </Row>
            <Col md={12} className='mt-4'>
              <div className='d-flex flewx-row justify-content-end align-items-center gap-3'>
                <Button type='button' color='light' className='fs-6 btn' onClick={() => handleClearFilters(setValues)}>
                  Clear
                </Button>
                <Button type='submit' className='fs-6 btn bg-primary'>
                  Apply Filters
                </Button>
              </div>
            </Col>
          </Form>
        )}
      </Formik>
    </div>
  )
}

export default FilterProfits
