/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useContext } from 'react'
import AppContext from '@context/AppContext'
import { GetServerSideProps } from 'next'
import { OrderRowType, ShipmentOrderItem } from '@typings'
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
import Flatpickr from 'react-flatpickr'

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

const Receiving = ({ session }: Props) => {
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
  const [serachValue, setSerachValue] = useState('')

  const fetcher = (endPoint: string) => axios(endPoint).then((res) => res.data)
  const { data, error } = useSWR(
    state.user.businessId
      ? `/api/getReceivingOrders?businessId=${state.user.businessId}&startDate=${shipmentsStartDate}&endDate=${shipmentsEndDate}`
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

  const filterByText = (e: any) => {
    if (e.target.value !== '') {
      setSerachValue(e.target.value)
      const filterTable: OrderRowType[] = allData.filter(
        (order) =>
          order.orderNumber
            .toLowerCase()
            .includes(e.target.value.toLowerCase()) ||
          order.orderStatus
            .toLowerCase()
            .includes(e.target.value.toLowerCase()) ||
          order.orderType
            .toLowerCase()
            .includes(e.target.value.toLowerCase()) ||
          order.shipName.toLowerCase().includes(e.target.value.toLowerCase()) ||
          order.trackingNumber
            .toLowerCase()
            .includes(e.target.value.toLowerCase()) ||
          order.orderItems.some(
            (item: ShipmentOrderItem) =>
              item.name.toLowerCase().includes(e.target.value.toLowerCase()) ||
              item.sku.toLowerCase().includes(e.target.value.toLowerCase())
          )
      )
      setTableData(filterTable)
    } else {
      setSerachValue(e.target.value)
      setTableData(allData)
    }
  }
  const clearSearch = () => {
    setSerachValue('')
    setTableData(allData)
  }

  const handleChangeDates = (dateStr: string) => {
    if (dateStr.includes(' to ')) {
      const dates = dateStr.split(' to ')
      setShipmentsStartDate(moment(dates[0], 'DD-MM-YYYY').format('YYYY-MM-DD'))
      setShipmentsEndDate(moment(dates[1], 'DD-MM-YYYY').format('YYYY-MM-DD'))
    }
  }

  const title = `Receivings | ${session?.user?.name}`
  return (
    <div>
      <Head>
        <title>{title}</title>
      </Head>
      <React.Fragment>
        <div className="page-content">
          <ToastContainer />
          <Container fluid>
            <BreadCrumb title="Receivings" pageTitle="Receiving" />
            <Row>
              <Col lg={12}>
                <Card>
                  <CardHeader className='d-flex justify-content-between'>
                    <div className="mt-3 mt-lg-0 d-flex flex-row align-items-center">
                    <h5 className='mb-0 fw-bold text-primary me-3' style={{width: 'fit-content'}}>Filter By Dates:</h5>
                      <div className="d-flex shadow-lg">
                        <Flatpickr
                          className="form-control border-0 datePicker"
                          options={{
                            mode: 'range',
                            dateFormat: 'd/m/Y',
                            defaultDate: [
                              moment(shipmentsStartDate, 'YYYY-MM-DD').format(
                                'DD-MM-YYYY'
                              ),
                              moment(shipmentsEndDate, 'YYYY-MM-DD').format(
                                'DD-MM-YYYY'
                              ),
                            ],
                          }}
                          onChange={(selectedDates, dateStr) =>
                            handleChangeDates(dateStr)
                          }
                        />
                        <div className="input-group-text bg-primary border-primary text-white">
                          <i className="ri-calendar-2-line"></i>
                        </div>
                      </div>
                    </div>
                    <div className="app-search d-flex flex-row justify-content-end align-items-center p-0">
                      <div className="position-relative">
                        <Input
                          type="text"
                          className="form-control"
                          placeholder="Search..."
                          id="search-options"
                          value={serachValue}
                          onChange={filterByText}
                        />
                        <span className="mdi mdi-magnify search-widget-icon"></span>
                        <span
                          className="mdi mdi-close-circle search-widget-icon search-widget-icon-close d-none"
                          id="search-close-options"
                        ></span>
                      </div>
                      <Button className="btn-soft-dark" onClick={clearSearch}>
                        Clear
                      </Button>
                    </div>
                  </CardHeader>
                  <CardBody>
                    <ShipmentsTable tableData={tableData} pending={pending} />
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

export default Receiving
