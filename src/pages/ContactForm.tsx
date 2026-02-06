import { GetServerSideProps } from 'next'
import Image from 'next/image'
import { FormEventHandler, useRef } from 'react'

import { getSession } from '@auth/client'
import axios from 'axios'
import { toast } from 'react-toastify'
import { Button, Label } from 'reactstrap'

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
    <div className='vw-100 vh-100 d-flex relative'>
      <div className='w-100 d-flex flex-column align-items-center justify-content-start' style={{ backgroundColor: '#FAFBFD' }}>
        <div className='w-100 px-4 py-2 border-bottom' style={{ height: '80px' }}>
          <div className='position-relative d-flex align-self-center h-100' style={{ width: '26%', minWidth: '220px' }}>
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
        <div className='w-100 h-100 d-flex justify-content-center align-items-center' style={{ backgroundColor: '#FAFBFD' }}>
          <div className='col-10 col-lg-7 d-flex flex-column justify-content-start align-items-center'>
            <h2 className='w-100 text-center fw-semibold mb-3'>Contact us</h2>
            <p className='w-100 text-center fs-5 mb-4'>We are here for you! How can we help?</p>
            <form onSubmit={handleContactFormSubmit} className='w-100'>
              <div className='mb-4 w-100'>
                <Label htmlFor='name' className='form-label'>
                  Name
                </Label>
                <input type='text' required className='form-control' id='name' name='name' placeholder='Please enter your name' ref={nameRef} />
              </div>
              <div className='mb-1 w-100'>
                <Label className='form-label' htmlFor='email'>
                  Email
                </Label>
                <div className='position-relative auth-pass-inputgroup mb-3'>
                  <input className='form-control pe-5' required placeholder='Please enter your email' id='email' name='email' ref={emailRef} />
                </div>
              </div>
              <div className='mb-1 w-100'>
                <Label className='form-label' htmlFor='message'>
                  Message
                </Label>
                <div className='position-relative auth-pass-inputgroup mb-3'>
                  <textarea className='form-control fs-5 pe-5' placeholder='Please enter your message' required id='message' name='message' ref={messageRef} rows={3}></textarea>
                </div>
              </div>
              <div className='mt-4 w-100'>
                <Button color='primary' className='btn btn-primary w-100 fw-semibold fs-5' type='submit'>
                  Submit
                </Button>
              </div>
            </form>
            <p className='w-100 text-left fs-5 mt-3'>
              Prefer email?{' '}
              <a href={'mailto::info@shelf-cloud.com'} className='text-primary fw-semibold'>
                info@shelf-cloud.com
              </a>
            </p>
          </div>
        </div>
      </div>
      <div className='d-none w-100 h-100 bg-primary d-lg-flex justify-content-center align-items-center'>
        <div className='d-flex flex-column justify-content-center align-items-start' style={{ width: '65%' }}>
          <h2 className='fs-1 fw-bold text-white text-start m-0 p-0 w-100 mb-3'>{`We'd love to hear from you`}</h2>
          <p className='fs-5 fw-light text-white text-start m-0 p-0 w-100 mb-3'>4 in 1 Cloud-Based Software Solutions for Small Business.</p>
          <div className='position-relative text-start mb-3' style={{ width: '70px' }}>
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
          <div className='w-100 position-relative'>
            <div className='position-absolute translate-middle' style={{ width: '35%', zIndex: '1', top: '30%', left: '0%' }}>
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
            <div className='position-relative text-start' style={{ width: '100%', zIndex: '9' }}>
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
            <div className='position-absolute translate-middle' style={{ width: '45%', zIndex: '1', top: '85%', left: '95%' }}>
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
