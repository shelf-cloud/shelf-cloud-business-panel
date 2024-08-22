import React, { useState, useContext } from 'react'
import AppContext from '@context/AppContext'
import { GetServerSideProps } from 'next'
import axios from 'axios'
import Link from 'next/link'
import Head from 'next/head'
import { Button, Card, CardBody, CardHeader, Col, Container, Nav, NavItem, NavLink, Row, TabContent, TabPane } from 'reactstrap'
import BreadCrumb from '@components/Common/BreadCrumb'
import { getSession } from '@auth/client'
import InventoryBinsModal from '@components/InventoryBinsModal'
import useSWR from 'swr'
import { toast } from 'react-toastify'
import { AmazonFulfillmentSku } from '@typesTs/amazon/fulfillments'
import MasterBoxesFulfillment from '@components/amazon/fulfillment/MasterBoxesFulfillment'
import MasterBoxHelp from '@components/amazon/offcanvas/MasterBoxHelp'

export const getServerSideProps: GetServerSideProps<{}> = async (context) => {
  const sessionToken = context.req.cookies['next-auth.session-token'] ? context.req.cookies['next-auth.session-token'] : context.req.cookies['__Secure-next-auth.session-token']
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
    props: { session, sessionToken },
  }
}

type Props = {
  sessionToken: string
  session: {
    user: {
      businessName: string
      businessOrderStart: string
    }
  }
}

const SendToAmazon = ({ session, sessionToken }: Props) => {
  const { state }: any = useContext(AppContext)
  const title = `Send To Amazon | ${session?.user?.businessName}`
  const [pending, setPending] = useState(true)
  const [allData, setAllData] = useState<AmazonFulfillmentSku[]>([])
  const [helpOffCanvasIsOpen, setHelpOffCanvasIsOpen] = useState(false)

  const controller = new AbortController()
  const signal = controller.signal
  const fetcher = (endPoint: string) => {
    allData.length === 0 && setPending(true)
    axios(endPoint, {
      signal,
      headers: {
        Authorization: `Bearer ${sessionToken}`,
      },
    })
      .then((res) => {
        setAllData(res.data)
        setPending(false)
      })
      .catch(({ error }) => {
        if (axios.isCancel(error)) {
          toast.error(error?.data?.message || 'Error fetching shipment Log data')
          setAllData([])
          setPending(false)
        }
      })
  }
  useSWR(
    session && state.user.businessId ? `${process.env.NEXT_PUBLIC_SHELFCLOUD_SERVER_URL}/api/amz_workflow/getAmazonFbaSkus/${state.currentRegion}/${state.user.businessId}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
    }
  )

  const [activeTab, setActiveTab] = useState('1')
  const tabChange = (tab: any) => {
    if (activeTab !== tab) setActiveTab(tab)
  }

  return (
    <div>
      <Head>
        <title>{title}</title>
      </Head>
      <React.Fragment>
        <div className='page-content'>
          <Container fluid>
            <BreadCrumb title='Send To Amazon' pageTitle='Amazon' />
            <Row>
              <Col lg={12}>
                <Card>
                  <CardHeader className='d-flex justify-content-between align-items-center'>
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
                    <div className='d-flex justify-content-end align-items-center gap-3'>
                      <Link href={'/amazon-sellers/fulfillments'} passHref>
                        <a>
                          <Button color='info'>
                            <span className='icon-on'>
                              <i className='ri-file-list-line align-bottom me-1' />
                              Fulfillments
                            </span>
                          </Button>
                        </a>
                      </Link>
                      <Button color='info' className='d-flex align-items-center' onClick={() => setHelpOffCanvasIsOpen(true)}>
                        <i className='ri-question-line fs-14 p-0 m-0 me-lg-1' />
                        <span className='d-none d-lg-block'>Need help</span>
                      </Button>
                    </div>
                  </CardHeader>
                  <CardBody>
                    <TabContent activeTab={activeTab}>
                      <TabPane tabId='1'>
                        <MasterBoxesFulfillment lisiting={allData} pending={pending} />
                      </TabPane>
                      <TabPane tabId='2'>{/* <SingleItems completeData={completeData} pending={pending} orderNumberStart={orderNumberStart} /> */}</TabPane>
                    </TabContent>
                  </CardBody>
                </Card>
              </Col>
            </Row>
          </Container>
        </div>
      </React.Fragment>
      {state.showInventoryBinsModal && <InventoryBinsModal />}
      <MasterBoxHelp isOpen={helpOffCanvasIsOpen} setHelpOffCanvasIsOpen={setHelpOffCanvasIsOpen} />
    </div>
  )
}

export default SendToAmazon
