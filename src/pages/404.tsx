import React from 'react'
import dynamic from 'next/dynamic'
import Head from 'next/head'
import { Container } from 'reactstrap'
import Link from 'next/link'

const Animation = dynamic(() => import('@components/Common/Animation'), {
  ssr: false,
})

const NotFound = () => {
  return (
    <div>
      <Head>
        <title>Not Found</title>
      </Head>
      <React.Fragment>
        <div className='page-content'>
          <Container fluid className='h-100 w-100 flex flex-column align-items-center justify-content-middle text-center'>
            <h1 className='fw-bold fs-1 mt-2 mb-2'>PAGE NOT FOUND</h1>
            <h3 className='fw-normal fs-3 mt-2 mb-2'>
              Return to <Link href={'/'}>Home</Link>
            </h3>
            <Animation src='https://cdn.lordicon.com/cvpqeffe.json' colors='primary:#405189,secondary:#0ab39c' style={{ width: '100%', height: '500px' }} />
          </Container>
        </div>
      </React.Fragment>
    </div>
  )
}

export default NotFound
