/* eslint-disable @next/next/no-img-element */
import AppContext from '@context/AppContext'
import Link from 'next/link'
import React, { useContext } from 'react'
import { Button } from 'reactstrap'

type Props = {
  env: string
}

const AmazonAdsAuthButton = ({ env }: Props) => {
  const { state }: any = useContext(AppContext)
  return (
    <div className='px-2'>
      {state.currentRegion == 'us' ? (
        <Link
          href={
            env === 'development'
              ? `https://www.amazon.com/ap/oa?scope=advertising::campaign_management&response_type=code&client_id=amzn1.application-oa2-client.fe75e469490f408baf6ccfbde82fe836&state=ShelfCloudStateAmazonAdsSellers&redirect_uri=https://shelf-cloud-development.vercel.app/amazon-sellers/amazonAdsAuthRedirect`
              : `https://www.amazon.com/ap/oa?scope=advertising::campaign_management&response_type=code&client_id=amzn1.application-oa2-client.fe75e469490f408baf6ccfbde82fe836&state=ShelfCloudStateAmazonAdsSellers&redirect_uri=https://www.panel.shelf-cloud.com/amazon-sellers/amazonAdsAuthRedirect`
          }
          target='blank'>
          <Button outline color='info'>
            Connect
          </Button>
        </Link>
      ) : (
        <Link
          href={
            env === 'development'
              ? `https://eu.account.amazon.com/ap/oa?scope=advertising::campaign_management&response_type=code&client_id=amzn1.application-oa2-client.fe75e469490f408baf6ccfbde82fe836&state=ShelfCloudStateAmazonAdsSellers&redirect_uri=https://shelf-cloud-development.vercel.app/amazon-sellers/amazonAdsAuthRedirect`
              : `https://eu.account.amazon.com/ap/oa?scope=advertising::campaign_management&response_type=code&client_id=amzn1.application-oa2-client.fe75e469490f408baf6ccfbde82fe836&state=ShelfCloudStateAmazonAdsSellers&redirect_uri=https://www.panel.shelf-cloud.com/amazon-sellers/amazonAdsAuthRedirect`
          }
          target='blank'>
          <Button outline color='info'>
            Connect
          </Button>
        </Link>
      )}
    </div>
  )
}

export default AmazonAdsAuthButton
