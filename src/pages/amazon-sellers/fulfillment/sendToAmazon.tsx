import { GetServerSideProps } from 'next'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import React, { useContext, useRef, useState } from 'react'

import { getSession } from '@auth/client'
import BreadCrumb from '@components/Common/BreadCrumb'
import InventoryBinsModal from '@components/InventoryBinsModal'
import IndividualUnits from '@components/amazon/fulfillment/individualUnits/IndividualUnitsFulfillment'
import MasterBoxesFulfillment from '@components/amazon/fulfillment/masterBoxes/MasterBoxesFulfillment'
import MasterBoxHelp from '@components/amazon/offcanvas/MasterBoxHelp'
import AppContext from '@context/AppContext'
import { AmazonFulfillmentSku } from '@typesTs/amazon/fulfillments'
import axios from 'axios'
import { toast } from 'react-toastify'
import { Button, Card, CardBody, CardHeader, Col, Container, Nav, NavItem, NavLink, Row, TabContent, TabPane } from 'reactstrap'
import useSWR from 'swr'

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

const SendToAmazon = ({ session }: Props) => {
  const { state } = useContext(AppContext)
  const router = useRouter()
  const title = `Send To Amazon | ${session?.user?.businessName}`
  const [allData, setAllData] = useState<AmazonFulfillmentSku[]>([])
  const [helpOffCanvasIsOpen, setHelpOffCanvasIsOpen] = useState(false)

  const controllerRef = useRef<AbortController | null>(null)
  const { isValidating: isLoadingProducts, mutate: mutateFBASkus } = useSWR(
    session && state.user.businessId ? `/api/amazon/fullfilments/get-send-to-amazon-skus?region=${state.currentRegion}&businessId=${state.user.businessId}` : null,
    async (endPoint: string) => {
      try {
        const response = await axios.get(endPoint, {
          signal: controllerRef.current?.signal,
        })
        return response.data
      } catch (error) {
        if (!axios.isCancel(error)) {
          toast.error('Error fetching shipment Log data')
          setAllData([])
        }
      }
    },
    {
      revalidateOnFocus: false,
      onSuccess: (data) => {
        setAllData(data)
      },
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
                            router.push(`/amazon-sellers/fulfillment/sendToAmazon`, undefined, { shallow: true })
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
                            router.push(`/amazon-sellers/fulfillment/sendToAmazon`, undefined, { shallow: true })
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
                      <Link href={'/amazon-sellers/fulfillments'}>
                        <Button color='info' className='fs-7'>
                          <span className='icon-on'>
                            <i className='ri-external-link-fill align-bottom me-1' />
                            Fulfillments
                          </span>
                        </Button>
                      </Link>
                      {/* <Button color='info' className='d-flex align-items-center' onClick={() => setHelpOffCanvasIsOpen(true)}>
                        <i className='ri-question-line fs-14 p-0 m-0 me-lg-1' />
                        <span className='d-none d-lg-block'>Need help</span>
                      </Button> */}
                    </div>
                  </CardHeader>
                  <CardBody>
                    <TabContent activeTab={activeTab}>
                      <TabPane tabId='1'>
                        <MasterBoxesFulfillment lisiting={allData} pending={isLoadingProducts} mutateFBASkus={mutateFBASkus} />
                      </TabPane>
                      <TabPane tabId='2'>
                        <IndividualUnits lisiting={allData} pending={isLoadingProducts} />
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
      <MasterBoxHelp isOpen={helpOffCanvasIsOpen} setHelpOffCanvasIsOpen={setHelpOffCanvasIsOpen} />
    </div>
  )
}

export default SendToAmazon
