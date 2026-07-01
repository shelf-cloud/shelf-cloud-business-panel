import { GetServerSideProps } from 'next'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import React, { useContext, useState } from 'react'

import { getSession } from '@auth/client'
import BreadCrumb from '@components/Common/BreadCrumb'
import ShipmentDetailsModal from '@components/modals/shipments/ShipmentDetailsModal'
import Activity_Product_Details from '@components/product_page/Activity_Product_Details'
import Bins_Product_Details from '@components/product_page/Bins_Product_Details'
import General_Product_Details from '@components/product_page/General_Product_Details'
import Identifiers_Product_Details from '@components/product_page/Identifiers_Product_Details'
import Inventory_Product_Details from '@components/product_page/Inventory_Product_Details'
import Listings_Product_Details from '@components/product_page/Listings_Product_Details'
import Measure_Product_Details from '@components/product_page/Measure_Product_Details'
import ProductWidgets from '@components/product_page/ProductWidgets'
import SKU_product_details from '@components/product_page/SKU_product_details'
import Status_Product_Details from '@components/product_page/Status_Product_Details'
import Supplier_Product_Details from '@components/product_page/Supplier_Product_Details'
import CopyTextToClipboard from '@components/ui/CopyTextToClipboard'
import AppContext from '@context/AppContext'
import { ProductDetails } from '@typings'
import axios from 'axios'
import { Button, Card, CardBody, CardHeader, Col, Container, Nav, NavItem, NavLink, Row, Spinner, TabContent, TabPane } from '@/components/migration-ui'
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

