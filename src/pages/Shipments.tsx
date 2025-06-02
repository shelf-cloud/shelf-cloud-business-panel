/* eslint-disable react-hooks/exhaustive-deps */
import { GetServerSideProps } from 'next'
import Head from 'next/head'
import React, { useCallback, useContext, useMemo, useRef, useState } from 'react'

import { getSession } from '@auth/client'
import BreadCrumb from '@components/Common/BreadCrumb'
import { SelectSingleValueType } from '@components/Common/SimpleSelect'
import FilterByDates from '@components/FilterByDates'
import FilterByOthers from '@components/FilterByOthers'
import ShipmentDetailsModal from '@components/modals/shipments/ShipmentDetailsModal'
import ShipmentsTable from '@components/shipments/shipmentLog/ShipmentsTable'
import SearchInput from '@components/ui/SearchInput'
import AppContext from '@context/AppContext'
import { Shipment } from '@typesTs/shipments/shipments'
import axios from 'axios'
import moment from 'moment'
import { toast } from 'react-toastify'
import { Button, Card, CardBody, Container, Spinner } from 'reactstrap'
import useSWRInfinite from 'swr/infinite'

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

const ITEMS_PER_PAGE = 100

const fetcher = async (url: string) => {
  const data = await axios.get(url).then((res) => res.data)
  return data
}

