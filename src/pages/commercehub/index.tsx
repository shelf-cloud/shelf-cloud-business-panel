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
import { toast } from 'react-toastify'
import { Button, Col, Container, Row } from '@/components/migration-ui'
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
          <Container fluid>
            <div className='tw:flex tw:flex-col tw:justify-center tw:items-end tw:gap-2 tw:mb-4 tw:lg:flex-row tw:md:justify-between tw:md:items-center tw:px-1'>
              <div className='tw:w-full tw:flex tw:flex-col tw:justify-center tw:items-start tw:gap-2 tw:tw:mb-0 tw:lg:flex-row tw:lg:justify-start tw:lg:items-center tw:px-0'>
                <Button
                  color='primary'
                  className='tw:text-[11.2px] tw:text-nowrap'
                  onClick={() => {
                    setshowUpdateInvoices({ show: true })
                  }}>
                  Update Invoices
                </Button>
              </div>
            </div>
            {summary ? (
              <Row>
                <Col xs={12} lg={6}>
                  <Row>
                    <CommerceHubWidget summary={summary} />
                  </Row>
                </Col>
                <Col xs={12} lg={6}>
                  <CheckNumberTable summary={summary} />
                </Col>
              </Row>
            ) : (
              <p className='tw:text-[19.5px] tw:font-semibold'>Loading...</p>
            )}
          </Container>
        </div>
        {showUpdateInvoices.show && (
          <UpdateInvoicesModal showUpdateInvoices={showUpdateInvoices} setshowUpdateInvoices={setshowUpdateInvoices} stores={stores?.stores ?? []} mutate={mutate} />
        )}
      </React.Fragment>
    </div>
  )
}

export default Dashboard
