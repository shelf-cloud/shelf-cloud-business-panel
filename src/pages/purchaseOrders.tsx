/* eslint-disable react-hooks/exhaustive-deps */
import { GetServerSideProps } from 'next'
import Head from 'next/head'
import { useRouter } from 'next/router'
import React, { useContext, useEffect } from 'react'

import { getSession } from '@auth/client'
import BreadCrumb from '@components/Common/BreadCrumb'
import Add_Payment_Modal from '@components/modals/purchaseOrders/Add_Payment_Modal'
import Add_Po_Manually from '@components/modals/purchaseOrders/Add_Po_Manually'
import Add_Po_With_File from '@components/modals/purchaseOrders/Add_Po_With_File'
import Add_Sku_To_Purchase_Order from '@components/modals/purchaseOrders/Add_Sku_To_Purchase_Order'
import Create_Receiving_From_Po from '@components/modals/purchaseOrders/Create_Receiving_From_Po'
import By_Purchase_Orders from '@components/purchase_orders/By_Purchase_Orders'
import By_Sku from '@components/purchase_orders/By_Sku'
import By_Suppliers from '@components/purchase_orders/By_Suppliers'
import PurchaseOrdersWidgets from '@components/purchase_orders/ProductsWidgets'
import AppContext from '@context/AppContext'
import { useWarehouses } from '@hooks/warehouses/useWarehouse'
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
} from '@/components/migration-ui'

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
      businessOrderStart: string
    }
  }
}

