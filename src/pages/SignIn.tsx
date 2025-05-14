import React, { FormEventHandler, useRef, useState } from 'react'
import Image from "next/legacy/image"
import ShelfCloudLogo from '@assets/images/shelfcloud-blue-h.png'
import RightImage from '@assets/images/signin-image-right.png'
import PuntosImage from '@assets/images/signin-puntos.png'
import LinesImage from '@assets/images/signin-lines.png'
import { Button, Label } from 'reactstrap'
import { getSession, signIn } from '@auth/client'
import { GetServerSideProps } from 'next'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Head from 'next/head'
import ForgotPasswordModal from '@components/ForgotPasswordModal'

export const getServerSideProps: GetServerSideProps<{}> = async (context) => {
  const session = await getSession(context)
  if (session != null) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    }
  }
  return {
    props: {
      session,
    },
  }
}

type Props = {}

function SignIn({}: Props) {
  const [show, setShow] = useState(false)
  const [OpenForgotPassword, setOpenForgotPassword] = useState(false)
  const { query } = useRouter()
  const usernameRef = useRef<any>(null)
  const passwordRef = useRef<any>(null)

  const handleSignInSubmit: FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault()

    await signIn('credentials', {
      username: usernameRef.current?.value,
      password: passwordRef.current?.value,
    })
  }

  return (
    <>
      <Head>
        <title>Sign In - Shelf Cloud Panel</title>
        <meta name='description' content='Shelf Cloud All-in-One Fulfillment Platform' />
        <link rel='icon' href='/favicon.ico' />
      </Head>
      <div className='vw-100 vh-100 d-flex '>
        <div className='w-100 h-100 d-flex flex-column align-items-center justify-content-start' style={{ backgroundColor: '#FAFBFD' }}>
          <div className='w-100 px-4 py-2 border-bottom h-fit'>
            <div className='position-relative d-flex align-self-center h-100' style={{ width: '26%', minWidth: '220px' }}>
              <Image src={ShelfCloudLogo} layout='intrinsic' alt='ShelfCloud Logo' objectFit='contain' />
            </div>
          </div>
          <div className='col-10 col-lg-8 h-fit m-auto d-flex justify-content-center align-items-center' style={{ backgroundColor: '#FAFBFD' }}>
            <div className='w-75 d-flex flex-column justify-content-start align-items-center'>
              <h2 className='w-100 text-center fw-semibold mb-3'>Sign in</h2>
              <p className='w-100 text-center fs-5 mb-5'>
                New user?{' '}
                <a href={'https://www.shelf-cloud.com'} target='blank' className=' text-primary fw-semibold'>
                  Create an account
                </a>
              </p>
              <form onSubmit={handleSignInSubmit} className='w-100'>
                <div className='mb-4 w-100'>
                  <Label htmlFor='username' className='form-label'>
                    Username
                  </Label>
                  <input type='text' className='form-control' id='username' name='username' placeholder='Enter username' required ref={usernameRef} />
                </div>
                <div className='mb-1 w-100'>
                  <Label className='form-label' htmlFor='password-input'>
                    Password
                  </Label>
                  <div className='position-relative auth-pass-inputgroup mb-3'>
                    <input type={show ? 'text' : 'password'} className='form-control pe-5' placeholder='Enter password' id='password' required name='password' ref={passwordRef} />
                    <button
                      name='passwordVisibility'
                      className='btn btn-link position-absolute end-0 top-0 text-decoration-none text-muted'
                      type='button'
                      id='password-addon'
                      onClick={() => setShow(!show)}>
                      <i className='ri-eye-fill align-middle fs-5'></i>
                    </button>
                  </div>
                </div>
                {query.error && <p className='m-0 p-0 mb-1 text-danger fs-6'>Verify your Sign In credentials!</p>}
                <div className='w-100 text-end'>
                  <a href='#' className='text-primary fs-6' onClick={() => setOpenForgotPassword(true)}>
                    Forgot password?
                  </a>
                </div>
                <div className='mt-4 w-100'>
                  <Button color='primary' className='btn btn-primary w-100 fw-semibold fs-5' type='submit'>
                    Sign In
                  </Button>
                </div>
              </form>
              <p className='w-100 text-left fs-5 mt-3'>
                Have a question?{' '}
                <Link href={'/ContactForm'} className='text-primary fw-semibold'>
                  Contact Us
                </Link>
              </p>
            </div>
          </div>
        </div>
        <div className='d-none w-100 h-100 bg-primary d-lg-flex justify-content-center align-items-center'>
          <div className='d-flex flex-column justify-content-center align-items-start' style={{ width: '65%' }}>
            <h2 className='fs-1 fw-bold text-white text-start m-0 p-0 w-100 mb-3'>Welcome Back</h2>
            <p className='fs-5 fw-light text-white text-start m-0 p-0 w-100 mb-3'>4 in 1 Cloud-Based Software Solutions for Small Business.</p>
            <div className='position-relative text-start mb-3' style={{ width: '70px' }}>
              <Image src={LinesImage} layout='intrinsic' alt='ShelfCloud Logo' objectFit='contain' />
            </div>
            <div className='w-100 position-relative'>
              <div className='position-relative text-start' style={{ width: '100%', zIndex: '9' }}>
                <Image priority src={RightImage} layout='intrinsic' alt='ShelfCloud Logo' objectFit='contain' />
              </div>
              <div className='position-absolute translate-middle' style={{ width: '45%', zIndex: '1', top: '85%', left: '95%' }}>
                <Image src={PuntosImage} layout='intrinsic' alt='ShelfCloud Logo' objectFit='contain' />
              </div>
            </div>
          </div>
        </div>
        {OpenForgotPassword && <ForgotPasswordModal OpenForgotPassword={OpenForgotPassword} setOpenForgotPassword={setOpenForgotPassword} />}
      </div>
    </>
  )
}

export default SignIn
