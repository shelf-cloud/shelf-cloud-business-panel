import { useRouter } from 'next/router'
import { memo } from 'react'

import SimpleSelect, { SelectSingleValueType } from '@components/Common/SimpleSelect'
import InputCheckFilter from '@components/ui/filters/InputCheckFilter'
import { useMarketplaceListingsQueries } from '@hooks/products/useMarketplaceListingsQuery'
import { Form, Formik } from 'formik'
import { Button, Card, CardBody, Col, FormGroup, Label, Row } from 'reactstrap'
import * as Yup from 'yup'

type Props = {
  supplierOptions: string[]
  brandOptions: string[]
  categoryOptions: string[]
  setFilterOpen: (value: boolean) => void
}

const MKL_Filters = ({ supplierOptions, brandOptions, categoryOptions, setFilterOpen }: Props) => {
  const { listingsFilter, setListingsFilter } = useMarketplaceListingsQueries()
  const { showHidden, supplier, brand, category } = listingsFilter
  const supplierOptionsList = supplierOptions.map((option) => ({ value: option, label: option }))
  const brandOptionsList = brandOptions.map((option) => ({ value: option, label: option }))
  const categoryOptionsList = categoryOptions.map((option) => ({ value: option, label: option }))

  const router = useRouter()

  const initialValues = {
    showHidden: showHidden,
    supplier: supplier,
    brand: brand,
    category: category,
  }

  const validationSchema = Yup.object({
    showHidden: Yup.boolean(),
  })

  const handleSubmit = async (values: any) => {
    setListingsFilter({
      marketplace: router.query.marketplace ? (router.query.marketplace as string) : '',
      filters: 'true',
      showHidden: values.showHidden,
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
      showHidden: false,
      supplier: 'All',
      brand: 'All',
      category: 'All',
    })
    setValues({
      showHidden: false,
      supplier: 'All',
      brand: 'All',
      category: 'All',
    })
  }

  return (
    <Card className='mb-0' style={{ zIndex: '999' }}>
      <CardBody className='w-100'>
        <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={(values) => handleSubmit(values)}>
          {({ values, errors, touched, handleBlur, setFieldValue, setValues }) => (
            <Form>
              <Row className='mt-2'>
                <Col md={3}>
                  <FormGroup className='createOrder_inputs'>
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
                      handleSelect={(option: SelectSingleValueType) => {
                        setFieldValue('brand', option!.value)
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
                      handleSelect={(option: SelectSingleValueType) => {
                        setFieldValue('category', option!.value)
                      }}
                      options={categoryOptionsList}
                    />
                  </FormGroup>
                </Col>
              </Row>
              <Col md={12} className='d-flex flex-row flex-wrap justify-content-between align-items-center gap-3'>
                <Col xs={12} md={7} className='d-flex flex-row flex-wrap justify-content-start align-items-center gap-4'>
                  <InputCheckFilter
                    inputLabel='Show Hidden Listings'
                    inputName='showHidden'
                    value={values.showHidden || false}
                    isInvalid={touched.showHidden && errors.showHidden ? true : false}
                    handleChange={(checked: boolean) => {
                      setFieldValue('showHidden', checked)
                    }}
                    handleBlur={handleBlur}
                  />
                </Col>

                <Col xs={12} md={4}>
                  <div className='d-flex flewx-row justify-content-end align-items-center gap-3'>
                    <Button type='button' color='light' className='fs-7' onClick={() => handleClearFilters(setValues)}>
                      Clear
                    </Button>
                    <Button type='submit' className='fs-7' color='primary'>
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

export default memo(MKL_Filters)
