import BreadCrumb from '@components/Common/BreadCrumb'
import { FormatCurrency } from '@lib/FormatNumbers'
import { InvoiceFullDetails } from '@typings'
import axios from 'axios'
import { GetServerSideProps } from 'next'
import { getSession } from 'next-auth/react'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'
import { Card, CardBody, CardHeader, Col, Container, Row } from 'reactstrap'
import useSWR from 'swr'

export const getServerSideProps: GetServerSideProps<{}> = async (context) => {
  const session = await getSession(context)

  if (session == null) {
    return {
      redirect: {
        destination: '/api/auth/signin',
        permanent: false,
      },
    }
  }
  return {
    props: { session },
  }
}

const InvoiceDetails = () => {
  const router = useRouter()
  const { id } = router.query
  const [loading, setloading] = useState(true)
  const [invoiceDetails, setInvoiceDetails] = useState<InvoiceFullDetails>()

  const fetcher = (endPoint: string) => axios(endPoint).then((res) => res.data)
  const { data } = useSWR(
    id ? `/api/getInvoiceDetails?id=${id}` : null,
    fetcher
  )

  useEffect(() => {
    if (data) {
      setInvoiceDetails(data)
      setloading(false)
    }
  }, [data])

  const title = `Invoice # ${invoiceDetails?.invoice.invoiceNumber}`
  return (
    <div>
      <Head>
        <title>{title}</title>
      </Head>
      <React.Fragment>
        <div className="page-content">
          <Container fluid>
            <BreadCrumb title="Invoices" pageTitle="Billing" />
            <Row>
              <Col lg={12}>
                <Card>
                  <CardHeader className="d-flex flex-row justify-content-between align-items-start">
                    <div>
                      <Link href={'/Invoices'}>
                        <div className='d-flex flex-row gap-1 text-decoration-none text-primary' style={{cursor: 'pointer'}}>
                        <i className='ri-arrow-left-line' />Go Back
                        </div>
                      </Link>
                    </div>
                    <div className="text-end pe-5">
                      <h1>INVOICE</h1>
                      <h2 className="fs-1 fw-bold" style={{ color: '#458BC9' }}>
                        {invoiceDetails?.invoice.invoiceNumber}
                      </h2>
                      <p className="m-0 fw-semibold">
                        Invoice Date: {invoiceDetails?.invoice.createdDate}
                      </p>
                      <p className="m-0 fw-normal">
                        Expire Date: {invoiceDetails?.invoice.expireDate}
                      </p>
                    </div>
                  </CardHeader>
                  <CardBody>
                    {!loading && (
                      <table className="table text-center table-striped-columns">
                        <thead className="fs-5">
                          <tr>
                            <th>ORDER #</th>
                            <th>TYPE</th>
                            <th>DATE CLOSED</th>
                            <th>ORDER TOTAL CHARGE</th>
                          </tr>
                        </thead>
                        <tbody>
                          {invoiceDetails?.orders.map((order) => (
                            <tr key={order.orderNumber}>
                              <td>{order.orderNumber}</td>
                              <td>{order.orderType}</td>
                              <td>{order.closedDate}</td>
                              <td>{FormatCurrency.format(order.totalCharge)}</td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot className="fw-bold fs-5">
                          <tr>
                            <td className="text-end" colSpan={3}>
                              Total
                            </td>
                            <td>
                              {FormatCurrency.format(
                                Number(invoiceDetails?.invoice?.totalCharge)
                              )}
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    )}
                  </CardBody>
                </Card>
              </Col>
            </Row>
          </Container>
        </div>
      </React.Fragment>
    </div>
  )
}

export default InvoiceDetails
