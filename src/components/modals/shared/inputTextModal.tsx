import { memo, useState } from 'react'

import { useFormik } from 'formik'
import { DebounceInput } from 'react-debounce-input'
import { Button, Col, Form, Modal, ModalBody, ModalFooter, ModalHeader, Row, Spinner } from 'reactstrap'
import * as Yup from 'yup'

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
    <Modal fade={false} size='md' id='inputNumberModal' isOpen={isOpen} toggle={handleClose}>
      <ModalHeader toggle={handleClose} className='modal-title' id='myModalLabel'>
        {headerText}
      </ModalHeader>
      <Form onSubmit={handleSubmitForm}>
        <ModalBody>
          <Row>
            <p className='fs-5 fw-semibold'>
              {primaryText} {primaryTextSub && <span className='text-primary'>{primaryTextSub}</span>}
            </p>
            {descriptionText && <p className='fs-7 text-muted'>{descriptionText}</p>}
            <Col sm={12} className='d-flex flex-column justify-content-end align-items-end'>
              <Col xs={12} className='text-end'>
                <DebounceInput
                  minLength={minLength}
                  debounceTimeout={200}
                  className={`form-control form-control-sm fs-6 ${validation.errors.inputValue ? 'is-invalid' : ''}`}
                  placeholder={placeholder}
                  id='inputValue'
                  name='inputValue'
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
                {validation.touched.inputValue && validation.errors.inputValue ? <p className='m-0 p-0 fs-7 text-danger'>{validation.errors.inputValue}</p> : null}
              </Col>
            </Col>
          </Row>
        </ModalBody>
        <ModalFooter>
          <div className='w-100 mt-2 d-flex flex-row gap-2 justify-content-between align-items-center'>
            <div>
              <Button disabled={isLoading} type='button' color='danger' className='fs-7' onClick={handleClearValue}>
                Clear Value
              </Button>
            </div>
            <div className='d-flex flex-row gap-2 justify-content-end'>
              <Button disabled={isLoading} type='button' color='light' className='fs-7' onClick={handleClose}>
                Cancel
              </Button>
              <Button disabled={isLoading} type='submit' color='success' className='fs-7'>
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

export default memo(InputTextModal)
