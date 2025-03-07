import { RPProductConfig } from '@hooks/useRPProductConfig'
import React, { useContext, useState } from 'react'
import { Button, Col, Form, FormFeedback, FormGroup, FormText, Input, Label, Offcanvas, OffcanvasBody, OffcanvasHeader, Row, Spinner } from 'reactstrap'
import * as Yup from 'yup'
import { useFormik } from 'formik'
import { RPProductUpdateConfig } from '@hooks/useRPProductsInfo'
import AppContext from '@context/AppContext'

type Props = {
  rpProductConfig: RPProductConfig
  setRPProductConfig: (cb: (prev: RPProductConfig) => RPProductConfig) => void
  handleSaveProductConfig: ({ inventoryId, sku, leadTime, daysOfStockSC, daysOfStockFBA, daysOfStockAWD, sellerCost, buffer }: RPProductUpdateConfig) => Promise<void>
}

const RPEditProductConfigOffCanvas = ({ rpProductConfig, setRPProductConfig, handleSaveProductConfig }: Props) => {
  const { state }: any = useContext(AppContext)

  const { isOpen, product } = rpProductConfig
  const [loading, setLoading] = useState(false)

  const handleCloseCanvas = () => {
    setRPProductConfig((prev) => {
      return { ...prev, isOpen: false }
    })
  }

  const validation = useFormik({
    enableReinitialize: true,
    initialValues: {
      leadTime: product.leadTime,
      daysOfStockSC: product.daysOfStockSC,
      daysOfStockFBA: product.daysOfStockFBA || 0,
      daysOfStockAWD: product.daysOfStockAWD || 0,
      buffer: product.buffer || 0,
      sellerCost: product.sellerCost || 0,
    },
    validationSchema: Yup.object({
      leadTime: Yup.number().min(0, 'Minimum of 0').required('Enter Lead Time'),
      daysOfStockSC: Yup.number().min(0, 'Minimum of 0').required('Enter Days of Stock SC'),
      daysOfStockFBA: Yup.number().min(0, 'Minimum of 0').required('Enter Days of Stock FBA'),
      daysOfStockAWD: Yup.number().min(0, 'Minimum of 0').required('Enter Days of Stock AWD'),
      buffer: Yup.number().min(0, 'Minimum of 0').required('Enter Buffer'),
      sellerCost: Yup.number().min(0, 'Minimum of 0').required('Enter Seller Cost'),
    }),
    onSubmit: async (values, { resetForm }) => {
      setLoading(true)
      await handleSaveProductConfig({
        inventoryId: product.inventoryId,
        sku: product.sku,
        leadTime: values.leadTime,
        daysOfStockSC: values.daysOfStockSC,
        daysOfStockFBA: values.daysOfStockFBA,
        daysOfStockAWD: values.daysOfStockAWD,
        buffer: values.buffer,
        sellerCost: values.sellerCost,
      }).finally(() => {
        resetForm()
        handleCloseCanvas()
        setLoading(false)
      })
    },
  })

  const HandleAddProduct = (event: any) => {
    event.preventDefault()
    validation.handleSubmit()
  }

  return (
    <Offcanvas isOpen={isOpen} direction='end' toggle={handleCloseCanvas}>
      <OffcanvasHeader className='pb-2' toggle={handleCloseCanvas}>
        Product Config
      </OffcanvasHeader>
      <OffcanvasBody className='pt-0'>
        <div className='d-flex flex-column'>
          <p className='fs-5 fw-bold m-0 p-0'>
            SKU: <span className='text-primary'>{rpProductConfig.product.sku}</span>
          </p>
          <p className='fs-6 m-0 p-0 fw-semibold'>{rpProductConfig.product.title}</p>
          <p className='fs-7 text-muted'>Here you can edit some configurations related to the product to adjust the forecast.</p>
          <Form onSubmit={HandleAddProduct}>
            <Row>
              <Col xs={12} md={10}>
                <FormGroup>
                  <Label htmlFor='leadTime' className='fs-7 form-label'>
                    Lead Time
                  </Label>
                  <div className='d-flex flex-row justify-content-start align-items-center gap-2'>
                    <Input
                      type='number'
                      className='form-control fs-6'
                      bsSize='sm'
                      id='leadTime'
                      name='leadTime'
                      onChange={validation.handleChange}
                      onBlur={validation.handleBlur}
                      value={validation.values.leadTime}
                      invalid={validation.touched.leadTime && validation.errors.leadTime ? true : false}
                    />
                    <span>Days</span>
                  </div>
                  {validation.touched.leadTime && validation.errors.leadTime ? <FormFeedback type='invalid'>{validation.errors.leadTime}</FormFeedback> : null}
                </FormGroup>
              </Col>
            </Row>
            <Row>
              <Col xs={12} md={10}>
                <FormGroup>
                  <Label htmlFor='daysOfStockSC' className='fs-7 form-label'>
                    Days of Stock for Warehouses
                  </Label>
                  <div className='d-flex flex-row justify-content-start align-items-center gap-2'>
                    <Input
                      type='number'
                      className='form-control fs-6'
                      bsSize='sm'
                      id='daysOfStockSC'
                      name='daysOfStockSC'
                      onChange={validation.handleChange}
                      onBlur={validation.handleBlur}
                      value={validation.values.daysOfStockSC || ''}
                      invalid={validation.touched.daysOfStockSC && validation.errors.daysOfStockSC ? true : false}
                    />
                    <span>Days</span>
                  </div>
                  <FormText className='fs-7'>The number of days you want to have stock in addition to the lead time.</FormText>
                  {validation.touched.daysOfStockSC && validation.errors.daysOfStockSC ? <FormFeedback type='invalid'>{validation.errors.daysOfStockSC}</FormFeedback> : null}
                </FormGroup>
              </Col>
            </Row>
            {state.user[state.currentRegion]?.showAmazonTab && state.user[state.currentRegion]?.amazonConnected && (
              <Row>
                <Col xs={12} md={10}>
                  <FormGroup>
                    <Label htmlFor='daysOfStockFBA' className='fs-7 form-label'>
                      Days of Stock for Amazon FBA
                    </Label>
                    <div className='d-flex flex-row justify-content-start align-items-center gap-2'>
                      <Input
                        type='number'
                        className='form-control fs-6'
                        bsSize='sm'
                        id='daysOfStockFBA'
                        name='daysOfStockFBA'
                        onChange={validation.handleChange}
                        onBlur={validation.handleBlur}
                        value={validation.values.daysOfStockFBA || ''}
                        invalid={validation.touched.daysOfStockFBA && validation.errors.daysOfStockFBA ? true : false}
                      />
                      <span>Days</span>
                    </div>
                    <FormText className='fs-7'>The number of days you want to have stock in addition to the lead time.</FormText>
                    {validation.touched.daysOfStockFBA && validation.errors.daysOfStockFBA ? <FormFeedback type='invalid'>{validation.errors.daysOfStockFBA}</FormFeedback> : null}
                  </FormGroup>
                </Col>
              </Row>
            )}
            {state.user[state.currentRegion]?.showAWD && (
              <Row>
                <Col xs={12} md={10}>
                  <FormGroup>
                    <Label htmlFor='daysOfStockAWD' className='fs-7 form-label'>
                      Days of Stock for Amazon AWD
                    </Label>
                    <div className='d-flex flex-row justify-content-start align-items-center gap-2'>
                      <Input
                        type='number'
                        className='form-control fs-6'
                        bsSize='sm'
                        id='daysOfStockAWD'
                        name='daysOfStockAWD'
                        onChange={validation.handleChange}
                        onBlur={validation.handleBlur}
                        value={validation.values.daysOfStockAWD || ''}
                        invalid={validation.touched.daysOfStockAWD && validation.errors.daysOfStockAWD ? true : false}
                      />
                      <span>Days</span>
                    </div>
                    <FormText className='fs-7'>The number of days you want to have stock in addition to the lead time.</FormText>
                    {validation.touched.daysOfStockAWD && validation.errors.daysOfStockAWD ? <FormFeedback type='invalid'>{validation.errors.daysOfStockAWD}</FormFeedback> : null}
                  </FormGroup>
                </Col>
              </Row>
            )}
            <Row>
              <Col xs={12} md={10}>
                <FormGroup>
                  <Label htmlFor='buffer' className='fs-7 form-label'>
                    Buffer
                  </Label>
                  <Input
                    type='number'
                    className='form-control fs-6'
                    bsSize='sm'
                    id='buffer'
                    name='buffer'
                    onChange={validation.handleChange}
                    onBlur={validation.handleBlur}
                    value={validation.values.buffer || ''}
                    invalid={validation.touched.buffer && validation.errors.buffer ? true : false}
                  />
                  {validation.touched.buffer && validation.errors.buffer ? <FormFeedback type='invalid'>{validation.errors.buffer}</FormFeedback> : null}
                </FormGroup>
              </Col>
            </Row>
            <Row>
              <Col xs={12} md={10}>
                <FormGroup>
                  <Label htmlFor='sellerCost' className='fs-7 form-label'>
                    Seller Cost
                  </Label>
                  <div className='d-flex flex-row justify-content-start align-items-center gap-2'>
                    <span>$</span>
                    <Input
                      type='number'
                      className='form-control fs-6'
                      bsSize='sm'
                      id='sellerCost'
                      name='sellerCost'
                      onChange={validation.handleChange}
                      onBlur={validation.handleBlur}
                      value={validation.values.sellerCost || ''}
                      invalid={validation.touched.sellerCost && validation.errors.sellerCost ? true : false}
                    />
                  </div>
                  {validation.touched.sellerCost && validation.errors.sellerCost ? <FormFeedback type='invalid'>{validation.errors.sellerCost}</FormFeedback> : null}
                </FormGroup>
              </Col>
            </Row>
            <Row className='mt-3'>
              <Col md={12}>
                <div className='text-end'>
                  <Button disabled={loading} type='submit' color='success' className='btn fs-7'>
                    {loading ? (
                      <span>
                        <Spinner color='#fff' size={'sm'} /> Saving...
                      </span>
                    ) : (
                      'Save Changes'
                    )}
                  </Button>
                </div>
              </Col>
            </Row>
          </Form>
        </div>
      </OffcanvasBody>
    </Offcanvas>
  )
}

export default RPEditProductConfigOffCanvas
