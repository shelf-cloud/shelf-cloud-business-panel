import Image from 'next/image'
import { useRouter } from 'next/router'
import { FormEventHandler, useState } from 'react'

import ShelfCloudLogo from '@images/shelfcloud-blue-h.png'
import axios from 'axios'
import { useFormik } from 'formik'
import { toast } from 'react-toastify'
import { Button } from '@shadcn/ui/button'
import { Label } from '@shadcn/ui/label'
import { Spinner } from '@shadcn/ui/spinner'
import * as Yup from 'yup'

type Props = {}

const ResetPasswordPage = ({}: Props) => {
  const router = useRouter()
  const { resetcode } = router.query
  const [loading, setloading] = useState(false)
  const [show, setShow] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const validationChangePassword = useFormik({
    // enableReinitialize : use this flag when initial values needs to be changed
    enableReinitialize: true,

    initialValues: {
      newPassword: '',
      confirmPassword: '',
    },
    validationSchema: Yup.object({
      newPassword: Yup.string().min(8, 'Password must be at least 8 characters').required('Please Enter Your New Password'),
      confirmPassword: Yup.string()
        .min(8, 'Password must be at least 8 characters')
        .oneOf([Yup.ref('newPassword'), null], "Passwords don't match!")
        .required('Please Enter Your Confirmation Password'),
    }),
    onSubmit: async (values) => {
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
    },
  })

  const handleResetPasswordSubmit: FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault()
    validationChangePassword.handleSubmit()
  }

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
              <Label className='form-label' htmlFor='password-input'>
                New Password
              </Label>
              <div className='relative auth-pass-inputgroup mb-4'>
                <input
                  type={show ? 'text' : 'password'}
                  className='h-9 w-full px-3 py-1 text-sm rounded-md border border-input bg-input shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 pe-12'
                  placeholder='Enter new password'
                  id='newPassword'
                  name='newPassword'
                  onChange={validationChangePassword.handleChange}
                  onBlur={validationChangePassword.handleBlur}
                  value={validationChangePassword.values.newPassword || ''}
                />
                <button className='btn btn-link absolute right-0 top-0 no-underline text-[var(--bs-secondary-color)]' type='button' onClick={() => setShow(!show)}>
                  <i className='ri-eye-fill align-middle text-[16.25px]'></i>
                </button>
              </div>
              {validationChangePassword.touched.newPassword && validationChangePassword.errors.newPassword ? (
                <p className='text-danger'>{validationChangePassword.errors.newPassword}</p>
              ) : null}
            </div>
            <div className='mb-1 w-full'>
              <Label className='form-label' htmlFor='password-input'>
                Confirm Password
              </Label>
              <div className='relative auth-pass-inputgroup mb-4'>
                <input
                  type={showConfirm ? 'text' : 'password'}
                  className='h-9 w-full px-3 py-1 text-sm rounded-md border border-input bg-input shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 pe-12'
                  placeholder='Confirm your password'
                  id='confirmPassword'
                  name='confirmPassword'
                  onChange={validationChangePassword.handleChange}
                  onBlur={validationChangePassword.handleBlur}
                  value={validationChangePassword.values.confirmPassword || ''}
                />
                <button className='btn btn-link absolute right-0 top-0 no-underline text-[var(--bs-secondary-color)]' type='button' onClick={() => setShowConfirm(!showConfirm)}>
                  <i className='ri-eye-fill align-middle text-[16.25px]'></i>
                </button>
              </div>
              {validationChangePassword.touched.confirmPassword && validationChangePassword.errors.confirmPassword ? (
                <p className='text-danger'>{validationChangePassword.errors.confirmPassword}</p>
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
