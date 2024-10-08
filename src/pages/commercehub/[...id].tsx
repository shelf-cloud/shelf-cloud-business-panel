import React, { useContext, useMemo, useState } from 'react'
import AppContext from '@context/AppContext'
import { GetServerSideProps } from 'next'
import Head from 'next/head'
import { getSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import axios from 'axios'
import useSWR from 'swr'
import DataTable from 'react-data-table-component'
import { Invoice, InvoicesResponse } from '@typesTs/commercehub/invoices'
import { Card, CardBody, CardHeader, Container } from 'reactstrap'
import BreadCrumb from '@components/Common/BreadCrumb'
import { toast } from 'react-toastify'
import moment from 'moment'
import { FormatCurrency } from '@lib/FormatNumbers'
import { DebounceInput } from 'react-debounce-input'
import FilterCheckNumber from '@components/commerceHub/FilterCheckNumber'

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
  sessionToken: string
  session: {
    user: {
      businessName: string
    }
  }
}

type PendingInfo = {
  totalPending: number
  totalInvoices: number
}

const CheckNumberDetails = ({ session }: Props) => {
  const router = useRouter()
  const { id } = router.query
  const { state }: any = useContext(AppContext)
  const [searchValue, setSearchValue] = useState<string>('')
  const [invoiceType, setInvoiceType] = useState('all')
  const title = `Check No. ${id![1]} | ${session?.user?.businessName}`

  const fetcher = (endPoint: string) => axios(endPoint).then((res) => res.data)
  const { data } = useSWR<InvoicesResponse>(
    id && state.user.businessId ? `/api/commerceHub/getCheckNumberInfo?region=${state.currentRegion}&businessId=${state.user.businessId}&checkNumber=${id[1]}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
    }
  )

  const sortDates = (Adate: string, Bdate: string) => {
    const a = moment(Adate)
    const b = moment(Bdate)
    if (a.isBefore(b)) {
      return -1
    } else {
      return 1
    }
  }
  const sortStrings = (rowA: string, rowB: string) => {
    if (rowA.localeCompare(rowB)) {
      return 1
    } else {
      return -1
    }
  }

  const filterInvoices = useMemo(() => {
    if (!data?.invoices || data.invoices.length == 0) return []

    if (searchValue === '') {
      return data.invoices.filter((invoice: Invoice) => (invoiceType === 'all' ? true : invoiceType === 'invoices' ? invoice.checkTotal > 0 : invoice.checkTotal < 0))
    }

    if (searchValue !== '') {
      return data.invoices.filter(
        (invoice: Invoice) =>
          (invoiceType === 'all' ? true : invoiceType === 'invoices' ? invoice.checkTotal > 0 : invoice.checkTotal < 0) &&
          (invoice.invoiceNumber?.toLowerCase().includes(searchValue.toLowerCase()) ||
            invoice.poNumber?.toLowerCase().includes(searchValue.toLowerCase()) ||
            invoice.orderNumber?.toLowerCase().includes(searchValue.toLowerCase()))
      )
    }

    return data.invoices
  }, [data?.invoices, searchValue, invoiceType])

  const pendingInfo = useMemo(() => {
    if (!data?.invoices || data.invoices.length == 0) return { totalPending: 0, totalInvoices: 0 }
    return data.invoices.reduce(
      (pendingInfo: PendingInfo, invoice) => {
        pendingInfo.totalPending += invoice.checkTotal + invoice.cashDiscountTotal
        if (invoice.checkTotal > 0) pendingInfo.totalInvoices += 1
        return pendingInfo
      },
      { totalPending: 0, totalInvoices: 0 }
    )
  }, [data?.invoices])

  const columns: any = [
    {
      name: <span className='fw-bold fs-6'>Invoice No.</span>,
      selector: (row: Invoice) => (
        <div className='d-flex flex-wrap justify-content-start align-items-center'>
          <p className='m-0 p-0 fw-semibold fs-7'>{row.invoiceNumber}</p>{' '}
          <i
            className='ri-file-copy-line fs-6 my-0 mx-1 p-0 text-muted'
            style={{ cursor: 'pointer' }}
            onClick={() => {
              navigator.clipboard.writeText(row.invoiceNumber)
              toast('Invoice No. copied!', {
                autoClose: 1500,
              })
            }}
          />
        </div>
      ),
      sortable: true,
      center: false,
      compact: false,
      sortFunction: (rowA: Invoice, rowB: Invoice) => sortStrings(rowA.invoiceNumber, rowB.invoiceNumber),
    },
    {
      name: <span className='fw-bold fs-6'>Order No.</span>,
      selector: (row: Invoice) => row.checkTotal > 0 && <p className='m-0 p-0 text-muted fs-7'>{row.orderNumber}</p>,
      sortable: false,
      left: true,
      compact: true,
    },
    {
      name: <span className='fw-bold fs-6'>PO No.</span>,
      selector: (row: Invoice) =>
        row.checkTotal > 0 && (
          <div className='d-flex flex-wrap justify-content-start align-items-center'>
            <p className='m-0 p-0 text-muted fs-7'>{row.poNumber}</p>
            <i
              className='ri-file-copy-line fs-6 my-0 mx-1 p-0 text-muted'
              style={{ cursor: 'pointer' }}
              onClick={() => {
                navigator.clipboard.writeText(row.poNumber)
                toast('PO No. copied!', {
                  autoClose: 1500,
                })
              }}
            />
          </div>
        ),
      sortable: false,
      left: true,
      compact: true,
    },
    {
      name: <span className='fw-bold fs-6'>Comments</span>,
      selector: (row: Invoice) => <span className='fs-7 text-muted'>{row.comments}</span>,
      sortable: false,
      center: true,
      compact: true,
    },
    {
      name: <span className='fw-bold fs-6'>Invoice Date</span>,
      selector: (row: Invoice) => row.invoiceDate && <span className='fs-7'>{moment.utc(row.invoiceDate).local().format('D MMM YYYY')}</span>,
      sortable: false,
      center: true,
      compact: true,
      sortFunction: (rowA: Invoice, rowB: Invoice) => sortDates(rowA.invoiceDate!, rowB.invoiceDate!),
    },
    {
      name: <span className='fw-bold fs-6'>Invoice Total</span>,
      selector: (row: Invoice) => row.checkTotal > 0 && <span className='fs-7'>{row.checkTotal ? FormatCurrency(state.currentRegion, row.checkTotal) : ''}</span>,
      sortable: false,
      center: true,
      compact: true,
    },
    {
      name: <span className='fw-bold fs-6'>Due Date</span>,
      selector: (row: Invoice) => row.dueDate && <span className='fs-7'>{moment.utc(row.dueDate).local().format('D MMM YYYY')}</span>,
      sortable: false,
      center: true,
      compact: true,
      sortFunction: (rowA: Invoice, rowB: Invoice) => {
        if (rowA.dueDate && rowB.dueDate) sortDates(rowA.dueDate, rowB.dueDate)
      },
    },
    // {
    //   name: <span className='fw-bold fs-6'>Check Date</span>,
    //   selector: (row: Invoice) => <span className='fs-7'>{row.checkDate ? moment.utc(row.checkDate).local().format('D MMM YYYY') : ''}</span>,
    //   sortable: false,
    //   center: true,
    //   compact: true,
    //   sortFunction: (rowA: Invoice, rowB: Invoice) => {
    //     if (rowA.checkDate && rowB.checkDate) sortDates(rowA.checkDate, rowB.checkDate)
    //   },
    // },
    // {
    //   name: <span className='fw-bold fs-6'>Check Number</span>,
    //   selector: (row: Invoice) => <span className='fs-7'>{row.checkNumber}</span>,
    //   sortable: false,
    //   center: true,
    //   compact: true,
    // },
    {
      name: (
        <div className='d-flex flex-column justify-content-center align-items-center'>
          <p className='m-0 fw-bold fs-6'>Check Amount</p>
          <p className='m-0 text-muted'>
            <span className='fw-semibold'>
              {FormatCurrency(
                state.currentRegion,
                filterInvoices.reduce((acc, invoice) => acc + invoice.checkTotal + invoice.cashDiscountTotal, 0)
              )}
            </span>
          </p>
        </div>
      ),
      selector: (row: Invoice) => {
        if (row.checkTotal > 0) {
          return <span className='text-center fs-7'>{FormatCurrency(state.currentRegion, row.checkTotal)}</span>
        } else {
          return <span className='text-danger text-center fs-7'>{FormatCurrency(state.currentRegion, row.checkTotal)}</span>
        }
      },
      sortable: false,
      center: true,
      compact: true,
    },
    // {
    //   name: <span className='fw-bold fs-6'>Pending</span>,
    //   selector: (row: Invoice) => {
    //     const pending = parseFloat((row.invoiceTotal - row.checkTotal).toFixed(2))
    //     if (pending > 0) {
    //       return <span className='text-danger text-center fs-7'>{FormatCurrency(state.currentRegion, pending)}</span>
    //     } else {
    //       return <span className='text-success text-center fs-7'>{FormatCurrency(state.currentRegion, 0)}</span>
    //     }
    //   },
    //   sortable: false,
    //   center: true,
    //   compact: true,
    // },
    // {
    //   name: <span className='fw-bolder fs-6'>Status</span>,
    //   selector: (row: Invoice) => {
    //     if (row.checkNumber) {
    //       return <span className='badge text-uppercase badge-soft-success p-2'>{` Paid `}</span>
    //     } else {
    //       return <span className='badge text-uppercase badge-soft-warning p-2'>{` Unpaid `}</span>
    //     }
    //   },
    //   sortable: false,
    //   wrap: true,
    //   center: true,
    //   compact: true,
    // },
  ]

  return (
    <div>
      <Head>
        <title>{title}</title>
      </Head>
      <React.Fragment>
        <div className='page-content'>
          <Container fluid>
            <BreadCrumb title='Check Number' pageTitle='Commerce HUB' />
            <div className='d-flex flex-column justify-content-center align-items-end gap-2 mb-1 flex-lg-row justify-content-md-between align-items-md-center px-1'>
              <div className='w-100 d-flex flex-column justify-content-center align-items-start gap-2 mb-0 flex-lg-row justify-content-lg-start align-items-lg-center px-0'>
                <FilterCheckNumber type={invoiceType} setInvoiceType={setInvoiceType} />
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
              </div>
            </div>
            <Card>
              <CardHeader>
                <div className='d-flex flex-wrap justify-content-between align-items-start'>
                  <div className='d-flex flex-column justify-content-start align-items-start'>
                    <p className='m-0 p-0 fs-6'>
                      Check Number: <span className='fw-semibold'>{id![1]}</span>
                    </p>
                    <p className='m-0 p-0 fs-6'>
                      Marketplace <span className='fw-semibold'>{id![0]}</span>
                    </p>
                    <p className='m-0 p-0 fs-6'>
                      Check Date <span className='fw-semibold'>{data ? moment.utc(data?.invoices[0].checkDate).local().format('LL') : 'loading...'}</span>
                    </p>
                  </div>
                  <div className='d-flex flex-column justify-content-start align-items-end'>
                    {pendingInfo.totalInvoices > 0 && <p className='m-0 p-0 fs-6'>Total Invoices: {pendingInfo.totalInvoices}</p>}
                    <p className='m-0 p-0 fs-6'>Check Total: {FormatCurrency(state.currentRegion, pendingInfo.totalPending)}</p>
                  </div>
                </div>
              </CardHeader>
              <CardBody>
                <DataTable columns={columns} data={filterInvoices} progressPending={data ? false : true} striped={true} dense={true} />
              </CardBody>
            </Card>
          </Container>
        </div>
      </React.Fragment>
    </div>
  )
}

export default CheckNumberDetails
