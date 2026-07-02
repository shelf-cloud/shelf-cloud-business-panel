import { GetServerSideProps } from 'next'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import React, { useContext, useEffect, useState } from 'react'

import BreadCrumb from '@components/Common/BreadCrumb'
import PrintInvoice from '@components/PrintInvoice'
import ShipmentDetailsModal from '@components/modals/shipments/ShipmentDetailsModal'
import StorageFeesDetailsModal from '@components/modals/shipments/StorageFeesDetailsModal'
import AppContext from '@context/AppContext'
import { FormatCurrency } from '@lib/FormatNumbers'
import { InvoiceFullDetails } from '@typings'
import axios from 'axios'
import moment from 'moment'
import { getSession } from 'next-auth/react'
import { toast } from 'react-toastify'
import useSWR from 'swr'

import { Button, Card, CardBody, CardHeader, Col, Container, Row } from '@/components/migration-ui'

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
  const { state, setShipmentDetailsModal, setStorageFeesDetailsModal }: any = useContext(AppContext)
  const { currentRegion, shipmentDetailModal, storageFeesDetailModal } = state
  const { id } = router.query
  const [loading, setloading] = useState(true)
  const [invoiceDetails, setInvoiceDetails] = useState<InvoiceFullDetails | null>()

  const fetcher = (endPoint: string) => axios(endPoint).then((res) => res.data)
  const { data } = useSWR(id ? `/api/getInvoiceDetails?region=${currentRegion}&id=${id}` : null, fetcher, {
    revalidateOnFocus: false,
  })

  useEffect(() => {
    if (data?.error) {
      setInvoiceDetails(null)
      setloading(false)
      toast.error(data?.message)
    } else if (data) {
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
        <div className='page-content'>
          <BreadCrumb title='Invoices' pageTitle='Billing' />
          <Container fluid>
            <Row>
              <Col lg={12}>
                <Card>
                  {!loading ? (
                    <>
                      <CardHeader className='tw:flex tw:flex-row tw:justify-between tw:items-start'>
                        <div>
                          <Link href={'/Invoices'}>
                            <Button
                              color='primary'
                              outline
                              // className="d-flex flex-row gap-1 text-decoration-none text-primary"
                              style={{ cursor: 'pointer' }}>
                              <span className='icon-on'>
                                <i className='ri-arrow-left-line tw:align-bottom tw:me-1' />
                                Go Back
                              </span>
                            </Button>
                          </Link>
                        </div>
                        <div className='tw:text-right tw:pe-12'>
                          <div className='tw:flex tw:gap-4 tw:flex-row tw:items-center tw:mb-4'>
                            <PrintInvoice invoiceDetails={invoiceDetails!} />
                            {currentRegion == 'us' && (
                              <a href={`${invoiceDetails?.invoice.payLink}`} target='blank' rel='noopener noreferrer'>
                                <Button className={invoiceDetails?.invoice.paid ? 'btn btn-soft-success' : 'btn btn-primary'}>
                                  {invoiceDetails?.invoice.paid ? 'View Receipt' : 'Pay Now'}
                                </Button>
                              </a>
                            )}
                          </div>
                          <h1>INVOICE</h1>
                          <h2 className='tw:text-[2.5rem] tw:font-bold' style={{ color: '#458BC9' }}>
                            {invoiceDetails?.invoice.invoiceNumber}
                          </h2>
                          <p className='tw:m-0 tw:font-semibold'>Invoice Date: {moment(invoiceDetails?.invoice.createdDate).format('LL')}</p>
                          <p className='tw:m-0 tw:font-normal'>Expire Date: {moment(invoiceDetails?.invoice.expireDate).format('LL')}</p>
                          <h4 className={invoiceDetails?.invoice?.paid ? 'tw:m-0 tw:font-bold tw:text-success' : 'tw:m-0 tw:font-bold tw:text-danger'}>
                            {invoiceDetails?.invoice?.paid ? 'Paid' : 'Due'}
                          </h4>
                        </div>
                      </CardHeader>
                      <CardBody>
                        <div className='tw:overflow-x-auto'>
                          <table className='tw:w-full tw:align-middle tw:text-center tw:[&_th]:px-2 tw:[&_th]:py-1 tw:[&_td]:px-2 tw:[&_td]:py-1 tw:[&_tbody_tr:nth-child(odd)]:bg-[color:var(--vz-light)]'>
                            <thead className='tw:text-[16.25px]'>
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
                                  <td
                                    className='tw:text-primary'
                                    style={{ cursor: 'pointer' }}
                                    onClick={
                                      order.orderType != 'Storage'
                                        ? () => setShipmentDetailsModal(true, order.orderId, order.orderNumber, order.orderType, order.orderStatus, order.orderDate, false)
                                        : () =>
                                            setStorageFeesDetailsModal(
                                              true,
                                              order.orderNumber,
                                              order.totalCharge,
                                              order.orderType,
                                              moment(order.closedDate).subtract(1, 'months').startOf('month').format('YYYY-MM-DD'),
                                              moment(order.closedDate).subtract(1, 'months').endOf('month').format('YYYY-MM-DD')
                                            )
                                    }>
                                    {order.orderNumber}
                                  </td>
                                  <td>{order.orderType}</td>
                                  <td>{moment(order.closedDate).format('LL')}</td>
                                  <td>{FormatCurrency(currentRegion, order.totalCharge)}</td>
                                </tr>
                              ))}
                            </tbody>
                            <tfoot className='tw:font-bold tw:text-[16.25px]'>
                              {currentRegion == 'us' ? (
                                <tr>
                                  <td className='tw:text-right' colSpan={3}>
                                    Total
                                  </td>
                                  <td>{FormatCurrency(currentRegion, Number(invoiceDetails?.invoice?.totalCharge))}</td>
                                </tr>
                              ) : (
                                <>
                                  <tr>
                                    <td className='tw:text-right' colSpan={3}>
                                      SubTotal
                                    </td>
                                    <td>{FormatCurrency(currentRegion, Number(invoiceDetails?.invoice?.totalCharge! / 1.21))}</td>
                                  </tr>
                                  <tr>
                                    <td className='tw:text-right' colSpan={3}>
                                      IVA 21%
                                    </td>
                                    <td>{FormatCurrency(currentRegion, Number((invoiceDetails?.invoice?.totalCharge! / 1.21) * 0.21))}</td>
                                  </tr>
                                  <tr>
                                    <td className='tw:text-right' colSpan={3}>
                                      Total
                                    </td>
                                    <td>{FormatCurrency(currentRegion, Number(invoiceDetails?.invoice?.totalCharge!))}</td>
                                  </tr>
                                </>
                              )}
                            </tfoot>
                          </table>
                        </div>
                      </CardBody>
                    </>
                  ) : (
                    <CardHeader className='tw:font-bold tw:text-[16.25px] tw:text-center'>Loading...</CardHeader>
                  )}
                </Card>
              </Col>
            </Row>
          </Container>
        </div>
      </React.Fragment>
      {shipmentDetailModal.show && <ShipmentDetailsModal />}
      {storageFeesDetailModal.show && <StorageFeesDetailsModal />}
    </div>
  )
}

export default InvoiceDetails
