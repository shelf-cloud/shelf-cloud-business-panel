import { GetServerSideProps } from 'next'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import React, { useContext, useState } from 'react'

import { getSession } from '@auth/client'
import BreadCrumb from '@components/Common/BreadCrumb'
import Contents from '@components/amazon/shipments/shipment_page/Contents'
import Pallets from '@components/amazon/shipments/shipment_page/Pallets'
import TrackShipment from '@components/amazon/shipments/shipment_page/TrackShipment'
import TrackingEvents from '@components/amazon/shipments/shipment_page/TrackingEvents'
import AppContext from '@context/AppContext'
import { FormatCurrency } from '@lib/FormatNumbers'
import { CleanStatus } from '@lib/SkuFormatting'
import { FBAShipment, FBAShipmentsDetailsRepsonse } from '@typesTs/amazon/fbaShipments.interface'
import { GetLabelsResponse, WaitingReponses } from '@typesTs/amazon/fulfillments/fulfillment'
import axios from 'axios'
import moment from 'moment'
import { toast } from '@/lib/toast'
import { Badge } from '@shadcn/ui/badge'
import { Button } from '@shadcn/ui/button'
import { Card, CardContent, CardHeader } from '@shadcn/ui/card'
import { Spinner } from '@shadcn/ui/spinner'

import { Nav, NavItem, NavLink, TabContent, TabPane } from '@/components/ui/nav-tabs'
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

