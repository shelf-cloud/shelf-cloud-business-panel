import Image from 'next/image'
import { useRouter } from 'next/router'
import { FormEventHandler, useState } from 'react'

import ShelfCloudLogo from '@images/shelfcloud-blue-h.png'
import { zodResolver } from '@hookform/resolvers/zod'
import axios from 'axios'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { toast } from '@/lib/toast'
import { Button } from '@shadcn/ui/button'
import { Label } from '@shadcn/ui/label'
import { Spinner } from '@shadcn/ui/spinner'

type Props = {}

const resetPasswordSchema = z
  .object({
    newPassword: z.string().min(8, 'Password must be at least 8 characters').min(1, 'Please Enter Your New Password'),
    confirmPassword: z.string().min(8, 'Password must be at least 8 characters').min(1, 'Please Enter Your Confirmation Password'),
  })
  .refine((data) => data.confirmPassword === data.newPassword, {
    message: "Passwords don't match!",
    path: ['confirmPassword'],
  })

type ResetPasswordForm = z.infer<typeof resetPasswordSchema>

const ResetPasswordPage = ({}: Props) => {
  const router = useRouter()
  const { resetcode } = router.query
  const [loading, setloading] = useState(false)
  const [show, setShow] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const validationChangePassword = useForm<ResetPasswordForm>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      newPassword: '',
      confirmPassword: '',
    },
  })

  const onSubmit = async (values: ResetPasswordForm) => {
    setloading(true)
    const response = await axios.post(`/api/resetPassword`, {
      resetPasswordInfo: {
        newPassword: values.newPassword,
        confirmPassword: values.confirmPassword,
        resetToken: resetcode,
      },
    })
    if (!response.data.error) {
      toast.success(response.data.msg)
      router.push('/')
    } else {
      toast.error(response.data.msg)
    }
    setloading(false)
  }

  const handleResetPasswordSubmit: FormEventHandler<HTMLFormElement> = validationChangePassword.handleSubmit(onSubmit)

  return (
    <div className='w-screen h-screen flex flex-col relative'>
      <div className='w-full px-6 py-2 border-b' style={{ height: '80px', backgroundColor: '#FAFBFD' }}>
        <div className='relative flex self-center h-full' style={{ width: '20%', minWidth: '220px' }}>
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
      <div className='w-full h-full flex flex-col justify-center items-center'>
        <div className='w-10/12 md:w-1/2 lg:w-4/12 mx-auto'>
          <h1 className='text-[2.5rem] mb-6 font-bold text-center'>Reset Password</h1>
          <form onSubmit={handleResetPasswordSubmit} className='w-full'>
            <div className='mb-1 w-full'>
              <Label className='mb-2' htmlFor='password-input'>
                New Password
              </Label>
              <div className='relative auth-pass-inputgroup mb-4'>
                <input
                  type={show ? 'text' : 'password'}
                  className='h-9 w-full px-3 py-1 text-sm rounded-md border border-input bg-input shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 pe-12'
                  placeholder='Enter new password'
                  id='newPassword'
                  {...validationChangePassword.register('newPassword')}
                />
                <button className='inline-flex appearance-none items-center justify-center gap-2 whitespace-nowrap rounded-md border-0 bg-transparent text-sm font-medium absolute right-0 top-0 no-underline text-muted-foreground' type='button' onClick={() => setShow(!show)}>
                  <i className='ri-eye-fill align-middle text-[16.25px]'></i>
                </button>
              </div>
              {validationChangePassword.formState.errors.newPassword ? (
                <p className='text-danger'>{validationChangePassword.formState.errors.newPassword.message}</p>
              ) : null}
            </div>
            <div className='mb-1 w-full'>
              <Label className='mb-2' htmlFor='password-input'>
                Confirm Password
              </Label>
              <div className='relative auth-pass-inputgroup mb-4'>
                <input
                  type={showConfirm ? 'text' : 'password'}
                  className='h-9 w-full px-3 py-1 text-sm rounded-md border border-input bg-input shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 pe-12'
                  placeholder='Confirm your password'
                  id='confirmPassword'
                  {...validationChangePassword.register('confirmPassword')}
                />
                <button className='inline-flex appearance-none items-center justify-center gap-2 whitespace-nowrap rounded-md border-0 bg-transparent text-sm font-medium absolute right-0 top-0 no-underline text-muted-foreground' type='button' onClick={() => setShowConfirm(!showConfirm)}>
                  <i className='ri-eye-fill align-middle text-[16.25px]'></i>
                </button>
              </div>
              {validationChangePassword.formState.errors.confirmPassword ? (
                <p className='text-danger'>{validationChangePassword.formState.errors.confirmPassword.message}</p>
              ) : null}
            </div>
            <div className='mt-6 w-full'>
              <Button className='w-full font-semibold text-[16.25px]' type='submit'>
                {loading ? <Spinner className='text-white' role='status' aria-hidden='true' /> : 'Set New Password'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default ResetPasswordPage
