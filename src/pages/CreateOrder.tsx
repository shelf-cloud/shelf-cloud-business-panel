/* eslint-disable react-hooks/exhaustive-deps */
import React, { useContext, useEffect, useState } from 'react'
import { GetServerSideProps } from 'next'
import axios from 'axios'
import * as Yup from 'yup'
import { Field, FieldArray, Formik, Form } from 'formik'
import Head from 'next/head'
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Col,
  Container,
  FormFeedback,
  FormGroup,
  Input,
  Label,
  Row,
  UncontrolledAlert,
} from 'reactstrap'
import BreadCrumb from '@components/Common/BreadCrumb'
import { getSession } from '@auth/client'
import AppContext from '@context/AppContext'
import useSWR from 'swr'

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
  const { state }: any = useContext(AppContext)
  const title = `Add Product | ${session?.user?.name}`
  const [ready, setReady] = useState(false)
  const [skus, setSkus] = useState([])
  const [validSkus, setValidSkus] = useState<string[]>([])
  const [msg, setMsg] = useState('')

  const fetcher = (endPoint: string) => axios(endPoint).then((res) => res.data)
  const { data, error } = useSWR(
    state.user.businessId
      ? `/api/getSkus?businessId=${state.user.businessId}`
      : null,
    fetcher
  )

  useEffect(() => {
    if (data) {
      data.map((skus: { sku: string; name: string }) => {
        setValidSkus(prev => {
          return [...prev, skus.sku]
        })
      })
      setSkus(data)
    }
  }, [data])

  const initialValues = {
    recipient: '',
    company: '',
    orderNumber: '',
    adress1: '',
    adress2: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    phoneNumber: '',
    email: '',
    amount: '',
    shipping: '',
    tax: '',
    products: [
      {
        sku: '',
        name: '',
        qty: '',
        price: '',
      },
    ],
  }

  const validationSchema = Yup.object({
    recipient: Yup.string()
      .max(10, 'Title is to Long')
      .required('Please Enter Your Title'),
    products: Yup.array()
      .of(
        Yup.object({
          sku: Yup.string()
            .oneOf(validSkus, 'Must be a Valid SKU')
            .required('Required SKU'),
          name: Yup.string()
            .max(50, 'Name is to Long')
            .required('Required Name'),
          qty: Yup.number()
            .min(1, 'Quantity Must be Grater than 0')
            .required('Required Qty'),
          price: Yup.number().required('Required Price'),
        })
      )
      .required('Must have products'),
  })

  useEffect(() => {
    setReady(true)
    return () => {
      setReady(false)
    }
  }, [])

  return (
    <div>
      <Head>
        <title>{title}</title>
      </Head>
      <React.Fragment>
        <div className="page-content">
          <Container fluid>
            <BreadCrumb title="Create Order" pageTitle="Shipments" />
            <Card>
              <CardBody>
                {ready && (
                  <Formik
                    initialValues={initialValues}
                    validationSchema={validationSchema}
                    onSubmit={async (values, { resetForm }) => {
                      console.log(values)
                    }}
                  >
                    {({
                      values,
                      errors,
                      touched,
                      handleChange,
                      handleBlur,
                    }) => (
                      <Form>
                        <Row>
                          <Col md={7}>
                            <FormGroup className="mb-3">
                              <Label
                                htmlFor="firstNameinput"
                                className="form-label"
                              >
                                *Recipient
                              </Label>
                              <Input
                                type="text"
                                className="form-control"
                                placeholder="Recipient..."
                                id="recipient"
                                name="recipient"
                                onChange={handleChange}
                                onBlur={handleBlur}
                                value={values.recipient || ''}
                                invalid={
                                  touched.recipient && errors.recipient
                                    ? true
                                    : false
                                }
                              />
                              {touched.recipient && errors.recipient ? (
                                <FormFeedback type="invalid">
                                  {errors.recipient}
                                </FormFeedback>
                              ) : null}
                            </FormGroup>
                            <FormGroup className="mb-3">
                              <Label
                                htmlFor="lastNameinput"
                                className="form-label"
                              >
                                Company
                              </Label>
                              <Input
                                type="text"
                                className="form-control"
                                placeholder="Company..."
                                id="company"
                                name="company"
                                onChange={handleChange}
                                onBlur={handleBlur}
                                value={values.company || ''}
                                invalid={
                                  touched.company && errors.company
                                    ? true
                                    : false
                                }
                              />
                              {touched.company && errors.company ? (
                                <FormFeedback type="invalid">
                                  {errors.company}
                                </FormFeedback>
                              ) : null}
                            </FormGroup>
                          </Col>
                          <Col md={5}>
                            <FormGroup className="mb-3">
                              <Label
                                htmlFor="lastNameinput"
                                className="form-label"
                              >
                                Order Number
                              </Label>
                              <Input
                                type="text"
                                className="form-control"
                                placeholder="Order Number..."
                                id="orderNumber"
                                name="orderNumber"
                                onChange={handleChange}
                                onBlur={handleBlur}
                                value={values.orderNumber || ''}
                                invalid={
                                  touched.orderNumber && errors.orderNumber
                                    ? true
                                    : false
                                }
                              />
                              {touched.orderNumber && errors.orderNumber ? (
                                <FormFeedback type="invalid">
                                  {errors.orderNumber}
                                </FormFeedback>
                              ) : null}
                            </FormGroup>
                          </Col>
                          <Col md={7}>
                            <FormGroup className="mb-3">
                              <Label
                                htmlFor="compnayNameinput"
                                className="form-label"
                              >
                                Address 1
                              </Label>
                              <Input
                                type="text"
                                className="form-control"
                                placeholder="Address..."
                                id="adress1"
                                name="adress1"
                                onChange={handleChange}
                                onBlur={handleBlur}
                                value={values.adress1 || ''}
                                invalid={
                                  touched.adress1 && errors.adress1
                                    ? true
                                    : false
                                }
                              />
                              {touched.adress1 && errors.adress1 ? (
                                <FormFeedback type="invalid">
                                  {errors.adress1}
                                </FormFeedback>
                              ) : null}
                            </FormGroup>
                            <FormGroup className="mb-3">
                              <Input
                                type="text"
                                className="form-control"
                                placeholder="Address..."
                                id="adress2"
                                name="adress2"
                                onChange={handleChange}
                                onBlur={handleBlur}
                                value={values.adress2 || ''}
                                invalid={
                                  touched.adress2 && errors.adress2
                                    ? true
                                    : false
                                }
                              />
                              {touched.adress2 && errors.adress2 ? (
                                <FormFeedback type="invalid">
                                  {errors.adress2}
                                </FormFeedback>
                              ) : null}
                            </FormGroup>
                            <Col
                              md={12}
                              className="d-flex justify-content-between w-100"
                            >
                              <Col md={2}>
                                <FormGroup className="mb-3">
                                  <Label
                                    htmlFor="compnayNameinput"
                                    className="form-label"
                                  >
                                    *City
                                  </Label>
                                  <Input
                                    type="text"
                                    className="form-control"
                                    placeholder="City..."
                                    id="city"
                                    name="city"
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    value={values.city || ''}
                                    invalid={
                                      touched.city && errors.city ? true : false
                                    }
                                  />
                                  {touched.city && errors.city ? (
                                    <FormFeedback type="invalid">
                                      {errors.city}
                                    </FormFeedback>
                                  ) : null}
                                </FormGroup>
                              </Col>
                              <Col md={2}>
                                <FormGroup className="mb-3">
                                  <Label
                                    htmlFor="compnayNameinput"
                                    className="form-label"
                                  >
                                    *State
                                  </Label>
                                  <Input
                                    type="text"
                                    className="form-control"
                                    placeholder="State..."
                                    id="state"
                                    name="state"
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    value={values.state || ''}
                                    invalid={
                                      touched.state && errors.state
                                        ? true
                                        : false
                                    }
                                  />
                                  {touched.state && errors.state ? (
                                    <FormFeedback type="invalid">
                                      {errors.state}
                                    </FormFeedback>
                                  ) : null}
                                </FormGroup>
                              </Col>
                              <Col md={2}>
                                <FormGroup className="mb-3">
                                  <Label
                                    htmlFor="compnayNameinput"
                                    className="form-label"
                                  >
                                    *Zip Code
                                  </Label>
                                  <Input
                                    type="text"
                                    className="form-control"
                                    placeholder="Zip Code..."
                                    id="zipCode"
                                    name="zipCode"
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    value={values.zipCode || ''}
                                    invalid={
                                      touched.zipCode && errors.zipCode
                                        ? true
                                        : false
                                    }
                                  />
                                  {touched.zipCode && errors.zipCode ? (
                                    <FormFeedback type="invalid">
                                      {errors.zipCode}
                                    </FormFeedback>
                                  ) : null}
                                </FormGroup>
                              </Col>
                              <Col md={2}>
                                <FormGroup className="mb-3">
                                  <Label
                                    htmlFor="compnayNameinput"
                                    className="form-label"
                                  >
                                    *Country
                                  </Label>
                                  <Input
                                    type="text"
                                    className="form-control"
                                    placeholder="Country..."
                                    id="country"
                                    name="country"
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    value={values.country || ''}
                                    invalid={
                                      touched.country && errors.country
                                        ? true
                                        : false
                                    }
                                  />
                                  {touched.country && errors.country ? (
                                    <FormFeedback type="invalid">
                                      {errors.country}
                                    </FormFeedback>
                                  ) : null}
                                </FormGroup>
                              </Col>
                            </Col>
                            <FormGroup className="mb-3">
                              <Label
                                htmlFor="lastNameinput"
                                className="form-label"
                              >
                                Phone #
                              </Label>
                              <Input
                                type="text"
                                className="form-control"
                                placeholder="Phone Number..."
                                id="phoneNumber"
                                name="phoneNumber"
                                onChange={handleChange}
                                onBlur={handleBlur}
                                value={values.phoneNumber || ''}
                                invalid={
                                  touched.phoneNumber && errors.phoneNumber
                                    ? true
                                    : false
                                }
                              />
                              {touched.phoneNumber && errors.phoneNumber ? (
                                <FormFeedback type="invalid">
                                  {errors.phoneNumber}
                                </FormFeedback>
                              ) : null}
                            </FormGroup>
                            <FormGroup className="mb-3">
                              <Label
                                htmlFor="lastNameinput"
                                className="form-label"
                              >
                                Email
                              </Label>
                              <Input
                                type="text"
                                className="form-control"
                                placeholder="Email Address..."
                                id="email"
                                name="email"
                                onChange={handleChange}
                                onBlur={handleBlur}
                                value={values.email || ''}
                                invalid={
                                  touched.email && errors.email ? true : false
                                }
                              />
                              {touched.email && errors.email ? (
                                <FormFeedback type="invalid">
                                  {errors.email}
                                </FormFeedback>
                              ) : null}
                            </FormGroup>
                          </Col>
                          <Col md={5}>
                            <FormGroup className="mb-3">
                              <Label
                                htmlFor="lastNameinput"
                                className="form-label"
                              >
                                Amount Paid
                              </Label>
                              <Input
                                type="text"
                                className="form-control"
                                placeholder="Amount..."
                                id="amount"
                                name="amount"
                                onChange={handleChange}
                                onBlur={handleBlur}
                                value={values.amount || ''}
                                invalid={
                                  touched.amount && errors.amount ? true : false
                                }
                              />
                              {touched.amount && errors.amount ? (
                                <FormFeedback type="invalid">
                                  {errors.amount}
                                </FormFeedback>
                              ) : null}
                            </FormGroup>
                            <FormGroup className="mb-3">
                              <Label
                                htmlFor="lastNameinput"
                                className="form-label"
                              >
                                Shipping Paid
                              </Label>
                              <Input
                                type="text"
                                className="form-control"
                                placeholder="Shipping..."
                                id="shipping"
                                name="shipping"
                                onChange={handleChange}
                                onBlur={handleBlur}
                                value={values.shipping || ''}
                                invalid={
                                  touched.shipping && errors.shipping
                                    ? true
                                    : false
                                }
                              />
                              {touched.shipping && errors.shipping ? (
                                <FormFeedback type="invalid">
                                  {errors.shipping}
                                </FormFeedback>
                              ) : null}
                            </FormGroup>
                            <FormGroup className="mb-3">
                              <Label
                                htmlFor="lastNameinput"
                                className="form-label"
                              >
                                Tax Paid
                              </Label>
                              <Input
                                type="text"
                                className="form-control"
                                placeholder="Tax..."
                                id="tax"
                                name="tax"
                                onChange={handleChange}
                                onBlur={handleBlur}
                                value={values.tax || ''}
                                invalid={
                                  touched.tax && errors.tax ? true : false
                                }
                              />
                              {touched.tax && errors.tax ? (
                                <FormFeedback type="invalid">
                                  {errors.tax}
                                </FormFeedback>
                              ) : null}
                            </FormGroup>
                          </Col>
                          <div className="border mt-3 border-dashed" />
                          <Row>
                            <h5 className="fs-5 m-3 fw-bolder">
                              Order Products
                            </h5>
                            <Col xl={12}>
                              <table className="table table-hover table-centered align-middle">
                                <thead>
                                  <th></th>
                                  <th>SKU</th>
                                  <th>Name</th>
                                  <th>Qty</th>
                                  <th>Price</th>
                                </thead>
                                <tbody>
                                  <FieldArray name="products">
                                    {({ remove, push }) => (
                                      <>
                                        {values.products.map(
                                          (product, index) => (
                                            <tr key={index}>
                                              <td>
                                                {index > 0 ? (
                                                  <Row className="d-flex flex-row flex-nowrap justify-content-between align-items-center mb-3">
                                                    <Button
                                                      type="button"
                                                      className="btn-icon btn-success"
                                                      onClick={() =>
                                                        push({
                                                          sku: '',
                                                          name: '',
                                                          qty: '',
                                                          price: '',
                                                        })
                                                      }
                                                    >
                                                      <i className="fs-2 las la-plus-circle" />
                                                    </Button>
                                                    <Button
                                                      type="button"
                                                      className="btn-icon btn-danger"
                                                      onClick={() =>
                                                        remove(index)
                                                      }
                                                    >
                                                      <i className="fs-2 las la-minus-circle" />
                                                    </Button>
                                                  </Row>
                                                ) : (
                                                  <Row className="d-flex flex-row flex-nowrap justify-content-end align-items-center mb-3">
                                                    <Button
                                                      type="button"
                                                      className="btn-icon btn-success"
                                                      onClick={() =>
                                                        push({
                                                          sku: '',
                                                          name: '',
                                                          qty: '',
                                                          price: '',
                                                        })
                                                      }
                                                    >
                                                      <i className="fs-2 las la-plus-circle" />
                                                    </Button>
                                                  </Row>
                                                )}
                                              </td>
                                              <td>
                                                <Field
                                                  name={`products.${index}.sku`}
                                                >
                                                  {({
                                                    form: {
                                                      touche,
                                                      errors,
                                                      isValid,
                                                    },
                                                    meta,
                                                  }: any) => (
                                                    <FormGroup className="mb-3">
                                                      <Input
                                                        type="text"
                                                        className="form-select"
                                                        name={`products.${index}.sku`}
                                                        list="skuList"
                                                        placeholder="Sku..."
                                                        onChange={handleChange}
                                                        onBlur={handleBlur}
                                                        invalid={
                                                          meta.touched &&
                                                          meta.error
                                                            ? true
                                                            : false
                                                        }
                                                      />
                                                      {meta.touched &&
                                                      meta.error ? (
                                                        <FormFeedback type="invalid">
                                                          {meta.error}
                                                        </FormFeedback>
                                                      ) : null}
                                                    </FormGroup>
                                                  )}
                                                </Field>
                                                <datalist id="skuList">
                                                  {skus.map(
                                                    (
                                                      skus: {
                                                        sku: string
                                                        name: string
                                                      },
                                                      index
                                                    ) => (
                                                      <option
                                                        key={index}
                                                        value={skus.sku}
                                                      >
                                                        {skus.sku} / {skus.name}
                                                      </option>
                                                    )
                                                  )}
                                                </datalist>
                                              </td>
                                              <td>
                                                <Field
                                                  name={`products.${index}.name`}
                                                >
                                                  {({
                                                    form: {
                                                      touche,
                                                      errors,
                                                      isValid,
                                                    },
                                                    meta,
                                                  }: any) => (
                                                    <FormGroup className="mb-3">
                                                      <Input
                                                        type="text"
                                                        className="form-control"
                                                        name={`products.${index}.name`}
                                                        placeholder="Name..."
                                                        onChange={handleChange}
                                                        onBlur={handleBlur}
                                                        invalid={
                                                          meta.touched &&
                                                          meta.error
                                                            ? true
                                                            : false
                                                        }
                                                      />
                                                      {meta.touched &&
                                                      meta.error ? (
                                                        <FormFeedback type="invalid">
                                                          {meta.error}
                                                        </FormFeedback>
                                                      ) : null}
                                                    </FormGroup>
                                                  )}
                                                </Field>
                                              </td>
                                              <td>
                                                <Field
                                                  name={`products.${index}.qty`}
                                                >
                                                  {({
                                                    form: {
                                                      touche,
                                                      errors,
                                                      isValid,
                                                    },
                                                    meta,
                                                  }: any) => (
                                                    <FormGroup className="mb-3">
                                                      <Input
                                                        type="number"
                                                        className="form-control"
                                                        name={`products.${index}.qty`}
                                                        placeholder="Qty..."
                                                        onChange={handleChange}
                                                        onBlur={handleBlur}
                                                        invalid={
                                                          meta.touched &&
                                                          meta.error
                                                            ? true
                                                            : false
                                                        }
                                                      />
                                                      {meta.touched &&
                                                      meta.error ? (
                                                        <FormFeedback type="invalid">
                                                          {meta.error}
                                                        </FormFeedback>
                                                      ) : null}
                                                    </FormGroup>
                                                  )}
                                                </Field>
                                              </td>
                                              <td>
                                                <Field
                                                  name={`products.${index}.price`}
                                                >
                                                  {({
                                                    form: {
                                                      touche,
                                                      errors,
                                                      isValid,
                                                    },
                                                    meta,
                                                  }: any) => (
                                                    <FormGroup className="mb-3">
                                                      <Input
                                                        type="number"
                                                        className="form-control"
                                                        name={`products.${index}.price`}
                                                        placeholder="Price..."
                                                        onChange={handleChange}
                                                        onBlur={handleBlur}
                                                        invalid={
                                                          meta.touched &&
                                                          meta.error
                                                            ? true
                                                            : false
                                                        }
                                                      />
                                                      {meta.touched &&
                                                      meta.error ? (
                                                        <FormFeedback type="invalid">
                                                          {meta.error}
                                                        </FormFeedback>
                                                      ) : null}
                                                    </FormGroup>
                                                  )}
                                                </Field>
                                              </td>
                                            </tr>
                                          )
                                        )}
                                        {errors.products === 'string' ? (
                                          <div>{errors.products}</div>
                                        ) : null}
                                      </>
                                    )}
                                  </FieldArray>
                                </tbody>
                              </table>
                            </Col>
                          </Row>
                          <h5 className="fs-14 mb-3 text-muted">
                            *You must complete all required fields or you will
                            not be able to create your product.
                          </h5>
                          <Col md={12}>
                            <div className="text-end">
                              <Button type="submit" className="btn btn-primary">
                                Add
                              </Button>
                            </div>
                          </Col>
                        </Row>
                      </Form>
                    )}
                  </Formik>
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
