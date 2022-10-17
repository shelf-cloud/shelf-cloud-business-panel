/* eslint-disable react-hooks/exhaustive-deps */
import React, { useContext, useEffect, useState } from 'react'
import { GetServerSideProps } from 'next'
import axios from 'axios'
import * as Yup from 'yup'
import { useFormik } from 'formik'
import Head from 'next/head'
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Col,
  Container,
  Form,
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
  const [productSucces, setProductSucces] = useState(false)
  const [productFail, setProductFail] = useState(false)
  const [useSameUnitDimensions, setUseSameUnitDimensions] = useState(false)
  const [msg, setMsg] = useState('')
  const validation = useFormik({
    // enableReinitialize : use this flag when initial values needs to be changed
    enableReinitialize: true,

    initialValues: {
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
    },
    validationSchema: Yup.object({
      title: Yup.string()
        .max(100, 'Title is to Long')
        .required('Please Enter Your Title'),
    }),
    onSubmit: async (values, { resetForm }) => {
    //   const response = await axios.post(
    //     `api/createNewProduct?businessId=${state.user.businessId}`,
    //     {
    //       productInfo: values,
    //     }
    //   )
    //   if (!response.data.error) {
    //     window.scrollTo(0, 0)
    //     setMsg(response.data.msg)
    //     setProductSucces(true)
    //     resetForm()
    //     setTimeout(() => setProductSucces(false), 6000)
    //   } else {
    //     window.scrollTo(0, 0)
    //     setMsg(response.data.msg)
    //     setProductFail(true)
    //     setTimeout(() => setProductFail(false), 6000)
    //   }
    },
  })

  useEffect(() => {
    return () => {
      setProductSucces(false)
      setProductFail(false)
    }
  }, [])

  const HandleAddProduct = (event: any) => {
    event.preventDefault()
    // validation.handleSubmit()
  }

  return (
    <div>
      <Head>
        <title>{title}</title>
      </Head>
      <React.Fragment>
        <div className="page-content">
          <Container fluid>
            <BreadCrumb title="Add Products" pageTitle="Warehouse" />
            <Card>
              <CardBody>
                <Form onSubmit={HandleAddProduct}>
                  <Row>
                    {productSucces && (
                      <UncontrolledAlert
                        color="success"
                        className="alert-border-left"
                      >
                        <i className="ri-check-double-line me-3 align-middle fs-16"></i>
                        <strong>Order Saved!</strong> - {msg}
                      </UncontrolledAlert>
                    )}
                    {productFail && (
                      <UncontrolledAlert
                        color="danger"
                        className="alert-border-left mb-xl-0"
                      >
                        <i className="ri-error-warning-line me-3 align-middle fs-16"></i>
                        <strong>Order Not Saved</strong> - {msg}
                      </UncontrolledAlert>
                    )}
                    <h5 className="fs-5 m-3 fw-bolder">Order Details</h5>
                    <Col md={8}>
                      <FormGroup className="mb-3">
                        <Label htmlFor="firstNameinput" className="form-label">
                          *Recipient
                        </Label>
                        <Input
                          type="text"
                          className="form-control"
                          placeholder="Recipient..."
                          id="recipient"
                          name="recipient"
                          onChange={validation.handleChange}
                          onBlur={validation.handleBlur}
                          value={validation.values.recipient || ''}
                          invalid={
                            validation.touched.recipient &&
                            validation.errors.recipient
                              ? true
                              : false
                          }
                        />
                        {validation.touched.recipient &&
                        validation.errors.recipient ? (
                          <FormFeedback type="invalid">
                            {validation.errors.recipient}
                          </FormFeedback>
                        ) : null}
                      </FormGroup>
                      <FormGroup className="mb-3">
                        <Label htmlFor="lastNameinput" className="form-label">
                          Company
                        </Label>
                        <Input
                          type="text"
                          className="form-control"
                          placeholder="Company..."
                          id="company"
                          name="company"
                          onChange={validation.handleChange}
                          onBlur={validation.handleBlur}
                          value={validation.values.company || ''}
                          invalid={
                            validation.touched.company &&
                            validation.errors.company
                              ? true
                              : false
                          }
                        />
                        {validation.touched.company &&
                        validation.errors.company ? (
                          <FormFeedback type="invalid">
                            {validation.errors.company}
                          </FormFeedback>
                        ) : null}
                      </FormGroup>
                    </Col>
                    <Col md={4}>
                      <FormGroup className="mb-3">
                        <Label htmlFor="lastNameinput" className="form-label">
                          Order Number
                        </Label>
                        <Input
                          type="text"
                          className="form-control"
                          placeholder="Order Number..."
                          id="orderNumber"
                          name="orderNumber"
                          onChange={validation.handleChange}
                          onBlur={validation.handleBlur}
                          value={validation.values.orderNumber || ''}
                          invalid={
                            validation.touched.orderNumber &&
                            validation.errors.orderNumber
                              ? true
                              : false
                          }
                        />
                        {validation.touched.orderNumber &&
                        validation.errors.orderNumber ? (
                          <FormFeedback type="invalid">
                            {validation.errors.orderNumber}
                          </FormFeedback>
                        ) : null}
                      </FormGroup>
                    </Col>
                    <Col md={8}>
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
                          onChange={validation.handleChange}
                          onBlur={validation.handleBlur}
                          value={validation.values.adress1 || ''}
                          invalid={
                            validation.touched.adress1 &&
                            validation.errors.adress1
                              ? true
                              : false
                          }
                        />
                        {validation.touched.adress1 &&
                        validation.errors.adress1 ? (
                          <FormFeedback type="invalid">
                            {validation.errors.adress1}
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
                          onChange={validation.handleChange}
                          onBlur={validation.handleBlur}
                          value={validation.values.adress2 || ''}
                          invalid={
                            validation.touched.adress2 &&
                            validation.errors.adress2
                              ? true
                              : false
                          }
                        />
                        {validation.touched.adress2 &&
                        validation.errors.adress2 ? (
                          <FormFeedback type="invalid">
                            {validation.errors.adress2}
                          </FormFeedback>
                        ) : null}
                      </FormGroup>
                      <Col md={12} className='d-flex justify-content-between w-100'>
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
                              onChange={validation.handleChange}
                              onBlur={validation.handleBlur}
                              value={validation.values.city || ''}
                              invalid={
                                validation.touched.city &&
                                validation.errors.city
                                  ? true
                                  : false
                              }
                            />
                            {validation.touched.city &&
                            validation.errors.city ? (
                              <FormFeedback type="invalid">
                                {validation.errors.city}
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
                              onChange={validation.handleChange}
                              onBlur={validation.handleBlur}
                              value={validation.values.state || ''}
                              invalid={
                                validation.touched.state &&
                                validation.errors.state
                                  ? true
                                  : false
                              }
                            />
                            {validation.touched.state &&
                            validation.errors.state ? (
                              <FormFeedback type="invalid">
                                {validation.errors.state}
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
                              onChange={validation.handleChange}
                              onBlur={validation.handleBlur}
                              value={validation.values.zipCode || ''}
                              invalid={
                                validation.touched.zipCode &&
                                validation.errors.zipCode
                                  ? true
                                  : false
                              }
                            />
                            {validation.touched.zipCode &&
                            validation.errors.zipCode ? (
                              <FormFeedback type="invalid">
                                {validation.errors.zipCode}
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
                              onChange={validation.handleChange}
                              onBlur={validation.handleBlur}
                              value={validation.values.country || ''}
                              invalid={
                                validation.touched.country &&
                                validation.errors.country
                                  ? true
                                  : false
                              }
                            />
                            {validation.touched.country &&
                            validation.errors.country ? (
                              <FormFeedback type="invalid">
                                {validation.errors.country}
                              </FormFeedback>
                            ) : null}
                          </FormGroup>
                        </Col>                        
                      </Col>
                      <FormGroup className="mb-3">
                        <Label htmlFor="lastNameinput" className="form-label">
                          Phone #
                        </Label>
                        <Input
                          type="text"
                          className="form-control"
                          placeholder="Phone Number..."
                          id="phoneNumber"
                          name="phoneNumber"
                          onChange={validation.handleChange}
                          onBlur={validation.handleBlur}
                          value={validation.values.phoneNumber || ''}
                          invalid={
                            validation.touched.phoneNumber &&
                            validation.errors.phoneNumber
                              ? true
                              : false
                          }
                        />
                        {validation.touched.phoneNumber &&
                        validation.errors.phoneNumber ? (
                          <FormFeedback type="invalid">
                            {validation.errors.phoneNumber}
                          </FormFeedback>
                        ) : null}
                      </FormGroup>
                      <FormGroup className="mb-3">
                        <Label htmlFor="lastNameinput" className="form-label">
                          Email
                        </Label>
                        <Input
                          type="text"
                          className="form-control"
                          placeholder="Email Address..."
                          id="email"
                          name="email"
                          onChange={validation.handleChange}
                          onBlur={validation.handleBlur}
                          value={validation.values.email || ''}
                          invalid={
                            validation.touched.email &&
                            validation.errors.email
                              ? true
                              : false
                          }
                        />
                        {validation.touched.email &&
                        validation.errors.email ? (
                          <FormFeedback type="invalid">
                            {validation.errors.email}
                          </FormFeedback>
                        ) : null}
                      </FormGroup>
                    </Col>
                    <Col md={4}>
                      <FormGroup className="mb-3">
                        <Label htmlFor="lastNameinput" className="form-label">
                          Amount Paid
                        </Label>
                        <Input
                          type="text"
                          className="form-control"
                          placeholder="Amount..."
                          id="amount"
                          name="amount"
                          onChange={validation.handleChange}
                          onBlur={validation.handleBlur}
                          value={validation.values.amount || ''}
                          invalid={
                            validation.touched.amount &&
                            validation.errors.amount
                              ? true
                              : false
                          }
                        />
                        {validation.touched.amount &&
                        validation.errors.amount ? (
                          <FormFeedback type="invalid">
                            {validation.errors.amount}
                          </FormFeedback>
                        ) : null}
                      </FormGroup>
                      <FormGroup className="mb-3">
                        <Label htmlFor="lastNameinput" className="form-label">
                          Shipping Paid
                        </Label>
                        <Input
                          type="text"
                          className="form-control"
                          placeholder="Shipping..."
                          id="shipping"
                          name="shipping"
                          onChange={validation.handleChange}
                          onBlur={validation.handleBlur}
                          value={validation.values.shipping || ''}
                          invalid={
                            validation.touched.shipping &&
                            validation.errors.shipping
                              ? true
                              : false
                          }
                        />
                        {validation.touched.shipping &&
                        validation.errors.shipping ? (
                          <FormFeedback type="invalid">
                            {validation.errors.shipping}
                          </FormFeedback>
                        ) : null}
                      </FormGroup>
                      <FormGroup className="mb-3">
                        <Label htmlFor="lastNameinput" className="form-label">
                          Tax Paid
                        </Label>
                        <Input
                          type="text"
                          className="form-control"
                          placeholder="Tax..."
                          id="tax"
                          name="tax"
                          onChange={validation.handleChange}
                          onBlur={validation.handleBlur}
                          value={validation.values.tax || ''}
                          invalid={
                            validation.touched.tax &&
                            validation.errors.tax
                              ? true
                              : false
                          }
                        />
                        {validation.touched.tax &&
                        validation.errors.tax ? (
                          <FormFeedback type="invalid">
                            {validation.errors.tax}
                          </FormFeedback>
                        ) : null}
                      </FormGroup>
                    </Col>
                    <div className="border mt-3 border-dashed"></div>
                    <h5 className="fs-5 m-3 fw-bolder">Order Products</h5>
                    
                    <h5 className="fs-14 mb-3 text-muted">
                      *You must complete all required fields or you will not be
                      able to create your product.
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
              </CardBody>
            </Card>
          </Container>
        </div>
      </React.Fragment>
    </div>
  )
}

export default CreateOrder
