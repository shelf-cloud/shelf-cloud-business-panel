import { GetServerSideProps } from 'next'
import Image from 'next/image'
import { FormEventHandler, useRef } from 'react'

import { getSession } from '@auth/client'
import axios from 'axios'
import { toast } from 'react-toastify'
import { Button, Label } from '@/components/migration-ui'

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
    <div className='tw:w-screen tw:h-screen tw:flex tw:relative'>
      <div className='tw:w-full tw:flex tw:flex-col tw:items-center tw:justify-start' style={{ backgroundColor: '#FAFBFD' }}>
        <div className='tw:w-full tw:px-6 tw:py-2 tw:border-b' style={{ height: '80px' }}>
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
        <div className='tw:w-full tw:h-full tw:flex tw:justify-center tw:items-center' style={{ backgroundColor: '#FAFBFD' }}>
          <div className='tw:w-10/12 tw:lg:w-7/12 tw:flex tw:flex-col tw:justify-start tw:items-center'>
            <h2 className='tw:w-full tw:text-center tw:font-semibold tw:mb-4'>Contact us</h2>
            <p className='tw:w-full tw:text-center tw:text-[16.25px] tw:mb-6'>We are here for you! How can we help?</p>
            <form onSubmit={handleContactFormSubmit} className='tw:w-full'>
              <div className='tw:mb-6 tw:w-full'>
                <Label htmlFor='name' className='form-label'>
                  Name
                </Label>
                <input type='text' required className='form-control' id='name' name='name' placeholder='Please enter your name' ref={nameRef} />
              </div>
              <div className='tw:mb-1 tw:w-full'>
                <Label className='form-label' htmlFor='email'>
                  Email
                </Label>
                <div className='tw:relative auth-pass-inputgroup tw:mb-4'>
                  <input className='form-control tw:pe-12' required placeholder='Please enter your email' id='email' name='email' ref={emailRef} />
                </div>
              </div>
              <div className='tw:mb-1 tw:w-full'>
                <Label className='form-label' htmlFor='message'>
                  Message
                </Label>
                <div className='tw:relative auth-pass-inputgroup tw:mb-4'>
                  <textarea className='form-control tw:text-[16.25px] tw:pe-12' placeholder='Please enter your message' required id='message' name='message' ref={messageRef} rows={3}></textarea>
                </div>
              </div>
              <div className='tw:mt-6 tw:w-full'>
                <Button color='primary' className='tw:w-full tw:font-semibold tw:text-[16.25px]' type='submit'>
                  Submit
                </Button>
              </div>
            </form>
            <p className='tw:w-full tw:text-left tw:text-[16.25px] tw:mt-4'>
              Prefer email?{' '}
              <a href={'mailto::info@shelf-cloud.com'} className='tw:!text-primary tw:font-semibold'>
                info@shelf-cloud.com
              </a>
            </p>
          </div>
        </div>
      </div>
      <div className='tw:hidden tw:w-full tw:h-full tw:bg-primary tw:lg:flex tw:justify-center tw:items-center'>
        <div className='tw:flex tw:flex-col tw:justify-center tw:items-start' style={{ width: '65%' }}>
          <h2 className='tw:text-[2.5rem] tw:font-bold tw:text-white tw:text-left tw:m-0 tw:p-0 tw:w-full tw:mb-4'>{`We'd love to hear from you`}</h2>
          <p className='tw:text-[16.25px] tw:font-light tw:text-white tw:text-left tw:m-0 tw:p-0 tw:w-full tw:mb-4'>4 in 1 Cloud-Based Software Solutions for Small Business.</p>
          <div className='tw:relative tw:text-left tw:mb-4' style={{ width: '70px' }}>
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
          <div className='tw:w-full tw:relative'>
            <div className='tw:absolute tw:-translate-x-1/2 tw:-translate-y-1/2' style={{ width: '35%', zIndex: '1', top: '30%', left: '0%' }}>
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
            <div className='tw:relative tw:text-left' style={{ width: '100%', zIndex: '9' }}>
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
            <div className='tw:absolute tw:-translate-x-1/2 tw:-translate-y-1/2' style={{ width: '45%', zIndex: '1', top: '85%', left: '95%' }}>
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
