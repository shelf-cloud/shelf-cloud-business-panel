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
import { Button } from '@shadcn/ui/button'
import { Card, CardContent, CardHeader } from '@shadcn/ui/card'
import { Spinner } from '@shadcn/ui/spinner'

import { Nav, NavItem, NavLink, TabContent, TabPane } from '@/components/ui/nav-tabs'
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
          <div className='mx-auto w-full px-3'>
            <BreadCrumb title='Product Details' pageTitle='Inventory' />
            <Card className='text-[13px]'>
              {!isLoading ? (
                <>
                  <CardHeader className='flex flex-col justify-between items-start lg:flex-row'>
                    <div>
                      <Link href={'/Products?brand=All&supplier=All&category=All&condition=All&status=All'}>
                        <Button outline style={{ cursor: 'pointer' }}>
                          <span className='icon-on text-[11.2px]'>
                            <i className='ri-arrow-left-line align-bottom me-1' />
                            Products
                          </span>
                        </Button>
                      </Link>
                      <div className='mt-3'>
                        <div className='font-semibold text-[22.75px]'>
                          <span className='text-muted-foreground text-[19.5px]'>SKU:</span> {info![1]} <CopyTextToClipboard text={info![1]} label='SKU' fontSize='fs-4' />
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
                  <CardContent>
                    <div className='flex flex-wrap -mx-3'>
                      <div className='px-3 w-full lg:w-3/4 gap-2 flex flex-col overflow-auto'>
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
                        <Nav className='pt-2' role='tablist'>
                          <NavItem style={{ cursor: 'pointer' }}>
                            <NavLink
                              className={'text-[16.25px] font-semibold ' + (activeTab == '1' ? '!text-primary' : '!text-muted-foreground')}
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
                              className={'text-[16.25px] font-semibold ' + (activeTab == '2' ? '!text-primary' : '!text-muted-foreground')}
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
                              className={'text-[16.25px] font-semibold ' + (activeTab == '3' ? '!text-primary' : '!text-muted-foreground')}
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
                              className={'text-[16.25px] font-semibold ' + (activeTab == '4' ? '!text-primary' : '!text-muted-foreground')}
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
                              className={'text-[16.25px] font-semibold ' + (activeTab == '5' ? '!text-primary' : '!text-muted-foreground')}
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
                        <TabContent activeTab={activeTab} className='pt-2 pb-4 border-b border-[color:var(--border)]'>
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
                              hideReorderingPoints={productDetails?.hideReorderingPoints}
                              orderFrequency={productDetails?.orderFrequency}
                              daysOfStockSC={productDetails?.daysOfStockSC}
                              manualLeadTime={productDetails?.manualLeadTime}
                              leadTimeSC={productDetails?.leadTimeSC}
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
                      </div>
                      <div className='px-3 w-full lg:w-1/4 gap-4 flex flex-col'>
                        <Status_Product_Details
                          active={productDetails?.activeState ?? true}
                          isKit={productDetails?.isKit ? true : false}
                          inStock={productDetails?.onhand! > 0 ? true : false}
                        />
                        <Activity_Product_Details latestOrders={productDetails?.latestOrders ?? []} />
                        <Bins_Product_Details bins={productDetails?.bins ?? []} />
                      </div>
                    </div>
                  </CardContent>
                </>
              ) : (
                <div className='w-full h-full px-4 py-4 flex justify-center items-center'>
                  <div className='text-[19.5px] font-normal my-4 flex justify-center items-center gap-3'>
                    <Spinner className='size-6 text-primary' /> Loading product details...
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>
      </React.Fragment>
      {shipmentDetailModal.show && <ShipmentDetailsModal />}
    </div>
  )
}

export default Product_Page_Layout
