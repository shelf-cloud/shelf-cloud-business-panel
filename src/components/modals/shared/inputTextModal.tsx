import { memo, useState } from 'react'

import { useFormik } from 'formik'
import { DebounceInput } from 'react-debounce-input'
import * as Yup from 'yup'

import { Button } from '@shadcn/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@shadcn/ui/dialog'
import { Spinner } from '@shadcn/ui/spinner'

type InputModalProps = {
  isOpen: boolean
  headerText: string
  primaryText: string
  primaryTextSub?: string
  descriptionText?: string
  confirmText: string
  loadingText: string
  placeholder?: string
  initialValue?: string
  minLength?: number
  handleSubmit: (value: string) => Promise<{ error: boolean }>
  handleClose: () => void
  handleSubmitClearValue?: (value: string) => Promise<{ error: boolean }>
}

const InputTextModal = ({
  isOpen,
  headerText,
  primaryText,
  primaryTextSub,
  descriptionText,
  confirmText,
  loadingText,
  placeholder = '',
  initialValue,
  minLength = 1,
  handleSubmit,
  handleClose,
  handleSubmitClearValue,
}: InputModalProps) => {
  const [isLoading, setisLoading] = useState(false)
  const validation = useFormik({
    enableReinitialize: true,
    initialValues: {
      inputValue: initialValue || '',
    },
    validationSchema: Yup.object({
      inputValue: Yup.string(),
    }),
    onSubmit: async (values, { resetForm }) => {
      setisLoading(true)
      await handleSubmit(values.inputValue).then(({ error }) => {
        if (!error) {
          resetForm()
          handleClose()
        }
        setisLoading(false)
      })
    },
  })

  const handleSubmitForm = (event: any) => {
    event.preventDefault()
    validation.handleSubmit()
  }

  const handleClearValue = async () => {
    setisLoading(true)
    await handleSubmitClearValue?.('').then(({ error }) => {
      if (!error) {
        validation.resetForm()
        handleClose()
      }
      setisLoading(false)
    })
  }

  return (
    <Dialog
      open={!!isOpen}
      onOpenChange={(open) => {
        if (!open) handleClose()
      }}>
      <DialogContent aria-describedby={undefined} className='max-h-[90vh] overflow-y-auto sm:!max-w-lg'>
        <DialogHeader className='pr-6'>
          <DialogTitle id='myModalLabel'>{headerText}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmitForm}>
          <div className='flex flex-wrap -mx-3'>
            <p className='text-[16.25px] font-semibold'>
              {primaryText} {primaryTextSub && <span className='text-primary'>{primaryTextSub}</span>}
            </p>
            {descriptionText && <p className='text-[11.2px] text-muted-foreground'>{descriptionText}</p>}
            <div className='px-3 w-full flex flex-col justify-end items-end'>
              <div className='px-3 w-full text-right'>
                <DebounceInput
                  minLength={minLength}
                  debounceTimeout={200}
                  className={`h-9 w-full min-w-0 rounded-md border border-input bg-input px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 text-[13px] ${validation.errors.inputValue ? 'border-destructive' : ''}`}
                  placeholder={placeholder}
                  id='inputValue'
                  name='inputValue'
                  value={validation.values.inputValue || ''}
                  onChange={validation.handleChange}
                  onBlur={validation.handleBlur}
                  aria-invalid={(validation.touched.inputValue && validation.errors.inputValue ? true : false) || undefined}
                  inputRef={(input) => {
                    if (isOpen && input) {
                      input.focus()
                    }
                  }}
                />
                {validation.touched.inputValue && validation.errors.inputValue ? <p className='m-0 p-0 text-[11.2px] text-danger'>{validation.errors.inputValue}</p> : null}
              </div>
            </div>
          </div>
          <DialogFooter className='items-center'>
            <div className='w-full mt-2 flex flex-row gap-2 justify-between items-center'>
              <div>
                <Button disabled={isLoading} type='button' variant='destructive' className='text-[11.2px]' onClick={handleClearValue}>
                  Clear Value
                </Button>
              </div>
              <div className='flex flex-row gap-2 justify-end'>
                <Button disabled={isLoading} type='button' variant='light' className='text-[11.2px]' onClick={handleClose}>
                  Cancel
                </Button>
                <Button disabled={isLoading} type='submit' variant='success' className='text-[11.2px]'>
                  {isLoading ? (
                    <span>
                      <Spinner className='text-white' /> {loadingText}
                    </span>
                  ) : (
                    confirmText
                  )}
                </Button>
              </div>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default memo(InputTextModal)
