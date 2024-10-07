import React, { useCallback, useContext, useMemo, useRef, useState } from 'react'
import AppContext from '@context/AppContext'
import { GetServerSideProps } from 'next'
import Head from 'next/head'
import { Button, Card, CardBody, Container, Spinner } from 'reactstrap'
import BreadCrumb from '@components/Common/BreadCrumb'
import { getSession } from '@auth/client'
import axios from 'axios'
import useSWRInfinite from 'swr/infinite'
import { Invoice, InvoicesResponse } from '@typesTs/commercehub/invoices'
import InvoicesTable from '@components/commerceHub/InvoicesTable'
import { DebounceInput } from 'react-debounce-input'
import FilterByDates from '@components/FilterByDates'
import moment from 'moment'
import UpdateInvoicesModal from '@components/modals/commercehub/UpdateInvoicesModal'

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

const ITEMS_PER_PAGE = 50

const fetcher = async (url: string) => {
  const data = await axios.get<InvoicesResponse>(url).then((res) => res.data)
  return data.invoices
}

const Invoices = ({ session }: Props) => {
  const title = `Commerce HUB Invoices | ${session?.user?.businessName}`
  const { state }: any = useContext(AppContext)
  const [searchValue, setSearchValue] = useState<string>('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [showUpdateInvoices, setshowUpdateInvoices] = useState({
    show: false,
  })

  const getKey = (pageIndex: number, previousPageData: Invoice[]) => {
    if (!state.currentRegion || !state.user.businessId) return null // No region or business

    if (previousPageData && !previousPageData.length) return null // No more data to fetch

    let url = `/api/commerceHub/getInvoices?region=${state.currentRegion}&businessId=${state.user.businessId}&offset=${pageIndex * ITEMS_PER_PAGE}&limit=${ITEMS_PER_PAGE}`

    // Append filters if they exist
    if (searchValue) url += `&search=${encodeURIComponent(searchValue)}`
    if (startDate) url += `&startDate=${startDate}`
    if (endDate) url += `&endDate=${endDate}`

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
    setSize(1) // Reset to page 1
    mutate() // Refetch the initial data set
  }

  const handleChangeDatesFromPicker = (dateStr: string) => {
    if (dateStr.includes(' to ')) {
      const dates = dateStr.split(' to ')
      setStartDate(moment(dates[0], 'DD MMM YY').format('YYYY-MM-DD'))
      setEndDate(moment(dates[1], 'DD MMM YY').format('YYYY-MM-DD'))
    }
  }

  // type PendingInfo = {
  //   totalPending: number
  //   marketplaces: { [marketplace: string]: number}
  //   totalInvoices: number
  // }
  // const pendingInfo = useMemo(() => {
  //   if(!invoices || invoices.length == 0) return { totalPending: 0, marketplaces: {}, totalInvoices: 0 }
  //   return invoices.reduce((pendingInfo: PendingInfo, invoice) => {
  //     const pendingValue = parseFloat((invoice.invoiceTotal - invoice.checkTotal).toFixed(2))
  //     pendingInfo.totalPending += pendingValue
  //     if(pendingValue > 0) pendingInfo.totalInvoices += 1
  //     if(!pendingInfo.marketplaces[invoice.storeName]) pendingInfo.marketplaces[invoice.storeName] = 0
  //     pendingInfo.marketplaces[invoice.storeName] += pendingValue
  //     return pendingInfo
  //   }, { totalPending: 0, marketplaces: {}, totalInvoices: 0 })
  // }, [invoices])

  return (
    <div>
      <Head>
        <title>{title}</title>
      </Head>
      <React.Fragment>
        <div className='page-content'>
          <Container fluid>
            <BreadCrumb title='Commerce HUB Invoices' pageTitle='Marketplaces' />
            <div className='d-flex flex-column justify-content-center align-items-end gap-2 mb-1 flex-lg-row justify-content-md-between align-items-md-center px-1'>
              <div className='w-100 d-flex flex-column justify-content-center align-items-start gap-2 mb-0 flex-lg-row justify-content-lg-start align-items-lg-center px-0'>
                <Button
                  color='primary'
                  className='text-nowrap'
                  onClick={() => {
                    setshowUpdateInvoices({ show: true })
                  }}>
                  Update Invoices
                </Button>
              </div>
              <div className='w-100 d-flex flex-column-reverse justify-content-center align-items-start gap-2 mb-0 flex-lg-row justify-content-lg-end align-items-lg-center px-0'>
                <div className='app-search p-0 col-sm-12 col-lg-5'>
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
                <FilterByDates
                  shipmentsStartDate={startDate}
                  setShipmentsStartDate={setStartDate}
                  setShipmentsEndDate={setEndDate}
                  shipmentsEndDate={endDate}
                  handleChangeDatesFromPicker={handleChangeDatesFromPicker}
                />
                <Button
                  disabled={searchValue == '' && startDate == ''}
                  color={searchValue !== '' || startDate !== '' ? 'primary' : 'light'}
                  className='text-nowrap'
                  onClick={clearFilters}>
                  Clear Filters
                </Button>
              </div>
            </div>
            <Card>
              {/* <CardHeader>
                <div className='d-flex flex-wrap justify-content-between align-items-start'>
                  <h4 className='card-title'>Invoices</h4>
                  <div className='d-flex flex-column justify-content-start align-items-end'>
                    {pendingInfo.totalInvoices > 0 && <p className='m-0 p-0 text-muted fs-6'>Total Invoices: {pendingInfo.totalInvoices}</p>}
                    {Object.keys(pendingInfo.marketplaces).map((marketplace) => {
                      return (
                        <p key={marketplace} className='m-0 p-0 text-muted fs-6'>
                          {marketplace}: {FormatCurrency(state.currentRegion, pendingInfo.marketplaces[marketplace])}
                        </p>
                      )
                    })}
                    <p className='m-0 p-0 text-muted fs-6'>Total Pending: {FormatCurrency(state.currentRegion, pendingInfo.totalPending)}</p>
                  </div>
                </div>
              </CardHeader> */}
              <CardBody>
                <InvoicesTable filteredItems={invoices} pending={isValidating && size === 1} />
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
        {showUpdateInvoices.show && <UpdateInvoicesModal showUpdateInvoices={showUpdateInvoices} setshowUpdateInvoices={setshowUpdateInvoices} clearFilters={clearFilters} />}
      </React.Fragment>
    </div>
  )
}

export default Invoices
