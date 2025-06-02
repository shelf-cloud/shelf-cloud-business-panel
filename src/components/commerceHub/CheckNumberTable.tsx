/* eslint-disable @next/next/no-img-element */
import React, { useContext } from 'react'
import Link from 'next/link'
import { Card, CardBody, CardHeader, Col } from 'reactstrap'
import { FormatCurrency } from '@lib/FormatNumbers'
import AppContext from '@context/AppContext'
import { DashboardResponse } from '@typesTs/commercehub/dashboard'
import moment from 'moment'
import { NoImageAdress } from '@lib/assetsConstants'
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
          <CardHeader className='align-items-center d-flex justify-content-between'>
            <h4 className='card-title mb-0 flex-grow-1'>Check Summary</h4>
          </CardHeader>

          <CardBody>
            <div className='table-responsive table-card'>
              <table className='table table-sm table-hover table-centered align-middle mb-0'>
                <thead>
                  <tr className='fw-semibold'>
                    <td>Store</td>
                    <td>Check Number</td>
                    <td>Check Date</td>
                    <td>Total Paid</td>
                    <td>Deductions</td>
                  </tr>
                </thead>
                <tbody className='fs-7'>
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
                            <Link
                              href={`/commercehub/${item.storeName}/${item.checkNumber}`}
                              className='fs-7 text-primary fw-normal'>
                              {item.checkNumber}
                            </Link>
                          ) : (
                            <span className='fs-6 mw-30 text-muted fw-light fst-italic'>Pending</span>
                          )}
                        </td>
                        <td>{moment.utc(item.checkDate).local().format('LL')}</td>
                        <td>{FormatCurrency(state.currentRegion, totalPaid)}</td>
                        <td className='text-danger'>{FormatCurrency(state.currentRegion, deductions)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <div className='d-flex justify-content-end align-item-center px-3 py-2'>
                <Link href={`/commercehub/checkSummary`} className='text-primary fs-7'>
                  View More
                </Link>
              </div>
            </div>
          </CardBody>
        </Card>
      </Col>
    </React.Fragment>
  );
}

export default CheckNumberTable
