import ProductsInventoryTimelineModal from '@components/modals/products/ProductsInventoryTimeline'
import AppContext from '@context/AppContext'
import { FormatIntNumber } from '@lib/FormatNumbers'
import { FBAProductsWidgetResponse, ProductsWidgetsResponse } from '@typesTs/products/productsWidgets'
import axios from 'axios'
import React, { useContext, useState } from 'react'
import CountUp from 'react-countup'
import { Button, Card, CardBody, Col, Row } from 'reactstrap'
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
    }
  )

  const { data: fbaProductsWidget } = useSWR(
    state.user.businessId && state.user[state.currentRegion]?.showAmazonTab && state.user[state.currentRegion]?.amazonConnected
      ? `/api/products/getAmazonInventoryValue?region=${state.currentRegion}&businessId=${state.user.businessId}`
      : null,
    FBAfetcher,
    {
      revalidateOnFocus: false,
    }
  )

  return (
    <Row className='mb-2 gy-2 gx-2'>
      <Col xs={12} md={state.user[state.currentRegion]?.showAmazonTab && state.user[state.currentRegion]?.amazonConnected ? 2 : 3}>
        <Card className='card-animate mb-0'>
          <CardBody className='py-2'>
            <div className='d-flex align-items-center justify-content-between mb-1'>
              <p className='text-capitalize fw-normal mb-0  text-nowrap' style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                <span className='text-primary fw-bold'>Total</span> Inventory Qty
              </p>
              <div className='flex-shrink-0'>{/* <h5 className={'fs-6 mb-0 fw-bold'}>{1762} SKUs</h5> */}</div>
            </div>
            <div className='d-flex flex-row align-items-center justify-content-between flex-md-column align-items-md-start flex-lg-row align-items-lg-center'>
              <h4 className='fs-5 fw-semibold mb-0'>
                <span className='counter-value'>
                  <CountUp start={0} separator={','} end={productsWidgets?.totalQty ?? 0} decimals={0} duration={1} />
                </span>
              </h4>
              <Button color='primary' size='sm' className='btn-icon m-0 p-0 h-100' onClick={() => setproductsQtyTimelineModal({ show: true })}>
                <i className='ri-line-chart-fill fs-5 align-middle m-0 p-0' />
              </Button>
            </div>
          </CardBody>
        </Card>
      </Col>
      <Col xs={12} md={3}>
        <Card className='card-animate mb-0'>
          <CardBody className='py-2'>
            <div className='d-flex align-items-center justify-content-between mb-2'>
              <p className='text-capitalize fw-normal mb-0 text-nowrap' style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                <span className='text-primary fw-bold'>Seller Cost</span> Inventory Value
              </p>
            </div>
            <div className='d-flex align-items-end justify-content-between'>
              <h4 className='fs-5 fw-semibold mb-0'>
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
            <div className='d-flex align-items-center justify-content-between mb-2'>
              <p className='text-capitalize fw-normal mb-0 text-nowrap' style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                <span className='text-primary fw-bold'>Landed Cost</span> Inventory Value
              </p>
            </div>
            <div className='d-flex align-items-end justify-content-between'>
              <h4 className='fs-5 fw-semibold mb-0'>
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
                className='d-flex flex-column align-items-start justify-content-between mb-1 flex-lg-row align-items-lg-center'
                style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                <p className='text-capitalize fw-normal mb-0 text-nowrap'>
                  <span className='text-primary fw-bold'>Amazon</span> FBA Inventory Value
                </p>
                <div className='flex-shrink-0'>
                  <h5 className={'fs-6 mb-0 fw-bold'}>
                    {FormatIntNumber(state.currentRegion, fbaProductsWidget?.totalQty ?? 0)} <span className='fs-7 fw-light text-muted'>Units</span>
                  </h5>
                </div>
              </div>
              <div
                className='d-flex flex-column align-items-start justify-content-between flex-lg-row align-items-lg-center gap-1'
                style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                <p className='fs-5 fw-semibold mb-0 text-nowrap'>
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
                  <span className='fs-7 fw-light text-muted'> Seller C.</span>
                </p>
                <p className='fs-5 fw-semibold mb-0 text-nowrap'>
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
                  <span className='fs-7 fw-light text-muted'> Landed C.</span>
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
