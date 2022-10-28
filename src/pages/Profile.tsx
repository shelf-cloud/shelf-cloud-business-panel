import BreadCrumb from '@components/Common/BreadCrumb'
import AppContext from '@context/AppContext'
import { GetServerSideProps } from 'next'
import { getSession } from 'next-auth/react'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import React, { useContext, useState } from 'react'
import {
  Card,
  CardBody,
  CardHeader,
  Col,
  Container,
  Form,
  Input,
  Label,
  Nav,
  NavItem,
  NavLink,
  Row,
  TabContent,
  TabPane,
} from 'reactstrap'

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

const Profile = ({ session }: Props) => {
  const { state }: any = useContext(AppContext)
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('1')

  const tabChange = (tab: any) => {
    if (activeTab !== tab) setActiveTab(tab)
  }
  return (
    <div>
      <Head>
        <title>User Profile</title>
      </Head>

      <React.Fragment>
        <div className="page-content">
          <Container fluid>
            <BreadCrumb title="Profile" pageTitle="Profile" />
            <Row>
              <Col lg={12}>
                <Card className="">
                  <CardHeader>
                    <Nav
                      className="nav-tabs-custom rounded card-header-tabs border-bottom-0"
                      role="tablist"
                    >
                      <NavItem style={{ cursor: 'pointer' }}>
                        <NavLink
                          className={
                            activeTab == '1'
                              ? 'text-primary fs-5'
                              : 'text-muted fs-5'
                          }
                          onClick={() => {
                            tabChange('1')
                          }}
                        >
                          <>
                            <i className="fas fa-home"></i>
                            Personal Details
                          </>
                        </NavLink>
                      </NavItem>
                      <NavItem style={{ cursor: 'pointer' }}>
                        <NavLink
                          to="#"
                          className={
                            activeTab == '2'
                              ? 'text-primary fs-5'
                              : 'text-muted fs-5'
                          }
                          onClick={() => {
                            tabChange('2')
                          }}
                          type="button"
                        >
                          <>
                            <i className="far fa-user"></i>
                            Change Password
                          </>
                        </NavLink>
                      </NavItem>
                    </Nav>
                  </CardHeader>
                  <CardBody className="p-4">
                    <TabContent activeTab={activeTab}>
                      <TabPane tabId="1">
                        <Form>
                          <Row>
                            <Col lg={6}>
                              <div className="mb-3">
                                <Label
                                  htmlFor="firstnameInput"
                                  className="form-label"
                                >
                                  Company Name
                                </Label>
                                <Input
                                  type="text"
                                  className="form-control"
                                  id="firstnameInput"
                                  value={state?.user?.name}
                                  placeholder="Enter your firstname"
                                />
                              </div>
                            </Col>
                            <Col lg={6}>
                              <div className="mb-3">
                                <Label
                                  htmlFor="emailInput"
                                  className="form-label"
                                >
                                  Email Address
                                </Label>
                                <Input
                                  type="email"
                                  className="form-control"
                                  id="emailInput"
                                  placeholder="Enter your email"
                                  value={session?.user?.email}
                                />
                              </div>
                            </Col>
                            <Col lg={12}>
                              <div className="hstack gap-2 justify-content-end">
                                <button
                                  type="button"
                                  className="btn btn-primary fs-5"
                                >
                                  Updates
                                </button>
                                <button
                                  type="button"
                                  className="btn btn-soft-success fs-5"
                                  onClick={() => router.push('/')}
                                >
                                  Cancel
                                </button>
                              </div>
                            </Col>
                          </Row>
                        </Form>
                      </TabPane>

                      <TabPane tabId="2">
                        <Form>
                          <Row className="g-2">
                            <Col lg={4}>
                              <div>
                                <Label
                                  htmlFor="oldpasswordInput"
                                  className="form-label"
                                >
                                  Old Password*
                                </Label>
                                <Input
                                  type="password"
                                  className="form-control"
                                  id="oldpasswordInput"
                                  placeholder="Enter current password"
                                />
                              </div>
                            </Col>

                            <Col lg={4}>
                              <div>
                                <Label
                                  htmlFor="newpasswordInput"
                                  className="form-label"
                                >
                                  New Password*
                                </Label>
                                <Input
                                  type="password"
                                  className="form-control"
                                  id="newpasswordInput"
                                  placeholder="Enter new password"
                                />
                              </div>
                            </Col>

                            <Col lg={4}>
                              <div>
                                <Label
                                  htmlFor="confirmpasswordInput"
                                  className="form-label"
                                >
                                  Confirm Password*
                                </Label>
                                <Input
                                  type="password"
                                  className="form-control"
                                  id="confirmpasswordInput"
                                  placeholder="Confirm password"
                                />
                              </div>
                            </Col>

                            <Col lg={12}>
                              <div className="mb-3">
                                <Link
                                  href={'/'}
                                  className="link-primary text-decoration-underline"
                                >
                                  Forgot Password ?
                                </Link>
                              </div>
                            </Col>

                            <Col lg={12}>
                              <div className="text-end">
                                <button
                                  type="button"
                                  className="btn btn-success"
                                >
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
