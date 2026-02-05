/* eslint-disable @next/next/no-img-element */
import React, { useContext, useMemo } from 'react'

import AppContext from '@context/AppContext'
import { FormatCurrency, FormatIntNumber } from '@lib/FormatNumbers'
import { NoImageAdress } from '@lib/assetsConstants'
import { DashboardResponse } from '@typesTs/commercehub/dashboard'
import CountUp from 'react-countup'
import { Card, CardBody, Col } from 'reactstrap'

type Props = {
  summary: DashboardResponse
}

type PendingInfo = {
  totalPending: number
  marketplaces: { [marketplace: string]: number }
  totalInvoices: number
}

const CommerceHubWidget = ({ summary }: Props) => {
  const { state }: any = useContext(AppContext)

  const pendingInfo = useMemo(() => {
    if (!summary) return { totalPending: 0, marketplaces: {}, totalInvoices: 0 }

    return summary.summary.reduce(
      (pendingInfo: PendingInfo, store) => {
        const pendingValue = store.orderTotal
        if (pendingValue > 0.1) {
          pendingInfo.totalPending += pendingValue
          pendingInfo.totalInvoices += store.totalInvoices
        }
        if (!pendingInfo.marketplaces[store.storeName]) pendingInfo.marketplaces[store.storeName] = 0
        pendingInfo.marketplaces[store.storeName] += pendingValue
        return pendingInfo
      },
      { totalPending: 0, marketplaces: {}, totalInvoices: 0 }
    )
  }, [summary])

  return (
    <React.Fragment>
      <Col xs={6}>
        <Card className='card-animate'>
          <CardBody>
            <div className='d-flex align-items-center justify-content-between'>
              <div className='d-flex flex-row justify-content-start align-items-center'>
                <div className=''>
                  <span className={'avatar-title p-2 fs-3 bg-soft-primary rounded-4'}>
                    <i className='bx bx-money-withdraw' style={{ color: '#39B0EC' }}></i>
                  </span>
                </div>
                <p className='text-capitalize fw-medium mb-0 ms-2'>Pending</p>
              </div>
              {/* <div className='flex-shrink-0'>
                <h5 className={'fs-6 mb-0 fw-bold'}>{pendingInfo.totalPending}</h5>
              </div> */}
            </div>
            <div className='d-flex align-items-end justify-content-between mt-2'>
              <h4 className='fs-3 fw-semibold'>
                <span className='counter-value'>
                  <CountUp
                    start={0}
                    prefix={state.currentRegion == 'us' ? '$ ' : ''}
                    suffix={state.currentRegion == 'eu' ? ' €' : ''}
                    separator={state.currentRegion == 'us' ? ',' : ','}
                    decimal={state.currentRegion == 'us' ? '.' : ','}
                    end={pendingInfo.totalPending}
                    decimals={2}
                    duration={1}
                  />
                </span>
              </h4>
            </div>
          </CardBody>
        </Card>
      </Col>
      <Col xs={6}>
        <Card className='card-animate'>
          <CardBody>
            <div className='d-flex align-items-center justify-content-between'>
              <div className='d-flex flex-row justify-content-start align-items-center'>
                <div className=''>
                  <span className={'avatar-title p-2 fs-3 bg-soft-primary rounded-4'}>
                    <i className='las la-file-invoice-dollar' style={{ color: '#4F6EED' }}></i>
                  </span>
                </div>
                <p className='text-capitalize fw-medium mb-0 ms-2'>Pending Invoices</p>
              </div>
              {/* <div className='flex-shrink-0'>
                <h5 className={'fs-6 mb-0 fw-bold'}>{pendingInfo.totalInvoices}</h5>
              </div> */}
            </div>
            <div className='d-flex align-items-end justify-content-between mt-2'>
              <h4 className='fs-3 fw-semibold'>
                <span className='counter-value'>
                  <CountUp start={0} separator={','} end={pendingInfo.totalInvoices} decimals={0} duration={1} />
                </span>
              </h4>
            </div>
          </CardBody>
        </Card>
      </Col>
      <Col xs={12}>
        <Card>
          <CardBody>
            <div className='table-responsive table-card'>
              <table className='table table-hover table-centered align-middle mb-0'>
                <thead>
                  <tr className='fw-semibold'>
                    <td>Store</td>
                    <td>No. Invoices</td>
                    <td>Pending</td>
                  </tr>
                </thead>
                <tbody className='fs-7'>
                  {summary.summary.map((item, key) => {
                    return (
                      <tr key={key}>
                        <td>
                          <img
                            loading='lazy'
                            src={item.channelLogo ? item.channelLogo : NoImageAdress}
                            alt='Channel Logo'
                            className='m-0 p-0 me-1 '
                            style={{
                              width: '20px',
                              height: '20px',
                              objectFit: 'contain',
                            }}
                          />
                          {item.storeName}
                        </td>
                        <td>{FormatIntNumber(state.currentRegion, item.totalInvoices)}</td>
                        <td>{FormatCurrency(state.currentRegion, item.orderTotal)}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </CardBody>
        </Card>
      </Col>
    </React.Fragment>
  )
}

export default CommerceHubWidget
