import { FormEventHandler, useRef, useState } from 'react'

import axios from 'axios'
import { toast } from '@/lib/toast'

import { Button } from '@shadcn/ui/button'
import { Label } from '@shadcn/ui/label'
import { Input } from '@shadcn/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@shadcn/ui/dialog'
import { Spinner } from '@shadcn/ui/spinner'

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
    <Dialog open={!!OpenForgotPassword} onOpenChange={(open) => { if (!open) setOpenForgotPassword(false) }}>
      <DialogContent aria-describedby={undefined} className='max-h-[90vh] overflow-y-auto sm:!max-w-lg'>
        <DialogHeader className='pr-6'>
          <DialogTitle>
            <p className='text-[22.75px]' id='myModalLabel'>
              Forgot you password?
            </p>
          </DialogTitle>
        </DialogHeader>
        <div>
          <form onSubmit={handleSubmitForgotPassword} className='w-full'>
            <div className='mb-1 w-full'>
              <Label htmlFor='email' className='mb-2'>
                Email Address
              </Label>
              <Input type='email' id='email' name='email' placeholder='Enter your email' required ref={emailRef} />
            </div>
            {showMessage && <p className='text-[13px] text-danger'>{message}</p>}
            <div className='mt-6 flex flex-row justify-end items-start gap-4'>
              <Button variant='light' className='text-[16.25px]' onClick={() => setOpenForgotPassword(false)}>
                Close
              </Button>
              <Button disabled={loading} className='text-[16.25px]' type='submit'>
                {loading ? (
                  <>
                    <Spinner className='text-white' role='status' aria-hidden='true' />
                    <span className='ms-2'>Loading...</span>
                  </>
                ) : (
                  'Send Reset Code'
                )}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default ForgotPasswordModal
