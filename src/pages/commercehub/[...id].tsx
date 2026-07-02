import { GetServerSideProps } from 'next'
import Head from 'next/head'
import { useRouter } from 'next/router'
import React, { useContext, useMemo, useState } from 'react'

import BreadCrumb from '@components/Common/BreadCrumb'
import BulkActionsForSelected from '@components/commerceHub/BulkActionsForSelected'
import FilterCheckNumber from '@components/commerceHub/FilterCheckNumber'
import { getCheckAmountTotal } from '@components/commerceHub/helperFunctions'
import AppContext from '@context/AppContext'
import { FormatCurrency } from '@lib/FormatNumbers'
import { Invoice, InvoicesResponse } from '@typesTs/commercehub/invoices'
import axios from 'axios'
import moment from 'moment'
import { getSession } from 'next-auth/react'
import DataTable from '@components/Common/DataTableSC'
import { DebounceInput } from 'react-debounce-input'
import { toast } from 'react-toastify'
import { Card, CardBody, CardHeader, Container } from '@/components/migration-ui'
import useSWR, { mutate } from 'swr'

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
  totalPaid: number
  totalInvoices: number
}

const STATUS_OPTIONS = [
  { value: 'reviewing', label: 'Reviewing' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'closed', label: 'Closed' },
]

