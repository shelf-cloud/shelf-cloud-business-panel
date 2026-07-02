import { useContext, useState } from 'react'

import AppContext from '@context/AppContext'
import { FormatIntPercentage } from '@lib/FormatNumbers'
import { AmzDimensions, Dimensions } from '@typesTs/amazon/fulfillments'
import axios from 'axios'
import { useFormik } from 'formik'
import { toast } from 'react-toastify'
import { Button, Col, Form, FormFeedback, FormGroup, Input, Label, Modal, ModalBody, ModalHeader, Row, Spinner } from '@/components/migration-ui'
import { useSWRConfig } from 'swr'
import * as Yup from 'yup'

type Props = {
  dimensionsModal: {
    show: boolean
    inventoryId: number
    isKit: boolean
    msku: string
    asin: string
    scSKU: string
    boxQty: number
    shelfCloudDimensions: AmzDimensions
    amazonDimensions: Dimensions
  }
  setdimensionsModal: (dimensionsModal: any) => void
}

const AmazonFulfillmentDimensions = ({ dimensionsModal, setdimensionsModal }: Props) => {
  const { state }: any = useContext(AppContext)
  const [loading, setloading] = useState(false)
  const { mutate } = useSWRConfig()
  const amzItemVolume = dimensionsModal.amazonDimensions.length.value * dimensionsModal.amazonDimensions.width.value * dimensionsModal.amazonDimensions.height.value
  const amzBoxVolume = amzItemVolume * dimensionsModal.boxQty
  const amzBoxTenPercent = amzBoxVolume * 0.1

  const validation = useFormik({
    enableReinitialize: true,
    initialValues: {
      boxWeight: dimensionsModal.shelfCloudDimensions.boxWeight,
      boxLength: dimensionsModal.shelfCloudDimensions.boxLength,
      boxWidth: dimensionsModal.shelfCloudDimensions.boxWidth,
      boxHeight: dimensionsModal.shelfCloudDimensions.boxHeight,
    },
    validationSchema: Yup.object({
      boxWeight: Yup.number()
        .min(0.01)
        .max(dimensionsModal.boxQty > 1 ? 50 : 100)
        .required('Please enter Box Weight'),
      boxLength: Yup.number()
        .min(0.01)
        .max(
          dimensionsModal.amazonDimensions.length.value > 25 ||
            dimensionsModal.amazonDimensions.width.value > 25 ||
            dimensionsModal.amazonDimensions.height.value > 25 ||
            dimensionsModal.boxQty === 1
            ? 150
            : 25
        )
        .required('Please enter Box Length'),
      boxWidth: Yup.number()
        .min(0.01)
        .max(dimensionsModal.boxQty > 1 ? 25 : 150)
        .required('Please enter Box Width'),
      boxHeight: Yup.number()
        .min(0.01)
        .max(dimensionsModal.boxQty > 1 ? 25 : 150)
        .required('Please enter Box Height'),
    }),
    onSubmit: async (values, { resetForm }) => {
      setloading(true)
      const updatingBoxDimensions = toast.loading('Saving new Box Dimensions...')

      const response = await axios.post(`/api/amazon/fullfilments/masterBoxes/saveAmazonBoxDimensions?region=${state.currentRegion}&businessId=${state.user.businessId}`, {
        inventoryId: dimensionsModal.inventoryId,
        isKit: dimensionsModal.isKit,
        amzDimensions: {
          boxLength: values.boxLength,
          boxWidth: values.boxWidth,
          boxHeight: values.boxHeight,
          boxWeight: values.boxWeight,
        },
      })
      if (!response.data.error) {
        toast.update(updatingBoxDimensions, {
          render: response.data.message,
          type: 'success',
          isLoading: false,
          autoClose: 3000,
        })
        setdimensionsModal({
          show: false,
          inventoryId: 0,
          isKit: false,
          msku: '',
          asin: '',
          scSKU: '',
          boxQty: 0,
          shelfCloudDimensions: {},
          amazonDimensions: {},
        })
        mutate(`${process.env.NEXT_PUBLIC_SHELFCLOUD_SERVER_URL}/api/amz_workflow/getAmazonFbaSkus/${state.currentRegion}/${state.user.businessId}`)
        resetForm()
      } else {
        toast.update(updatingBoxDimensions, {
          render: response.data.message,
          type: 'error',
          isLoading: false,
          autoClose: 3000,
        })
      }

      setloading(false)
    },
  })

  const handleAddProduct = (event: any) => {
    event.preventDefault()
    validation.handleSubmit()
  }

  return (
    <Modal
      fade={false}
      size='lg'
      id='confirmDelete'
      isOpen={dimensionsModal.show}
      toggle={() => {
        setdimensionsModal({
          show: false,
          inventoryId: 0,
          isKit: false,
          msku: '',
          asin: '',
          scSKU: '',
          boxQty: 0,
          shelfCloudDimensions: {},
          amazonDimensions: {},
        })
      }}>
      <ModalHeader
        toggle={() => {
          setdimensionsModal({
            show: false,
            inventoryId: 0,
            isKit: false,
            msku: '',
            asin: '',
            scSKU: '',
            boxQty: 0,
            shelfCloudDimensions: {},
            amazonDimensions: {},
          })
        }}
        className='modal-title'
        id='myModalLabel'>
        Listing Box Dimensions
      </ModalHeader>
      <ModalBody>
        <h5 className='tw:text-[19.5px] tw:mb-0 tw:font-semibold tw:text-primary'>Amazon Listing:</h5>
        <p className='tw:m-0 tw:p-0 tw:text-[var(--bs-secondary-color)]'>
          MSKU: <span className='text-black tw:font-semibold'>{dimensionsModal.msku}</span>
        </p>
        <p className='tw:m-0 tw:p-0 tw:text-[var(--bs-secondary-color)]'>
          ASIN: <span className='text-black tw:font-semibold'>{dimensionsModal.asin}</span>
        </p>
        <p className='tw:m-0 tw:p-0 tw:text-[var(--bs-secondary-color)]'>
          ShelfCloud SKU: <span className='text-black tw:font-semibold'>{dimensionsModal.scSKU}</span>
        </p>

        <Form onSubmit={handleAddProduct}>
          <Row className='tw:my-4'>
            <Col md={3}>
              <FormGroup className='tw:mb-4'>
                <Label htmlFor='boxLength' className='form-label'>
                  *Box Length (inch)
                </Label>
                <div className='input-group'>
                  <Input
                    type='number'
                    bsSize='sm'
                    id='boxLength'
                    name='boxLength'
                    onChange={validation.handleChange}
                    onBlur={validation.handleBlur}
                    value={validation.values.boxLength || ''}
                    invalid={validation.touched.boxLength && validation.errors.boxLength ? true : false}
                  />
                  {validation.touched.boxLength && validation.errors.boxLength ? <FormFeedback type='invalid'>{validation.errors.boxLength}</FormFeedback> : null}
                </div>
              </FormGroup>
            </Col>
            <Col md={3}>
              <FormGroup className='tw:mb-4'>
                <Label htmlFor='boxWidth' className='form-label'>
                  *Box Width (inch)
                </Label>
                <div className='input-group'>
                  <Input
                    type='number'
                    bsSize='sm'
                    id='boxWidth'
                    name='boxWidth'
                    onChange={validation.handleChange}
                    onBlur={validation.handleBlur}
                    value={validation.values.boxWidth || ''}
                    invalid={validation.touched.boxWidth && validation.errors.boxWidth ? true : false}
                  />
                  {validation.touched.boxWidth && validation.errors.boxWidth ? <FormFeedback type='invalid'>{validation.errors.boxWidth}</FormFeedback> : null}
                </div>
              </FormGroup>
            </Col>
            <Col md={3}>
              <FormGroup className='tw:mb-4'>
                <Label htmlFor='boxHeight' className='form-label'>
                  *Box Height (inch)
                </Label>
                <div className='input-group'>
                  <Input
                    type='number'
                    bsSize='sm'
                    id='boxHeight'
                    name='boxHeight'
                    onChange={validation.handleChange}
                    onBlur={validation.handleBlur}
                    value={validation.values.boxHeight || ''}
                    invalid={validation.touched.boxHeight && validation.errors.boxHeight ? true : false}
                  />
                  {validation.touched.boxHeight && validation.errors.boxHeight ? <FormFeedback type='invalid'>{validation.errors.boxHeight}</FormFeedback> : null}
                </div>
              </FormGroup>
            </Col>
            <Col md={3}>
              <FormGroup className='tw:mb-4'>
                <Label htmlFor='boxWeight' className='form-label'>
                  *Box Weight (lb)
                </Label>
                <div className='input-group'>
                  <Input
                    type='number'
                    bsSize='sm'
                    id='boxWeight'
                    name='boxWeight'
                    onChange={validation.handleChange}
                    onBlur={validation.handleBlur}
                    value={validation.values.boxWeight || ''}
                    invalid={validation.touched.boxWeight && validation.errors.boxWeight ? true : false}
                  />
                  {validation.touched.boxWeight && validation.errors.boxWeight ? <FormFeedback type='invalid'>{validation.errors.boxWeight}</FormFeedback> : null}
                </div>
              </FormGroup>
            </Col>
          </Row>
          <Row className='tw:mb-2 tw:mt-0'>
            <p className='tw:m-0 tw:text-[16.25px] tw:font-semibold'>Expected Dimensions</p>
            <p className='tw:m-0 tw:text-[var(--bs-secondary-color)] tw:text-nowrap'>
              Amazon Minimum Expected Box Volume: <span className='text-black tw:font-semibold'>{FormatIntPercentage(state.currentRegion, amzBoxVolume - amzBoxTenPercent)} inch3</span>
            </p>
            <p className='tw:m-0 tw:text-[var(--bs-secondary-color)] tw:text-nowrap'>
              ShelfCloud Box Volume:{' '}
              <span className='text-black tw:font-semibold'>
                {FormatIntPercentage(state.currentRegion, validation.values.boxLength * validation.values.boxWidth * validation.values.boxHeight)} inch3
              </span>
            </p>
            {amzBoxVolume - amzBoxTenPercent > validation.values.boxLength * validation.values.boxWidth * validation.values.boxHeight && (
              <span className='tw:m-0 tw:mt-1 tw:text-danger'>
                ShelfCloud Box dimensions do not meet the expected minimum volume for Amazon. Please adjust the Box Dimensions to meet the minimum volume requirements.
              </span>
            )}
          </Row>
          <Row md={12} className='tw:mt-4'>
            <div className='tw:text-right tw:mt-2 tw:flex tw:flex-row tw:gap-6 tw:justify-end'>
              <div className='tw:flex tw:flex-row tw:gap-4'>
                <Button
                  type='button'
                  color='light'
                  className='btn'
                  onClick={() => {
                    setdimensionsModal({
                      show: false,
                      inventoryId: 0,
                      isKit: false,
                      msku: '',
                      asin: '',
                      scSKU: '',
                      boxQty: 0,
                      shelfCloudDimensions: {},
                      amazonDimensions: {},
                    })
                  }}>
                  Cancel
                </Button>
                <Button disabled={loading} type='submit' color='success' className='btn'>
                  {loading ? <Spinner color='light' size={'sm'} /> : 'Save Box Dimensions'}
                </Button>
              </div>
            </div>
          </Row>
        </Form>
      </ModalBody>
    </Modal>
  )
}

export default AmazonFulfillmentDimensions
