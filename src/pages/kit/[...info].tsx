import { GetServerSideProps } from 'next'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import React, { useContext, useState } from 'react'

import { getSession } from '@auth/client'
import BreadCrumb from '@components/Common/BreadCrumb'
import Activity_Kit_Details from '@components/kit_page/Activity_Kit_Details'
import Children_Kit_Details from '@components/kit_page/Children_Kit_Details'
import General_Kit_Details from '@components/kit_page/General_Kit_Details'
import Identifiers_Kit_Details from '@components/kit_page/Identifiers_Kit_Details'
import Inventory_Kit_Details from '@components/kit_page/Inventory_Kit_Details'
import KitWidgets from '@components/kit_page/KitWidgets'
import Listings_Kit_Details from '@components/kit_page/Listings_Kit_Details'
import Measure_Kit_Details from '@components/kit_page/Measure_Kit_Details'
import SKU_Kit_details from '@components/kit_page/SKU_Kit_details'
import Status_Kit_Details from '@components/kit_page/Status_Kit_Details'
import ShipmentDetailsModal from '@components/modals/shipments/ShipmentDetailsModal'
import CopyTextToClipboard from '@components/ui/CopyTextToClipboard'
import AppContext from '@context/AppContext'
import { ProductDetails } from '@typings'
import axios from 'axios'
import { Button, Card, CardBody, CardHeader, Col, Container, Nav, NavItem, NavLink, Row, Spinner, TabContent, TabPane } from 'reactstrap'
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
    }
  }
}

const fetcher = async (endPoint: string) => await axios<ProductDetails>(endPoint).then((res) => res.data)

