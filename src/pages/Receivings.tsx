/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useContext } from 'react'
import AppContext from '@context/AppContext'
import { GetServerSideProps } from 'next'
import { OrderRowType, ShipmentOrderItem } from '@typings'
import axios from 'axios'
import Head from 'next/head'
import { Card, CardBody, Col, Container, Input, Row } from 'reactstrap'
import BreadCrumb from '@components/Common/BreadCrumb'
import { getSession } from '@auth/client'
import useSWR from 'swr'
import moment from 'moment'
import ReceivingTable from '@components/ReceivingTable'
import { toast } from 'react-toastify'
import FilterByDates from '@components/FilterByDates'

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

const Receiving = ({ session }: Props) => {
  const { state }: any = useContext(AppContext)
  const [shipmentsStartDate, setShipmentsStartDate] = useState(moment().subtract(3, 'months').format('YYYY-MM-DD'))
  const [shipmentsEndDate, setShipmentsEndDate] = useState(moment().format('YYYY-MM-DD'))
  const [pending, setPending] = useState(true)
  const [allData, setAllData] = useState<OrderRowType[]>([])
  const [tableData, setTableData] = useState<OrderRowType[]>([])
  const [searchValue, setSearchValue] = useState<string>('')

  const fetcher = (endPoint: string) => axios(endPoint).then((res) => res.data)
  const { data } = useSWR(
    state.user.businessId
      ? `/api/getReceivingOrders?region=${state.currentRegion}&businessId=${state.user.businessId}&startDate=${shipmentsStartDate}&endDate=${shipmentsEndDate}`
      : null,
    fetcher,
    {
      revalidateOnFocus: false,
    }
  )

  useEffect(() => {
    if (data?.error) {
      setAllData([])
      setPending(false)
      toast.error(data?.message)
    } else if (data) {
      setTableData(data)
      setAllData(data)
      setPending(false)
    }
  }, [data])

  const filterByText = (e: any) => {
    if (e.target.value !== '') {
      setSearchValue(e.target.value)
      const filterTable: OrderRowType[] = allData.filter(
        (order) =>
          order?.orderNumber?.toLowerCase().includes(e.target.value.toLowerCase()) ||
          order?.orderStatus?.toLowerCase().includes(e.target.value.toLowerCase()) ||
          order?.orderType?.toLowerCase().includes(e.target.value.toLowerCase()) ||
          order?.shipName?.toLowerCase().includes(e.target.value.toLowerCase()) ||
          order?.trackingNumber?.toLowerCase().includes(e.target.value.toLowerCase()) ||
          order?.orderItems?.some(
            (item: ShipmentOrderItem) =>
              item.name.toLowerCase().includes(e.target.value.toLowerCase()) ||
              searchValue.split(' ').every((word) => item?.name?.toLowerCase().includes(word.toLowerCase())) ||
              item.sku.toLowerCase().includes(e.target.value.toLowerCase())
          )
      )
      setTableData(filterTable)
    } else {
      setSearchValue(e.target.value)
      setTableData(allData)
    }
  }

  const clearSearch = () => {
    setSearchValue('')
    setTableData(allData)
  }

  const handleChangeDatesFromPicker = (dateStr: string) => {
    if (dateStr.includes(' to ')) {
      const dates = dateStr.split(' to ')
      setShipmentsStartDate(moment(dates[0], 'DD MMM YY').format('YYYY-MM-DD'))
      setShipmentsEndDate(moment(dates[1], 'DD MMM YY').format('YYYY-MM-DD'))
    }
  }

  const title = `Receivings | ${session?.user?.businessName}`
  return (
    <div>
      <Head>
        <title>{title}</title>
      </Head>
      <React.Fragment>
        <div className='page-content'>
          <Container fluid>
            <BreadCrumb title='Receivings' pageTitle='Inbound' />
            <Row>
              <Col lg={12}>
                <Row className='d-flex flex-column-reverse justify-content-center align-items-end gap-2 mb-1 flex-md-row justify-content-md-between align-items-md-center'>
                  <div className='d-flex flex-column justify-content-center align-items-end gap-2 flex-md-row justify-content-md-between align-items-md-center w-auto'>
                    <FilterByDates
                      shipmentsStartDate={shipmentsStartDate}
                      setShipmentsStartDate={setShipmentsStartDate}
                      setShipmentsEndDate={setShipmentsEndDate}
                      shipmentsEndDate={shipmentsEndDate}
                      handleChangeDatesFromPicker={handleChangeDatesFromPicker}
                    />
                  </div>

                  <div className='col-sm-12 col-md-3'>
                    <div className='app-search d-flex flex-row justify-content-end align-items-center p-0'>
                      <div className='position-relative d-flex rounded-3 w-100 overflow-hidden input_background_white'>
                        <Input
                          type='text'
                          className='form-control input_background_white'
                          placeholder='Search...'
                          id='search-options'
                          value={searchValue}
                          onChange={filterByText}
                        />
                        <span className='mdi mdi-magnify search-widget-icon fs-4'></span>
                        <span
                          className='d-flex align-items-center justify-content-center input_background_white'
                          style={{
                            cursor: 'pointer',
                          }}
                          onClick={clearSearch}>
                          <i className='mdi mdi-window-close fs-4 m-0 px-2 py-0 text-muted' />
                        </span>
                      </div>
                    </div>
                  </div>
                </Row>
                <Card>
                  <CardBody>
                    <ReceivingTable
                      tableData={tableData}
                      pending={pending}
                      apiMutateLink={`/api/getReceivingOrders?region=${state.currentRegion}&businessId=${state.user.businessId}&startDate=${shipmentsStartDate}&endDate=${shipmentsEndDate}`}
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

export default Receiving
