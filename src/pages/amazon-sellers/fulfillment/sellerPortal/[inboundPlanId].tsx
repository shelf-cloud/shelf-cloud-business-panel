import { GetServerSideProps } from 'next'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import React, { useContext, useState } from 'react'

import { getSession } from '@auth/client'
import BreadCrumb from '@components/Common/BreadCrumb'
import BoxLabels from '@components/amazon/fulfillment/fulfillment_page/BoxLabels'
import CarrierPalletInfo from '@components/amazon/fulfillment/fulfillment_page/CarrierPalletInfo'
import InventoryToSend from '@components/amazon/fulfillment/fulfillment_page/InventoryToSend'
import ShippingCompleted from '@components/amazon/fulfillment/fulfillment_page/ShippingCompleted'
import TrackingDetails from '@components/amazon/fulfillment/fulfillment_page/TrackingDetails'
import MasterBoxHelp from '@components/amazon/offcanvas/MasterBoxHelp'
import AppContext from '@context/AppContext'
import { GetLabelsResponse, InboundPlan, WaitingReponses } from '@typesTs/amazon/fulfillments/fulfillment'
import axios from 'axios'
import { toast } from 'react-toastify'
import { Badge, Button, Card, CardBody, CardHeader, Col, Container, Nav, NavItem, NavLink, Row, Spinner, TabContent, TabPane } from 'reactstrap'
import useSWR from 'swr'

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

