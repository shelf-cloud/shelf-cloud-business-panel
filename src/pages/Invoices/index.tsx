/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useContext, useMemo } from 'react'
import AppContext from '@context/AppContext'
import { GetServerSideProps } from 'next'
import axios from 'axios'
import Head from 'next/head'
import { Button, Card, CardBody, CardHeader, Col, Container, Input, Row } from 'reactstrap'
import BreadCrumb from '@components/Common/BreadCrumb'
import { getSession } from '@auth/client'
import useSWR from 'swr'
import InvoicesTable from '@components/InvoicesTable'
import { InvoiceList } from '@typings'
import { toast } from 'react-toastify'
import InvoicesChart from '@components/InvoicesChart'

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

type Props = {
  session: {
    user: {
      businessName: string
    }
  }
}

const Invoices = ({ session }: Props) => {
  const { state }: any = useContext(AppContext)
  const [pending, setPending] = useState(true)
  const [allData, setAllData] = useState([])
  const [billingStatus, setBillingStatus] = useState([])
  const [searchValue, setSearchValue] = useState<any>('')

  const fetcher = (endPoint: string) => axios(endPoint).then((res) => res.data)
  const { data } = useSWR(
    state.user.businessId
      ? `/api/getBusinessInvoices?region=${state.currentRegion}&businessId=${state.user.businessId}`
      : null,
    fetcher
  )

  const filteredItems = useMemo(() => {
    return allData.filter((item: InvoiceList) => item?.invoiceNumber?.toLowerCase().includes(searchValue.toLowerCase()))
  }, [allData, searchValue])

  useEffect(() => {
    if (data?.error) {
      setAllData([])
      setBillingStatus([])
      setPending(false)
      toast.error(data?.message)
    } else if (data) {
      setAllData(data.invoices)
      setBillingStatus(data.billingStatus)
      setPending(false)
    }
  }, [data])

  const title = `Invoices | ${session?.user?.businessName}`
  return (
    <div>
      <Head>
        <title>{title}</title>
      </Head>
      <React.Fragment>
        <div className='page-content'>
          <Container fluid>
            <BreadCrumb title='Invoices' pageTitle='Billing' />
            <Row>
              <Col lg={12}>
                <Card>
                  <CardHeader>
                    {!pending && (
                      <>
                        <div className='col-xs-12 col-sm-6 col-lg-5 col-xl-4 col-xxl-3'>
                          <p className='text-uppercase fw-semibold text-primary text-truncate mb-0'>Billing Status</p>
                          <InvoicesChart billingStatus={billingStatus} />
                        </div>
                        <div className='app-search d-flex flex-row justify-content-end align-items-center p-0'>
                          <div className='position-relative'>
                            <Input
                              type='text'
                              className='form-control'
                              placeholder='Search...'
                              id='search-options'
                              value={searchValue}
                              onChange={(e) => setSearchValue(e.target.value)}
                            />
                            <span className='mdi mdi-magnify search-widget-icon'></span>
                            <span
                              className='mdi mdi-close-circle search-widget-icon search-widget-icon-close d-none'
                              id='search-close-options'></span>
                          </div>
                          <Button className='btn-soft-dark' onClick={() => setSearchValue('')}>
                            Clear
                          </Button>
                        </div>
                      </>
                    )}
                  </CardHeader>
                  <CardBody>
                    <InvoicesTable filteredItems={filteredItems} pending={pending} />
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

export default Invoices
