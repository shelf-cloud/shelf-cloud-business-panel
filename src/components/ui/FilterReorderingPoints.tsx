import { useRouter } from 'next/router'
import { memo, useContext } from 'react'

import SimpleSelect, { SelectSingleValueType } from '@components/Common/SimpleSelect'
import AppContext from '@context/AppContext'
import { Form, Formik } from 'formik'
import * as Yup from 'yup'

import { Button, Card, CardBody, Col, FormGroup, Input, InputGroup, InputGroupText, Label, Row, Switch } from '@/components/migration-ui'

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
  '3': { label: 'High Alert', icon: 'mdi mdi-alert-octagon', color: 'text-danger' },
  '2': { label: 'Medium Alert', icon: 'mdi mdi-alert-octagon', color: 'text-warning' },
  '1': { label: 'Low Alert', icon: 'mdi mdi-alert-octagon', color: 'text-info' },
  '0': { label: 'No Alert', icon: 'mdi mdi-alert-octagon', color: 'text-success' },
}

const AI_URGENCY_STATES = {
  high: { label: 'High', icon: 'mdi mdi-alert-octagon', color: 'text-danger' },
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
    <Card className='tw:mb-0' style={{ zIndex: '999' }}>
      <CardBody className='tw:w-full'>
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
                    <div className='tw:flex tw:flex-row tw:justify-between tw:items-center tw:gap-2'>
                      <InputGroup size='sm'>
                        <InputGroupText className='tw:text-[16.25px] tw:py-0'>{state.currentRegion === 'us' ? '$' : '€'}</InputGroupText>
                        <Input
                          type='number'
                          className='form-control tw:text-[13px] tw:m-0'
                          bsSize='sm'
                          style={{ padding: '0.2rem 0.9rem' }}
                          placeholder='Min'
                          id='grossRevenueMin'
                          name='grossRevenueMin'
                          min={0}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          value={values.grossRevenueMin}
                          invalid={touched.grossRevenueMin && errors.grossRevenueMin ? true : false}
                        />
                      </InputGroup>
                      <InputGroup size='sm'>
                        <InputGroupText className='tw:text-[16.25px] tw:py-0'>{state.currentRegion === 'us' ? '$' : '€'}</InputGroupText>
                        <Input
                          type='number'
                          className='form-control tw:text-[13px] tw:m-0'
                          bsSize='sm'
                          style={{ padding: '0.2rem 0.9rem' }}
                          placeholder='Max'
                          id='grossRevenueMax'
                          name='grossRevenueMax'
                          min={values.grossRevenueMin}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          value={values.grossRevenueMax}
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
                    <div className='tw:flex tw:flex-row tw:justify-between tw:items-center tw:gap-2'>
                      <InputGroup size='sm'>
                        <InputGroupText className='tw:text-[16.25px] tw:py-0'>{state.currentRegion === 'us' ? '$' : '€'}</InputGroupText>
                        <Input
                          type='number'
                          className='form-control tw:text-[13px] tw:m-0'
                          bsSize='sm'
                          style={{ padding: '0.2rem 0.9rem' }}
                          placeholder='Min'
                          id='netProfitMin'
                          name='netProfitMin'
                          min={0}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          value={values.netProfitMin}
                          invalid={touched.netProfitMin && errors.netProfitMin ? true : false}
                        />
                      </InputGroup>
                      <InputGroup size='sm'>
                        <InputGroupText className='tw:text-[16.25px] tw:py-0'>{state.currentRegion === 'us' ? '$' : '€'}</InputGroupText>
                        <Input
                          type='number'
                          className='form-control tw:text-[13px] tw:m-0'
                          bsSize='sm'
                          style={{ padding: '0.2rem 0.9rem' }}
                          placeholder='Max'
                          id='netProfitMax'
                          name='netProfitMax'
                          min={values.grossRevenueMin}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          value={values.netProfitMax}
                          invalid={touched.netProfitMax && errors.netProfitMax ? true : false}
                        />
                      </InputGroup>
                    </div>
                  </FormGroup>
                </Col>
                <Col xs={12} md={4}>
                  <FormGroup className='createOrder_inputs'>
                    <Label htmlFor='lastNameinput' className='form-label'>
                      Units Sold
                    </Label>
                    <div className='tw:flex tw:flex-row tw:justify-between tw:items-center tw:gap-2'>
                      <Col xs={4}>
                        <SimpleSelect
                          selected={UNITS_DAYS_RANGES[values.unitsRange as keyof typeof UNITS_DAYS_RANGES]}
                          handleSelect={(option: SelectSingleValueType) => {
                            handleChange({ target: { name: 'unitsRange', value: option!.value } })
                          }}
                          customStyle='sm'
                          options={Object.values(UNITS_DAYS_RANGES)}
                        />
                      </Col>
                      <Input
                        type='number'
                        className='form-control tw:text-[13px] tw:m-0'
                        bsSize='sm'
                        style={{ padding: '0.2rem 0.9rem' }}
                        placeholder='Min'
                        id='unitsSoldMin'
                        name='unitsSoldMin'
                        min={0}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        value={values.unitsSoldMin}
                        invalid={touched.unitsSoldMin && errors.unitsSoldMin ? true : false}
                      />
                      <Input
                        type='number'
                        className='form-control tw:text-[13px] tw:m-0'
                        bsSize='sm'
                        style={{ padding: '0.2rem 0.9rem' }}
                        placeholder='Max'
                        id='unitsSoldMax'
                        name='unitsSoldMax'
                        min={values.grossRevenueMin}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        value={values.unitsSoldMax}
                        invalid={touched.unitsSoldMax && errors.unitsSoldMax ? true : false}
                      />
                    </div>
                  </FormGroup>
                </Col>
              </Row>
              <Row className='tw:mt-2'>
                <Col md={3}>
                  <FormGroup className='createOrder_inputs'>
                    <Label htmlFor='supplier' className='form-label'>
                      Suppliers
                    </Label>
                    <SelectDropDown formValue={'supplier'} selectionInfo={supplierOptions} selected={values.supplier} handleSelection={setFieldValue} />
                  </FormGroup>
                </Col>
                <Col md={3}>
                  <FormGroup className='createOrder_inputs'>
                    <Label htmlFor='brand' className='form-label'>
                      Brands
                    </Label>
                    <SelectDropDown formValue={'brand'} selectionInfo={brandOptions} selected={values.brand} handleSelection={setFieldValue} />
                  </FormGroup>
                </Col>
                <Col md={3}>
                  <FormGroup className='createOrder_inputs'>
                    <Label htmlFor='category' className='form-label'>
                      Categories
                    </Label>
                    <SelectDropDown formValue={'category'} selectionInfo={categoryOptions} selected={values.category} handleSelection={setFieldValue} />
                  </FormGroup>
                </Col>
                <Col md={3}>
                  <FormGroup className='createOrder_inputs'>
                    <Label htmlFor='trendTag' className='form-label'>
                      Trend Tag
                    </Label>
                    <SelectDropDown formValue={'trendTag'} selectionInfo={TREND_TAGS} selected={values.trendTag} handleSelection={setFieldValue} />
                  </FormGroup>
                </Col>
              </Row>
              <Col md={12} className='tw:flex tw:flex-row tw:flex-wrap tw:justify-between tw:items-center tw:gap-4 tw:mt-2'>
                <Col xs={12} md={7} className='tw:flex tw:flex-row tw:flex-wrap tw:justify-start tw:items-center tw:gap-6'>
                  <Col xs={12} md={3}>
                    <FormGroup className='createOrder_inputs'>
                      <Label htmlFor='lastNameinput' className='form-label'>
                        AI Urgency
                      </Label>
                      <SelectMultipleDropDown formValue={'ai_urgency'} selectionInfo={AI_URGENCY_STATES} selected={values.ai_urgency} handleSelection={setFieldValue} />
                    </FormGroup>
                  </Col>
                  <div className='form-check form-switch form-switch-right form-switch-md tw:flex tw:flex-row tw:justify-start tw:items-center'>
                    <Label className='form-label'>Show hidden products</Label>
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
                </Col>
                <Col xs={12} md={4}>
                  <div className='tw:flex tw:flex-row tw:justify-end tw:items-center tw:gap-4'>
                    <Button type='button' color='light' className='tw:text-[13px]' onClick={() => handleClearFilters(setValues)}>
                      Clear
                    </Button>
                    <Button type='submit' className='tw:text-[13px] tw:bg-primary'>
                      Apply Filters
                    </Button>
                  </div>
                </Col>
              </Col>
            </Form>
          )}
        </Formik>
      </CardBody>
    </Card>
  )
}

export default memo(FilterReorderingPoints)
