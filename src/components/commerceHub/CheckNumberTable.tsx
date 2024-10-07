import React, { useContext } from 'react'
import Link from 'next/link'
import { Card, CardBody, CardHeader, Col } from 'reactstrap'
import { FormatCurrency } from '@lib/FormatNumbers'
import AppContext from '@context/AppContext'
import { DashboardResponse } from '@typesTs/commercehub/dashboard'

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
            <h4 className='card-title mb-0 flex-grow-1'>Stock Inventory</h4>
          </CardHeader>

          <CardBody>
            <div className='table-responsive table-card'>
              <table className='table table-hover table-centered align-middle mb-0'>
                <thead>
                  <tr className='fw-semibold'>
                    <td>Store</td>
                    <td>Check Number</td>
                    <td>Orders</td>
                    <td>Paid</td>
                    <td>Pending</td>
                  </tr>
                </thead>
                <tbody>
                  {summary.invoices.map((item, key) => (
                    <tr key={key}>
                      <td>{item.storeName}</td>
                      <td>
                        {item.checkNumber ? (
                          <Link href={`/commercehub/${item.storeName}/${item.checkNumber}`}>
                            <a className='fs-6 text-primary fw-normal'>{item.checkNumber}</a>
                          </Link>
                        ) : (
                          <span className='fs-6 mw-30 text-muted fw-light fst-italic'>Pending</span>
                        )}
                      </td>
                      <td>{FormatCurrency(state.currentRegion, item.invoiceTotal)}</td>
                      <td>{FormatCurrency(state.currentRegion, item.checkTotal)}</td>
                      <td>{FormatCurrency(state.currentRegion, item.invoiceTotal - item.checkTotal > 0.1 ? item.invoiceTotal - item.checkTotal : 0)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className='fw-bold'>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td>TOTAL</td>
                    <td>
                      {FormatCurrency(
                        state.currentRegion,
                        summary.invoices.reduce((acc, invoice) => {
                          const pendingValue = parseFloat((invoice.invoiceTotal - invoice.checkTotal).toFixed(2))
                          if (pendingValue > 0.1) acc += pendingValue
                          return acc
                        }, 0)
                      )}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </CardBody>
        </Card>
      </Col>
    </React.Fragment>
  )
}

export default CheckNumberTable
