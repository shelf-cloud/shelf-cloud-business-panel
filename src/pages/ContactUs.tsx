import { GetServerSideProps } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import React, { useContext } from 'react'

import BreadCrumb from '@components/Common/BreadCrumb'
import AppContext from '@context/AppContext'
import axios from 'axios'
import { useFormik } from 'formik'
import { getSession } from 'next-auth/react'
import { toast } from '@/lib/toast'
import { Button } from '@shadcn/ui/button'
import { Card, CardContent } from '@shadcn/ui/card'
import { Input } from '@shadcn/ui/input'
import { Label } from '@shadcn/ui/label'
import { Textarea } from '@shadcn/ui/textarea'
import * as Yup from 'yup'

import PlaneImage from '../assets/images/contactus-plane.png'
import SquareImage from '../assets/images/contactus-square.png'

export const getServerSideProps: GetServerSideProps<{}> = async (context) => {
  const session = await getSession(context)

  if (session == null) {
    return {
      redirect: {
        destination: '/api/auth/signin',
        permanent: false,
      },
    }
  }
  return {
    props: { session },
  }
}

function ContactUs() {
  const { state }: any = useContext(AppContext)

  const validation = useFormik({
    // enableReinitialize : use this flag when initial values needs to be changed
    enableReinitialize: true,

    initialValues: {
      companyName: String(state.currentRegion == 'us' ? state?.user?.us?.name : state?.user?.eu?.name),
      email: String(state.currentRegion == 'us' ? state?.user?.us?.email : state?.user?.eu?.email),
      subject: '',
      message: '',
    },
    validationSchema: Yup.object({
      companyName: Yup.string().max(80, 'Name is to Long').required('Please Enter Your Company Name'),
      email: Yup.string().email().required(),
      subject: Yup.string().required(),
      message: Yup.string().required(),
    }),
    onSubmit: async (values, {}) => {
      const response = await axios.post(`api/sendMail?region=${state.currentRegion}`, {
        message: values,
      })
      if (!response.data.error) {
        toast.success(response.data.message)
      } else {
        toast.error(response.data.message)
      }
    },
  })
  const handleContactForm = (event: any) => {
    event.preventDefault()
    validation.handleSubmit()
  }

  return (
    <div>
      <Head>
        <title>Contact Us</title>
      </Head>
      <React.Fragment>
        <div className='page-content'>
          <div className='mx-auto w-full px-3'>
            <BreadCrumb title='Contact Us' pageTitle='Profile' />
            <div className='flex flex-wrap -mx-3'>
              <div className='px-3 w-full lg:w-full'>
                <Card className='border-t-[5px] border-primary'>
                  <CardContent className='pb-2 md:pb-12'>
                    <div className='flex flex-row justify-between w-full items-start pt-4 pb-2'>
                      <div className='relative flex' style={{ width: '30%', minWidth: '130px' }}>
                        <Image
                          src={PlaneImage}
                          alt='ShelfCloud Logo'
                          style={{
                            maxWidth: '100%',
                            height: 'auto',
                            objectFit: 'contain',
                          }}
                        />
                      </div>
                      <div className='relative flex' style={{ width: '8%', minWidth: '40px' }}>
                        <Image
                          src={SquareImage}
                          alt='ShelfCloud Logo'
                          style={{
                            maxWidth: '100%',
                            height: 'auto',
                            objectFit: 'contain',
                          }}
                        />
                      </div>
                    </div>
                    <div className='px-3 md:w-9/12 mx-auto my-0'>
                      <h2 className='mb-6 font-semibold'>Get in touch</h2>
                      <form onSubmit={handleContactForm}>
                        <div className='flex flex-wrap -mx-3'>
                          <div className='px-3 w-full lg:w-6/12'>
                            <div className='mb-6'>
                              <Label htmlFor='firstNameinput' className='mb-2'>
                                *Company Name
                              </Label>
                              <Input
                                type='text'
                                placeholder='Company Name...'
                                id='companyName'
                                name='companyName'
                                onChange={validation.handleChange}
                                onBlur={validation.handleBlur}
                                value={validation.values.companyName || ''}
                                aria-invalid={(validation.touched.companyName && validation.errors.companyName ? true : false) || undefined}
                              />
                              {validation.touched.companyName && validation.errors.companyName ? <div className='text-sm text-destructive'>{validation.errors.companyName}</div> : null}
                            </div>
                            <div className='mb-6'>
                              <Label htmlFor='firstNameinput' className='mb-2'>
                                *Email Address
                              </Label>
                              <Input
                                type='text'
                                placeholder='Email Address...'
                                id='email'
                                name='email'
                                onChange={validation.handleChange}
                                onBlur={validation.handleBlur}
                                value={validation.values.email || ''}
                                aria-invalid={(validation.touched.email && validation.errors.email ? true : false) || undefined}
                              />
                              {validation.touched.email && validation.errors.email ? <div className='text-sm text-destructive'>{validation.errors.email}</div> : null}
                            </div>
                            <div className='mb-6'>
                              <Label htmlFor='firstNameinput' className='mb-2'>
                                *Message Subject
                              </Label>
                              <Input
                                type='text'
                                placeholder='Subject...'
                                id='subject'
                                name='subject'
                                onChange={validation.handleChange}
                                onBlur={validation.handleBlur}
                                value={validation.values.subject || ''}
                                aria-invalid={(validation.touched.subject && validation.errors.subject ? true : false) || undefined}
                              />
                              {validation.touched.subject && validation.errors.subject ? <div className='text-sm text-destructive'>{validation.errors.subject}</div> : null}
                            </div>
                          </div>
                          <div className='px-3 w-full lg:w-6/12 h-auto flex flex-col justify-between pb-6'>
                            <div className='mb-6 flex flex-col h-full md:mb-12'>
                              <Label htmlFor='firstNameinput' className='mb-2'>
                                *Message
                              </Label>
                              <Textarea
                                className='grow text-[16.25px]'
                                placeholder='Enter your message here'
                                id='message'
                                name='message'
                                onChange={validation.handleChange}
                                onBlur={validation.handleBlur}
                                value={validation.values.message || ''}
                                aria-invalid={(validation.touched.message && validation.errors.message ? true : false) || undefined}
                              />
                              {validation.touched.message && validation.errors.message ? <div className='text-sm text-destructive'>{validation.errors.message}</div> : null}
                            </div>
                            <Button type='submit' className='text-[16.25px] w-full'>
                              Submit
                            </Button>
                          </div>
                        </div>
                      </form>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </React.Fragment>
    </div>
  )
}

export default ContactUs
