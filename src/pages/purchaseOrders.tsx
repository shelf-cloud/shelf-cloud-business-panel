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
import { ChevronDownIcon } from 'lucide-react'

import { Button } from '@shadcn/ui/button'
import { Card, CardHeader, CardContent } from '@shadcn/ui/card'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@shadcn/ui/dropdown-menu'
import { Nav, NavItem, NavLink, TabContent, TabPane } from '@/components/ui/nav-tabs'

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
          <div className='mx-auto w-full px-3'>
            <PurchaseOrdersWidgets />
            <div className='flex flex-wrap -mx-3'>
              <div className='px-3 w-full'>
                <Card>
                  <CardHeader>
                    <div className='flex flex-col justify-between items-end mt-0 mb-0 gap-3 lg:flex-row'>
                      <div className='flex-1'>
                        <p className='m-0 p-0 text-[11.2px] text-muted-foreground font-normal'>Organize Purchase Orders by:</p>
                        <Nav className='pt-1' role='tablist'>
                          <NavItem style={{ cursor: 'pointer' }}>
                            <NavLink
                              className={organizeBy == 'suppliers' ? '!text-primary font-semibold text-[16.25px]' : '!text-muted-foreground text-[16.25px]'}
                              onClick={() => {
                                router.replace(`/purchaseOrders?status=${status}&organizeBy=suppliers`, undefined, { shallow: true })
                              }}>
                              Suppliers
                            </NavLink>
                          </NavItem>
                          <NavItem style={{ cursor: 'pointer' }}>
                            <NavLink
                              className={organizeBy == 'orders' ? '!text-primary font-semibold text-[16.25px]' : '!text-muted-foreground text-[16.25px]'}
                              onClick={() => {
                                router.replace(`/purchaseOrders?status=${status}&organizeBy=orders`, undefined, { shallow: true })
                              }}
                              type='button'>
                              Purchase Order
                            </NavLink>
                          </NavItem>
                          <NavItem style={{ cursor: 'pointer' }}>
                            <NavLink
                              className={organizeBy == 'sku' ? '!text-primary font-semibold text-[16.25px]' : '!text-muted-foreground text-[16.25px]'}
                              onClick={() => {
                                router.replace(`/purchaseOrders?status=${status}&organizeBy=sku`, undefined, { shallow: true })
                              }}
                              type='button'>
                              SKU
                            </NavLink>
                          </NavItem>
                        </Nav>
                      </div>
                      <div className='flex-1 w-auto flex flex-row flex-wrap items-end justify-start gap-2 lg:justify-end'>
                        {status == 'pending' ? (
                          <Button
                            className='text-[11.2px] py-1 px-3 text-nowrap'
                            variant='info'
                            onClick={() => {
                              router.replace(`/purchaseOrders?status=all&organizeBy=${organizeBy}`)
                            }}>
                            <i className='mdi mdi-eye label-icon align-middle text-[16.25px] me-2' />
                            Show Completed
                          </Button>
                        ) : (
                          <Button
                            className='text-[11.2px] py-1 px-3 text-nowrap'
                            variant='info'
                            onClick={() => {
                              router.replace(`/purchaseOrders?status=pending&organizeBy=${organizeBy}`)
                            }}>
                            <i className='mdi mdi-eye-off label-icon align-middle text-[16.25px] me-2' />
                            Hide Completed
                          </Button>
                        )}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button
                              type='button'
                              className='inline-flex items-center gap-1 rounded-md bg-primary py-1 px-3 text-[11.2px] font-medium text-primary-foreground whitespace-nowrap shadow-xs hover:bg-primary/90'>
                              <i className='mdi mdi-plus-circle label-icon align-middle text-[16.25px] me-2' />
                              Add Purchase Order
                              <ChevronDownIcon className='ml-1 size-4' />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align='start'>
                            <DropdownMenuItem onClick={() => setShowCreatePoFromFile(true)}>From File</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setShowCreatePoManually(true)}>Manually</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                        <Button
                          className='text-[11.2px] py-1 px-3 text-nowrap'
                          onClick={() => {
                            setShowCreateReceivingFromPo(true)
                          }}>
                          <i className='mdi mdi-airplane-landing label-icon align-middle text-[16.25px] me-2' />
                          Create Receiving
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <TabContent activeTab={organizeBy}>
                      <TabPane tabId='suppliers'>{organizeBy == 'suppliers' && <By_Suppliers />}</TabPane>
                      <TabPane tabId='orders'>{organizeBy == 'orders' && <By_Purchase_Orders />}</TabPane>
                      <TabPane tabId='sku'>{organizeBy == 'sku' && <By_Sku />}</TabPane>
                    </TabContent>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
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
