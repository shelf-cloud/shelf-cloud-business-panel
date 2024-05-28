/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useContext, useMemo } from 'react'
import AppContext from '@context/AppContext'
import { GetServerSideProps } from 'next'
import axios from 'axios'
import Head from 'next/head'
import { Button, Card, CardBody, Col, Container, Input, Row } from 'reactstrap'
import BreadCrumb from '@components/Common/BreadCrumb'
import { getSession } from '@auth/client'
import moment from 'moment'
import { toast } from 'react-toastify'
import FilterByDates from '@components/FilterByDates'
import FilterReturns from '@components/returns/FilterReturns'
import { ReturnList, ReturnOrder, ReturnsType } from '@typesTs/returns/returns'
import ReturnRMATable from '@components/returns/ReturnRMATable'
import useSWR, { useSWRConfig } from 'swr'
import Link from 'next/link'

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
      name: string
    }
  }
}

const Returns = ({ session, sessionToken }: Props) => {
  const { state }: any = useContext(AppContext)
  const { mutate } = useSWRConfig()
  const [shipmentsStartDate, setShipmentsStartDate] = useState(moment().subtract(3, 'months').format('YYYY-MM-DD'))
  const [shipmentsEndDate, setShipmentsEndDate] = useState(moment().format('YYYY-MM-DD'))
  const [pending, setPending] = useState(true)
  const [allData, setAllData] = useState<ReturnList>({})
  const [searchValue, setSearchValue] = useState<string>('')
  const [searchStatus, setSearchStatus] = useState<string>('')
  const [searchReason, setSearchReason] = useState<string>('')
  const [searchMarketplace, setSearchMarketplace] = useState<string>('')

  const controller = new AbortController()
  const signal = controller.signal
  const fetcher = (endPoint: string) => {
    axios(endPoint, {
      signal,
      headers: {
        Authorization: `Bearer ${sessionToken}`,
      },
    })
      .then((res) => {
        setAllData(res.data)
        setPending(false)
      })
      .catch(({ error }) => {
        if (axios.isCancel(error)) {
          toast.error(error?.data?.message || 'Error fetching shipment Log data')
          setAllData({})
          setPending(false)
        }
      })
  }
  useSWR(
    session && state.user.businessId
      ? `${process.env.NEXT_PUBLIC_SHELFCLOUD_SERVER_URL}/api/shipments/getReturnOrders?region=${state.currentRegion}&businessId=${state.user.businessId}&startDate=${shipmentsStartDate}&endDate=${shipmentsEndDate}`
      : null,
    fetcher,
    {
      revalidateOnFocus: false,
    }
  )

  const filterDataTable = useMemo(() => {
    if (searchValue === '' && searchStatus === '' && searchReason === '' && searchMarketplace === '') {
      return Object.values(allData)
    }

    if (searchValue === '') {
      return Object.values(allData).filter((order: ReturnsType) =>
        Object.values(order?.returns).some(
          (returnOrder: ReturnOrder) =>
            (searchStatus !== '' ? returnOrder?.orderStatus?.toLowerCase().includes(searchStatus.toLowerCase()) : true) &&
            (searchReason !== '' ? returnOrder?.returnReason?.toLowerCase() === searchReason.toLowerCase() : true) &&
            (searchMarketplace !== '' ? returnOrder?.storeName?.toLowerCase() === searchMarketplace.toLowerCase() : true)
        )
      )
    }

    if (searchValue !== '') {
      return Object.values(allData).filter(
        (order: ReturnsType) =>
          order.shipmentOrderNumber?.toLowerCase().includes(searchValue.toLowerCase()) ||
          Object.values(order?.returns).some(
            (returnOrder: ReturnOrder) =>
              (searchStatus !== '' ? returnOrder?.orderStatus?.toLowerCase().includes(searchStatus.toLowerCase()) : true) &&
              (searchReason !== '' ? returnOrder?.returnReason?.toLowerCase() === searchReason.toLowerCase() : true) &&
              (searchMarketplace !== '' ? returnOrder?.storeName?.toLowerCase() === searchMarketplace.toLowerCase() : true) &&
              (returnOrder?.orderNumber?.toLowerCase().includes(searchValue.toLowerCase()) ||
                returnOrder?.orderStatus?.toLowerCase().includes(searchValue.toLowerCase()) ||
                returnOrder?.orderType?.toLowerCase().includes(searchValue.toLowerCase()) ||
                returnOrder?.shipName?.toLowerCase().includes(searchValue.toLowerCase()) ||
                returnOrder?.trackingNumber?.toLowerCase().includes(searchValue.toLowerCase()) ||
                returnOrder?.orderItems?.some(
                  (item) => item?.name?.toLowerCase().includes(searchValue.toLowerCase()) || item?.sku?.toLowerCase().includes(searchValue.toLowerCase())
                ))
          )
      )
    }
  }, [allData, searchValue, searchStatus, searchReason, searchMarketplace])

  const handleChangeDatesFromPicker = (dateStr: string) => {
    if (dateStr.includes(' to ')) {
      const dates = dateStr.split(' to ')
      setShipmentsStartDate(moment(dates[0], 'DD MMM YY').format('YYYY-MM-DD'))
      setShipmentsEndDate(moment(dates[1], 'DD MMM YY').format('YYYY-MM-DD'))
    }
  }

  const handleReturnStateChange = async (newState: string, orderId: number) => {
    const response = await axios.post(`api/returns/changeReturnState?region=${state.currentRegion}&businessId=${state.user.businessId}`, {
      newState,
      orderId,
    })

    if (!response.data.error) {
      toast.success(response.data.message)
      mutate(
        `${process.env.NEXT_PUBLIC_SHELFCLOUD_SERVER_URL}/api/shipments/getReturnOrders?region=${state.currentRegion}&businessId=${state.user.businessId}&startDate=${shipmentsStartDate}&endDate=${shipmentsEndDate}`
      )
    } else {
      toast.error(response.data.message)
    }
  }

  const title = `Returns | ${session?.user?.name}`
  return (
    <div>
      <Head>
        <title>{title}</title>
      </Head>
      <React.Fragment>
        <div className='page-content'>
          <Container fluid>
            <BreadCrumb title='Returns' pageTitle='Orders' />
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
                    <FilterReturns
                      searchStatus={searchStatus}
                      setSearchStatus={setSearchStatus}
                      searchReason={searchReason}
                      setSearchReason={setSearchReason}
                      searchMarketplace={searchMarketplace}
                      setSearchMarketplace={setSearchMarketplace}
                    />
                    <Link href='/returns/Unsellables'>
                      <Button className='btn btn-primary'>Unsellables</Button>
                    </Link>
                  </div>
                  <div className='col-sm-12 col-md-3'>
                    <div className='app-search d-flex flex-row justify-content-end align-items-center p-0'>
                      <div className='position-relative d-flex rounded-3 w-100 overflow-hidden' style={{ border: '1px solid #E1E3E5' }}>
                        <Input
                          type='text'
                          className='form-control input_background_white'
                          placeholder='Search...'
                          id='search-options'
                          value={searchValue}
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
                    <ReturnRMATable
                      filterDataTable={filterDataTable || []}
                      pending={pending}
                      apiMutateLink={`${process.env.NEXT_PUBLIC_SHELFCLOUD_SERVER_URL}/api/shipments/getReturnOrders?region=${state.currentRegion}&businessId=${state.user.businessId}&startDate=${shipmentsStartDate}&endDate=${shipmentsEndDate}`}
                      handleReturnStateChange={handleReturnStateChange}
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

export default Returns