const Shipments = ({ session }: Props) => {
  const { state }: any = useContext(AppContext)
  const { currentRegion, user, shipmentDetailModal } = state
  const [startDate, setStartDate] = useState<string>('')
  const [endDate, setEndDate] = useState<string>('')
  const [searchValue, setSearchValue] = useState<string>('')
  const [searchType, setSearchType] = useState<SelectSingleValueType>({ value: '', label: 'All' })
  const [searchStatus, setSearchStatus] = useState<SelectSingleValueType>({ value: '', label: 'All' })
  const [searchMarketplace, setSearchMarketplace] = useState<SelectSingleValueType>({ value: '', label: 'All Stores' })
  const [searchSku, setSearchSku] = useState<SelectSingleValueType>({ value: '', label: 'All' })
  const [carrierStatus, setcarrierStatus] = useState<SelectSingleValueType>({ value: '', label: 'All' })
  const [sortBy, setSortBy] = useState({
    key: '',
    asc: false,
  })

  const getKey = (pageIndex: number, previousPageData: Shipment[]) => {
    if (!currentRegion || !user.businessId) return null // No region or business

    if (previousPageData && !previousPageData.length) return null // No more data to fetch

    let url = `/api/shipments/getShipments?region=${currentRegion}&businessId=${user.businessId}&offset=${pageIndex * ITEMS_PER_PAGE}&limit=${ITEMS_PER_PAGE}`

    // Append filters if they exist
    if (searchValue) url += `&search=${encodeURIComponent(searchValue)}`
    if (startDate) url += `&startDate=${startDate}`
    if (endDate) url += `&endDate=${endDate}`
    if (searchType!.value !== '') url += `&orderType=${searchType!.value}`
    if (searchStatus!.value !== '') url += `&orderStatus=${searchStatus!.value}`
    if (searchMarketplace!.value !== '') url += `&storeId=${searchMarketplace!.value}`
    if (searchSku!.value !== '') url += `&sku=${searchSku!.value}`
    if (carrierStatus!.value !== '') url += `&carrierStatus=${carrierStatus!.value}`
    if (sortBy.key !== '') url += `&sortBy=${sortBy.key}&direction=${sortBy.asc ? 'ASC' : 'DESC'}`

    return url
  }

  const {
    data,
    size,
    setSize,
    isValidating,
    mutate: mutateShipments,
  } = useSWRInfinite(getKey, fetcher, {
    revalidateOnMount: true,
    revalidateFirstPage: false,
    revalidateOnFocus: false,
  })

  // Flatten invoices data
  const shipments: Shipment[] = useMemo(() => (data ? ([] as Shipment[]).concat(...data) : []), [data])

  // Observer for infinite scroll
  const observer = useRef<IntersectionObserver | null>(null)
  const lastInvoiceElementRef = useCallback(
    (node: HTMLElement | null) => {
      if (isValidating) return
      if (observer.current) observer.current.disconnect()

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && data && data[data.length - 1].length === ITEMS_PER_PAGE) {
          setSize(size + 1)
        }
      })

      if (node) observer.current.observe(node)
    },
    [isValidating, setSize, data, size]
  )

  const clearFilters = () => {
    setSearchValue('')
    setStartDate('')
    setEndDate('')
    setSearchType({ value: '', label: 'All' })
    setSearchStatus({ value: '', label: 'All' })
    setSearchSku({ value: '', label: 'All' })
    setcarrierStatus({ value: '', label: 'All' })
    setSearchMarketplace({ value: '', label: 'All Stores' })
    setSize(1) // Reset to page 1
    mutateShipments() // Refetch the initial data set
  }

  const handleChangeDatesFromPicker = (dateStr: string) => {
    if (dateStr.includes(' to ')) {
      const dates = dateStr.split(' to ')
      setStartDate(moment(dates[0], 'DD MMM YY').format('YYYY-MM-DD'))
      setEndDate(moment(dates[1], 'DD MMM YY').format('YYYY-MM-DD'))
    }
  }

  const hasActiveFilters = useMemo(
    () =>
      searchValue !== '' ||
      startDate !== '' ||
      endDate !== '' ||
      searchType!.value !== '' ||
      searchStatus!.value !== '' ||
      searchMarketplace!.value !== '' ||
      searchSku!.value !== '' ||
      carrierStatus!.value !== '',
    [searchValue, startDate, endDate, searchType, searchStatus, searchMarketplace, searchSku, carrierStatus]
  )

  const handleGetShipmentBOL = async (orderNumber: string, orderId: string, documentType: string) => {
    const getShipmentBOL = toast.loading('Getting Shipment Document...')

    try {
      const response = await axios
        .get(`/api/shipments/getShipmentBOLGoFlow?region=${currentRegion}&businessId=${user.businessId}&orderId=${orderId}`)
        .then(({ data }) => data)
        .catch(({ error }) => {
          if (axios.isCancel(error)) {
            toast.update(getShipmentBOL, {
              render: 'Error getting Document',
              type: 'error',
              isLoading: false,
              autoClose: 3000,
            })
          }
        })

      switch (documentType) {
        case 'bill_of_lading':
          if (!response.error && response.shipment[documentType].url) {
            toast.update(getShipmentBOL, {
              render: response.message,
              type: 'success',
              isLoading: false,
              autoClose: 3000,
            })
            const a = document.createElement('a')
            a.href = response.shipment[documentType].url
            a.download = orderNumber
            a.click()
          } else {
            toast.update(getShipmentBOL, {
              render: 'Document not available',
              type: 'error',
              isLoading: false,
              autoClose: 3000,
            })
          }
          break
        case 'carton_labels':
          if (!response.error && response.shipment[documentType].all.url) {
            toast.update(getShipmentBOL, {
              render: response.message,
              type: 'success',
              isLoading: false,
              autoClose: 3000,
            })
            const a = document.createElement('a')
            a.href = response.shipment[documentType].all.url
            a.download = orderNumber
            a.click()
          } else {
            toast.update(getShipmentBOL, {
              render: 'Document not available',
              type: 'error',
              isLoading: false,
              autoClose: 3000,
            })
          }
          break
        default:
          toast.update(getShipmentBOL, {
            render: 'Document not available',
            type: 'error',
            isLoading: false,
            autoClose: 3000,
          })
          break
      }
    } catch (error) {
      toast.update(getShipmentBOL, {
        render: 'Document not available',
        type: 'warning',
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
          <BreadCrumb title='Shipments' pageTitle='Orders' />
          <Container fluid>
            <div className='d-flex flex-column justify-content-center align-items-end gap-2 mb-2 flex-lg-row justify-content-md-between align-items-md-center px-1'>
              <div className='w-100 d-flex flex-column justify-content-center align-items-start gap-2 mb-0 flex-lg-row justify-content-lg-start align-items-lg-center px-0'>
                <FilterByDates
                  shipmentsStartDate={startDate}
                  setShipmentsStartDate={setStartDate}
                  setShipmentsEndDate={setEndDate}
                  shipmentsEndDate={endDate}
                  handleChangeDatesFromPicker={handleChangeDatesFromPicker}
                />
                <FilterByOthers
                  searchType={searchType}
                  setSearchType={setSearchType}
                  searchStatus={searchStatus}
                  setSearchStatus={setSearchStatus}
                  searchMarketplace={searchMarketplace}
                  setSearchMarketplace={setSearchMarketplace}
                  searchSku={searchSku}
                  setSearchSku={setSearchSku}
                  carrierStatus={carrierStatus}
                  setcarrierStatus={setcarrierStatus}
                />
              </div>
              <div className='w-100 d-flex flex-column-reverse justify-content-center align-items-start gap-2 mb-0 flex-lg-row justify-content-lg-end align-items-lg-center px-0'>
                <SearchInput searchValue={searchValue} setSearchValue={setSearchValue} background='white' minLength={3} widths='col-12 col-md-6' />

                <Button disabled={!hasActiveFilters} color={hasActiveFilters ? 'primary' : 'light'} className='fs-7 text-nowrap' onClick={clearFilters}>
                  Clear Filters
                </Button>
              </div>
            </div>
            <Card>
              <CardBody>
                <ShipmentsTable tableData={shipments} pending={isValidating && size === 1} sortBy={sortBy} setSortBy={setSortBy} handleGetShipmentBOL={handleGetShipmentBOL} />
                <div ref={lastInvoiceElementRef} style={{ height: '20px', marginTop: '10px' }}>
                  {isValidating && size > 1 && (
                    <p className='text-center'>
                      <Spinner size='sm' color='primary' /> Loading more shipments...
                    </p>
                  )}
                </div>
              </CardBody>
            </Card>
          </Container>
        </div>
      </React.Fragment>
      {shipmentDetailModal.show && <ShipmentDetailsModal mutateShipments={mutateShipments} />}
    </div>
  )
}

export default Shipments
