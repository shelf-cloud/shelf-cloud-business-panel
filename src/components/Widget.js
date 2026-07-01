import Link from 'next/link'
import React, { useContext } from 'react'

import AppContext from '@context/AppContext'
import FeatherIcon from 'feather-icons-react'
import CountUp from 'react-countup'
import { Card, CardBody, Col } from '@/components/migration-ui'

const Widget = ({ summary }) => {
  const { state } = useContext(AppContext)
  return (
    <React.Fragment>
      <Col xl={3} md={6}>
        <Card className='tw:transition-all tw:duration-300 tw:hover:-translate-y-[5px] tw:hover:shadow-[0_5px_10px_rgba(30,32,37,0.12)]'>
          <CardBody>
            <div className='tw:flex tw:items-center tw:justify-between'>
              <div className='tw:flex tw:flex-row tw:justify-start tw:items-center'>
                <div className=''>
                  <span className={'tw:inline-flex tw:items-center tw:justify-center tw:p-2 tw:text-[22.75px] tw:bg-[color-mix(in_srgb,var(--primary)_18%,transparent)] tw:rounded-[1rem]'}>
                    <i className='bx bxs-box' style={{ color: '#39B0EC' }}></i>
                  </span>
                </div>
                <p className='tw:capitalize tw:font-medium tw:mb-0 tw:ms-2'>Previous Month Charge</p>
              </div>
              <div className='tw:shrink-0'>
                <h5 className={'tw:text-[13px] tw:mb-0 tw:font-bold'}>{summary?.previousMonth?.date}</h5>
              </div>
            </div>
            <div className='tw:flex tw:items-end tw:justify-between tw:mt-2'>
              <h4 className='tw:text-[22.75px] tw:font-semibold'>
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
        <Card className='tw:transition-all tw:duration-300 tw:hover:-translate-y-[5px] tw:hover:shadow-[0_5px_10px_rgba(30,32,37,0.12)]'>
          <CardBody>
            <div className='tw:flex tw:items-center tw:justify-between'>
              <div className='tw:flex tw:flex-row tw:justify-start tw:items-center'>
                <div className=''>
                  <span className={'tw:inline-flex tw:items-center tw:justify-center tw:p-2 tw:text-[22.75px] tw:bg-[color-mix(in_srgb,var(--primary)_18%,transparent)] tw:rounded-[1rem]'}>
                    <i className='las la-clipboard-list' style={{ color: '#4F6EED' }}></i>
                  </span>
                </div>
                <p className='tw:capitalize tw:font-medium tw:mb-0 tw:ms-2'>Total Inventory</p>
              </div>
              <div className='tw:shrink-0'>
                <h5 className={'tw:text-[13px] tw:mb-0 tw:font-bold'}>{summary?.skus} SKUs</h5>
              </div>
            </div>
            <div className='tw:flex tw:items-end tw:justify-between tw:mt-2'>
              <h4 className='tw:text-[22.75px] tw:font-semibold'>
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
                  <h5 className={'tw:text-[14px] tw:mb-0 tw:font-bold'}>{summary?.skus} SKUs</h5>
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
        <Card className='tw:transition-all tw:duration-300 tw:hover:-translate-y-[5px] tw:hover:shadow-[0_5px_10px_rgba(30,32,37,0.12)]'>
          <CardBody>
            <div className='tw:flex tw:items-center tw:justify-between'>
              <div className='tw:flex tw:flex-row tw:justify-start tw:items-center'>
                <div className=''>
                  <span className={'tw:inline-flex tw:items-center tw:justify-center tw:px-2 tw:py-1 tw:text-[22.75px] tw:bg-[color-mix(in_srgb,var(--primary)_18%,transparent)] tw:rounded-[1rem]'}>
                    <i className='ri-truck-fill' style={{ color: '#50BA99' }}></i>
                  </span>
                </div>
                <p className='tw:capitalize tw:font-medium tw:mb-0 tw:ms-2'>Total Shipments</p>
              </div>
              <div className='tw:shrink-0'>
                <h5 className={'tw:text-[13px] tw:mb-0 tw:font-bold'}>
                  <div className='tw:shrink-0'>
                    {summary?.shipmentsDiff >= 0 ? (
                      <h5 className={'tw:text-[14px] tw:mb-0 tw:font-bold'}>
                        <i className={'tw:text-[13px] tw:align-middle ri-arrow-right-up-line'}></i>
                        {`+`}
                        {summary?.shipmentsDiff.toFixed(0)} %
                      </h5>
                    ) : (
                      <h5 className={'tw:text-[14px] tw:mb-0 tw:font-bold'}>
                        <i className={'tw:text-[13px] tw:align-middle ri-arrow-right-down-line'}></i>
                        {``}
                        {summary?.shipmentsDiff.toFixed(0)} %
                      </h5>
                    )}
                  </div>
                </h5>
              </div>
            </div>
            <div className='tw:flex tw:items-end tw:justify-between tw:mt-2'>
              <h4 className='tw:text-[22.75px] tw:font-semibold'>
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
                  <h5 className={'tw:text-[14px] tw:mb-0 tw:font-bold'}>
                    <div className="flex-shrink-0">
                      {summary?.shipmentsDiff >= 0 ? (
                        <h5 className={'fs-14 mb-0 text-success'}>
                          <i
                            className={
                              'tw:text-[13px] tw:align-middle ri-arrow-right-up-line'
                            }
                          ></i>
                          {` +`}
                          {summary?.shipmentsDiff.toFixed(0)} %
                        </h5>
                      ) : (
                        <h5 className={'fs-14 mb-0 text-danger'}>
                          <i
                            className={
                              'tw:text-[13px] tw:align-middle ri-arrow-right-down-line'
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
        <Card className='tw:transition-all tw:duration-300 tw:hover:-translate-y-[5px] tw:hover:shadow-[0_5px_10px_rgba(30,32,37,0.12)]'>
          <CardBody>
            <div className='tw:flex tw:items-center tw:justify-between'>
              <div className='tw:flex tw:flex-row tw:justify-start tw:items-center'>
                <div className=''>
                  <span className={'tw:inline-flex tw:items-center tw:justify-center tw:px-2 tw:py-1 tw:text-[22.75px] tw:bg-[color-mix(in_srgb,var(--primary)_18%,transparent)] tw:rounded-[1rem]'}>
                    <i className='ri-luggage-cart-line' style={{ color: '#2D81FE' }}></i>
                  </span>
                </div>
                <p className='tw:capitalize tw:font-medium tw:mb-0 tw:ms-2'>Pick and Pack Charges</p>
              </div>
              <div className='tw:shrink-0'>
                <h5 className={'tw:text-[13px] tw:mb-0 tw:font-bold'}>
                  <div className='tw:shrink-0'>
                    {summary?.pickPackDiff >= 0 ? (
                      <h5 className={'tw:text-[14px] tw:mb-0 tw:font-bold'}>
                        <i className={'tw:text-[13px] tw:align-middle ri-arrow-right-up-line'}></i>
                        {`+`}
                        {summary?.pickPackDiff.toFixed(0)} %
                      </h5>
                    ) : (
                      <h5 className={'tw:text-[14px] tw:mb-0 tw:font-bold'}>
                        <i className={'tw:text-[13px] tw:align-middle ri-arrow-right-down-line'}></i>
                        {``}
                        {summary?.pickPackDiff.toFixed(0)} %
                      </h5>
                    )}
                  </div>
                </h5>
              </div>
            </div>
            <div className='tw:flex tw:items-end tw:justify-between tw:mt-2'>
              <h4 className='tw:text-[22.75px] tw:font-semibold'>
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
                  <h5 className={'tw:text-[14px] tw:mb-0 tw:font-bold'}>
                    <div className="flex-shrink-0">
                      {summary?.pickPackDiff >= 0 ? (
                        <h5 className={'fs-14 mb-0 text-success'}>
                          <i
                            className={
                              'tw:text-[13px] tw:align-middle ri-arrow-right-up-line'
                            }
                          ></i>
                          {` +`}
                          {summary?.pickPackDiff.toFixed(0)} %
                        </h5>
                      ) : (
                        <h5 className={'fs-14 mb-0 text-danger'}>
                          <i
                            className={
                              'tw:text-[13px] tw:align-middle ri-arrow-right-down-line'
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
