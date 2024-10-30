import React, { useCallback, useContext, useMemo, useRef, useState } from 'react'
import AppContext from '@context/AppContext'
import { GetServerSideProps } from 'next'
import Head from 'next/head'
import { Button, Card, CardBody, Container, Spinner } from 'reactstrap'
import BreadCrumb from '@components/Common/BreadCrumb'
import { getSession } from '@auth/client'
import axios from 'axios'
import useSWRInfinite from 'swr/infinite'
import { CommerceHubStoresResponse, Invoice, InvoicesResponse } from '@typesTs/commercehub/invoices'
import InvoicesTable from '@components/commerceHub/InvoicesTable'
import { DebounceInput } from 'react-debounce-input'
import FilterByDates from '@components/FilterByDates'
import moment from 'moment'
import UpdateInvoicesModal from '@components/modals/commercehub/UpdateInvoicesModal'
import FilterCommerceHubInvoices from '@components/commerceHub/FilterCommerceHubInvoices'
import useSWR from 'swr'
import { toast } from 'react-toastify'
import BulkActionsForSelected from '@components/commerceHub/BulkActionsForSelected'
import { generateDocument } from '@lib/commerceHub/getDocument'

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
      businessOrderStart: string
    }
  }
}

const ITEMS_PER_PAGE = 100
const STATUS_OPTIONS = [
  { value: 'paid', label: 'Paid' },
  { value: 'unpaid', label: 'Unpaid' },
  // { value: 'overdue', label: 'Overdue' },
  { value: 'reviewing', label: 'Reviewing' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'closed', label: 'Closed' },
]

const fetcher = async (url: string) => {
  const data = await axios.get<InvoicesResponse>(url).then((res) => res.data)
  return data.invoices
}

const fetcherStores = async (endPoint: string) => await axios.get<CommerceHubStoresResponse>(endPoint).then((res) => res.data)