const InboundPlanDetails = ({ session, sessionToken }: Props) => {
  const router = useRouter()
  const { inboundPlanId } = router.query
  const { state }: any = useContext(AppContext)
  const [inboundPlanDetails, setinboundPlanDetails] = useState<InboundPlan | null>()
  const [loading, setloading] = useState(true)
  const [helpOffCanvasIsOpen, setHelpOffCanvasIsOpen] = useState(false)
  const [watingRepsonse, setWatingRepsonse] = useState<WaitingReponses>({
    inventoryToSend: false,
    shipping: false,
    shippingExpired: false,
    transportationOptions: false,
    boxLabels: false,
    printingLabel: false,
    CarrierPalletInfo: false,
    trackingDetails: false,
  })
  const [activeTab, setActiveTab] = useState('6')
  const title = `Inbound Plan Details | ${session?.user?.businessName}`

  const controller = new AbortController()
  const signal = controller.signal
  const fetcher = (endPoint: string) => {
    !inboundPlanDetails && setloading(true)
    axios(endPoint, {
      signal,
    })
      .then(({ data }: { data: { inboundPlan: InboundPlan } }) => {
        setinboundPlanDetails(data.inboundPlan)
        setloading(false)
        Object.entries(data.inboundPlan.steps).find(([step, stepinfo]) => {
          if (stepinfo.complete === false) {
            setActiveTab(step)
            return true
          }
        })
      })
      .catch(({ error }) => {
        if (axios.isCancel(error)) {
          toast.error('Error fetching shipment Log data')
          setinboundPlanDetails(null)
          setloading(false)
        }
      })
  }
  useSWR(
    session && state.user.businessId
      ? `/api/amazon/fullfilments/getSellerInboundPlan?region=${state.currentRegion}&businessId=${state.user.businessId}&inboundPlanId=${inboundPlanId}`
      : null,
    fetcher,
    {
      revalidateOnFocus: false,
    }
  )

  const tabChange = (tab: any) => {
    if (activeTab !== tab) setActiveTab(tab)
  }

  const handlePrintShipmentBoxesLabel = async (shipmentId: string, boxes: number) => {
    setWatingRepsonse((prev: any) => ({ ...prev, printingLabel: true }))
    const cancelInboundPlanToast = toast.loading('Generating Shipment Label...')
    try {
      const controller = new AbortController()
      const signal = controller.signal
      const response = (await axios
        .get(`${process.env.NEXT_PUBLIC_SHELFCLOUD_SERVER_URL}/api/amz_workflow/getLabels/${state.currentRegion}/${state.user.businessId}/${shipmentId}/${boxes}`, {
          signal,
          headers: {
            Authorization: `Bearer ${sessionToken}`,
          },
        })
        .then(({ data }) => data)
        .catch(({ error }) => {
          if (axios.isCancel(error)) {
            toast.error('Error Generating Shipment Label')
          }
        })) as GetLabelsResponse

      if (!response.error) {
        toast.update(cancelInboundPlanToast, {
          render: response.message,
          type: 'success',
          isLoading: false,
          autoClose: 3000,
        })
        const a = document.createElement('a')
        a.href = response.labels.payload.DownloadURL
        a.download = shipmentId
        a.click()
      } else {
        toast.update(cancelInboundPlanToast, {
          render: response.message,
          type: 'error',
          isLoading: false,
          autoClose: 3000,
        })
      }
      setWatingRepsonse((prev: any) => ({ ...prev, printingLabel: false }))
    } catch (error) {
      setWatingRepsonse((prev: any) => ({ ...prev, printingLabel: false }))
    }
  }

  const handlePrintShipmentPalletLabel = async (shipmentId: string, pallets: number) => {
    setWatingRepsonse((prev: any) => ({ ...prev, printingLabel: true }))
    const cancelInboundPlanToast = toast.loading('Generating Shipment Pallet Label...')
    try {
      const controller = new AbortController()
      const signal = controller.signal
      const response = (await axios
        .get(`${process.env.NEXT_PUBLIC_SHELFCLOUD_SERVER_URL}/api/amz_workflow/getPalletLabels/${state.currentRegion}/${state.user.businessId}/${shipmentId}/${pallets}`, {
          signal,
          headers: {
            Authorization: `Bearer ${sessionToken}`,
          },
        })
        .then(({ data }) => data)
        .catch(({ error }) => {
          if (axios.isCancel(error)) {
            toast.error('Error Generating Shipment Pallet Label')
          }
        })) as GetLabelsResponse

      if (!response.error) {
        toast.update(cancelInboundPlanToast, {
          render: response.message,
          type: 'success',
          isLoading: false,
          autoClose: 3000,
        })
        const a = document.createElement('a')
        a.href = response.labels.payload.DownloadURL
        a.download = shipmentId
        a.click()
      } else {
        toast.update(cancelInboundPlanToast, {
          render: response.message,
          type: 'error',
          isLoading: false,
          autoClose: 3000,
        })
      }
      setWatingRepsonse((prev: any) => ({ ...prev, printingLabel: false }))
    } catch (error) {
      setWatingRepsonse((prev: any) => ({ ...prev, printingLabel: false }))
    }
  }

  const handlePrintShipmentBillOfLading = async (shipmentId: string) => {
    setWatingRepsonse((prev: any) => ({ ...prev, printingLabel: true }))
    const cancelInboundPlanToast = toast.loading('Generating Bill Of Lading...')
    try {
      const controller = new AbortController()
      const signal = controller.signal
      const response = (await axios
        .get(`${process.env.NEXT_PUBLIC_SHELFCLOUD_SERVER_URL}/api/amz_workflow/getBillOfLading/${state.currentRegion}/${state.user.businessId}/${shipmentId}`, {
          signal,
          headers: {
            Authorization: `Bearer ${sessionToken}`,
          },
        })
        .then(({ data }) => data)
        .catch(({ error }) => {
          if (axios.isCancel(error)) {
            toast.error('Error Generating Bill Of Lading')
          }
        })) as GetLabelsResponse

      if (!response.error) {
        toast.update(cancelInboundPlanToast, {
          render: response.message,
          type: 'success',
          isLoading: false,
          autoClose: 3000,
        })
        const a = document.createElement('a')
        a.href = response.labels.payload.DownloadURL
        a.download = shipmentId
        a.click()
      } else {
        toast.update(cancelInboundPlanToast, {
          render: response.message,
          type: 'error',
          isLoading: false,
          autoClose: 3000,
        })
      }
      setWatingRepsonse((prev: any) => ({ ...prev, printingLabel: false }))
    } catch (error) {
      setWatingRepsonse((prev: any) => ({ ...prev, printingLabel: false }))
    }
  }

  return (
    <div>
      <Head>
        <title>{title}</title>
      </Head>
      <React.Fragment>
        <div className='page-content'>
          <Container fluid>
            <BreadCrumb title='Fulfillment Workdflow' pageTitle='Send to Amazon' />
            <Card className='fs-6'>
              {!loading && inboundPlanDetails ? (
                <>
                  <CardHeader>
                    <div className='d-flex flex-row justify-content-between align-items-start'>
                      <Link href={'/amazon-sellers/fulfillments'}>
                        <Button outline>
                          <span className='icon-on'>
                            <i className='ri-arrow-left-line align-bottom me-1' />
                            Fulfillments
                          </span>
                        </Button>
                      </Link>
                      <Button color='info' className='d-flex align-items-center' onClick={() => setHelpOffCanvasIsOpen(true)}>
                        <i className='ri-question-line fs-14 p-0 m-0 me-lg-1' />
                        <span className='d-none d-lg-block'>Need help</span>
                      </Button>
                    </div>
                    <div className='mt-3'>
                      <p className='fw-semibold fs-4 m-0 p-0'>
                        <span className='text-muted fw-normal'>Name: </span>
                        {inboundPlanDetails.name}
                        <Badge color='info' className='ms-2 fs-6'>
                          {inboundPlanDetails.fulfillmentType}
                        </Badge>
                      </p>
                      <p className='fw-normal fs-6 m-0 p-0'>
                        <span className='text-muted'>Inbound ID: </span>
                        {inboundPlanId}
                        <i
                          className='ri-file-copy-line fs-6 my-0 mx-1 p-0 text-muted'
                          style={{ cursor: 'pointer' }}
                          onClick={() => {
                            navigator.clipboard.writeText(`${inboundPlanId}`)
                            toast('Inbound ID copied!')
                          }}
                        />
                      </p>
                    </div>
                  </CardHeader>
                  <CardBody>
                    <Row>
                      <Col xs='12' className='gap-2 d-flex flex-column'>
                        <Nav className='pt-0 nav-tabs-custom rounded card-header-tabs border-bottom-0' role='tablist'>
                          <NavItem style={{ cursor: 'pointer' }}>
                            <NavLink
                              to='#'
                              className={
                                'fs-5 fw-semibold ' + (activeTab == '1' ? 'text-primary' : inboundPlanDetails.steps[1].complete ? 'text-success opacity-50' : 'text-muted')
                              }
                              onClick={() => {
                                tabChange('1')
                              }}
                              type='button'>
                              <>
                                <i className='far fa-user'></i>
                                Inventory to Send
                              </>
                            </NavLink>
                          </NavItem>
                          <NavItem style={{ cursor: 'pointer' }}>
                            <NavLink
                              className={
                                'fs-5 fw-semibold ' + (activeTab == '3' ? 'text-primary' : inboundPlanDetails.steps[3].complete ? 'text-success opacity-50' : 'text-muted')
                              }
                              onClick={() => {
                                inboundPlanDetails?.steps[2]?.complete ? tabChange('3') : document.getElementById('btn_handleNextStepPacking')?.focus()
                              }}>
                              <>
                                <i className='fas fa-home'></i>
                                Shipping
                              </>
                            </NavLink>
                          </NavItem>
                          <NavItem style={{ cursor: 'pointer' }}>
                            <NavLink
                              to='#'
                              className={
                                'fs-5 fw-semibold ' + (activeTab == '4' ? 'text-primary' : inboundPlanDetails.steps[4].complete ? 'text-success opacity-50' : 'text-muted')
                              }
                              onClick={() => {
                                inboundPlanDetails?.steps[3]?.complete ? tabChange('4') : document.getElementById('btn_handleNextShipping')?.focus()
                              }}
                              type='button'>
                              <>
                                <i className='far fa-user'></i>
                                Box Labels
                              </>
                            </NavLink>
                          </NavItem>
                          <NavItem style={{ cursor: 'pointer' }}>
                            <NavLink
                              to='#'
                              className={
                                'fs-5 fw-semibold ' + (activeTab == '5' ? 'text-primary' : inboundPlanDetails.steps[5].complete ? 'text-success opacity-50' : 'text-muted')
                              }
                              onClick={() => {
                                inboundPlanDetails?.steps[4]?.complete ? tabChange('5') : document.getElementById('btn_handleNextShipping')?.focus()
                              }}
                              type='button'>
                              <>
                                <i className='far fa-user'></i>
                                Carrier and Pallet Info
                              </>
                            </NavLink>
                          </NavItem>
                          <NavItem style={{ cursor: 'pointer' }}>
                            <NavLink
                              to='#'
                              className={
                                'fs-5 fw-semibold ' + (activeTab == '6' ? 'text-primary' : inboundPlanDetails.steps[6].complete ? 'text-success opacity-50' : 'text-muted')
                              }
                              onClick={() => {
                                inboundPlanDetails?.steps[5]?.complete ? tabChange('6') : document.getElementById('btn_handleNextShipping')?.focus()
                              }}
                              type='button'>
                              <>
                                <i className='far fa-user'></i>
                                Tracking Details
                              </>
                            </NavLink>
                          </NavItem>
                        </Nav>
                        <TabContent activeTab={activeTab} className='pt-2 pb-4 border-bottom'>
                          <TabPane tabId='1'>
                            <InventoryToSend inboundPlan={inboundPlanDetails} watingRepsonse={watingRepsonse} />
                          </TabPane>
                          <TabPane tabId='3'>{inboundPlanDetails.steps[2].complete && <ShippingCompleted inboundPlan={inboundPlanDetails} />}</TabPane>
                          <TabPane tabId='4'>
                            {inboundPlanDetails.steps[3].complete && (
                              <BoxLabels inboundPlan={inboundPlanDetails} handleNextStep={handlePrintShipmentBoxesLabel} watingRepsonse={watingRepsonse} />
                            )}
                          </TabPane>
                          <TabPane tabId='5'>
                            {inboundPlanDetails.steps[4].complete && (
                              <CarrierPalletInfo inboundPlan={inboundPlanDetails} handleNextStep={handlePrintShipmentPalletLabel} watingRepsonse={watingRepsonse} />
                            )}
                          </TabPane>
                          <TabPane tabId='6'>
                            {inboundPlanDetails.steps[5].complete && (
                              <TrackingDetails inboundPlan={inboundPlanDetails} handlePrintShipmentBillOfLading={handlePrintShipmentBillOfLading} watingRepsonse={watingRepsonse} />
                            )}
                          </TabPane>
                        </TabContent>
                      </Col>
                    </Row>
                  </CardBody>
                </>
              ) : (
                <div className='w-100 px-4 py-4 d-flex gap-4'>
                  <Spinner color='primary' className='fs-3' />
                  <p className='fs-3 fw-semibold'>Loading...</p>
                </div>
              )}
            </Card>
          </Container>
        </div>
      </React.Fragment>
      <MasterBoxHelp isOpen={helpOffCanvasIsOpen} setHelpOffCanvasIsOpen={setHelpOffCanvasIsOpen} />
    </div>
  )
}

export default InboundPlanDetails
