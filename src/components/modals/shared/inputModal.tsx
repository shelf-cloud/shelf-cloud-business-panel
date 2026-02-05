import React, { memo } from 'react'

import { SimpleInputModal } from '@hooks/ui/useInputModal'
import { useFormik } from 'formik'
import { DebounceInput } from 'react-debounce-input'
import { Button, Col, Form, Modal, ModalBody, ModalFooter, ModalHeader, Row, Spinner } from 'reactstrap'
import * as Yup from 'yup'

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

  const HandleAddProduct = (event: any) => {
    event.preventDefault()
    validation.handleSubmit()
  }
  return (
    <Modal fade={false} size='md' id='InputModal' isOpen={isOpen} toggle={onClose}>
      <ModalHeader toggle={onClose} className='modal-title' id='myModalLabel'>
        {headerText}
      </ModalHeader>
      <Form onSubmit={HandleAddProduct}>
        <ModalBody>
          <Row>
            <h5 className='fs-5 mb-0 fw-semibold text-primary'>{primaryText}</h5>
            <Col md={12} className='mt-2'>
              <DebounceInput
                type='text'
                minLength={minLength}
                debounceTimeout={300}
                className={`form-control ${error ? 'is-invalid' : ''}`}
                placeholder={placeholder}
                id='inputText'
                name='inputText'
                value={validation.values.inputText || ''}
                onChange={validation.handleChange}
                onBlur={validation.handleBlur}
                invalid={validation.touched.inputText && validation.errors.inputText ? true : false}
              />
              {validation.touched.inputText && validation.errors.inputText ? <p className='m-0 p-0 fs-7 text-danger'>{validation.errors.inputText}</p> : null}
            </Col>
          </Row>
        </ModalBody>
        <ModalFooter>
          <Row md={12}>
            <div className='text-end mt-2 d-flex flex-row gap-4 justify-content-end'>
              <Button disabled={isLoading} type='button' color='light' className='btn' onClick={onClose}>
                Cancel
              </Button>
              <Button disabled={isLoading || !!error} type='submit' color='success' className='btn'>
                {isLoading ? (
                  <span>
                    <Spinner color='light' size={'sm'} /> {loadingText}
                  </span>
                ) : (
                  confirmText
                )}
              </Button>
            </div>
          </Row>
        </ModalFooter>
      </Form>
    </Modal>
  )
}

export default memo(InputModal) as typeof InputModal
