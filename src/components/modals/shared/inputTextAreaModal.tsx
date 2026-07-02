import { memo, useState } from 'react'

import { useFormik } from 'formik'
import { DebounceInput } from 'react-debounce-input'
import * as Yup from 'yup'

import { Button, Col, Form, Modal, ModalBody, ModalFooter, ModalHeader, Row, Spinner } from '@/components/migration-ui'

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

const InputTextAreaModal = ({
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
      await handleSubmit(values.inputValue).then(() => {
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
    <Modal fade={false} size='md' id='inputNumberModal' isOpen={isOpen} toggle={handleClose}>
      <ModalHeader toggle={handleClose} className='modal-title' id='myModalLabel'>
        {headerText}
      </ModalHeader>
      <Form onSubmit={handleSubmitForm}>
        <ModalBody>
          <Row>
            <p className='text-[16.25px] font-semibold'>
              {primaryText} {primaryTextSub && <span className='text-primary'>{primaryTextSub}</span>}
            </p>
            {descriptionText && <p className='text-[11.2px] text-[var(--bs-secondary-color)]'>{descriptionText}</p>}
            <Col sm={12} className='flex flex-col justify-end items-end'>
              <Col xs={12} className='text-right'>
                <DebounceInput
                  element='textarea'
                  minLength={minLength}
                  debounceTimeout={600}
                  className={`form-control form-control-sm text-[13px] ${validation.errors.inputValue ? 'is-invalid' : ''}`}
                  placeholder={placeholder}
                  id='inputValue'
                  name='inputValue'
                  rows={3}
                  value={validation.values.inputValue || ''}
                  onChange={validation.handleChange}
                  onBlur={validation.handleBlur}
                  invalid={validation.touched.inputValue && validation.errors.inputValue ? true : false}
                  inputRef={(input) => {
                    if (isOpen && input) {
                      input.focus()
                    }
                  }}
                />
                {validation.touched.inputValue && validation.errors.inputValue ? <p className='m-0 p-0 text-[11.2px] text-danger'>{validation.errors.inputValue}</p> : null}
              </Col>
            </Col>
          </Row>
        </ModalBody>
        <ModalFooter>
          <div className='w-full mt-2 flex flex-row gap-2 justify-between items-center'>
            <div>
              <Button disabled={isLoading} type='button' color='danger' className='text-[11.2px]' onClick={handleClearValue}>
                Clear Value
              </Button>
            </div>
            <div className='flex flex-row gap-2 justify-end'>
              <Button disabled={isLoading} type='button' color='light' className='text-[11.2px]' onClick={handleClose}>
                Cancel
              </Button>
              <Button disabled={isLoading} type='submit' color='success' className='text-[11.2px]'>
                {isLoading ? (
                  <span>
                    <Spinner color='light' size={'sm'} /> {loadingText}
                  </span>
                ) : (
                  confirmText
                )}
              </Button>
            </div>
          </div>
        </ModalFooter>
      </Form>
    </Modal>
  )
}

export default memo(InputTextAreaModal)
