import { GetServerSideProps } from 'next'
import Head from 'next/head'
import { useRouter } from 'next/router'
import React, { useContext, useEffect, useState } from 'react'

import { signOut } from '@auth/client'
import BreadCrumb from '@components/Common/BreadCrumb'
import AppContext from '@context/AppContext'
import { zodResolver } from '@hookform/resolvers/zod'
import axios from 'axios'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { getSession } from 'next-auth/react'
import { toast } from '@/lib/toast'
import { Button } from '@shadcn/ui/button'
import { Card, CardContent, CardHeader } from '@shadcn/ui/card'
import { Input } from '@shadcn/ui/input'
import { Label } from '@shadcn/ui/label'

import { Nav, NavItem, NavLink, TabContent, TabPane } from '@/components/ui/nav-tabs'
import { useSWRConfig } from 'swr'

const profileSchema = z.object({
  companyName: z.string().max(80, 'Name is to Long').min(1, 'Please Enter Your Company Name'),
  email: z.string().email().or(z.literal('')),
})

type ProfileForm = z.infer<typeof profileSchema>

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Please Enter Your Current Password'),
    newPassword1: z.string().min(8, 'Password must be at least 8 characters').min(1, 'Please Enter Your New Password'),
    newPassword2: z.string().min(8, 'Password must be at least 8 characters').min(1, 'Please Enter Your Confirmation Password'),
  })
  .refine((data) => data.newPassword2 === data.newPassword1, {
    message: "Passwords don't match!",
    path: ['newPassword2'],
  })

type ChangePasswordForm = z.infer<typeof changePasswordSchema>

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

