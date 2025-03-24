import React, { memo } from 'react'
import { Button, Card, CardBody, Col, FormFeedback, FormGroup, Label, Row } from 'reactstrap'
import * as Yup from 'yup'
import { Formik, Form } from 'formik'
import { useRouter } from 'next/router'
import { COMPARE_NUMBER_OPERATORS } from '@components/ui/filters/constants'
import SimpleSelect, { SelectOptionType } from '@components/Common/SimpleSelect'
import InputNumberFilter from '@components/ui/filters/InputNumberFilter'
import InputCheckFilter from '@components/ui/filters/InputCheckFilter'
import InputPercentageFilter from '@components/ui/filters/InputPercentageFilter'

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
      <CardBody className='w-100'>
        <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={(values) => handleSubmit(values)}>
          {({ values, errors, touched, handleChange, handleBlur, setFieldValue, setValues }) => (
            <Form>
              <Row>
                <Col xs={12} md={3}>
                  <FormGroup className='createOrder_inputs'>
                    <Label htmlFor='lastNameinput' className='form-label'>
                      Units Sold 1 Month
                    </Label>
                    <div className='d-flex flex-row justify-content-between align-items-end gap-2'>
                      <InputNumberFilter
                        inputName='units1monthmin'
                        value={values.units1monthmin}
                        isInvalid={touched.units1monthmin && errors.units1monthmin ? true : false}
                        handleChange={handleChange}
                        handleBlur={handleBlur}
                        placeholder='Units Sold'
                      />
                      <span className='fs-7 text-muted p-0 m-0'>min</span>
                      <InputNumberFilter
                        inputName='units1monthmax'
                        value={values.units1monthmax}
                        isInvalid={touched.units1monthmax && errors.units1monthmax ? true : false}
                        handleChange={handleChange}
                        handleBlur={handleBlur}
                        placeholder='Units Sold'
                      />
                      <span className='fs-7 text-muted p-0 m-0'>max</span>
                    </div>
                    {touched.units1monthmin && errors.units1monthmin ? <FormFeedback type='invalid'>{errors.units1monthmin}</FormFeedback> : null}
                    {touched.units1monthmax && errors.units1monthmax ? <FormFeedback type='invalid'>{errors.units1monthmax}</FormFeedback> : null}
                  </FormGroup>
                </Col>
                <Col xs={12} md={3}>
                  <FormGroup className='createOrder_inputs'>
                    <Label htmlFor='lastNameinput' className='form-label'>
                      Units Sold 1 Year
                    </Label>
                    <div className='d-flex flex-row justify-content-between align-items-end gap-2'>
                      <InputNumberFilter inputName='units1yearmin' value={values.units1yearmin} isInvalid={touched.units1yearmin && errors.units1yearmin ? true : false} handleChange={handleChange} handleBlur={handleBlur} placeholder='Units Sold' />
                      <span className='fs-7 text-muted p-0 m-0'>min</span>
                      <InputNumberFilter inputName='units1yearmax' value={values.units1yearmax} isInvalid={touched.units1yearmax && errors.units1yearmax ? true : false} handleChange={handleChange} handleBlur={handleBlur} placeholder='Units Sold' />
                      <span className='fs-7 text-muted p-0 m-0'>max</span>
                    </div>
                    {touched.units1yearmin && errors.units1yearmin ? <FormFeedback type='invalid'>{errors.units1yearmin}</FormFeedback> : null}
                    {touched.units1yearmax && errors.units1yearmax ? <FormFeedback type='invalid'>{errors.units1yearmax}</FormFeedback> : null}
                  </FormGroup>
                </Col>
                {activeTab === 'byMarketplace' && (
                  <Col xs={12} md={5}>
                    <FormGroup className='createOrder_inputs'>
                      <Label htmlFor='lastNameinput' className='form-label'>
                        Margin
                      </Label>
                      <div className='d-grid gap-2' style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(0, 1fr))' }}>
                        <SimpleSelect
                          customStyle='sm'
                          placeholder='Select'
                          selected={COMPARE_NUMBER_OPERATORS.find((option) => option.value === values.marginoperator) || { value: '', label: 'Select...' }}
                          handleSelect={(option: SelectOptionType) => {
                            setFieldValue('marginoperator', option.value)
                          }}
                          options={COMPARE_NUMBER_OPERATORS}
                        />
                        <InputPercentageFilter inputName='margin' value={values.margin} isInvalid={touched.margin && errors.margin ? true : false} handleChange={handleChange} handleBlur={handleBlur} error={errors.margin} />
                      </div>
                      {errors.marginoperator ? <p className='m-0 p-0 mt-1 fs-7 text-danger'>{errors.marginoperator}</p> : null}
                    </FormGroup>
                  </Col>
                )}
              </Row>
              <Row className='mt-2'>
                <Col md={3}>
                  <FormGroup className='createOrder_inputs'>
                    <Label htmlFor='lastNameinput' className='form-label'>
                      Suppliers
                    </Label>
                    <SimpleSelect
                      customStyle='sm'
                      selected={supplierOptionsList.find((option) => option.value === values.supplier) || { value: '', label: 'Select...' }}
                      handleSelect={(option: SelectOptionType) => {
                        setFieldValue('supplier', option.value)
                      }}
                      options={supplierOptionsList}
                    />
                  </FormGroup>
                </Col>
                <Col md={3}>
                  <FormGroup className='createOrder_inputs'>
                    <Label htmlFor='lastNameinput' className='form-label'>
                      Brands
                    </Label>
                    <SimpleSelect
                      customStyle='sm'
                      selected={brandOptionsList.find((option) => option.value === values.brand) || { value: '', label: 'Select...' }}
                      handleSelect={(option: SelectOptionType) => {
                        setFieldValue('brand', option.value)
                      }}
                      options={brandOptionsList}
                    />
                  </FormGroup>
                </Col>
                <Col md={3}>
                  <FormGroup className='createOrder_inputs'>
                    <Label htmlFor='lastNameinput' className='form-label'>
                      Categories
                    </Label>
                    <SimpleSelect
                      customStyle='sm'
                      selected={categoryOptionsList.find((option) => option.value === values.category) || { value: '', label: 'Select...' }}
                      handleSelect={(option: SelectOptionType) => {
                        setFieldValue('category', option.value)
                      }}
                      options={categoryOptionsList}
                    />
                  </FormGroup>
                </Col>
              </Row>
              <Col md={12} className='d-flex flex-row flex-wrap justify-content-between align-items-center gap-3'>
                {activeTab === 'byMarketplace' ? (
                  <Col xs={12} md={7} className='d-flex flex-row flex-wrap justify-content-start align-items-center gap-4'>
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
                  </Col>
                ) : (
                  <div></div>
                )}
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
      </CardBody>
    </Card>
  )
}

export default memo(MKP_Filters)
