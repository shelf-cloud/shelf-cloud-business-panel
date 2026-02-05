 
import Link from 'next/link'
import { useContext } from 'react'

import AppContext from '@context/AppContext'
import { Button } from 'reactstrap'

type Props = {}

const AmazonReconnectButton = ({}: Props) => {
  const { state }: any = useContext(AppContext)
  return (
    <div className='px-2'>
      {state.currentRegion == 'us' ? (
        <Link
          href={`https://sellercentral.amazon.com/apps/authorize/consent?application_id=amzn1.sp.solution.9ab6cdba-3a1d-4aaf-8e00-0d3c012bd7de&version=beta&state=ShelcloudReconnectAmazonSeller`}
          target='blank'>
          <Button color='info'>Update Connection</Button>
        </Link>
      ) : (
        <Link
          href={`https://sellercentral-europe.amazon.com/apps/authorize/consent?application_id=amzn1.sp.solution.9ab6cdba-3a1d-4aaf-8e00-0d3c012bd7de&version=beta&state=ShelcloudReconnectAmazonSeller`}
          target='blank'>
          <Button color='info'>Update Connection</Button>
        </Link>
      )}
    </div>
  )
}

export default AmazonReconnectButton
