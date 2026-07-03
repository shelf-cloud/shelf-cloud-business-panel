import dynamic from 'next/dynamic'
import Head from 'next/head'
import Link from 'next/link'
import React from 'react'

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
          <div className='mx-auto w-full px-3 h-full w-full flex flex-col items-center justify-center text-center'>
            <h1 className='font-bold text-[2.5rem] mt-2 mb-2'>PAGE NOT FOUND</h1>
            <h3 className='font-normal text-[22.75px] mt-2 mb-2'>
              Return to <Link href={'/'}>Home</Link>
            </h3>
            <Animation src='https://cdn.lordicon.com/cvpqeffe.json' colors='primary:#405189,secondary:#0ab39c' style={{ width: '100%', height: '500px' }} />
          </div>
        </div>
      </React.Fragment>
    </div>
  )
}

export default NotFound
