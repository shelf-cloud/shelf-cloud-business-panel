import Link from 'next/link'
import React from 'react'

type Props = {}

const AmazonAuthButton = (props: Props) => {
  return (
    <Link href={'https://sellercentral.amazon.com/apps/authorize/consent?application_id=amzn1.sp.solution.aaa88ff9-b04b-4cc6-88d0-1029e4e271e0&version=beta'} passHref>
      <a target='blank'>Authorize with Amazon</a>
    </Link>
  )
}

export default AmazonAuthButton
