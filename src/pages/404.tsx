import React from 'react'
// import Animation from '@components/Common/Animation'
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
        <div className="page-content">
          <Container
            fluid
            className="h-100 w-100 flex flex-column align-items-center justify-content-middle text-center"
          >
            <h1 className="fw-bold fs-1 mt-2 mb-2">PAGE NOT FOUND</h1>
            <h3 className="fw-normal fs-3 mt-2 mb-2">
              Return to Home <Link href={'/'}>Return</Link>
            </h3>
            <Animation
              src="https://lordicon.com/assets/animations/no-icons-to-show.json"
              colors="primary:#405189,secondary:#0ab39c"
              style={{ width: '100%', height: '500px' }}
            />
          </Container>
        </div>
      </React.Fragment>
    </div>
  )
}

export default NotFound