const Product_Page_Layout = ({}: Props) => {
  const router = useRouter()
  const { state } = useContext(AppContext)
  const { currentRegion, user, shipmentDetailModal } = state
  const { info } = router.query
  const [activeTab, setActiveTab] = useState('1')
  const [isLoading, setisLoading] = useState(true)

  const { data: productDetails } = useSWR(
    info![0] && user.businessId ? `/api/products/getProductPageDetails?region=${currentRegion}&inventoryId=${info![0]}&businessId=${user.businessId}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnMount: true,
      onSuccess: () => setisLoading(false),
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
            <Card className='tw:text-[13px]'>
              {!isLoading ? (
                <>
                  <CardHeader className='tw:flex tw:flex-col tw:justify-between tw:items-start tw:lg:flex-row'>
                    <div>
                      <Link href={'/Products?brand=All&supplier=All&category=All&condition=All&status=All'}>
                        <Button color='primary' outline style={{ cursor: 'pointer' }}>
                          <span className='icon-on tw:text-[11.2px]'>
                            <i className='ri-arrow-left-line tw:align-bottom tw:me-1' />
                            Products
                          </span>
                        </Button>
                      </Link>
                      <div className='tw:mt-3'>
                        <div className='tw:font-semibold tw:text-[22.75px]'>
                          <span className='tw:text-[color:var(--bs-secondary-color)] tw:text-[19.5px]'>SKU:</span> {info![1]} <CopyTextToClipboard text={info![1]} label='SKU' fontSize='fs-4' />
                        </div>
                      </div>
                    </div>
                    <ProductWidgets
                      onhand={productDetails?.onhand ?? 0}
                      currentStorageBalance={productDetails?.currentStorageBalance ?? 0}
                      binsUsed={productDetails?.binsUsed ?? 0}
                      inventoryValue={productDetails?.inventoryValue ?? 0}
                    />
                  </CardHeader>
                  <CardBody>
                    <Row>
                      <Col xs='12' md='12' lg='9' className='tw:gap-2 tw:flex tw:flex-col tw:overflow-auto'>
                        <General_Product_Details
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
                          useEntryDate={productDetails?.useEntryDate ?? false}
                          useExpireDate={productDetails?.useExpireDate ?? false}
                          expirationTime={productDetails?.expirationTime ?? 0}
                        />
                        <Nav className='tw:pt-2' role='tablist'>
                          <NavItem style={{ cursor: 'pointer' }}>
                            <NavLink
                              className={'tw:text-[16.25px] tw:font-semibold ' + (activeTab == '1' ? 'tw:!text-primary' : 'tw:!text-[color:var(--bs-secondary-color)]')}
                              onClick={() => {
                                tabChange('1')
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
                              className={'tw:text-[16.25px] tw:font-semibold ' + (activeTab == '2' ? 'tw:!text-primary' : 'tw:!text-[color:var(--bs-secondary-color)]')}
                              onClick={() => {
                                tabChange('2')
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
                              className={'tw:text-[16.25px] tw:font-semibold ' + (activeTab == '3' ? 'tw:!text-primary' : 'tw:!text-[color:var(--bs-secondary-color)]')}
                              onClick={() => {
                                tabChange('3')
                              }}
                              type='button'>
                              <>
                                <i className='far fa-user'></i>
                                Supplier Info
                              </>
                            </NavLink>
                          </NavItem>
                          <NavItem style={{ cursor: 'pointer' }}>
                            <NavLink
                              to='#'
                              className={'tw:text-[16.25px] tw:font-semibold ' + (activeTab == '4' ? 'tw:!text-primary' : 'tw:!text-[color:var(--bs-secondary-color)]')}
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
                              className={'tw:text-[16.25px] tw:font-semibold ' + (activeTab == '5' ? 'tw:!text-primary' : 'tw:!text-[color:var(--bs-secondary-color)]')}
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
                        <TabContent activeTab={activeTab} className='tw:pt-2 tw:pb-4 tw:border-b tw:border-[color:var(--border)]'>
                          <TabPane tabId='1'>
                            <SKU_product_details
                              inventoryId={productDetails?.inventoryId}
                              sku={productDetails?.sku}
                              upc={productDetails?.barcode}
                              htsCode={productDetails?.htsCode ?? ''}
                              defaultPrice={productDetails?.defaultPrice ?? 0}
                              msrp={productDetails?.msrp ?? 0}
                              map={productDetails?.map ?? 0}
                              floor={productDetails?.floor ?? 0}
                              ceilling={productDetails?.ceilling ?? 0}
                            />
                          </TabPane>
                          <TabPane tabId='2'>
                            <Measure_Product_Details
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
                          <TabPane tabId='3'>
                            <Supplier_Product_Details
                              inventoryId={productDetails?.inventoryId}
                              sku={productDetails?.sku}
                              sellerCost={productDetails?.sellerCost ?? 0}
                              inboundShippingCost={productDetails?.inboundShippingCost ?? 0}
                              otherCosts={productDetails?.otherCosts ?? 0}
                              productionTime={productDetails?.productionTime ?? 0}
                              transitTime={productDetails?.transitTime ?? 0}
                              shippingToFBA={productDetails?.shippingToFBA}
                            />
                          </TabPane>
                          <TabPane tabId='4'>
                            <Identifiers_Product_Details
                              inventoryId={productDetails?.inventoryId}
                              sku={productDetails?.sku}
                              upc={productDetails?.barcode}
                              asin={productDetails?.asin}
                              fnsku={productDetails?.fnsku}
                              identifiers={productDetails?.identifiers ?? []}
                            />
                          </TabPane>
                          <TabPane tabId='5'>
                            <Listings_Product_Details listings={productDetails?.listings ?? []} />
                          </TabPane>
                        </TabContent>
                        <Inventory_Product_Details
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
                      <Col xs='12' md='12' lg='3' className='tw:gap-4 tw:flex tw:flex-col'>
                        <Status_Product_Details
                          active={productDetails?.activeState ?? true}
                          isKit={productDetails?.isKit ? true : false}
                          inStock={productDetails?.onhand! > 0 ? true : false}
                        />
                        <Activity_Product_Details latestOrders={productDetails?.latestOrders ?? []} />
                        <Bins_Product_Details bins={productDetails?.bins ?? []} />
                      </Col>
                    </Row>
                  </CardBody>
                </>
              ) : (
                <div className='tw:w-full tw:h-full tw:px-4 tw:py-4 tw:flex tw:justify-center tw:items-center'>
                  <div className='tw:text-[19.5px] tw:font-normal tw:my-4 tw:flex tw:justify-center tw:items-center tw:gap-3'>
                    <Spinner color='primary' size={'md'} /> Loading product details...
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

export default Product_Page_Layout
