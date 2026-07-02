/* eslint-disable @next/next/no-img-element */
import { GetServerSideProps } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import { useRouter } from 'next/router'
import React, { useContext, useState } from 'react'

import { getSession } from '@auth/client'
import BreadCrumb from '@components/Common/BreadCrumb'
import AppContext from '@context/AppContext'
import axios from 'axios'
import moment from 'moment'
import { toast } from 'react-toastify'
import { Button, Card, CardBody, Container, Spinner } from '@/components/migration-ui'
import { useSWRConfig } from 'swr'

import ShelfCloudLogoSolo from '../../assets/images/shelfcloud-blue-h-solo.png'

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

const AmazonAdsAuthRedirect = ({}: Props) => {
  const { state }: any = useContext(AppContext)
  const { mutate } = useSWRConfig()
  const router = useRouter()
  const { code } = router.query
  const [loading, setloading] = useState(false)
  const [expire] = useState(() => moment().add(5, 'minutes').format('h:mm:mm A'))

  const authorizeSeller = async () => {
    setloading(true)

    const response = await axios.get(`/api/amazon/addAdsAuthSeller?code=${code}&region=${state.currentRegion}&businessId=${state.user.businessId}`)

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
        <title>Amazon Ads Auth</title>
      </Head>
      <React.Fragment>
        <div className='page-content'>
          <Container fluid>
            <BreadCrumb title='Amazon Auth' pageTitle='Amazon' />
            <Card className='tw:py-12'>
              <CardBody className='tw:text-center'>
                <p className='tw:text-primary tw:font-semibold tw:text-[40px]'>ShelfCloud - Amazon Advertising Partner</p>
                <p className='tw:text-[var(--bs-secondary-color)] tw:font-normal tw:text-[22.75px]'>Integration</p>
                <div className='tw:flex tw:flex-row tw:justify-center tw:items-center tw:gap-6 tw:mt-6 tw:mb-12'>
                  <div
                    className='tw:relative'
                    style={{
                      display: 'inline-block',
                      width: '70px',
                      height: '60px',
                      objectFit: 'contain',
                    }}>
                    <Image
                      className='tw:rounded-lg'
                      src={ShelfCloudLogoSolo}
                      alt='ShelfCloud Logo'
                      style={{
                        maxWidth: '100%',
                        height: 'auto',
                        objectFit: 'contain',
                      }}
                    />
                  </div>
                  <i className='las la-sync-alt tw:text-[color:var(--bs-secondary-color)] tw:text-[calc(1.328125rem+0.9375vw)]'></i>
                  <div>
                    <img
                      loading='lazy'
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

                <div className='tw:flex tw:flex-col tw:justify-center tw:items-center tw:gap-12'>
                  <Button className='tw:mt-2 tw:text-[16.25px]' color='primary' onClick={() => authorizeSeller()}>
                    {loading ? <Spinner color='#fff' /> : 'Authorize ShelfCloud'}
                  </Button>
                  <Button className='tw:mt-2 tw:text-[13px]' color='light' onClick={() => router.push('/')}>
                    Cancel
                  </Button>
                </div>
                <p className='tw:text-[var(--bs-secondary-color)] tw:font-normal tw:text-[13px] tw:mt-0'>Expire at: {expire}</p>
              </CardBody>
            </Card>
          </Container>
        </div>
      </React.Fragment>
    </div>
  )
}

export default AmazonAdsAuthRedirect
