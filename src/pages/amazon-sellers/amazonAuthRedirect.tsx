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
import { toast } from '@/lib/toast'
import { Button } from '@shadcn/ui/button'
import { Card, CardContent } from '@shadcn/ui/card'
import { Spinner } from '@shadcn/ui/spinner'
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

const AmazonAuthRedirect = ({}: Props) => {
  const { state }: any = useContext(AppContext)
  const { mutate } = useSWRConfig()
  const router = useRouter()
  const { spapi_oauth_code, selling_partner_id, state: amzState } = router.query
  const [loading, setloading] = useState(false)
  const [expire] = useState(() => moment().add(5, 'minutes').format('h:mm:mm A'))

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

  const reauthorizeSeller = async () => {
    setloading(true)

    const response = await axios.get(
      `/api/amazon/reAuthSeller?code=${spapi_oauth_code}&region=${state.currentRegion}&businessId=${state.user.businessId}&sellerId=${selling_partner_id}`
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
          <div className='mx-auto w-full px-3'>
            <BreadCrumb title='Amazon Auth' pageTitle='Amazon' />
            <Card className='py-12'>
              <CardContent className='text-center'>
                <p className='text-primary font-semibold text-[40px]'>ShelfCloud - Amazon</p>
                <p className='text-muted-foreground font-normal text-[22.75px]'>Integration</p>
                <div className='flex flex-row justify-center items-center gap-6 mt-6 mb-12'>
                  <div
                    className='relative'
                    style={{
                      display: 'inline-block',
                      width: '70px',
                      height: '60px',
                      objectFit: 'contain',
                    }}>
                    <Image
                      className='rounded-lg'
                      src={ShelfCloudLogoSolo}
                      alt='ShelfCloud Logo'
                      style={{
                        maxWidth: '100%',
                        height: 'auto',
                        objectFit: 'contain',
                      }}
                    />
                  </div>
                  <i className='las la-sync-alt text-muted-foreground text-[calc(1.328125rem+0.9375vw)]'></i>
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

                <div className='flex flex-col justify-center items-center gap-12'>
                  {amzState === 'ShelcloudNewAmazonSeller' ? (
                    <Button className='mt-2 text-[16.25px]' onClick={() => authorizeSeller()}>
                      {loading ? <Spinner className='text-white' /> : 'Authorize ShelfCloud'}
                    </Button>
                  ) : (
                    <Button className='mt-2 text-[16.25px]' onClick={() => reauthorizeSeller()}>
                      {loading ? <Spinner className='text-white' /> : 'Reauthorize ShelfCloud'}
                    </Button>
                  )}
                  <Button className='mt-2 text-[13px]' variant='light' onClick={() => router.push('/')}>
                    Cancel
                  </Button>
                </div>
                <p className='text-muted-foreground font-normal text-[13px] mt-0'>Expire at: {expire}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </React.Fragment>
    </div>
  )
}

export default AmazonAuthRedirect
