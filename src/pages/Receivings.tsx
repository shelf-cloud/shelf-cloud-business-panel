/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useContext } from 'react'
import AppContext from '@context/AppContext'
import { GetServerSideProps } from 'next'
import { OrderRowType, ShipmentOrderItem } from '@typings'
import axios from 'axios'
import Head from 'next/head'
import { Card, CardBody, Container } from 'reactstrap'
import BreadCrumb from '@components/Common/BreadCrumb'
import { getSession } from '@auth/client'
import useSWR from 'swr'
import moment from 'moment'
import ReceivingTable from '@components/receiving/ReceivingTable'
import { toast } from 'react-toastify'
import FilterByDates from '@components/FilterByDates'
import { DebounceInput } from 'react-debounce-input'

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
  const { data, mutate: mutateReceivings } = useSWR(
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
            <div className='d-flex flex-column justify-content-center align-items-end gap-2 mb-1 flex-lg-row justify-content-md-between align-items-md-center px-1'>
              <div className='w-100 d-flex flex-column justify-content-center align-items-start gap-2 mb-0 flex-lg-row justify-content-lg-start align-items-lg-center px-0'>
                <FilterByDates
                  shipmentsStartDate={shipmentsStartDate}
                  setShipmentsStartDate={setShipmentsStartDate}
                  setShipmentsEndDate={setShipmentsEndDate}
                  shipmentsEndDate={shipmentsEndDate}
                  handleChangeDatesFromPicker={handleChangeDatesFromPicker}
                />
              </div>
              <div className='w-100 d-flex flex-column-reverse justify-content-center align-items-start gap-2 mb-0 flex-lg-row justify-content-lg-end align-items-lg-center px-0'>
                <div className='app-search p-0 col-sm-12 col-lg-5'>
                  <div className='position-relative d-flex rounded-3 w-100 overflow-hidden' style={{ border: '1px solid #E1E3E5' }}>
                    <DebounceInput
                      type='text'
                      minLength={1}
                      debounceTimeout={500}
                      className='form-control input_background_white fs-6'
                      placeholder='Search...'
                      id='search-options'
                      value={searchValue}
                      onKeyDown={(e) => e.key == 'Enter' && e.preventDefault()}
                      onChange={(e) => filterByText(e)}
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
            </div>
            <Card>
              <CardBody className='fs-7'>
                <ReceivingTable tableData={tableData} pending={pending} mutateReceivings={mutateReceivings} />
              </CardBody>
            </Card>
          </Container>
        </div>
      </React.Fragment>
    </div>
  )
}

export default Receiving
