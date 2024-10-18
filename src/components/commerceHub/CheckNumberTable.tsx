/* eslint-disable @next/next/no-img-element */
import React, { useContext } from 'react'
import Link from 'next/link'
import { Card, CardBody, CardHeader, Col } from 'reactstrap'
import { FormatCurrency } from '@lib/FormatNumbers'
import AppContext from '@context/AppContext'
import { DashboardResponse } from '@typesTs/commercehub/dashboard'
import moment from 'moment'

type Props = {
  summary: DashboardResponse
}

const CheckNumberTable = ({ summary }: Props) => {
  const { state }: any = useContext(AppContext)
  return (
    <React.Fragment>
      <Col>
        <Card>
          <CardHeader className='align-items-center d-flex justify-content-between'>
            <h4 className='card-title mb-0 flex-grow-1'>Checks Summary</h4>
          </CardHeader>

          <CardBody>
            <div className='table-responsive table-card'>
              <table className='table table-hover table-centered align-middle mb-0'>
                <thead>
                  <tr className='fw-semibold'>
                    <td>Store</td>
                    <td>Check Number</td>
                    <td>Check Date</td>
                    <td>Check Paid</td>
                    <td>Deductions</td>
                  </tr>
                </thead>
                <tbody>
                  {summary.invoices.map((item, key) => {
                    const pendingValue = item.checkTotal + item.cashDiscountTotal
                    const deductions = item.deductions
                    return (
                      <tr key={key}>
                        <td>
                          <img
                            loading='lazy'
                            src={
                              item.channelLogo
                                ? item.channelLogo
                                : 'https://firebasestorage.googleapis.com/v0/b/etiquetas-fba.appspot.com/o/image%2Fno-image.png?alt=media&token=c2232af5-43f6-4739-84eb-1d4803c44770'
                            }
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
                            <Link href={`/commercehub/${item.storeName}/${item.checkNumber}`}>
                              <a className='fs-6 text-primary fw-normal'>{item.checkNumber}</a>
                            </Link>
                          ) : (
                            <span className='fs-6 mw-30 text-muted fw-light fst-italic'>Pending</span>
                          )}
                        </td>
                        <td className={'' + (pendingValue == 0 && 'text-muted')}>{moment.utc(item.checkDate).local().format('LL')}</td>
                        <td>{FormatCurrency(state.currentRegion, pendingValue)}</td>
                        <td className='text-danger'>{FormatCurrency(state.currentRegion, deductions)}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
              <div className='d-flex justify-content-end align-item-center px-3 py-2'>
                <Link href={`/commercehub/checkSummary`} className='text-primary fs-7'>View More</Link>
              </div>
            </div>
          </CardBody>
        </Card>
      </Col>
    </React.Fragment>
  )
}

export default CheckNumberTable
