/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useContext } from 'react'
import AppContext from '@context/AppContext'
import { GetServerSideProps } from 'next'
import { OrderRowType } from '@typings'
import axios from 'axios'
import Head from 'next/head'
import { ToastContainer, toast } from 'react-toastify'
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
import moment from 'moment'
import ShipmentsTable from '@components/ShipmentsTable'

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

const Shipments = ({ session }: Props) => {
  const { state }: any = useContext(AppContext)
  const [shipmentsStartDate, setShipmentsStartDate] = useState(
    moment().subtract(30, 'days').format('YYYY-MM-DD')
  )
  const [shipmentsEndDate, setShipmentsEndDate] = useState(
    moment().format('YYYY-MM-DD')
  )
  const [pending, setPending] = useState(true)
  const [allData, setAllData] = useState<OrderRowType[]>([])
  const [tableData, setTableData] = useState<OrderRowType[]>([])
  // const [serachValue, setSerachValue] = useState('')

  const fetcher = (endPoint: string) => axios(endPoint).then((res) => res.data)
  const { data, error } = useSWR(
    state.user.businessId
      ? `/api/getShipmentsOrders?businessId=${state.user.businessId}&startDate=${shipmentsStartDate}&endDate=${shipmentsEndDate}`
      : null,
    fetcher
  )

  useEffect(() => {
    if (data) {
      setTableData(data)
      setAllData(data)
      setPending(false)
    }
  }, [data])

  //   const filterByText = (e: any) => {
  //     if (e.target.value !== '') {
  //       setSerachValue(e.target.value)
  //       const filterTable = allData.filter(
  //         (item) =>
  //           item.Title.toLowerCase().includes(e.target.value.toLowerCase()) ||
  //           item.SKU.toLowerCase().includes(e.target.value.toLowerCase()) ||
  //           item.ASIN.toLowerCase().includes(e.target.value.toLowerCase()) ||
  //           item.FNSKU.toLowerCase().includes(e.target.value.toLowerCase()) ||
  //           item.Barcode.toLowerCase().includes(e.target.value.toLowerCase())
  //       )
  //       setTableData(filterTable)
  //     } else {
  //       setSerachValue(e.target.value)
  //       setTableData(allData)
  //     }
  //   }
  //   const clearSearch = () => {
  //     setSerachValue('')
  //     setTableData(allData)
  //   }

  const title = `Shipments | ${session?.user?.name}`
  return (
    <div>
      <Head>
        <title>{title}</title>
      </Head>
      <React.Fragment>
        <div className="page-content">
          <ToastContainer />
          <Container fluid>
            <BreadCrumb title="Shipments" pageTitle="Shipments" />
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
                          //   value={serachValue}
                          //   onChange={filterByText}
                        />
                        <span className="mdi mdi-magnify search-widget-icon"></span>
                        <span
                          className="mdi mdi-close-circle search-widget-icon search-widget-icon-close d-none"
                          id="search-close-options"
                        ></span>
                      </div>
                      <Button
                        className="btn-soft-dark"
                        //   onClick={clearSearch}
                      >
                        Clear
                      </Button>
                    </form>
                  </CardHeader>
                  <CardBody>
                    <ShipmentsTable
                      tableData={tableData}
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

export default Shipments
