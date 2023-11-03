/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useContext } from 'react'
import AppContext from '@context/AppContext'
import { GetServerSideProps } from 'next'
import { WholesaleProduct, wholesaleProductRow } from '@typings'
import axios from 'axios'
import Head from 'next/head'
import { Card, CardBody, CardHeader, Col, Container, Nav, NavItem, NavLink, Row, TabContent, TabPane } from 'reactstrap'
import BreadCrumb from '@components/Common/BreadCrumb'
import { getSession } from '@auth/client'
import InventoryBinsModal from '@components/InventoryBinsModal'
import MasterBoxes from '@components/orders/wholesale/MasterBoxes'
import SingleItems from '@components/orders/wholesale/SingleItems'
import { useRouter } from 'next/router'

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

const CreateWholeSaleOrder = ({ session }: Props) => {
  const { push } = useRouter()
  const { state }: any = useContext(AppContext)
  const orderNumberStart = `${session?.user?.name.substring(0, 3).toUpperCase()}-`
  const [pending, setPending] = useState(true)
  const [completeData, setCompleteData] = useState<wholesaleProductRow[]>([])

  useEffect(() => {
    if (!state.user[state.currentRegion]?.showWholeSale) {
      push('/')
    }
  }, [])

  useEffect(() => {
    const bringWholesaleInv = async () => {
      await axios(`/api/getWholesaleInventory?region=${state.currentRegion}&businessId=${state.user.businessId}`).then((res) => {
        const list: wholesaleProductRow[] = []
        res.data.forEach((product: WholesaleProduct) => {
          const row = {
            image: product.image,
            title: product.title,
            sku: product.sku,
            barcode: product.barcode,
            asin: product.asin,
            fnSku: product.fnSku,
            isKit: product.isKit,
            quantity: {
              quantity: product.quantity,
              reserved: product.reserved,
              inventoryId: product.inventoryId,
              businessId: product.businessId,
              sku: product.sku,
            },
            qtyBox: product.boxQty,
            orderQty: '',
            totalToShip: 0,
            maxOrderQty: product.maxOrderQty,
            children: product.children ? product.children : [],
          }
          list.push(row)
        })
        setCompleteData(list)
        setPending(false)
      })
    }
    state.user.businessId && bringWholesaleInv()
    return () => {
      setCompleteData([])
      setPending(true)
    }
  }, [state.currentRegion, state.user.businessId])

  const [activeTab, setActiveTab] = useState('1')
  const tabChange = (tab: any) => {
    if (activeTab !== tab) setActiveTab(tab)
  }

  const title = `Create WholeSale Order | ${session?.user?.name}`
  return (
    <div>
      <Head>
        <title>{title}</title>
      </Head>
      <React.Fragment>
        <div className='page-content'>
          <Container fluid>
            <BreadCrumb title='Create WholeSale Order' pageTitle='Shipments' />
            <Row>
              <Col lg={12}>
                <Card>
                  <CardHeader>
                    <Nav className='nav-tabs-custom rounded card-header-tabs border-bottom-0' role='tablist'>
                      <NavItem style={{ cursor: 'pointer' }}>
                        <NavLink
                          className={activeTab == '1' ? 'text-primary fw-semibold fs-5' : 'text-muted fs-5'}
                          onClick={() => {
                            tabChange('1')
                          }}>
                          <>
                            <i className='fas fa-home'></i>
                            Master Boxes
                          </>
                        </NavLink>
                      </NavItem>
                      <NavItem style={{ cursor: 'pointer' }}>
                        <NavLink
                          to='#'
                          className={activeTab == '2' ? 'text-primary fw-semibold fs-5' : 'text-muted fs-5'}
                          onClick={() => {
                            tabChange('2')
                          }}
                          type='button'>
                          <>
                            <i className='far fa-user'></i>
                            Individual Units
                          </>
                        </NavLink>
                      </NavItem>
                    </Nav>
                  </CardHeader>
                  <CardBody>
                    <TabContent activeTab={activeTab}>
                      <TabPane tabId='1'>
                        <MasterBoxes completeData={completeData} pending={pending} orderNumberStart={orderNumberStart} />
                      </TabPane>

                      <TabPane tabId='2'>
                        <SingleItems completeData={completeData} pending={pending} orderNumberStart={orderNumberStart} />
                      </TabPane>
                    </TabContent>
                  </CardBody>
                </Card>
              </Col>
            </Row>
          </Container>
        </div>
      </React.Fragment>
      {state.showInventoryBinsModal && <InventoryBinsModal />}
    </div>
  )
}

export default CreateWholeSaleOrder
