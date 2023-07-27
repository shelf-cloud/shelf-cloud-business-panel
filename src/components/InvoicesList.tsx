import React, { useContext } from 'react'
import { Button, Card, CardBody, CardHeader, Col } from 'reactstrap'
import { InvoiceList } from '@typings'
import CountUp from 'react-countup'
import moment from 'moment'
import Link from 'next/link'
import AppContext from '@context/AppContext'

type Props = {
  invoices: InvoiceList[] | undefined
}

const InvoicesList = ({ invoices }: Props) => {
  const { state }: any = useContext(AppContext)
  const today = moment().format('YYYY-MM-DD')

  return (
    <React.Fragment>
      <Col>
        <Card>
          <CardHeader className='align-items-center d-flex'>
            <h4 className='card-title mb-0 flex-grow-1'>Invoices</h4>
          </CardHeader>

          <CardBody>
            <div className='table-responsive table-card'>
              <table className='table table-sm table-hover table-centered align-middle table-nowrap mb-0'>
                <thead>
                  <tr className='text-center'>
                    <th>Invoice #</th>
                    <th>Total Charge</th>
                    <th>Expire Date</th>
                    <th>Status</th>
                    {state.currentRegion == 'us' && <th>Payments</th>}
                  </tr>
                </thead>
                <tbody>
                  {invoices?.map((invoice) => (
                    <tr key={invoice.invoiceNumber}>
                      <td>
                        <Link href={`/Invoices/${invoice.idOfInvoice}`}>
                          <h5 className='fs-14 my-1 text-secondary text-center' style={{ cursor: 'pointer' }}>
                            {invoice.invoiceNumber}
                          </h5>
                        </Link>
                      </td>
                      <td>
                        <h5 className='fs-14 my-1 fw-normal text-center'>
                          <CountUp
                            start={0}
                            prefix={state.currentRegion == 'us' ? '$ ' : ''}
                            suffix={state.currentRegion == 'eu' ? ' €' : ''}
                            separator={state.currentRegion == 'us' ? '.' : ','}
                            end={invoice.totalCharge || 0}
                            decimals={2}
                            duration={1}
                          />
                        </h5>
                      </td>
                      <td className='text-center'>
                        <span
                          className={
                            invoice.paid
                              ? 'fs-14 my-1 text-muted'
                              : moment(today).isAfter(invoice.expireDate)
                              ? 'fs-14 my-1 text-danger'
                              : 'fs-14 my-1 text-muted'
                          }>
                          {moment(invoice.expireDate, 'YYYY-MM-DD').format('LL')}
                        </span>
                      </td>
                      <td>
                        <div
                          className='text-center px-2 py-1 rounded-2'
                          style={{ background: 'rgba(49, 154, 246, 0.1)' }}>
                          <span
                            className={
                              invoice.paid
                                ? 'fs-6 my-1 text-success'
                                : moment(today).isAfter(invoice.expireDate)
                                ? 'fs-6 my-1 text-danger'
                                : 'fs-6 my-1'
                            }>
                            {invoice.paid
                              ? 'Paid'
                              : moment(today).isAfter(invoice.expireDate)
                              ? `Past Due ${moment(invoice.expireDate).fromNow(true)}`
                              : moment(today).isSame(invoice.expireDate)
                              ? 'Due Today'
                              : `Due in ${moment(invoice.expireDate).fromNow(true)}`}
                          </span>
                        </div>
                      </td>
                      {state.currentRegion == 'us' &&  <td className='text-center'>
                        <a href={`${invoice.payLink}`} target='blank'>
                          <Button className={'px-2 py-1 ' + (invoice.paid ? 'btn btn-soft-success' : 'btn btn-primary')}>
                            {invoice.paid ? 'View Receipt' : 'Pay Now'}
                          </Button>
                        </a>
                      </td>}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardBody>
        </Card>
      </Col>
    </React.Fragment>
  )
}

export default InvoicesList
