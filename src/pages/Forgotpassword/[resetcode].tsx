import Image from 'next/image'
import { useRouter } from 'next/router'
import { FormEventHandler, useState } from 'react'

import ShelfCloudLogo from '@images/shelfcloud-blue-h.png'
import axios from 'axios'
import { useFormik } from 'formik'
import { toast } from 'react-toastify'
import { Button, Label, Spinner } from 'reactstrap'
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
    <div className='vw-100 vh-100 d-flex flex-column relative'>
      <div className='w-100 px-4 py-2 border-bottom' style={{ height: '80px', backgroundColor: '#FAFBFD' }}>
        <div className='position-relative d-flex align-self-center h-100' style={{ width: '20%', minWidth: '220px' }}>
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
      <div className='w-100 h-100 d-flex flex-column justify-content-center align-items-center'>
        <div className='col-10 col-md-6 col-lg-4 mx-auto'>
          <h1 className='fs-1 mb-4 fw-bold text-center'>Reset Password</h1>
          <form onSubmit={handleResetPasswordSubmit} className='w-100'>
            <div className='mb-1 w-100'>
              <Label className='form-label' htmlFor='password-input'>
                New Password
              </Label>
              <div className='position-relative auth-pass-inputgroup mb-3'>
                <input
                  type={show ? 'text' : 'password'}
                  className='form-control pe-5'
                  placeholder='Enter new password'
                  id='newPassword'
                  name='newPassword'
                  onChange={validationChangePassword.handleChange}
                  onBlur={validationChangePassword.handleBlur}
                  value={validationChangePassword.values.newPassword || ''}
                />
                <button className='btn btn-link position-absolute end-0 top-0 text-decoration-none text-muted' type='button' onClick={() => setShow(!show)}>
                  <i className='ri-eye-fill align-middle fs-5'></i>
                </button>
              </div>
              {validationChangePassword.touched.newPassword && validationChangePassword.errors.newPassword ? (
                <p className='text-danger'>{validationChangePassword.errors.newPassword}</p>
              ) : null}
            </div>
            <div className='mb-1 w-100'>
              <Label className='form-label' htmlFor='password-input'>
                Confirm Password
              </Label>
              <div className='position-relative auth-pass-inputgroup mb-3'>
                <input
                  type={showConfirm ? 'text' : 'password'}
                  className='form-control pe-5'
                  placeholder='Confirm your password'
                  id='confirmPassword'
                  name='confirmPassword'
                  onChange={validationChangePassword.handleChange}
                  onBlur={validationChangePassword.handleBlur}
                  value={validationChangePassword.values.confirmPassword || ''}
                />
                <button className='btn btn-link position-absolute end-0 top-0 text-decoration-none text-muted' type='button' onClick={() => setShowConfirm(!showConfirm)}>
                  <i className='ri-eye-fill align-middle fs-5'></i>
                </button>
              </div>
              {validationChangePassword.touched.confirmPassword && validationChangePassword.errors.confirmPassword ? (
                <p className='text-danger'>{validationChangePassword.errors.confirmPassword}</p>
              ) : null}
            </div>
            <div className='mt-4 w-100'>
              <Button color='primary' className='btn btn-primary w-100 fw-semibold fs-5' type='submit'>
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