const CheckNumberDetails = ({ session }: Props) => {
  const router = useRouter()
  const { id } = router.query
  const { state }: any = useContext(AppContext)
  const [searchValue, setSearchValue] = useState<string>('')
  const [invoiceType, setInvoiceType] = useState('all')
  const [selectedRows, setSelectedRows] = useState<Invoice[]>([])
  const [toggledClearRows, setToggleClearRows] = useState(false)
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
  const sortNumbers = (rowA: number, rowB: number) => {
    if (rowA > rowB) {
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
    if (!data?.invoices || data.invoices.length == 0) return { totalPaid: 0, totalInvoices: 0 }
    return data.invoices.reduce(
      (pendingInfo: PendingInfo, invoice) => {
        const { orderTotal, charges, deductions, checkTotal } = invoice

        if (invoice.checkTotal >= 0) pendingInfo.totalInvoices += 1

        if (deductions < 0) {
          pendingInfo.totalPaid += orderTotal + deductions + charges
        } else if (checkTotal < 0) {
          pendingInfo.totalPaid += orderTotal + checkTotal + charges
        } else {
          pendingInfo.totalPaid += orderTotal + charges
        }

        return pendingInfo
      },
      { totalPaid: 0, totalInvoices: 0 }
    )
  }, [data?.invoices])

  const handleSelectedRows = ({ selectedRows }: { selectedRows: Invoice[] }) => {
    setSelectedRows(selectedRows)
  }

  const changeSelectedStatus = async (status: string) => {
    if (selectedRows.length <= 0) return

    const cleanSelectedRows = selectedRows.map((row) => {
      return { orderId: '', order: false, commerceHubId: row.id, commerceHub: true }
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
      mutate(`/api/commerceHub/getCheckNumberInfo?region=${state.currentRegion}&businessId=${state.user.businessId}&checkNumber=${id![1]}`)
    } else {
      toast.error(response.message)
    }
  }

  const clearAllSelectedRows = () => {
    setToggleClearRows(!toggledClearRows)
    setSelectedRows([])
  }

  const rowDisabledCriteria = (row: Invoice) => !row.id || row.checkTotal > 0

  const columns: any = [
    {
      name: <span className='tw:font-bold tw:text-[13px]'>Invoice No.</span>,
      selector: (row: Invoice) => (
        <div className='tw:flex tw:flex-wrap tw:justify-start tw:items-center'>
          <p className='tw:m-0 tw:p-0 tw:font-semibold tw:text-[11.2px]'>{row.invoiceNumber}</p>{' '}
          <i
            className='ri-file-copy-line tw:text-[13px] tw:my-0 tw:mx-1 tw:p-0 tw:text-[color:var(--bs-secondary-color)]'
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
      name: <span className='tw:font-bold tw:text-[13px] tw:text-nowrap'>Keyrec No.</span>,
      selector: (row: Invoice) => <p className='tw:m-0 tw:p-0 tw:text-[var(--bs-secondary-color)] tw:text-[11.2px]'>{row.keyrecNumber ? row.keyrecNumber : ''}</p>,
      sortable: false,
      left: true,
      compact: true,
    },
    {
      name: <span className='tw:font-bold tw:text-[13px]'>PO No.</span>,
      selector: (row: Invoice) =>
        row.checkTotal > 0 && (
          <div className='tw:flex tw:flex-wrap tw:justify-start tw:items-center'>
            <p className='tw:m-0 tw:p-0 tw:text-[var(--bs-secondary-color)] tw:text-[11.2px]'>{row.poNumber}</p>
            <i
              className='ri-file-copy-line tw:text-[13px] tw:my-0 tw:mx-1 tw:p-0 tw:text-[color:var(--bs-secondary-color)]'
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
      name: <span className='tw:font-bold tw:text-[13px]'>Comments</span>,
      selector: (row: Invoice) => <span className='tw:text-[11.2px] tw:text-[var(--bs-secondary-color)]'>{row.comments}</span>,
      sortable: false,
      left: true,
      compact: true,
      wrap: true,
      grow: 1.3,
    },
    {
      name: <span className='tw:font-bold tw:text-[13px]'>Invoice Date</span>,
      selector: (row: Invoice) => row.invoiceDate && <span className='tw:text-[11.2px]'>{moment.utc(row.invoiceDate).local().format('D MMM YYYY')}</span>,
      sortable: false,
      center: true,
      compact: true,
      sortFunction: (rowA: Invoice, rowB: Invoice) => sortDates(rowA.invoiceDate!, rowB.invoiceDate!),
    },
    {
      name: <span className='tw:font-bold tw:text-[13px]'>Order Total</span>,
      selector: (row: Invoice) => (row.checkTotal >= 0 ? <span className='tw:text-[11.2px]'>{FormatCurrency(state.currentRegion, row.orderTotal)}</span> : <></>),
      sortable: true,
      center: true,
      compact: true,
      sortFunction: (rowA: Invoice, rowB: Invoice) => sortNumbers(rowA.checkTotal, rowB.checkTotal),
    },
    {
      name: <span className='tw:font-bold tw:text-[13px]'>Due Date</span>,
      selector: (row: Invoice) => row.dueDate && <span className='tw:text-[11.2px]'>{moment.utc(row.dueDate).local().format('D MMM YYYY')}</span>,
      sortable: false,
      center: true,
      compact: true,
      sortFunction: (rowA: Invoice, rowB: Invoice) => {
        if (rowA.dueDate && rowB.dueDate) sortDates(rowA.dueDate, rowB.dueDate)
      },
    },
    {
      name: <span className='tw:font-extrabold tw:text-[13px]'>Deductions</span>,
      selector: (row: Invoice) => {
        if (row.checkTotal >= 0) {
          return <span className={'tw:text-center tw:text-[11.2px] ' + (row.deductions < 0 ? 'tw:text-danger' : 'tw:text-[var(--bs-secondary-color)]')}>{FormatCurrency(state.currentRegion, row.deductions)}</span>
        } else {
          return <></>
        }
      },
      sortable: true,
      center: true,
      compact: true,
      sortFunction: (rowA: Invoice, rowB: Invoice) => sortNumbers(rowA.checkTotal, rowB.checkTotal),
    },
    {
      name: <span className='tw:font-extrabold tw:text-[13px]'>Charges</span>,
      selector: (row: Invoice) => {
        if (row.checkTotal >= 0) {
          return <span className={'tw:text-center tw:text-[11.2px] ' + (row.charges < 0 ? 'tw:text-danger' : 'tw:text-[var(--bs-secondary-color)]')}>{FormatCurrency(state.currentRegion, row.charges)}</span>
        } else {
          return <></>
        }
      },
      sortable: true,
      center: true,
      compact: true,
      sortFunction: (rowA: Invoice, rowB: Invoice) => sortNumbers(rowA.checkTotal, rowB.checkTotal),
    },
    {
      name: (
        <div className='tw:flex tw:flex-col tw:justify-center tw:items-center'>
          <p className='tw:m-0 tw:font-bold tw:text-[13px]'>Total Paid</p>
          <p className='tw:m-0 tw:text-[var(--bs-secondary-color)]'>
            <span className='tw:font-semibold'>{FormatCurrency(state.currentRegion, getCheckAmountTotal(filterInvoices))}</span>
          </p>
        </div>
      ),
      selector: (row: Invoice) => {
        if (row.checkTotal >= 0) {
          return <span className='tw:text-center tw:text-[11.2px]'>{FormatCurrency(state.currentRegion, row.checkTotal)}</span>
        } else {
          return <span className='tw:text-danger tw:text-center tw:text-[11.2px]'>{FormatCurrency(state.currentRegion, row.checkTotal)}</span>
        }
      },
      sortable: true,
      center: true,
      compact: true,
      sortFunction: (rowA: Invoice, rowB: Invoice) => sortNumbers(rowA.checkTotal, rowB.checkTotal),
    },
    {
      name: <span className='tw:font-extrabold tw:text-[13px]'>Status</span>,
      selector: (row: Invoice) => {
        switch (row.status) {
          case 'paid':
            return <span className='badge tw:uppercase tw:bg-[color-mix(in_srgb,var(--bs-success)_10%,transparent)] tw:text-success tw:p-2'>{` ${row.status} `}</span>
          case 'unpaid':
            return <span className='badge tw:uppercase tw:bg-[color-mix(in_srgb,var(--bs-warning)_10%,transparent)] tw:text-warning tw:p-2'>{` ${row.status} `}</span>
          case 'closed':
          case 'resolved':
            return <span className='badge tw:uppercase tw:bg-[color-mix(in_srgb,var(--bs-dark)_10%,transparent)] tw:text-dark tw:p-2'>{` ${row.status} `}</span>
          case 'reviewing':
            return <span className='badge tw:uppercase tw:bg-[color-mix(in_srgb,var(--bs-warning)_10%,transparent)] tw:text-warning tw:p-2'>{` ${row.status} `}</span>
          case 'pending':
            return <span className='badge tw:uppercase tw:bg-[color-mix(in_srgb,var(--bs-info)_10%,transparent)] tw:text-info tw:p-2'>{` ${row.status} `}</span>
          default:
            if (row.checkTotal > 0) {
              return <span className='badge tw:uppercase tw:bg-[color-mix(in_srgb,var(--bs-success)_10%,transparent)] tw:text-success tw:p-2'>{` Paid `}</span>
            } else {
              return <span className='badge tw:uppercase tw:bg-[color-mix(in_srgb,var(--bs-info)_10%,transparent)] tw:text-info tw:p-2'>{` pending `}</span>
            }
        }
      },
      sortable: true,
      wrap: true,
      center: true,
      compact: true,
      sortFunction: (rowA: Invoice, rowB: Invoice) =>
        sortStrings(rowA.status ? rowA.status : rowA.checkTotal > 0 ? 'paid' : 'pending', rowB.status ? rowB.status : rowB.checkTotal > 0 ? 'paid' : 'pending'),
    },
  ]

  return (
    <div>
      <Head>
        <title>{title}</title>
      </Head>
      <React.Fragment>
        <div className='page-content'>
          <BreadCrumb title='Check Number' pageTitle='Commerce HUB' />
          <Container fluid>
            <div className='tw:flex tw:flex-col tw:justify-center tw:items-end tw:gap-2 tw:mb-1 tw:lg:flex-row tw:md:justify-between tw:md:items-center tw:px-1'>
              <div className='tw:w-full tw:flex tw:flex-col tw:justify-center tw:items-start tw:gap-2 tw:mb-0 tw:lg:flex-row tw:lg:justify-start tw:lg:items-center tw:px-0'>
                <FilterCheckNumber type={invoiceType} setInvoiceType={setInvoiceType} />
                {selectedRows.length > 0 && (
                  <BulkActionsForSelected
                    selectedRows={selectedRows}
                    statusOptions={STATUS_OPTIONS}
                    clearSelected={clearAllSelectedRows}
                    changeSelectedStatus={changeSelectedStatus}
                  />
                )}
              </div>
              <div className='tw:w-full tw:flex tw:flex-col-reverse tw:justify-center tw:items-start tw:gap-2 tw:mb-0 tw:lg:flex-row tw:lg:justify-end tw:lg:items-center tw:px-0'>
                <div className='app-search tw:p-0 tw:w-full tw:lg:w-5/12'>
                  <div className='tw:relative tw:flex tw:rounded-lg tw:w-full tw:overflow-hidden' style={{ border: '1px solid #E1E3E5' }}>
                    <DebounceInput
                      type='text'
                      minLength={1}
                      debounceTimeout={500}
                      className='form-control input_background_white'
                      placeholder='Search...'
                      id='search-options'
                      value={searchValue}
                      onKeyDown={(e) => (e.key == 'Enter' ? e.preventDefault() : null)}
                      onChange={(e) => setSearchValue(e.target.value)}
                    />
                    <span className='mdi mdi-magnify search-widget-icon tw:text-[19.5px]'></span>
                    <span
                      className='tw:flex tw:items-center tw:justify-center input_background_white'
                      style={{
                        cursor: 'pointer',
                      }}
                      onClick={() => setSearchValue('')}>
                      <i className='mdi mdi-window-close tw:text-[19.5px] tw:m-0 tw:px-2 tw:py-0 tw:text-[color:var(--bs-secondary-color)]' />
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <Card>
              <CardHeader>
                <div className='tw:flex tw:flex-wrap tw:justify-between tw:items-start'>
                  <div className='tw:flex tw:flex-col tw:justify-start tw:items-start'>
                    <p className='tw:m-0 tw:p-0 tw:text-[13px]'>
                      Check Number: <span className='tw:font-semibold'>{id![1]}</span>
                    </p>
                    <p className='tw:m-0 tw:p-0 tw:text-[13px]'>
                      Marketplace <span className='tw:font-semibold'>{id![0]}</span>
                    </p>
                    <p className='tw:m-0 tw:p-0 tw:text-[13px]'>
                      Check Date <span className='tw:font-semibold'>{data ? moment.utc(data?.invoices[0].checkDate).local().format('LL') : 'loading...'}</span>
                    </p>
                  </div>
                  <div className='tw:flex tw:flex-col tw:justify-start tw:items-end'>
                    {pendingInfo.totalInvoices > 0 && <p className='tw:m-0 tw:p-0 tw:text-[13px]'>Total Invoices: {pendingInfo.totalInvoices}</p>}
                    <p className='tw:m-0 tw:p-0 tw:text-[13px]'>Total Paid: {FormatCurrency(state.currentRegion, pendingInfo.totalPaid <= 0 ? 0 : pendingInfo.totalPaid)}</p>
                  </div>
                </div>
              </CardHeader>
              <CardBody>
                <DataTable
                  columns={columns}
                  data={filterInvoices}
                  progressPending={data ? false : true}
                  striped={true}
                  dense={true}
                  selectableRows
                  onSelectedRowsChange={handleSelectedRows}
                  selectableRowDisabled={rowDisabledCriteria}
                  clearSelectedRows={toggledClearRows}
                />
              </CardBody>
            </Card>
          </Container>
        </div>
      </React.Fragment>
    </div>
  )
}

export default CheckNumberDetails
