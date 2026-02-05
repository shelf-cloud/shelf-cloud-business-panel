import { useContext, useState } from 'react'

import AppContext from '@context/AppContext'
import { RPProductConfig } from '@hooks/reorderingPoints/useRPProductConfig'
import { RPProductUpdateConfig } from '@hooks/reorderingPoints/useRPProductsInfo'
import { useFormik } from 'formik'
import { Button, Col, Form, Input, Label, Offcanvas, OffcanvasBody, OffcanvasHeader, Row, Spinner } from 'reactstrap'
import * as Yup from 'yup'

type Props = {
  rpProductConfig: RPProductConfig
  setRPProductConfig: (cb: (prev: RPProductConfig) => RPProductConfig) => void
  handleSaveProductConfig: ({
    inventoryId,
    sku,
    leadTimeSC,
    leadTimeFBA,
    leadTimeAWD,
    daysOfStockSC,
    daysOfStockFBA,
    daysOfStockAWD,
    sellerCost,
    buffer,
  }: RPProductUpdateConfig) => Promise<void>
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
      leadTimeSC: product.leadTimeSC,
      leadTimeFBA: product.leadTimeFBA || 0,
      leadTimeAWD: product.leadTimeAWD || 0,
      daysOfStockSC: product.daysOfStockSC,
      daysOfStockFBA: product.daysOfStockFBA || 0,
      daysOfStockAWD: product.daysOfStockAWD || 0,
      buffer: product.buffer || 0,
      sellerCost: product.sellerCost || 0,
    },
    validationSchema: Yup.object({
      leadTimeSC: Yup.number().min(0, 'Minimum of 0').required('Enter Lead Time'),
      leadTimeFBA: Yup.number().min(0, 'Minimum of 0').required('Enter Lead Time'),
      leadTimeAWD: Yup.number().min(0, 'Minimum of 0').required('Enter Lead Time'),
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
        leadTimeSC: values.leadTimeSC,
        leadTimeFBA: values.leadTimeFBA,
        leadTimeAWD: values.leadTimeAWD,
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
            <h5 className='fs-5 fw-bold'>Warehouse</h5>
            <Row>
              <Col xs={12} md={10}>
                <Label htmlFor='leadTimeSC' className='fs-7 form-label'>
                  Lead Time
                </Label>
                <div className='d-flex flex-row justify-content-start align-items-center gap-2'>
                  <Input
                    type='number'
                    className='form-control fs-6'
                    bsSize='sm'
                    id='leadTimeSC'
                    name='leadTimeSC'
                    onChange={validation.handleChange}
                    onBlur={validation.handleBlur}
                    value={validation.values.leadTimeSC}
                    invalid={validation.touched.leadTimeSC && validation.errors.leadTimeSC ? true : false}
                  />
                  <span>Days</span>
                </div>
                {validation.touched.leadTimeSC && validation.errors.leadTimeSC ? <p className='m-0 p-0 fs-7 text-danger'>{validation.errors.leadTimeSC}</p> : null}
              </Col>
            </Row>
            <Row>
              <Col xs={12} md={10} className='mb-3'>
                <Label htmlFor='daysOfStockSC' className='fs-7 form-label'>
                  *Days of Stock after Lead Time
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
                {validation.touched.daysOfStockSC && validation.errors.daysOfStockSC ? <p className='m-0 p-0 fs-7 text-danger'>{validation.errors.daysOfStockSC}</p> : null}
              </Col>
            </Row>
            {state.user[state.currentRegion]?.showAmazonTab && state.user[state.currentRegion]?.amazonConnected && (
              <>
                <h5 className='fs-5 fw-bold'>Amazon FBA</h5>
                <Row>
                  <Col xs={12} md={10}>
                    <Label htmlFor='leadTimeFBA' className='fs-7 form-label'>
                      Lead Time
                    </Label>
                    <div className='d-flex flex-row justify-content-start align-items-center gap-2'>
                      <Input
                        type='number'
                        className='form-control fs-6'
                        bsSize='sm'
                        id='leadTimeFBA'
                        name='leadTimeFBA'
                        onChange={validation.handleChange}
                        onBlur={validation.handleBlur}
                        value={validation.values.leadTimeFBA}
                        invalid={validation.touched.leadTimeFBA && validation.errors.leadTimeFBA ? true : false}
                      />
                      <span>Days</span>
                    </div>
                    {validation.touched.leadTimeFBA && validation.errors.leadTimeFBA ? <p className='m-0 p-0 fs-7 text-danger'>{validation.errors.leadTimeFBA}</p> : null}
                  </Col>
                </Row>
                <Row>
                  <Col xs={12} md={10} className='mb-3'>
                    <Label htmlFor='daysOfStockFBA' className='fs-7 form-label'>
                      *Days of Stock after Lead Time
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
                    {validation.touched.daysOfStockFBA && validation.errors.daysOfStockFBA ? <p className='m-0 p-0 fs-7 text-danger'>{validation.errors.daysOfStockFBA}</p> : null}
                  </Col>
                </Row>
              </>
            )}
            {state.user[state.currentRegion]?.rpShowAWD && (
              <>
                <h5 className='fs-5 fw-bold'>Amazon AWD</h5>
                <Row>
                  <Col xs={12} md={10}>
                    <Label htmlFor='leadTimeAWD' className='fs-7 form-label'>
                      Lead Time
                    </Label>
                    <div className='d-flex flex-row justify-content-start align-items-center gap-2'>
                      <Input
                        type='number'
                        className='form-control fs-6'
                        bsSize='sm'
                        id='leadTimeAWD'
                        name='leadTimeAWD'
                        onChange={validation.handleChange}
                        onBlur={validation.handleBlur}
                        value={validation.values.leadTimeAWD}
                        invalid={validation.touched.leadTimeAWD && validation.errors.leadTimeAWD ? true : false}
                      />
                      <span>Days</span>
                    </div>
                    {validation.touched.leadTimeAWD && validation.errors.leadTimeAWD ? <p className='m-0 p-0 fs-7 text-danger'>{validation.errors.leadTimeAWD}</p> : null}
                  </Col>
                </Row>
                <Row>
                  <Col xs={12} md={10} className='mb-3'>
                    <Label htmlFor='daysOfStockAWD' className='fs-7 form-label'>
                      *Days of Stock after Lead Time
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
                    {validation.touched.daysOfStockAWD && validation.errors.daysOfStockAWD ? <p className='m-0 p-0 fs-7 text-danger'>{validation.errors.daysOfStockAWD}</p> : null}
                  </Col>
                </Row>
              </>
            )}
            <h5 className='fs-5 fw-bold'>Extra Config</h5>
            <Row>
              <Col xs={12} md={10}>
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
                {validation.touched.buffer && validation.errors.buffer ? <p className='m-0 p-0 fs-7 text-danger'>{validation.errors.buffer}</p> : null}
              </Col>
            </Row>
            <Row>
              <Col xs={12} md={10} className='mb-3'>
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
                {validation.touched.sellerCost && validation.errors.sellerCost ? <p className='m-0 p-0 fs-7 text-danger'>{validation.errors.sellerCost}</p> : null}
              </Col>
            </Row>
            <p className='fs-7 text-muted'>*The number of days you want to have of stock in addition to the lead time.</p>
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
