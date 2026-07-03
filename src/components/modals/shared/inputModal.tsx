import { memo } from 'react'

import { SimpleInputModal } from '@hooks/ui/useInputModal'
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
  confirmText: string
  loadingText: string
  placeholder?: string
  value: SimpleInputModal
  onChange: (value: SimpleInputModal) => void
  isLoading?: boolean
  minLength?: number
  error?: string | null
  handleSubmit: (value: SimpleInputModal) => void
  onClose: () => void
}

const InputModal = ({
  isOpen,
  headerText,
  primaryText,
  confirmText,
  loadingText,
  placeholder = '',
  value,
  isLoading = false,
  minLength = 0,
  error,
  handleSubmit,
  onClose,
}: InputModalProps) => {
  const validation = useFormik({
    enableReinitialize: true,
    initialValues: {
      inputText: value.text,
    },
    validationSchema: Yup.object({
      inputText: Yup.string().required('This field is required').min(3, `Minimum ${3} characters required`),
    }),
    onSubmit: async (values) => {
      handleSubmit({ id: value.id, text: values.inputText })
    },
  })

  const handleAddProduct = (event: any) => {
    event.preventDefault()
    validation.handleSubmit()
  }
  return (
    <Dialog open={!!isOpen} onOpenChange={(open) => { if (!open) onClose() }}>
      <DialogContent id='InputModal' aria-describedby={undefined} className='max-h-[90vh] overflow-y-auto sm:!max-w-lg'>
      <DialogHeader className='pr-6' id='myModalLabel'>
        {headerText}
      </DialogHeader>
      <form onSubmit={handleAddProduct}>
        <div>
          <div className='flex flex-wrap -mx-3'>
            <h5 className='text-[16.25px] mb-0 font-semibold text-primary'>{primaryText}</h5>
            <div className='px-3 w-full mt-2'>
              <DebounceInput
                type='text'
                minLength={minLength}
                debounceTimeout={300}
                className={`h-9 w-full min-w-0 rounded-md border border-input bg-input px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 ${error ? 'border-destructive' : ''}`}
                placeholder={placeholder}
                id='inputText'
                name='inputText'
                value={validation.values.inputText || ''}
                onChange={validation.handleChange}
                onBlur={validation.handleBlur}
                aria-invalid={(validation.touched.inputText && validation.errors.inputText ? true : false) || undefined}
              />
              {validation.touched.inputText && validation.errors.inputText ? <p className='m-0 p-0 text-[11.2px] text-danger'>{validation.errors.inputText}</p> : null}
            </div>
          </div>
        </div>
        <DialogFooter className='items-center'>
          <div className='flex flex-wrap -mx-3'>
            <div className='text-right mt-2 flex flex-row gap-4 justify-end'>
              <Button disabled={isLoading} type='button' variant='light' onClick={onClose}>
                Cancel
              </Button>
              <Button disabled={isLoading || !!error} type='submit' variant='success'>
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

export default memo(InputModal) as typeof InputModal
