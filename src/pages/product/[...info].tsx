import { getSession } from '@auth/client'
import BreadCrumb from '@components/Common/BreadCrumb'
import OrderDetailsFromInvoicesModal from '@components/OrderDetailsFromInvoicesModal'
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
import AppContext from '@context/AppContext'
import { ProductDetails } from '@typings'
import axios from 'axios'
import { GetServerSideProps } from 'next'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import React, { useContext, useEffect, useState } from 'react'
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
    }
  }
}

const Product_Page_Layout = ({}: Props) => {
  const router = useRouter()
  const { state }: any = useContext(AppContext)
  const { info } = router.query

  const [loading, setloading] = useState(true)
  const [productDetails, setProductDetails] = useState<ProductDetails | null>()

  const fetcher = async (endPoint: string) => await axios(endPoint).then((res) => res.data)
  const { data } = useSWR(
    info![0] && state.user.businessId ? `/api/getProductPageDetails?region=${state.currentRegion}&inventoryId=${info![0]}&businessId=${state.user.businessId}` : null,
    fetcher
  )

  useEffect(() => {
    if (data?.error) {
      setProductDetails(null)
      setloading(false)
      toast.error(data?.message)
    } else if (data) {
      setProductDetails(data)
      setloading(false)
    }
  }, [data])

  const [activeTab, setActiveTab] = useState('1')
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
              {!loading ? (
                <>
                  <CardHeader className='d-flex flex-row justify-content-between align-items-start'>
                    <div>
                      <Link href={'/Products?brand=All&supplier=All&category=All&condition=All'}>
                        <Button
                          color='primary'
                          outline
                          // className="d-flex flex-row gap-1 text-decoration-none text-primary"
                          style={{ cursor: 'pointer' }}>
                          <span className='icon-on'>
                            <i className='ri-arrow-left-line align-bottom me-1' />
                            Products
                          </span>
                        </Button>
                      </Link>
                      <div className='mt-3'>
                        <p className='fw-semibold fs-3'>
                          <span className='text-muted fw-normal'>Product:</span> {info![1]}
                        </p>
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
                      <Col className='gap-2 d-flex flex-column'>
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
                        />
                        <Nav className='pt-2 nav-tabs-custom rounded card-header-tabs border-bottom-0' role='tablist'>
                          <NavItem style={{ cursor: 'pointer' }}>
                            <NavLink
                              className={'fs-4 fw-semibold ' + (activeTab == '1' ? 'text-primary' : 'text-muted')}
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
                              className={'fs-4 fw-semibold ' + (activeTab == '2' ? 'text-primary' : 'text-muted')}
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
                              className={'fs-4 fw-semibold ' + (activeTab == '3' ? 'text-primary' : 'text-muted')}
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
                      <Col xs='3' className='gap-4 d-flex flex-column'>
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
                <div className='w-100 px-4 py-4'>
                  <p className='fs-3 fw-semibold'>Loading...</p>
                </div>
              )}
            </Card>
          </Container>
        </div>
      </React.Fragment>
      {state.showOrderDetailsOfInvoiceModal && <OrderDetailsFromInvoicesModal />}
    </div>
  )
}

export default Product_Page_Layout
