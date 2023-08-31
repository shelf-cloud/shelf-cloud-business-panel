/* eslint-disable react-hooks/exhaustive-deps */
import React, { useContext, useEffect, useState } from 'react'
import { GetServerSideProps } from 'next'
import axios from 'axios'
import * as Yup from 'yup'
import { Field, FieldArray, Formik, Form } from 'formik'
import Head from 'next/head'
import { Button, Card, CardBody, Col, Container, FormFeedback, FormGroup, Input, Label, Row, Spinner } from 'reactstrap'
import BreadCrumb from '@components/Common/BreadCrumb'
import { getSession } from '@auth/client'
import AppContext from '@context/AppContext'
import useSWR, { useSWRConfig } from 'swr'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.min.css'
import router, { useRouter } from 'next/router'

export const getServerSideProps: GetServerSideProps<{}> = async (context) => {
  const session = await getSession(context)

  if (session == null) {
    return {
      redirect: {
        destination: '/api/auth/signin',
        permanent: false,
      },
    }
  }
  return {
    props: { session },
  }
}

type Props = {
  session: {
    user: {
      name: string
    }
  }
}

const CreateOrder = ({ session }: Props) => {
  const { push } = useRouter()
  const { state }: any = useContext(AppContext)
  const { mutate } = useSWRConfig()
  const title = `Add Product | ${session?.user?.name}`
  const orderNumberStart = `${session?.user?.name.substring(0, 3).toUpperCase()}-`
  const [ready, setReady] = useState(false)
  const [isPickUpOrder, setIsPickUpOrder] = useState(false)
  const [skus, setSkus] = useState([])
  const [skusTitles, setSkusTitles] = useState<any>({})
  const [skuQuantities, setSkuQuantities] = useState<any>({})
  const [validSkus, setValidSkus] = useState<string[]>([])
  const [inValidSkus, setInValidSkus] = useState<string[]>([])
  const [countries, setcountries] = useState([])
  const [validCountries, setValidCountries] = useState<string[]>([])
  const [creatingOrder, setCreatingOrder] = useState(false)

  useEffect(() => {
    if (!state.user[state.currentRegion]?.showCreateOrder) {
      push('/')
    }
  }, [])

  const fetcher = (endPoint: string) => axios(endPoint).then((res) => res.data)
  const { data } = useSWR(state.user.businessId ? `/api/getSkus?region=${state.currentRegion}&businessId=${state.user.businessId}` : null, fetcher)

  useEffect(() => {
    if (data?.error) {
      setValidCountries([])
      setValidSkus([])
      setInValidSkus([])
      setSkus([])
      setcountries([])
      setSkusTitles({})
      setSkuQuantities({})
      setReady(true)
      toast.error(data?.message)
    } else if (data) {
      setValidCountries(data.validCountries)
      setValidSkus(data.validSkus)
      setInValidSkus(data.invalidSkus)
      setSkus(data.skus)
      setcountries(data.countries)
      setSkusTitles(data.skuTitle)
      setSkuQuantities(data.skuQuantities)
      setReady(true)
    }
    return () => {
      setReady(false)
    }
  }, [data])

  const initialValues = {
    firstName: '',
    lastName: '',
    company: '',
    orderNumber: state.currentRegion == 'us' ? `00${state?.user?.orderNumber?.us}` : `00${state?.user?.orderNumber?.eu}`,
    adress1: '',
    adress2: '',
    city: '',
    state: '',
    zipCode: '',
    country: state.currentRegion == 'us' ? 'US' : 'ES',
    phoneNumber: '',
    email: '',
    amount: '0',
    shipping: '0',
    tax: '0',
    products: [
      {
        sku: '',
        title: '',
        qty: 1,
        price: '0',
      },
    ],
  }

  const validationSchema = Yup.object({
    firstName: Yup.string().min(3, 'First Name to short').max(100, 'First Name is to Long').required('Please Enter First Name'),
    lastName: Yup.string().min(3, 'Last Name to short').max(100, 'Last Name is to Long').required('Please Enter Last Name'),
    company: Yup.string().max(100, 'Company text is to Long'),
    orderNumber: Yup.string().max(50, 'Order Number is to Long').required('Required Order Number'),
    adress1: Yup.string().required('Required Adress'),
    adress2: Yup.string(),
    city: Yup.string().required('Required City'),
    state: Yup.string().required('Required State'),
    zipCode: Yup.string().required('Required Zip Code'),
    country: Yup.string().oneOf(validCountries, 'Must be a Valid Country Code').required('Required Country'),
    phoneNumber: state.currentRegion === 'us' ? Yup.string() : Yup.string().required('Required phone number'),
    email: state.currentRegion === 'us' ? Yup.string().email() : Yup.string().email().required('Required email'),
    amount: Yup.number().min(0, 'Amount must be greater than or equal to 0').required('Required Amount'),
    shipping: Yup.number().min(0, 'Shipping must be greater than or equal to 0.1').required('Required Shipping'),
    tax: Yup.number().min(0, 'Tax must be greater than or equal to 0').required('Required Tax'),
    products: Yup.array()
      .of(
        Yup.object({
          sku: Yup.string()
            .oneOf(validSkus, 'Invalid SKU or There`s No Stock Available')
            .notOneOf(inValidSkus, 'There`s no Stock for this SKU')
            .required('Required SKU'),
          title: Yup.string().max(100, 'Name is to Long').required('Required Name'),
          qty: Yup.number()
            .positive()
            .integer('Qty must be an integer')
            .min(1, 'Quantity must be greater than 0')
            .when('sku', (sku, schema) =>
              sku != '' ? schema.max(skuQuantities[sku], `Current SKU Stock is ${skuQuantities[sku] ? skuQuantities[sku] : 'unavailable'}`) : schema
            )
            .required('Required Quantity'),
          price: Yup.number().min(0, 'Price must be greater than or equal to 0').required('Required Price'),
        })
      )
      .required('Must have products'),
  })

  const handleSubmit = async (values: any, { resetForm }: any) => {
    setCreatingOrder(true)
    const response = await axios.post(`api/createNewOrder?region=${state.currentRegion}&businessId=${state.user.businessId}`, {
      orderInfo: values,
    })

    if (!response.data.error) {
      mutate('/api/getuser')
      toast.success(response.data.msg)
      resetForm()
      router.push('/Shipments')
      setCreatingOrder(false)
    } else {
      toast.error(response.data.msg)
      setCreatingOrder(false)
    }
  }

  const handlePickUpOrder = async (values: any, isPickUpOrder: boolean) => {
    if (isPickUpOrder) {
      values.adress1 = 'PickUp Order'
      values.adress2 = 'PickUp Order'
      values.city = 'PickUp Order'
      values.state = 'PickUp Order'
      values.country = state.currentRegion == 'us' ? 'US' : 'ES'
      values.zipCode = 'PickUp Order'
    } else {
      values.adress1 = ''
      values.adress2 = ''
      values.city = ''
      values.state = ''
      values.country = state.currentRegion == 'us' ? 'US' : 'ES'
      values.zipCode = ''
    }
    setIsPickUpOrder(isPickUpOrder)
  }

  return (
    <div>
      <Head>
        <title>{title}</title>
      </Head>
      <React.Fragment>
        <div className='page-content'>
          <Container fluid>
            <BreadCrumb title='Create Order' pageTitle='Shipments' />
            <Card className='fs-6'>
              <CardBody>
                {ready ? (
                  <Formik
                    initialValues={initialValues}
                    validationSchema={validationSchema}
                    onSubmit={(values, { resetForm }) => handleSubmit(values, { resetForm })}>
                    {({ values, errors, touched, handleChange, handleBlur }) => (
                      <Form>
                        <Row>
                          <div className='d-flex justify-content-end align-items-center'>
                            <div className='form-check form-check-inline form-switch form-switch-lg form-switch-warning mb-2 mb-md-0'>
                              <Label className='form-check-label' for='SwitchCheck4'>
                                Select for Local PickUp
                              </Label>
                              <Input
                                className='form-check-input'
                                type='checkbox'
                                role='switch'
                                id='SwitchCheck4'
                                onChange={async (e) => {
                                  await handlePickUpOrder(values, !isPickUpOrder)
                                  handleChange(e)
                                }}
                                defaultChecked={isPickUpOrder}
                              />
                            </div>
                          </div>
                        </Row>
                        <Row>
                          <Col md={4}>
                            <FormGroup className='createOrder_inputs'>
                              <Label htmlFor='firstNameinput' className='form-label mb-0'>
                                *First Name
                              </Label>
                              <Input
                                type='text'
                                className='form-control'
                                style={{ padding: '0.2rem 0.9rem' }}
                                placeholder='First Name...'
                                id='firstName'
                                name='firstName'
                                onChange={handleChange}
                                onBlur={handleBlur}
                                value={values.firstName || ''}
                                invalid={touched.firstName && errors.firstName ? true : false}
                              />
                              {touched.firstName && errors.firstName ? <FormFeedback type='invalid'>{errors.firstName}</FormFeedback> : null}
                            </FormGroup>
                          </Col>
                          <Col md={3}>
                            <FormGroup className='createOrder_inputs'>
                              <Label htmlFor='lastNameinput' className='form-label mb-0'>
                                *Last Name
                              </Label>
                              <Input
                                type='text'
                                className='form-control'
                                style={{ padding: '0.2rem 0.9rem' }}
                                placeholder='Last Name...'
                                id='lastName'
                                name='lastName'
                                onChange={handleChange}
                                onBlur={handleBlur}
                                value={values.lastName || ''}
                                invalid={touched.lastName && errors.lastName ? true : false}
                              />
                              {touched.lastName && errors.lastName ? <FormFeedback type='invalid'>{errors.lastName}</FormFeedback> : null}
                            </FormGroup>
                          </Col>
                          <Col md={5}>
                            <FormGroup className='createOrder_inputs'>
                              <Label htmlFor='lastNameinput' className='form-label mb-0'>
                                *Order Number
                              </Label>
                              <div className='input-group'>
                                <span className='input-group-text fw-semibold fs-5' style={{ padding: '0.2rem 0.9rem' }} id='basic-addon1'>
                                  {orderNumberStart}
                                </span>
                                <Input
                                  type='text'
                                  className='form-control'
                                  style={{ padding: '0.2rem 0.9rem' }}
                                  placeholder='Order Number...'
                                  aria-describedby='basic-addon1'
                                  id='orderNumber'
                                  name='orderNumber'
                                  onChange={handleChange}
                                  onBlur={handleBlur}
                                  value={values.orderNumber || ''}
                                  invalid={touched.orderNumber && errors.orderNumber ? true : false}
                                />
                                {touched.orderNumber && errors.orderNumber ? <FormFeedback type='invalid'>{errors.orderNumber}</FormFeedback> : null}
                              </div>
                            </FormGroup>
                          </Col>
                          <Col md={7}>
                            <FormGroup className='createOrder_inputs'>
                              <Label htmlFor='lastNameinput' className='form-label mb-0'>
                                Company
                              </Label>
                              <Input
                                type='text'
                                className='form-control'
                                style={{ padding: '0.2rem 0.9rem' }}
                                placeholder='Company...'
                                id='company'
                                name='company'
                                onChange={handleChange}
                                onBlur={handleBlur}
                                value={values.company || ''}
                                invalid={touched.company && errors.company ? true : false}
                              />
                              {touched.company && errors.company ? <FormFeedback type='invalid'>{errors.company}</FormFeedback> : null}
                            </FormGroup>
                          </Col>
                          <Col md={7}>
                            <FormGroup className='createOrder_inputs'>
                              <Label htmlFor='compnayNameinput' className='form-label mb-0'>
                                *Address 1
                              </Label>
                              <Input
                                type='text'
                                className='form-control'
                                style={{ padding: '0.2rem 0.9rem' }}
                                placeholder='Address...'
                                id='adress1'
                                name='adress1'
                                onChange={handleChange}
                                onBlur={handleBlur}
                                value={values.adress1 || ''}
                                invalid={touched.adress1 && errors.adress1 ? true : false}
                              />
                              {touched.adress1 && errors.adress1 ? <FormFeedback type='invalid'>{errors.adress1}</FormFeedback> : null}
                            </FormGroup>
                            <FormGroup className='createOrder_inputs mt-1'>
                              <Input
                                type='text'
                                className='form-control'
                                style={{ padding: '0.2rem 0.9rem' }}
                                placeholder='Address...'
                                id='adress2'
                                name='adress2'
                                onChange={handleChange}
                                onBlur={handleBlur}
                                value={values.adress2 || ''}
                                invalid={touched.adress2 && errors.adress2 ? true : false}
                              />
                              {touched.adress2 && errors.adress2 ? <FormFeedback type='invalid'>{errors.adress2}</FormFeedback> : null}
                            </FormGroup>
                            <Col md={12} className='d-flex justify-content-between w-100 gap-1'>
                              <Col md={3}>
                                <FormGroup className='createOrder_inputs'>
                                  <Label htmlFor='compnayNameinput' className='form-label mb-0'>
                                    *City
                                  </Label>
                                  <Input
                                    type='text'
                                    className='form-control'
                                    style={{ padding: '0.2rem 0.9rem' }}
                                    placeholder='City...'
                                    id='city'
                                    name='city'
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    value={values.city || ''}
                                    invalid={touched.city && errors.city ? true : false}
                                  />
                                  {touched.city && errors.city ? <FormFeedback type='invalid'>{errors.city}</FormFeedback> : null}
                                </FormGroup>
                              </Col>
                              <Col md={3}>
                                <FormGroup className='createOrder_inputs'>
                                  <Label htmlFor='compnayNameinput' className='form-label mb-0'>
                                    *State
                                  </Label>
                                  <Input
                                    type='text'
                                    className='form-control'
                                    style={{ padding: '0.2rem 0.9rem' }}
                                    placeholder='State...'
                                    id='state'
                                    name='state'
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    value={values.state || ''}
                                    invalid={touched.state && errors.state ? true : false}
                                  />
                                  {touched.state && errors.state ? <FormFeedback type='invalid'>{errors.state}</FormFeedback> : null}
                                </FormGroup>
                              </Col>
                              <Col md={2}>
                                <FormGroup className='createOrder_inputs'>
                                  <Label htmlFor='compnayNameinput' className='form-label mb-0'>
                                    *Zip Code
                                  </Label>
                                  <Input
                                    type='text'
                                    className='form-control'
                                    style={{ padding: '0.2rem 0.9rem' }}
                                    placeholder='Zip Code...'
                                    id='zipCode'
                                    name='zipCode'
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    value={values.zipCode || ''}
                                    invalid={touched.zipCode && errors.zipCode ? true : false}
                                  />
                                  {touched.zipCode && errors.zipCode ? <FormFeedback type='invalid'>{errors.zipCode}</FormFeedback> : null}
                                </FormGroup>
                              </Col>
                              <Col md={2}>
                                <FormGroup className='createOrder_inputs'>
                                  <Label htmlFor='compnayNameinput' className='form-label mb-0'>
                                    *Country
                                  </Label>
                                  <Input
                                    type='text'
                                    className='form-control'
                                    style={{ padding: '0.2rem 0.9rem' }}
                                    placeholder='Country...'
                                    id='country'
                                    list='countries'
                                    name='country'
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    value={values.country || ''}
                                    invalid={touched.country && errors.country ? true : false}
                                  />
                                  {touched.country && errors.country ? <FormFeedback type='invalid'>{errors.country}</FormFeedback> : null}
                                  <datalist id='countries'>
                                    {countries.map(
                                      (
                                        country: {
                                          name: string
                                          code: string
                                        },
                                        index
                                      ) => (
                                        <option key={`country${index}`} value={country.code}>
                                          {country.name} / {country.code}
                                        </option>
                                      )
                                    )}
                                  </datalist>
                                </FormGroup>
                              </Col>
                            </Col>
                            <FormGroup className='createOrder_inputs'>
                              <Label htmlFor='lastNameinput' className='form-label mb-0'>
                                Phone #
                              </Label>
                              <Input
                                type='text'
                                className='form-control'
                                style={{ padding: '0.2rem 0.9rem' }}
                                placeholder='Phone Number...'
                                id='phoneNumber'
                                name='phoneNumber'
                                onChange={handleChange}
                                onBlur={handleBlur}
                                value={values.phoneNumber || ''}
                                invalid={touched.phoneNumber && errors.phoneNumber ? true : false}
                              />
                              {touched.phoneNumber && errors.phoneNumber ? <FormFeedback type='invalid'>{errors.phoneNumber}</FormFeedback> : null}
                            </FormGroup>
                            <FormGroup className='createOrder_inputs'>
                              <Label htmlFor='lastNameinput' className='form-label mb-0'>
                                Email
                              </Label>
                              <Input
                                type='text'
                                className='form-control'
                                style={{ padding: '0.2rem 0.9rem' }}
                                placeholder='Email Address...'
                                id='email'
                                name='email'
                                onChange={handleChange}
                                onBlur={handleBlur}
                                value={values.email || ''}
                                invalid={touched.email && errors.email ? true : false}
                              />
                              {touched.email && errors.email ? <FormFeedback type='invalid'>{errors.email}</FormFeedback> : null}
                            </FormGroup>
                          </Col>
                          <Col md={5}>
                            <FormGroup className='createOrder_inputs'>
                              <Label htmlFor='lastNameinput' className='form-label'>
                                *Amount Paid
                              </Label>
                              <Input
                                type='text'
                                className='form-control'
                                style={{ padding: '0.2rem 0.9rem' }}
                                placeholder='Amount...'
                                id='amount'
                                name='amount'
                                onChange={handleChange}
                                onBlur={handleBlur}
                                value={values.amount || ''}
                                invalid={touched.amount && errors.amount ? true : false}
                              />
                              {touched.amount && errors.amount ? <FormFeedback type='invalid'>{errors.amount}</FormFeedback> : null}
                            </FormGroup>
                            <FormGroup className='createOrder_inputs'>
                              <Label htmlFor='lastNameinput' className='form-label'>
                                *Shipping Paid
                              </Label>
                              <Input
                                type='text'
                                className='form-control'
                                style={{ padding: '0.2rem 0.9rem' }}
                                placeholder='Shipping...'
                                id='shipping'
                                name='shipping'
                                onChange={handleChange}
                                onBlur={handleBlur}
                                value={values.shipping || ''}
                                invalid={touched.shipping && errors.shipping ? true : false}
                              />
                              {touched.shipping && errors.shipping ? <FormFeedback type='invalid'>{errors.shipping}</FormFeedback> : null}
                            </FormGroup>
                            <FormGroup className='createOrder_inputs'>
                              <Label htmlFor='lastNameinput' className='form-label'>
                                *Tax Paid
                              </Label>
                              <Input
                                type='text'
                                className='form-control'
                                style={{ padding: '0.2rem 0.9rem' }}
                                placeholder='Tax...'
                                id='tax'
                                name='tax'
                                onChange={handleChange}
                                onBlur={handleBlur}
                                value={values.tax || ''}
                                invalid={touched.tax && errors.tax ? true : false}
                              />
                              {touched.tax && errors.tax ? <FormFeedback type='invalid'>{errors.tax}</FormFeedback> : null}
                            </FormGroup>
                          </Col>
                          {/* <div className="border mt-3 border-dashed" /> */}
                          <Row>
                            {/* <h5 className="fs-5 m-0 mt-1 mb-1 fw-bolder mw-100">
                              Order Products
                            </h5> */}
                            <Col xl={12} className='p-0 mt-1'>
                              <table className='table table-hover table-centered align-middle'>
                                <thead>
                                  <tr>
                                    <th className='py-1 fs-6 m-0 fw-semibold text-center bg-primary text-white'></th>
                                    <th className='py-1 fs-6 m-0 fw-semibold text-center bg-primary text-white'>SKU</th>
                                    <th className='py-1 fs-6 m-0 fw-semibold text-center bg-primary text-white'>Title</th>
                                    <th className='py-1 fs-6 m-0 fw-semibold text-center bg-primary text-white'>Qty</th>
                                    <th className='py-1 fs-6 m-0 fw-semibold text-center bg-primary text-white'>Price</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  <FieldArray name='products'>
                                    {({ remove, push }) => (
                                      <>
                                        {values.products.map((_product, index) => (
                                          <tr key={index}>
                                            <td>
                                              {index > 0 ? (
                                                <Row className='d-flex flex-row flex-nowrap justify-content-center gap-2 align-items-center mb-0'>
                                                  <Button
                                                    type='button'
                                                    className='btn-icon btn-success'
                                                    onClick={() =>
                                                      push({
                                                        sku: '',
                                                        name: '',
                                                        qty: 1,
                                                        price: '0',
                                                      })
                                                    }>
                                                    <i className='fs-2 las la-plus-circle' />
                                                  </Button>
                                                  <Button type='button' className='btn-icon btn-danger' onClick={() => remove(index)}>
                                                    <i className='fs-2 las la-minus-circle' />
                                                  </Button>
                                                </Row>
                                              ) : (
                                                <Row className='d-flex flex-row flex-nowrap justify-content-center align-items-center mb-0'>
                                                  <Button
                                                    type='button'
                                                    className='btn-icon btn-success'
                                                    onClick={() =>
                                                      push({
                                                        sku: '',
                                                        name: '',
                                                        qty: 1,
                                                        price: '0',
                                                      })
                                                    }>
                                                    <i className='fs-2 las la-plus-circle' />
                                                  </Button>
                                                </Row>
                                              )}
                                            </td>
                                            <td>
                                              <Field name={`products.${index}.sku`}>
                                                {({ meta }: any) => (
                                                  <FormGroup className='createOrder_inputs'>
                                                    <Input
                                                      type='text'
                                                      className='form-select'
                                                      style={{
                                                        padding: '0.2rem 0.9rem',
                                                      }}
                                                      name={`products.${index}.sku`}
                                                      list='skuList'
                                                      placeholder='Sku...'
                                                      onChange={(e: any) => {
                                                        handleChange(e)
                                                        e.target.value == ''
                                                          ? (values.products[index].title = '')
                                                          : (values.products[index].title = skusTitles[e.target.value])
                                                      }}
                                                      // onChange={(e) => handleChangeInSKU(e.target.value, values, index)}
                                                      onBlur={handleBlur}
                                                      value={values.products[index].sku || ''}
                                                      invalid={meta.touched && meta.error ? true : false}
                                                    />
                                                    {meta.touched && meta.error ? <FormFeedback type='invalid'>{meta.error}</FormFeedback> : null}
                                                  </FormGroup>
                                                )}
                                              </Field>
                                              <datalist id='skuList'>
                                                {skus.map(
                                                  (
                                                    skus: {
                                                      sku: string
                                                      name: string
                                                    },
                                                    index
                                                  ) => (
                                                    <option key={`sku${index}`} value={skus.sku}>
                                                      {skus.sku} / {skus.name}
                                                    </option>
                                                  )
                                                )}
                                              </datalist>
                                            </td>
                                            <td>
                                              <Field name={`products.${index}.title`}>
                                                {({ meta }: any) => (
                                                  <FormGroup className='createOrder_inputs'>
                                                    <Input
                                                      type='text'
                                                      className='form-control'
                                                      style={{
                                                        padding: '0.2rem 0.9rem',
                                                      }}
                                                      name={`products.${index}.title`}
                                                      placeholder='Title...'
                                                      list='skuNames'
                                                      onChange={handleChange}
                                                      onBlur={handleBlur}
                                                      value={values.products[index].title || ''}
                                                      invalid={meta.touched && meta.error ? true : false}
                                                    />
                                                    {meta.touched && meta.error ? <FormFeedback type='invalid'>{meta.error}</FormFeedback> : null}
                                                  </FormGroup>
                                                )}
                                              </Field>
                                              <datalist id='skuNames'>
                                                {skus.map(
                                                  (
                                                    skus: {
                                                      name: string
                                                    },
                                                    index
                                                  ) => (
                                                    <option key={`skuName${index}`} value={skus.name} />
                                                  )
                                                )}
                                              </datalist>
                                            </td>
                                            <td>
                                              <Field name={`products.${index}.qty`}>
                                                {({ meta }: any) => (
                                                  <FormGroup className='createOrder_inputs'>
                                                    <Input
                                                      type='text'
                                                      className='form-control'
                                                      style={{
                                                        padding: '0.2rem 0.9rem',
                                                      }}
                                                      name={`products.${index}.qty`}
                                                      max={skuQuantities[values.products[index].sku]}
                                                      placeholder='Qty...'
                                                      onChange={handleChange}
                                                      onBlur={handleBlur}
                                                      value={values.products[index].qty || ''}
                                                      invalid={meta.touched && meta.error ? true : false}
                                                    />
                                                    {meta.touched && meta.error ? <FormFeedback type='invalid'>{meta.error}</FormFeedback> : null}
                                                  </FormGroup>
                                                )}
                                              </Field>
                                            </td>
                                            <td>
                                              <Field name={`products.${index}.price`}>
                                                {({ meta }: any) => (
                                                  <FormGroup className='createOrder_inputs'>
                                                    <Input
                                                      type='text'
                                                      className='form-control'
                                                      style={{
                                                        padding: '0.2rem 0.9rem',
                                                      }}
                                                      name={`products.${index}.price`}
                                                      placeholder='Price...'
                                                      onChange={handleChange}
                                                      onBlur={handleBlur}
                                                      value={values.products[index].price || ''}
                                                      invalid={meta.touched && meta.error ? true : false}
                                                    />
                                                    {meta.touched && meta.error ? <FormFeedback type='invalid'>{meta.error}</FormFeedback> : null}
                                                  </FormGroup>
                                                )}
                                              </Field>
                                            </td>
                                          </tr>
                                        ))}
                                      </>
                                    )}
                                  </FieldArray>
                                </tbody>
                              </table>
                            </Col>
                          </Row>
                          <h5 className='fs-14 mb-0 text-muted'>
                            *You must complete all required fields or you will not be able to create your product.
                          </h5>
                          <Col md={12}>
                            <div className='text-end'>
                              <Button type='submit' disabled={creatingOrder} className='fs-5 btn bg-primary'>
                                {creatingOrder ? <Spinner /> : 'Create Order'}
                              </Button>
                            </div>
                          </Col>
                        </Row>
                      </Form>
                    )}
                  </Formik>
                ) : (
                  <Row>
                    <h5>Loading...</h5>
                  </Row>
                )}
              </CardBody>
            </Card>
          </Container>
        </div>
      </React.Fragment>
    </div>
  )
}

export default CreateOrder
