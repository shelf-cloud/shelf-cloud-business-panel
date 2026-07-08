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
import { zodResolver } from '@hookform/resolvers/zod'
import axios from 'axios'
import { Session } from 'next-auth'
import { DebounceInput } from 'react-debounce-input'
import { useFieldArray, useForm, useWatch } from 'react-hook-form'
import { toast } from '@/lib/toast'
import useSWR, { useSWRConfig } from 'swr'
import { z } from 'zod'

import { Button, buttonVariants } from '@shadcn/ui/button'
import { Card, CardContent } from '@shadcn/ui/card'
import { Input } from '@shadcn/ui/input'
import { Label } from '@shadcn/ui/label'
import { Spinner } from '@shadcn/ui/spinner'
import { Switch } from '@/components/ui/Switch'
import { InputGroup, InputGroupText } from '@/components/ui/InputGroup'
import { cn } from '@/lib/shadcn/utils'

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

  // NOTE: rebuilt on every render (same as the previous Yup schema) so that
  // it always validates against the latest validSkus/inValidSkus/skuQuantities/validCountries
  const validationSchema = z.object({
    firstName: z.string().min(3, { message: 'First Name to short' }).max(100, { message: 'First Name is to Long' }),
    lastName: z.string().min(3, { message: 'Last Name to short' }).max(100, { message: 'Last Name is to Long' }),
    company: z.string().max(100, { message: 'Company text is to Long' }),
    orderNumber: z.string().superRefine((val, ctx) => {
      if (!/^[a-zA-Z0-9-]+$/.test(val)) {
        ctx.addIssue({ code: 'custom', message: `Invalid special characters: % & # " ' @ ~ , ... Nor White Spaces` })
      } else if (val.length > 50) {
        ctx.addIssue({ code: 'custom', message: 'Order Number is to Long' })
      } else if (val === '') {
        ctx.addIssue({ code: 'custom', message: 'Required Order Number' })
      }
    }),
    adress1: z.string().min(1, { message: 'Required Adress' }),
    adress2: z.string(),
    city: z.string().min(1, { message: 'Required City' }),
    state: z.string().min(1, { message: 'Required State' }),
    zipCode: z.string().min(1, { message: 'Required Zip Code' }),
    country: z.string().superRefine((val, ctx) => {
      if (!validCountries.includes(val)) {
        ctx.addIssue({ code: 'custom', message: 'Must be a Valid Country Code' })
      } else if (val === '') {
        ctx.addIssue({ code: 'custom', message: 'Required Country' })
      }
    }),
    phoneNumber: state.currentRegion === 'us' ? z.string() : z.string().min(1, { message: 'Required phone number' }),
    email: z.string().superRefine((val, ctx) => {
      if (val === '') {
        ctx.addIssue({ code: 'custom', message: 'Required email' })
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
        ctx.addIssue({ code: 'custom', message: 'Invalid email' })
      }
    }),
    amount: z.string().superRefine((val, ctx) => {
      const num = Number(val)
      if (val === '' || isNaN(num)) {
        ctx.addIssue({ code: 'custom', message: 'Required Amount' })
      } else if (num < 0) {
        ctx.addIssue({ code: 'custom', message: 'Amount must be greater than or equal to 0' })
      }
    }),
    shipping: z.string().superRefine((val, ctx) => {
      const num = Number(val)
      if (val === '' || isNaN(num)) {
        ctx.addIssue({ code: 'custom', message: 'Required Shipping' })
      } else if (num < 0) {
        ctx.addIssue({ code: 'custom', message: 'Shipping must be greater than or equal to 0.1' })
      }
    }),
    tax: z.string().superRefine((val, ctx) => {
      const num = Number(val)
      if (val === '' || isNaN(num)) {
        ctx.addIssue({ code: 'custom', message: 'Required Tax' })
      } else if (num < 0) {
        ctx.addIssue({ code: 'custom', message: 'Tax must be greater than or equal to 0' })
      }
    }),
    products: z
      .array(
        z
          .object({
            sku: z.string(),
            title: z.string(),
            // kept loose on purpose: the Qty <Input> is an uncontrolled text field so the
            // live value is a string; numeric validity is enforced below in superRefine
            qty: z.custom<number>(() => true),
            price: z.string(),
          })
          .superRefine((product, ctx) => {
            if (!validSkus.includes(product.sku)) {
              ctx.addIssue({ code: 'custom', path: ['sku'], message: 'Invalid SKU or There`s No Stock Available' })
            } else if (inValidSkus.includes(product.sku)) {
              ctx.addIssue({ code: 'custom', path: ['sku'], message: 'There`s no Stock for this SKU' })
            } else if (product.sku === '') {
              ctx.addIssue({ code: 'custom', path: ['sku'], message: 'Required SKU' })
            }

            if (product.title.length > 150) {
              ctx.addIssue({ code: 'custom', path: ['title'], message: 'Name is to Long' })
            } else if (product.title === '') {
              ctx.addIssue({ code: 'custom', path: ['title'], message: 'Required Name' })
            }

            if (product.price === '' || isNaN(Number(product.price))) {
              ctx.addIssue({ code: 'custom', path: ['price'], message: 'Required Price' })
            } else if (Number(product.price) < 0) {
              ctx.addIssue({ code: 'custom', path: ['price'], message: 'Price must be greater than or equal to 0' })
            }

            const qtyNum = Number(product.qty)
            if (String(product.qty ?? '') === '' || isNaN(qtyNum)) {
              ctx.addIssue({ code: 'custom', path: ['qty'], message: 'Qty Required' })
            } else if (!Number.isInteger(qtyNum)) {
              ctx.addIssue({ code: 'custom', path: ['qty'], message: 'Qty must be an integer' })
            } else if (qtyNum < 1) {
              ctx.addIssue({ code: 'custom', path: ['qty'], message: 'Quantity must be greater than 0' })
            } else if (product.sku !== '') {
              const availableQty = skuQuantities[product.sku]
              if (!(qtyNum <= availableQty)) {
                ctx.addIssue({ code: 'custom', path: ['qty'], message: `SKU Qty is ${availableQty ? availableQty : 'Unavailable'}` })
              }
            }
          })
      )
      .min(1, { message: 'Must have products' }),
  })

  const form = useForm<OrderType>({
    resolver: zodResolver(validationSchema),
    defaultValues: initialValues,
  })

  const {
    control,
    register,
    setValue,
    formState: { errors, touchedFields },
  } = form

  const values = useWatch({ control, defaultValue: initialValues }) as OrderType

  const { fields, append, remove } = useFieldArray({ control, name: 'products' })

  const handleSubmit = async (values: OrderType) => {
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
      form.reset(initialValues)
      router.push('/Shipments')
      setCreatingOrder(false)
    } else {
      toast.error(response.data.msg)
      setCreatingOrder(false)
    }
  }

  const handlePickUpOrder = async (isPickUpOrder: boolean) => {
    if (isPickUpOrder) {
      setValue('adress1', '9629 Premier Parkway')
      setValue('adress2', 'Pickup Order')
      setValue('city', 'Miramar')
      setValue('state', 'FL')
      setValue('country', state.currentRegion == 'us' ? 'US' : 'ES')
      setValue('zipCode', '33025')
      setValue('phoneNumber', '9546134941')
    } else {
      setValue('adress1', '')
      setValue('adress2', '')
      setValue('city', '')
      setValue('state', '')
      setValue('country', state.currentRegion == 'us' ? 'US' : 'ES')
      setValue('zipCode', '')
      setValue('phoneNumber', '')
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
                  <form onSubmit={form.handleSubmit(handleSubmit)}>
                    <div className='flex flex-wrap -mx-3'>
                      <div className='flex justify-end items-center'>
                        <div className='inline-flex items-center gap-2 mb-2 md:mb-0'>
                          <Label className='font-normal' htmlFor='SwitchCheck4'>
                            Select for Local PickUp
                          </Label>
                          <Switch
                            id='SwitchCheck4'
                            onChange={async () => {
                              await handlePickUpOrder(!isPickUpOrder)
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
                              <Label htmlFor='firstNameinput' className='mb-1'>
                                *First Name
                              </Label>
                              <Input
                                type='text'
                                className='h-8 text-xs'
                                placeholder='First Name...'
                                id='firstName'
                                {...register('firstName')}
                                aria-invalid={touchedFields.firstName && errors.firstName ? true : undefined}
                              />
                              {touchedFields.firstName && errors.firstName ? (
                                <div className='m-0 text-sm text-destructive'>
                                  {errors.firstName.message}
                                </div>
                              ) : null}
                            </div>
                          </div>
                          <div className='px-3 w-full md:w-6/12'>
                            <div className='mb-3 createOrder_inputs'>
                              <Label htmlFor='lastNameinput' className='mb-1'>
                                *Last Name
                              </Label>
                              <Input
                                type='text'
                                className='h-8 text-xs'
                                placeholder='Last Name...'
                                id='lastName'
                                {...register('lastName')}
                                aria-invalid={touchedFields.lastName && errors.lastName ? true : undefined}
                              />
                              {touchedFields.lastName && errors.lastName ? (
                                <div className='m-0 text-sm text-destructive'>
                                  {errors.lastName.message}
                                </div>
                              ) : null}
                            </div>
                          </div>
                        </div>

                            {/* COMPANY */}

                            <div className='px-3 md:w-full'>
                              <div className='mb-3 createOrder_inputs'>
                                <Label htmlFor='company' className='mb-1'>
                                  Company
                                </Label>
                                <Input
                                  type='text'
                                  className='h-8 text-xs'
                                  placeholder='Company...'
                                  id='company'
                                  {...register('company')}
                                  aria-invalid={touchedFields.company && errors.company ? true : undefined}
                                />
                                {touchedFields.company && errors.company ? (
                                  <div className='m-0 text-sm text-destructive'>
                                    {errors.company.message}
                                  </div>
                                ) : null}
                              </div>
                            </div>

                            {/* ADDRESS */}

                            <div className='px-3 md:w-full'>
                              <div className='mb-3 createOrder_inputs relative'>
                                <Label htmlFor='adress1' className='mb-1'>
                                  *Address
                                </Label>
                                <DebounceInput
                                  minLength={3}
                                  debounceTimeout={500}
                                  type='text'
                                  className='h-8 text-xs'
                                  placeholder='Address...'
                                  id='adress1'
                                  readOnly={isPickUpOrder}
                                  {...register('adress1')}
                                  onChange={(e) => {
                                    register('adress1').onChange(e)
                                    handleAddressAutoComplete(e.target.value)
                                  }}
                                  value={values.adress1 || ''}
                                />
                                {touchedFields.adress1 && errors.adress1 ? <ErrorInputLabel error={errors.adress1.message} marginTop='mt-0' /> : null}
                                {!isPickUpOrder && autoCompleteAddress?.length > 0 && (
                                  <div className='absolute'>
                                    <Card>
                                      <CardContent className='flex flex-col gap-2'>
                                        {autoCompleteAddress?.map((address: any) => (
                                          <div key={address.id} className='rounded-lg'>
                                            <div className='flex justify-between items-center border-b'>
                                              <div className='flex flex-col'>
                                                <span className='text-[13px] font-semibold'>{address.properties.formatted}</span>
                                                <span className='text-[11.2px] text-muted-foreground'>{`${address.properties.street ? address.properties.street + ', ' : ''}${address.properties.city ? address.properties.city + ', ' : ''}${
                                                  address.properties.postcode ? address.properties.postcode + ', ' : ''
                                                }${address.properties.state ? address.properties.state + ', ' : ''}${address.properties.country ? address.properties.country : ''}`}</span>
                                              </div>
                                              <div className='flex justify-end items-center'>
                                                <Button
                                                  variant='info'
                                                  size='sm'
                                                  onClick={() => {
                                                    setValue('adress1', address.properties.address_line1)
                                                    setValue('city', address.properties.city)
                                                    setValue(
                                                      'state',
                                                      state.currentRegion == 'us'
                                                        ? address.properties.state_code
                                                          ? String(address.properties.state_code).toUpperCase()
                                                          : address.properties.county
                                                        : address.properties.state
                                                          ? String(address.properties.state)
                                                          : address.properties.county
                                                    )
                                                    setValue('country', String(address.properties.country_code).toUpperCase())
                                                    setValue('zipCode', address.properties.postcode)
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
                                            <span className='text-[13px] text-muted-foreground'></span>
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
                                  readOnly={isPickUpOrder}
                                  {...register('adress2')}
                                />
                                {touchedFields.adress2 && errors.adress2 ? (
                                  <div className='m-0 text-sm text-destructive'>
                                    {errors.adress2.message}
                                  </div>
                                ) : null}
                              </div>
                            </div>

                            {/* CITY, STATE, ZIP CODE AND COUNTRY */}

                            <div className='px-3 w-full'>
                              <div className='flex flex-wrap -mx-3'>
                                <div className='px-3 w-full md:w-3/12'>
                                  <div className='mb-3 createOrder_inputs'>
                                    <Label htmlFor='compnayNameinput' className='mb-1'>
                                      *City
                                    </Label>
                                    <Input
                                      type='text'
                                      className='h-8 text-xs'
                                      placeholder='City...'
                                      id='city'
                                      readOnly={isPickUpOrder}
                                      {...register('city')}
                                      aria-invalid={touchedFields.city && errors.city ? true : undefined}
                                    />
                                    {touchedFields.city && errors.city ? (
                                      <div className='m-0 text-sm text-destructive'>
                                        {errors.city.message}
                                      </div>
                                    ) : null}
                                  </div>
                                </div>
                                <div className='px-3 w-full md:w-3/12'>
                                  <div className='mb-3 createOrder_inputs'>
                                    <Label htmlFor='compnayNameinput' className='mb-1'>
                                      *Zip Code
                                    </Label>
                                    <Input
                                      type='text'
                                      className='h-8 text-xs'
                                      placeholder='Zip Code...'
                                      id='zipCode'
                                      readOnly={isPickUpOrder}
                                      {...register('zipCode')}
                                      aria-invalid={touchedFields.zipCode && errors.zipCode ? true : undefined}
                                    />
                                    {touchedFields.zipCode && errors.zipCode ? (
                                      <div className='m-0 text-sm text-destructive'>
                                        {errors.zipCode.message}
                                      </div>
                                    ) : null}
                                  </div>
                                </div>
                                <div className='px-3 w-full md:w-3/12'>
                                  <div className='mb-3 createOrder_inputs'>
                                    <Label htmlFor='compnayNameinput' className='mb-1'>
                                      *Country
                                    </Label>
                                    <SimpleSelect
                                      selected={{ label: values.country, value: values.country }}
                                      options={countries || []}
                                      handleSelect={(option: any) => {
                                        if (!option) {
                                          setValue(`country`, '', { shouldValidate: true })
                                          return
                                        }
                                        setValue(`country`, option.value, { shouldValidate: true })
                                      }}
                                      isReadOnly={isPickUpOrder}
                                      isDisabled={isPickUpOrder}
                                      placeholder='Select country...'
                                      customStyle='sm'
                                      hasError={errors.country ? true : false}
                                      isClearable
                                      menuPortalTarget={document.body}
                                    />
                                    {errors.country ? <ErrorInputLabel error={errors.country.message} marginTop='mt-0' /> : null}
                                  </div>
                                </div>
                                <div className='px-3 w-full md:w-3/12'>
                                  <div className='mb-3 createOrder_inputs'>
                                    <Label htmlFor='compnayNameinput' className='mb-1'>
                                      *State
                                    </Label>
                                    {stateList[values.country] ? (
                                      <>
                                        <SimpleSelect
                                          selected={{ label: values.state, value: values.state }}
                                          options={stateList[values.country] || []}
                                          handleSelect={(option: any) => {
                                            if (!option) {
                                              setValue(`state`, '', { shouldValidate: true })
                                              return
                                            }
                                            setValue(`state`, option.value, { shouldValidate: true })
                                          }}
                                          isReadOnly={isPickUpOrder}
                                          isDisabled={isPickUpOrder}
                                          placeholder='Select State...'
                                          customStyle='sm'
                                          hasError={errors.state ? true : false}
                                          isClearable
                                          menuPortalTarget={document.body}
                                        />
                                        {errors.state ? <ErrorInputLabel error={errors.state.message} marginTop='mt-0' /> : null}
                                      </>
                                    ) : (
                                      <>
                                        <Input
                                          type='text'
                                          className='h-8 text-xs'
                                          placeholder='State...'
                                          id='state'
                                          readOnly={isPickUpOrder}
                                          {...register('state')}
                                          aria-invalid={touchedFields.state && errors.state ? true : undefined}
                                        />
                                        {touchedFields.state && errors.state ? (
                                          <div className='m-0 text-sm text-destructive'>
                                            {errors.state.message}
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
                                    <Label htmlFor='lastNameinput' className='mb-1'>
                                      Phone #
                                    </Label>
                                    <Input
                                      type='text'
                                      className='h-8 text-xs'
                                      placeholder='Phone Number...'
                                      id='phoneNumber'
                                      readOnly={isPickUpOrder}
                                      {...register('phoneNumber')}
                                      aria-invalid={touchedFields.phoneNumber && errors.phoneNumber ? true : undefined}
                                    />
                                    {touchedFields.phoneNumber && errors.phoneNumber ? (
                                      <div className='m-0 text-sm text-destructive'>
                                        {errors.phoneNumber.message}
                                      </div>
                                    ) : null}
                                  </div>
                                </div>
                                <div className='px-3 w-full md:w-6/12'>
                                  <div className='mb-3 createOrder_inputs'>
                                    <Label htmlFor='lastNameinput' className='mb-1'>
                                      *Email
                                    </Label>
                                    <Input
                                      type='text'
                                      className='h-8 text-xs'
                                      placeholder='Email Address...'
                                      id='email'
                                      readOnly={isPickUpOrder}
                                      {...register('email')}
                                      aria-invalid={touchedFields.email && errors.email ? true : undefined}
                                    />
                                    {touchedFields.email && errors.email ? (
                                      <div className='m-0 text-sm text-destructive'>
                                        {errors.email.message}
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
                                <Label htmlFor='lastNameinput' className='mb-1'>
                                  *Order Number
                                </Label>
                                <InputGroup>
                                  <InputGroupText className='font-semibold text-[13px] py-1' id='orderNumberid'>
                                    {orderNumberStart}
                                  </InputGroupText>
                                  <Input
                                    type='text'
                                    className='h-8 text-xs'
                                    placeholder='Order Number...'
                                    aria-describedby='orderNumberid'
                                    id='orderNumber'
                                    {...register('orderNumber')}
                                    aria-invalid={touchedFields.orderNumber && errors.orderNumber ? true : undefined}
                                  />
                                </InputGroup>
                                {touchedFields.orderNumber && errors.orderNumber ? (
                                  <div className='m-0 text-sm text-destructive'>
                                    {errors.orderNumber.message}
                                  </div>
                                ) : null}
                              </div>
                            </div>
                            <div className='px-3 w-full md:w-6/12 mt-4'>
                              <div className='mb-3 createOrder_inputs'>
                                <Label htmlFor='lastNameinput' className='mb-2'>
                                  *Amount Paid
                                </Label>
                                <Input
                                  type='text'
                                  className='h-8 text-xs'
                                  placeholder='Amount...'
                                  id='amount'
                                  {...register('amount')}
                                  aria-invalid={touchedFields.amount && errors.amount ? true : undefined}
                                />
                                {touchedFields.amount && errors.amount ? <div className='text-sm text-destructive'>{errors.amount.message}</div> : null}
                              </div>
                              <div className='mb-3 createOrder_inputs'>
                                <Label htmlFor='lastNameinput' className='mb-2'>
                                  *Shipping Paid
                                </Label>
                                <Input
                                  type='text'
                                  className='h-8 text-xs'
                                  placeholder='Shipping...'
                                  id='shipping'
                                  {...register('shipping')}
                                  aria-invalid={touchedFields.shipping && errors.shipping ? true : undefined}
                                />
                                {touchedFields.shipping && errors.shipping ? <div className='text-sm text-destructive'>{errors.shipping.message}</div> : null}
                              </div>
                              <div className='mb-3 createOrder_inputs'>
                                <Label htmlFor='lastNameinput' className='mb-2'>
                                  *Tax Paid
                                </Label>
                                <Input
                                  type='text'
                                  className='h-8 text-xs'
                                  placeholder='Tax...'
                                  id='tax'
                                  {...register('tax')}
                                  aria-invalid={touchedFields.tax && errors.tax ? true : undefined}
                                />
                                {touchedFields.tax && errors.tax ? <div className='text-sm text-destructive'>{errors.tax.message}</div> : null}
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
                                  {fields.map((field, index) => (
                                    <tr key={field.id}>
                                      <td style={{ minWidth: '50px' }}>
                                        {index > 0 ? (
                                          <div className='flex flex-wrap -mx-3 w-full flex flex-row flex-nowrap justify-center gap-1 items-center mb-0'>
                                            <button
                                              type='button'
                                              aria-label='Add product row'
                                              className={cn(buttonVariants({ variant: 'link' }), 'border-0 bg-transparent text-success m-0 p-0 w-auto')}
                                              onClick={() =>
                                                append({
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
                                              className={cn(buttonVariants({ variant: 'link' }), 'border-0 bg-transparent text-destructive m-0 p-0 w-auto')}
                                              onClick={() => remove(index)}>
                                              <i className='text-[22.75px] las la-minus-circle m-0 p-0' />
                                            </button>
                                          </div>
                                        ) : (
                                          <div className='flex flex-wrap -mx-3 w-full flex flex-row flex-nowrap justify-center gap-0 items-center mb-0'>
                                            <button
                                              type='button'
                                              aria-label='Add product row'
                                              className={cn(buttonVariants({ variant: 'link' }), 'border-0 bg-transparent text-success m-0 p-0 w-auto')}
                                              onClick={() =>
                                                append({
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
                                        <div className='mb-3 createOrder_inputs'>
                                          <SimpleSelect
                                            selected={{ label: values.products[index]?.sku, value: values.products[index]?.sku }}
                                            options={skus.map((sku: { sku: string; name: string }) => ({ label: sku.sku, value: sku.sku, description: sku.name }))}
                                            handleSelect={(option: any) => {
                                              if (!option) {
                                                setValue(`products.${index}.sku`, '', { shouldValidate: true })
                                                setValue(`products.${index}.title`, '', { shouldValidate: true })
                                                return
                                              }
                                              setValue(`products.${index}.sku`, option.value, { shouldValidate: true })
                                              setValue(`products.${index}.title`, skusTitles[option.value], { shouldValidate: true })
                                            }}
                                            placeholder='Select SKU...'
                                            customStyle='sm'
                                            hasError={errors.products?.[index]?.sku ? true : false}
                                            isClearable
                                            menuPortalTarget={document.body}
                                          />
                                          {errors.products?.[index]?.sku ? <ErrorInputLabel error={errors.products[index].sku?.message} marginTop='mt-0' /> : null}
                                        </div>
                                      </td>
                                      <td style={{ minWidth: '200px' }}>
                                        <div className='mb-3 createOrder_inputs'>
                                          <Input
                                            type='text'
                                            className='h-8 text-xs'
                                            placeholder='Title...'
                                            list='skuNames'
                                            readOnly
                                            {...register(`products.${index}.title`)}
                                            value={values.products[index]?.title?.split(' -||- ')[0] || ''}
                                            aria-invalid={touchedFields.products?.[index]?.title && errors.products?.[index]?.title ? true : undefined}
                                          />
                                          {touchedFields.products?.[index]?.title && errors.products?.[index]?.title ? (
                                            <div className='m-0 text-sm text-destructive'>
                                              {errors.products[index].title?.message}
                                            </div>
                                          ) : null}
                                        </div>
                                      </td>
                                      <td style={{ minWidth: '80px' }}>
                                        <div className='mb-3 createOrder_inputs'>
                                          <Input
                                            type='text'
                                            className='h-8 text-xs'
                                            placeholder='Price...'
                                            {...register(`products.${index}.price`)}
                                            aria-invalid={touchedFields.products?.[index]?.price && errors.products?.[index]?.price ? true : undefined}
                                          />
                                          {touchedFields.products?.[index]?.price && errors.products?.[index]?.price ? (
                                            <div className='m-0 text-sm text-destructive'>
                                              {errors.products[index].price?.message}
                                            </div>
                                          ) : null}
                                        </div>
                                      </td>
                                      <td style={{ minWidth: '80px' }}>
                                        <div className='mb-3 createOrder_inputs'>
                                          <Input
                                            type='text'
                                            className='h-8 text-xs text-center'
                                            max={skuQuantities[values.products[index]?.sku]}
                                            placeholder='Qty...'
                                            {...register(`products.${index}.qty`)}
                                            aria-invalid={touchedFields.products?.[index]?.qty && errors.products?.[index]?.qty ? true : undefined}
                                          />
                                          {touchedFields.products?.[index]?.qty && errors.products?.[index]?.qty ? (
                                            <div className='m-0 text-sm text-destructive text-wrap'>
                                              {errors.products[index].qty?.message}
                                            </div>
                                          ) : null}
                                        </div>
                                      </td>
                                      <td className='text-right' style={{ minWidth: '80px' }}>
                                        {FormatCurrency(state.currentRegion, Number(values.products[index]?.qty) * Number(values.products[index]?.price))}
                                      </td>
                                    </tr>
                                  ))}
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
                                        values.products.reduce((acc: number, product: any) => acc + Number(product.qty) * Number(product.price), 0)
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
                          <p className='text-[13px] mb-0 text-muted-foreground'>*You must complete all required fields or you will not be able to create your product.</p>
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
                  </form>
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
