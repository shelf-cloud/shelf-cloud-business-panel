import { GetServerSideProps } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { FormEventHandler, useRef, useState } from 'react'

import ShelfCloudLogo from '@assets/images/shelfcloud-blue-h.png'
import RightImage from '@assets/images/signin-image-right.png'
import LinesImage from '@assets/images/signin-lines.png'
import PuntosImage from '@assets/images/signin-puntos.png'
import { getSession, signIn } from '@auth/client'
import ForgotPasswordModal from '@components/ForgotPasswordModal'

import { Button, Label } from '@/components/migration-ui'

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
      <div className='tw:w-screen tw:h-screen tw:flex'>
        <div className='tw:w-full tw:h-full tw:flex tw:flex-col tw:items-center tw:justify-start' style={{ backgroundColor: '#FAFBFD' }}>
          <div className='tw:w-full tw:px-6 tw:py-2 tw:border-b tw:h-fit'>
            <div className='tw:relative tw:flex tw:self-center tw:h-full' style={{ width: '26%', minWidth: '220px' }}>
              <Image
                src={ShelfCloudLogo}
                alt='ShelfCloud Logo'
                style={{
                  maxWidth: '100%',
                  height: 'auto',
                  objectFit: 'contain',
                }}
              />
            </div>
          </div>
          <div className='tw:w-10/12 tw:lg:w-8/12 tw:h-fit tw:m-auto tw:flex tw:justify-center tw:items-center' style={{ backgroundColor: '#FAFBFD' }}>
            <div className='tw:w-3/4 tw:flex tw:flex-col tw:justify-start tw:items-center'>
              <h2 className='tw:w-full tw:text-center tw:font-semibold tw:mb-4'>Sign in</h2>
              <p className='tw:w-full tw:text-center tw:text-[16.25px] tw:mb-8'>
                New user?{' '}
                <a href={'https://www.shelf-cloud.com'} target='blank' rel='noopener noreferrer' className='tw:!text-primary tw:font-semibold'>
                  Create an account
                </a>
              </p>
              <form onSubmit={handleSignInSubmit} className='tw:w-full'>
                <div className='tw:mb-6 tw:w-full'>
                  <Label htmlFor='username' className='form-label'>
                    Username
                  </Label>
                  <input type='text' className='form-control' id='username' name='username' placeholder='Enter username' required ref={usernameRef} />
                </div>
                <div className='tw:mb-1 tw:w-full'>
                  <Label className='form-label' htmlFor='password-input'>
                    Password
                  </Label>
                  <div className='tw:relative auth-pass-inputgroup tw:mb-4'>
                    <input
                      type={show ? 'text' : 'password'}
                      className='form-control tw:pe-12'
                      placeholder='Enter password'
                      id='password'
                      required
                      name='password'
                      ref={passwordRef}
                    />
                    <button
                      name='passwordVisibility'
                      className='btn btn-link tw:absolute tw:right-0 tw:top-0 tw:no-underline tw:text-[var(--bs-secondary-color)]'
                      type='button'
                      id='password-addon'
                      onClick={() => setShow(!show)}>
                      <i className='ri-eye-fill align-middle fs-5'></i>
                    </button>
                  </div>
                </div>
                {query.error && <p className='tw:m-0 tw:p-0 tw:mb-1 tw:text-danger tw:text-[13px]'>Verify your Sign In credentials!</p>}
                <div className='tw:w-full tw:text-right'>
                  <a href='#' className='tw:!text-primary tw:text-[13px]' onClick={() => setOpenForgotPassword(true)}>
                    Forgot password?
                  </a>
                </div>
                <div className='tw:mt-6 tw:w-full'>
                  <Button color='primary' className='btn btn-primary tw:w-full tw:font-semibold tw:text-[16.25px]' type='submit'>
                    Sign In
                  </Button>
                </div>
              </form>
              <p className='tw:w-full tw:text-left tw:text-[16.25px] tw:mt-4'>
                Have a question?{' '}
                <Link href={'/ContactForm'} className='tw:!text-primary tw:font-semibold'>
                  Contact Us
                </Link>
              </p>
            </div>
          </div>
        </div>
        <div className='tw:hidden tw:w-full tw:h-full tw:bg-primary tw:lg:flex tw:justify-center tw:items-center'>
          <div className='tw:flex tw:flex-col tw:justify-center tw:items-start' style={{ width: '65%' }}>
            <h2 className='tw:text-[22.75px] tw:font-bold tw:text-white tw:text-left tw:m-0 tw:p-0 tw:w-full tw:mb-4'>Welcome Back</h2>
            <p className='tw:text-[16.25px] tw:font-light tw:text-white tw:text-left tw:m-0 tw:p-0 tw:w-full tw:mb-4'>4 in 1 Cloud-Based Software Solutions for Small Business.</p>
            <div className='tw:relative tw:text-left tw:mb-4' style={{ width: '70px' }}>
              <Image
                src={LinesImage}
                alt='ShelfCloud Lines Image'
                style={{
                  maxWidth: '100%',
                  height: 'auto',
                  objectFit: 'contain',
                }}
              />
            </div>
            <div className='tw:w-full tw:relative'>
              <div className='tw:relative tw:text-left' style={{ width: '100%', zIndex: '9' }}>
                <Image
                  src={RightImage}
                  alt='ShelfCloud Dashboard Image'
                  style={{
                    maxWidth: '100%',
                    height: 'auto',
                    objectFit: 'contain',
                  }}
                />
              </div>
              <div className='tw:absolute translate-middle' style={{ width: '45%', zIndex: '1', top: '85%', left: '95%' }}>
                <Image
                  src={PuntosImage}
                  alt='ShelfCloud Background dots Image'
                  style={{
                    maxWidth: '100%',
                    height: 'auto',
                    objectFit: 'contain',
                  }}
                />
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