const Kit_Page_Layout = ({}: Props) => {
  const router = useRouter()
  const { state }: any = useContext(AppContext)
  const { currentRegion, user, shipmentDetailModal } = state
  const { info } = router.query
  const [activeTab, setActiveTab] = useState('1')

  const { data: productDetails, isValidating: isLoading } = useSWR(
    info![0] && user.businessId ? `/api/getKitPageDetails?region=${currentRegion}&inventoryId=${info![0]}&businessId=${user.businessId}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnMount: true,
    }
  )

  const tabChange = (tab: any) => {
    if (activeTab !== tab) setActiveTab(tab)
  }

  const title = `Product | ${info![1]}`
  return (
    <div>
      <Head>
        <title>{title}</title>
      </Head>
      <React.Fragment>
        <div className='page-content'>
          <Container fluid>
            <BreadCrumb title='Product Details' pageTitle='Inventory' />
            <Card className='fs-6'>
              {!isLoading ? (
                <>
                  <CardHeader className='d-flex flex-row justify-content-between align-items-start'>
                    <div>
                      <Link href={'/Kits'}>
                        <Button
                          color='primary'
                          outline
                          // className="d-flex flex-row gap-1 text-decoration-none text-primary"
                          style={{ cursor: 'pointer' }}>
                          <span className='icon-on'>
                            <i className='ri-arrow-left-line align-bottom me-1' />
                            Kits
                          </span>
                        </Button>
                      </Link>
                      <div className='mt-3'>
                        <div className='fw-semibold fs-3'>
                          <span className='text-muted fw-normal'>SKU:</span> {info![1]} <CopyTextToClipboard text={info![1]} label='SKU' fontSize='fs-4' />
                        </div>
                      </div>
                    </div>
                    <KitWidgets
                      onhand={productDetails?.onhand ?? 0}
                      currentStorageBalance={productDetails?.currentStorageBalance ?? 0}
                      binsUsed={productDetails?.binsUsed ?? 0}
                      inventoryValue={productDetails?.inventoryValue ?? 0}
                    />
                  </CardHeader>
                  <CardBody>
                    <Row>
                      <Col className='gap-2 d-flex flex-column'>
                        <General_Kit_Details
                          inventoryId={productDetails?.inventoryId}
                          sku={productDetails?.sku}
                          image={productDetails?.image}
                          title={productDetails?.title}
                          description={productDetails?.description}
                          brand={productDetails?.brand}
                          category={productDetails?.category}
                          supplier={productDetails?.supplier}
                          itemCondition={productDetails?.itemCondition}
                          note={productDetails?.note}
                          brands={productDetails?.brands ?? []}
                          categories={productDetails?.categories ?? []}
                          suppliers={productDetails?.suppliers ?? []}
                        />
                        <Nav className='pt-2 nav-tabs-custom rounded card-header-tabs border-bottom-0' role='tablist'>
                          <NavItem style={{ cursor: 'pointer' }}>
                            <NavLink
                              to='#'
                              className={'fs-4 fw-semibold ' + (activeTab == '1' ? 'text-primary' : 'text-muted')}
                              onClick={() => {
                                tabChange('1')
                              }}
                              type='button'>
                              <>
                                <i className='far fa-user'></i>
                                Kit Children
                              </>
                            </NavLink>
                          </NavItem>
                          <NavItem style={{ cursor: 'pointer' }}>
                            <NavLink
                              className={'fs-4 fw-semibold ' + (activeTab == '2' ? 'text-primary' : 'text-muted')}
                              onClick={() => {
                                tabChange('2')
                              }}>
                              <>
                                <i className='fas fa-home'></i>
                                SKU Details
                              </>
                            </NavLink>
                          </NavItem>
                          <NavItem style={{ cursor: 'pointer' }}>
                            <NavLink
                              to='#'
                              className={'fs-4 fw-semibold ' + (activeTab == '3' ? 'text-primary' : 'text-muted')}
                              onClick={() => {
                                tabChange('3')
                              }}
                              type='button'>
                              <>
                                <i className='far fa-user'></i>
                                Units of Measure
                              </>
                            </NavLink>
                          </NavItem>
                          <NavItem style={{ cursor: 'pointer' }}>
                            <NavLink
                              to='#'
                              className={'fs-4 fw-semibold ' + (activeTab == '4' ? 'text-primary' : 'text-muted')}
                              onClick={() => {
                                tabChange('4')
                              }}
                              type='button'>
                              <>
                                <i className='far fa-user'></i>
                                Identifiers
                              </>
                            </NavLink>
                          </NavItem>
                          <NavItem style={{ cursor: 'pointer' }}>
                            <NavLink
                              to='#'
                              className={'fs-4 fw-semibold ' + (activeTab == '5' ? 'text-primary' : 'text-muted')}
                              onClick={() => {
                                tabChange('5')
                              }}
                              type='button'>
                              <>
                                <i className='far fa-user'></i>
                                Listings
                              </>
                            </NavLink>
                          </NavItem>
                        </Nav>
                        <TabContent activeTab={activeTab} className='pt-2 pb-4 border-bottom'>
                          <TabPane tabId='1'>
                            <Children_Kit_Details kitChildren={productDetails?.children ?? []} />
                          </TabPane>
                          <TabPane tabId='2'>
                            <SKU_Kit_details
                              inventoryId={productDetails?.inventoryId}
                              sku={productDetails?.sku}
                              upc={productDetails?.barcode}
                              defaultPrice={productDetails?.defaultPrice ?? 0}
                              msrp={productDetails?.msrp ?? 0}
                              map={productDetails?.map ?? 0}
                              floor={productDetails?.floor ?? 0}
                              ceilling={productDetails?.ceilling ?? 0}
                            />
                          </TabPane>
                          <TabPane tabId='3'>
                            <Measure_Kit_Details
                              weight={productDetails?.weight ?? 0}
                              length={productDetails?.length ?? 0}
                              width={productDetails?.width ?? 0}
                              height={productDetails?.height ?? 0}
                              boxQty={productDetails?.boxQty ?? 0}
                              boxWeight={productDetails?.boxWeight ?? 0}
                              boxLength={productDetails?.boxLength ?? 0}
                              boxWidth={productDetails?.boxWidth ?? 0}
                              boxHeight={productDetails?.boxHeight ?? 0}
                            />
                          </TabPane>

                          <TabPane tabId='4'>
                            <Identifiers_Kit_Details
                              inventoryId={productDetails?.inventoryId}
                              sku={productDetails?.sku}
                              upc={productDetails?.barcode}
                              asin={productDetails?.asin}
                              fnsku={productDetails?.fnsku}
                              identifiers={productDetails?.identifiers ?? []}
                            />
                          </TabPane>
                          <TabPane tabId='5'>
                            <Listings_Kit_Details listings={productDetails?.listings ?? []} />
                          </TabPane>
                        </TabContent>
                        <Inventory_Kit_Details
                          inventoryId={productDetails?.inventoryId}
                          sku={productDetails?.sku}
                          onhand={productDetails?.onhand ?? 0}
                          buffer={productDetails?.buffer ?? 0}
                          available={productDetails?.available ?? 0}
                          reserved={productDetails?.reserved ?? 0}
                          receiving={productDetails?.receiving ?? 0}
                          ordered={productDetails?.ordered ?? 0}
                          amazonFBA={productDetails?.amazonFBA ?? []}
                        />
                      </Col>
                      <Col xs='3' className='gap-4 d-flex flex-column'>
                        <Status_Kit_Details
                          active={productDetails?.activeState ?? true}
                          isKit={productDetails?.isKit ? true : false}
                          inStock={productDetails?.onhand! > 0 ? true : false}
                        />
                        <Activity_Kit_Details latestOrders={productDetails?.latestOrders ?? []} />
                      </Col>
                    </Row>
                  </CardBody>
                </>
              ) : (
                <div className='w-100 h-100 px-4 py-4 d-flex justify-content-center align-items-center'>
                  <div className='fs-4 fw-normal my-4 d-flex justify-content-center align-items-center gap-3'>
                    <Spinner color='primary' size={'md'} /> Loading kit details...
                  </div>
                </div>
              )}
            </Card>
          </Container>
        </div>
      </React.Fragment>
      {shipmentDetailModal.show && <ShipmentDetailsModal />}
    </div>
  )
}

export default Kit_Page_Layout
