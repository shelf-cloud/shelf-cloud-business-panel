/* eslint-disable @next/next/no-img-element */
import React, { useContext, useMemo } from 'react'

import AppContext from '@context/AppContext'
import { FormatCurrency, FormatIntNumber } from '@lib/FormatNumbers'
import { NoImageAdress } from '@lib/assetsConstants'
import { DashboardResponse } from '@typesTs/commercehub/dashboard'
import CountUp from 'react-countup'
import { Card, CardBody, Col } from '@/components/migration-ui'

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
            <div className='tw:flex tw:items-center tw:justify-between'>
              <div className='tw:flex tw:flex-row tw:justify-start tw:items-center'>
                <div className=''>
                  <span className={'avatar-title tw:p-2 tw:text-[22.75px] bg-soft-primary rounded-4'}>
                    <i className='bx bx-money-withdraw' style={{ color: '#39B0EC' }}></i>
                  </span>
                </div>
                <p className='tw:capitalize tw:font-medium tw:mb-0 tw:ms-2'>Pending</p>
              </div>
              {/* <div className='tw:shrink-0'>
                <h5 className={'tw:text-[13px] tw:mb-0 tw:font-bold'}>{pendingInfo.totalPending}</h5>
              </div> */}
            </div>
            <div className='tw:flex tw:items-end tw:justify-between tw:mt-2'>
              <h4 className='tw:text-[22.75px] tw:font-semibold'>
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
            <div className='tw:flex tw:items-center tw:justify-between'>
              <div className='tw:flex tw:flex-row tw:justify-start tw:items-center'>
                <div className=''>
                  <span className={'avatar-title tw:p-2 tw:text-[22.75px] bg-soft-primary rounded-4'}>
                    <i className='las la-file-invoice-dollar' style={{ color: '#4F6EED' }}></i>
                  </span>
                </div>
                <p className='tw:capitalize tw:font-medium tw:mb-0 tw:ms-2'>Pending Invoices</p>
              </div>
              {/* <div className='tw:shrink-0'>
                <h5 className={'tw:text-[13px] tw:mb-0 tw:font-bold'}>{pendingInfo.totalInvoices}</h5>
              </div> */}
            </div>
            <div className='tw:flex tw:items-end tw:justify-between tw:mt-2'>
              <h4 className='tw:text-[22.75px] tw:font-semibold'>
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
              <table className='table table-hover table-centered align-middle tw:mb-0'>
                <thead>
                  <tr className='tw:font-semibold'>
                    <td>Store</td>
                    <td>No. Invoices</td>
                    <td>Pending</td>
                  </tr>
                </thead>
                <tbody className='tw:text-[11.2px]'>
                  {summary.summary.map((item, key) => {
                    return (
                      <tr key={key}>
                        <td>
                          <img
                            loading='lazy'
                            src={item.channelLogo ? item.channelLogo : NoImageAdress}
                            alt='Channel Logo'
                            className='tw:m-0 tw:p-0 tw:me-1 '
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
