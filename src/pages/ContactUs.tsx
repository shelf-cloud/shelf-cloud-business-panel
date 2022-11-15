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
  CardHeader,
  CardBody,
  Input,
  FormGroup,
  Form,
  FormFeedback,
  Label,
} from 'reactstrap'
import * as Yup from 'yup'
import { useFormik } from 'formik'
import { toast, ToastContainer } from 'react-toastify'
import axios from 'axios'
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
    onSubmit: async (values, {  }) => {

        const response = await axios.post(
          'api/sendMail',
          {
            message: values,
          }
        )
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
                <Card>
                  <CardHeader>
                    <h1>Contact Us</h1>
                  </CardHeader>
                  <CardBody>
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
                        </Col>
                        <Col lg={6}>
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
                        </Col>
                        <Col lg={6}>
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
                      </Row>
                      <Row>
                        <Col lg={12}>
                          <FormGroup className="mb-3">
                            <Label
                              htmlFor="firstNameinput"
                              className="form-label"
                            >
                              *Message
                            </Label>
                            <Input
                              type="textarea"
                              className="form-control"
                              placeholder="Message..."
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
                        </Col>
                      </Row>
                      <div className="hstack gap-2 justify-content-end">
                        <button type="submit" className="btn btn-primary fs-5">
                          Send
                        </button>
                      </div>
                    </Form>
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
