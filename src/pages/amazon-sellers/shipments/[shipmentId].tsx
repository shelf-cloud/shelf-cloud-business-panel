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
import { toast } from 'react-toastify'
import { Badge, Button, Card, CardBody, CardHeader, Col, Container, Nav, NavItem, NavLink, Row, Spinner, TabContent, TabPane } from '@/components/migration-ui'
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
          <Container fluid>
            <BreadCrumb title='Product Details' pageTitle='Inventory' />
            <Card className='tw:text-[13px]'>
              {!loading && shipmentDetails ? (
                <>
                  <CardHeader className='tw:flex tw:flex-row tw:justify-between tw:items-start'>
                    <div>
                      <Link href={'/amazon-sellers/shipments'}>
                        <Button outline>
                          <span className='icon-on'>
                            <i className='ri-arrow-left-line align-bottom me-1' />
                            FBA Shipments
                          </span>
                        </Button>
                      </Link>
                      <div className='tw:mt-4'>
                        <p className='tw:font-semibold tw:text-[19.5px] tw:m-0 tw:p-0'>
                          <span className='tw:text-[var(--bs-secondary-color)] tw:font-normal'>Name: </span>
                          {shipmentDetails.shipment.name}
                        </p>
                        <div className='tw:my-1 tw:flex tw:flex-row tw:justify-start tw:items-center tw:gap-6'>
                          <p className='tw:font-normal tw:text-[13px] tw:m-0 tw:p-0'>
                            <span className='tw:text-[var(--bs-secondary-color)]'>Shipment ID: </span>
                            {shipmentDetails.shipment.shipmentConfirmationId}
                            <i
                              className='ri-file-copy-line fs-6 my-0 mx-1 p-0 text-muted'
                              style={{ cursor: 'pointer' }}
                              onClick={() => {
                                navigator.clipboard.writeText(`${shipmentDetails.shipment.shipmentConfirmationId}`)
                                toast('Shipment ID copied!')
                              }}
                            />
                          </p>
                          <p className='tw:m-0 tw:p-0 tw:text-[var(--bs-secondary-color)]'>
                            Status:{' '}
                            <Badge color='success' className='tw:text-[13px]'>
                              {CleanStatus(shipmentDetails.shipment.status)}
                            </Badge>
                          </p>
                          <p className='tw:m-0 tw:p-0 tw:text-[var(--bs-secondary-color)]'>
                            Last Updated: <span className='text-black tw:font-semibold'>{moment(shipmentDetails.lastUpdated).format('LL')}</span>
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardBody style={{ minHeight: '60dvh' }}>
                    <Row xs='5' className='tw:mb-4'>
                      <Col xs='12' lg='2'>
                        <p className='tw:m-0 tw:mb-1 tw:font-bold'>Shipment</p>
                        <p className='tw:m-0 tw:p-0 tw:text-[11.2px] tw:font-semibold'>
                          Created: <span className='tw:font-normal'>{moment(shipmentDetails.createdAt).format('LL')}</span>
                        </p>
                        <p className='tw:m-0 tw:p-0 tw:text-[11.2px] tw:font-semibold'>
                          ID: <span className='tw:font-normal'>{shipmentDetails.shipment.shipmentConfirmationId}</span>
                        </p>
                      </Col>
                      <Col xs='12' lg='2'>
                        <p className='tw:m-0 tw:mb-1 tw:font-bold'>Ship From</p>
                        <p className='tw:m-0 tw:p-0 tw:text-[11.2px]'>{`${shipmentDetails.shipment.source.address.name} ${shipmentDetails.shipment.source.address.addressLine1} ${shipmentDetails.shipment.source.address.city} ${shipmentDetails.shipment.source.address.stateOrProvinceCode} ${shipmentDetails.shipment.source.address.postalCode} ${shipmentDetails.shipment.source.address.countryCode} ${shipmentDetails.shipment.source.address.phoneNumber}`}</p>
                      </Col>
                      <Col xs='12' lg='2'>
                        <p className='tw:m-0 tw:mb-1 tw:font-bold'>Ship To</p>
                        <p className='tw:m-0 tw:p-0 tw:text-[11.2px]'>{`${shipmentDetails.shipment.destination.warehouseId} - ${shipmentDetails.shipment.destination.address.name} ${shipmentDetails.shipment.destination.address.addressLine1} ${shipmentDetails.shipment.destination.address.city} ${shipmentDetails.shipment.destination.address.stateOrProvinceCode} ${shipmentDetails.shipment.destination.address.postalCode} ${shipmentDetails.shipment.destination.address.countryCode}`}</p>
                      </Col>
                      <Col xs='12' lg='1'>
                        <p className='tw:m-0 tw:mb-1 tw:font-bold'>Contents</p>
                        <p className='tw:m-0 tw:p-0'>{shipmentDetails.shipmentItems.items.length} MSKUs</p>
                        <p className='tw:m-0 tw:p-0'>{shipmentDetails.shipmentItems.items.reduce((total, item) => total + item.quantity, 0)} Units</p>
                      </Col>
                      <Col xs='12' lg='3'>
                        <p className='tw:m-0 tw:mb-1 tw:font-bold'>Fees (estimated)</p>
                        <p className='tw:m-0 tw:p-0 tw:text-[11.2px] tw:font-semibold'>
                          FBA manual processing fee: <span className='tw:font-normal'>{FormatCurrency(state.currentRegion, shipmentDetails.totalPrepFees)}</span>
                        </p>
                        <p className='tw:m-0 tw:p-0 tw:text-[11.2px] tw:font-semibold'>
                          Total inbound placement service fees: <span className='tw:font-normal'>{FormatCurrency(state.currentRegion, shipmentDetails.totalPlacementFees)}</span>
                        </p>
                        <p className='tw:m-0 tw:p-0 tw:text-[11.2px] tw:font-semibold'>
                          Amazon partnered carrier cost:{' '}
                          <span className='tw:font-normal'>{FormatCurrency(state.currentRegion, shipmentDetails.totalSpdFees + shipmentDetails.totalLtlFees)}</span>
                        </p>
                      </Col>
                    </Row>
                    <Row>
                      <Col xs='12' className='tw:gap-2 tw:flex tw:flex-col'>
                        <Nav className='tw:pt-0 rounded card-header-tabs tw:border-b-0' role='tablist'>
                          <NavItem style={{ cursor: 'pointer' }}>
                            <NavLink to='#' className={'tw:text-[16.25px] tw:font-semibold ' + (activeTab == '1' ? 'tw:text-primary' : 'tw:text-[var(--bs-secondary-color)]')} onClick={() => tabChange('1')} type='button'>
                              <>
                                <i className='far fa-user'></i>
                                Track Shipment
                              </>
                            </NavLink>
                          </NavItem>
                          {shipmentDetails.shipment.trackingDetails?.ltlTrackingDetail.billOfLadingNumber && (
                            <NavItem style={{ cursor: 'pointer' }}>
                              <NavLink className={'tw:text-[16.25px] tw:font-semibold ' + (activeTab == '2' ? 'tw:text-primary' : 'tw:text-[var(--bs-secondary-color)]')} onClick={() => tabChange('2')}>
                                <>
                                  <i className='fas fa-home'></i>
                                  Pallets
                                </>
                              </NavLink>
                            </NavItem>
                          )}
                          <NavItem style={{ cursor: 'pointer' }}>
                            <NavLink className={'tw:text-[16.25px] tw:font-semibold ' + (activeTab == '3' ? 'tw:text-primary' : 'tw:text-[var(--bs-secondary-color)]')} onClick={() => tabChange('3')}>
                              <>
                                <i className='fas fa-home'></i>
                                Contents
                              </>
                            </NavLink>
                          </NavItem>
                          <NavItem style={{ cursor: 'pointer' }}>
                            <NavLink to='#' className={'tw:text-[16.25px] tw:font-semibold ' + (activeTab == '4' ? 'tw:text-primary' : 'tw:text-[var(--bs-secondary-color)]')} onClick={() => tabChange('4')} type='button'>
                              <>
                                <i className='far fa-user'></i>
                                Problems
                              </>
                            </NavLink>
                          </NavItem>
                        </Nav>
                        <TabContent activeTab={activeTab} className='tw:pt-2 tw:pb-6'>
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
                      </Col>
                    </Row>
                  </CardBody>
                </>
              ) : (
                <div className='tw:w-full tw:px-6 tw:py-6 tw:flex tw:gap-6'>
                  <Spinner color='primary' className='tw:text-[19.5px]' />
                  <p className='tw:text-[22.75px] tw:font-semibold'>Loading...</p>
                </div>
              )}
            </Card>
          </Container>
        </div>
      </React.Fragment>
    </div>
  )
}

export default FBAShipmentDetails
