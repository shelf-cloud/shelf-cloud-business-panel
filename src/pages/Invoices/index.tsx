/* eslint-disable react-hooks/exhaustive-deps */
import { GetServerSideProps } from 'next'
import Head from 'next/head'
import React, { useContext, useEffect, useMemo, useState } from 'react'

import { getSession } from '@auth/client'
import BreadCrumb from '@components/Common/BreadCrumb'
import InvoicesChart from '@components/InvoicesChart'
import InvoicesTable from '@components/InvoicesTable'
import AppContext from '@context/AppContext'
import { InvoiceList } from '@typings'
import axios from 'axios'
import { toast } from 'react-toastify'
import { Button, Card, CardBody, CardHeader, Col, Container, Input, Row } from 'reactstrap'
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
  const { data } = useSWR(state.user.businessId ? `/api/getBusinessInvoices?region=${state.currentRegion}&businessId=${state.user.businessId}` : null, fetcher)

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
          <BreadCrumb title='Invoices' pageTitle='Billing' />
          <Container fluid>
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
                            <span className='mdi mdi-close-circle search-widget-icon search-widget-icon-close d-none' id='search-close-options'></span>
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
