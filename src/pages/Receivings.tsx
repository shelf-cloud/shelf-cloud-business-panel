/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useContext } from 'react'
import AppContext from '@context/AppContext'
import { GetServerSideProps } from 'next'
import { OrderRowType, ShipmentOrderItem } from '@typings'
import axios from 'axios'
import Head from 'next/head'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.min.css'
import {
  Card,
  CardBody,
  Col,
  Container,
  Input,
  Row,
} from 'reactstrap'
import BreadCrumb from '@components/Common/BreadCrumb'
import { getSession } from '@auth/client'
import useSWR from 'swr'
import moment from 'moment'
import Flatpickr from 'react-flatpickr'
import ReceivingTable from '@components/ReceivingTable'

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
  const { data } = useSWR(
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
          order?.orderNumber
            ?.toLowerCase()
            .includes(e.target.value.toLowerCase()) ||
          order?.orderStatus
            ?.toLowerCase()
            .includes(e.target.value.toLowerCase()) ||
          order?.orderType
            ?.toLowerCase()
            .includes(e.target.value.toLowerCase()) ||
          order?.shipName
            ?.toLowerCase()
            .includes(e.target.value.toLowerCase()) ||
          order?.trackingNumber
            ?.toLowerCase()
            .includes(e.target.value.toLowerCase()) ||
          order?.orderItems?.some(
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
      setShipmentsStartDate(moment(dates[0], 'MMM DD').format('YYYY-MM-DD'))
      setShipmentsEndDate(moment(dates[1], 'MMM DD').format('YYYY-MM-DD'))
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
                <Row className="d-flex flex-column-reverse justify-content-center align-items-end gap-2 mb-3 flex-md-row justify-content-md-between align-items-md-center">
                  <div className="col-sm-12 col-md-3">
                    <form className="app-search d-flex flex-row justify-content-end align-items-center p-0">
                      <div
                        className="position-relative d-flex rounded-3 w-100 overflow-hidden input_background_white"
                      >
                        <Input
                          type="text"
                          className="form-control input_background_white"
                          placeholder="Search..."
                          id="search-options"
                          value={serachValue}
                          onChange={filterByText}
                        />
                        <span className="mdi mdi-magnify search-widget-icon fs-4"></span>
                        <span
                          className="d-flex align-items-center justify-content-center input_background_white"
                          style={{
                            cursor: 'pointer',
                          }}
                          onClick={clearSearch}
                        >
                          <i className="mdi mdi-window-close fs-4 m-0 px-2 py-0 text-muted" />
                        </span>
                      </div>
                    </form>
                  </div>
                  <div className='w-auto'>
                    <div
                      className="d-flex flex-row align-items-center justify-content-between w-auto px-3 rounded-3"
                      style={{
                        backgroundColor: 'white',
                        minWidth: '200px',
                        border: '1px solid #E1E3E5',
                      }}
                    >
                      <i className="ri-calendar-2-line fs-5 me-2" />
                      <Flatpickr
                        className="border-0 fs-6 w-100 py-2"
                        options={{
                          mode: 'range',
                          dateFormat: 'M d',
                          defaultDate: [
                            moment(shipmentsStartDate, 'YYYY-MM-DD').format(
                              'MMM DD'
                            ),
                            moment(shipmentsEndDate, 'YYYY-MM-DD').format(
                              'MMM DD'
                            ),
                          ],
                        }}
                        onChange={(_selectedDates, dateStr) =>
                          handleChangeDates(dateStr)
                        }
                      />
                      <i className="ri-arrow-down-s-line" />
                    </div>
                  </div>
                </Row>
                <Card>
                  <CardBody>
                    <ReceivingTable tableData={tableData} pending={pending} />
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
