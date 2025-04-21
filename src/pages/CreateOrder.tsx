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
import router from 'next/router'
import { DebounceInput } from 'react-debounce-input'
import SimpleSelect, { SelectOptionType } from '@components/Common/SimpleSelect'
import ErrorInputLabel from '@components/ui/forms/ErrorInputLabel'
import { FormatCurrency, FormatIntNumber } from '@lib/FormatNumbers'
import { Session } from 'next-auth'

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

type OrderType = {
  firstName: string
  lastName: string
  company: string
  orderNumber: string
  adress1: string
  adress2: string
  city: string
  state: string
  zipCode: string
  country: string
  phoneNumber: string
  email: string
  amount: string
  shipping: string
  tax: string
  products: {
    sku: string
    title: string
    qty: number
    price: string
  }[]
}

type SkuExceedsAvailability = {
  sku: string
  availableQty: number
  orderedQty: number
}

type StateListType = {
  [key: string]: SelectOptionType[]
}

type Props = {
  session: Session
}

declare module 'yup' {
  // tslint:disable-next-line
  interface ArraySchema<T> {
    unique(mapper: (a: T) => T, message?: any): ArraySchema<T>
  }
}

const fetcher = (endPoint: string) => axios(endPoint).then((res) => res.data)

const CreateOrder = ({ session }: Props) => {
  const title = `Create Order | ${session?.user?.businessName}`
  const { state } = useContext(AppContext)
  const { mutate } = useSWRConfig()
  // const userRegion = state.user[state.currentRegion as keyof UserType] as RegionInfoTypeUS
  const orderNumberStart = `${session?.user?.businessOrderStart.substring(0, 3).toUpperCase()}-`
  const [ready, setReady] = useState(false)
  const [isPickUpOrder, setIsPickUpOrder] = useState(false)
  const [skus, setSkus] = useState([])
  const [skusTitles, setSkusTitles] = useState<any>({})
  const [skuQuantities, setSkuQuantities] = useState<any>({})
  const [validSkus, setValidSkus] = useState<string[]>([])
  const [inValidSkus, setInValidSkus] = useState<string[]>([])
  const [countries, setcountries] = useState<SelectOptionType[]>([])
  const [stateList, setStateList] = useState<StateListType>({})
  const [validCountries, setValidCountries] = useState<string[]>([])
  const [creatingOrder, setCreatingOrder] = useState(false)
  const [autoCompleteAddress, setAutoCompleteAddress] = useState([])
  const [skuExceededAvailability, setskuExceededAvailability] = useState<SkuExceedsAvailability>({
    sku: '',
    availableQty: 0,
    orderedQty: 0,
  })

  const { data } = useSWR(state.user.businessId ? `/api/getSkus?region=${state.currentRegion}&businessId=${state.user.businessId}` : null, fetcher, { revalidateOnMount: true })

  useEffect(() => {
    if (data?.error) {
      setValidCountries([])
      setValidSkus([])
      setInValidSkus([])
      setSkus([])
      setcountries([])
      setStateList({})
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
      setStateList(data.states)
      setSkusTitles(data.skuTitle)
      setSkuQuantities(data.skuQuantities)
      setReady(true)
    }
    return () => {
      setReady(false)
    }
  }, [data])

  const initialValues: OrderType = {
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
    email: session.user.email || '',
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

  Yup.addMethod(Yup.array, 'unique', function (mapper: any, message: any) {
    return this.test('unique', message, function (list: any) {
      return list.length === new Set(list.map(mapper)).size
    })
  })

  const validationSchema = Yup.object({
    firstName: Yup.string().min(3, 'First Name to short').max(100, 'First Name is to Long').required('Please Enter First Name'),
    lastName: Yup.string().min(3, 'Last Name to short').max(100, 'Last Name is to Long').required('Please Enter Last Name'),
    company: Yup.string().max(100, 'Company text is to Long'),
    orderNumber: Yup.string()
      .matches(/^[a-zA-Z0-9-]+$/, `Invalid special characters: % & # " ' @ ~ , ... Nor White Spaces`)
      .max(50, 'Order Number is to Long')
      .required('Required Order Number'),
    adress1: Yup.string().required('Required Adress'),
    adress2: Yup.string(),
    city: Yup.string().required('Required City'),
    state: Yup.string().required('Required State'),
    zipCode: Yup.string().required('Required Zip Code'),
    country: Yup.string().oneOf(validCountries, 'Must be a Valid Country Code').required('Required Country'),
    phoneNumber: state.currentRegion === 'us' ? Yup.string() : Yup.string().required('Required phone number'),
    email: Yup.string().email().required('Required email'),
    amount: Yup.number().min(0, 'Amount must be greater than or equal to 0').required('Required Amount'),
    shipping: Yup.number().min(0, 'Shipping must be greater than or equal to 0.1').required('Required Shipping'),
    tax: Yup.number().min(0, 'Tax must be greater than or equal to 0').required('Required Tax'),
    products: Yup.array()
      .of(
        Yup.object({
          sku: Yup.string().oneOf(validSkus, 'Invalid SKU or There`s No Stock Available').notOneOf(inValidSkus, 'There`s no Stock for this SKU').required('Required SKU'),
          title: Yup.string().max(150, 'Name is to Long').required('Required Name'),
          qty: Yup.number()
            .positive()
            .integer('Qty must be an integer')
            .min(1, 'Quantity must be greater than 0')
            .when('sku', (sku, schema) => (sku != '' ? schema.max(skuQuantities[sku], `SKU Qty is ${skuQuantities[sku] ? skuQuantities[sku] : 'Unavailable'}`) : schema))
            .required('Qty Required'),
          price: Yup.number().min(0, 'Price must be greater than or equal to 0').required('Required Price'),
        })
      )
      // .unique((values: any) => values.sku, 'Duplicate SKU')
      .required('Must have products'),
  })

  const handleSubmit = async (values: OrderType, { resetForm }: any) => {
    setCreatingOrder(true)
    setskuExceededAvailability({ sku: '', availableQty: 0, orderedQty: 0 })

    const orderProducts: { [key: string]: number } = {}

    values.products.forEach((product) => {
      if (!orderProducts[product.sku]) {
        orderProducts[product.sku] = 0
      }
      orderProducts[product.sku] += Number(product.qty)
    })

    const checkIfQuantitiesExceedAvailability = Object.keys(orderProducts).some((sku) => {
      const availableQty = skuQuantities[sku]
      const orderedQty = orderProducts[sku]
      const exceeds = availableQty < orderedQty
      if (exceeds) {
        setskuExceededAvailability({ sku, availableQty, orderedQty })
      }
      return exceeds
    })

    if (checkIfQuantitiesExceedAvailability) {
      toast.error('Some SKUs exceed available quantities')
      setCreatingOrder(false)
      return
    }

    values.products.map((product: any) => {
      if (product.title.includes(' -||- ')) {
        product.title = product.title.split(' -||- ')[0]
      }
    })
    const response = await axios.post(`api/createNewOrder?region=${state.currentRegion}&businessId=${state.user.businessId}`, {
      orderInfo: values,
      isPickUpOrder,
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
      values.adress1 = '9629 Premier Parkway'
      values.adress2 = 'Pick Up Order'
      values.city = 'Miramar'
      values.state = 'FL'
      values.country = state.currentRegion == 'us' ? 'US' : 'ES'
      values.zipCode = '33025'
      values.phoneNumber = '9546134941'
    } else {
      values.adress1 = ''
      values.adress2 = ''
      values.city = ''
      values.state = ''
      values.country = state.currentRegion == 'us' ? 'US' : 'ES'
      values.zipCode = ''
      values.phoneNumber = ''
    }
    setIsPickUpOrder(isPickUpOrder)
  }

  const handleAddressAutoComplete = async (searchText: string) => {
    if (searchText == '') {
      setAutoCompleteAddress([])
      return
    }
    searchText = searchText.replace(/ /g, '%20')
    await axios(`https://api.geoapify.com/v1/geocode/autocomplete?text=${searchText}&apiKey=e7137de1f9144ed8a7d24f041bb6e725&limit=3&lang=${state.currentRegion == 'us' ? 'en' : 'es'}`).then((res) => {
      setAutoCompleteAddress(res.data.features)
    })
  }

  return (
    <div>
      <Head>
        <title>{title}</title>
      </Head>
      <React.Fragment>
        <div className='page-content'>
          <BreadCrumb title='Create Order' pageTitle='Shipments' />
          <Container fluid>
            <Card className='fs-6'>
              <CardBody>
                {ready ? (
                  <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={(values, { resetForm }) => handleSubmit(values, { resetForm })}>
                    {({ values, errors, touched, handleChange, handleBlur, setFieldValue }) => (
                      <Form>
                        <Row>
                          <div className='d-flex justify-content-end align-items-center'>
                            <div className='form-check form-check-inline form-switch form-switch-md form-switch-warning mb-2 mb-md-0'>
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
                          {/* NAME */}

                          <Col xs={12} md={8} className='d-flex flex-column gap-1'>
                            <Row>
                              <Col xs={12} md={6}>
                                <FormGroup className='createOrder_inputs'>
                                  <Label htmlFor='firstNameinput' className='form-label mb-1'>
                                    *First Name
                                  </Label>
                                  <Input
                                    type='text'
                                    className='form-control form-control-sm fs-6'
                                    placeholder='First Name...'
                                    id='firstName'
                                    name='firstName'
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    value={values.firstName || ''}
                                    invalid={touched.firstName && errors.firstName ? true : false}
                                  />
                                  {touched.firstName && errors.firstName ? (
                                    <FormFeedback className='m-0 fs-7' type='invalid'>
                                      {errors.firstName}
                                    </FormFeedback>
                                  ) : null}
                                </FormGroup>
                              </Col>
                              <Col xs={12} md={6}>
                                <FormGroup className='createOrder_inputs'>
                                  <Label htmlFor='lastNameinput' className='form-label mb-1'>
                                    *Last Name
                                  </Label>
                                  <Input
                                    type='text'
                                    className='form-control form-control-sm fs-6'
                                    placeholder='Last Name...'
                                    id='lastName'
                                    name='lastName'
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    value={values.lastName || ''}
                                    invalid={touched.lastName && errors.lastName ? true : false}
                                  />
                                  {touched.lastName && errors.lastName ? (
                                    <FormFeedback className='m-0 fs-7' type='invalid'>
                                      {errors.lastName}
                                    </FormFeedback>
                                  ) : null}
                                </FormGroup>
                              </Col>
                            </Row>

                            {/* COMPANY */}

                            <Col md={12}>
                              <FormGroup className='createOrder_inputs'>
                                <Label htmlFor='company' className='form-label mb-1'>
                                  Company
                                </Label>
                                <Input
                                  type='text'
                                  className='form-control form-control-sm fs-6'
                                  placeholder='Company...'
                                  id='company'
                                  name='company'
                                  onChange={handleChange}
                                  onBlur={handleBlur}
                                  value={values.company || ''}
                                  invalid={touched.company && errors.company ? true : false}
                                />
                                {touched.company && errors.company ? (
                                  <FormFeedback className='m-0 fs-7' type='invalid'>
                                    {errors.company}
                                  </FormFeedback>
                                ) : null}
                              </FormGroup>
                            </Col>

                            {/* ADDRESS */}

                            <Col md={12}>
                              <FormGroup className='createOrder_inputs relative'>
                                <Label htmlFor='adress1' className='form-label mb-1'>
                                  *Address
                                </Label>
                                <DebounceInput
                                  minLength={3}
                                  debounceTimeout={500}
                                  type='text'
                                  className={'form-control form-control-sm fs-6 ' + (errors.adress1 && touched.adress1 ? 'is-invalid' : '')}
                                  placeholder='Address...'
                                  id='adress1'
                                  name='adress1'
                                  readOnly={isPickUpOrder}
                                  onChange={(e) => {
                                    handleChange(e)
                                    handleAddressAutoComplete(e.target.value)
                                  }}
                                  onBlur={handleBlur}
                                  value={values.adress1 || ''}
                                />
                                {touched.adress1 && errors.adress1 ? <ErrorInputLabel error={errors.adress1} marginTop='mt-0' /> : null}
                                {!isPickUpOrder && autoCompleteAddress?.length > 0 && (
                                  <div className='absolute'>
                                    <Card>
                                      <CardBody className='d-flex flex-column gap-2'>
                                        {autoCompleteAddress?.map((address: any) => (
                                          <div key={address.id} className='rounded-3'>
                                            <div className='d-flex justify-content-between align-items-center border-bottom'>
                                              <div className='d-flex flex-column'>
                                                <span className='fs-6 fw-semibold'>{address.properties.formatted}</span>
                                                <span className='fs-7 text-muted'>{`${address.properties.street ? address.properties.street + ', ' : ''}${address.properties.city ? address.properties.city + ', ' : ''}${
                                                  address.properties.postcode ? address.properties.postcode + ', ' : ''
                                                }${address.properties.state ? address.properties.state + ', ' : ''}${address.properties.country ? address.properties.country : ''}`}</span>
                                              </div>
                                              <div className='d-flex justify-content-end align-items-center'>
                                                <Button
                                                  color='info'
                                                  size='sm'
                                                  onClick={() => {
                                                    values.adress1 = address.properties.address_line1
                                                    values.city = address.properties.city
                                                    values.state =
                                                      state.currentRegion == 'us'
                                                        ? address.properties.state_code
                                                          ? String(address.properties.state_code).toUpperCase()
                                                          : address.properties.county
                                                        : address.properties.state
                                                        ? String(address.properties.state)
                                                        : address.properties.county
                                                    values.country = String(address.properties.country_code).toUpperCase()
                                                    values.zipCode = address.properties.postcode
                                                    setAutoCompleteAddress([])
                                                  }}>
                                                  Select
                                                </Button>
                                              </div>
                                            </div>
                                          </div>
                                        ))}
                                        <div className='rounded-3'>
                                          <div className='d-flex justify-content-between align-items-center'>
                                            <span className='fs-6 text-muted'></span>
                                            <div className='d-flex justify-content-end align-items-center mt-1'>
                                              <Button
                                                color='light'
                                                size='sm'
                                                onClick={() => {
                                                  setAutoCompleteAddress([])
                                                }}>
                                                Ignore
                                              </Button>
                                            </div>
                                          </div>
                                        </div>
                                      </CardBody>
                                    </Card>
                                  </div>
                                )}
                              </FormGroup>
                              <FormGroup className='createOrder_inputs mt-2'>
                                <Input
                                  type='text'
                                  className='form-control form-control-sm fs-6'
                                  placeholder='Apartment, suite, etc...'
                                  id='adress2'
                                  name='adress2'
                                  readOnly={isPickUpOrder}
                                  onChange={handleChange}
                                  onBlur={handleBlur}
                                  value={values.adress2 || ''}
                                />
                                {touched.adress2 && errors.adress2 ? (
                                  <FormFeedback className='m-0 fs-7' type='invalid'>
                                    {errors.adress2}
                                  </FormFeedback>
                                ) : null}
                              </FormGroup>
                            </Col>

                            {/* CITY, STATE, ZIP CODE AND COUNTRY */}

                            <Col xs={12}>
                              <Row>
                                <Col xs={12} md={3}>
                                  <FormGroup className='createOrder_inputs'>
                                    <Label htmlFor='compnayNameinput' className='form-label mb-1'>
                                      *City
                                    </Label>
                                    <Input
                                      type='text'
                                      className='form-control form-control-sm fs-6'
                                      placeholder='City...'
                                      id='city'
                                      name='city'
                                      readOnly={isPickUpOrder}
                                      onChange={handleChange}
                                      onBlur={handleBlur}
                                      value={values.city || ''}
                                      invalid={touched.city && errors.city ? true : false}
                                    />
                                    {touched.city && errors.city ? (
                                      <FormFeedback className='m-0 fs-7' type='invalid'>
                                        {errors.city}
                                      </FormFeedback>
                                    ) : null}
                                  </FormGroup>
                                </Col>
                                <Col xs={12} md={3}>
                                  <FormGroup className='createOrder_inputs'>
                                    <Label htmlFor='compnayNameinput' className='form-label mb-1'>
                                      *Zip Code
                                    </Label>
                                    <Input
                                      type='text'
                                      className='form-control form-control-sm fs-6'
                                      placeholder='Zip Code...'
                                      id='zipCode'
                                      name='zipCode'
                                      readOnly={isPickUpOrder}
                                      onChange={handleChange}
                                      onBlur={handleBlur}
                                      value={values.zipCode || ''}
                                      invalid={touched.zipCode && errors.zipCode ? true : false}
                                    />
                                    {touched.zipCode && errors.zipCode ? (
                                      <FormFeedback className='m-0 fs-7' type='invalid'>
                                        {errors.zipCode}
                                      </FormFeedback>
                                    ) : null}
                                  </FormGroup>
                                </Col>
                                <Col xs={12} md={3}>
                                  <FormGroup className='createOrder_inputs'>
                                    <Label htmlFor='compnayNameinput' className='form-label mb-1'>
                                      *Country
                                    </Label>
                                    <SimpleSelect
                                      selected={{ label: values.country, value: values.country }}
                                      options={countries || []}
                                      handleSelect={(option: any) => {
                                        if (!option) {
                                          setFieldValue(`country`, '')
                                          return
                                        }
                                        setFieldValue(`country`, option.value)
                                      }}
                                      isReadOnly={isPickUpOrder}
                                      isDisabled={isPickUpOrder}
                                      placeholder='Select country...'
                                      customStyle='sm'
                                      hasError={errors.country ? true : false}
                                      isClearable
                                      menuPortalTarget={document.body}
                                    />
                                    {errors.country ? <ErrorInputLabel error={errors.country} marginTop='mt-0' /> : null}
                                  </FormGroup>
                                </Col>
                                <Col xs={12} md={3}>
                                  <FormGroup className='createOrder_inputs'>
                                    <Label htmlFor='compnayNameinput' className='form-label mb-1'>
                                      *State
                                    </Label>
                                    {stateList[values.country] ? (
                                      <>
                                        <SimpleSelect
                                          selected={{ label: values.state, value: values.state }}
                                          options={stateList[values.country] || []}
                                          handleSelect={(option: any) => {
                                            if (!option) {
                                              setFieldValue(`state`, '')
                                              return
                                            }
                                            setFieldValue(`state`, option.value)
                                          }}
                                          isReadOnly={isPickUpOrder}
                                          isDisabled={isPickUpOrder}
                                          placeholder='Select State...'
                                          customStyle='sm'
                                          hasError={errors.state ? true : false}
                                          isClearable
                                          menuPortalTarget={document.body}
                                        />
                                        {errors.state ? <ErrorInputLabel error={errors.state} marginTop='mt-0' /> : null}
                                      </>
                                    ) : (
                                      <>
                                        <Input
                                          type='text'
                                          className='form-control form-control-sm fs-6'
                                          placeholder='State...'
                                          id='state'
                                          name='state'
                                          readOnly={isPickUpOrder}
                                          onChange={handleChange}
                                          onBlur={handleBlur}
                                          value={values.state || ''}
                                          invalid={touched.state && errors.state ? true : false}
                                        />
                                        {touched.state && errors.state ? (
                                          <FormFeedback className='m-0 fs-7' type='invalid'>
                                            {errors.state}
                                          </FormFeedback>
                                        ) : null}
                                      </>
                                    )}
                                  </FormGroup>
                                </Col>
                              </Row>
                            </Col>

                            {/* PHONE AND EMAIL */}

                            <Col xs={12}>
                              <Row>
                                <Col xs={12} md={6}>
                                  <FormGroup className='createOrder_inputs'>
                                    <Label htmlFor='lastNameinput' className='form-label mb-1'>
                                      Phone #
                                    </Label>
                                    <Input
                                      type='text'
                                      className='form-control form-control-sm fs-6'
                                      placeholder='Phone Number...'
                                      id='phoneNumber'
                                      name='phoneNumber'
                                      readOnly={isPickUpOrder}
                                      onChange={handleChange}
                                      onBlur={handleBlur}
                                      value={values.phoneNumber || ''}
                                      invalid={touched.phoneNumber && errors.phoneNumber ? true : false}
                                    />
                                    {touched.phoneNumber && errors.phoneNumber ? (
                                      <FormFeedback className='m-0 fs-7' type='invalid'>
                                        {errors.phoneNumber}
                                      </FormFeedback>
                                    ) : null}
                                  </FormGroup>
                                </Col>
                                <Col xs={12} md={6}>
                                  <FormGroup className='createOrder_inputs'>
                                    <Label htmlFor='lastNameinput' className='form-label mb-1'>
                                      *Email
                                    </Label>
                                    <Input
                                      type='text'
                                      className='form-control form-control-sm fs-6'
                                      placeholder='Email Address...'
                                      id='email'
                                      name='email'
                                      readOnly={isPickUpOrder}
                                      onChange={handleChange}
                                      onBlur={handleBlur}
                                      value={values.email || ''}
                                      invalid={touched.email && errors.email ? true : false}
                                    />
                                    {touched.email && errors.email ? (
                                      <FormFeedback className='m-0 fs-7' type='invalid'>
                                        {errors.email}
                                      </FormFeedback>
                                    ) : null}
                                  </FormGroup>
                                </Col>
                              </Row>
                            </Col>
                          </Col>

                          {/* ORDER NUMBER */}

                          <Col xs={12} md={4}>
                            <Col xs={12} md={12}>
                              <FormGroup className='createOrder_inputs'>
                                <Label htmlFor='lastNameinput' className='form-label mb-1'>
                                  *Order Number
                                </Label>
                                <div className='input-group'>
                                  <span className='input-group-text fw-semibold fs-6 py-1' id='orderNumberid'>
                                    {orderNumberStart}
                                  </span>
                                  <Input
                                    type='text'
                                    className='form-control form-control-sm fs-6'
                                    placeholder='Order Number...'
                                    aria-describedby='orderNumberid'
                                    id='orderNumber'
                                    name='orderNumber'
                                    readOnly={isPickUpOrder}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    value={values.orderNumber || ''}
                                    invalid={touched.orderNumber && errors.orderNumber ? true : false}
                                  />
                                  {touched.orderNumber && errors.orderNumber ? (
                                    <FormFeedback className='m-0 fs-7' type='invalid'>
                                      {errors.orderNumber}
                                    </FormFeedback>
                                  ) : null}
                                </div>
                              </FormGroup>
                            </Col>
                            <Col xs={12} md={6} className='mt-3'>
                              <FormGroup className='createOrder_inputs'>
                                <Label htmlFor='lastNameinput' className='form-label'>
                                  *Amount Paid
                                </Label>
                                <Input
                                  type='text'
                                  className='form-control form-control-sm fs-6'
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
                                  className='form-control form-control-sm fs-6'
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
                                  className='form-control form-control-sm fs-6'
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
                          </Col>
                        </Row>

                        {/* TABLE OF PRODUCTS */}
                        <Row>
                          <Col xs={12} className='mt-2'>
                            <div className='table-responsive'>
                              <table className='table table-hover align-middle table-nowrap'>
                                <thead>
                                  <tr>
                                    <th scope='col' className='py-1 fs-5 m-0 fw-semibold text-center bg-primary text-white'></th>
                                    <th scope='col' className='py-1 fs-5 m-0 fw-semibold text-center bg-primary text-white'>
                                      SKU
                                    </th>
                                    <th scope='col' className='py-1 fs-5 m-0 fw-semibold text-center bg-primary text-white'>
                                      Title
                                    </th>
                                    <th scope='col' className='py-1 fs-5 m-0 fw-semibold text-center bg-primary text-white'>
                                      Unit Price
                                    </th>
                                    <th scope='col' className='py-1 fs-5 m-0 fw-semibold text-center bg-primary text-white'>
                                      Qty
                                    </th>
                                    <th scope='col' className='py-1 fs-5 m-0 fw-semibold text-center bg-primary text-white'>
                                      Total
                                    </th>
                                  </tr>
                                </thead>
                                <tbody>
                                  <FieldArray name='products'>
                                    {({ remove, push }) => (
                                      <>
                                        {values.products.map((_product, index) => (
                                          <tr key={index}>
                                            <td className='col-1' style={{ minWidth: '50px' }}>
                                              {index > 0 ? (
                                                <Row className='w-100 d-flex flex-row flex-nowrap justify-content-center gap-1 align-items-center mb-0'>
                                                  <i
                                                    className='fs-3 text-success las la-plus-circle m-0 p-0 w-auto'
                                                    style={{ cursor: 'pointer' }}
                                                    onClick={() =>
                                                      push({
                                                        sku: '',
                                                        title: '',
                                                        qty: 1,
                                                        price: '0',
                                                      })
                                                    }
                                                  />
                                                  <i className='text-danger fs-3 las la-minus-circle m-0 p-0 w-auto' style={{ cursor: 'pointer' }} onClick={() => remove(index)} />
                                                </Row>
                                              ) : (
                                                <Row className='w-100 d-flex flex-row flex-nowrap justify-content-center gap-0 align-items-center mb-0'>
                                                  <i
                                                    className='fs-3 text-success las la-plus-circle m-0 p-0 w-auto'
                                                    style={{ cursor: 'pointer' }}
                                                    onClick={() =>
                                                      push({
                                                        sku: '',
                                                        title: '',
                                                        qty: 1,
                                                        price: '0',
                                                      })
                                                    }
                                                  />
                                                </Row>
                                              )}
                                            </td>
                                            <td className='col-12 col-md-4' style={{ minWidth: '200px' }}>
                                              <Field name={`products.${index}.sku`}>
                                                {({ meta }: any) => (
                                                  <FormGroup className='createOrder_inputs'>
                                                    <SimpleSelect
                                                      selected={{ label: values.products[index].sku, value: values.products[index].sku }}
                                                      options={skus.map((sku: { sku: string; name: string }) => ({ label: sku.sku, value: sku.sku, description: sku.name }))}
                                                      handleSelect={(option: any) => {
                                                        if (!option) {
                                                          setFieldValue(`products.${index}.sku`, '')
                                                          setFieldValue(`products.${index}.title`, '')
                                                          return
                                                        }
                                                        setFieldValue(`products.${index}.sku`, option.value)
                                                        setFieldValue(`products.${index}.title`, skusTitles[option.value])
                                                      }}
                                                      placeholder='Select SKU...'
                                                      customStyle='sm'
                                                      hasError={meta.error ? true : false}
                                                      isClearable
                                                      menuPortalTarget={document.body}
                                                    />
                                                    {meta.error ? <ErrorInputLabel error={meta.error} marginTop='mt-0' /> : null}
                                                  </FormGroup>
                                                )}
                                              </Field>
                                            </td>
                                            <td className='col-12 col-md-5' style={{ minWidth: '200px' }}>
                                              <Field name={`products.${index}.title`}>
                                                {({ meta }: any) => (
                                                  <FormGroup className='createOrder_inputs'>
                                                    <Input
                                                      type='text'
                                                      className='form-control form-control-sm fs-6'
                                                      name={`products.${index}.title`}
                                                      placeholder='Title...'
                                                      list='skuNames'
                                                      readOnly
                                                      onBlur={handleBlur}
                                                      value={values.products[index].title?.split(' -||- ')[0] || ''}
                                                      invalid={meta.touched && meta.error ? true : false}
                                                    />
                                                    {meta.touched && meta.error ? (
                                                      <FormFeedback className='m-0 fs-7' type='invalid'>
                                                        {meta.error}
                                                      </FormFeedback>
                                                    ) : null}
                                                  </FormGroup>
                                                )}
                                              </Field>
                                            </td>
                                            <td className='col-12 col-md-1' style={{ minWidth: '80px' }}>
                                              <Field name={`products.${index}.price`}>
                                                {({ meta }: any) => (
                                                  <FormGroup className='createOrder_inputs'>
                                                    <Input
                                                      type='text'
                                                      className='form-control form-control-sm fs-6'
                                                      name={`products.${index}.price`}
                                                      placeholder='Price...'
                                                      onChange={handleChange}
                                                      onBlur={handleBlur}
                                                      value={values.products[index].price || ''}
                                                      invalid={meta.touched && meta.error ? true : false}
                                                    />
                                                    {meta.touched && meta.error ? (
                                                      <FormFeedback className='m-0 fs-7' type='invalid'>
                                                        {meta.error}
                                                      </FormFeedback>
                                                    ) : null}
                                                  </FormGroup>
                                                )}
                                              </Field>
                                            </td>
                                            <td className='col-12 col-md-1' style={{ minWidth: '80px' }}>
                                              <Field name={`products.${index}.qty`}>
                                                {({ meta }: any) => (
                                                  <FormGroup className='createOrder_inputs'>
                                                    <Input
                                                      type='text'
                                                      className='form-control form-control-sm fs-6 text-center'
                                                      name={`products.${index}.qty`}
                                                      max={skuQuantities[values.products[index].sku]}
                                                      placeholder='Qty...'
                                                      onChange={handleChange}
                                                      onBlur={handleBlur}
                                                      value={values.products[index].qty || ''}
                                                      invalid={meta.touched && meta.error ? true : false}
                                                    />
                                                    {meta.touched && meta.error ? (
                                                      <FormFeedback className='m-0 fs-7 text-wrap' type='invalid'>
                                                        {meta.error}
                                                      </FormFeedback>
                                                    ) : null}
                                                  </FormGroup>
                                                )}
                                              </Field>
                                            </td>
                                            <td className='text-end col-12 col-md-1' style={{ minWidth: '80px' }}>
                                              {FormatCurrency(state.currentRegion, values.products[index].qty * Number(values.products[index].price))}
                                            </td>
                                          </tr>
                                        ))}
                                      </>
                                    )}
                                  </FieldArray>
                                </tbody>
                                <tfoot className='bg-light'>
                                  <tr>
                                    <td className='text-end fw-bold' colSpan={4}>
                                      TOTAL
                                    </td>
                                    <td className='text-center fw-semibold'>
                                      {FormatIntNumber(
                                        state.currentRegion,
                                        values.products.reduce((acc: number, product: any) => acc + Number(product.qty), 0)
                                      )}
                                    </td>
                                    <td className='text-end fw-semibold'>
                                      {FormatCurrency(
                                        state.currentRegion,
                                        values.products.reduce((acc: number, product: any) => acc + product.qty * Number(product.price), 0)
                                      )}
                                    </td>
                                  </tr>
                                </tfoot>
                              </table>
                            </div>
                          </Col>
                        </Row>

                        {/* INFO AND SUBMIT BUTTON */}

                        <Row>
                          {skuExceededAvailability.sku !== '' && (
                            <span className='text-danger fs-6 fw-normal'>{`*SKU: ${skuExceededAvailability.sku} Available: ${skuExceededAvailability.availableQty} Ordered: ${skuExceededAvailability.orderedQty}`}</span>
                          )}
                          <p className='fs-6 mb-0 text-muted'>*You must complete all required fields or you will not be able to create your product.</p>
                          <Col md={12}>
                            <div className='text-end'>
                              <Button type='submit' disabled={creatingOrder} className='fs-6 btn bg-primary'>
                                {creatingOrder ? (
                                  <span className='d-flex align-items-center gap-2'>
                                    <Spinner color='light' size={'sm'} /> Creating...
                                  </span>
                                ) : (
                                  'Create Order'
                                )}
                              </Button>
                            </div>
                          </Col>
                        </Row>
                      </Form>
                    )}
                  </Formik>
                ) : (
                  <Row>
                    <h5>Loading Create Order Form...</h5>
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
