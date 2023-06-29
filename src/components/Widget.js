import React, { useContext } from 'react'
import AppContext from '@context/AppContext'
import { Card, CardBody, Col, Row } from 'reactstrap'
import CountUp from 'react-countup'
import FeatherIcon from 'feather-icons-react'
import Link from 'next/link'

const Widget = ({ summary }) => {
  const { state } = useContext(AppContext)
  return (
    <React.Fragment>
      <Col xl={3} md={6}>
        <Card className='card-animate'>
          <CardBody>
            <div className='d-flex align-items-center justify-content-between'>
              <div className='d-flex flex-row justify-content-start align-items-center'>
                <div className=''>
                  <span className={'avatar-title p-2 fs-3 bg-soft-primary rounded-4'}>
                    <i className='bx bxs-box' style={{ color: '#39B0EC' }}></i>
                  </span>
                </div>
                <p className='text-capitalize fw-medium mb-0 ms-2'>Previous Month Charge</p>
              </div>
              <div className='flex-shrink-0'>
                <h5 className={'fs-6 mb-0 fw-bold'}>{summary?.previousMonth?.date}</h5>
              </div>
            </div>
            <div className='d-flex align-items-end justify-content-between mt-2'>
              <h4 className='fs-3 fw-semibold'>
                <span className='counter-value'>
                  <CountUp
                    start={0}
                    prefix={state.currentRegion == 'us' ? '$ ' : ''}
                    suffix={state.currentRegion == 'eu' ? ' €' : ''}
                    separator={state.currentRegion == 'us' ? '.' : ','}
                    end={summary?.previousMonth?.charge}
                    decimals={2}
                    duration={1}
                  />
                </span>
              </h4>
              {/* <Link href="Storage">
                    <a className="text-primary text-decoration-underline">
                      Storage
                    </a>
                  </Link> */}
              {/* <div className="avatar-sm flex-shrink-0">
                  <span className={'avatar-title rounded fs-3 bg-soft-success'}>
                    <i className="text-success bx bxs-box"></i>
                  </span>
                </div> */}
            </div>
          </CardBody>
        </Card>
      </Col>
      <Col xl={3} md={6}>
        <Card className='card-animate'>
          <CardBody>
            <div className='d-flex align-items-center justify-content-between'>
              <div className='d-flex flex-row justify-content-start align-items-center'>
                <div className=''>
                  <span className={'avatar-title p-2 fs-3 bg-soft-primary rounded-4'}>
                    <i className='las la-clipboard-list' style={{ color: '#4F6EED' }}></i>
                  </span>
                </div>
                <p className='text-capitalize fw-medium mb-0 ms-2'>Total Inventory</p>
              </div>
              <div className='flex-shrink-0'>
                <h5 className={'fs-6 mb-0 fw-bold'}>{summary?.skus} SKUs</h5>
              </div>
            </div>
            <div className='d-flex align-items-end justify-content-between mt-2'>
              <h4 className='fs-3 fw-semibold'>
                <span className='counter-value'>
                  <CountUp start={0} separator={','} end={summary?.totalInventoryQty} decimals={0} duration={1} />
                </span>
              </h4>
            </div>
          </CardBody>
          {/* <CardBody>
              <div className="d-flex align-items-center">
                <div className="flex-grow-1 overflow-hidden">
                  <p className="text-uppercase fw-medium text-muted text-truncate mb-0">
                    Total Inventory
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <h5 className={'fs-14 mb-0 fw-bold'}>{summary?.skus} SKUs</h5>
                </div>
              </div>
              <div className="d-flex align-items-end justify-content-between mt-4">
                <div>
                  <h4 className="fs-22 fw-semibold ff-secondary mb-4">
                    <span className="counter-value" data-target="559.25">
                      <CountUp
                        start={0}
                        // prefix={'$'}
                        // suffix={item.suffix}
                        separator={','}
                        end={summary?.totalInventoryQty}
                        decimals={0}
                        duration={1}
                      />
                    </span>
                  </h4>
                  <Link href="/Products">
                    <a className="text-primary text-decoration-underline">
                      Products
                    </a>
                  </Link>
                </div>
                <div className="avatar-sm flex-shrink-0">
                  <span className={'avatar-title rounded fs-3 bg-soft-primary'}>
                    <i className="text-primary las la-clipboard-list"></i>
                  </span>
                </div>
              </div>
            </CardBody> */}
        </Card>
      </Col>
      <Col xl={3} md={6}>
        <Card className='card-animate'>
          <CardBody>
            <div className='d-flex align-items-center justify-content-between'>
              <div className='d-flex flex-row justify-content-start align-items-center'>
                <div className=''>
                  <span className={'avatar-title px-2 py-1 fs-3 bg-soft-primary rounded-4'}>
                    <i className='ri-truck-fill' style={{ color: '#50BA99' }}></i>
                  </span>
                </div>
                <p className='text-capitalize fw-medium mb-0 ms-2'>Total Shipments</p>
              </div>
              <div className='flex-shrink-0'>
                <h5 className={'fs-6 mb-0 fw-bold'}>
                  <div className='flex-shrink-0'>
                    {summary?.shipmentsDiff >= 0 ? (
                      <h5 className={'fs-14 mb-0 fw-bold'}>
                        <i className={'fs-13 align-middle ri-arrow-right-up-line'}></i>
                        {`+`}
                        {summary?.shipmentsDiff.toFixed(0)} %
                      </h5>
                    ) : (
                      <h5 className={'fs-14 mb-0 fw-bold'}>
                        <i className={'fs-13 align-middle ri-arrow-right-down-line'}></i>
                        {``}
                        {summary?.shipmentsDiff.toFixed(0)} %
                      </h5>
                    )}
                  </div>
                </h5>
              </div>
            </div>
            <div className='d-flex align-items-end justify-content-between mt-2'>
              <h4 className='fs-3 fw-semibold'>
                <span className='counter-value'>
                  <CountUp
                    start={0}
                    // prefix={'$'}
                    // suffix={item.suffix}
                    separator={','}
                    end={summary?.totalShipments}
                    decimals={0}
                    duration={1}
                  />
                </span>
              </h4>
            </div>
          </CardBody>
          {/* <CardBody>
              <div className="d-flex align-items-center">
                <div className="flex-grow-1 overflow-hidden">
                  <p className="text-uppercase fw-medium text-muted text-truncate mb-0">
                    Total Shipments
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <h5 className={'fs-14 mb-0 fw-bold'}>
                    <div className="flex-shrink-0">
                      {summary?.shipmentsDiff >= 0 ? (
                        <h5 className={'fs-14 mb-0 text-success'}>
                          <i
                            className={
                              'fs-13 align-middle ri-arrow-right-up-line'
                            }
                          ></i>
                          {` +`}
                          {summary?.shipmentsDiff.toFixed(0)} %
                        </h5>
                      ) : (
                        <h5 className={'fs-14 mb-0 text-danger'}>
                          <i
                            className={
                              'fs-13 align-middle ri-arrow-right-down-line'
                            }
                          ></i>
                          {` `}
                          {summary?.shipmentsDiff.toFixed(0)} %
                        </h5>
                      )}
                    </div>
                  </h5>
                </div>
              </div>
              <div className="d-flex align-items-end justify-content-between mt-4">
                <div>
                  <h4 className="fs-22 fw-semibold ff-secondary mb-4">
                    <span className="counter-value" data-target="559.25">
                      <CountUp
                        start={0}
                        // prefix={'$'}
                        // suffix={item.suffix}
                        separator={','}
                        end={summary?.totalShipments}
                        decimals={0}
                        duration={1}
                      />
                    </span>
                  </h4>
                  <Link href="/Shipments">
                    <a className="text-primary text-decoration-underline">
                      Shipments
                    </a>
                  </Link>
                </div>
                <div className="avatar-sm flex-shrink-0">
                  <span className={'avatar-title rounded fs-3 bg-soft-info'}>
                    <i className="text-info ri-list-unordered"></i>
                  </span>
                </div>
              </div>
            </CardBody> */}
        </Card>
      </Col>
      <Col xl={3} md={6}>
        <Card className='card-animate'>
          <CardBody>
            <div className='d-flex align-items-center justify-content-between'>
              <div className='d-flex flex-row justify-content-start align-items-center'>
                <div className=''>
                  <span className={'avatar-title px-2 py-1 fs-3 bg-soft-primary rounded-4'}>
                    <i className='ri-luggage-cart-line' style={{ color: '#2D81FE' }}></i>
                  </span>
                </div>
                <p className='text-capitalize fw-medium mb-0 ms-2'>Pick and Pack Charges</p>
              </div>
              <div className='flex-shrink-0'>
                <h5 className={'fs-6 mb-0 fw-bold'}>
                  <div className='flex-shrink-0'>
                    {summary?.pickPackDiff >= 0 ? (
                      <h5 className={'fs-14 mb-0 fw-bold'}>
                        <i className={'fs-13 align-middle ri-arrow-right-up-line'}></i>
                        {`+`}
                        {summary?.pickPackDiff.toFixed(0)} %
                      </h5>
                    ) : (
                      <h5 className={'fs-14 mb-0 fw-bold'}>
                        <i className={'fs-13 align-middle ri-arrow-right-down-line'}></i>
                        {``}
                        {summary?.pickPackDiff.toFixed(0)} %
                      </h5>
                    )}
                  </div>
                </h5>
              </div>
            </div>
            <div className='d-flex align-items-end justify-content-between mt-2'>
              <h4 className='fs-3 fw-semibold'>
                <span className='counter-value'>
                  <CountUp
                    start={0}
                    prefix={state.currentRegion == 'us' ? '$ ' : ''}
                    suffix={state.currentRegion == 'eu' ? ' €' : ''}
                    separator={state.currentRegion == 'us' ? '.' : ','}
                    end={summary?.totalCharges.totalpickpackCharge}
                    decimals={2}
                    duration={1}
                  />
                </span>
              </h4>
            </div>
          </CardBody>
          {/* <CardBody>
              <div className="d-flex align-items-center">
                <div className="flex-grow-1 overflow-hidden">
                  <p className="text-uppercase fw-medium text-muted text-truncate mb-0">
                    Pick and Pack Charges
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <h5 className={'fs-14 mb-0 fw-bold'}>
                    <div className="flex-shrink-0">
                      {summary?.pickPackDiff >= 0 ? (
                        <h5 className={'fs-14 mb-0 text-success'}>
                          <i
                            className={
                              'fs-13 align-middle ri-arrow-right-up-line'
                            }
                          ></i>
                          {` +`}
                          {summary?.pickPackDiff.toFixed(0)} %
                        </h5>
                      ) : (
                        <h5 className={'fs-14 mb-0 text-danger'}>
                          <i
                            className={
                              'fs-13 align-middle ri-arrow-right-down-line'
                            }
                          ></i>
                          {` `}
                          {summary?.pickPackDiff.toFixed(0)} %
                        </h5>
                      )}
                    </div>
                  </h5>
                </div>
              </div>
              <div className="d-flex align-items-end justify-content-between mt-4">
                <div>
                  <h4 className="fs-22 fw-semibold ff-secondary mb-4">
                    <span className="counter-value" data-target="559.25">
                      <CountUp
                        start={0}
                        prefix={'$ '}
                        // suffix={item.suffix}
                        separator={'.'}
                        end={summary?.totalCharges.totalpickpackCharge}
                        decimals={2}
                        duration={1}
                      />
                    </span>
                  </h4>
                  <Link href="/Shipments">
                    <a className="text-primary text-decoration-underline">
                      Shipments
                    </a>
                  </Link>
                </div>
                <div className="avatar-sm flex-shrink-0">
                  <span className={'avatar-title rounded fs-3 bg-soft-info'}>
                    <i className="text-info las la-boxes"></i>
                  </span>
                </div>
              </div>
            </CardBody> */}
        </Card>
      </Col>
    </React.Fragment>
  )
}

export default Widget
