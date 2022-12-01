import BreadCrumb from '@components/Common/BreadCrumb'
import AppContext from '@context/AppContext'
import { GetServerSideProps } from 'next'
import { getSession } from 'next-auth/react'
import Head from 'next/head'
import React, { useContext } from 'react'
import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  Input,
  FormGroup,
  Form,
  FormFeedback,
  Label,
  Button,
} from 'reactstrap'
import * as Yup from 'yup'
import { useFormik } from 'formik'
import { toast, ToastContainer } from 'react-toastify'
import axios from 'axios'
import Image from 'next/image'
import PlaneImage from '../assets/images/contactus-plane.png'
import SquareImage from '../assets/images/contactus-square.png'

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
      email: string
    }
  }
}

function ContactUs({ session }: Props) {
  const { state }: any = useContext(AppContext)

  const validation = useFormik({
    // enableReinitialize : use this flag when initial values needs to be changed
    enableReinitialize: true,

    initialValues: {
      companyName: String(state?.user?.name),
      email: session?.user?.email,
      subject: '',
      message: '',
    },
    validationSchema: Yup.object({
      companyName: Yup.string()
        .max(80, 'Name is to Long')
        .required('Please Enter Your Company Name'),
      email: Yup.string().email().required(),
      subject: Yup.string().required(),
      message: Yup.string().required(),
    }),
    onSubmit: async (values, {}) => {
      const response = await axios.post('api/sendMail', {
        message: values,
      })
      console.log(response)
      if (!response.data.error) {
        toast.success(response.data.message)
      } else {
        toast.error(response.data.message)
      }
    },
  })
  const handleContactForm = (event: any) => {
    event.preventDefault()
    validation.handleSubmit()
  }

  return (
    <div>
      <Head>
        <title>Contact Us</title>
      </Head>
      <React.Fragment>
        <div className="page-content">
          <ToastContainer />
          <Container fluid>
            <BreadCrumb title="Invoices" pageTitle="Billing" />
            <Row>
              <Col lg={12}>
                <Card className="border-top border-primary border-5 ">
                  <CardBody className='pb-2 pb-md-5'>
                    <div className="d-flex flex-row justify-content-between w-100 align-items-start pt-3 pb-2">
                      <div
                        className="position-relative d-flex"
                        style={{ width: '30%', minWidth: '130px' }}
                      >
                        <Image
                          src={PlaneImage}
                          layout="intrinsic"
                          alt="ShelfCloud Logo"
                          objectFit="contain"
                        />
                      </div>
                      <div
                        className="position-relative d-flex"
                        style={{ width: '8%', minWidth: '40px' }}
                      >
                        <Image
                          src={SquareImage}
                          layout="intrinsic"
                          alt="ShelfCloud Logo"
                          objectFit="contain"
                        />
                      </div>
                    </div>
                    <Col md={9} className="mx-auto my-0">
                      <h3>Get in touch</h3>
                      <Form onSubmit={handleContactForm}>
                        <Row>
                          <Col lg={6}>
                            <FormGroup className="mb-3">
                              <Label
                                htmlFor="firstNameinput"
                                className="form-label"
                              >
                                *Company Name
                              </Label>
                              <Input
                                type="text"
                                className="form-control"
                                placeholder="Company Name..."
                                id="companyName"
                                name="companyName"
                                onChange={validation.handleChange}
                                onBlur={validation.handleBlur}
                                value={validation.values.companyName || ''}
                                invalid={
                                  validation.touched.companyName &&
                                  validation.errors.companyName
                                    ? true
                                    : false
                                }
                              />
                              {validation.touched.companyName &&
                              validation.errors.companyName ? (
                                <FormFeedback type="invalid">
                                  {validation.errors.companyName}
                                </FormFeedback>
                              ) : null}
                            </FormGroup>
                            <FormGroup className="mb-3">
                              <Label
                                htmlFor="firstNameinput"
                                className="form-label"
                              >
                                *Email Address
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
                            <FormGroup className="mb-3">
                              <Label
                                htmlFor="firstNameinput"
                                className="form-label"
                              >
                                *Message Subject
                              </Label>
                              <Input
                                type="text"
                                className="form-control"
                                placeholder="Subject..."
                                id="subject"
                                name="subject"
                                onChange={validation.handleChange}
                                onBlur={validation.handleBlur}
                                value={validation.values.subject || ''}
                                invalid={
                                  validation.touched.subject &&
                                  validation.errors.subject
                                    ? true
                                    : false
                                }
                              />
                              {validation.touched.subject &&
                              validation.errors.subject ? (
                                <FormFeedback type="invalid">
                                  {validation.errors.subject}
                                </FormFeedback>
                              ) : null}
                            </FormGroup>
                          </Col>
                          <Col
                            lg={6}
                            className="h-auto d-flex flex-column justify-content-between pb-3"
                          >
                            <FormGroup className="mb-3 d-flex flex-column h-100 pb-md-4">
                              <Label
                                htmlFor="firstNameinput"
                                className="form-label"
                              >
                                *Message
                              </Label>
                              <Input
                                type="textarea"
                                className="form-control flex-grow-1 fs-5"
                                placeholder="Enter your message here"
                                id="message"
                                name="message"
                                onChange={validation.handleChange}
                                onBlur={validation.handleBlur}
                                value={validation.values.message || ''}
                                invalid={
                                  validation.touched.message &&
                                  validation.errors.message
                                    ? true
                                    : false
                                }
                              />
                              {validation.touched.message &&
                              validation.errors.message ? (
                                <FormFeedback type="invalid">
                                  {validation.errors.message}
                                </FormFeedback>
                              ) : null}
                            </FormGroup>
                            <Button
                              type="submit"
                              className="form-control btn btn-primary fs-5 w-100"
                            >
                              Submit
                            </Button>
                          </Col>
                        </Row>
                      </Form>
                    </Col>
                  </CardBody>
                </Card>
              </Col>
            </Row>
          </Container>
        </div>
      </React.Fragment>
    </div>
  )
}

export default ContactUs
