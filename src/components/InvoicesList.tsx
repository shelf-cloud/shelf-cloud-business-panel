import React from 'react'
import { Card, CardBody, CardHeader, Col } from 'reactstrap'
import { InvoiceList } from '@typings'
import CountUp from 'react-countup'
import moment from 'moment'

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
                <tbody>
                  {invoices?.map((invoice) => (
                    <tr key={invoice.invoiceNumber}>
                      <td>
                        <div className="d-flex align-items-center">
                          <h5 className="fs-14 my-1">
                            {invoice.invoiceNumber}
                          </h5>
                        </div>
                      </td>
                      <td>
                        <h5 className="fs-14 my-1 fw-normal">
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
                        <div className="d-flex align-items-center">
                          <h5
                            className={
                              moment(today).isAfter(invoice.expireDate)
                                ? 'fs-14 my-1 text-danger'
                                : 'fs-14 my-1'
                            }
                          >
                            {moment(invoice.expireDate, 'YYYY-MM-DD').format(
                              'DD/MM/YYYY'
                            )}
                          </h5>
                        </div>
                      </td>
                      <td>
                        <div className="d-flex align-items-center">
                          <h5 className={invoice.paid ? 'fs-14 my-1 text-success' : 'fs-14 my-1 text-danger'}>
                            {invoice.paid ? 'Paid' : 'Due'}
                          </h5>
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
