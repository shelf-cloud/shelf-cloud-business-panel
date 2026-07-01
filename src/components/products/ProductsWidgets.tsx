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
    <Row className='tw:mb-2 tw:gap-y-2'>
      <Col xs={12} md={state.user[state.currentRegion]?.showAmazonTab && state.user[state.currentRegion]?.amazonConnected ? 2 : 3}>
        <Card className='card-animate tw:mb-0'>
          <CardBody className='tw:py-2'>
            <div className='tw:flex tw:items-center tw:justify-between tw:mb-1'>
              <p className='tw:capitalize tw:font-normal tw:mb-0 tw:text-nowrap' style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                <span className='tw:text-primary tw:font-bold'>Total</span> Inventory Qty
              </p>
              <div className='tw:shrink-0'>{/* <h5 className={'fs-6 mb-0 fw-bold'}>{1762} SKUs</h5> */}</div>
            </div>
            <div className='tw:flex tw:flex-row tw:items-center tw:justify-between tw:md:flex-col tw:md:items-start tw:lg:flex-row tw:lg:items-center'>
              <h4 className='tw:text-[16.25px] tw:font-semibold tw:mb-0'>
                <span className='counter-value'>
                  <CountUp start={0} separator={','} end={productsWidgets?.totalQty ?? 0} decimals={0} duration={1} />
                </span>
              </h4>
              <Button color='primary' size='sm' className='tw:m-0 tw:p-0 tw:h-full' onClick={() => setproductsQtyTimelineModal({ show: true })}>
                <i className='ri-line-chart-fill tw:text-[16.25px] tw:align-middle tw:m-0 tw:p-0' />
              </Button>
            </div>
          </CardBody>
        </Card>
      </Col>
      <Col xs={12} md={3}>
        <Card className='card-animate tw:mb-0'>
          <CardBody className='tw:py-2'>
            <div className='tw:flex tw:items-center tw:justify-between tw:mb-2'>
              <p className='tw:capitalize tw:font-normal tw:mb-0 tw:text-nowrap' style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                <span className='tw:text-primary tw:font-bold'>Seller Cost</span> Inventory Value
              </p>
            </div>
            <div className='tw:flex tw:items-end tw:justify-between'>
              <h4 className='tw:text-[16.25px] tw:font-semibold tw:mb-0'>
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
        <Card className='card-animate tw:mb-0'>
          <CardBody className='tw:py-2'>
            <div className='tw:flex tw:items-center tw:justify-between tw:mb-2'>
              <p className='tw:capitalize tw:font-normal tw:mb-0 tw:text-nowrap' style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                <span className='tw:text-primary tw:font-bold'>Landed Cost</span> Inventory Value
              </p>
            </div>
            <div className='tw:flex tw:items-end tw:justify-between'>
              <h4 className='tw:text-[16.25px] tw:font-semibold tw:mb-0'>
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
          <Card className='card-animate tw:mb-0'>
            <CardBody className='tw:py-2 tw:overflow-hidden'>
              <div
                className='tw:flex tw:flex-col tw:items-start tw:justify-between tw:mb-1 tw:lg:flex-row tw:lg:items-center'
                style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                <p className='tw:capitalize tw:font-normal tw:mb-0 tw:text-nowrap'>
                  <span className='tw:text-primary tw:font-bold'>Amazon</span> FBA Inventory Value
                </p>
                <div className='tw:shrink-0'>
                  <h5 className={'tw:text-[13px] tw:mb-0 tw:font-bold'}>
                    {FormatIntNumber(state.currentRegion, fbaProductsWidget?.totalQty ?? 0)} <span className='tw:text-[11.2px] tw:font-light tw:text-[color:var(--bs-secondary-color)]'>Units</span>
                  </h5>
                </div>
              </div>
              <div
                className='tw:flex tw:flex-col tw:items-start tw:justify-between tw:lg:flex-row tw:lg:items-center tw:gap-1'
                style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                <p className='tw:text-[16.25px] tw:font-semibold tw:mb-0 tw:text-nowrap'>
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
                  <span className='tw:text-[11.2px] tw:font-light tw:text-[color:var(--bs-secondary-color)]'> Seller C.</span>
                </p>
                <p className='tw:text-[16.25px] tw:font-semibold tw:mb-0 tw:text-nowrap'>
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
                  <span className='tw:text-[11.2px] tw:font-light tw:text-[color:var(--bs-secondary-color)]'> Landed C.</span>
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
