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
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.min.css'
import useSWR from 'swr'
import router from 'next/router'

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

const AddKit = ({ session }: Props) => {
  const { state }: any = useContext(AppContext)
  const title = `Add Product | ${session?.user?.name}`
  const [ready, setReady] = useState(false)
  const [creatingKit, setCreatingKit] = useState(false)
  const [skus, setSkus] = useState([])
  const [skusTitles, setSkusTitles] = useState<any>({})
  const [skuQuantities, setSkuQuantities] = useState<any>({})
  const [validSkus, setValidSkus] = useState<string[]>([])
  const [inValidSkus, setInValidSkus] = useState<string[]>([])
  const [duplicateSkus, setDuplicateSkus] = useState(false)

  const fetcher = (endPoint: string) => axios(endPoint).then((res) => res.data)
  const { data } = useSWR(state.user.businessId ? `/api/getSkus?region=${state.currentRegion}&businessId=${state.user.businessId}` : null, fetcher)

  useEffect(() => {
    if (data?.error) {
      setValidSkus([])
      setInValidSkus([])
      setSkus([])
      setSkusTitles({})
      setSkuQuantities({})
      setReady(true)
      toast.error(data?.message)
    } else if (data) {
      setValidSkus(data.validSkus)
      setInValidSkus(data.invalidSkus)
      setSkus(data.skus)
      setSkusTitles(data.skuTitle)
      setSkuQuantities(data.skuQuantities)
      setReady(true)
    }
    return () => {
      setReady(false)
    }
  }, [data])

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
          sku: Yup.string()
            .oneOf(validSkus, 'Invalid SKU or There`s No Stock Available')
            .notOneOf(inValidSkus, 'There`s no Stock for this SKU')
            .required('Required SKU'),
          title: Yup.string().max(100, 'Name is to Long').required('Required Name'),
          qty: Yup.number().positive().integer('Qty must be an integer').min(1, 'Quantity must be greater than 0').required('Required Quantity'),
        })
      )
      .required('Must have products'),
  })

  const handleSubmit = async (values: any, { resetForm }: any) => {
    const ChildrenSkus = (await values.children.map((child: any) => {
      return child.sku
    })) as String[]
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
      setDuplicateSkus(true)
      return
    }
    setDuplicateSkus(false)
    setCreatingKit(true)
    const response = await axios.post(`api/createNewKit?region=${state.currentRegion}&businessId=${state.user.businessId}`, {
      orderInfo: values,
    })
    if (!response.data.error) {
      // mutate('/api/getuser')
      toast.success(response.data.msg)
      resetForm()
      router.push('/Kits')
      setCreatingKit(false)
    } else {
      toast.error(response.data.msg)
      setCreatingKit(false)
    }
  }

  return (
    <div>
      <Head>
        <title>{title}</title>
      </Head>
      <React.Fragment>
        <div className='page-content'>
          <Container fluid>
            <BreadCrumb title='Add Products' pageTitle='Warehouse' />
            <Card>
              <CardBody>
                <Col md={12}>
                  {/* <div className='text-end'>
                    <Button
                      type='submit'
                      color='primary'
                      className='fs-5 py-1 p3-1'
                      onClick={() => setUploadProductsModal(true)}>
                      <i className='mdi mdi-arrow-up-bold-circle label-icon align-middle fs-4 me-2' />
                      Upload File
                    </Button>
                  </div> */}
                </Col>
                {ready ? (
                  <Formik
                    initialValues={initialValues}
                    validationSchema={validationSchema}
                    onSubmit={(values, { resetForm }) => handleSubmit(values, { resetForm })}>
                    {({ values, errors, touched, handleChange, handleBlur }) => (
                      <Form>
                        <Row>
                          <h5 className='fs-5 m-3 fw-bolder'>Kit Details</h5>
                          <Col md={6}>
                            <FormGroup className='mb-3'>
                              <Label htmlFor='firstNameinput' className='form-label'>
                                *Title
                              </Label>
                              <Input
                                type='text'
                                className='form-control'
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
                            <FormGroup className='mb-3'>
                              <Label htmlFor='lastNameinput' className='form-label'>
                                *SKU
                              </Label>
                              <Input
                                type='text'
                                className='form-control'
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
                            <FormGroup className='mb-3'>
                              <Label htmlFor='compnayNameinput' className='form-label'>
                                ASIN
                              </Label>
                              <Input
                                type='text'
                                className='form-control'
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
                            <FormGroup className='mb-3'>
                              <Label htmlFor='compnayNameinput' className='form-label'>
                                FNSKU
                              </Label>
                              <Input
                                type='text'
                                className='form-control'
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
                            <FormGroup className='mb-3'>
                              <Label htmlFor='compnayNameinput' className='form-label'>
                                UPC / Barcode
                              </Label>
                              <Input
                                type='text'
                                className='form-control'
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
                            <FormGroup className='mb-3'>
                              <Label htmlFor='lastNameinput' className='form-label'>
                                Product Image
                              </Label>
                              <Input
                                type='text'
                                className='form-control'
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
                          <div className='border mt-3 border-dashed'></div>
                          <h5 className='fs-5 m-3 fw-bolder'>Unit Dimensions</h5>
                          <Col md={3}>
                            <FormGroup className='mb-3'>
                              <Label htmlFor='compnayNameinput' className='form-label'>
                                *Weight {state.currentRegion !== '' && (state.currentRegion == 'us' ? '(lb)' : '(kg)')}
                              </Label>
                              <Input
                                type='number'
                                className='form-control'
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
                            <FormGroup className='mb-3'>
                              <Label htmlFor='compnayNameinput' className='form-label'>
                                *Width {state.currentRegion !== '' && (state.currentRegion == 'us' ? '(in)' : '(cm)')}
                              </Label>
                              <Input
                                type='number'
                                className='form-control'
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
                            <FormGroup className='mb-3'>
                              <Label htmlFor='compnayNameinput' className='form-label'>
                                *Length {state.currentRegion !== '' && (state.currentRegion == 'us' ? '(in)' : '(cm)')}
                              </Label>
                              <Input
                                type='number'
                                className='form-control'
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
                            <FormGroup className='mb-3'>
                              <Label htmlFor='compnayNameinput' className='form-label'>
                                *Height {state.currentRegion !== '' && (state.currentRegion == 'us' ? '(in)' : '(cm)')}
                              </Label>
                              <Input
                                type='number'
                                className='form-control'
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
                          <div className='border mt-3 border-dashed'></div>
                          <div className='align-items-center d-flex'>
                            <h5 className='fs-5 m-3 fw-bolder'>Master Box Dimensions</h5>
                          </div>
                          <Col md={3}>
                            <FormGroup className='mb-3'>
                              <Label htmlFor='compnayNameinput' className='form-label'>
                                *Box Weight {state.currentRegion !== '' && (state.currentRegion == 'us' ? '(lb)' : '(kg)')}
                              </Label>
                              <Input
                                type='number'
                                className='form-control'
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
                            <FormGroup className='mb-3'>
                              <Label htmlFor='compnayNameinput' className='form-label'>
                                *Box Width {state.currentRegion !== '' && (state.currentRegion == 'us' ? '(in)' : '(cm)')}
                              </Label>
                              <Input
                                type='number'
                                className='form-control'
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
                            <FormGroup className='mb-3'>
                              <Label htmlFor='compnayNameinput' className='form-label'>
                                *Box Length {state.currentRegion !== '' && (state.currentRegion == 'us' ? '(in)' : '(cm)')}
                              </Label>
                              <Input
                                type='number'
                                className='form-control'
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
                            <FormGroup className='mb-3'>
                              <Label htmlFor='compnayNameinput' className='form-label'>
                                *Box Height {state.currentRegion !== '' && (state.currentRegion == 'us' ? '(in)' : '(cm)')}
                              </Label>
                              <Input
                                type='number'
                                className='form-control'
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
                            <FormGroup className='mb-3'>
                              <Label htmlFor='compnayNameinput' className='form-label'>
                                *Master Box Quantity
                              </Label>
                              <Input
                                type='number'
                                className='form-control'
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
                          <div className='border mt-3 border-dashed'></div>
                          <Row>
                            <h5 className='fs-5 m-3 mb-1 fw-bolder'>Kit Children</h5>
                            <Col xl={12} className='p-0 mt-1'>
                              <table className='table table-hover table-centered align-middle'>
                                <thead>
                                  <tr>
                                    <th className='py-1 fs-5 m-0 fw-semibold text-center bg-primary text-white'>SKU</th>
                                    <th className='py-1 fs-5 m-0 fw-semibold text-center bg-primary text-white'>Title</th>
                                    <th className='py-1 fs-5 m-0 fw-semibold text-center bg-primary text-white'>Qty</th>
                                    <th className='py-1 fs-5 m-0 fw-semibold text-center bg-primary text-white'></th>
                                  </tr>
                                </thead>
                                <tbody>
                                  <FieldArray name='children'>
                                    {({ remove, push }) => (
                                      <>
                                        {values.children.map((_product, index) => (
                                          <tr key={index}>
                                            <td>
                                              <Field name={`children.${index}.sku`}>
                                                {({ meta }: any) => (
                                                  <FormGroup className='createOrder_inputs'>
                                                    <Input
                                                      type='text'
                                                      className='form-select'
                                                      style={{
                                                        padding: '0.2rem 0.9rem',
                                                      }}
                                                      name={`children.${index}.sku`}
                                                      list='skuList'
                                                      placeholder='Sku...'
                                                      onChange={(e: any) => {
                                                        handleChange(e)
                                                        e.target.value == ''
                                                          ? (values.children[index].title = '')
                                                          : (values.children[index].title = skusTitles[e.target.value])
                                                      }}
                                                      // onChange={(e) => handleChangeInSKU(e.target.value, values, index)}
                                                      onBlur={handleBlur}
                                                      value={values.children[index].sku || ''}
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
                                              <Field name={`children.${index}.title`}>
                                                {({ meta }: any) => (
                                                  <FormGroup className='createOrder_inputs'>
                                                    <Input
                                                      type='text'
                                                      className='form-control'
                                                      style={{
                                                        padding: '0.2rem 0.9rem',
                                                      }}
                                                      name={`children.${index}.title`}
                                                      placeholder='Title...'
                                                      list='skuNames'
                                                      onChange={handleChange}
                                                      onBlur={handleBlur}
                                                      value={values.children[index].title || ''}
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
                                              <Field name={`children.${index}.qty`}>
                                                {({ meta }: any) => (
                                                  <FormGroup className='createOrder_inputs'>
                                                    <Input
                                                      type='text'
                                                      className='form-control'
                                                      style={{
                                                        padding: '0.2rem 0.9rem',
                                                      }}
                                                      name={`children.${index}.qty`}
                                                      max={skuQuantities[values.children[index].sku]}
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
                                            <td>
                                              {index > 0 ? (
                                                <Row className='d-flex flex-row flex-nowrap justify-content-center gap-2 align-items-center mb-0'>
                                                  <Button
                                                    type='button'
                                                    className='btn-icon btn-success'
                                                    onClick={() =>
                                                      push({
                                                        sku: '',
                                                        title: '',
                                                        qty: 1,
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
                                                        title: '',
                                                        qty: 1,
                                                      })
                                                    }>
                                                    <i className='fs-2 las la-plus-circle' />
                                                  </Button>
                                                </Row>
                                              )}
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
                          {duplicateSkus && (
                            <p style={{ width: '100%', marginTop: '0.25rem', fontSize: '0.875em', color: '#f06548' }}>
                              Duplicate SKUS in Children List
                            </p>
                          )}
                          <h5 className='fs-14 my-0 text-muted fw-normal'>
                            *You must complete all required fields or you will not be able to create your product.
                          </h5>
                          <Col md={12}>
                            <div className='text-end'>
                              <Button type='submit' disabled={creatingKit} className='btn btn-primary'>
                                {creatingKit ? <Spinner /> : 'Create Kit'}
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