const Profile = () => {
  const { state }: any = useContext(AppContext)
  const router = useRouter()
  const { mutate } = useSWRConfig()
  const [activeTab, setActiveTab] = useState('1')
  const tabChange = (tab: any) => {
    if (activeTab !== tab) setActiveTab(tab)
  }

  const validation = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      companyName: String(state.currentRegion == 'us' ? state?.user?.us?.name : state?.user?.eu?.name),
      email: String(state.currentRegion == 'us' ? state?.user?.us?.email : state?.user?.eu?.email),
    },
  })

  useEffect(() => {
    validation.reset({
      companyName: String(state.currentRegion == 'us' ? state?.user?.us?.name : state?.user?.eu?.name),
      email: String(state.currentRegion == 'us' ? state?.user?.us?.email : state?.user?.eu?.email),
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.currentRegion, state?.user?.us?.name, state?.user?.us?.email, state?.user?.eu?.name, state?.user?.eu?.email])

  const onSubmitProfile = async (values: ProfileForm) => {
    const response = await axios.post(`api/updateUserDetails?region=${state.currentRegion}&businessId=${state.user.businessId}`, {
      userDetails: values,
    })
    if (!response.data.error) {
      toast.success(response.data.msg)
      mutate('/api/getuser')
    } else {
      toast.error(response.data.msg)
    }
  }

  const validationChangePassword = useForm<ChangePasswordForm>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword1: '',
      newPassword2: '',
    },
  })

  const onSubmitChangePassword = async (values: ChangePasswordForm) => {
    const response = await axios.post(`api/updatePassword?businessId=${state.user.businessId}`, {
      passwordInfo: values,
    })
    if (!response.data.error) {
      toast.success(response.data.msg)
      validationChangePassword.reset()
      setTimeout(() => {
        signOut()
      }, 3000)
    } else {
      toast.error(response.data.msg)
    }
  }

  const handleUpdateProfile = validation.handleSubmit(onSubmitProfile)

  const handleChangePassword = validationChangePassword.handleSubmit(onSubmitChangePassword)

  return (
    <div>
      <Head>
        <title>User Profile</title>
      </Head>

      <React.Fragment>
        <div className='page-content'>
          <div className='mx-auto w-full px-3'>
            <BreadCrumb title='Profile' pageTitle='Profile' />
            <div className='flex flex-wrap -mx-3'>
              <div className='px-3 w-full'>
                <Card className=''>
                  <CardHeader>
                    <Nav className='nav-tabs-custom rounded-[0.25rem] card-header-tabs border-b-0' role='tablist'>
                      <NavItem style={{ cursor: 'pointer' }}>
                        <NavLink
                          className={activeTab == '1' ? '!text-primary text-[16.25px]' : '!text-muted-foreground text-[16.25px]'}
                          onClick={() => {
                            tabChange('1')
                          }}>
                          <>
                            <i className='fas fa-home'></i>
                            Personal Details
                          </>
                        </NavLink>
                      </NavItem>
                      <NavItem style={{ cursor: 'pointer' }}>
                        <NavLink
                          to='#'
                          className={activeTab == '2' ? '!text-primary text-[16.25px]' : '!text-muted-foreground text-[16.25px]'}
                          onClick={() => {
                            tabChange('2')
                          }}
                          type='button'>
                          <>
                            <i className='far fa-user'></i>
                            Change Password
                          </>
                        </NavLink>
                      </NavItem>
                    </Nav>
                  </CardHeader>
                  <CardContent className='p-6'>
                    <TabContent activeTab={activeTab}>
                      <TabPane tabId='1'>
                        <form onSubmit={handleUpdateProfile}>
                          <div className='flex flex-wrap -mx-3'>
                            <div className='px-3 md:w-1/2'>
                              <div className='mb-4'>
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
                                {validation.formState.errors.companyName ? (
                                  <div className='text-sm text-destructive'>{validation.formState.errors.companyName.message}</div>
                                ) : null}
                              </div>
                            </div>
                            <div className='px-3 md:w-1/2'>
                              <div className='mb-4'>
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
                            </div>
                            <div className='px-3 w-full'>
                              <div className='flex flex-row items-center gap-2 justify-end'>
                                <Button type='submit' className='text-[16.25px]'>
                                  Updates
                                </Button>
                                <Button type='button' variant='success' className='text-[16.25px] inline-flex h-9 items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium bg-[color-mix(in_srgb,var(--vz-success)_18%,transparent)] text-success hover:bg-success hover:text-white' onClick={() => router.push('/')}>
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          </div>
                        </form>
                      </TabPane>

                      <TabPane tabId='2'>
                        <form onSubmit={handleChangePassword}>
                          <div className='flex flex-wrap -mx-3 gap-y-2'>
                            <div className='px-3 md:w-1/3'>
                              <div className='mb-4'>
                                <Label htmlFor='firstNameinput' className='mb-2'>
                                  *Curent Password
                                </Label>
                                <Input
                                  type='password'
                                  placeholder='Enter Current Password'
                                  id='currentPassword'
                                  aria-invalid={Boolean(validationChangePassword.formState.errors.currentPassword) || undefined}
                                  {...validationChangePassword.register('currentPassword')}
                                />
                                {validationChangePassword.formState.errors.currentPassword ? (
                                  <div className='text-sm text-destructive'>{validationChangePassword.formState.errors.currentPassword.message}</div>
                                ) : null}
                              </div>
                            </div>

                            <div className='px-3 md:w-1/3'>
                              <div className='mb-4'>
                                <Label htmlFor='firstNameinput' className='mb-2'>
                                  *New Password
                                </Label>
                                <Input
                                  type='password'
                                  placeholder='Enter New Password'
                                  id='newPassword1'
                                  aria-invalid={Boolean(validationChangePassword.formState.errors.newPassword1) || undefined}
                                  {...validationChangePassword.register('newPassword1')}
                                />
                                {validationChangePassword.formState.errors.newPassword1 ? (
                                  <div className='text-sm text-destructive'>{validationChangePassword.formState.errors.newPassword1.message}</div>
                                ) : null}
                              </div>
                            </div>

                            <div className='px-3 md:w-1/3'>
                              <div className='mb-4'>
                                <Label htmlFor='firstNameinput' className='mb-2'>
                                  *Confirm Password
                                </Label>
                                <Input
                                  type='password'
                                  placeholder='Enter New Password'
                                  id='newPassword2'
                                  aria-invalid={Boolean(validationChangePassword.formState.errors.newPassword2) || undefined}
                                  {...validationChangePassword.register('newPassword2')}
                                />
                                {validationChangePassword.formState.errors.newPassword2 ? (
                                  <div className='text-sm text-destructive'>{validationChangePassword.formState.errors.newPassword2.message}</div>
                                ) : null}
                              </div>
                            </div>

                            {/* <Col lg={12}>
                              <div className="mb-3">
                                <Link
                                  href={'/'}
                                  className="link-primary text-decoration-underline"
                                >
                                  Forgot Password ?
                                </Link>
                              </div>
                            </Col> */}

                            <div className='px-3 w-full'>
                              <div className='text-right'>
                                <Button type='submit' variant='success'>
                                  Change Password
                                </Button>
                              </div>
                            </div>
                          </div>
                        </form>
                      </TabPane>
                    </TabContent>
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

export default Profile
