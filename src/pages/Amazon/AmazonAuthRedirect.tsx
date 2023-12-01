import { useRouter } from 'next/router'
import React from 'react'
import { GetServerSideProps } from 'next'
import { getSession } from '@auth/client'

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

const AmazonAuthRedirect = ({}: Props) => {
  const router = useRouter()
  const { selling_partner_id, mws_auth_token, spapi_oauth_code } = router.query
  return (
    <div>
      <h1>Amazon Authorize Correct</h1>
      <p>{selling_partner_id}</p>
      <p>{mws_auth_token}</p>
      <p>{spapi_oauth_code}</p>
    </div>
  )
}

export default AmazonAuthRedirect
