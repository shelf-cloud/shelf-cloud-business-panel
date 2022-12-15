/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useContext, useMemo } from 'react'
import AppContext from '@context/AppContext'
import { GetServerSideProps } from 'next'
import { OrderRowType, ShipmentOrderItem } from '@typings'
import axios from 'axios'
import Head from 'next/head'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.min.css'
import { Card, CardBody, Col, Container, Input, Row } from 'reactstrap'
import BreadCrumb from '@components/Common/BreadCrumb'
import { getSession } from '@auth/client'
import useSWR from 'swr'
import moment from 'moment'
import ShipmentsTable from '@components/ShipmentsTable'
import Flatpickr from 'react-flatpickr'
import CreateReturnModal from '@components/CreateReturnModal'

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
  const [searchValue, setSearchValue] = useState<any>('')
  const [searchType, setSearchType] = useState<String>('')

  const fetcher = (endPoint: string) => axios(endPoint).then((res) => res.data)
  const { data } = useSWR(
    state.user.businessId
      ? `/api/getShipmentsOrders?businessId=${state.user.businessId}&startDate=${shipmentsStartDate}&endDate=${shipmentsEndDate}`
      : null,
    fetcher
  )

  useEffect(() => {
    if (data) {
      setAllData(data)
      setPending(false)
    }
  }, [data])

  const filterDataTable = useMemo(() => {
    if (searchValue === '' && searchType === '') {
      return allData
    }

    if (searchValue !== '') {
      const newDataTable = allData.filter(
        (order) =>
          order?.orderNumber
            ?.toLowerCase()
            .includes(searchValue.toLowerCase()) ||
          order?.orderStatus
            ?.toLowerCase()
            .includes(searchValue.toLowerCase()) ||
          order?.orderType?.toLowerCase().includes(searchValue.toLowerCase()) ||
          order?.shipName?.toLowerCase().includes(searchValue.toLowerCase()) ||
          order?.trackingNumber
            ?.toLowerCase()
            .includes(searchValue.toLowerCase()) ||
          order?.orderItems?.some(
            (item: ShipmentOrderItem) =>
              item?.name?.toLowerCase().includes(searchValue.toLowerCase()) ||
              item?.sku?.toLowerCase().includes(searchValue.toLowerCase())
          )
      )
      if (searchType !== '') {
        return newDataTable.filter((order) =>
          order?.orderType?.toLowerCase().includes(searchType.toLowerCase())
        )
      } else {
        return newDataTable
      }
    }

    if (searchType !== '') {
      const newDataTable = allData.filter((order) =>
        order?.orderType?.toLowerCase().includes(searchType.toLowerCase())
      )
      if (searchValue !== '') {
        return newDataTable.filter(
          (order) =>
            order?.orderNumber
              ?.toLowerCase()
              .includes(searchValue.toLowerCase()) ||
            order?.orderStatus
              ?.toLowerCase()
              .includes(searchValue.toLowerCase()) ||
            order?.orderType
              ?.toLowerCase()
              .includes(searchValue.toLowerCase()) ||
            order?.shipName
              ?.toLowerCase()
              .includes(searchValue.toLowerCase()) ||
            order?.trackingNumber
              ?.toLowerCase()
              .includes(searchValue.toLowerCase()) ||
            order?.orderItems?.some(
              (item: ShipmentOrderItem) =>
                item?.name?.toLowerCase().includes(searchValue.toLowerCase()) ||
                item?.sku?.toLowerCase().includes(searchValue.toLowerCase())
            )
        )
      } else {
        return newDataTable
      }
    }
  }, [allData, searchValue, searchType])

  const handleChangeDates = (dateStr: string) => {
    if (dateStr.includes(' to ')) {
      const dates = dateStr.split(' to ')
      setShipmentsStartDate(moment(dates[0], 'MMM DD').format('YYYY-MM-DD'))
      setShipmentsEndDate(moment(dates[1], 'MMM DD').format('YYYY-MM-DD'))
    }
  }

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
                <Row className="d-flex flex-column-reverse justify-content-center align-items-end gap-2 mb-3 flex-md-row justify-content-md-between align-items-md-center">
                  <div className="col-sm-12 col-md-3">
                    <form className="app-search d-flex flex-row justify-content-end align-items-center p-0">
                      <div
                        className="position-relative d-flex rounded-3 w-100 overflow-hidden"
                        style={{ border: '1px solid #E1E3E5' }}
                      >
                        <Input
                          type="text"
                          className="form-control input_background_white"
                          placeholder="Search..."
                          id="search-options"
                          value={searchValue}
                          onChange={(e) => setSearchValue(e.target.value)}
                        />
                        <span className="mdi mdi-magnify search-widget-icon fs-4"></span>
                        <span
                          className="d-flex align-items-center justify-content-center input_background_white"
                          style={{
                            cursor: 'pointer',
                          }}
                          onClick={() => setSearchValue('')}
                        >
                          <i className="mdi mdi-window-close fs-4 m-0 px-2 py-0 text-muted" />
                        </span>
                      </div>
                    </form>
                  </div>
                  <div className="d-flex flex-column justify-content-center align-items-end gap-2 flex-md-row justify-content-md-between align-items-md-center w-auto">
                    <div
                      className="d-flex flex-row align-items-center justify-content-between gap-2 w-auto px-3 rounded-3"
                      style={{ backgroundColor: 'white', minWidth: '200px', border: '1px solid #E1E3E5' }}
                    >
                      <i className="ri-calendar-2-line fs-5" />
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
                    <div
                      className="d-flex flex-row align-items-center justify-content-between gap-2 w-auto px-3 py-0 rounded-3"
                      style={{ backgroundColor: 'white', minWidth: '200px', border: '1px solid #E1E3E5' }}
                    >
                      <i className="ri-truck-line fs-5" />
                      <Input
                        type="select"
                        className="border-0 fs-6 w-100"
                        id="type"
                        name="type"
                        onChange={(e) => setSearchType(e.target.value)}
                      >
                        <option value="">All Types</option>
                        <option value="Wholesale">Wholesale</option>
                        <option value="Shipment">Shipment</option>
                        <option value="Return">Return</option>
                      </Input>
                    </div>
                  </div>
                </Row>
                <Card>
                  <CardBody>
                    <ShipmentsTable
                      tableData={filterDataTable || []}
                      pending={pending}
                      apiMutateLink={`/api/getShipmentsOrders?businessId=${state.user.businessId}&startDate=${shipmentsStartDate}&endDate=${shipmentsEndDate}`}
                    />
                  </CardBody>
                </Card>
              </Col>
            </Row>
          </Container>
        </div>
      </React.Fragment>
      {state.showCreateReturnModal && <CreateReturnModal apiMutateLink={`/api/getShipmentsOrders?businessId=${state.user.businessId}&startDate=${shipmentsStartDate}&endDate=${shipmentsEndDate}`}/>}
    </div>
  )
}

export default Shipments
