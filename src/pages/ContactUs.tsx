import { GetServerSideProps } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import React, { useContext, useEffect } from 'react'

import BreadCrumb from '@components/Common/BreadCrumb'
import AppContext from '@context/AppContext'
import { zodResolver } from '@hookform/resolvers/zod'
import axios from 'axios'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { getSession } from 'next-auth/react'
import { toast } from '@/lib/toast'
import { Button } from '@shadcn/ui/button'
import { Card, CardContent } from '@shadcn/ui/card'
import { Input } from '@shadcn/ui/input'
import { Label } from '@shadcn/ui/label'
import { Textarea } from '@shadcn/ui/textarea'

import PlaneImage from '../assets/images/contactus-plane.png'
import SquareImage from '../assets/images/contactus-square.png'

const contactUsSchema = z.object({
  companyName: z.string().max(80, 'Name is to Long').min(1, 'Please Enter Your Company Name'),
  email: z.string().min(1).email(),
  subject: z.string().min(1),
  message: z.string().min(1),
})

type ContactUsForm = z.infer<typeof contactUsSchema>

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

  const validation = useForm<ContactUsForm>({
    resolver: zodResolver(contactUsSchema),
    defaultValues: {
      companyName: String(state.currentRegion == 'us' ? state?.user?.us?.name : state?.user?.eu?.name),
      email: String(state.currentRegion == 'us' ? state?.user?.us?.email : state?.user?.eu?.email),
      subject: '',
      message: '',
    },
  })

  useEffect(() => {
    validation.reset({
      companyName: String(state.currentRegion == 'us' ? state?.user?.us?.name : state?.user?.eu?.name),
      email: String(state.currentRegion == 'us' ? state?.user?.us?.email : state?.user?.eu?.email),
      subject: '',
      message: '',
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.currentRegion, state?.user?.us?.name, state?.user?.us?.email, state?.user?.eu?.name, state?.user?.eu?.email])

  const onSubmit = async (values: ContactUsForm) => {
    const response = await axios.post(`api/sendMail?region=${state.currentRegion}`, {
      message: values,
    })
    if (!response.data.error) {
      toast.success(response.data.message)
    } else {
      toast.error(response.data.message)
    }
  }

  const handleContactForm = validation.handleSubmit(onSubmit)

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
                                aria-invalid={Boolean(validation.formState.errors.companyName) || undefined}
                                {...validation.register('companyName')}
                              />
                              {validation.formState.errors.companyName ? <div className='text-sm text-destructive'>{validation.formState.errors.companyName.message}</div> : null}
                            </div>
                            <div className='mb-6'>
                              <Label htmlFor='firstNameinput' className='mb-2'>
                                *Email Address
                              </Label>
                              <Input
                                type='text'
                                placeholder='Email Address...'
                                id='email'
                                aria-invalid={Boolean(validation.formState.errors.email) || undefined}
                                {...validation.register('email')}
                              />
                              {validation.formState.errors.email ? <div className='text-sm text-destructive'>{validation.formState.errors.email.message}</div> : null}
                            </div>
                            <div className='mb-6'>
                              <Label htmlFor='firstNameinput' className='mb-2'>
                                *Message Subject
                              </Label>
                              <Input
                                type='text'
                                placeholder='Subject...'
                                id='subject'
                                aria-invalid={Boolean(validation.formState.errors.subject) || undefined}
                                {...validation.register('subject')}
                              />
                              {validation.formState.errors.subject ? <div className='text-sm text-destructive'>{validation.formState.errors.subject.message}</div> : null}
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
                                aria-invalid={Boolean(validation.formState.errors.message) || undefined}
                                {...validation.register('message')}
                              />
                              {validation.formState.errors.message ? <div className='text-sm text-destructive'>{validation.formState.errors.message.message}</div> : null}
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
