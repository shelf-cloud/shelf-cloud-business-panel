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
            <div className='flex items-center justify-between'>
              <div className='flex flex-row justify-start items-center'>
                <div className=''>
                  <span className={'avatar-title p-2 text-[22.75px] bg-[color-mix(in_srgb,var(--bs-primary)_18%,transparent)] rounded-[1rem]'}>
                    <i className='bx bx-money-withdraw' style={{ color: '#39B0EC' }}></i>
                  </span>
                </div>
                <p className='capitalize font-medium mb-0 ms-2'>Pending</p>
              </div>
              {/* <div className='shrink-0'>
                <h5 className={'text-[13px] mb-0 font-bold'}>{pendingInfo.totalPending}</h5>
              </div> */}
            </div>
            <div className='flex items-end justify-between mt-2'>
              <h4 className='text-[22.75px] font-semibold'>
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
            <div className='flex items-center justify-between'>
              <div className='flex flex-row justify-start items-center'>
                <div className=''>
                  <span className={'avatar-title p-2 text-[22.75px] bg-[color-mix(in_srgb,var(--bs-primary)_18%,transparent)] rounded-[1rem]'}>
                    <i className='las la-file-invoice-dollar' style={{ color: '#4F6EED' }}></i>
                  </span>
                </div>
                <p className='capitalize font-medium mb-0 ms-2'>Pending Invoices</p>
              </div>
              {/* <div className='shrink-0'>
                <h5 className={'text-[13px] mb-0 font-bold'}>{pendingInfo.totalInvoices}</h5>
              </div> */}
            </div>
            <div className='flex items-end justify-between mt-2'>
              <h4 className='text-[22.75px] font-semibold'>
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
            <div className='overflow-x-auto'>
              <table className='w-full align-middle mb-0 [&_th]:px-2 [&_th]:py-1 [&_td]:px-2 [&_td]:py-1 [&_tbody_tr:hover]:bg-[color:var(--vz-light)]'>
                <thead>
                  <tr className='font-semibold'>
                    <td>Store</td>
                    <td>No. Invoices</td>
                    <td>Pending</td>
                  </tr>
                </thead>
                <tbody className='text-[11.2px]'>
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
