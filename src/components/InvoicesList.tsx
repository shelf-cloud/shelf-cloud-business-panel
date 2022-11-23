import React from 'react'
import { Card, CardBody, CardHeader, Col } from 'reactstrap'
import { InvoiceList } from '@typings'
import CountUp from 'react-countup'
import moment from 'moment'
import Link from 'next/link'

type Props = {
  invoices: InvoiceList[] | undefined
}

const InvoicesList = ({ invoices }: Props) => {
  const today = moment().format('YYYY-MM-DD')

  return (
    <React.Fragment>
      <Col>
        <Card>
          <CardHeader className="align-items-center d-flex">
            <h4 className="card-title mb-0 flex-grow-1">Invoices</h4>
          </CardHeader>

          <CardBody>
            <div className="table-responsive table-card">
              <table className="table table-sm table-hover table-centered align-middle table-nowrap mb-0">
                <thead>
                  <tr>
                    <th>Invoice #</th>
                    <th>Total Charge</th>
                    <th>Expire Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices?.map((invoice) => (
                    <tr key={invoice.invoiceNumber}>
                      <td>
                        <Link href={`/Invoices/${invoice.idOfInvoice}`}>
                          <h5
                            className="fs-14 my-1 text-secondary"
                            style={{ cursor: 'pointer' }}
                          >
                            {invoice.invoiceNumber}
                          </h5>
                        </Link>
                      </td>
                      <td>
                        <h5 className="fs-14 my-1 fw-normal text-start">
                          <CountUp
                            start={0}
                            prefix={'$ '}
                            // suffix={item.suffix}
                            separator={'.'}
                            end={invoice.totalCharge || 0}
                            decimals={2}
                            duration={1}
                          />
                        </h5>
                      </td>
                      <td>
                        <span
                          className={
                            invoice.paid
                              ? 'fs-14 my-1 text-muted'
                              : moment(today).isAfter(invoice.expireDate)
                              ? 'fs-14 my-1 text-danger'
                              : 'fs-14 my-1 text-muted'
                          }
                        >
                          {moment(invoice.expireDate, 'YYYY-MM-DD').format(
                            'LL'
                          )}
                        </span>
                      </td>
                      <td>
                        <div className='text-center px-2 py-1 rounded-2' style={{background: 'rgba(49, 154, 246, 0.1)'}}>
                          <span
                            className={
                              invoice.paid
                                ? 'fs-6 my-1 text-success'
                                : moment(today).isAfter(invoice.expireDate)
                                ? 'fs-6 my-1 text-danger'
                                : 'fs-6 my-1'
                            }
                          >
                            {invoice.paid
                              ? 'Paid'
                              : moment(today).isAfter(invoice.expireDate)
                              ? `Past Due ${moment(invoice.expireDate).fromNow(
                                  true
                                )}`
                              : moment(today).isSame(invoice.expireDate)
                              ? 'Due Today'
                              : `Due in ${moment(invoice.expireDate).fromNow(
                                  true
                                )}`}
                          </span>
                        </div>
                      </td>
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
