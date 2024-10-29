import React, { useContext } from 'react'
import AppContext from '@context/AppContext'
import { GetServerSideProps } from 'next'
import Head from 'next/head'
import { Col, Container, Row } from 'reactstrap'
import BreadCrumb from '@components/Common/BreadCrumb'
import { getSession } from '@auth/client'
import axios from 'axios'
import useSWR from 'swr'
import { toast } from 'react-toastify'
import CommerceHubWidget from '@components/commerceHub/CommerceHubWidget'
import { DashboardResponse } from '@typesTs/commercehub/dashboard'
import CheckNumberTable from '@components/commerceHub/CheckNumberTable'

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

const Dashboard = ({ session }: Props) => {
  const { state }: any = useContext(AppContext)
  const title = `Commerce HUB | ${session?.user?.businessName}`

  const fetcherSummary = (endPoint: string) =>
    axios(endPoint)
      .then((res) => res.data)
      .catch(({ error }) => {
        toast.error(error?.data?.message || 'Error fetching Summary data')
      })
  const { data: summary } = useSWR<DashboardResponse>(
    state.user.businessId ? `/api/commerceHub/getSummary?region=${state.currentRegion}&businessId=${state.user.businessId}` : null,
    fetcherSummary,
    {
      revalidateOnFocus: false,
      // revalidateOnMount: false,
    }
  )

  return (
    <div>
      <Head>
        <title>{title}</title>
      </Head>
      <React.Fragment>
        <div className='page-content'>
          <Container fluid>
            <BreadCrumb title='Dashboard' pageTitle='Commerce HUB' />
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
      </React.Fragment>
    </div>
  )
}

export default Dashboard
