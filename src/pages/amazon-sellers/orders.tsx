/* eslint-disable react-hooks/exhaustive-deps */
import { GetServerSideProps } from 'next'
import Head from 'next/head'
import React, { useContext, useEffect, useMemo, useState } from 'react'

import { getSession } from '@auth/client'
import BreadCrumb from '@components/Common/BreadCrumb'
import FilterByDates from '@components/FilterByDates'
import SellerFbaOrdersTable from '@components/amazon/orders/sellerFbaOrdersTable'
import FilterFBAOrders from '@components/ui/FilterFBAOrders'
import AppContext from '@context/AppContext'
import { FBAOrder } from '@typesTs/amazon/orders'
import axios from 'axios'
import moment from 'moment'
import { DebounceInput } from 'react-debounce-input'
import { toast } from 'react-toastify'
import { Card, CardBody, Col, Container, Row } from '@/components/migration-ui'

export const getServerSideProps: GetServerSideProps<{}> = async (context) => {
  const sessionToken = context.req.cookies['next-auth.session-token'] ? context.req.cookies['next-auth.session-token'] : context.req.cookies['__Secure-next-auth.session-token']
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
    props: { session, sessionToken },
  }
}

type Props = {
  sessionToken: string
  session: {
    user: {
      businessName: string
    }
  }
}

const Orders = ({ session, sessionToken }: Props) => {
  const { state }: any = useContext(AppContext)
  const [startDate, setStartDate] = useState(moment().subtract(1, 'months').format('YYYY-MM-DD'))
  const [endDate, setEndDate] = useState(moment().format('YYYY-MM-DD'))
  const [loadingData, setLoadingData] = useState(true)
  const [searchValue, setSearchValue] = useState<any>('')
  const [orderStatus, setOrderStatus] = useState<string>('All')
  const [ordersData, setOrdersData] = useState<FBAOrder[]>([])

  useEffect(() => {
    const controller = new AbortController()
    const signal = controller.signal

    const getNewDateRange = async () => {
      setLoadingData(true)
      await axios(
        `${process.env.NEXT_PUBLIC_SHELFCLOUD_SERVER_URL}/api/amazon/getSellerOrders?region=${state.currentRegion}&businessId=${state.user.businessId}&startDate=${startDate}&endDate=${endDate}`,
        {
          signal,
          headers: {
            Authorization: `Bearer ${sessionToken}`,
          },
        }
      )
        .then((res) => {
          res.data.error ? setOrdersData([]) : setOrdersData(res.data.orders as FBAOrder[])
          setLoadingData(false)
        })
        .catch(({ error }) => {
          if (axios.isCancel(error)) {
            toast.error('Error fetching product performance data')
            setOrdersData([])
          }
        })
    }
    if (session && state.user.businessId) getNewDateRange()

    return () => {
      controller.abort()
    }
  }, [session, state.user.businessId, endDate])

  const filterDataTable = useMemo(() => {
    // if (!ordersData || ordersData?.error) {
    //   return []
    // }

    if (searchValue === '') {
      return ordersData?.filter((item) => (orderStatus === 'All' ? true : item.orderStatus === orderStatus))
    }

    if (searchValue !== '') {
      const newDataTable = ordersData?.filter(
        (item) =>
          ((orderStatus === 'All' ? true : item.orderStatus === orderStatus) &&
            (item.amazonOrderId.toLowerCase().includes(searchValue.toLowerCase()) ||
              item.fulfillmentChannel.toLowerCase().includes(searchValue.toLowerCase()) ||
              item.salesChannel.toLowerCase().includes(searchValue.toLowerCase()))) ||
          item.orderItems.some(
            (orderItem) =>
              orderItem.sku.toLowerCase().includes(searchValue.toLowerCase()) ||
              orderItem.asin.toLowerCase().includes(searchValue.toLowerCase()) ||
              orderItem?.shelfcloud_sku?.toLowerCase().includes(searchValue.toLowerCase())
          )
      )
      return newDataTable
    }
  }, [ordersData, searchValue, orderStatus])

  const handleChangeDatesFromPicker = (dateStr: string) => {
    if (dateStr.includes(' to ')) {
      const dates = dateStr.split(' to ')
      setStartDate(moment(dates[0], 'DD MMM YY').format('YYYY-MM-DD'))
      setEndDate(moment(dates[1], 'DD MMM YY').format('YYYY-MM-DD'))
    }
  }

  const title = `FBA Orders | ${session?.user?.businessName}`
  return (
    <div>
      <Head>
        <title>{title}</title>
      </Head>
      <React.Fragment>
        <div className='page-content'>
          <BreadCrumb title='FBA Orders' pageTitle='Amazon' />
          <Container fluid>
            <Row>
              <Col lg={12}>
                <Row className='tw:flex tw:flex-col-reverse tw:justify-center tw:items-end tw:gap-2 tw:mb-1 tw:md:tw:flex-row tw:md:justify-end tw:md:items-center tw:px-6'>
                  <div className='app-search tw:flex tw:flex-row tw:justify-between tw:items-center tw:p-0'>
                    <div className='tw:flex tw:flex-col tw:justify-center tw:items-end tw:gap-2 tw:md:tw:flex-row tw:md:justify-between tw:md:items-center tw:w-auto'>
                      <FilterByDates
                        shipmentsStartDate={startDate}
                        setShipmentsStartDate={setStartDate}
                        setShipmentsEndDate={setEndDate}
                        shipmentsEndDate={endDate}
                        handleChangeDatesFromPicker={handleChangeDatesFromPicker}
                      />
                      <FilterFBAOrders orderStatus={orderStatus} setOrderStatus={setOrderStatus} />
                    </div>
                    <div className='tw:w-full tw:md:w-1/4'>
                      <div className='tw:relative tw:flex tw:rounded-lg tw:w-full tw:overflow-hidden' style={{ border: '1px solid #E1E3E5' }}>
                        <DebounceInput
                          type='text'
                          minLength={3}
                          debounceTimeout={300}
                          className='form-control input_background_white'
                          placeholder='Search...'
                          id='search-options'
                          value={searchValue}
                          onKeyDown={(e) => (e.key == 'Enter' ? e.preventDefault() : null)}
                          onChange={(e) => setSearchValue(e.target.value)}
                        />
                        <span className='mdi mdi-magnify search-widget-icon fs-4'></span>
                        <span
                          className='tw:flex tw:items-center tw:justify-center input_background_white'
                          style={{
                            cursor: 'pointer',
                          }}
                          onClick={() => setSearchValue('')}>
                          <i className='mdi mdi-window-close fs-4 m-0 px-2 py-0 text-muted' />
                        </span>
                      </div>
                    </div>
                  </div>
                </Row>
                <Card>
                  <CardBody>
                    <SellerFbaOrdersTable tableData={filterDataTable || []} pending={loadingData} />
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

export default Orders
