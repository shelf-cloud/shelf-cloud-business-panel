import { GetServerSideProps } from 'next'
import Head from 'next/head'
import { useContext, useState } from 'react'

import { getSession } from '@auth/client'
import BreadCrumb from '@components/Common/BreadCrumb'
import DashboardHeader from '@components/DashboardHeader'
import InvoicesList from '@components/InvoicesList'
import MostInvenotryList from '@components/MostInvenotryList'
// import { Summary } from '@typings'
import TotalChagesList from '@components/TotalChagesList'
import Widget from '@components/Widget'
import SalesOverTime from '@components/dashboard/SalesOverTime'
import SalesOverTimeError from '@components/dashboard/SalesOverTime-error'
import SalesOverTimeLoading from '@components/dashboard/SalesOverTime-loading'
import AppContext from '@context/AppContext'
import { SalesOverTimeResponse } from '@typesTs/dashboard/salesOverTime'
import axios from 'axios'
import moment from 'moment'
import { toast } from 'react-toastify'
import { Col, Container, Row } from 'reactstrap'
import useSWR from 'swr'

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
      name: string
    }
  }
}
const fetcherSummary = (endPoint: string) =>
  axios(endPoint)
    .then((res) => res.data)
    .catch(() => {
      toast.error('Error fetching Summary data')
    })

const fetcherSalesOverTime = (endPoint: string) =>
  axios<SalesOverTimeResponse>(endPoint)
    .then((res) => (res.data.error ? { error: true } : res.data))
    .catch(() => {
      toast.error('Error fetching Sales Over Time data')
    })

const Home = ({ session }: Props) => {
  const { state }: any = useContext(AppContext)
  const [dashboardStartDate, setDashboardStartDate] = useState(moment().subtract(30, 'days').format('YYYY-MM-DD'))
  const [dashboardEndDate, setDashboardEndDate] = useState(moment().format('YYYY-MM-DD'))

  const { data: summary } = useSWR(
    state.user.businessId
      ? `/api/getBusinessSummary?region=${state.currentRegion}&businessId=${state.user.businessId}&startDate=${dashboardStartDate}&endDate=${dashboardEndDate}`
      : null,
    fetcherSummary,
    {
      revalidateOnFocus: false,
    }
  )

  const { data: salesOverTime, isValidating: isLoadingSalesOverTime } = useSWR(
    session && state.user.businessId ? `/api/home/get-sales-over-time?region=${state.currentRegion}&businessId=${state.user.businessId}&storeId=9999` : null,
    fetcherSalesOverTime,
    { revalidateOnFocus: false }
  )

  const handleChangeDates = (dateStr: string) => {
    if (dateStr.includes(' to ')) {
      const dates = dateStr.split(' to ')
      setDashboardStartDate(moment(dates[0], 'DD MMM YY').format('YYYY-MM-DD'))
      setDashboardEndDate(moment(dates[1], 'DD MMM YY').format('YYYY-MM-DD'))
    }
  }

  return (
    <div>
      <Head>
        <title>Shelf Cloud Dashboard</title>
        <meta name='description' content='Shelf Cloud All-in-One Fulfillment Platform' />
        <link rel='icon' href='/favicon.ico' />
      </Head>

      <div className='page-content'>
        <BreadCrumb title='Dashboard' pageTitle='Dashboard' />
        <Container fluid>
          <Row>
            <Col>
              <DashboardHeader user={state.user.name} handleChangeDates={handleChangeDates} startDate={dashboardStartDate} endDate={dashboardEndDate} />
              {summary ? (
                <>
                  <Row>
                    <Widget summary={summary} />
                  </Row>
                  <Row>
                    <Col md={7}>
                      {isLoadingSalesOverTime ? (
                        <SalesOverTimeLoading />
                      ) : salesOverTime?.error ? (
                        <SalesOverTimeError />
                      ) : salesOverTime ? (
                        <SalesOverTime salesOverTime={salesOverTime} />
                      ) : null}
                      {summary && <MostInvenotryList products={summary?.mostInventory} />}
                    </Col>
                    <Col md={5}>
                      <TotalChagesList totalCharges={summary?.totalCharges} />
                      <InvoicesList invoices={summary?.invoices} />
                    </Col>
                  </Row>
                </>
              ) : (
                <Row>
                  <h5>Loading...</h5>
                </Row>
              )}
            </Col>
          </Row>
        </Container>
      </div>
    </div>
  )
}

export default Home
