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
          <CardHeader className='items-center flex justify-between'>
            <h4 className='card-title mb-0 grow'>Check Summary</h4>
          </CardHeader>

          <CardBody>
            <div className='overflow-x-auto'>
              <table className='w-full align-middle mb-0 [&_th]:px-2 [&_th]:py-1 [&_td]:px-2 [&_td]:py-1 [&_tbody_tr:hover]:bg-[color:var(--vz-light)]'>
                <thead>
                  <tr className='font-semibold'>
                    <td>Store</td>
                    <td>Check Number</td>
                    <td>Check Date</td>
                    <td>Total Paid</td>
                    <td>Deductions</td>
                  </tr>
                </thead>
                <tbody className='text-[11.2px]'>
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
                            className='m-0 p-0 me-1 '
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
                            <Link href={`/commercehub/${item.storeName}/${item.checkNumber}`} className='text-[11.2px] !text-primary font-normal'>
                              {item.checkNumber}
                            </Link>
                          ) : (
                            <span className='text-[13px] text-[var(--bs-secondary-color)] font-light italic'>Pending</span>
                          )}
                        </td>
                        <td>{moment.utc(item.checkDate).local().format('LL')}</td>
                        <td>{FormatCurrency(state.currentRegion, totalPaid)}</td>
                        <td className='text-danger'>{FormatCurrency(state.currentRegion, deductions)}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
              <div className='flex justify-end items-center px-4 py-2'>
                <Link href={`/commercehub/checkSummary`} className='!text-primary text-[11.2px]'>
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
