import { useContext, useState } from 'react'

import ProductsInventoryTimelineModal from '@components/modals/products/ProductsInventoryTimeline'
import AppContext from '@context/AppContext'
import { FormatIntNumber } from '@lib/FormatNumbers'
import { FBAProductsWidgetResponse, ProductsWidgetsResponse } from '@typesTs/products/productsWidgets'
import axios from 'axios'
import CountUp from 'react-countup'
import { Button, Card, CardBody, Col, Row } from '@/components/migration-ui'
import useSWR from 'swr'

type Props = {}

const fetcher = async (endPoint: string) => await axios.get<ProductsWidgetsResponse>(endPoint).then((res) => res.data)
const FBAfetcher = async (endPoint: string) => await axios.get<FBAProductsWidgetResponse>(endPoint).then((res) => res.data)

const ProductsWidgets = ({}: Props) => {
  const { state }: any = useContext(AppContext)
  const [productsQtyTimelineModal, setproductsQtyTimelineModal] = useState({
    show: false,
  })

  const { data: productsWidgets } = useSWR(
    state.user.businessId ? `/api/products/getProductsWidgets?region=${state.currentRegion}&businessId=${state.user.businessId}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnMount: true,
    }
  )

  const { data: fbaProductsWidget } = useSWR(
    state.user.businessId && state.user[state.currentRegion]?.showAmazonTab && state.user[state.currentRegion]?.amazonConnected
      ? `/api/products/getAmazonInventoryValue?region=${state.currentRegion}&businessId=${state.user.businessId}`
      : null,
    FBAfetcher,
    {
      revalidateOnFocus: false,
      revalidateOnMount: true,
    }
  )

  return (
    <Row className='mb-2 gap-y-2'>
      <Col xs={12} md={state.user[state.currentRegion]?.showAmazonTab && state.user[state.currentRegion]?.amazonConnected ? 2 : 3}>
        <Card className='card-animate mb-0'>
          <CardBody className='py-2'>
            <div className='flex items-center justify-between mb-1'>
              <p className='capitalize font-normal mb-0 text-nowrap' style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                <span className='text-primary font-bold'>Total</span> Inventory Qty
              </p>
              <div className='shrink-0'>{/* <h5 className={'fs-6 mb-0 fw-bold'}>{1762} SKUs</h5> */}</div>
            </div>
            <div className='flex flex-row items-center justify-between md:flex-col md:items-start lg:flex-row lg:items-center'>
              <h4 className='text-[16.25px] font-semibold mb-0'>
                <span className='counter-value'>
                  <CountUp start={0} separator={','} end={productsWidgets?.totalQty ?? 0} decimals={0} duration={1} />
                </span>
              </h4>
              <Button color='primary' size='sm' className='m-0 p-0 h-full' onClick={() => setproductsQtyTimelineModal({ show: true })}>
                <i className='ri-line-chart-fill text-[16.25px] align-middle m-0 p-0' />
              </Button>
            </div>
          </CardBody>
        </Card>
      </Col>
      <Col xs={12} md={3}>
        <Card className='card-animate mb-0'>
          <CardBody className='py-2'>
            <div className='flex items-center justify-between mb-2'>
              <p className='capitalize font-normal mb-0 text-nowrap' style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                <span className='text-primary font-bold'>Seller Cost</span> Inventory Value
              </p>
            </div>
            <div className='flex items-end justify-between'>
              <h4 className='text-[16.25px] font-semibold mb-0'>
                <span className='counter-value'>
                  <CountUp
                    start={0}
                    prefix={state.currentRegion == 'us' ? '$ ' : ''}
                    suffix={state.currentRegion == 'eu' ? ' €' : ''}
                    separator={state.currentRegion == 'us' ? '.' : ','}
                    end={productsWidgets?.totalSellerValue ?? 0}
                    decimals={2}
                    duration={1}
                  />
                </span>
              </h4>
            </div>
          </CardBody>
        </Card>
      </Col>
      <Col xs={12} md={3}>
        <Card className='card-animate mb-0'>
          <CardBody className='py-2'>
            <div className='flex items-center justify-between mb-2'>
              <p className='capitalize font-normal mb-0 text-nowrap' style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                <span className='text-primary font-bold'>Landed Cost</span> Inventory Value
              </p>
            </div>
            <div className='flex items-end justify-between'>
              <h4 className='text-[16.25px] font-semibold mb-0'>
                <span className='counter-value'>
                  <CountUp
                    start={0}
                    prefix={state.currentRegion == 'us' ? '$ ' : ''}
                    suffix={state.currentRegion == 'eu' ? ' €' : ''}
                    separator={state.currentRegion == 'us' ? '.' : ','}
                    end={productsWidgets?.totalLandedValue ?? 0}
                    decimals={2}
                    duration={1}
                  />
                </span>
              </h4>
            </div>
          </CardBody>
        </Card>
      </Col>
      {productsQtyTimelineModal.show && (
        <ProductsInventoryTimelineModal
          dates={productsWidgets?.inventoryTimeline.dates ?? []}
          dailyQty={productsWidgets?.inventoryTimeline.dailyQty ?? []}
          dailySellerValue={productsWidgets?.inventoryTimeline.dailySellerValue ?? []}
          dailyLandedValue={productsWidgets?.inventoryTimeline.dailyLandedValue ?? []}
          productsQtyTimelineModal={productsQtyTimelineModal}
          setproductsQtyTimelineModal={setproductsQtyTimelineModal}
        />
      )}
      {state.user[state.currentRegion]?.showAmazonTab && state.user[state.currentRegion]?.amazonConnected && (
        <Col xs={12} md={4}>
          <Card className='card-animate mb-0'>
            <CardBody className='py-2 overflow-hidden'>
              <div
                className='flex flex-col items-start justify-between mb-1 lg:flex-row lg:items-center'
                style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                <p className='capitalize font-normal mb-0 text-nowrap'>
                  <span className='text-primary font-bold'>Amazon</span> FBA Inventory Value
                </p>
                <div className='shrink-0'>
                  <h5 className={'text-[13px] mb-0 font-bold'}>
                    {FormatIntNumber(state.currentRegion, fbaProductsWidget?.totalQty ?? 0)} <span className='text-[11.2px] font-light text-[color:var(--bs-secondary-color)]'>Units</span>
                  </h5>
                </div>
              </div>
              <div
                className='flex flex-col items-start justify-between lg:flex-row lg:items-center gap-1'
                style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                <p className='text-[16.25px] font-semibold mb-0 text-nowrap'>
                  <span className='counter-value'>
                    <CountUp
                      start={0}
                      prefix={state.currentRegion == 'us' ? '$ ' : ''}
                      suffix={state.currentRegion == 'eu' ? ' €' : ''}
                      separator={state.currentRegion == 'us' ? '.' : ','}
                      end={fbaProductsWidget?.totalSellerValue ?? 0}
                      decimals={2}
                      duration={1}
                    />
                  </span>
                  <span className='text-[11.2px] font-light text-[color:var(--bs-secondary-color)]'> Seller C.</span>
                </p>
                <p className='text-[16.25px] font-semibold mb-0 text-nowrap'>
                  <span className='counter-value'>
                    <CountUp
                      start={0}
                      prefix={state.currentRegion == 'us' ? '$ ' : ''}
                      suffix={state.currentRegion == 'eu' ? ' €' : ''}
                      separator={state.currentRegion == 'us' ? '.' : ','}
                      end={fbaProductsWidget?.totalLandedValue ?? 0}
                      decimals={2}
                      duration={1}
                    />
                  </span>
                  <span className='text-[11.2px] font-light text-[color:var(--bs-secondary-color)]'> Landed C.</span>
                </p>
              </div>
            </CardBody>
          </Card>
        </Col>
      )}
    </Row>
  )
}

export default ProductsWidgets
