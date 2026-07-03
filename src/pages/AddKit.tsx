 
import { GetServerSideProps } from 'next'
import Head from 'next/head'
import router from 'next/router'
import React, { useContext, useState } from 'react'

import { getSession } from '@auth/client'
import BreadCrumb from '@components/Common/BreadCrumb'
import SimpleSelect from '@components/Common/SimpleSelect'
import ErrorInputLabel from '@components/ui/forms/ErrorInputLabel'
import AppContext from '@context/AppContext'
import { useCreateKit } from '@hooks/kits/useCreateKit'
import axios from 'axios'
import { Field, FieldArray, Formik } from 'formik'
import { toast } from 'react-toastify'
import { Button } from '@shadcn/ui/button'
import { Card, CardContent } from '@shadcn/ui/card'
import { Input } from '@shadcn/ui/input'
import { Label } from '@shadcn/ui/label'
import { Spinner } from '@shadcn/ui/spinner'
import * as Yup from 'yup'

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
      businessName: string
    }
  }
}

const AddKit = ({ session }: Props) => {
  const { state }: any = useContext(AppContext)
  const { skus, validSkus, skuInfo, isLoading } = useCreateKit()
  const title = `Create New Kit | ${session?.user?.businessName}`
  const [creatingKit, setCreatingKit] = useState(false)

  const initialValues = {
    title: '',
    sku: '',
    image: '',
    asin: '',
    fnsku: '',
    barcode: '',
    weight: '',
    width: '',
    length: '',
    height: '',
    boxqty: '',
    boxweight: '',
    boxlength: '',
    boxwidth: '',
    boxheight: '',
    children: [
      {
        sku: '',
        title: '',
        qty: 1,
        inventoryId: 0,
      },
    ],
  }

  const validationSchema = Yup.object({
    title: Yup.string()
      .matches(/^[a-zA-Z0-9-Á-öø-ÿ\s]+$/, `Invalid special characters: " ' @ ~ , ...`)
      .max(100, 'Title is to Long')
      .required('Please Enter Your Title'),
    sku: Yup.string()
      .matches(/^[a-zA-Z0-9-\s]+$/, `Invalid special characters: " ' @ ~ , ...`)
      .max(50, 'SKU is to Long')
      .required('Please Enter Your Sku'),
    image: Yup.string().url(),
    asin: Yup.string().max(50, 'Asin is to Long'),
    fnsku: Yup.string().max(50, 'Fnsku is to Long'),
    barcode: Yup.string().max(50, 'barcode is to Long').required('Please Enter Your Barcode'),
    weight: Yup.number().required('Please Enter Your Weight').positive('Value must be grater than 0'),
    width: Yup.number().required('Please Enter Your Width').positive('Value must be grater than 0'),
    length: Yup.number().required('Please Enter Your Length').positive('Value must be grater than 0'),
    height: Yup.number().required('Please Enter Your Height').positive('Value must be grater than 0'),
    boxqty: Yup.number().required('Please Enter Your Box Qty').positive('Value must be grater than 0').integer('Only integers'),
    boxweight: Yup.number().required('Please Enter Your Box Eeight').positive('Value must be grater than 0'),
    boxwidth: Yup.number().required('Please Enter Your Box Width').positive('Value must be grater than 0'),
    boxlength: Yup.number().required('Please Enter Your Box Length').positive('Value must be grater than 0'),
    boxheight: Yup.number().required('Please Enter Your Box Height').positive('Value must be grater than 0'),
    children: Yup.array()
      .of(
        Yup.object({
          sku: Yup.string().oneOf(validSkus, 'Invalid SKU').required('Required SKU'),
          title: Yup.string().max(100, 'Name is to Long').required('Required Name'),
          qty: Yup.number().positive().integer('Qty must be an integer').min(1, 'Quantity must be greater than 0').required('Required Quantity'),
        })
      )
      .required('Must have products'),
  })

  const handleSubmit = async (values: any, { resetForm }: any) => {
    setCreatingKit(true)
    const creatingKit = toast.loading('Creating Kit...')

    const ChildrenSkus: String[] = await values.children.map((child: any) => {
      return child.sku
    })

    if (
      values.children.some((child: any) => {
        const count = ChildrenSkus.filter((sku) => sku == child.sku)
        if (count.length > 1) {
          return true
        } else {
          return false
        }
      })
    ) {
      toast.update(creatingKit, {
        render: 'Duplicate SKUs found in Children List',
        type: 'error',
        isLoading: false,
        autoClose: 3000,
      })
      setCreatingKit(false)
      return
    }

    const { data } = await axios.post(`/api/kits/createNewKit?region=${state.currentRegion}&businessId=${state.user.businessId}`, {
      orderInfo: values,
    })
    if (!data.error) {
      toast.update(creatingKit, {
        render: data.message,
        type: 'success',
        isLoading: false,
        autoClose: 3000,
      })
      resetForm()
      router.push('/Kits')
    } else {
      toast.update(creatingKit, {
        render: data.message,
        type: 'error',
        isLoading: false,
        autoClose: 3000,
      })
    }
    setCreatingKit(false)
  }

  return (
    <div>
      <Head>
        <title>{title}</title>
      </Head>
      <React.Fragment>
        <div className='page-content'>
          <div className='mx-auto w-full px-3'>
            <BreadCrumb title='Create New Kit' pageTitle='Inventory' />
            <Card>
              <CardContent className='px-4'>
                {!isLoading ? (
                  <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={(values, { resetForm }) => handleSubmit(values, { resetForm })}>
                    {({ values, errors, touched, handleChange, handleBlur, setFieldValue }) => (
                      <form>
                        <div className='flex flex-wrap -mx-3'>
                          <h5 className='text-[16.25px] mb-4 font-extrabold'>New Kit Details</h5>
                          <div className='px-3 md:w-6/12'>
                            <div className='mb-3'>
                              <Label htmlFor='title' className='mb-1'>
                                *Title
                              </Label>
                              <Input
                                type='text'
                                className='text-[13px]'
                                placeholder='Title...'
                                id='title'
                                name='title'
                                onChange={handleChange}
                                onBlur={handleBlur}
                                value={values.title || ''}
                                aria-invalid={(touched.title && errors.title ? true : false) || undefined}
                              />
                              {touched.title && errors.title ? <div className='text-sm text-destructive'>{errors.title}</div> : null}
                            </div>
                          </div>
                          <div className='px-3 md:w-6/12'>
                            <div className='mb-3'>
                              <Label htmlFor='sku' className='mb-1'>
                                *SKU
                              </Label>
                              <Input
                                type='text'
                                className='text-[13px]'
                                placeholder='Sku...'
                                id='sku'
                                name='sku'
                                onChange={handleChange}
                                onBlur={handleBlur}
                                value={values.sku || ''}
                                aria-invalid={(touched.sku && errors.sku ? true : false) || undefined}
                              />
                              {touched.sku && errors.sku ? <div className='text-sm text-destructive'>{errors.sku}</div> : null}
                            </div>
                          </div>
                          <div className='px-3 md:w-4/12'>
                            <div className='mb-3'>
                              <Label htmlFor='asin' className='mb-1'>
                                ASIN
                              </Label>
                              <Input
                                type='text'
                                className='text-[13px]'
                                placeholder='Asin...'
                                id='asin'
                                name='asin'
                                onChange={handleChange}
                                onBlur={handleBlur}
                                value={values.asin || ''}
                                aria-invalid={(touched.asin && errors.asin ? true : false) || undefined}
                              />
                              {touched.asin && errors.asin ? <div className='text-sm text-destructive'>{errors.asin}</div> : null}
                            </div>
                          </div>
                          <div className='px-3 md:w-4/12'>
                            <div className='mb-3'>
                              <Label htmlFor='fnsku' className='mb-1'>
                                FNSKU
                              </Label>
                              <Input
                                type='text'
                                className='text-[13px]'
                                placeholder='Fnsku...'
                                id='fnsku'
                                name='fnsku'
                                onChange={handleChange}
                                onBlur={handleBlur}
                                value={values.fnsku || ''}
                                aria-invalid={(touched.fnsku && errors.fnsku ? true : false) || undefined}
                              />
                              {touched.fnsku && errors.fnsku ? <div className='text-sm text-destructive'>{errors.fnsku}</div> : null}
                            </div>
                          </div>
                          <div className='px-3 md:w-4/12'>
                            <div className='mb-3'>
                              <Label htmlFor='barcode' className='mb-1'>
                                UPC / Barcode
                              </Label>
                              <Input
                                type='text'
                                className='text-[13px]'
                                placeholder='Barcode...'
                                id='barcode'
                                name='barcode'
                                onChange={handleChange}
                                onBlur={handleBlur}
                                value={values.barcode || ''}
                                aria-invalid={(touched.barcode && errors.barcode ? true : false) || undefined}
                              />
                              {touched.barcode && errors.barcode ? <div className='text-sm text-destructive'>{errors.barcode}</div> : null}
                            </div>
                          </div>
                          <div className='px-3 md:w-full'>
                            <div className='mb-3'>
                              <Label htmlFor='image' className='mb-1'>
                                Product Image
                              </Label>
                              <Input
                                type='text'
                                className='text-[13px]'
                                placeholder='Image URL...'
                                id='image'
                                name='image'
                                onChange={handleChange}
                                onBlur={handleBlur}
                                value={values.image || ''}
                                aria-invalid={(touched.image && errors.image ? true : false) || undefined}
                              />
                              {touched.image && errors.image ? <div className='text-sm text-destructive'>{errors.image}</div> : null}
                            </div>
                          </div>
                          <h5 className='text-[16.25px] my-4 font-extrabold'>Unit Dimensions</h5>
                          <div className='px-3 md:w-3/12'>
                            <div className='mb-3'>
                              <Label htmlFor='weight' className='mb-1'>
                                *Weight {state.currentRegion !== '' && (state.currentRegion == 'us' ? '(lb)' : '(kg)')}
                              </Label>
                              <Input
                                type='number'
                                className='text-[13px]'
                                placeholder='Weight...'
                                id='weight'
                                name='weight'
                                onChange={handleChange}
                                onBlur={handleBlur}
                                value={values.weight || ''}
                                aria-invalid={(touched.weight && errors.weight ? true : false) || undefined}
                              />
                              {touched.weight && errors.weight ? <div className='text-sm text-destructive'>{errors.weight}</div> : null}
                            </div>
                          </div>
                          <div className='px-3 md:w-3/12'>
                            <div className='mb-3'>
                              <Label htmlFor='width' className='mb-1'>
                                *Width {state.currentRegion !== '' && (state.currentRegion == 'us' ? '(in)' : '(cm)')}
                              </Label>
                              <Input
                                type='number'
                                className='text-[13px]'
                                placeholder='Width...'
                                id='width'
                                name='width'
                                onChange={handleChange}
                                onBlur={handleBlur}
                                value={values.width || ''}
                                aria-invalid={(touched.width && errors.width ? true : false) || undefined}
                              />
                              {touched.width && errors.width ? <div className='text-sm text-destructive'>{errors.width}</div> : null}
                            </div>
                          </div>
                          <div className='px-3 md:w-3/12'>
                            <div className='mb-3'>
                              <Label htmlFor='length' className='mb-1'>
                                *Length {state.currentRegion !== '' && (state.currentRegion == 'us' ? '(in)' : '(cm)')}
                              </Label>
                              <Input
                                type='number'
                                className='text-[13px]'
                                placeholder='Length...'
                                id='length'
                                name='length'
                                onChange={handleChange}
                                onBlur={handleBlur}
                                value={values.length || ''}
                                aria-invalid={(touched.length && errors.length ? true : false) || undefined}
                              />
                              {touched.length && errors.length ? <div className='text-sm text-destructive'>{errors.length}</div> : null}
                            </div>
                          </div>
                          <div className='px-3 md:w-3/12'>
                            <div className='mb-3'>
                              <Label htmlFor='height' className='mb-1'>
                                *Height {state.currentRegion !== '' && (state.currentRegion == 'us' ? '(in)' : '(cm)')}
                              </Label>
                              <Input
                                type='number'
                                className='text-[13px]'
                                placeholder='Height...'
                                id='height'
                                name='height'
                                onChange={handleChange}
                                onBlur={handleBlur}
                                value={values.height || ''}
                                aria-invalid={(touched.height && errors.height ? true : false) || undefined}
                              />
                              {touched.height && errors.height ? <div className='text-sm text-destructive'>{errors.height}</div> : null}
                            </div>
                          </div>
                          <h5 className='text-[16.25px] my-4 font-extrabold'>Master Box Dimensions</h5>
                          <div className='px-3 md:w-3/12'>
                            <div className='mb-3'>
                              <Label htmlFor='boxweight' className='mb-1'>
                                *Box Weight {state.currentRegion !== '' && (state.currentRegion == 'us' ? '(lb)' : '(kg)')}
                              </Label>
                              <Input
                                type='number'
                                className='text-[13px]'
                                placeholder='Box Weight...'
                                id='boxweight'
                                name='boxweight'
                                onChange={handleChange}
                                onBlur={handleBlur}
                                value={values.boxweight || ''}
                                aria-invalid={(touched.boxweight && errors.boxweight ? true : false) || undefined}
                              />
                              {touched.boxweight && errors.boxweight ? <div className='text-sm text-destructive'>{errors.boxweight}</div> : null}
                            </div>
                          </div>
                          <div className='px-3 md:w-3/12'>
                            <div className='mb-3'>
                              <Label htmlFor='boxwidth' className='mb-1'>
                                *Box Width {state.currentRegion !== '' && (state.currentRegion == 'us' ? '(in)' : '(cm)')}
                              </Label>
                              <Input
                                type='number'
                                className='text-[13px]'
                                placeholder='Box Width...'
                                id='boxwidth'
                                name='boxwidth'
                                onChange={handleChange}
                                onBlur={handleBlur}
                                value={values.boxwidth || ''}
                                aria-invalid={(touched.boxwidth && errors.boxwidth ? true : false) || undefined}
                              />
                              {touched.boxwidth && errors.boxwidth ? <div className='text-sm text-destructive'>{errors.boxwidth}</div> : null}
                            </div>
                          </div>
                          <div className='px-3 md:w-3/12'>
                            <div className='mb-3'>
                              <Label htmlFor='boxlength' className='mb-1'>
                                *Box Length {state.currentRegion !== '' && (state.currentRegion == 'us' ? '(in)' : '(cm)')}
                              </Label>
                              <Input
                                type='number'
                                className='text-[13px]'
                                placeholder='Box Length...'
                                id='boxlength'
                                name='boxlength'
                                onChange={handleChange}
                                onBlur={handleBlur}
                                value={values.boxlength || ''}
                                aria-invalid={(touched.boxlength && errors.boxlength ? true : false) || undefined}
                              />
                              {touched.boxlength && errors.boxlength ? <div className='text-sm text-destructive'>{errors.boxlength}</div> : null}
                            </div>
                          </div>
                          <div className='px-3 md:w-3/12'>
                            <div className='mb-3'>
                              <Label htmlFor='boxheight' className='mb-1'>
                                *Box Height {state.currentRegion !== '' && (state.currentRegion == 'us' ? '(in)' : '(cm)')}
                              </Label>
                              <Input
                                type='number'
                                className='text-[13px]'
                                placeholder='Box Height...'
                                id='boxheight'
                                name='boxheight'
                                onChange={handleChange}
                                onBlur={handleBlur}
                                value={values.boxheight || ''}
                                aria-invalid={(touched.boxheight && errors.boxheight ? true : false) || undefined}
                              />
                              {touched.boxheight && errors.boxheight ? <div className='text-sm text-destructive'>{errors.boxheight}</div> : null}
                            </div>
                          </div>
                          <div className='px-3 md:w-3/12'>
                            <div className='mb-3'>
                              <Label htmlFor='boxqty' className='mb-1'>
                                *Master Box Quantity
                              </Label>
                              <Input
                                type='number'
                                className='text-[13px]'
                                placeholder='Box Qty...'
                                id='boxqty'
                                name='boxqty'
                                onChange={handleChange}
                                onBlur={handleBlur}
                                value={values.boxqty || ''}
                                aria-invalid={(touched.boxqty && errors.boxqty ? true : false) || undefined}
                              />
                              {touched.boxqty && errors.boxqty ? <div className='text-sm text-destructive'>{errors.boxqty}</div> : null}
                            </div>
                          </div>
                          <div className='flex flex-wrap -mx-3'>
                            <h5 className='text-[16.25px] mb-4 font-extrabold'>Kit Children</h5>
                            <div className='px-3 xl:w-full p-0 mt-1'>
                              <table className='w-full align-middle text-nowrap [&_th]:px-2 [&_td]:px-2'>
                                <thead>
                                  <tr>
                                    <th scope='col' className='py-1 text-[16.25px] m-0 font-semibold text-center bg-primary text-white'></th>
                                    <th scope='col' className='py-1 text-[16.25px] m-0 font-semibold text-center bg-primary text-white'>
                                      SKU
                                    </th>
                                    <th scope='col' className='py-1 text-[16.25px] m-0 font-semibold text-center bg-primary text-white'>
                                      Title
                                    </th>
                                    <th scope='col' className='py-1 text-[16.25px] m-0 font-semibold text-center bg-primary text-white'>
                                      Qty
                                    </th>
                                  </tr>
                                </thead>
                                <tbody>
                                  <FieldArray name='children'>
                                    {({ remove, push }) => (
                                      <>
                                        {values.children.map((_product, index) => (
                                          <tr key={index}>
                                            <td style={{ minWidth: '50px' }}>
                                              {index > 0 ? (
                                                <div className='flex flex-wrap -mx-3 w-full flex flex-row flex-nowrap justify-center gap-1 items-center mb-0'>
                                                  <i
                                                    className='text-[22.75px] text-success las la-plus-circle m-0 p-0 w-auto'
                                                    style={{ cursor: 'pointer' }}
                                                    onClick={() =>
                                                      push({
                                                        sku: '',
                                                        title: '',
                                                        qty: 1,
                                                        inventoryId: 0,
                                                      })
                                                    }
                                                  />
                                                  <i className='text-danger text-[22.75px] las la-minus-circle m-0 p-0 w-auto' style={{ cursor: 'pointer' }} onClick={() => remove(index)} />
                                                </div>
                                              ) : (
                                                <div className='flex flex-wrap -mx-3 w-full flex flex-row flex-nowrap justify-center gap-0 items-center mb-0'>
                                                  <i
                                                    className='text-[22.75px] text-success las la-plus-circle m-0 p-0 w-auto'
                                                    style={{ cursor: 'pointer' }}
                                                    onClick={() =>
                                                      push({
                                                        sku: '',
                                                        title: '',
                                                        qty: 1,
                                                        inventoryId: 0,
                                                      })
                                                    }
                                                  />
                                                </div>
                                              )}
                                            </td>
                                            <td style={{ minWidth: '200px' }}>
                                              <Field name={`children.${index}.sku`}>
                                                {({ meta }: any) => (
                                                  <div className='mb-3 createOrder_inputs'>
                                                    <SimpleSelect
                                                      selected={{ label: values.children[index].sku, value: values.children[index].sku }}
                                                      options={skus.map((sku) => ({ label: sku.sku, value: sku.sku, description: sku.title }))}
                                                      handleSelect={(option: any) => {
                                                        if (!option) {
                                                          setFieldValue(`children.${index}.sku`, '')
                                                          setFieldValue(`children.${index}.title`, '')
                                                          setFieldValue(`children.${index}.inventoryId`, 0)
                                                          return
                                                        }
                                                        setFieldValue(`children.${index}.sku`, option.value)
                                                        setFieldValue(`children.${index}.title`, skuInfo[option.value].title)
                                                        setFieldValue(`children.${index}.inventoryId`, skuInfo[option.value].inventoryId)
                                                      }}
                                                      placeholder='Select SKU...'
                                                      customStyle='sm'
                                                      hasError={meta.error ? true : false}
                                                      isClearable
                                                      menuPortalTarget={document?.body}
                                                    />
                                                    {meta.error ? <ErrorInputLabel error={meta.error} marginTop='mt-0' /> : null}
                                                  </div>
                                                )}
                                              </Field>
                                            </td>
                                            <td style={{ minWidth: '200px' }}>
                                              <Field name={`children.${index}.title`}>
                                                {({ meta }: any) => (
                                                  <div className='mb-3 createOrder_inputs'>
                                                    <Input
                                                      type='text'
                                                      className='text-[13px]'
                                                      name={`children.${index}.title`}
                                                      placeholder='Title...'
                                                      readOnly
                                                      onChange={handleChange}
                                                      onBlur={handleBlur}
                                                      value={values.children[index].title || ''}
                                                      aria-invalid={(meta.touched && meta.error ? true : false) || undefined}
                                                    />
                                                    {meta.touched && meta.error ? <div className='text-sm text-destructive'>{meta.error}</div> : null}
                                                  </div>
                                                )}
                                              </Field>
                                            </td>
                                            <td style={{ minWidth: '80px' }}>
                                              <Field name={`children.${index}.qty`}>
                                                {({ meta }: any) => (
                                                  <div className='mb-3 createOrder_inputs'>
                                                    <Input
                                                      type='text'
                                                      className='text-center text-[13px]'
                                                      name={`children.${index}.qty`}
                                                      placeholder='Qty...'
                                                      onChange={handleChange}
                                                      onBlur={handleBlur}
                                                      value={values.children[index].qty || ''}
                                                      aria-invalid={(meta.touched && meta.error ? true : false) || undefined}
                                                    />
                                                    {meta.touched && meta.error ? <div className='text-sm text-destructive'>{meta.error}</div> : null}
                                                  </div>
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
                            </div>
                          </div>
                          <h5 className='text-[13px] my-0 text-[color:var(--bs-secondary-color)] font-normal'>*You must complete all required fields or you will not be able to create your product.</h5>
                          <div className='px-3 md:w-full'>
                            <div className='text-right'>
                              <Button type='submit' disabled={creatingKit}>
                                {creatingKit ? (
                                  <span className='flex items-center gap-2'>
                                    <Spinner className='text-white' /> Creating...
                                  </span>
                                ) : (
                                  'Create Kit'
                                )}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </form>
                    )}
                  </Formik>
                ) : (
                  <div className='flex flex-wrap -mx-3'>
                    <h5>Loading...</h5>
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

export default AddKit
