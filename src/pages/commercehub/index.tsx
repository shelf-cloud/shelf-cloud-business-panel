import { GetServerSideProps } from 'next'
import Head from 'next/head'
import React, { useContext, useState } from 'react'

import { getSession } from '@auth/client'
import BreadCrumb from '@components/Common/BreadCrumb'
import CheckNumberTable from '@components/commerceHub/CheckNumberTable'
import CommerceHubWidget from '@components/commerceHub/CommerceHubWidget'
import UpdateInvoicesModal from '@components/modals/commercehub/UpdateInvoicesModal'
import AppContext from '@context/AppContext'
import { DashboardResponse } from '@typesTs/commercehub/dashboard'
import { CommerceHubStoresResponse } from '@typesTs/commercehub/invoices'
import axios from 'axios'
import { toast } from '@/lib/toast'
import { Button } from '@shadcn/ui/button'
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

const fetcherSummary = (endPoint: string) =>
  axios(endPoint)
    .then((res) => res.data)
    .catch(() => {
      toast.error('Error fetching Summary data')
    })

const fetcherStores = async (endPoint: string) => await axios.get<CommerceHubStoresResponse>(endPoint).then((res) => res.data)

const Dashboard = ({ session }: Props) => {
  const { state }: any = useContext(AppContext)
  const title = `Commerce HUB | ${session?.user?.businessName}`
  const [showUpdateInvoices, setshowUpdateInvoices] = useState({
    show: false,
  })

  const { data: summary, mutate } = useSWR<DashboardResponse>(
    state.user.businessId ? `/api/commerceHub/getSummary?region=${state.currentRegion}&businessId=${state.user.businessId}` : null,
    fetcherSummary,
    {
      revalidateOnFocus: false,
      // revalidateOnMount: false,
    }
  )

  const { data: stores } = useSWR(state.user.businessId ? `/api/commerceHub/getStores?region=${state.currentRegion}&businessId=${state.user.businessId}` : null, fetcherStores, {
    revalidateOnFocus: false,
  })

  return (
    <div>
      <Head>
        <title>{title}</title>
      </Head>
      <React.Fragment>
        <div className='page-content'>
          <BreadCrumb title='Dashboard' pageTitle='Commerce HUB' />
          <div className='mx-auto w-full px-3'>
            <div className='flex flex-col justify-center items-end gap-2 mb-4 lg:flex-row md:justify-between md:items-center px-1'>
              <div className='w-full flex flex-col justify-center items-start gap-2 mb-0 lg:flex-row lg:justify-start lg:items-center px-0'>
                <Button
                  className='text-[11.2px] text-nowrap'
                  onClick={() => {
                    setshowUpdateInvoices({ show: true })
                  }}>
                  Update Invoices
                </Button>
              </div>
            </div>
            {summary ? (
              <div className='flex flex-wrap -mx-3'>
                <div className='px-3 w-full lg:w-6/12'>
                  <div className='flex flex-wrap -mx-3'>
                    <CommerceHubWidget summary={summary} />
                  </div>
                </div>
                <div className='px-3 w-full lg:w-6/12'>
                  <CheckNumberTable summary={summary} />
                </div>
              </div>
            ) : (
              <p className='text-[19.5px] font-semibold'>Loading...</p>
            )}
          </div>
        </div>
        {showUpdateInvoices.show && (
          <UpdateInvoicesModal showUpdateInvoices={showUpdateInvoices} setshowUpdateInvoices={setshowUpdateInvoices} stores={stores?.stores ?? []} mutate={mutate} />
        )}
      </React.Fragment>
    </div>
  )
}

export default Dashboard
