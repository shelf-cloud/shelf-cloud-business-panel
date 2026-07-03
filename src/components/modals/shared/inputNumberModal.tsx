import { memo, useContext, useState } from 'react'

import AppContext from '@context/AppContext'
import { FormatCurrency } from '@lib/FormatNumbers'
import { useFormik } from 'formik'
import { DebounceInput } from 'react-debounce-input'
import * as Yup from 'yup'

import { Button } from '@shadcn/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader } from '@shadcn/ui/dialog'
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
  initialValue?: number | string
  minLength?: number
  isPrice?: boolean
  handleSubmit: (value: number) => Promise<{ error: boolean }>
  handleClose: () => void
  handleSubmitClearValue?: (value: number | string) => Promise<{ error: boolean }>
}

const InputNumberModal = ({
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
  isPrice = false,
  handleSubmit,
  handleClose,
  handleSubmitClearValue,
}: InputModalProps) => {
  const { state } = useContext(AppContext)
  const [isLoading, setisLoading] = useState(false)
  const validation = useFormik({
    enableReinitialize: true,
    initialValues: {
      inputValue: initialValue || '',
    },
    validationSchema: Yup.object({
      inputValue: Yup.number().min(0.1, 'Value is required').required('Value is required'),
    }),
    onSubmit: async (values, { resetForm }) => {
      setisLoading(true)
      await handleSubmit(Number(values.inputValue)).then(() => {
        resetForm()
        handleClose()
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
    await handleSubmitClearValue?.('').then(() => {
      validation.resetForm()
      handleClose()
      setisLoading(false)
    })
  }

  return (
    <Dialog open={!!isOpen} onOpenChange={(open) => { if (!open) handleClose() }}>
      <DialogContent id='inputNumberModal' aria-describedby={undefined} className='max-h-[90vh] overflow-y-auto sm:!max-w-lg'>
      <DialogHeader className='pr-6 modal-title' id='myModalLabel'>
        {headerText}
      </DialogHeader>
      <form onSubmit={handleSubmitForm}>
        <div>
          <div className='flex flex-wrap -mx-3'>
            <p className='text-[16.25px] font-semibold'>
              {primaryText} {primaryTextSub && <span className='text-primary'>{primaryTextSub}</span>}
            </p>
            {descriptionText && <p className='text-[11.2px] text-[var(--bs-secondary-color)]'>{descriptionText}</p>}
            <div className='px-3 sm:w-full flex flex-col justify-end items-end'>
              <div className='px-3 w-full lg:w-4/12 text-right'>
                <DebounceInput
                  type='number'
                  minLength={minLength}
                  debounceTimeout={600}
                  className={`h-8 text-xs w-full min-w-0 rounded-md border border-input bg-input px-3 py-1 shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 text-right ${validation.errors.inputValue ? 'border-destructive' : ''}`}
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
                {isPrice && <p className='m-0 mt-1 pl-1 font-semibold text-primary'>{FormatCurrency(state.currentRegion, Number(validation.values.inputValue))}</p>}
                {validation.touched.inputValue && validation.errors.inputValue ? <p className='m-0 p-0 text-[11.2px] text-danger'>{validation.errors.inputValue}</p> : null}
              </div>
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

export default memo(InputNumberModal)