const Invoices = ({ session, sessionToken }: Props) => {
  const title = `Commerce HUB Invoices | ${session?.user?.businessName}`
  const { state }: any = useContext(AppContext)
  const [searchValue, setSearchValue] = useState<string>('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [filters, setfilters] = useState({
    onlyOverdue: false,
    showOverdue: true,
    store: { value: 'all', label: 'All' },
    status: { value: 'all', label: 'All' },
    showStaus: true,
  })
  const [daysOverdue, setdaysOverdue] = useState(0)
  const [showUpdateInvoices, setshowUpdateInvoices] = useState({
    show: false,
  })
  const [sortBy, setSortBy] = useState({
    key: 'closedDate',
    asc: false,
  })

  const [selectedRows, setSelectedRows] = useState<Invoice[]>([])
  const [toggledClearRows, setToggleClearRows] = useState(false)

  const { data: stores } = useSWR(state.user.businessId ? `/api/commerceHub/getStores?region=${state.currentRegion}&businessId=${state.user.businessId}` : null, fetcherStores, {
    revalidateOnFocus: false,
  })

  const getKey = (pageIndex: number, previousPageData: Invoice[]) => {
    if (!state.currentRegion || !state.user.businessId) return null // No region or business

    if (previousPageData && !previousPageData.length) return null // No more data to fetch

    let url = `/api/commerceHub/getInvoices?region=${state.currentRegion}&businessId=${state.user.businessId}&offset=${pageIndex * ITEMS_PER_PAGE}&limit=${ITEMS_PER_PAGE}`

    // Append filters if they exist
    if (searchValue) url += `&search=${encodeURIComponent(searchValue)}`
    if (startDate) url += `&startDate=${startDate}`
    if (endDate) url += `&endDate=${endDate}`
    if (filters.onlyOverdue) url += `&onlyOverdue=${filters.onlyOverdue}`
    if (filters.store.value !== 'all') url += `&store=${filters.store.value}`
    if (filters.status.value !== 'all') url += `&status=${filters.status.value}`
    if (daysOverdue > 0) url += `&daysOverdue=${daysOverdue}`
    url += `&sortBy=${sortBy.key}&direction=${sortBy.asc ? 'ASC' : 'DESC'}`

    return url
  }

  const { data, size, setSize, isValidating, mutate } = useSWRInfinite(getKey, fetcher, {
    revalidateFirstPage: false, // Prevent re-fetching of the first page when setting a new size
    revalidateOnFocus: false, // Prevent re-fetching on window focus
  })

  // Flatten invoices data
  const invoices: Invoice[] = useMemo(() => (data ? ([] as Invoice[]).concat(...data) : []), [data])

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

  // const applyFilters = () => {
  //   mutate() // Refetch data with updated filters
  // }

  const clearFilters = () => {
    setSearchValue('')
    setStartDate('')
    setEndDate('')
    setfilters(() => ({ onlyOverdue: false, showOverdue: true, store: { value: 'all', label: 'All' }, status: { value: 'all', label: 'All' }, showStaus: true }))
    setSize(1) // Reset to page 1
    mutate() // Refetch the initial data set
  }

  const changeSelectedStatus = async (status: string) => {
    if (selectedRows.length <= 0) return

    const cleanSelectedRows = selectedRows.map((row) => {
      return { orderId: row.orderId, order: true, commerceHubId: row.id, commerceHub: false }
    })

    const response = await axios
      .post(`/api/commerceHub/updateOrderStaus?region=${state.currentRegion}&businessId=${state.user.businessId}`, {
        newStatus: status,
        selectedRows: cleanSelectedRows,
      })
      .then((res) => res.data)

    if (!response.error) {
      setToggleClearRows(!toggledClearRows)
      setSelectedRows([])
      toast.success(response.message)
      mutate()
    } else {
      toast.error(response.message)
    }
  }

  const clearAllSelectedRows = () => {
    setToggleClearRows(!toggledClearRows)
    setSelectedRows([])
  }

  const handleChangeDatesFromPicker = (dateStr: string) => {
    if (dateStr.includes(' to ')) {
      const dates = dateStr.split(' to ')
      setStartDate(moment(dates[0], 'DD MMM YY').format('YYYY-MM-DD'))
      setEndDate(moment(dates[1], 'DD MMM YY').format('YYYY-MM-DD'))
    }
  }

  const hasActiveFilters = useMemo(
    () => searchValue !== '' || startDate !== '' || endDate !== '' || filters.onlyOverdue || filters.store.value !== 'all' || filters.status.value !== 'all',
    [searchValue, startDate, endDate, filters]
  )

  const downloadInfoToExcel = async () => {
    const generatingDocument = toast.loading('Generating Document...')

    let endPoint = `${process.env.NEXT_PUBLIC_SHELFCLOUD_SERVER_URL}/api/reports/commerceHub/invoices?region=${state.currentRegion}&businessId=${state.user.businessId}`

    if (searchValue) endPoint += `&search=${encodeURIComponent(searchValue)}`
    if (startDate) endPoint += `&startDate=${startDate}`
    if (endDate) endPoint += `&endDate=${endDate}`
    if (filters.onlyOverdue) endPoint += `&onlyOverdue=${filters.onlyOverdue}`
    if (filters.store.value !== 'all') endPoint += `&store=${filters.store.value}`
    if (filters.status.value !== 'all') endPoint += `&status=${filters.status.value}`
    if (daysOverdue > 0) endPoint += `&daysOverdue=${daysOverdue}`

    const controller = new AbortController()
    const signal = controller.signal

    const response = await axios
      .get<InvoicesResponse>(endPoint, {
        signal,
        headers: {
          Authorization: `Bearer ${sessionToken}`,
        },
      })
      .then((res) => res.data)
      .catch(({ error }) => {
        if (axios.isCancel(error)) {
          toast.error(error?.data?.message || 'Error generating document')
        }
        return {
          error: true,
          message: error?.data?.message || 'Error generating document',
          invoices: [],
        }
      })

    if (response.error) {
      toast.update(generatingDocument, {
        render: 'Error generating document',
        type: 'error',
        isLoading: false,
        autoClose: 3000,
      })
      return
    }

    toast.update(generatingDocument, {
      render: 'Downloading Document...',
      type: 'success',
      isLoading: false,
      autoClose: 3000,
    })

    await generateDocument('invoices', response.invoices)
  }

  return (
    <div>
      <Head>
        <title>{title}</title>
      </Head>
      <React.Fragment>
        <div className='page-content'>
          <Container fluid>
            <BreadCrumb title='Invoices' pageTitle='Commerce HUB' />
            <div className='d-flex flex-column justify-content-center align-items-end gap-2 mb-1 flex-lg-row justify-content-md-between align-items-md-center px-1'>
              <div className='w-100 d-flex flex-column justify-content-center align-items-start gap-2 mb-0 flex-lg-row justify-content-lg-start align-items-lg-center px-0'>
                <Button
                  color='primary'
                  className='fs-7 text-nowrap'
                  onClick={() => {
                    setshowUpdateInvoices({ show: true })
                  }}>
                  Update Invoices
                </Button>
                <Button color='primary' className='btn-label fs-7' onClick={downloadInfoToExcel}>
                  <i className='las la-cloud-download-alt label-icon align-middle fs-4 me-2' />
                  Download To Excel
                </Button>
                {selectedRows.length > 0 && (
                  <BulkActionsForSelected
                    selectedRows={selectedRows}
                    statusOptions={STATUS_OPTIONS}
                    clearSelected={clearAllSelectedRows}
                    changeSelectedStatus={changeSelectedStatus}
                  />
                )}
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
                <FilterByDates
                  shipmentsStartDate={startDate}
                  setShipmentsStartDate={setStartDate}
                  setShipmentsEndDate={setEndDate}
                  shipmentsEndDate={endDate}
                  handleChangeDatesFromPicker={handleChangeDatesFromPicker}
                />
                <FilterCommerceHubInvoices
                  filters={filters}
                  setfilters={setfilters}
                  stores={stores?.stores ?? []}
                  statusOptions={STATUS_OPTIONS}
                  daysOverdue={daysOverdue}
                  setdaysOverdue={setdaysOverdue}
                />
                <Button disabled={!hasActiveFilters} color={hasActiveFilters ? 'primary' : 'light'} className='fs-7 text-nowrap' onClick={clearFilters}>
                  Clear Filters
                </Button>
              </div>
            </div>
            <Card>
              <CardBody>
                <InvoicesTable
                  filteredItems={invoices}
                  pending={isValidating && size === 1}
                  setSelectedRows={setSelectedRows}
                  toggledClearRows={toggledClearRows}
                  sortBy={sortBy}
                  setSortBy={setSortBy}
                />
                <div ref={lastInvoiceElementRef} style={{ height: '20px', marginTop: '10px' }}>
                  {isValidating && size > 1 && (
                    <p className='text-center'>
                      <Spinner size='sm' color='primary' /> Loading more invoices...
                    </p>
                  )}
                </div>
              </CardBody>
            </Card>
          </Container>
        </div>
        {showUpdateInvoices.show && <UpdateInvoicesModal showUpdateInvoices={showUpdateInvoices} setshowUpdateInvoices={setshowUpdateInvoices} clearFilters={clearFilters} stores={stores?.stores ?? []}/>}
      </React.Fragment>
    </div>
  )
}

export default Invoices