const FBAShipmentDetails = ({ session, sessionToken }: Props) => {
  const router = useRouter()
  const { shipmentId } = router.query
  const { state }: any = useContext(AppContext)
  const [shipmentDetails, setshipmentDetails] = useState<FBAShipment | null>()
  const [loading, setloading] = useState(true)
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
  const title = `Shipment Summary | ${session?.user?.businessName}`

  const controller = new AbortController()
  const signal = controller.signal
  const fetcher = (endPoint: string) => {
    !shipmentDetails && setloading(true)
    axios(endPoint, {
      signal,
    })
      .then(({ data }: { data: FBAShipmentsDetailsRepsonse }) => {
        setshipmentDetails(data.shipment)
        setloading(false)
      })
      .catch(({ error }) => {
        if (axios.isCancel(error)) {
          toast.error('Error fetching shipment data')
          setshipmentDetails(null)
          setloading(false)
        }
      })
  }
  useSWR(
    session && state.user.businessId
      ? `/api/amazon/shipments/getFBAShipmentDetails?region=${state.currentRegion}&businessId=${state.user.businessId}&shipmentId=${shipmentId}`
      : null,
    fetcher,
    {
      revalidateOnFocus: false,
    }
  )

  const [activeTab, setActiveTab] = useState('1')
  const tabChange = (tab: any) => {
    if (activeTab !== tab) setActiveTab(tab)
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
            <BreadCrumb title='Product Details' pageTitle='Inventory' />
            <Card className='text-[13px]'>
              {!loading && shipmentDetails ? (
                <>
                  <CardHeader className='flex flex-row justify-between items-start'>
                    <div>
                      <Link href={'/amazon-sellers/shipments'}>
                        <Button outline>
                          <span className='icon-on'>
                            <i className='ri-arrow-left-line align-bottom me-1' />
                            FBA Shipments
                          </span>
                        </Button>
                      </Link>
                      <div className='mt-4'>
                        <p className='font-semibold text-[19.5px] m-0 p-0'>
                          <span className='text-muted-foreground font-normal'>Name: </span>
                          {shipmentDetails.shipment.name}
                        </p>
                        <div className='my-1 flex flex-row justify-start items-center gap-6'>
                          <p className='font-normal text-[13px] m-0 p-0'>
                            <span className='text-muted-foreground'>Shipment ID: </span>
                            {shipmentDetails.shipment.shipmentConfirmationId}
                            <i
                              className='ri-file-copy-line text-[13px] my-0 mx-1 p-0 text-muted-foreground'
                              style={{ cursor: 'pointer' }}
                              onClick={() => {
                                navigator.clipboard.writeText(`${shipmentDetails.shipment.shipmentConfirmationId}`)
                                toast('Shipment ID copied!')
                              }}
                            />
                          </p>
                          <p className='m-0 p-0 text-muted-foreground'>
                            Status:{' '}
                            <Badge variant='success' className='text-[13px]'>
                              {CleanStatus(shipmentDetails.shipment.status)}
                            </Badge>
                          </p>
                          <p className='m-0 p-0 text-muted-foreground'>
                            Last Updated: <span className='text-black font-semibold'>{moment(shipmentDetails.lastUpdated).format('LL')}</span>
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent style={{ minHeight: '60dvh' }}>
                    <div className='flex flex-wrap -mx-3 mb-4'>
                      <div className='px-3 w-full lg:w-1/6'>
                        <p className='m-0 mb-1 font-bold'>Shipment</p>
                        <p className='m-0 p-0 text-[11.2px] font-semibold'>
                          Created: <span className='font-normal'>{moment(shipmentDetails.createdAt).format('LL')}</span>
                        </p>
                        <p className='m-0 p-0 text-[11.2px] font-semibold'>
                          ID: <span className='font-normal'>{shipmentDetails.shipment.shipmentConfirmationId}</span>
                        </p>
                      </div>
                      <div className='px-3 w-full lg:w-1/6'>
                        <p className='m-0 mb-1 font-bold'>Ship From</p>
                        <p className='m-0 p-0 text-[11.2px]'>{`${shipmentDetails.shipment.source.address.name} ${shipmentDetails.shipment.source.address.addressLine1} ${shipmentDetails.shipment.source.address.city} ${shipmentDetails.shipment.source.address.stateOrProvinceCode} ${shipmentDetails.shipment.source.address.postalCode} ${shipmentDetails.shipment.source.address.countryCode} ${shipmentDetails.shipment.source.address.phoneNumber}`}</p>
                      </div>
                      <div className='px-3 w-full lg:w-1/6'>
                        <p className='m-0 mb-1 font-bold'>Ship To</p>
                        <p className='m-0 p-0 text-[11.2px]'>{`${shipmentDetails.shipment.destination.warehouseId} - ${shipmentDetails.shipment.destination.address.name} ${shipmentDetails.shipment.destination.address.addressLine1} ${shipmentDetails.shipment.destination.address.city} ${shipmentDetails.shipment.destination.address.stateOrProvinceCode} ${shipmentDetails.shipment.destination.address.postalCode} ${shipmentDetails.shipment.destination.address.countryCode}`}</p>
                      </div>
                      <div className='px-3 w-full lg:w-1/12'>
                        <p className='m-0 mb-1 font-bold'>Contents</p>
                        <p className='m-0 p-0'>{shipmentDetails.shipmentItems.items.length} MSKUs</p>
                        <p className='m-0 p-0'>{shipmentDetails.shipmentItems.items.reduce((total, item) => total + item.quantity, 0)} Units</p>
                      </div>
                      <div className='px-3 w-full lg:w-1/4'>
                        <p className='m-0 mb-1 font-bold'>Fees (estimated)</p>
                        <p className='m-0 p-0 text-[11.2px] font-semibold'>
                          FBA manual processing fee: <span className='font-normal'>{FormatCurrency(state.currentRegion, shipmentDetails.totalPrepFees)}</span>
                        </p>
                        <p className='m-0 p-0 text-[11.2px] font-semibold'>
                          Total inbound placement service fees: <span className='font-normal'>{FormatCurrency(state.currentRegion, shipmentDetails.totalPlacementFees)}</span>
                        </p>
                        <p className='m-0 p-0 text-[11.2px] font-semibold'>
                          Amazon partnered carrier cost:{' '}
                          <span className='font-normal'>{FormatCurrency(state.currentRegion, shipmentDetails.totalSpdFees + shipmentDetails.totalLtlFees)}</span>
                        </p>
                      </div>
                    </div>
                    <div className='flex flex-wrap -mx-3'>
                      <div className='px-3 w-full gap-2 flex flex-col'>
                        <Nav className='pt-0 rounded-[0.25rem] card-header-tabs border-b-0' role='tablist'>
                          <NavItem style={{ cursor: 'pointer' }}>
                            <NavLink to='#' className={'text-[16.25px] font-semibold ' + (activeTab == '1' ? 'text-primary' : 'text-muted-foreground')} onClick={() => tabChange('1')} type='button'>
                              <>
                                <i className='far fa-user'></i>
                                Track Shipment
                              </>
                            </NavLink>
                          </NavItem>
                          {shipmentDetails.shipment.trackingDetails?.ltlTrackingDetail.billOfLadingNumber && (
                            <NavItem style={{ cursor: 'pointer' }}>
                              <NavLink className={'text-[16.25px] font-semibold ' + (activeTab == '2' ? 'text-primary' : 'text-muted-foreground')} onClick={() => tabChange('2')}>
                                <>
                                  <i className='fas fa-home'></i>
                                  Pallets
                                </>
                              </NavLink>
                            </NavItem>
                          )}
                          <NavItem style={{ cursor: 'pointer' }}>
                            <NavLink className={'text-[16.25px] font-semibold ' + (activeTab == '3' ? 'text-primary' : 'text-muted-foreground')} onClick={() => tabChange('3')}>
                              <>
                                <i className='fas fa-home'></i>
                                Contents
                              </>
                            </NavLink>
                          </NavItem>
                          <NavItem style={{ cursor: 'pointer' }}>
                            <NavLink to='#' className={'text-[16.25px] font-semibold ' + (activeTab == '4' ? 'text-primary' : 'text-muted-foreground')} onClick={() => tabChange('4')} type='button'>
                              <>
                                <i className='far fa-user'></i>
                                Problems
                              </>
                            </NavLink>
                          </NavItem>
                        </Nav>
                        <TabContent activeTab={activeTab} className='pt-2 pb-6'>
                          <TabPane tabId='1'>
                            {shipmentDetails.shippingMode === 'LTL' ? (
                              <TrackingEvents shipmentDetails={shipmentDetails} handlePrintShipmentBillOfLading={handlePrintShipmentBillOfLading} watingRepsonse={watingRepsonse} />
                            ) : (
                              <TrackShipment shipmentDetails={shipmentDetails} />
                            )}
                          </TabPane>
                          {shipmentDetails.shipment.trackingDetails?.ltlTrackingDetail.billOfLadingNumber && (
                            <TabPane tabId='2'>
                              <Pallets shipmentDetails={shipmentDetails} handlePrintShipmentBillOfLading={handlePrintShipmentBillOfLading} watingRepsonse={watingRepsonse} />
                            </TabPane>
                          )}
                          <TabPane tabId='3'>
                            <Contents shipmentDetails={shipmentDetails} />
                          </TabPane>
                          <TabPane tabId='4'></TabPane>
                        </TabContent>
                      </div>
                    </div>
                  </CardContent>
                </>
              ) : (
                <div className='w-full px-6 py-6 flex gap-6'>
                  <Spinner className='size-6 text-primary text-[19.5px]' />
                  <p className='text-[22.75px] font-semibold'>Loading...</p>
                </div>
              )}
            </Card>
          </div>
        </div>
      </React.Fragment>
    </div>
  )
}

export default FBAShipmentDetails
