/* eslint-disable @next/next/no-img-element */
import Link from 'next/link'
import React, { useContext } from 'react'

import AppContext from '@context/AppContext'
import { FormatCurrency } from '@lib/FormatNumbers'
import { NoImageAdress } from '@lib/assetsConstants'
import { DashboardResponse } from '@typesTs/commercehub/dashboard'
import moment from 'moment'
import { Card, CardBody, CardHeader, Col } from '@/components/migration-ui'

import { getTotalPaid } from './helperFunctions'

type Props = {
  summary: DashboardResponse
}

const CheckNumberTable = ({ summary }: Props) => {
  const { state }: any = useContext(AppContext)
  return (
    <React.Fragment>
      <Col>
        <Card>
          <CardHeader className='tw:items-center tw:flex tw:justify-between'>
            <h4 className='card-title tw:mb-0 tw:grow'>Check Summary</h4>
          </CardHeader>

          <CardBody>
            <div className='tw:overflow-x-auto'>
              <table className='tw:w-full tw:align-middle tw:mb-0 tw:[&_th]:px-2 tw:[&_th]:py-1 tw:[&_td]:px-2 tw:[&_td]:py-1 tw:[&_tbody_tr:hover]:bg-[color:var(--vz-light)]'>
                <thead>
                  <tr className='tw:font-semibold'>
                    <td>Store</td>
                    <td>Check Number</td>
                    <td>Check Date</td>
                    <td>Total Paid</td>
                    <td>Deductions</td>
                  </tr>
                </thead>
                <tbody className='tw:text-[11.2px]'>
                  {summary.invoices.map((item, key) => {
                    const totalPaid = getTotalPaid(item.orderTotal, item.deductions, item.charges)
                    const deductions = item.deductions
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
                        <td>
                          {item.checkNumber ? (
                            <Link href={`/commercehub/${item.storeName}/${item.checkNumber}`} className='tw:text-[11.2px] tw:!text-primary tw:font-normal'>
                              {item.checkNumber}
                            </Link>
                          ) : (
                            <span className='tw:text-[13px] tw:text-[var(--bs-secondary-color)] tw:font-light tw:italic'>Pending</span>
                          )}
                        </td>
                        <td>{moment.utc(item.checkDate).local().format('LL')}</td>
                        <td>{FormatCurrency(state.currentRegion, totalPaid)}</td>
                        <td className='tw:text-danger'>{FormatCurrency(state.currentRegion, deductions)}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
              <div className='tw:flex tw:justify-end tw:items-center tw:px-4 tw:py-2'>
                <Link href={`/commercehub/checkSummary`} className='tw:!text-primary tw:text-[11.2px]'>
                  View More
                </Link>
              </div>
            </div>
          </CardBody>
        </Card>
      </Col>
    </React.Fragment>
  )
}

export default CheckNumberTable
