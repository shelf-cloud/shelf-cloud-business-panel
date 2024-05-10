import React, { useContext } from 'react'
import { Button, Col, FormGroup, Input, InputGroup, InputGroupText, Label, Row } from 'reactstrap'
import * as Yup from 'yup'
import { Formik, Form } from 'formik'
import AppContext from '@context/AppContext'
import SelectDropDown from './SelectDropDown'
import SelectMultipleDropDown from './SelectMultipleDropDown'
import { useRouter } from 'next/router'

type Props = {
  urgency: string
  grossmin: string
  grossmax: string
  profitmin: string
  profitmax: string
  unitsmin: string
  unitsmax: string
  supplier: string
  brand: string
  category: string
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
    unitsmin: string,
    unitsmax: string,
    supplier: string,
    brand: string,
    category: string,
    showHidden: string,
    // show0Days: string
  ) => void
  setFilterOpen: (value: boolean) => void
}

const URGENCY_STATES = {
  '3': { label: 'High Alert', icon: 'mdi mdi-alert-octagon', color: 'text-danger' },
  '2': { label: 'Medium Alert', icon: 'mdi mdi-alert-octagon', color: 'text-warning' },
  '1': { label: 'Low Alert', icon: 'mdi mdi-alert-octagon', color: 'text-info' },
  '0': { label: 'No Alert', icon: 'mdi mdi-alert-octagon', color: 'text-success' },
}

const FilterReorderingPoints = ({
  urgency,
  grossmin,
  grossmax,
  profitmin,
  profitmax,
  unitsmin,
  unitsmax,
  supplier,
  brand,
  category,
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
    unitsSoldMin: unitsmin,
    unitsSoldMax: unitsmax,
    supplier: supplier,
    brand: brand,
    category: category,
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
      values.unitsSoldMin,
      values.unitsSoldMax,
      values.supplier,
      values.brand,
      values.category,
      values.showHidden,
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
      unitsSoldMin: '',
      unitsSoldMax: '',
      supplier: '',
      brand: '',
      category: '',
      showHidden: '',
      // show0Days: '',
    })
    router.push('/reorderingPoints', undefined, { shallow: true })
    setFilterOpen(false)
  }

  return (
    <div>
      <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={(values) => handleSubmit(values)}>
        {({ values, errors, touched, handleChange, handleBlur, setFieldValue, setValues }) => (
          <Form>
            <Row>
              <Col xs={12} md={2}>
                <FormGroup className='createOrder_inputs'>
                  <Label htmlFor='lastNameinput' className='form-label'>
                    Urgency
                  </Label>
                  <SelectMultipleDropDown formValue={'urgency'} selectionInfo={URGENCY_STATES} selected={values.urgency} handleSelection={setFieldValue} />
                </FormGroup>
              </Col>
              <Col xs={12} md={3}>
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
              <Col xs={12} md={3}>
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
              <Col xs={12} md={3}>
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
            </Row>
            <Row className='mt-2'>
              <Col md={3}>
                <FormGroup className='createOrder_inputs'>
                  <Label htmlFor='lastNameinput' className='form-label'>
                    Suppliers
                  </Label>
                  <SelectDropDown formValue={'supplier'} selectionInfo={supplierOptions} selected={values.supplier} handleSelection={setFieldValue} />
                </FormGroup>
              </Col>
              <Col md={3}>
                <FormGroup className='createOrder_inputs'>
                  <Label htmlFor='lastNameinput' className='form-label'>
                    Brands
                  </Label>
                  <SelectDropDown formValue={'brand'} selectionInfo={brandOptions} selected={values.brand} handleSelection={setFieldValue} />
                </FormGroup>
              </Col>
              <Col md={3}>
                <FormGroup className='createOrder_inputs'>
                  <Label htmlFor='lastNameinput' className='form-label'>
                    Categories
                  </Label>
                  <SelectDropDown formValue={'category'} selectionInfo={categoryOptions} selected={values.category} handleSelection={setFieldValue} />
                </FormGroup>
              </Col>
            </Row>
            <Col md={12} className='d-flex flex-row flex-wrap justify-content-between align-items-center gap-3'>
              <Col xs={12} md={7} className='d-flex flex-row flex-wrap justify-content-start align-items-center gap-4'>
                <div className='form-check form-switch form-switch-right form-switch-md d-flex flex-row justify-content-start align-items-center'>
                  <Label className='form-label'>Show hidden products</Label>
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
                {/* <div className='form-check form-switch form-switch-right form-switch-md d-flex flex-row justify-content-start align-items-center'>
                  <Label className='form-label'>Show 0 days Remaining</Label>
                  <Input
                    className='form-check-input code-switcher'
                    type='checkbox'
                    id='show0Days'
                    name='show0Days'
                    checked={values.show0Days === 'true' ? true : false}
                    onChange={(e) => {
                      setFieldValue('show0Days', `${e.target.checked}`)
                    }}
                    onBlur={handleBlur}
                    invalid={touched.show0Days && errors.show0Days ? true : false}
                  />
                </div> */}
              </Col>
              <Col xs={12} md={4}>
                <div className='d-flex flewx-row justify-content-end align-items-center gap-3'>
                  <Button type='button' color='light' className='fs-6 btn' onClick={() => handleClearFilters(setValues)}>
                    Clear
                  </Button>
                  <Button type='submit' className='fs-6 btn bg-primary'>
                    Apply Filters
                  </Button>
                </div>
              </Col>
            </Col>
          </Form>
        )}
      </Formik>
    </div>
  )
}

export default FilterReorderingPoints
