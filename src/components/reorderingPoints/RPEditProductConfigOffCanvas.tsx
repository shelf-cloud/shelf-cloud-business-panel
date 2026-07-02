import { useContext, useState } from 'react'

import AppContext from '@context/AppContext'
import { RPProductConfig } from '@hooks/reorderingPoints/useRPProductConfig'
import { RPProductUpdateConfig } from '@hooks/reorderingPoints/useRPProductsInfo'
import { useFormik } from 'formik'
import * as Yup from 'yup'

import { Button, Col, Form, Input, Label, Offcanvas, OffcanvasBody, OffcanvasHeader, Row, Spinner } from '@/components/migration-ui'

type Props = {
  rpProductConfig: RPProductConfig
  setRPProductConfig: (cb: (prev: RPProductConfig) => RPProductConfig) => void
  handleSaveProductConfig: ({
    inventoryId,
    sku,
    orderFrequency,
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
      orderFrequency: product.orderFrequency || 0,
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
      orderFrequency: Yup.number().min(0, 'Minimum of 0').required('Enter Order Frequency'),
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
        orderFrequency: values.orderFrequency,
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

  const handleAddProduct = (event: any) => {
    event.preventDefault()
    validation.handleSubmit()
  }

  return (
    <Offcanvas isOpen={isOpen} direction='end' toggle={handleCloseCanvas}>
      <OffcanvasHeader className='tw:pb-2' toggle={handleCloseCanvas}>
        Product Config
      </OffcanvasHeader>
      <OffcanvasBody className='tw:pt-0'>
        <div className='tw:flex tw:flex-col'>
          <p className='tw:text-[16.25px] tw:font-bold tw:m-0 tw:p-0'>
            SKU: <span className='tw:text-primary'>{rpProductConfig.product.sku}</span>
          </p>
          <p className='tw:text-[13px] tw:m-0 tw:p-0 tw:font-semibold'>{rpProductConfig.product.title}</p>
          <p className='tw:text-[11.2px] tw:text-[var(--bs-secondary-color)]'>Here you can edit some configurations related to the product to adjust the forecast.</p>
          <Form onSubmit={handleAddProduct}>
            <h5 className='tw:text-[16.25px] tw:font-bold'>Warehouse</h5>
            <Row>
              <Col xs={12} md={10}>
                <Label htmlFor='orderFrequency' className='tw:text-[11.2px] form-label'>
                  Order Frequency (Weeks)
                </Label>
                <div className='tw:flex tw:flex-row tw:justify-start tw:items-center tw:gap-2'>
                  <Input
                    type='number'
                    className='form-control tw:text-[13px]'
                    bsSize='sm'
                    id='orderFrequency'
                    name='orderFrequency'
                    onChange={validation.handleChange}
                    onBlur={validation.handleBlur}
                    value={validation.values.orderFrequency}
                    invalid={validation.touched.orderFrequency && validation.errors.orderFrequency ? true : false}
                  />
                  <span>Weeks</span>
                </div>
                {validation.touched.orderFrequency && validation.errors.orderFrequency ? <p className='tw:m-0 tw:p-0 tw:text-[11.2px] tw:text-danger'>{validation.errors.orderFrequency}</p> : null}
              </Col>
            </Row>
            <Row>
              <Col xs={12} md={10}>
                <Label htmlFor='leadTimeSC' className='tw:text-[11.2px] form-label'>
                  Lead Time
                </Label>
                <div className='tw:flex tw:flex-row tw:justify-start tw:items-center tw:gap-2'>
                  <Input
                    type='number'
                    className='form-control tw:text-[13px]'
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
                {validation.touched.leadTimeSC && validation.errors.leadTimeSC ? <p className='tw:m-0 tw:p-0 tw:text-[11.2px] tw:text-danger'>{validation.errors.leadTimeSC}</p> : null}
              </Col>
            </Row>
            <Row>
              <Col xs={12} md={10} className='tw:mb-4'>
                <Label htmlFor='daysOfStockSC' className='tw:text-[11.2px] form-label'>
                  *Days of Stock after Lead Time
                </Label>
                <div className='tw:flex tw:flex-row tw:justify-start tw:items-center tw:gap-2'>
                  <Input
                    type='number'
                    className='form-control tw:text-[13px]'
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
                {validation.touched.daysOfStockSC && validation.errors.daysOfStockSC ? <p className='tw:m-0 tw:p-0 tw:text-[11.2px] tw:text-danger'>{validation.errors.daysOfStockSC}</p> : null}
              </Col>
            </Row>
            {state.user[state.currentRegion]?.showAmazonTab && state.user[state.currentRegion]?.amazonConnected && (
              <>
                <h5 className='tw:text-[16.25px] tw:font-bold'>Amazon FBA</h5>
                <Row>
                  <Col xs={12} md={10}>
                    <Label htmlFor='leadTimeFBA' className='tw:text-[11.2px] form-label'>
                      Lead Time
                    </Label>
                    <div className='tw:flex tw:flex-row tw:justify-start tw:items-center tw:gap-2'>
                      <Input
                        type='number'
                        className='form-control tw:text-[13px]'
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
                    {validation.touched.leadTimeFBA && validation.errors.leadTimeFBA ? <p className='tw:m-0 tw:p-0 tw:text-[11.2px] tw:text-danger'>{validation.errors.leadTimeFBA}</p> : null}
                  </Col>
                </Row>
                <Row>
                  <Col xs={12} md={10} className='tw:mb-4'>
                    <Label htmlFor='daysOfStockFBA' className='tw:text-[11.2px] form-label'>
                      *Days of Stock after Lead Time
                    </Label>
                    <div className='tw:flex tw:flex-row tw:justify-start tw:items-center tw:gap-2'>
                      <Input
                        type='number'
                        className='form-control tw:text-[13px]'
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
                    {validation.touched.daysOfStockFBA && validation.errors.daysOfStockFBA ? <p className='tw:m-0 tw:p-0 tw:text-[11.2px] tw:text-danger'>{validation.errors.daysOfStockFBA}</p> : null}
                  </Col>
                </Row>
              </>
            )}
            {state.user[state.currentRegion]?.rpShowAWD && (
              <>
                <h5 className='tw:text-[16.25px] tw:font-bold'>Amazon AWD</h5>
                <Row>
                  <Col xs={12} md={10}>
                    <Label htmlFor='leadTimeAWD' className='tw:text-[11.2px] form-label'>
                      Lead Time
                    </Label>
                    <div className='tw:flex tw:flex-row tw:justify-start tw:items-center tw:gap-2'>
                      <Input
                        type='number'
                        className='form-control tw:text-[13px]'
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
                    {validation.touched.leadTimeAWD && validation.errors.leadTimeAWD ? <p className='tw:m-0 tw:p-0 tw:text-[11.2px] tw:text-danger'>{validation.errors.leadTimeAWD}</p> : null}
                  </Col>
                </Row>
                <Row>
                  <Col xs={12} md={10} className='tw:mb-4'>
                    <Label htmlFor='daysOfStockAWD' className='tw:text-[11.2px] form-label'>
                      *Days of Stock after Lead Time
                    </Label>
                    <div className='tw:flex tw:flex-row tw:justify-start tw:items-center tw:gap-2'>
                      <Input
                        type='number'
                        className='form-control tw:text-[13px]'
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
                    {validation.touched.daysOfStockAWD && validation.errors.daysOfStockAWD ? <p className='tw:m-0 tw:p-0 tw:text-[11.2px] tw:text-danger'>{validation.errors.daysOfStockAWD}</p> : null}
                  </Col>
                </Row>
              </>
            )}
            <h5 className='tw:text-[16.25px] tw:font-bold'>Extra Config</h5>
            <Row>
              <Col xs={12} md={10}>
                <Label htmlFor='buffer' className='tw:text-[11.2px] form-label'>
                  Buffer
                </Label>
                <Input
                  type='number'
                  className='form-control tw:text-[13px]'
                  bsSize='sm'
                  id='buffer'
                  name='buffer'
                  onChange={validation.handleChange}
                  onBlur={validation.handleBlur}
                  value={validation.values.buffer || ''}
                  invalid={validation.touched.buffer && validation.errors.buffer ? true : false}
                />
                {validation.touched.buffer && validation.errors.buffer ? <p className='tw:m-0 tw:p-0 tw:text-[11.2px] tw:text-danger'>{validation.errors.buffer}</p> : null}
              </Col>
            </Row>
            <Row>
              <Col xs={12} md={10} className='tw:mb-4'>
                <Label htmlFor='sellerCost' className='tw:text-[11.2px] form-label'>
                  Seller Cost
                </Label>
                <div className='tw:flex tw:flex-row tw:justify-start tw:items-center tw:gap-2'>
                  <span>$</span>
                  <Input
                    type='number'
                    className='form-control tw:text-[13px]'
                    bsSize='sm'
                    id='sellerCost'
                    name='sellerCost'
                    onChange={validation.handleChange}
                    onBlur={validation.handleBlur}
                    value={validation.values.sellerCost || ''}
                    invalid={validation.touched.sellerCost && validation.errors.sellerCost ? true : false}
                  />
                </div>
                {validation.touched.sellerCost && validation.errors.sellerCost ? <p className='tw:m-0 tw:p-0 tw:text-[11.2px] tw:text-danger'>{validation.errors.sellerCost}</p> : null}
              </Col>
            </Row>
            <p className='tw:text-[11.2px] tw:text-[var(--bs-secondary-color)]'>*The number of days you want to have of stock in addition to the lead time.</p>
            <Row className='tw:mt-4'>
              <Col md={12}>
                <div className='tw:text-right'>
                  <Button disabled={loading} type='submit' color='success' className='tw:text-[11.2px]'>
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
