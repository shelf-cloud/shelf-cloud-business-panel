import { GetServerSideProps } from 'next'
import Image from 'next/image'
import { FormEventHandler, useRef } from 'react'

import { getSession } from '@auth/client'
import axios from 'axios'
import { toast } from '@/lib/toast'
import { Button } from '@shadcn/ui/button'
import { Label } from '@shadcn/ui/label'

import RightImage from '../assets/images/contactform-image-right.png'
import ShelfCloudLogo from '../assets/images/shelfcloud-blue-h.png'
import LinesImage from '../assets/images/signin-lines.png'
import PuntosImageLeft from '../assets/images/signin-puntos-left.png'
import PuntosImage from '../assets/images/signin-puntos.png'

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

function ContactForm({}: Props) {
  const nameRef = useRef<HTMLInputElement | null>(null)
  const emailRef = useRef<HTMLInputElement | null>(null)
  const messageRef = useRef<HTMLTextAreaElement | null>(null)

  const handleContactFormSubmit: FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault()

    const response = await axios.post('api/sendContactForm', {
      contactForm: {
        name: nameRef.current!.value,
        email: emailRef.current!.value,
        message: messageRef.current!.value,
      },
    })
    if (!response.data.error) {
      nameRef.current!.value = ''
      emailRef.current!.value = ''
      messageRef.current!.value = ''
      toast.success(response.data.message)
    } else {
      toast.error(response.data.message)
    }
  }

  return (
    <div className='w-screen h-screen flex relative'>
      <div className='w-full flex flex-col items-center justify-start' style={{ backgroundColor: '#FAFBFD' }}>
        <div className='w-full px-6 py-2 border-b' style={{ height: '80px' }}>
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
        <div className='w-full h-full flex justify-center items-center' style={{ backgroundColor: '#FAFBFD' }}>
          <div className='w-10/12 lg:w-7/12 flex flex-col justify-start items-center'>
            <h2 className='w-full text-center font-semibold mb-4'>Contact us</h2>
            <p className='w-full text-center text-[16.25px] mb-6'>We are here for you! How can we help?</p>
            <form onSubmit={handleContactFormSubmit} className='w-full'>
              <div className='mb-6 w-full'>
                <Label htmlFor='name' className='mb-2'>
                  Name
                </Label>
                <input
                  type='text'
                  required
                  className='h-9 w-full min-w-0 rounded-md border border-input bg-input px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50'
                  id='name'
                  name='name'
                  placeholder='Please enter your name'
                  ref={nameRef}
                />
              </div>
              <div className='mb-1 w-full'>
                <Label className='mb-2' htmlFor='email'>
                  Email
                </Label>
                <div className='relative auth-pass-inputgroup mb-4'>
                  <input
                    className='h-9 w-full min-w-0 rounded-md border border-input bg-input px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 pe-12'
                    required
                    placeholder='Please enter your email'
                    id='email'
                    name='email'
                    ref={emailRef}
                  />
                </div>
              </div>
              <div className='mb-1 w-full'>
                <Label className='mb-2' htmlFor='message'>
                  Message
                </Label>
                <div className='relative auth-pass-inputgroup mb-4'>
                  <textarea
                    className='h-9 w-full min-w-0 rounded-md border border-input bg-input px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 text-[16.25px] pe-12'
                    placeholder='Please enter your message'
                    required
                    id='message'
                    name='message'
                    ref={messageRef}
                    rows={3}></textarea>
                </div>
              </div>
              <div className='mt-6 w-full'>
                <Button className='w-full font-semibold text-[16.25px]' type='submit'>
                  Submit
                </Button>
              </div>
            </form>
            <p className='w-full text-left text-[16.25px] mt-4'>
              Prefer email?{' '}
              <a href={'mailto::info@shelf-cloud.com'} className='!text-primary font-semibold'>
                info@shelf-cloud.com
              </a>
            </p>
          </div>
        </div>
      </div>
      <div className='hidden w-full h-full bg-primary lg:flex justify-center items-center'>
        <div className='flex flex-col justify-center items-start' style={{ width: '65%' }}>
          <h2 className='text-[2.5rem] font-bold text-white text-left m-0 p-0 w-full mb-4'>{`We'd love to hear from you`}</h2>
          <p className='text-[16.25px] font-light text-white text-left m-0 p-0 w-full mb-4'>4 in 1 Cloud-Based Software Solutions for Small Business.</p>
          <div className='relative text-left mb-4' style={{ width: '70px' }}>
            <Image
              src={LinesImage}
              alt='ShelfCloud Logo'
              style={{
                maxWidth: '100%',
                height: 'auto',
                objectFit: 'contain',
              }}
            />
          </div>
          <div className='w-full relative'>
            <div className='absolute -translate-x-1/2 -translate-y-1/2' style={{ width: '35%', zIndex: '1', top: '30%', left: '0%' }}>
              <Image
                src={PuntosImageLeft}
                alt='ShelfCloud Logo'
                style={{
                  maxWidth: '100%',
                  height: 'auto',
                  objectFit: 'contain',
                }}
              />
            </div>
            <div className='relative text-left' style={{ width: '100%', zIndex: '9' }}>
              <Image
                src={RightImage}
                alt='ShelfCloud Logo'
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
                alt='ShelfCloud Logo'
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
    </div>
  )
}

export default ContactForm
