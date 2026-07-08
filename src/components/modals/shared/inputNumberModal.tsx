import { memo, useContext, useEffect, useState } from 'react'

import AppContext from '@context/AppContext'
import { FormatCurrency } from '@lib/FormatNumbers'
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import { DebounceInput } from 'react-debounce-input'
import { z } from 'zod'

import { Button } from '@shadcn/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader } from '@shadcn/ui/dialog'
import { Spinner } from '@shadcn/ui/spinner'

const inputNumberModalSchema = z.object({
  inputValue: z
    .union([z.string(), z.number()])
    .refine((value) => value !== '' && !Number.isNaN(Number(value)) && Number(value) >= 0.1, 'Value is required'),
})

type InputNumberModalForm = z.infer<typeof inputNumberModalSchema>

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
  const validation = useForm<InputNumberModalForm>({
    resolver: zodResolver(inputNumberModalSchema),
    defaultValues: {
      inputValue: initialValue || '',
    },
  })

  useEffect(() => {
    validation.reset({ inputValue: initialValue || '' })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialValue])

  const inputValue = validation.watch('inputValue')

  const onSubmit = async (values: InputNumberModalForm) => {
    setisLoading(true)
    await handleSubmit(Number(values.inputValue)).then(() => {
      validation.reset()
      handleClose()
      setisLoading(false)
    })
  }

  const handleSubmitForm = validation.handleSubmit(onSubmit)

  const handleClearValue = async () => {
    setisLoading(true)
    await handleSubmitClearValue?.('').then(() => {
      validation.reset()
      handleClose()
      setisLoading(false)
    })
  }

  return (
    <Dialog open={!!isOpen} onOpenChange={(open) => { if (!open) handleClose() }}>
      <DialogContent id='inputNumberModal' aria-describedby={undefined} className='max-h-[90vh] overflow-y-auto sm:!max-w-lg'>
      <DialogHeader className='pr-6' id='myModalLabel'>
        {headerText}
      </DialogHeader>
      <form onSubmit={handleSubmitForm}>
        <div>
          <div className='flex flex-wrap -mx-3'>
            <p className='text-[16.25px] font-semibold'>
              {primaryText} {primaryTextSub && <span className='text-primary'>{primaryTextSub}</span>}
            </p>
            {descriptionText && <p className='text-[11.2px] text-muted-foreground'>{descriptionText}</p>}
            <div className='px-3 sm:w-full flex flex-col justify-end items-end'>
              <div className='px-3 w-full lg:w-4/12 text-right'>
                <Controller
                  control={validation.control}
                  name='inputValue'
                  render={({ field }) => (
                    <DebounceInput
                      type='number'
                      minLength={minLength}
                      debounceTimeout={600}
                      className={`h-8 text-xs w-full min-w-0 rounded-md border border-input bg-input px-3 py-1 shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 text-right ${validation.formState.errors.inputValue ? 'border-destructive' : ''}`}
                      placeholder={placeholder}
                      id='inputValue'
                      name='inputValue'
                      value={field.value ?? ''}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      aria-invalid={Boolean(validation.formState.errors.inputValue) || undefined}
                      inputRef={(input) => {
                        if (isOpen && input) {
                          input.focus()
                        }
                      }}
                    />
                  )}
                />
                {isPrice && <p className='m-0 mt-1 pl-1 font-semibold text-primary'>{FormatCurrency(state.currentRegion, Number(inputValue))}</p>}
                {validation.formState.errors.inputValue ? <p className='m-0 p-0 text-[11.2px] text-danger'>{validation.formState.errors.inputValue.message}</p> : null}
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
