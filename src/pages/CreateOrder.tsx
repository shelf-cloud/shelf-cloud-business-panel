import { GetServerSideProps } from 'next'
import Head from 'next/head'
import router from 'next/router'
import React, { useContext, useEffect, useState } from 'react'

import { getSession } from '@auth/client'
import BreadCrumb from '@components/Common/BreadCrumb'
import SimpleSelect, { SelectOptionType } from '@components/Common/SimpleSelect'
import ErrorInputLabel from '@components/ui/forms/ErrorInputLabel'
import AppContext from '@context/AppContext'
import { FormatCurrency, FormatIntNumber } from '@lib/FormatNumbers'
import axios from 'axios'
import { Field, FieldArray, Form, Formik } from 'formik'
import { Session } from 'next-auth'
import { DebounceInput } from 'react-debounce-input'
import { toast } from 'react-toastify'
import useSWR, { useSWRConfig } from 'swr'
import * as Yup from 'yup'

import { Button } from '@shadcn/ui/button'
import { Card, CardContent } from '@shadcn/ui/card'
import { Input } from '@shadcn/ui/input'
import { Label } from '@shadcn/ui/label'
import { Spinner } from '@shadcn/ui/spinner'
import { Switch } from '@/components/ui/Switch'

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
      values.adress2 = 'Pickup Order'
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
    await axios(
      `https://api.geoapify.com/v1/geocode/autocomplete?text=${searchText}&apiKey=e7137de1f9144ed8a7d24f041bb6e725&limit=3&lang=${state.currentRegion == 'us' ? 'en' : 'es'}`
    ).then((res) => {
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
          <div className='mx-auto w-full px-3'>
            <Card className='text-[13px]'>
              <CardContent>
                {ready ? (
                  <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={(values, { resetForm }) => handleSubmit(values, { resetForm })}>
                    {({ values, errors, touched, handleChange, handleBlur, setFieldValue }) => (
                      <Form>
                        <div className='flex flex-wrap -mx-3'>
                          <div className='flex justify-end items-center'>
                            <div className='form-check form-check-inline form-switch form-switch-md form-switch-warning mb-2 md:mb-0'>
                              <Label className='form-check-label' htmlFor='SwitchCheck4'>
                                Select for Local PickUp
                              </Label>
                              <Switch
                                id='SwitchCheck4'
                                onChange={async (e) => {
                                  await handlePickUpOrder(values, !isPickUpOrder)
                                  handleChange(e)
                                }}
                                defaultChecked={isPickUpOrder}
                              />
                            </div>
                          </div>
                        </div>
                        <div className='flex flex-wrap -mx-3'>
                          {/* NAME */}

                          <div className='px-3 w-full md:w-8/12 flex flex-col gap-1'>
                            <div className='flex flex-wrap -mx-3'>
                              <div className='px-3 w-full md:w-6/12'>
                                <div className='mb-3 createOrder_inputs'>
                                  <Label htmlFor='firstNameinput' className='form-label mb-1'>
                                    *First Name
                                  </Label>
                                  <Input
                                    type='text'
                                    className='h-8 text-xs'
                                    placeholder='First Name...'
                                    id='firstName'
                                    name='firstName'
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    value={values.firstName || ''}
                                    aria-invalid={touched.firstName && errors.firstName ? true : undefined}
                                  />
                                  {touched.firstName && errors.firstName ? (
                                    <div className='m-0 text-sm text-destructive'>
                                      {errors.firstName}
                                    </div>
                                  ) : null}
                                </div>
                              </div>
                              <div className='px-3 w-full md:w-6/12'>
                                <div className='mb-3 createOrder_inputs'>
                                  <Label htmlFor='lastNameinput' className='form-label mb-1'>
                                    *Last Name
                                  </Label>
                                  <Input
                                    type='text'
                                    className='h-8 text-xs'
                                    placeholder='Last Name...'
                                    id='lastName'
                                    name='lastName'
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    value={values.lastName || ''}
                                    aria-invalid={touched.lastName && errors.lastName ? true : undefined}
                                  />
                                  {touched.lastName && errors.lastName ? (
                                    <div className='m-0 text-sm text-destructive'>
                                      {errors.lastName}
                                    </div>
                                  ) : null}
                                </div>
                              </div>
                            </div>

                            {/* COMPANY */}

                            <div className='px-3 md:w-full'>
                              <div className='mb-3 createOrder_inputs'>
                                <Label htmlFor='company' className='form-label mb-1'>
                                  Company
                                </Label>
                                <Input
                                  type='text'
                                  className='h-8 text-xs'
                                  placeholder='Company...'
                                  id='company'
                                  name='company'
                                  onChange={handleChange}
                                  onBlur={handleBlur}
                                  value={values.company || ''}
                                  aria-invalid={touched.company && errors.company ? true : undefined}
                                />
                                {touched.company && errors.company ? (
                                  <div className='m-0 text-sm text-destructive'>
                                    {errors.company}
                                  </div>
                                ) : null}
                              </div>
                            </div>

                            {/* ADDRESS */}

                            <div className='px-3 md:w-full'>
                              <div className='mb-3 createOrder_inputs relative'>
                                <Label htmlFor='adress1' className='form-label mb-1'>
                                  *Address
                                </Label>
                                <DebounceInput
                                  minLength={3}
                                  debounceTimeout={500}
                                  type='text'
                                  className='h-8 text-xs'
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
                                      <CardContent className='flex flex-col gap-2'>
                                        {autoCompleteAddress?.map((address: any) => (
                                          <div key={address.id} className='rounded-lg'>
                                            <div className='flex justify-between items-center border-b'>
                                              <div className='flex flex-col'>
                                                <span className='text-[13px] font-semibold'>{address.properties.formatted}</span>
                                                <span className='text-[11.2px] text-[var(--bs-secondary-color)]'>{`${address.properties.street ? address.properties.street + ', ' : ''}${address.properties.city ? address.properties.city + ', ' : ''}${
                                                  address.properties.postcode ? address.properties.postcode + ', ' : ''
                                                }${address.properties.state ? address.properties.state + ', ' : ''}${address.properties.country ? address.properties.country : ''}`}</span>
                                              </div>
                                              <div className='flex justify-end items-center'>
                                                <Button
                                                  variant='info'
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
                                        <div className='rounded-lg'>
                                          <div className='flex justify-between items-center'>
                                            <span className='text-[13px] text-[var(--bs-secondary-color)]'></span>
                                            <div className='flex justify-end items-center mt-1'>
                                              <Button
                                                variant='light'
                                                size='sm'
                                                onClick={() => {
                                                  setAutoCompleteAddress([])
                                                }}>
                                                Ignore
                                              </Button>
                                            </div>
                                          </div>
                                        </div>
                                      </CardContent>
                                    </Card>
                                  </div>
                                )}
                              </div>
                              <div className='mb-3 createOrder_inputs mt-2'>
                                <Input
                                  type='text'
                                  className='h-8 text-xs'
                                  placeholder='Apartment, suite, etc...'
                                  id='adress2'
                                  name='adress2'
                                  readOnly={isPickUpOrder}
                                  onChange={handleChange}
                                  onBlur={handleBlur}
                                  value={values.adress2 || ''}
                                />
                                {touched.adress2 && errors.adress2 ? (
                                  <div className='m-0 text-sm text-destructive'>
                                    {errors.adress2}
                                  </div>
                                ) : null}
                              </div>
                            </div>

                            {/* CITY, STATE, ZIP CODE AND COUNTRY */}

                            <div className='px-3 w-full'>
                              <div className='flex flex-wrap -mx-3'>
                                <div className='px-3 w-full md:w-3/12'>
                                  <div className='mb-3 createOrder_inputs'>
                                    <Label htmlFor='compnayNameinput' className='form-label mb-1'>
                                      *City
                                    </Label>
                                    <Input
                                      type='text'
                                      className='h-8 text-xs'
                                      placeholder='City...'
                                      id='city'
                                      name='city'
                                      readOnly={isPickUpOrder}
                                      onChange={handleChange}
                                      onBlur={handleBlur}
                                      value={values.city || ''}
                                      aria-invalid={touched.city && errors.city ? true : undefined}
                                    />
                                    {touched.city && errors.city ? (
                                      <div className='m-0 text-sm text-destructive'>
                                        {errors.city}
                                      </div>
                                    ) : null}
                                  </div>
                                </div>
                                <div className='px-3 w-full md:w-3/12'>
                                  <div className='mb-3 createOrder_inputs'>
                                    <Label htmlFor='compnayNameinput' className='form-label mb-1'>
                                      *Zip Code
                                    </Label>
                                    <Input
                                      type='text'
                                      className='h-8 text-xs'
                                      placeholder='Zip Code...'
                                      id='zipCode'
                                      name='zipCode'
                                      readOnly={isPickUpOrder}
                                      onChange={handleChange}
                                      onBlur={handleBlur}
                                      value={values.zipCode || ''}
                                      aria-invalid={touched.zipCode && errors.zipCode ? true : undefined}
                                    />
                                    {touched.zipCode && errors.zipCode ? (
                                      <div className='m-0 text-sm text-destructive'>
                                        {errors.zipCode}
                                      </div>
                                    ) : null}
                                  </div>
                                </div>
                                <div className='px-3 w-full md:w-3/12'>
                                  <div className='mb-3 createOrder_inputs'>
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
                                  </div>
                                </div>
                                <div className='px-3 w-full md:w-3/12'>
                                  <div className='mb-3 createOrder_inputs'>
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
                                          className='h-8 text-xs'
                                          placeholder='State...'
                                          id='state'
                                          name='state'
                                          readOnly={isPickUpOrder}
                                          onChange={handleChange}
                                          onBlur={handleBlur}
                                          value={values.state || ''}
                                          aria-invalid={touched.state && errors.state ? true : undefined}
                                        />
                                        {touched.state && errors.state ? (
                                          <div className='m-0 text-sm text-destructive'>
                                            {errors.state}
                                          </div>
                                        ) : null}
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* PHONE AND EMAIL */}

                            <div className='px-3 w-full'>
                              <div className='flex flex-wrap -mx-3'>
                                <div className='px-3 w-full md:w-6/12'>
                                  <div className='mb-3 createOrder_inputs'>
                                    <Label htmlFor='lastNameinput' className='form-label mb-1'>
                                      Phone #
                                    </Label>
                                    <Input
                                      type='text'
                                      className='h-8 text-xs'
                                      placeholder='Phone Number...'
                                      id='phoneNumber'
                                      name='phoneNumber'
                                      readOnly={isPickUpOrder}
                                      onChange={handleChange}
                                      onBlur={handleBlur}
                                      value={values.phoneNumber || ''}
                                      aria-invalid={touched.phoneNumber && errors.phoneNumber ? true : undefined}
                                    />
                                    {touched.phoneNumber && errors.phoneNumber ? (
                                      <div className='m-0 text-sm text-destructive'>
                                        {errors.phoneNumber}
                                      </div>
                                    ) : null}
                                  </div>
                                </div>
                                <div className='px-3 w-full md:w-6/12'>
                                  <div className='mb-3 createOrder_inputs'>
                                    <Label htmlFor='lastNameinput' className='form-label mb-1'>
                                      *Email
                                    </Label>
                                    <Input
                                      type='text'
                                      className='h-8 text-xs'
                                      placeholder='Email Address...'
                                      id='email'
                                      name='email'
                                      readOnly={isPickUpOrder}
                                      onChange={handleChange}
                                      onBlur={handleBlur}
                                      value={values.email || ''}
                                      aria-invalid={touched.email && errors.email ? true : undefined}
                                    />
                                    {touched.email && errors.email ? (
                                      <div className='m-0 text-sm text-destructive'>
                                        {errors.email}
                                      </div>
                                    ) : null}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* ORDER NUMBER */}

                          <div className='px-3 w-full md:w-4/12'>
                            <div className='px-3 w-full md:w-full'>
                              <div className='mb-3 createOrder_inputs'>
                                <Label htmlFor='lastNameinput' className='form-label mb-1'>
                                  *Order Number
                                </Label>
                                <div className='input-group'>
                                  <span className='input-group-text font-semibold text-[13px] py-1' id='orderNumberid'>
                                    {orderNumberStart}
                                  </span>
                                  <Input
                                    type='text'
                                    className='h-8 text-xs'
                                    placeholder='Order Number...'
                                    aria-describedby='orderNumberid'
                                    id='orderNumber'
                                    name='orderNumber'
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    value={values.orderNumber || ''}
                                    aria-invalid={touched.orderNumber && errors.orderNumber ? true : undefined}
                                  />
                                  {touched.orderNumber && errors.orderNumber ? (
                                    <div className='m-0 text-sm text-destructive'>
                                      {errors.orderNumber}
                                    </div>
                                  ) : null}
                                </div>
                              </div>
                            </div>
                            <div className='px-3 w-full md:w-6/12 mt-4'>
                              <div className='mb-3 createOrder_inputs'>
                                <Label htmlFor='lastNameinput' className='form-label'>
                                  *Amount Paid
                                </Label>
                                <Input
                                  type='text'
                                  className='h-8 text-xs'
                                  placeholder='Amount...'
                                  id='amount'
                                  name='amount'
                                  onChange={handleChange}
                                  onBlur={handleBlur}
                                  value={values.amount || ''}
                                  aria-invalid={touched.amount && errors.amount ? true : undefined}
                                />
                                {touched.amount && errors.amount ? <div className='text-sm text-destructive'>{errors.amount}</div> : null}
                              </div>
                              <div className='mb-3 createOrder_inputs'>
                                <Label htmlFor='lastNameinput' className='form-label'>
                                  *Shipping Paid
                                </Label>
                                <Input
                                  type='text'
                                  className='h-8 text-xs'
                                  placeholder='Shipping...'
                                  id='shipping'
                                  name='shipping'
                                  onChange={handleChange}
                                  onBlur={handleBlur}
                                  value={values.shipping || ''}
                                  aria-invalid={touched.shipping && errors.shipping ? true : undefined}
                                />
                                {touched.shipping && errors.shipping ? <div className='text-sm text-destructive'>{errors.shipping}</div> : null}
                              </div>
                              <div className='mb-3 createOrder_inputs'>
                                <Label htmlFor='lastNameinput' className='form-label'>
                                  *Tax Paid
                                </Label>
                                <Input
                                  type='text'
                                  className='h-8 text-xs'
                                  placeholder='Tax...'
                                  id='tax'
                                  name='tax'
                                  onChange={handleChange}
                                  onBlur={handleBlur}
                                  value={values.tax || ''}
                                  aria-invalid={touched.tax && errors.tax ? true : undefined}
                                />
                                {touched.tax && errors.tax ? <div className='text-sm text-destructive'>{errors.tax}</div> : null}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* TABLE OF PRODUCTS */}
                        <div className='flex flex-wrap -mx-3'>
                          <div className='px-3 w-full mt-2'>
                            <div className='overflow-x-auto'>
                              <table className='w-full align-middle whitespace-nowrap [&_th]:px-2 [&_th]:py-1 [&_td]:px-2 [&_td]:py-1 [&_tbody_tr:nth-child(odd)]:bg-[color:var(--vz-light)]'>
                                <thead>
                                  <tr>
                                    <th scope='col' aria-label='Product row actions' className='py-1 text-[16.25px] m-0 font-semibold text-center bg-primary text-white'></th>
                                    <th scope='col' className='py-1 text-[16.25px] m-0 font-semibold text-center bg-primary text-white'>
                                      SKU
                                    </th>
                                    <th scope='col' className='py-1 text-[16.25px] m-0 font-semibold text-center bg-primary text-white'>
                                      Title
                                    </th>
                                    <th scope='col' className='py-1 text-[16.25px] m-0 font-semibold text-center bg-primary text-white'>
                                      Unit Price
                                    </th>
                                    <th scope='col' className='py-1 text-[16.25px] m-0 font-semibold text-center bg-primary text-white'>
                                      Qty
                                    </th>
                                    <th scope='col' className='py-1 text-[16.25px] m-0 font-semibold text-center bg-primary text-white'>
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
                                            <td style={{ minWidth: '50px' }}>
                                              {index > 0 ? (
                                                <div className='flex flex-wrap -mx-3 w-full flex flex-row flex-nowrap justify-center gap-1 items-center mb-0'>
                                                  <button
                                                    type='button'
                                                    aria-label='Add product row'
                                                    className='btn btn-link border-0 bg-transparent text-success m-0 p-0 w-auto'
                                                    onClick={() =>
                                                      push({
                                                        sku: '',
                                                        title: '',
                                                        qty: 1,
                                                        price: '0',
                                                      })
                                                    }>
                                                    <i className='text-[22.75px] las la-plus-circle m-0 p-0' />
                                                  </button>
                                                  <button
                                                    type='button'
                                                    aria-label='Remove product row'
                                                    className='btn btn-link border-0 bg-transparent text-danger m-0 p-0 w-auto'
                                                    onClick={() => remove(index)}>
                                                    <i className='text-[22.75px] las la-minus-circle m-0 p-0' />
                                                  </button>
                                                </div>
                                              ) : (
                                                <div className='flex flex-wrap -mx-3 w-full flex flex-row flex-nowrap justify-center gap-0 items-center mb-0'>
                                                  <button
                                                    type='button'
                                                    aria-label='Add product row'
                                                    className='btn btn-link border-0 bg-transparent text-success m-0 p-0 w-auto'
                                                    onClick={() =>
                                                      push({
                                                        sku: '',
                                                        title: '',
                                                        qty: 1,
                                                        price: '0',
                                                      })
                                                    }>
                                                    <i className='text-[22.75px] las la-plus-circle m-0 p-0' />
                                                  </button>
                                                </div>
                                              )}
                                            </td>
                                            <td style={{ minWidth: '200px' }}>
                                              <Field name={`products.${index}.sku`}>
                                                {({ meta }: any) => (
                                                  <div className='mb-3 createOrder_inputs'>
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
                                                  </div>
                                                )}
                                              </Field>
                                            </td>
                                            <td style={{ minWidth: '200px' }}>
                                              <Field name={`products.${index}.title`}>
                                                {({ meta }: any) => (
                                                  <div className='mb-3 createOrder_inputs'>
                                                    <Input
                                                      type='text'
                                                      className='h-8 text-xs'
                                                      name={`products.${index}.title`}
                                                      placeholder='Title...'
                                                      list='skuNames'
                                                      readOnly
                                                      onBlur={handleBlur}
                                                      value={values.products[index].title?.split(' -||- ')[0] || ''}
                                                      aria-invalid={meta.touched && meta.error ? true : undefined}
                                                    />
                                                    {meta.touched && meta.error ? (
                                                      <div className='m-0 text-sm text-destructive'>
                                                        {meta.error}
                                                      </div>
                                                    ) : null}
                                                  </div>
                                                )}
                                              </Field>
                                            </td>
                                            <td style={{ minWidth: '80px' }}>
                                              <Field name={`products.${index}.price`}>
                                                {({ meta }: any) => (
                                                  <div className='mb-3 createOrder_inputs'>
                                                    <Input
                                                      type='text'
                                                      className='h-8 text-xs'
                                                      name={`products.${index}.price`}
                                                      placeholder='Price...'
                                                      onChange={handleChange}
                                                      onBlur={handleBlur}
                                                      value={values.products[index].price || ''}
                                                      aria-invalid={meta.touched && meta.error ? true : undefined}
                                                    />
                                                    {meta.touched && meta.error ? (
                                                      <div className='m-0 text-sm text-destructive'>
                                                        {meta.error}
                                                      </div>
                                                    ) : null}
                                                  </div>
                                                )}
                                              </Field>
                                            </td>
                                            <td style={{ minWidth: '80px' }}>
                                              <Field name={`products.${index}.qty`}>
                                                {({ meta }: any) => (
                                                  <div className='mb-3 createOrder_inputs'>
                                                    <Input
                                                      type='text'
                                                      className='h-8 text-xs text-center'
                                                      name={`products.${index}.qty`}
                                                      max={skuQuantities[values.products[index].sku]}
                                                      placeholder='Qty...'
                                                      onChange={handleChange}
                                                      onBlur={handleBlur}
                                                      value={values.products[index].qty || ''}
                                                      aria-invalid={meta.touched && meta.error ? true : undefined}
                                                    />
                                                    {meta.touched && meta.error ? (
                                                      <div className='m-0 text-sm text-destructive text-wrap'>
                                                        {meta.error}
                                                      </div>
                                                    ) : null}
                                                  </div>
                                                )}
                                              </Field>
                                            </td>
                                            <td className='text-right' style={{ minWidth: '80px' }}>
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
                                    <td className='text-right font-bold' colSpan={4}>
                                      TOTAL
                                    </td>
                                    <td className='text-center font-semibold'>
                                      {FormatIntNumber(
                                        state.currentRegion,
                                        values.products.reduce((acc: number, product: any) => acc + Number(product.qty), 0)
                                      )}
                                    </td>
                                    <td className='text-right font-semibold'>
                                      {FormatCurrency(
                                        state.currentRegion,
                                        values.products.reduce((acc: number, product: any) => acc + product.qty * Number(product.price), 0)
                                      )}
                                    </td>
                                  </tr>
                                </tfoot>
                              </table>
                            </div>
                          </div>
                        </div>

                        {/* INFO AND SUBMIT BUTTON */}

                        <div className='flex flex-wrap -mx-3'>
                          {skuExceededAvailability.sku !== '' && (
                            <span className='text-danger text-[13px] font-normal'>{`*SKU: ${skuExceededAvailability.sku} Available: ${skuExceededAvailability.availableQty} Ordered: ${skuExceededAvailability.orderedQty}`}</span>
                          )}
                          <p className='text-[13px] mb-0 text-[var(--bs-secondary-color)]'>*You must complete all required fields or you will not be able to create your product.</p>
                          <div className='px-3 md:w-full'>
                            <div className='text-right'>
                              <Button type='submit' disabled={creatingOrder} className='text-[13px] bg-primary'>
                                {creatingOrder ? (
                                  <span className='flex items-center gap-2'>
                                    <Spinner className='text-white' /> Creating...
                                  </span>
                                ) : (
                                  'Create Order'
                                )}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </Form>
                    )}
                  </Formik>
                ) : (
                  <div className='flex flex-wrap -mx-3'>
                    <h5>Loading Create Order Form...</h5>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </React.Fragment>
    </div>
  )
}

export default CreateOrder
