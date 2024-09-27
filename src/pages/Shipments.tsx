/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useContext, useMemo } from 'react'
import AppContext from '@context/AppContext'
import { GetServerSideProps } from 'next'
import { OrderRowType, ShipmentOrderItem } from '@typings'
import axios from 'axios'
import Head from 'next/head'
import { Card, CardBody, Col, Container, Input, Row } from 'reactstrap'
import BreadCrumb from '@components/Common/BreadCrumb'
import { getSession } from '@auth/client'
import moment from 'moment'
import ShipmentsTable from '@components/ShipmentsTable'
import CreateReturnModal from '@components/CreateReturnModal'
import { toast } from 'react-toastify'
import FilterByDates from '@components/FilterByDates'
import FilterByOthers from '@components/FilterByOthers'
import useSWR from 'swr'

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

const Shipments = ({ session, sessionToken }: Props) => {
  const { state }: any = useContext(AppContext)
  const [shipmentsStartDate, setShipmentsStartDate] = useState(moment().subtract(1, 'months').format('YYYY-MM-DD'))
  const [shipmentsEndDate, setShipmentsEndDate] = useState(moment().format('YYYY-MM-DD'))
  const [pending, setPending] = useState(true)
  const [allData, setAllData] = useState<OrderRowType[]>([])
  const [searchValue, setSearchValue] = useState<any>('')
  const [searchType, setSearchType] = useState<any>('')
  const [searchStatus, setSearchStatus] = useState<any>('')
  const [searchMarketplace, setSearchMarketplace] = useState<any>('')

  const controller = new AbortController()
  const signal = controller.signal
  const fetcher = async (endPoint: string) => {
    const getShipmentOrders = toast.loading('Getting Shipments...')
    await axios(endPoint, {
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
          setAllData([])
          setPending(false)
        }
      })
    toast.update(getShipmentOrders, {
      render: 'Completed',
      type: 'success',
      isLoading: false,
      autoClose: 3000,
    })
  }
  useSWR(
    session && state.user.businessId
      ? `${process.env.NEXT_PUBLIC_SHELFCLOUD_SERVER_URL}/api/shipments/getShipmentsOrders?region=${state.currentRegion}&businessId=${state.user.businessId}&startDate=${shipmentsStartDate}&endDate=${shipmentsEndDate}`
      : null,
    fetcher,
    {
      revalidateOnFocus: false,
    }
  )

  const filterDataTable = useMemo(() => {
    if (searchValue === '' && searchType === '' && searchStatus === '' && searchMarketplace === '') {
      return allData
    }

    if (searchValue !== '') {
      let newDataTable = allData.filter(
        (order) =>
          order?.orderNumber?.toLowerCase().includes(searchValue.toLowerCase()) ||
          order?.orderStatus?.toLowerCase().includes(searchValue.toLowerCase()) ||
          order?.orderType?.toLowerCase().includes(searchValue.toLowerCase()) ||
          order?.shipName?.toLowerCase().includes(searchValue.toLowerCase()) ||
          order?.trackingNumber?.toLowerCase().includes(searchValue.toLowerCase()) ||
          order?.orderItems?.some(
            (item: ShipmentOrderItem) =>
              item?.name?.toLowerCase().includes(searchValue.toLowerCase()) ||
              searchValue.split(' ').every((word: string) => item?.name?.toLowerCase().includes(word.toLowerCase())) ||
              item?.sku?.toLowerCase().includes(searchValue.toLowerCase())
          )
      )
      if (searchType !== '') {
        newDataTable = newDataTable.filter((order) => order?.orderType?.toLowerCase().includes(searchType.toLowerCase()))
      }

      if (searchStatus !== '') {
        newDataTable = newDataTable.filter((order) => order?.orderStatus?.toLowerCase().includes(searchStatus.toLowerCase()))
      }

      if (searchMarketplace !== '') {
        newDataTable = newDataTable.filter((order) => order?.storeName?.toLowerCase() == searchMarketplace.toLowerCase())
      }

      return newDataTable
    }

    if (searchType !== '') {
      let newDataTable = allData.filter((order) => order?.orderType?.toLowerCase().includes(searchType.toLowerCase()))

      if (searchStatus !== '') {
        newDataTable = newDataTable.filter((order) => order?.orderStatus?.toLowerCase().includes(searchStatus.toLowerCase()))
      }

      if (searchMarketplace !== '') {
        newDataTable = newDataTable.filter((order) => order?.storeName?.toLowerCase() == searchMarketplace.toLowerCase())
      }

      if (searchValue !== '') {
        newDataTable = newDataTable.filter(
          (order) =>
            order?.orderNumber?.toLowerCase().includes(searchValue.toLowerCase()) ||
            order?.orderStatus?.toLowerCase().includes(searchValue.toLowerCase()) ||
            order?.orderType?.toLowerCase().includes(searchValue.toLowerCase()) ||
            order?.shipName?.toLowerCase().includes(searchValue.toLowerCase()) ||
            order?.trackingNumber?.toLowerCase().includes(searchValue.toLowerCase()) ||
            order?.orderItems?.some(
              (item: ShipmentOrderItem) =>
                item?.name?.toLowerCase().includes(searchValue.toLowerCase()) ||
                searchValue.split(' ').every((word: string) => item?.name?.toLowerCase().includes(word.toLowerCase())) ||
                item?.sku?.toLowerCase().includes(searchValue.toLowerCase())
            )
        )
      }

      return newDataTable
    }

    if (searchStatus !== '') {
      let newDataTable = allData.filter((order) => order?.orderStatus?.toLowerCase().includes(searchStatus.toLowerCase()))

      if (searchType !== '') {
        newDataTable = newDataTable.filter((order) => order?.orderType?.toLowerCase().includes(searchType.toLowerCase()))
      }

      if (searchMarketplace !== '') {
        newDataTable = newDataTable.filter((order) => order?.storeName?.toLowerCase() == searchMarketplace.toLowerCase())
      }

      if (searchValue !== '') {
        newDataTable = newDataTable.filter(
          (order) =>
            order?.orderNumber?.toLowerCase().includes(searchValue.toLowerCase()) ||
            order?.orderStatus?.toLowerCase().includes(searchValue.toLowerCase()) ||
            order?.orderType?.toLowerCase().includes(searchValue.toLowerCase()) ||
            order?.shipName?.toLowerCase().includes(searchValue.toLowerCase()) ||
            order?.trackingNumber?.toLowerCase().includes(searchValue.toLowerCase()) ||
            order?.orderItems?.some(
              (item: ShipmentOrderItem) =>
                item?.name?.toLowerCase().includes(searchValue.toLowerCase()) ||
                searchValue.split(' ').every((word: string) => item?.name?.toLowerCase().includes(word.toLowerCase())) ||
                item?.sku?.toLowerCase().includes(searchValue.toLowerCase())
            )
        )
      }

      return newDataTable
    }

    if (searchMarketplace !== '') {
      let newDataTable = allData.filter((order) => order?.storeName?.toLowerCase() == searchMarketplace.toLowerCase())

      if (searchType !== '') {
        newDataTable = newDataTable.filter((order) => order?.orderType?.toLowerCase().includes(searchType.toLowerCase()))
      }

      if (searchStatus !== '') {
        newDataTable = newDataTable.filter((order) => order?.orderStatus?.toLowerCase().includes(searchStatus.toLowerCase()))
      }

      if (searchValue !== '') {
        newDataTable = newDataTable.filter(
          (order) =>
            order?.orderNumber?.toLowerCase().includes(searchValue.toLowerCase()) ||
            order?.orderStatus?.toLowerCase().includes(searchValue.toLowerCase()) ||
            order?.orderType?.toLowerCase().includes(searchValue.toLowerCase()) ||
            order?.shipName?.toLowerCase().includes(searchValue.toLowerCase()) ||
            order?.trackingNumber?.toLowerCase().includes(searchValue.toLowerCase()) ||
            order?.orderItems?.some(
              (item: ShipmentOrderItem) =>
                item?.name?.toLowerCase().includes(searchValue.toLowerCase()) ||
                searchValue.split(' ').every((word: string) => item?.name?.toLowerCase().includes(word.toLowerCase())) ||
                item?.sku?.toLowerCase().includes(searchValue.toLowerCase())
            )
        )
      }

      return newDataTable
    }
  }, [allData, searchValue, searchType, searchStatus, searchMarketplace])

  const handleChangeDatesFromPicker = (dateStr: string) => {
    if (dateStr.includes(' to ')) {
      const dates = dateStr.split(' to ')
      setShipmentsStartDate(moment(dates[0], 'DD MMM YY').format('YYYY-MM-DD'))
      setShipmentsEndDate(moment(dates[1], 'DD MMM YY').format('YYYY-MM-DD'))
    }
  }

  const handleGetShipmentBOL = async (orderNumber: string, orderId: string) => {
    const getShipmentBOL = toast.loading('Getting Shipment BOL...')

    const response = await axios
      .get(`/api/shipments/getShipmentBOLGoFlow?region=${state.currentRegion}&businessId=${state.user.businessId}&orderId=${orderId}`)
      .then(({ data }) => data)
      .catch(({ error }) => {
        if (axios.isCancel(error)) {
          toast.error(error?.data?.message || 'Error getting BOL')
        }
      })

    if (!response.error && response.shipment.bill_of_lading.url) {
      toast.update(getShipmentBOL, {
        render: response.message,
        type: 'success',
        isLoading: false,
        autoClose: 3000,
      })
      const a = document.createElement('a')
      a.href = response.shipment.bill_of_lading.url
      a.download = orderNumber
      a.click()
    } else {
      toast.update(getShipmentBOL, {
        render: 'BOL not available',
        type: 'error',
        isLoading: false,
        autoClose: 3000,
      })
    }
  }

  const title = `Shipments | ${session?.user?.businessName}`
  return (
    <div>
      <Head>
        <title>{title}</title>
      </Head>
      <React.Fragment>
        <div className='page-content'>
          <Container fluid>
            <BreadCrumb title='Shipments' pageTitle='Orders' />
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
                    <FilterByOthers
                      searchType={searchType}
                      setSearchType={setSearchType}
                      searchStatus={searchStatus}
                      setSearchStatus={setSearchStatus}
                      searchMarketplace={searchMarketplace}
                      setSearchMarketplace={setSearchMarketplace}
                    />
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
                    <ShipmentsTable
                      tableData={filterDataTable || []}
                      pending={pending}
                      apiMutateLink={`/api/getShipmentsOrders?region=${state.currentRegion}&businessId=${state.user.businessId}&startDate=${shipmentsStartDate}&endDate=${shipmentsEndDate}`}
                      handleGetShipmentBOL={handleGetShipmentBOL}
                    />
                  </CardBody>
                </Card>
              </Col>
            </Row>
          </Container>
        </div>
      </React.Fragment>
      {state.showCreateReturnModal && (
        <CreateReturnModal
          apiMutateLink={`/api/getShipmentsOrders?region=${state.currentRegion}&businessId=${state.user.businessId}&startDate=${shipmentsStartDate}&endDate=${shipmentsEndDate}`}
        />
      )}
    </div>
  )
}

export default Shipments
