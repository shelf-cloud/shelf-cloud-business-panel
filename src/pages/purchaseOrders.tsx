/* eslint-disable react-hooks/exhaustive-deps */
import React, { useContext, useEffect, useState } from 'react'
import { GetServerSideProps } from 'next'
import Head from 'next/head'
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Col,
  Container,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Nav,
  NavItem,
  NavLink,
  Row,
  TabContent,
  TabPane,
  UncontrolledButtonDropdown,
} from 'reactstrap'
import BreadCrumb from '@components/Common/BreadCrumb'
import { getSession } from '@auth/client'
import By_Suppliers from '@components/purchase_orders/By_Suppliers'
import By_Purchase_Orders from '@components/purchase_orders/By_Purchase_Orders'
import By_Sku from '@components/purchase_orders/By_Sku'
import AppContext from '@context/AppContext'
import Add_Payment_Modal from '@components/modals/purchaseOrders/Add_Payment_Modal'
import Create_Receiving_From_Po from '@components/modals/purchaseOrders/Create_Receiving_From_Po'
import { useRouter } from 'next/router'
import Add_Sku_To_Purchase_Order from '@components/modals/purchaseOrders/Add_Sku_To_Purchase_Order'
import Add_Po_With_File from '@components/modals/purchaseOrders/Add_Po_With_File'
import Add_Po_Manually from '@components/modals/purchaseOrders/Add_Po_Manually'

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

const PurchaseOrders = ({ session }: Props) => {
  const router = useRouter()
  const { status, organizeBy }: any = router.query
  const { state, setShowCreateReceivingFromPo, setReceivingFromPo, setShowCreatePoFromFile, setShowCreatePoManually }: any = useContext(AppContext)
  const title = `Purchase Orders | ${session?.user?.name}`
  const orderNumberStart = `${session?.user?.name.substring(0, 3).toUpperCase()}-`
  const [activeTab, setActiveTab] = useState(organizeBy)
  const tabChange = (tab: any) => {
    if (activeTab !== tab) setActiveTab(tab)
  }

  useEffect(() => {
    tabChange(organizeBy)
    setActiveTab(organizeBy)
  }, [organizeBy])

  useEffect(() => {
    return () => {
      Object.keys(state.receivingFromPo).length > 0 && setReceivingFromPo({})
    }
  }, [])

  return (
    <div>
      <Head>
        <title>{title}</title>
      </Head>
      <React.Fragment>
        <div className='page-content'>
          <Container fluid>
            <BreadCrumb title='Purchase Orders' pageTitle='Inbound' />
            <Row>
              <Col lg={12}>
                <Card>
                  <CardHeader>
                    <div className='d-flex justify-content-between align-center mt-2 mb-3'>
                      <div>
                        <p className='m-0 p-0 fs-6 text-muted fw-normal'>Organize Purchase Orders by:</p>
                        <Nav className='pt-2 nav-tabs-custom rounded card-header-tabs border-bottom-0' role='tablist'>
                          <NavItem style={{ cursor: 'pointer' }}>
                            <NavLink
                              className={activeTab == 'suppliers' ? 'text-primary fw-semibold fs-5' : 'text-muted fs-5'}
                              onClick={() => {
                                router.replace(`/purchaseOrders?status=${status}&organizeBy=suppliers`)
                              }}>
                              <>
                                <i className='fas fa-home'></i>
                                Suppliers
                              </>
                            </NavLink>
                          </NavItem>
                          <NavItem style={{ cursor: 'pointer' }}>
                            <NavLink
                              className={activeTab == 'orders' ? 'text-primary fw-semibold fs-5' : 'text-muted fs-5'}
                              onClick={() => {
                                router.replace(`/purchaseOrders?status=${status}&organizeBy=orders`)
                              }}
                              type='button'>
                              <>
                                <i className='far fa-user'></i>
                                Purchase Order
                              </>
                            </NavLink>
                          </NavItem>
                          <NavItem style={{ cursor: 'pointer' }}>
                            <NavLink
                              className={activeTab == 'sku' ? 'text-primary fw-semibold fs-5' : 'text-muted fs-5'}
                              onClick={() => {
                                router.replace(`/purchaseOrders?status=${status}&organizeBy=sku`)
                              }}
                              type='button'>
                              <>
                                <i className='far fa-user'></i>
                                SKU
                              </>
                            </NavLink>
                          </NavItem>
                        </Nav>
                      </div>
                      <div className='w-auto d-flex flex-row align-items-center justify-content-between gap-3'>
                        {status == 'pending' ? (
                          <Button
                            className='btn fs-6 py-1 px-3'
                            color='info'
                            onClick={() => {
                              router.replace(`/purchaseOrders?status=all&organizeBy=${organizeBy}`)
                            }}>
                            <i className='mdi mdi-eye label-icon align-middle fs-5 me-2' />
                            Show Completed
                          </Button>
                        ) : (
                          <Button
                            className='btn fs-6 py-1 px-3'
                            color='info'
                            onClick={() => {
                              router.replace(`/purchaseOrders?status=pending&organizeBy=${organizeBy}`)
                            }}>
                            <i className='mdi mdi-eye-off label-icon align-middle fs-5 me-2' />
                            Hide Completed
                          </Button>
                        )}
                        <UncontrolledButtonDropdown>
                          <DropdownToggle className='btn btn-primary fs-6 py-1 px-3' caret>
                            <i className='mdi mdi-plus-circle label-icon align-middle fs-5 me-2' />
                            Add Purchase Order
                          </DropdownToggle>
                          <DropdownMenu>
                            <DropdownItem onClick={() => setShowCreatePoFromFile(true)}>From File</DropdownItem>
                            <DropdownItem onClick={() => setShowCreatePoManually(true)}>Manually</DropdownItem>
                          </DropdownMenu>
                        </UncontrolledButtonDropdown>
                        {/* <Button className='btn fs-6 py-1 px-3' color='primary' onClick={() => setShowCreatePoFromFile(true)}>
                          <i className='mdi mdi-plus-circle label-icon align-middle fs-5 me-2' />
                          Add Purchase Order
                        </Button> */}
                        <Button
                          color='primary'
                          className='fs-6 py-1 px-3'
                          onClick={() => {
                            setShowCreateReceivingFromPo(true)
                          }}>
                          <i className='mdi mdi-airplane-landing label-icon align-middle fs-5 me-2' />
                          Create Receiving
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardBody>
                    <TabContent activeTab={activeTab}>
                      <TabPane tabId='suppliers'>{activeTab == 'suppliers' && <By_Suppliers />}</TabPane>
                      <TabPane tabId='orders'>{activeTab == 'orders' && <By_Purchase_Orders />}</TabPane>
                      <TabPane tabId='sku'>{activeTab == 'sku' && <By_Sku />}</TabPane>
                    </TabContent>
                  </CardBody>
                </Card>
              </Col>
            </Row>
          </Container>
        </div>
      </React.Fragment>
      {state.showAddSkuToPurchaseOrder && <Add_Sku_To_Purchase_Order />}
      {state.showAddPaymentToPo && <Add_Payment_Modal />}
      {state.showCreateReceivingFromPo && <Create_Receiving_From_Po orderNumberStart={orderNumberStart} />}
      {state.showCreatePoFromFile && <Add_Po_With_File orderNumberStart={orderNumberStart} />}
      {state.showCreatePoManually && <Add_Po_Manually orderNumberStart={orderNumberStart} />}
    </div>
  )
}

export default PurchaseOrders
