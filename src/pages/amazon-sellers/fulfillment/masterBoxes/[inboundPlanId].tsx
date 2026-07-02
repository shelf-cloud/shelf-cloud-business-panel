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
import PackingInfo from '@components/amazon/fulfillment/fulfillment_page/PackingInfo'
import Shipping from '@components/amazon/fulfillment/fulfillment_page/Shipping'
import TrackingDetails from '@components/amazon/fulfillment/fulfillment_page/TrackingDetails'
import MasterBoxHelp from '@components/amazon/offcanvas/MasterBoxHelp'
import AppContext from '@context/AppContext'
import { GetLabelsResponse, InboundPlan, WaitingReponses } from '@typesTs/amazon/fulfillments/fulfillment'
import axios from 'axios'
import { toast } from 'react-toastify'
import { Badge, Button, Card, CardBody, CardHeader, Col, Container, Nav, NavItem, NavLink, Row, Spinner, TabContent, TabPane } from '@/components/migration-ui'
import useSWR, { useSWRConfig } from 'swr'

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
  const { mutate } = useSWRConfig()
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

  const [activeTab, setActiveTab] = useState('1')
  const tabChange = (tab: any) => {
    if (activeTab !== tab) setActiveTab(tab)
  }

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
        const allComplete = Object.values(data.inboundPlan.steps).every((stepinfo) => stepinfo.complete)
        if (allComplete) {
          setActiveTab(Object.keys(data.inboundPlan.steps).pop()?.toString() || '1')
          return true
        }
        const incompleteStep = Object.entries(data.inboundPlan.steps).find(([_, stepinfo]) => !stepinfo.complete)
        if (incompleteStep) {
          setActiveTab(incompleteStep[0].toString())
        }
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

  const handleNextShipping = async (inboundPlanId: string) => {
    setWatingRepsonse((prev: any) => ({ ...prev, inventoryToSend: true, shipping: true, transportationOptions: true }))

    const generatePlacementOptions = toast.loading('Generating Placement Options...')
    try {
      const controller = new AbortController()
      const signal = controller.signal
      const response = await axios
        .get(`${process.env.NEXT_PUBLIC_SHELFCLOUD_SERVER_URL}/api/amz_workflow/stepShipping/${state.currentRegion}/${state.user.businessId}/${inboundPlanId}`, {
          signal,
          headers: {
            Authorization: `Bearer ${sessionToken}`,
          },
        })
        .then(({ data }) => data)
        .catch(({ error }) => {
          if (axios.isCancel(error)) {
            toast.error('Error generating Placement Options')
          }
        })

      if (!response.error) {
        toast.update(generatePlacementOptions, {
          render: response.message,
          type: 'success',
          isLoading: false,
          autoClose: 3000,
        })
        setWatingRepsonse((prev: any) => ({ ...prev, inventoryToSend: false, shipping: false }))
        await mutate(`/api/amazon/fullfilments/getSellerInboundPlan?region=${state.currentRegion}&businessId=${state.user.businessId}&inboundPlanId=${inboundPlanId}`).then(
          async () => {
            tabChange('3')
            await handleTransportationOptions(inboundPlanId)
          }
        )
      } else {
        setWatingRepsonse((prev: any) => ({ ...prev, inventoryToSend: false, shipping: false }))
        toast.update(generatePlacementOptions, {
          render: response.message,
          type: 'error',
          isLoading: false,
          autoClose: 3000,
        })
      }
    } catch (error) {
      setWatingRepsonse((prev: any) => ({ ...prev, inventoryToSend: false, shipping: false }))
      console.error(error)
    }
  }

  const handlePlacementExpired = async (inboundPlanId: string) => {
    setWatingRepsonse((prev: any) => ({ ...prev, shippingExpired: true, transportationOptions: true }))
    const generatePlacementOptions = toast.loading('Generating Placement Options...')
    try {
      const controller = new AbortController()
      const signal = controller.signal
      const response = await axios
        .get(`${process.env.NEXT_PUBLIC_SHELFCLOUD_SERVER_URL}/api/amz_workflow/stepShipping/${state.currentRegion}/${state.user.businessId}/${inboundPlanId}`, {
          signal,
          headers: {
            Authorization: `Bearer ${sessionToken}`,
          },
        })
        .then(({ data }) => data)
        .catch(({ error }) => {
          if (axios.isCancel(error)) {
            toast.error('Error generating Placement Options')
          }
        })

      if (!response.error) {
        toast.update(generatePlacementOptions, {
          render: response.message,
          type: 'success',
          isLoading: false,
          autoClose: 3000,
        })
        setWatingRepsonse((prev: any) => ({ ...prev, shippingExpired: false }))
        await mutate(`/api/amazon/fullfilments/getSellerInboundPlan?region=${state.currentRegion}&businessId=${state.user.businessId}&inboundPlanId=${inboundPlanId}`).then(
          async () => {
            tabChange('3')
            await handleTransportationOptions(inboundPlanId)
          }
        )
      } else {
        setWatingRepsonse((prev: any) => ({ ...prev, shippingExpired: false }))
        toast.update(generatePlacementOptions, {
          render: response.message,
          type: 'error',
          isLoading: false,
          autoClose: 3000,
        })
      }
    } catch (error) {
      setWatingRepsonse((prev: any) => ({ ...prev, shippingExpired: false }))
      console.error(error)
    }
  }

  const handleTransportationOptions = async (inboundPlanId: string) => {
    // setWatingRepsonse((prev: any) => ({ ...prev, transportationOptions: true }))
    const generateTransportationOptions = toast.loading('Generating Transportation Options...')

    try {
      const controller = new AbortController()
      const signal = controller.signal
      const response = await axios
        .get(`${process.env.NEXT_PUBLIC_SHELFCLOUD_SERVER_URL}/api/amz_workflow/getShipmentsCosts/${state.currentRegion}/${state.user.businessId}/${inboundPlanId}`, {
          signal,
          headers: {
            Authorization: `Bearer ${sessionToken}`,
          },
        })
        .then(({ data }) => data)
        .catch(({ error }) => {
          if (axios.isCancel(error)) {
            toast.error('Error generating Transportation Options')
          }
        })

      if (!response.error) {
        toast.update(generateTransportationOptions, {
          render: response.message,
          type: 'success',
          isLoading: false,
          autoClose: 3000,
        })
        await mutate(`/api/amazon/fullfilments/getSellerInboundPlan?region=${state.currentRegion}&businessId=${state.user.businessId}&inboundPlanId=${inboundPlanId}`).then(() => {
          setWatingRepsonse((prev: any) => ({ ...prev, transportationOptions: false }))
        })
      } else {
        tabChange('1')
        setWatingRepsonse((prev: any) => ({ ...prev, transportationOptions: false }))
        toast.update(generateTransportationOptions, {
          render: response.message,
          type: 'error',
          isLoading: false,
          autoClose: 3000,
        })
      }
    } catch (error) {
      setWatingRepsonse((prev: any) => ({ ...prev, transportationOptions: false }))
      console.error(error)
    }
  }

  const handleNextConfirmChargesFees = async (confirmChargesInfo: string) => {
    setWatingRepsonse((prev: any) => ({ ...prev, boxLabels: true }))
    const cancelInboundPlanToast = toast.loading('Confirming Charges and Fees...')
    try {
      const controller = new AbortController()
      const signal = controller.signal
      const response = await axios
        .post(
          `${process.env.NEXT_PUBLIC_SHELFCLOUD_SERVER_URL}/api/amz_workflow/confirmCharges/${state.currentRegion}/${state.user.businessId}/${inboundPlanId}`,
          confirmChargesInfo,
          {
            signal,
            headers: {
              Authorization: `Bearer ${sessionToken}`,
            },
          }
        )
        .then(({ data }) => data)
        .catch(({ error }) => {
          if (axios.isCancel(error)) {
            toast.error('Error Confirming Charges and Fees')
          }
        })

      if (!response.error) {
        toast.update(cancelInboundPlanToast, {
          render: response.message,
          type: 'success',
          isLoading: false,
          autoClose: 3000,
        })
      } else {
        toast.update(cancelInboundPlanToast, {
          render: response.message,
          type: 'error',
          isLoading: false,
          autoClose: 3000,
        })
      }
      await mutate(`/api/amazon/fullfilments/getSellerInboundPlan?region=${state.currentRegion}&businessId=${state.user.businessId}&inboundPlanId=${inboundPlanId}`)
      setWatingRepsonse((prev: any) => ({ ...prev, boxLabels: false }))
    } catch (error) {
      setWatingRepsonse((prev: any) => ({ ...prev, boxLabels: false }))
    }
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
            <Card className='tw:text-[13px]'>
              {!loading && inboundPlanDetails ? (
                <>
                  <CardHeader>
                    <div className='tw:flex tw:flex-row tw:justify-between tw:items-start'>
                      <Link href={'/amazon-sellers/fulfillments'}>
                        <Button outline>
                          <span className='icon-on'>
                            <i className='ri-arrow-left-line tw:align-bottom tw:me-1' />
                            Fulfillments
                          </span>
                        </Button>
                      </Link>
                      <Button color='info' className='tw:flex tw:items-center' onClick={() => setHelpOffCanvasIsOpen(true)}>
                        <i className='ri-question-line fs-14 tw:p-0 tw:m-0 tw:lg:me-1' />
                        <span className='tw:hidden tw:lg:block'>Need help</span>
                      </Button>
                    </div>
                    <div className='tw:mt-4'>
                      <p className='tw:font-semibold tw:text-[19.5px] tw:m-0 tw:p-0'>
                        <span className='tw:text-[var(--bs-secondary-color)] tw:font-normal'>Name: </span>
                        {inboundPlanDetails.name}
                        <Badge color='info' className='tw:ms-2 tw:text-[13px]'>
                          {inboundPlanDetails.fulfillmentType}
                        </Badge>
                      </p>
                      <p className='tw:font-normal tw:text-[13px] tw:m-0 tw:p-0'>
                        <span className='tw:text-[var(--bs-secondary-color)]'>Inbound ID: </span>
                        {inboundPlanId}
                        <i
                          className='ri-file-copy-line tw:text-[13px] tw:my-0 tw:mx-1 tw:p-0 tw:text-[color:var(--bs-secondary-color)]'
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
                      <Col xs='12' className='tw:gap-2 tw:flex tw:flex-col'>
                        <Nav className='tw:pt-0 nav-tabs-custom tw:rounded-[0.25rem] card-header-tabs tw:border-b-0' role='tablist'>
                          <NavItem style={{ cursor: 'pointer' }}>
                            <NavLink
                              to='#'
                              className={
                                'tw:text-[16.25px] tw:font-semibold ' + (activeTab == '1' ? 'tw:text-primary' : inboundPlanDetails.steps[1].complete ? 'tw:text-success tw:opacity-50' : 'tw:text-[var(--bs-secondary-color)]')
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
                                'tw:text-[16.25px] tw:font-semibold ' + (activeTab == '2' ? 'tw:text-primary' : inboundPlanDetails.steps[2].complete ? 'tw:text-success tw:opacity-50' : 'tw:text-[var(--bs-secondary-color)]')
                              }
                              onClick={() => {
                                inboundPlanDetails?.steps[1]?.complete ? tabChange('2') : document.getElementById('btn_handleNextStepPacking')?.focus()
                              }}>
                              <>
                                <i className='fas fa-home'></i>
                                Packing Info
                              </>
                            </NavLink>
                          </NavItem>
                          <NavItem style={{ cursor: 'pointer' }}>
                            <NavLink
                              className={
                                'tw:text-[16.25px] tw:font-semibold ' + (activeTab == '3' ? 'tw:text-primary' : inboundPlanDetails.steps[3].complete ? 'tw:text-success tw:opacity-50' : 'tw:text-[var(--bs-secondary-color)]')
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
                                'tw:text-[16.25px] tw:font-semibold ' + (activeTab == '4' ? 'tw:text-primary' : inboundPlanDetails.steps[4].complete ? 'tw:text-success tw:opacity-50' : 'tw:text-[var(--bs-secondary-color)]')
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
                                'tw:text-[16.25px] tw:font-semibold ' + (activeTab == '5' ? 'tw:text-primary' : inboundPlanDetails.steps[5].complete ? 'tw:text-success tw:opacity-50' : 'tw:text-[var(--bs-secondary-color)]')
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
                                'tw:text-[16.25px] tw:font-semibold ' + (activeTab == '6' ? 'tw:text-primary' : inboundPlanDetails.steps[6].complete ? 'tw:text-success tw:opacity-50' : 'tw:text-[var(--bs-secondary-color)]')
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
                        <TabContent activeTab={activeTab} className='tw:pt-2 tw:pb-6 tw:border-b'>
                          <TabPane tabId='1'>
                            <InventoryToSend inboundPlan={inboundPlanDetails} watingRepsonse={watingRepsonse} />
                          </TabPane>
                          <TabPane tabId='2'>
                            {inboundPlanDetails.steps[1].complete && (
                              <PackingInfo inboundPlan={inboundPlanDetails} handleNextStep={handleNextShipping} watingRepsonse={watingRepsonse} />
                            )}
                          </TabPane>
                          <TabPane tabId='3'>
                            {inboundPlanDetails.steps[2].complete && (
                              <Shipping
                                sessionToken={sessionToken}
                                inboundPlan={inboundPlanDetails}
                                // setinboundPlanDetails={setinboundPlanDetails}
                                handleNextStep={handleNextConfirmChargesFees}
                                watingRepsonse={watingRepsonse}
                                handlePlacementExpired={handlePlacementExpired}
                              />
                            )}
                          </TabPane>
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
                <div className='tw:w-full tw:px-6 tw:py-6 tw:flex tw:gap-6'>
                  <Spinner color='primary' className='tw:text-[22.75px]' />
                  <p className='tw:text-[22.75px] tw:font-semibold'>Loading...</p>
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
