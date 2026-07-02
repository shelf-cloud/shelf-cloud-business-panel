 
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
import { Field, FieldArray, Form, Formik } from 'formik'
import { toast } from 'react-toastify'
import { Button, Card, CardBody, Col, Container, FormFeedback, FormGroup, Input, Label, Row, Spinner } from '@/components/migration-ui'
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
          <Container fluid>
            <BreadCrumb title='Create New Kit' pageTitle='Inventory' />
            <Card>
              <CardBody className='px-4'>
                {!isLoading ? (
                  <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={(values, { resetForm }) => handleSubmit(values, { resetForm })}>
                    {({ values, errors, touched, handleChange, handleBlur, setFieldValue }) => (
                      <Form>
                        <Row>
                          <h5 className='text-[16.25px] mb-4 font-extrabold'>New Kit Details</h5>
                          <Col md={6}>
                            <FormGroup>
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
                                invalid={touched.title && errors.title ? true : false}
                              />
                              {touched.title && errors.title ? <FormFeedback type='invalid'>{errors.title}</FormFeedback> : null}
                            </FormGroup>
                          </Col>
                          <Col md={6}>
                            <FormGroup>
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
                                invalid={touched.sku && errors.sku ? true : false}
                              />
                              {touched.sku && errors.sku ? <FormFeedback type='invalid'>{errors.sku}</FormFeedback> : null}
                            </FormGroup>
                          </Col>
                          <Col md={4}>
                            <FormGroup>
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
                                invalid={touched.asin && errors.asin ? true : false}
                              />
                              {touched.asin && errors.asin ? <FormFeedback type='invalid'>{errors.asin}</FormFeedback> : null}
                            </FormGroup>
                          </Col>
                          <Col md={4}>
                            <FormGroup>
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
                                invalid={touched.fnsku && errors.fnsku ? true : false}
                              />
                              {touched.fnsku && errors.fnsku ? <FormFeedback type='invalid'>{errors.fnsku}</FormFeedback> : null}
                            </FormGroup>
                          </Col>
                          <Col md={4}>
                            <FormGroup>
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
                                invalid={touched.barcode && errors.barcode ? true : false}
                              />
                              {touched.barcode && errors.barcode ? <FormFeedback type='invalid'>{errors.barcode}</FormFeedback> : null}
                            </FormGroup>
                          </Col>
                          <Col md={12}>
                            <FormGroup>
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
                                invalid={touched.image && errors.image ? true : false}
                              />
                              {touched.image && errors.image ? <FormFeedback type='invalid'>{errors.image}</FormFeedback> : null}
                            </FormGroup>
                          </Col>
                          <h5 className='text-[16.25px] my-4 font-extrabold'>Unit Dimensions</h5>
                          <Col md={3}>
                            <FormGroup>
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
                                invalid={touched.weight && errors.weight ? true : false}
                              />
                              {touched.weight && errors.weight ? <FormFeedback type='invalid'>{errors.weight}</FormFeedback> : null}
                            </FormGroup>
                          </Col>
                          <Col md={3}>
                            <FormGroup>
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
                                invalid={touched.width && errors.width ? true : false}
                              />
                              {touched.width && errors.width ? <FormFeedback type='invalid'>{errors.width}</FormFeedback> : null}
                            </FormGroup>
                          </Col>
                          <Col md={3}>
                            <FormGroup>
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
                                invalid={touched.length && errors.length ? true : false}
                              />
                              {touched.length && errors.length ? <FormFeedback type='invalid'>{errors.length}</FormFeedback> : null}
                            </FormGroup>
                          </Col>
                          <Col md={3}>
                            <FormGroup>
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
                                invalid={touched.height && errors.height ? true : false}
                              />
                              {touched.height && errors.height ? <FormFeedback type='invalid'>{errors.height}</FormFeedback> : null}
                            </FormGroup>
                          </Col>
                          <h5 className='text-[16.25px] my-4 font-extrabold'>Master Box Dimensions</h5>
                          <Col md={3}>
                            <FormGroup>
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
                                invalid={touched.boxweight && errors.boxweight ? true : false}
                              />
                              {touched.boxweight && errors.boxweight ? <FormFeedback type='invalid'>{errors.boxweight}</FormFeedback> : null}
                            </FormGroup>
                          </Col>
                          <Col md={3}>
                            <FormGroup>
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
                                invalid={touched.boxwidth && errors.boxwidth ? true : false}
                              />
                              {touched.boxwidth && errors.boxwidth ? <FormFeedback type='invalid'>{errors.boxwidth}</FormFeedback> : null}
                            </FormGroup>
                          </Col>
                          <Col md={3}>
                            <FormGroup>
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
                                invalid={touched.boxlength && errors.boxlength ? true : false}
                              />
                              {touched.boxlength && errors.boxlength ? <FormFeedback type='invalid'>{errors.boxlength}</FormFeedback> : null}
                            </FormGroup>
                          </Col>
                          <Col md={3}>
                            <FormGroup>
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
                                invalid={touched.boxheight && errors.boxheight ? true : false}
                              />
                              {touched.boxheight && errors.boxheight ? <FormFeedback type='invalid'>{errors.boxheight}</FormFeedback> : null}
                            </FormGroup>
                          </Col>
                          <Col md={3}>
                            <FormGroup>
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
                                invalid={touched.boxqty && errors.boxqty ? true : false}
                              />
                              {touched.boxqty && errors.boxqty ? <FormFeedback type='invalid'>{errors.boxqty}</FormFeedback> : null}
                            </FormGroup>
                          </Col>
                          <Row>
                            <h5 className='text-[16.25px] mb-4 font-extrabold'>Kit Children</h5>
                            <Col xl={12} className='p-0 mt-1'>
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
                                                <Row className='w-full flex flex-row flex-nowrap justify-center gap-1 items-center mb-0'>
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
                                                </Row>
                                              ) : (
                                                <Row className='w-full flex flex-row flex-nowrap justify-center gap-0 items-center mb-0'>
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
                                                </Row>
                                              )}
                                            </td>
                                            <td style={{ minWidth: '200px' }}>
                                              <Field name={`children.${index}.sku`}>
                                                {({ meta }: any) => (
                                                  <FormGroup className='createOrder_inputs'>
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
                                                  </FormGroup>
                                                )}
                                              </Field>
                                            </td>
                                            <td style={{ minWidth: '200px' }}>
                                              <Field name={`children.${index}.title`}>
                                                {({ meta }: any) => (
                                                  <FormGroup className='createOrder_inputs'>
                                                    <Input
                                                      type='text'
                                                      className='text-[13px]'
                                                      name={`children.${index}.title`}
                                                      placeholder='Title...'
                                                      readOnly
                                                      onChange={handleChange}
                                                      onBlur={handleBlur}
                                                      value={values.children[index].title || ''}
                                                      invalid={meta.touched && meta.error ? true : false}
                                                    />
                                                    {meta.touched && meta.error ? <FormFeedback type='invalid'>{meta.error}</FormFeedback> : null}
                                                  </FormGroup>
                                                )}
                                              </Field>
                                            </td>
                                            <td style={{ minWidth: '80px' }}>
                                              <Field name={`children.${index}.qty`}>
                                                {({ meta }: any) => (
                                                  <FormGroup className='createOrder_inputs'>
                                                    <Input
                                                      type='text'
                                                      className='text-center text-[13px]'
                                                      name={`children.${index}.qty`}
                                                      placeholder='Qty...'
                                                      onChange={handleChange}
                                                      onBlur={handleBlur}
                                                      value={values.children[index].qty || ''}
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
                          <h5 className='text-[13px] my-0 text-[color:var(--bs-secondary-color)] font-normal'>*You must complete all required fields or you will not be able to create your product.</h5>
                          <Col md={12}>
                            <div className='text-right'>
                              <Button type='submit' color='primary' disabled={creatingKit}>
                                {creatingKit ? (
                                  <span className='flex items-center gap-2'>
                                    <Spinner color='light' size={'sm'} /> Creating...
                                  </span>
                                ) : (
                                  'Create Kit'
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

export default AddKit
