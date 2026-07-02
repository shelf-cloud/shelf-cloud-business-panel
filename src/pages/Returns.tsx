import { GetServerSideProps } from 'next'
import Head from 'next/head'
import Link from 'next/link'
import React, { useContext, useMemo, useState } from 'react'

import { getSession } from '@auth/client'
import BreadCrumb from '@components/Common/BreadCrumb'
import FilterByDates from '@components/FilterByDates'
import ExportReturns from '@components/returns/ExportReturns'
import FilterReturns from '@components/returns/FilterReturns'
import ReturnRMATable from '@components/returns/ReturnRMATable'
import SearchInput from '@components/ui/SearchInput'
import AppContext from '@context/AppContext'
import { ReturnList, ReturnOrder, ReturnType } from '@typesTs/returns/returns'
import axios from 'axios'
import moment from 'moment'
import { toast } from 'react-toastify'
import { Button, Card, CardBody, Col, Container, DropdownItem, DropdownMenu, DropdownToggle, Row, UncontrolledButtonDropdown } from '@/components/migration-ui'
import useSWR from 'swr'

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

const Returns = ({ session }: Props) => {
  const { state }: any = useContext(AppContext)
  const [shipmentsStartDate, setShipmentsStartDate] = useState(moment().subtract(2, 'months').format('YYYY-MM-DD'))
  const [shipmentsEndDate, setShipmentsEndDate] = useState(moment().format('YYYY-MM-DD'))
  const [pending, setPending] = useState(true)
  const [allData, setAllData] = useState<ReturnList>({})
  const [searchValue, setSearchValue] = useState<string>('')
  const [searchStatus, setSearchStatus] = useState<string>('')
  const [searchReason, setSearchReason] = useState<string>('')
  const [searchMarketplace, setSearchMarketplace] = useState<string>('')
  const [selectedRows, setSelectedRows] = useState<ReturnType[]>([])
  const [toggledClearRows, setToggleClearRows] = useState(false)

  const controller = new AbortController()
  const signal = controller.signal
  const fetcher = (endPoint: string) => {
    axios(endPoint, {
      signal,
    })
      .then((res) => {
        setAllData(res.data)
        setPending(false)
      })
      .catch(({ error }) => {
        if (axios.isCancel(error)) {
          toast.error('Error fetching returns Log data')
          setAllData({})
          setPending(false)
        }
      })
  }
  const { mutate } = useSWR(
    session && state.user.businessId
      ? `/api/returns/getReturnOrders?region=${state.currentRegion}&businessId=${state.user.businessId}&startDate=${shipmentsStartDate}&endDate=${shipmentsEndDate}`
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
      return Object.values(allData).filter((order: ReturnType) =>
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
        (order: ReturnType) =>
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
                  (item) =>
                    item?.name?.toLowerCase().includes(searchValue.toLowerCase()) ||
                    searchValue.split(' ').every((word) => item?.name?.toLowerCase().includes(word.toLowerCase())) ||
                    item?.sku?.toLowerCase().includes(searchValue.toLowerCase())
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
      mutate()
    } else {
      toast.error(response.data.message)
    }
  }

  const changeSelectedProductsState = async (newState: string) => {
    if (selectedRows.length <= 0) return

    const confirmationResponse = confirm(`Are you sure you want to set ${newState} selected Returned Orders?`)

    if (confirmationResponse) {
      const response = await axios.post(`api/returns/changeBulkReturnState?region=${state.currentRegion}&businessId=${state.user.businessId}`, {
        newState,
        selectedOrders: selectedRows.map((order) => {
          for (const ret of Object.values(order.returns)) {
            return ret.id
          }
        }),
      })

      if (!response.data.error) {
        setToggleClearRows(!toggledClearRows)
        setSelectedRows([])
        toast.success(response.data.message)
        mutate()
      } else {
        toast.error(response.data.message)
      }
    }
  }

  const clearAllSelectedRows = () => {
    setToggleClearRows(!toggledClearRows)
    setSelectedRows([])
  }

  const title = `Returns | ${session?.user?.businessName}`
  return (
    <div>
      <Head>
        <title>{title}</title>
      </Head>
      <React.Fragment>
        <div className='page-content'>
          <BreadCrumb title='Returns' pageTitle='Orders' />
          <Container fluid>
            <Col xs={12}>
              <Row className='flex flex-col-reverse justify-center items-end gap-2 mb-2 md:flex-row md:justify-between md:items-center'>
                <div className='flex flex-col justify-center items-end gap-2 md:flex-row md:justify-between md:items-center w-auto'>
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
                    <Button color='primary' className='text-[11.2px]'>
                      Unsellables
                    </Button>
                  </Link>
                  <ExportReturns returns={filterDataTable || []} />
                  {selectedRows.length > 0 && (
                    <UncontrolledButtonDropdown>
                      <DropdownToggle className='inline-flex h-9 items-center gap-2 rounded-md bg-primary px-3 text-[11.2px] font-medium text-primary-foreground whitespace-nowrap shadow-xs hover:bg-primary/90' caret>
                        <span className='font-bold'>{`${selectedRows.length} Order${selectedRows.length > 1 ? 's' : ''}`}</span> Selected
                      </DropdownToggle>
                      <DropdownMenu>
                        <DropdownItem header>Actions</DropdownItem>
                        <DropdownItem className='whitespace-nowrap capitalize text-[11.2px]' onClick={() => changeSelectedProductsState('complete')}>
                          <i className='mdi mdi-check-circle-outline text-[16.25px] text-success align-middle m-0 p-0' /> set complete
                        </DropdownItem>
                        <DropdownItem className='whitespace-nowrap capitalize text-[11.2px]' onClick={() => changeSelectedProductsState('pending')}>
                          <i className='mdi mdi-backup-restore text-[16.25px] text-warning align-middle m-0 p-0' /> set pending
                        </DropdownItem>
                        <DropdownItem className='whitespace-nowrap text-right text-[11.2px] text-[var(--bs-secondary-color)]' onClick={clearAllSelectedRows}>
                          Clear All
                        </DropdownItem>
                      </DropdownMenu>
                    </UncontrolledButtonDropdown>
                  )}
                </div>
                <SearchInput searchValue={searchValue} setSearchValue={setSearchValue} background='white' minLength={2} />
              </Row>
              <Card>
                <CardBody>
                  <ReturnRMATable
                    filterDataTable={filterDataTable || []}
                    pending={pending}
                    apiMutateLink={`/api/returns/getReturnOrders?region=${state.currentRegion}&businessId=${state.user.businessId}&startDate=${shipmentsStartDate}&endDate=${shipmentsEndDate}`}
                    handleReturnStateChange={handleReturnStateChange}
                    setSelectedRows={setSelectedRows}
                    toggledClearRows={toggledClearRows}
                  />
                </CardBody>
              </Card>
            </Col>
          </Container>
        </div>
      </React.Fragment>
    </div>
  )
}

export default Returns
