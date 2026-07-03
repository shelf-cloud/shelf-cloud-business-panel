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
import { toast } from '@/lib/toast'
import { Badge } from '@shadcn/ui/badge'
import { Button } from '@shadcn/ui/button'
import { Card, CardContent, CardHeader } from '@shadcn/ui/card'
import { Spinner } from '@shadcn/ui/spinner'
import { Nav, NavItem, NavLink, TabContent, TabPane } from '@/components/ui/nav-tabs'
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

  const handleNextPackingStep = async (inboundPlanId: string) => {
    setWatingRepsonse((prev: any) => ({ ...prev, inventoryToSend: true }))

    const generatePackingOptions = toast.loading('Generating Packing Options...')
    try {
      const controller = new AbortController()
      const signal = controller.signal
      const response = await axios
        .get(`${process.env.NEXT_PUBLIC_SHELFCLOUD_SERVER_URL}/api/amz_workflow/packingStep/${state.currentRegion}/${state.user.businessId}/${inboundPlanId}`, {
          signal,
          headers: {
            Authorization: `Bearer ${sessionToken}`,
          },
        })
        .then(({ data }) => data)
        .catch(({ error }) => {
          if (axios.isCancel(error)) {
            toast.error('Error generating Packing Options')
          }
        })

      if (!response.error) {
        toast.update(generatePackingOptions, {
          render: response.message,
          type: 'success',
          isLoading: false,
          autoClose: 3000,
        })
        setWatingRepsonse((prev: any) => ({ ...prev, inventoryToSend: false }))
        await mutate(`/api/amazon/fullfilments/getSellerInboundPlan?region=${state.currentRegion}&businessId=${state.user.businessId}&inboundPlanId=${inboundPlanId}`).then(() => {
          tabChange('2')
        })
      } else {
        setWatingRepsonse((prev: any) => ({ ...prev, inventoryToSend: false }))
        toast.update(generatePackingOptions, {
          render: response.message,
          type: 'error',
          isLoading: false,
          autoClose: 3000,
        })
      }
    } catch (error) {
      setWatingRepsonse((prev: any) => ({ ...prev, inventoryToSend: false }))
      toast.update(generatePackingOptions, {
        render: 'Error generating Packing Options',
        type: 'error',
        isLoading: false,
        autoClose: 3000,
      })
      console.error(error)
    }
  }

  const handleNextShipping = async (inboundPlanId: string) => {
    setWatingRepsonse((prev: any) => ({ ...prev, shipping: true, transportationOptions: true }))

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
        setWatingRepsonse((prev: any) => ({ ...prev, shipping: false }))
        await mutate(`/api/amazon/fullfilments/getSellerInboundPlan?region=${state.currentRegion}&businessId=${state.user.businessId}&inboundPlanId=${inboundPlanId}`).then(
          async () => {
            tabChange('3')
            await handleTransportationOptions(inboundPlanId)
          }
        )
      } else {
        setWatingRepsonse((prev: any) => ({ ...prev, shipping: false }))
        toast.update(generatePlacementOptions, {
          render: response.message,
          type: 'error',
          isLoading: false,
          autoClose: 3000,
        })
      }
    } catch (error) {
      setWatingRepsonse((prev: any) => ({ ...prev, shipping: false }))
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
        tabChange('2')
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
          <div className='mx-auto w-full px-3'>
            <BreadCrumb title='Fulfillment Workdflow' pageTitle='Send to Amazon' />
            <Card className='text-[13px]'>
              {!loading && inboundPlanDetails ? (
                <>
                  <CardHeader>
                    <div className='flex flex-row justify-between items-start'>
                      <Link href={'/amazon-sellers/fulfillments'}>
                        <Button outline>
                          <span className='icon-on'>
                            <i className='ri-arrow-left-line align-bottom me-1' />
                            Fulfillments
                          </span>
                        </Button>
                      </Link>
                      <Button variant='info' className='flex items-center' onClick={() => setHelpOffCanvasIsOpen(true)}>
                        <i className='ri-question-line fs-14 p-0 m-0 lg:me-1' />
                        <span className='hidden lg:block'>Need help</span>
                      </Button>
                    </div>
                    <div className='mt-4'>
                      <p className='font-semibold text-[19.5px] m-0 p-0'>
                        <span className='text-muted-foreground font-normal'>Name: </span>
                        {inboundPlanDetails.name}
                        <Badge variant='info' className='ms-2 text-[13px] rounded-sm'>
                          {inboundPlanDetails.fulfillmentType}
                        </Badge>
                      </p>
                      <p className='font-normal text-[13px] m-0 p-0'>
                        <span className='text-muted-foreground'>Inbound ID: </span>
                        {inboundPlanId}
                        <i
                          className='ri-file-copy-line text-[13px] my-0 mx-1 p-0 text-muted-foreground'
                          style={{ cursor: 'pointer' }}
                          onClick={() => {
                            navigator.clipboard.writeText(`${inboundPlanId}`)
                            toast('Inbound ID copied!')
                          }}
                        />
                      </p>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className='flex flex-wrap -mx-3'>
                      <div className='px-3 sm:w-full gap-2 flex flex-col'>
                        <Nav className='pt-0 nav-tabs-custom rounded-[0.25rem] card-header-tabs border-b-0' role='tablist'>
                          <NavItem style={{ cursor: 'pointer' }}>
                            <NavLink
                              to='#'
                              className={
                                'text-[16.25px] font-semibold ' + (activeTab == '1' ? 'text-primary' : inboundPlanDetails.steps[1].complete ? 'text-success opacity-50' : 'text-muted-foreground')
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
                                'text-[16.25px] font-semibold ' + (activeTab == '2' ? 'text-primary' : inboundPlanDetails.steps[2].complete ? 'text-success opacity-50' : 'text-muted-foreground')
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
                                'text-[16.25px] font-semibold ' + (activeTab == '3' ? 'text-primary' : inboundPlanDetails.steps[3].complete ? 'text-success opacity-50' : 'text-muted-foreground')
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
                                'text-[16.25px] font-semibold ' + (activeTab == '4' ? 'text-primary' : inboundPlanDetails.steps[4].complete ? 'text-success opacity-50' : 'text-muted-foreground')
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
                                'text-[16.25px] font-semibold ' + (activeTab == '5' ? 'text-primary' : inboundPlanDetails.steps[5].complete ? 'text-success opacity-50' : 'text-muted-foreground')
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
                                'text-[16.25px] font-semibold ' + (activeTab == '6' ? 'text-primary' : inboundPlanDetails.steps[6].complete ? 'text-success opacity-50' : 'text-muted-foreground')
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
                        <TabContent activeTab={activeTab} className='pt-2 pb-6 border-b'>
                          <TabPane tabId='1'>
                            <InventoryToSend inboundPlan={inboundPlanDetails} handleNextStep={handleNextPackingStep} watingRepsonse={watingRepsonse} />
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
                      </div>
                    </div>
                  </CardContent>
                </>
              ) : (
                <div className='w-full px-6 py-6 flex gap-6'>
                  <Spinner className='size-6 text-primary text-[22.75px]' />
                  <p className='text-[22.75px] font-semibold'>Loading...</p>
                </div>
              )}
            </Card>
          </div>
        </div>
      </React.Fragment>
      <MasterBoxHelp isOpen={helpOffCanvasIsOpen} setHelpOffCanvasIsOpen={setHelpOffCanvasIsOpen} />
    </div>
  )
}

export default InboundPlanDetails
