import ProductsInventoryTimelineModal from '@components/modals/products/ProductsInventoryTimeline'
import AppContext from '@context/AppContext'
import { ProductsWidgetsResponse } from '@typesTs/products/productsWidgets'
import axios from 'axios'
import React, { useContext, useState } from 'react'
import CountUp from 'react-countup'
import { Button, Card, CardBody, Col, Row } from 'reactstrap'
import useSWR from 'swr'

type Props = {}

const fetcher = async (endPoint: string) => await axios.get<ProductsWidgetsResponse>(endPoint).then((res) => res.data)

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
  return (
    <Row className='mb-2'>
      <Col xs={12} md={3}>
        <Card className='card-animate mb-0'>
          <CardBody className='py-2'>
            <div className='d-flex align-items-center justify-content-between mb-1'>
              <p className='text-capitalize fw-medium mb-0'>Total Inventory Qty</p>
              <div className='flex-shrink-0'>
                <h5 className={'fs-6 mb-0 fw-bold'}>{1762} SKUs</h5>
              </div>
            </div>
            <div className='d-flex align-items-end justify-content-between'>
              <h4 className='fs-4 fw-semibold mb-0'>
                <span className='counter-value'>
                  <CountUp start={0} separator={','} end={productsWidgets?.totalQty ?? 0} decimals={0} duration={1} />
                </span>
              </h4>
              <Button className='btn-icon btn-primary btn-sm m-0 p-0' onClick={() => setproductsQtyTimelineModal({ show: true })}>
                <i className='ri-line-chart-fill fs-5 align-middle' />
              </Button>
            </div>
          </CardBody>
        </Card>
      </Col>
      <Col xs={12} md={3}>
        <Card className='card-animate mb-0'>
          <CardBody className='py-2'>
            <div className='d-flex align-items-center justify-content-between mb-2'>
              <p className='text-capitalize fw-medium mb-0'>
                <span className='text-primary fw-bold'>Seller Cost</span> Inventory Value
              </p>
            </div>
            <div className='d-flex align-items-end justify-content-between'>
              <h4 className='fs-4 fw-semibold mb-0'>
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
              <p className='text-capitalize fw-medium mb-0'>
                <span className='text-primary fw-bold'>Landed Cost</span> Inventory Value
              </p>
            </div>
            <div className='d-flex align-items-end justify-content-between'>
              <h4 className='fs-4 fw-semibold mb-0'>
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
    </Row>
  )
}

export default ProductsWidgets
