/* eslint-disable @next/next/no-img-element */
import { useRouter } from 'next/router'
import React, { useContext, useEffect, useState } from 'react'
import { GetServerSideProps } from 'next'
import { getSession } from '@auth/client'
import Head from 'next/head'
import { Button, Card, CardBody, Container, Spinner } from 'reactstrap'
import BreadCrumb from '@components/Common/BreadCrumb'
import axios from 'axios'
import AppContext from '@context/AppContext'
import Image from 'next/image'
import ShelfCloudLogoSolo from '../../assets/images/shelfcloud-blue-h-solo.png'
import moment from 'moment'
import { useSWRConfig } from 'swr'
import { toast } from 'react-toastify'

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

const AmazonAuthRedirect = ({}: Props) => {
  const { state }: any = useContext(AppContext)
  const { mutate } = useSWRConfig()
  const router = useRouter()
  const { spapi_oauth_code, selling_partner_id } = router.query
  const [loading, setloading] = useState(false)
  const [expire, setexpire] = useState('')

  useEffect(() => {
    setexpire(moment().add(5, 'minutes').format('h:mm:mm A'))
  }, [])

  const authorizeSeller = async () => {
    setloading(true)

    const response = await axios.get(
      `/api/amazon/addAuthSeller?code=${spapi_oauth_code}&region=${state.currentRegion}&businessId=${state.user.businessId}&sellerId=${selling_partner_id}`
    )

    if (!response.data.error) {
      toast.success(response.data.message)
      mutate('/api/getuser')
      router.push('/')
    } else {
      toast.error(response.data.message)
    }
    setloading(false)
  }

  return (
    <div>
      <Head>
        <title>Amazon Auth</title>
      </Head>
      <React.Fragment>
        <div className='page-content'>
          <Container fluid>
            <BreadCrumb title='Amazon Auth' pageTitle='Amazon' />
            <Card className='py-5'>
              <CardBody className='text-center'>
                <p className='text-primary fw-semibold fs-1'>ShelfCloud - Amazon</p>
                <p className='text-muted fw-normal fs-3'>Integration</p>
                <div className='d-flex flex-row justify-content-center align-items-center gap-4 mt-3 mb-5'>
                  <div
                    className='position-relative'
                    style={{
                      display: 'inline-block',
                      width: '70px',
                      height: '60px',
                      objectFit: 'contain',
                    }}>
                    <Image className='rounded-3' src={ShelfCloudLogoSolo} layout='intrinsic' alt='ShelfCloud Logo' objectFit='contain' />
                  </div>
                  <i className='las la-sync-alt text-muted fs-1'></i>
                  <div>
                    <img
                      src='https://onixventuregroup.goflow.com/images/channels/amazon.svg'
                      alt='Amazon Image'
                      style={{
                        width: '60px',
                        height: '60px',
                        objectFit: 'contain',
                      }}
                    />
                  </div>
                </div>

                <div className='d-flex flex-column justify-content-center align-items-center gap-5'>
                  <Button className='mt-2 fs-5 btn btn-primary' onClick={() => authorizeSeller()}>
                    {loading ? <Spinner color='#fff' /> : 'Authorize ShelfCloud'}
                  </Button>
                  <Button className='mt-2 fs-6 btn btn-light' onClick={() => router.push('/')}>
                    Cancel
                  </Button>
                </div>
                <p className='text-muted fw-normal fs-6 mt-0'>Expire at: {expire}</p>
              </CardBody>
            </Card>
          </Container>
        </div>
      </React.Fragment>
    </div>
  )
}

export default AmazonAuthRedirect
