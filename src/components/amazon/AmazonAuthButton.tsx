/* eslint-disable @next/next/no-img-element */
import AppContext from '@context/AppContext'
import Link from 'next/link'
import React, { useContext } from 'react'

type Props = {}

const AmazonAuthButton = ({}: Props) => {
  const { state }: any = useContext(AppContext)
  return (
    <div className='px-2'>
      <img
        src='https://onixventuregroup.goflow.com/images/channels/amazon.svg'
        alt='Amazon Image'
        style={{
          width: '20px',
          height: '20px',
          objectFit: 'contain',
        }}
        className='me-1'
      />
      {state.currentRegion == 'us' ? (
        <Link
          href={`https://sellercentral.amazon.com/apps/authorize/consent?application_id=amzn1.sp.solution.9ab6cdba-3a1d-4aaf-8e00-0d3c012bd7de&version=beta&state=ShelcloudStateTestAmazonSellers2023-12-12`}
          passHref>
          <a target='blank'>Connect to Amazon</a>
        </Link>
      ) : (
        <Link
          href={`https://sellercentral-europe.amazon.com/apps/authorize/consent?application_id=amzn1.sp.solution.9ab6cdba-3a1d-4aaf-8e00-0d3c012bd7de&version=beta&state=ShelcloudStateTestAmazonSellers2023-12-12`}
          passHref>
          <a target='blank' className='text-black'>
            Connect Amazon
          </a>
        </Link>
      )}
    </div>
  )
}

export default AmazonAuthButton
