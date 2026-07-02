import Image from 'next/image'
import { useRouter } from 'next/router'
import { FormEventHandler, useState } from 'react'

import ShelfCloudLogo from '@images/shelfcloud-blue-h.png'
import axios from 'axios'
import { useFormik } from 'formik'
import { toast } from 'react-toastify'
import { Button, Label, Spinner } from '@/components/migration-ui'
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
    <div className='tw:w-screen tw:h-screen tw:flex tw:flex-col tw:relative'>
      <div className='tw:w-full tw:px-6 tw:py-2 tw:border-b' style={{ height: '80px', backgroundColor: '#FAFBFD' }}>
        <div className='tw:relative tw:flex tw:self-center tw:h-full' style={{ width: '20%', minWidth: '220px' }}>
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
      <div className='tw:w-full tw:h-full tw:flex tw:flex-col tw:justify-center tw:items-center'>
        <div className='tw:w-10/12 tw:md:w-1/2 tw:lg:w-4/12 tw:mx-auto'>
          <h1 className='fs-1 tw:mb-6 tw:font-bold tw:text-center'>Reset Password</h1>
          <form onSubmit={handleResetPasswordSubmit} className='tw:w-full'>
            <div className='tw:mb-1 tw:w-full'>
              <Label className='form-label' htmlFor='password-input'>
                New Password
              </Label>
              <div className='tw:relative auth-pass-inputgroup tw:mb-4'>
                <input
                  type={show ? 'text' : 'password'}
                  className='form-control tw:pe-12'
                  placeholder='Enter new password'
                  id='newPassword'
                  name='newPassword'
                  onChange={validationChangePassword.handleChange}
                  onBlur={validationChangePassword.handleBlur}
                  value={validationChangePassword.values.newPassword || ''}
                />
                <button className='btn btn-link tw:absolute tw:right-0 tw:top-0 tw:no-underline tw:text-[var(--bs-secondary-color)]' type='button' onClick={() => setShow(!show)}>
                  <i className='ri-eye-fill align-middle fs-5'></i>
                </button>
              </div>
              {validationChangePassword.touched.newPassword && validationChangePassword.errors.newPassword ? (
                <p className='tw:text-danger'>{validationChangePassword.errors.newPassword}</p>
              ) : null}
            </div>
            <div className='tw:mb-1 tw:w-full'>
              <Label className='form-label' htmlFor='password-input'>
                Confirm Password
              </Label>
              <div className='tw:relative auth-pass-inputgroup tw:mb-4'>
                <input
                  type={showConfirm ? 'text' : 'password'}
                  className='form-control tw:pe-12'
                  placeholder='Confirm your password'
                  id='confirmPassword'
                  name='confirmPassword'
                  onChange={validationChangePassword.handleChange}
                  onBlur={validationChangePassword.handleBlur}
                  value={validationChangePassword.values.confirmPassword || ''}
                />
                <button className='btn btn-link tw:absolute tw:right-0 tw:top-0 tw:no-underline tw:text-[var(--bs-secondary-color)]' type='button' onClick={() => setShowConfirm(!showConfirm)}>
                  <i className='ri-eye-fill align-middle fs-5'></i>
                </button>
              </div>
              {validationChangePassword.touched.confirmPassword && validationChangePassword.errors.confirmPassword ? (
                <p className='tw:text-danger'>{validationChangePassword.errors.confirmPassword}</p>
              ) : null}
            </div>
            <div className='tw:mt-6 tw:w-full'>
              <Button color='primary' className='tw:w-full tw:font-semibold tw:text-[16.25px]' type='submit'>
                {loading ? <Spinner size='sm' color='light' role='status' aria-hidden='true' animation='border' /> : 'Set New Password'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default ResetPasswordPage
