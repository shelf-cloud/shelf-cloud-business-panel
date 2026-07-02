import { GetServerSideProps } from 'next'
import Head from 'next/head'
import { useRouter } from 'next/router'
import React, { useContext, useState } from 'react'

import { signOut } from '@auth/client'
import BreadCrumb from '@components/Common/BreadCrumb'
import AppContext from '@context/AppContext'
import axios from 'axios'
import { useFormik } from 'formik'
import { getSession } from 'next-auth/react'
import { toast } from 'react-toastify'
import { Card, CardBody, CardHeader, Col, Container, Form, FormFeedback, FormGroup, Input, Label, Nav, NavItem, NavLink, Row, TabContent, TabPane } from '@/components/migration-ui'
import { useSWRConfig } from 'swr'
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

const Profile = () => {
  const { state }: any = useContext(AppContext)
  const router = useRouter()
  const { mutate } = useSWRConfig()
  const [activeTab, setActiveTab] = useState('1')
  const tabChange = (tab: any) => {
    if (activeTab !== tab) setActiveTab(tab)
  }

  const validation = useFormik({
    // enableReinitialize : use this flag when initial values needs to be changed
    enableReinitialize: true,

    initialValues: {
      companyName: String(state.currentRegion == 'us' ? state?.user?.us?.name : state?.user?.eu?.name),
      email: String(state.currentRegion == 'us' ? state?.user?.us?.email : state?.user?.eu?.email),
    },
    validationSchema: Yup.object({
      companyName: Yup.string().max(80, 'Name is to Long').required('Please Enter Your Company Name'),
      email: Yup.string().email(),
    }),
    onSubmit: async (values) => {
      const response = await axios.post(`api/updateUserDetails?region=${state.currentRegion}&businessId=${state.user.businessId}`, {
        userDetails: values,
      })
      if (!response.data.error) {
        toast.success(response.data.msg)
        mutate('/api/getuser')
      } else {
        toast.error(response.data.msg)
      }
    },
  })

  const validationChangePassword = useFormik({
    // enableReinitialize : use this flag when initial values needs to be changed
    enableReinitialize: true,

    initialValues: {
      currentPassword: '',
      newPassword1: '',
      newPassword2: '',
    },
    validationSchema: Yup.object({
      currentPassword: Yup.string().required('Please Enter Your Current Password'),
      newPassword1: Yup.string().min(8, 'Password must be at least 8 characters').required('Please Enter Your New Password'),
      newPassword2: Yup.string()
        .min(8, 'Password must be at least 8 characters')
        .oneOf([Yup.ref('newPassword1'), null], "Passwords don't match!")
        .required('Please Enter Your Confirmation Password'),
    }),
    onSubmit: async (values, { resetForm }) => {
      const response = await axios.post(`api/updatePassword?businessId=${state.user.businessId}`, {
        passwordInfo: values,
      })
      if (!response.data.error) {
        toast.success(response.data.msg)
        resetForm()
        setTimeout(() => {
          signOut()
        }, 3000)
      } else {
        toast.error(response.data.msg)
      }
    },
  })

  const handleUpdateProfile = (event: any) => {
    event.preventDefault()
    validation.handleSubmit()
  }

  const handleChangePassword = (event: any) => {
    event.preventDefault()
    validationChangePassword.handleSubmit()
  }

  return (
    <div>
      <Head>
        <title>User Profile</title>
      </Head>

      <React.Fragment>
        <div className='page-content'>
          <Container fluid>
            <BreadCrumb title='Profile' pageTitle='Profile' />
            <Row>
              <Col lg={12}>
                <Card className=''>
                  <CardHeader>
                    <Nav className='nav-tabs-custom tw:rounded-[0.25rem] card-header-tabs tw:border-b-0' role='tablist'>
                      <NavItem style={{ cursor: 'pointer' }}>
                        <NavLink
                          className={activeTab == '1' ? 'tw:!text-primary tw:text-[16.25px]' : 'tw:!text-[var(--bs-secondary-color)] tw:text-[16.25px]'}
                          onClick={() => {
                            tabChange('1')
                            validation.setFieldValue('isPasswordTab', false)
                          }}>
                          <>
                            <i className='fas fa-home'></i>
                            Personal Details
                          </>
                        </NavLink>
                      </NavItem>
                      <NavItem style={{ cursor: 'pointer' }}>
                        <NavLink
                          to='#'
                          className={activeTab == '2' ? 'tw:!text-primary tw:text-[16.25px]' : 'tw:!text-[var(--bs-secondary-color)] tw:text-[16.25px]'}
                          onClick={() => {
                            tabChange('2')
                            validation.setFieldValue('isPasswordTab', true)
                          }}
                          type='button'>
                          <>
                            <i className='far fa-user'></i>
                            Change Password
                          </>
                        </NavLink>
                      </NavItem>
                    </Nav>
                  </CardHeader>
                  <CardBody className='tw:p-6'>
                    <TabContent activeTab={activeTab}>
                      <TabPane tabId='1'>
                        <Form onSubmit={handleUpdateProfile}>
                          <Row>
                            <Col lg={6}>
                              <FormGroup className='tw:mb-4'>
                                <Label htmlFor='firstNameinput' className='form-label'>
                                  *Company Name
                                </Label>
                                <Input
                                  type='text'
                                  placeholder='Company Name...'
                                  id='companyName'
                                  name='companyName'
                                  onChange={validation.handleChange}
                                  onBlur={validation.handleBlur}
                                  value={validation.values.companyName || ''}
                                  invalid={validation.touched.companyName && validation.errors.companyName ? true : false}
                                />
                                {validation.touched.companyName && validation.errors.companyName ? (
                                  <FormFeedback type='invalid'>{validation.errors.companyName}</FormFeedback>
                                ) : null}
                              </FormGroup>
                            </Col>
                            <Col lg={6}>
                              <FormGroup className='tw:mb-4'>
                                <Label htmlFor='firstNameinput' className='form-label'>
                                  *Email Address
                                </Label>
                                <Input
                                  type='text'
                                  placeholder='Email Address...'
                                  id='email'
                                  name='email'
                                  onChange={validation.handleChange}
                                  onBlur={validation.handleBlur}
                                  value={validation.values.email || ''}
                                  invalid={validation.touched.email && validation.errors.email ? true : false}
                                />
                                {validation.touched.email && validation.errors.email ? <FormFeedback type='invalid'>{validation.errors.email}</FormFeedback> : null}
                              </FormGroup>
                            </Col>
                            <Col lg={12}>
                              <div className='tw:flex tw:flex-row tw:items-center tw:gap-2 tw:justify-end'>
                                <button type='submit' className='btn btn-primary tw:text-[16.25px]'>
                                  Updates
                                </button>
                                <button type='button' className='btn btn-soft-success tw:text-[16.25px]' onClick={() => router.push('/')}>
                                  Cancel
                                </button>
                              </div>
                            </Col>
                          </Row>
                        </Form>
                      </TabPane>

                      <TabPane tabId='2'>
                        <Form onSubmit={handleChangePassword}>
                          <Row className='tw:gap-y-2'>
                            <Col lg={4}>
                              <FormGroup className='tw:mb-4'>
                                <Label htmlFor='firstNameinput' className='form-label'>
                                  *Curent Password
                                </Label>
                                <Input
                                  type='password'
                                  placeholder='Enter Current Password'
                                  id='currentPassword'
                                  name='currentPassword'
                                  onChange={validationChangePassword.handleChange}
                                  onBlur={validationChangePassword.handleBlur}
                                  value={validationChangePassword.values.currentPassword || ''}
                                  invalid={validationChangePassword.touched.currentPassword && validationChangePassword.errors.currentPassword ? true : false}
                                />
                                {validationChangePassword.touched.currentPassword && validationChangePassword.errors.currentPassword ? (
                                  <FormFeedback type='invalid'>{validationChangePassword.errors.currentPassword}</FormFeedback>
                                ) : null}
                              </FormGroup>
                            </Col>

                            <Col lg={4}>
                              <FormGroup className='tw:mb-4'>
                                <Label htmlFor='firstNameinput' className='form-label'>
                                  *New Password
                                </Label>
                                <Input
                                  type='password'
                                  placeholder='Enter New Password'
                                  id='newPassword1'
                                  name='newPassword1'
                                  onChange={validationChangePassword.handleChange}
                                  onBlur={validationChangePassword.handleBlur}
                                  value={validationChangePassword.values.newPassword1 || ''}
                                  invalid={validationChangePassword.touched.newPassword1 && validationChangePassword.errors.newPassword1 ? true : false}
                                />
                                {validationChangePassword.touched.newPassword1 && validationChangePassword.errors.newPassword1 ? (
                                  <FormFeedback type='invalid'>{validationChangePassword.errors.newPassword1}</FormFeedback>
                                ) : null}
                              </FormGroup>
                            </Col>

                            <Col lg={4}>
                              <FormGroup className='tw:mb-4'>
                                <Label htmlFor='firstNameinput' className='form-label'>
                                  *Confirm Password
                                </Label>
                                <Input
                                  type='password'
                                  placeholder='Enter New Password'
                                  id='newPassword2'
                                  name='newPassword2'
                                  onChange={validationChangePassword.handleChange}
                                  onBlur={validationChangePassword.handleBlur}
                                  value={validationChangePassword.values.newPassword2 || ''}
                                  invalid={validationChangePassword.touched.newPassword2 && validationChangePassword.errors.newPassword2 ? true : false}
                                />
                                {validationChangePassword.touched.newPassword2 && validationChangePassword.errors.newPassword2 ? (
                                  <FormFeedback type='invalid'>{validationChangePassword.errors.newPassword2}</FormFeedback>
                                ) : null}
                              </FormGroup>
                            </Col>

                            {/* <Col lg={12}>
                              <div className="mb-3">
                                <Link
                                  href={'/'}
                                  className="link-primary text-decoration-underline"
                                >
                                  Forgot Password ?
                                </Link>
                              </div>
                            </Col> */}

                            <Col lg={12}>
                              <div className='tw:text-right'>
                                <button type='submit' className='btn btn-success'>
                                  Change Password
                                </button>
                              </div>
                            </Col>
                          </Row>
                        </Form>
                      </TabPane>
                    </TabContent>
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

export default Profile
