import React, { FormEventHandler, useRef, useState } from 'react'

import axios from 'axios'
import { toast } from 'react-toastify'
import { Button, Label, Modal, ModalBody, ModalHeader, Spinner } from 'reactstrap'

type Props = {
  OpenForgotPassword: boolean
  setOpenForgotPassword: (show: boolean) => void
}
const ForgotPasswordModal = ({ OpenForgotPassword, setOpenForgotPassword }: Props) => {
  const [showMessage, setshowMessage] = useState(false)
  const [message, setMessage] = useState('')
  const [loading, setloading] = useState(false)
  const emailRef = useRef<HTMLInputElement | null>(null)

  const handleSubmitForgotPassword: FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault()
    setloading(true)
    setshowMessage(false)

    const response = await axios.post('api/requestForgotPassword', {
      email: emailRef.current!.value,
    })

    if (!response.data.error) {
      emailRef.current!.value = ''
      setloading(false)
      setOpenForgotPassword(false)
      toast.success(response.data.msg)
    } else {
      setloading(false)
      setshowMessage(true)
      setMessage(response.data.msg)
    }
  }

  return (
    <Modal id='forgotPasswordModal' isOpen={OpenForgotPassword} toggle={() => setOpenForgotPassword(false)} centered>
      <ModalHeader toggle={() => setOpenForgotPassword(false)}>
        <p className='modal-title fs-3' id='myModalLabel'>
          Forgot you password?
        </p>
      </ModalHeader>
      <ModalBody>
        <form onSubmit={handleSubmitForgotPassword} className='w-100'>
          <div className='mb-1 w-100'>
            <Label htmlFor='email' className='form-label'>
              Email Address
            </Label>
            <input type='email' className='form-control' id='email' name='email' placeholder='Enter your email' required ref={emailRef} />
          </div>
          {showMessage && <p className='fs-6 text-danger'>{message}</p>}
          <div className='mt-4 d-flex flex-row justify-content-end align-items-start gap-3'>
            <Button color='light' className='btn btn-light fs-5' onClick={() => setOpenForgotPassword(false)}>
              Close
            </Button>
            <Button color='primary' disabled={loading} className='btn btn-primary fs-5' type='submit'>
              {loading ? (
                <>
                  <Spinner size='sm' color='light' role='status' aria-hidden='true' animation='border' />
                  <span className='ms-2'>Loading...</span>
                </>
              ) : (
                'Send Reset Code'
              )}
            </Button>
          </div>
        </form>
      </ModalBody>
    </Modal>
  )
}

export default ForgotPasswordModal
