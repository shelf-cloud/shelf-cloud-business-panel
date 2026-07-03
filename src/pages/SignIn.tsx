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

import { Button, buttonVariants } from '@shadcn/ui/button'
import { cn } from '@/lib/shadcn/utils'
import { Input } from '@shadcn/ui/input'
import { Label } from '@shadcn/ui/label'

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
      <div className='w-screen h-screen flex'>
        <div className='w-full h-full flex flex-col items-center justify-start' style={{ backgroundColor: '#FAFBFD' }}>
          <div className='w-full px-6 py-2 border-b h-fit'>
            <div className='relative flex self-center h-full' style={{ width: '26%', minWidth: '220px' }}>
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
          <div className='w-10/12 lg:w-8/12 h-fit m-auto flex justify-center items-center' style={{ backgroundColor: '#FAFBFD' }}>
            <div className='w-3/4 flex flex-col justify-start items-center'>
              <h2 className='w-full text-center font-semibold mb-4'>Sign in</h2>
              <p className='w-full text-center text-[16.25px] mb-8'>
                New user?{' '}
                <a href={'https://www.shelf-cloud.com'} target='blank' rel='noopener noreferrer' className='!text-primary font-semibold'>
                  Create an account
                </a>
              </p>
              <form onSubmit={handleSignInSubmit} className='w-full'>
                <div className='mb-6 w-full'>
                  <Label htmlFor='username' className='mb-2'>
                    Username
                  </Label>
                  <Input type='text' id='username' name='username' placeholder='Enter username' required ref={usernameRef} />
                </div>
                <div className='mb-1 w-full'>
                  <Label className='mb-2' htmlFor='password-input'>
                    Password
                  </Label>
                  <div className='relative auth-pass-inputgroup mb-4'>
                    <Input
                      type={show ? 'text' : 'password'}
                      className='pe-12'
                      placeholder='Enter password'
                      id='password'
                      required
                      name='password'
                      ref={passwordRef}
                    />
                    <button
                      name='passwordVisibility'
                      className={cn(buttonVariants({ variant: 'link' }), 'absolute right-0 top-0 no-underline text-muted-foreground')}
                      type='button'
                      id='password-addon'
                      onClick={() => setShow(!show)}>
                      <i className='ri-eye-fill align-middle text-[16.25px]'></i>
                    </button>
                  </div>
                </div>
                {query.error && <p className='m-0 p-0 mb-1 text-danger text-[13px]'>Verify your Sign In credentials!</p>}
                <div className='w-full text-right'>
                  <a href='#' className='!text-primary text-[13px]' onClick={() => setOpenForgotPassword(true)}>
                    Forgot password?
                  </a>
                </div>
                <div className='mt-6 w-full'>
                  <Button className='w-full font-semibold text-[16.25px]' type='submit'>
                    Sign In
                  </Button>
                </div>
              </form>
              <p className='w-full text-left text-[16.25px] mt-4'>
                Have a question?{' '}
                <Link href={'/ContactForm'} className='!text-primary font-semibold'>
                  Contact Us
                </Link>
              </p>
            </div>
          </div>
        </div>
        <div className='hidden w-full h-full bg-primary lg:flex justify-center items-center'>
          <div className='flex flex-col justify-center items-start' style={{ width: '65%' }}>
            <h2 className='text-[22.75px] font-bold text-white text-left m-0 p-0 w-full mb-4'>Welcome Back</h2>
            <p className='text-[16.25px] font-light text-white text-left m-0 p-0 w-full mb-4'>4 in 1 Cloud-Based Software Solutions for Small Business.</p>
            <div className='relative text-left mb-4' style={{ width: '70px' }}>
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
            <div className='w-full relative'>
              <div className='relative text-left' style={{ width: '100%', zIndex: '9' }}>
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
              <div className='absolute -translate-x-1/2 -translate-y-1/2' style={{ width: '45%', zIndex: '1', top: '85%', left: '95%' }}>
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
