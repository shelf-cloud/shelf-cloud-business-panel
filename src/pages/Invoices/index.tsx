/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useContext, useMemo } from 'react'
import AppContext from '@context/AppContext'
import { GetServerSideProps } from 'next'
import axios from 'axios'
import Head from 'next/head'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.min.css'
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Col,
  Container,
  Input,
  Row,
} from 'reactstrap'
import BreadCrumb from '@components/Common/BreadCrumb'
import { getSession } from '@auth/client'
import useSWR from 'swr'
import InvoicesTable from '@components/InvoicesTable'
import { InvoiceList } from '@typings'

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
      name: string
    }
  }
}

const Invoices = ({ session }: Props) => {
  const { state }: any = useContext(AppContext)
  const [pending, setPending] = useState(true)
  const [allData, setAllData] = useState([])
  const [serachValue, setSerachValue] = useState('')

  const fetcher = (endPoint: string) => axios(endPoint).then((res) => res.data)
  const { data } = useSWR(
    state.user.businessId
      ? `/api/getBusinessInvoices?businessId=${state.user.businessId}`
      : null,
    fetcher
  )

  const filteredItems = useMemo(() => {
    return allData.filter((item: InvoiceList) =>
      item?.invoiceNumber?.toLowerCase().includes(serachValue.toLowerCase())
    )
  }, [allData, serachValue])

  useEffect(() => {
    if (data) {
      setAllData(data)
      setPending(false)
    }
  }, [data])

  const title = `Invoices | ${session?.user?.name}`
  return (
    <div>
      <Head>
        <title>{title}</title>
      </Head>
      <React.Fragment>
        <div className="page-content">
          <ToastContainer />
          <Container fluid>
            <BreadCrumb title="Invoices" pageTitle="Billing" />
            <Row>
              <Col lg={12}>
                <Card>
                  <CardHeader>
                    <form className="app-search d-flex flex-row justify-content-end align-items-center p-0">
                      <div className="position-relative">
                        <Input
                          type="text"
                          className="form-control"
                          placeholder="Search..."
                          id="search-options"
                          value={serachValue}
                          onChange={(e) => setSerachValue(e.target.value)}
                        />
                        <span className="mdi mdi-magnify search-widget-icon"></span>
                        <span
                          className="mdi mdi-close-circle search-widget-icon search-widget-icon-close d-none"
                          id="search-close-options"
                        ></span>
                      </div>
                      <Button
                        className="btn-soft-dark"
                        onClick={() => setSerachValue('')}
                      >
                        Clear
                      </Button>
                    </form>
                  </CardHeader>
                  <CardBody>
                    <InvoicesTable
                      filteredItems={filteredItems}
                      pending={pending}
                    />
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
