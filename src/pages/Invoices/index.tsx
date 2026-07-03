import { GetServerSideProps } from 'next'
import Head from 'next/head'
import React, { useContext, useEffect, useMemo, useState } from 'react'

import { getSession } from '@auth/client'
import BreadCrumb from '@components/Common/BreadCrumb'
import InvoicesChart from '@components/InvoicesChart'
import InvoicesTable from '@components/InvoicesTable'
import AppContext from '@context/AppContext'
import { InvoiceList } from '@typings'
import axios from 'axios'
import { toast } from 'react-toastify'
import useSWR from 'swr'

import { Button } from '@shadcn/ui/button'
import { Card, CardContent, CardHeader } from '@shadcn/ui/card'
import { Input } from '@shadcn/ui/input'

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

const Invoices = ({ session }: Props) => {
  const { state }: any = useContext(AppContext)
  const [searchValue, setSearchValue] = useState<any>('')

  const fetcher = (endPoint: string) => axios(endPoint).then((res) => res.data)
  const { data } = useSWR(state.user.businessId ? `/api/getBusinessInvoices?region=${state.currentRegion}&businessId=${state.user.businessId}` : null, fetcher)

  const billingStatus = data?.error ? [] : data?.billingStatus || []
  const pending = !data

  const filteredItems = useMemo(() => {
    const allData = data?.error ? [] : data?.invoices || []
    return allData.filter((item: InvoiceList) => item?.invoiceNumber?.toLowerCase().includes(searchValue.toLowerCase()))
  }, [data, searchValue])

  useEffect(() => {
    if (data?.error) {
      toast.error(data?.message)
    }
  }, [data?.error, data?.message])

  const title = `Invoices | ${session?.user?.businessName}`
  return (
    <div>
      <Head>
        <title>{title}</title>
      </Head>
      <React.Fragment>
        <div className='page-content'>
          <BreadCrumb title='Invoices' pageTitle='Billing' />
          <div className='mx-auto w-full px-3'>
            <div className='flex flex-wrap -mx-3'>
              <div className='px-3 lg:w-full'>
                <Card>
                  <CardHeader>
                    {!pending && (
                      <>
                        <div className='w-full sm:w-1/2 lg:w-5/12 xl:w-1/3 2xl:w-1/4'>
                          <p className='uppercase font-semibold text-primary truncate mb-0'>Billing Status</p>
                          <InvoicesChart billingStatus={billingStatus} />
                        </div>
                        <div className='app-search flex flex-row justify-end items-center p-0'>
                          <div className='relative'>
                            <Input type='text' placeholder='Search...' id='search-options' value={searchValue} onChange={(e) => setSearchValue(e.target.value)} />
                            <span className='mdi mdi-magnify search-widget-icon'></span>
                            <span className='mdi mdi-close-circle search-widget-icon search-widget-icon-close hidden' id='search-close-options'></span>
                          </div>
                          <Button className='btn-soft-dark' onClick={() => setSearchValue('')}>
                            Clear
                          </Button>
                        </div>
                      </>
                    )}
                  </CardHeader>
                  <CardContent>
                    <InvoicesTable filteredItems={filteredItems} pending={pending} />
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </React.Fragment>
    </div>
  )
}

export default Invoices
