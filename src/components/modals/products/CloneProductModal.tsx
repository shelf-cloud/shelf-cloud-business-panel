 
 
import { useRouter } from 'next/router'
import { useContext, useState } from 'react'

import AppContext from '@context/AppContext'
import axios from 'axios'
import { useFormik } from 'formik'
import { toast } from 'react-toastify'
import { Button, Col, Form, FormFeedback, FormGroup, Input, Label, Modal, ModalBody, ModalHeader, Row, Spinner } from 'reactstrap'
import * as Yup from 'yup'

type CloneProductModal = {
  isOpen: boolean
  originalId: number
  originalName: string
  originalSku: string
}

type Props = {
  cloneProductModal: CloneProductModal
  setcloneProductModal: (prev: CloneProductModal) => void
}

const CloneProductModal = ({ cloneProductModal, setcloneProductModal }: Props) => {
  const { state }: any = useContext(AppContext)
  const [isLoading, setLoading] = useState(false)
  const router = useRouter()
  const validation = useFormik({
    initialValues: {
      title: cloneProductModal.originalName,
      sku: '',
      upc: '',
    },
    validationSchema: Yup.object({
      title: Yup.string().max(100, 'Title is to Long.').required('Please Enter Your Title'),
      sku: Yup.string().max(50, 'SKU is to Long.').notOneOf([cloneProductModal.originalSku], 'SKU cannot be the same as the original SKU').required('Please Enter Sku'),
      upc: Yup.string().max(50, 'UPC is to Long.').required('Please Enter UPC'),
    }),
    onSubmit: async (values) => {
      setLoading(true)
      const cloneProduct = toast.loading('Cloning Product...')

      try {
        const response = await axios
          .post(`/api/products/cloneProduct?region=${state.currentRegion}&businessId=${state.user.businessId}`, {
            title: values.title,
            sku: values.sku,
            upc: values.upc,
            originalId: cloneProductModal.originalId,
            originalSku: cloneProductModal.originalSku,
          })
          .then((res) => res.data)

        if (!response.error) {
          toast.update(cloneProduct, {
            render: response.message,
            type: 'success',
            isLoading: false,
            autoClose: 3000,
          })
          setcloneProductModal({ isOpen: false, originalId: 0, originalName: '', originalSku: '' })
          router.push(`/product/${response.newInventoryId}/${response.newSku}`)
        } else {
          toast.update(cloneProduct, {
            render: response.message,
            type: 'error',
            isLoading: false,
            autoClose: 3000,
          })
        }
      } catch (error) {
        toast.update(cloneProduct, {
          render: 'Error cloning product',
          type: 'error',
          isLoading: false,
          autoClose: 3000,
        })
      }
      setLoading(false)
    },
  })

  const HandleAddProduct = (event: any) => {
    event.preventDefault()
    validation.handleSubmit()
  }

  return (
    <Modal
      fade={false}
      size='lg'
      id='myModal'
      isOpen={cloneProductModal.isOpen}
      toggle={() => {
        setcloneProductModal({ isOpen: false, originalId: 0, originalName: '', originalSku: '' })
      }}>
      <ModalHeader
        toggle={() => {
          setcloneProductModal({ isOpen: false, originalId: 0, originalName: '', originalSku: '' })
        }}
        className='modal-title'
        id='myModalLabel'>
        Clone Product
      </ModalHeader>
      <ModalBody>
        <Form onSubmit={HandleAddProduct}>
          <Row>
            <p className='m-0 fw-bold fs-5 text-primary'>Cloning From:</p>
            <p className='m-0 fw-light'>{cloneProductModal.originalName}</p>
            <p className='m-0 fw-semibold'>{cloneProductModal.originalSku}</p>
          </Row>
          <Row>
            <h5 className='fs-5 m-0 mt-3 mb-2 fw-semibold text-primary'>New Product Details:</h5>
            <Col xs={12} md={6}>
              <FormGroup className='mb-3'>
                <Label htmlFor='firstNameinput' className='form-label'>
                  *Title
                </Label>
                <Input
                  type='text'
                  className='form-control fs-7'
                  placeholder='Title...'
                  id='title'
                  name='title'
                  onChange={validation.handleChange}
                  onBlur={validation.handleBlur}
                  value={validation.values.title || ''}
                  invalid={validation.touched.title && validation.errors.title ? true : false}
                />
                {validation.touched.title && validation.errors.title ? <FormFeedback type='invalid'>{validation.errors.title}</FormFeedback> : null}
              </FormGroup>
            </Col>
            <Col xs={12} md={6}>
              <FormGroup className='mb-3'>
                <Label htmlFor='lastNameinput' className='form-label'>
                  *SKU
                </Label>
                <Input
                  type='text'
                  className='form-control fs-7 text-uppercase'
                  placeholder='Sku...'
                  id='sku'
                  name='sku'
                  onChange={(e) => {
                    e.target.value = e.target.value.toUpperCase()
                    validation.handleChange(e)
                  }}
                  onBlur={validation.handleBlur}
                  value={validation.values.sku || ''}
                  invalid={validation.touched.sku && validation.errors.sku ? true : false}
                />
                {validation.touched.sku && validation.errors.sku ? <FormFeedback type='invalid'>{validation.errors.sku}</FormFeedback> : null}
              </FormGroup>
            </Col>
            <Col xs={12} md={6}>
              <FormGroup className='mb-3'>
                <Label htmlFor='lastNameinput' className='form-label'>
                  *UPC
                </Label>
                <Input
                  type='text'
                  className='form-control fs-7 text-uppercase'
                  placeholder='UPC...'
                  id='upc'
                  name='upc'
                  onChange={(e) => {
                    e.target.value = e.target.value.toUpperCase()
                    validation.handleChange(e)
                  }}
                  onBlur={validation.handleBlur}
                  value={validation.values.upc || ''}
                  invalid={validation.touched.upc && validation.errors.upc ? true : false}
                />
                {validation.touched.upc && validation.errors.upc ? <FormFeedback type='invalid'>{validation.errors.upc}</FormFeedback> : null}
              </FormGroup>
            </Col>
            <Col md={12}>
              <div className='mt-4 d-flex flex-row gap-3 justify-content-end'>
                <Button
                  disabled={isLoading}
                  type='button'
                  color='light'
                  className='btn'
                  onClick={() => {
                    setcloneProductModal({ isOpen: false, originalId: 0, originalName: '', originalSku: '' })
                  }}>
                  Cancel
                </Button>
                <Button type='submit' color='success' className='btn'>
                  {isLoading ? (
                    <span>
                      <Spinner color='light' size={'sm'} /> Cloning...
                    </span>
                  ) : (
                    'Clone'
                  )}
                </Button>
              </div>
            </Col>
          </Row>
        </Form>
      </ModalBody>
    </Modal>
  )
}

export default CloneProductModal
