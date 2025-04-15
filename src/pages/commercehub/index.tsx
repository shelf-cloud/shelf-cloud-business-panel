import React, { useContext, useState } from 'react'
import AppContext from '@context/AppContext'
import { GetServerSideProps } from 'next'
import Head from 'next/head'
import { Button, Col, Container, Row } from 'reactstrap'
import BreadCrumb from '@components/Common/BreadCrumb'
import { getSession } from '@auth/client'
import axios from 'axios'
import useSWR from 'swr'
import { toast } from 'react-toastify'
import CommerceHubWidget from '@components/commerceHub/CommerceHubWidget'
import { DashboardResponse } from '@typesTs/commercehub/dashboard'
import CheckNumberTable from '@components/commerceHub/CheckNumberTable'
import UpdateInvoicesModal from '@components/modals/commercehub/UpdateInvoicesModal'
import { CommerceHubStoresResponse } from '@typesTs/commercehub/invoices'

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

  const { data: summary, mutate } = useSWR<DashboardResponse>(state.user.businessId ? `/api/commerceHub/getSummary?region=${state.currentRegion}&businessId=${state.user.businessId}` : null, fetcherSummary, {
    revalidateOnFocus: false,
    // revalidateOnMount: false,
  })

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
            <div className='d-flex flex-column justify-content-center align-items-end gap-2 mb-3 flex-lg-row justify-content-md-between align-items-md-center px-1'>
              <div className='w-100 d-flex flex-column justify-content-center align-items-start gap-2 mb-0 flex-lg-row justify-content-lg-start align-items-lg-center px-0'>
                <Button
                  color='primary'
                  className='fs-7 text-nowrap'
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
              <p className='fs-4 fw-semibold'>Loading...</p>
            )}
          </Container>
        </div>
        {showUpdateInvoices.show && <UpdateInvoicesModal showUpdateInvoices={showUpdateInvoices} setshowUpdateInvoices={setshowUpdateInvoices} stores={stores?.stores ?? []} mutate={mutate} />}
      </React.Fragment>
    </div>
  )
}

export default Dashboard