const PurchaseOrders = ({ session }: Props) => {
  const router = useRouter()
  const { status, organizeBy }: any = router.query
  const { state, setShowCreateReceivingFromPo, setReceivingFromPo, setShowCreatePoFromFile, setShowCreatePoManually } = useContext(AppContext)
  const title = `Purchase Orders | ${session?.user?.businessName}`
  const orderNumberStart = `${session?.user?.businessOrderStart?.substring(0, 3).toUpperCase()}-`
  useWarehouses()

  useEffect(() => {
    return () => {
      Object.keys(state.receivingFromPo).length > 0 &&
        setReceivingFromPo({
          warehouse: {
            id: 0,
            name: '',
          },
          items: {},
        })
    }
  }, [])

  return (
    <div>
      <Head>
        <title>{title}</title>
      </Head>
      <React.Fragment>
        <div className='page-content'>
          <BreadCrumb title='Purchase Orders' pageTitle='Inbound' />
          <Container fluid>
            <PurchaseOrdersWidgets />
            <Row>
              <Col lg={12}>
                <Card>
                  <CardHeader>
                    <div className='tw:flex tw:flex-col tw:justify-between tw:items-end tw:mt-0 tw:mb-0 tw:gap-3 tw:lg:flex-row'>
                      <div className='tw:flex-1'>
                        <p className='tw:m-0 tw:p-0 tw:text-[11.2px] tw:text-[color:var(--bs-secondary-color)] tw:font-normal'>Organize Purchase Orders by:</p>
                        <Nav className='tw:pt-1' role='tablist'>
                          <NavItem style={{ cursor: 'pointer' }}>
                            <NavLink
                              className={organizeBy == 'suppliers' ? 'tw:!text-primary tw:font-semibold tw:text-[16.25px]' : 'tw:!text-[color:var(--bs-secondary-color)] tw:text-[16.25px]'}
                              onClick={() => {
                                router.replace(`/purchaseOrders?status=${status}&organizeBy=suppliers`, undefined, { shallow: true })
                              }}>
                              Suppliers
                            </NavLink>
                          </NavItem>
                          <NavItem style={{ cursor: 'pointer' }}>
                            <NavLink
                              className={organizeBy == 'orders' ? 'tw:!text-primary tw:font-semibold tw:text-[16.25px]' : 'tw:!text-[color:var(--bs-secondary-color)] tw:text-[16.25px]'}
                              onClick={() => {
                                router.replace(`/purchaseOrders?status=${status}&organizeBy=orders`, undefined, { shallow: true })
                              }}
                              type='button'>
                              Purchase Order
                            </NavLink>
                          </NavItem>
                          <NavItem style={{ cursor: 'pointer' }}>
                            <NavLink
                              className={organizeBy == 'sku' ? 'tw:!text-primary tw:font-semibold tw:text-[16.25px]' : 'tw:!text-[color:var(--bs-secondary-color)] tw:text-[16.25px]'}
                              onClick={() => {
                                router.replace(`/purchaseOrders?status=${status}&organizeBy=sku`, undefined, { shallow: true })
                              }}
                              type='button'>
                              SKU
                            </NavLink>
                          </NavItem>
                        </Nav>
                      </div>
                      <div className='tw:flex-1 tw:w-auto tw:flex tw:flex-row tw:flex-wrap tw:items-end tw:justify-start tw:gap-2 tw:lg:justify-end'>
                        {status == 'pending' ? (
                          <Button
                            className='tw:text-[11.2px] tw:py-1 tw:px-3 tw:text-nowrap'
                            color='info'
                            onClick={() => {
                              router.replace(`/purchaseOrders?status=all&organizeBy=${organizeBy}`)
                            }}>
                            <i className='mdi mdi-eye label-icon tw:align-middle tw:text-[16.25px] tw:me-2' />
                            Show Completed
                          </Button>
                        ) : (
                          <Button
                            className='tw:text-[11.2px] tw:py-1 tw:px-3 tw:text-nowrap'
                            color='info'
                            onClick={() => {
                              router.replace(`/purchaseOrders?status=pending&organizeBy=${organizeBy}`)
                            }}>
                            <i className='mdi mdi-eye-off label-icon tw:align-middle tw:text-[16.25px] tw:me-2' />
                            Hide Completed
                          </Button>
                        )}
                        <UncontrolledButtonDropdown>
                          <DropdownToggle
                            caret
                            className='tw:inline-flex tw:items-center tw:gap-1 tw:rounded-md tw:bg-primary tw:py-1 tw:px-3 tw:text-[11.2px] tw:font-medium tw:text-primary-foreground tw:whitespace-nowrap tw:shadow-xs tw:hover:bg-primary/90'>
                            <i className='mdi mdi-plus-circle label-icon tw:align-middle tw:text-[16.25px] tw:me-2' />
                            Add Purchase Order
                          </DropdownToggle>
                          <DropdownMenu>
                            <DropdownItem onClick={() => setShowCreatePoFromFile(true)}>From File</DropdownItem>
                            <DropdownItem onClick={() => setShowCreatePoManually(true)}>Manually</DropdownItem>
                          </DropdownMenu>
                        </UncontrolledButtonDropdown>
                        <Button
                          color='primary'
                          className='tw:text-[11.2px] tw:py-1 tw:px-3 tw:text-nowrap'
                          onClick={() => {
                            setShowCreateReceivingFromPo(true)
                          }}>
                          <i className='mdi mdi-airplane-landing label-icon tw:align-middle tw:text-[16.25px] tw:me-2' />
                          Create Receiving
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardBody>
                    <TabContent activeTab={organizeBy}>
                      <TabPane tabId='suppliers'>{organizeBy == 'suppliers' && <By_Suppliers />}</TabPane>
                      <TabPane tabId='orders'>{organizeBy == 'orders' && <By_Purchase_Orders />}</TabPane>
                      <TabPane tabId='sku'>{organizeBy == 'sku' && <By_Sku />}</TabPane>
                    </TabContent>
                  </CardBody>
                </Card>
              </Col>
            </Row>
          </Container>
        </div>
      </React.Fragment>
      {state.modalAddSkuToPurchaseOrder.show && <Add_Sku_To_Purchase_Order />}
      {state.showAddPaymentToPo && <Add_Payment_Modal />}
      {state.showCreateReceivingFromPo && <Create_Receiving_From_Po orderNumberStart={orderNumberStart} />}
      {state.showCreatePoFromFile && <Add_Po_With_File orderNumberStart={orderNumberStart} />}
      {state.showCreatePoManually && <Add_Po_Manually orderNumberStart={orderNumberStart} />}
    </div>
  )
}

export default PurchaseOrders
