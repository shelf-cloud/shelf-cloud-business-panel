import { memo, useContext, useState } from 'react'

import AppContext from '@context/AppContext'
import { FormatCurrency } from '@lib/FormatNumbers'
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
              <Col xs={12} lg={4} className='text-end'>
                <DebounceInput
                  type='number'
                  minLength={minLength}
                  debounceTimeout={600}
                  className={`form-control form-control-sm text-end fs-6 ${validation.errors.inputValue ? 'is-invalid' : ''}`}
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
                {isPrice && <p className='m-0 mt-1 ps-1 fw-semibold text-primary'>{FormatCurrency(state.currentRegion, Number(validation.values.inputValue))}</p>}
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

export default memo(InputNumberModal)
