/* eslint-disable react-hooks/exhaustive-deps */
import React, { useContext, useEffect, useMemo, useState } from 'react'
import AppContext from '@context/AppContext'
import { GetServerSideProps } from 'next'
import { getSession } from '@auth/client'
import Head from 'next/head'
import BreadCrumb from '@components/Common/BreadCrumb'
import { Card, CardBody, Col, Container, Row } from 'reactstrap'
import moment from 'moment'
import FilterByDates from '@components/FilterByDates'
import axios from 'axios'
import { DebounceInput } from 'react-debounce-input'
import { FBAOrder } from '@typesTs/amazon/orders'
import SellerFbaOrdersTable from '@components/amazon/orders/sellerFbaOrdersTable'
import FilterFBAOrders from '@components/ui/FilterFBAOrders'
import { toast } from 'react-toastify'

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
      await axios(`${process.env.NEXT_PUBLIC_SHELFCLOUD_SERVER_URL}/api/amazon/getSellerOrders?region=${state.currentRegion}&businessId=${state.user.businessId}&startDate=${startDate}&endDate=${endDate}`, {
        signal,
        headers: {
          Authorization: `Bearer ${sessionToken}`,
        },
      })
        .then((res) => {
          res.data.error ? setOrdersData([]) : setOrdersData(res.data.orders as FBAOrder[])
          setLoadingData(false)
        })
        .catch(({ error }) => {
          if (axios.isCancel(error)) {
            toast.error(error?.data?.message || 'Error fetching product performance data')
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
            (item.amazonOrderId.toLowerCase().includes(searchValue.toLowerCase()) || item.fulfillmentChannel.toLowerCase().includes(searchValue.toLowerCase()) || item.salesChannel.toLowerCase().includes(searchValue.toLowerCase()))) ||
          item.orderItems.some(
            (orderItem) => orderItem.sku.toLowerCase().includes(searchValue.toLowerCase()) || orderItem.asin.toLowerCase().includes(searchValue.toLowerCase()) || orderItem?.shelfcloud_sku?.toLowerCase().includes(searchValue.toLowerCase())
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
                <Row className='d-flex flex-column-reverse justify-content-center align-items-end gap-2 mb-1 flex-md-row justify-content-md-end align-items-md-center px-3'>
                  <div className='app-search d-flex flex-row justify-content-between align-items-center p-0'>
                    <div className='d-flex flex-column justify-content-center align-items-end gap-2 flex-md-row justify-content-md-between align-items-md-center w-auto'>
                      <FilterByDates shipmentsStartDate={startDate} setShipmentsStartDate={setStartDate} setShipmentsEndDate={setEndDate} shipmentsEndDate={endDate} handleChangeDatesFromPicker={handleChangeDatesFromPicker} />
                      <FilterFBAOrders orderStatus={orderStatus} setOrderStatus={setOrderStatus} />
                    </div>
                    <div className='col-sm-12 col-md-3'>
                      <div className='position-relative d-flex rounded-3 w-100 overflow-hidden' style={{ border: '1px solid #E1E3E5' }}>
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
                          className='d-flex align-items-center justify-content-center input_background_white'
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
