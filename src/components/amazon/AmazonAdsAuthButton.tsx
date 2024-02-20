/* eslint-disable @next/next/no-img-element */
import AppContext from '@context/AppContext'
import Link from 'next/link'
import React, { useContext } from 'react'
import { Button } from 'reactstrap'

type Props = {}

const AmazonAdsAuthButton = ({}: Props) => {
  const { state }: any = useContext(AppContext)
  return (
    <div className='px-2'>
      {state.currentRegion == 'us' ? (
        <Link
          href={`#`}
          passHref>
          <a target='blank'>
            <Button outline color='info'>
              Connect
            </Button>
          </a>
        </Link>
      ) : (
        <Link
          href={`#`}
          passHref>
          <a target='blank'>
            <Button outline color='info'>
              Connect
            </Button>
          </a>
        </Link>
      )}
    </div>
  )
}

export default AmazonAdsAuthButton
