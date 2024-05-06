import React, { useEffect, useRef, useState } from 'react'
import * as Yup from 'yup'
import { Formik, Form } from 'formik'
import { Button, Col, Input, InputGroup, InputGroupText, Label } from 'reactstrap'

type Props = {
  initialHighAlert: number
  initialMediumAlert: number
  initialLowAlert: number
  handleUrgencyRange: (highAlertMax: number, mediumAlertMax: number, lowAlertMax: number) => void
}

const ReorderingPointsSettings = ({ initialHighAlert, initialMediumAlert, initialLowAlert, handleUrgencyRange }: Props) => {
  const [openDatesMenu, setOpenDatesMenu] = useState(false)
  const rpSettings = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (document) {
      document.addEventListener('click', (e: any) => {
        if (rpSettings.current) {
          if (!rpSettings.current.contains(e.target)) {
            setOpenDatesMenu(false)
          }
        }
      })
    }
  }, [])

  const initialValues = {
    highAlertMax: initialHighAlert,
    mediumAlertMax: initialMediumAlert,
    lowAlertMax: initialLowAlert,
  }

  const validationSchema = Yup.object({
    highAlertMax: Yup.number().min(0, 'Must be grater than 0').required('Required'),
    mediumAlertMax: Yup.number()
      .test('mediumAlertMax', 'Must be greater than Min Medium Alert', function (value) {
        const { highAlertMax } = this.parent
        return value! > highAlertMax + 1
      })
      .required('Required'),
    lowAlertMax: Yup.number()
      .test('lowAlertMax', 'Must be greater than Min Low Alert', function (value) {
        const { mediumAlertMax } = this.parent
        return value! > mediumAlertMax + 1
      })
      .required('Required'),
  })

  const handleSubmit = async (values: any) => {
    setOpenDatesMenu(false)
    handleUrgencyRange(values.highAlertMax, values.mediumAlertMax, values.lowAlertMax)
  }

  return (
    <div ref={rpSettings} className='dropdown'>
      <button
        className='btn btn-light dropdown-toggle d-flex flex-row justify-content-start align-items-center gap-0'
        style={{ backgroundColor: 'white', border: '1px solid #E1E3E5' }}
        type='button'
        data-bs-toggle='dropdown'
        data-bs-auto-close='outside'
        aria-expanded='false'
        onClick={() => setOpenDatesMenu(!openDatesMenu)}>
        <i className='las la-cog fs-4 m-0 p-0 text-primary' />
        {/* <span className='fw-semibold m-0 p-0'></span> */}
      </button>
      <div className={'dropdown-menu dropdown-menu-xl px-2 pt-3 pb-1' + (openDatesMenu ? ' show' : '')}>
        <div className='d-flex flex-column justify-content-start px-2'>
          <p className='fs-6 m-0 p-0 fw-semibold'>Urgency Time Range</p>
          <p className='fs-7 m-0 p-0 text-muted fw-light'>A product&apos;s urgency depends on how many days of stock remain after lead time. The remaining days to place an order to avoid being out of stock during lead time.</p>
          <p className='fs-7 m-0 p-0 text-muted fw-light'></p>
          <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={(values) => handleSubmit(values)}>
            {({ values, errors, touched, handleChange, handleBlur }) => (
              <Form className='my-2'>
                <Col xs={12} className='mb-1'>
                  <Label htmlFor='highAlertMax' className='form-label mb-1'>
                    <i className={'mdi mdi-alert-octagon text-danger fs-5'} /> High Alert
                  </Label>
                  <div className='d-flex flex-row justify-content-between align-items-center gap-2'>
                    <InputGroup size='sm'>
                      <Input
                        type='number'
                        disabled
                        className='form-control fs-6 m-0'
                        bsSize='sm'
                        style={{ padding: '0.2rem 0.9rem' }}
                        placeholder='Min'
                        id='highAlertMin'
                        name='highAlertMin'
                        value={0}
                      />
                      <InputGroupText className='fs-7 py-0'>Days</InputGroupText>
                    </InputGroup>
                    <span>-</span>
                    <InputGroup size='sm'>
                      <Input
                        type='number'
                        className='form-control fs-6 m-0'
                        bsSize='sm'
                        style={{ padding: '0.2rem 0.9rem' }}
                        placeholder='Max'
                        id='highAlertMax'
                        name='highAlertMax'
                        min={0}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        value={values.highAlertMax}
                        invalid={touched.highAlertMax && errors.highAlertMax ? true : false}
                      />
                      <InputGroupText className='fs-7 py-0'>Days</InputGroupText>
                    </InputGroup>
                  </div>
                  {touched.highAlertMax && errors.highAlertMax ? <p className='m-0 p-0 text-end text-danger fs-7'>{errors.highAlertMax}</p> : null}
                </Col>
                <Col xs={12} className='mb-1'>
                  <Label htmlFor='mediumAlertMin' className='form-label mb-1'>
                    <i className={'mdi mdi-alert-octagon text-warning fs-5'} /> Medium Alert
                  </Label>
                  <div className='d-flex flex-row justify-content-between align-items-center gap-2'>
                    <InputGroup size='sm'>
                      <Input
                        type='number'
                        disabled
                        className='fs-6 m-0'
                        bsSize='sm'
                        style={{ padding: '0.2rem 0.9rem' }}
                        placeholder='Min'
                        id='mediumAlertMin'
                        name='mediumAlertMin'
                        min={0}
                        value={values.highAlertMax + 1 || ''}
                      />
                      <InputGroupText className='fs-7 py-0'>Days</InputGroupText>
                    </InputGroup>
                    <span>-</span>
                    <InputGroup size='sm'>
                      <Input
                        type='number'
                        className='form-control fs-6 m-0'
                        bsSize='sm'
                        style={{ padding: '0.2rem 0.9rem' }}
                        placeholder='Max'
                        id='mediumAlertMax'
                        name='mediumAlertMax'
                        min={0}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        value={values.mediumAlertMax}
                        invalid={touched.mediumAlertMax && errors.mediumAlertMax ? true : false}
                      />
                      <InputGroupText className='fs-7 py-0'>Days</InputGroupText>
                    </InputGroup>
                  </div>
                  {touched.mediumAlertMax && errors.mediumAlertMax ? <p className='m-0 p-0 text-end text-danger fs-7'>{errors.mediumAlertMax}</p> : null}
                </Col>
                <Col xs={12} className='mb-1'>
                  <Label htmlFor='lowAlertMin' className='form-label mb-1'>
                    <i className={'mdi mdi-alert-octagon text-info fs-5'} /> Low Alert
                  </Label>
                  <div className='d-flex flex-row justify-content-between align-items-center gap-2'>
                    <InputGroup size='sm'>
                      <Input
                        type='number'
                        disabled
                        className='fs-6 m-0'
                        bsSize='sm'
                        style={{ padding: '0.2rem 0.9rem' }}
                        placeholder='Min'
                        id='lowAlertMin'
                        name='lowAlertMin'
                        min={0}
                        value={values.mediumAlertMax + 1 || ''}
                      />
                      <InputGroupText className='fs-7 py-0'>Days</InputGroupText>
                    </InputGroup>
                    <span>-</span>
                    <InputGroup size='sm'>
                      <Input
                        type='number'
                        className='form-control fs-6 m-0'
                        bsSize='sm'
                        style={{ padding: '0.2rem 0.9rem' }}
                        placeholder='Max'
                        id='lowAlertMax'
                        name='lowAlertMax'
                        min={0}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        value={values.lowAlertMax}
                        invalid={touched.lowAlertMax && errors.lowAlertMax ? true : false}
                      />
                      <InputGroupText className='fs-7 py-0'>Days</InputGroupText>
                    </InputGroup>
                  </div>
                  {touched.lowAlertMax && errors.lowAlertMax ? <p className='m-0 p-0 text-end text-danger fs-7'>{errors.lowAlertMax}</p> : null}
                </Col>
                <Col xs={12} className='mb-1'>
                  <Label htmlFor='noAlertMin' className='form-label mb-1'>
                    <i className={'mdi mdi-alert-octagon text-success fs-5'} /> No Alert
                  </Label>
                  <div className='d-flex flex-row justify-content-between align-items-center gap-2'>
                    <InputGroup size='sm'>
                      <Input
                        type='number'
                        disabled
                        className='fs-6 m-0'
                        bsSize='sm'
                        style={{ padding: '0.2rem 0.9rem' }}
                        placeholder='Min'
                        id='noAlertMin'
                        name='noAlertMin'
                        min={0}
                        value={values.lowAlertMax + 1 || ''}
                      />
                      <InputGroupText className='fs-7 py-0'>Days</InputGroupText>
                    </InputGroup>
                    <span>-</span>
                    <InputGroup size='sm'>
                      <Input
                        type='text'
                        disabled
                        className='form-control fs-6 m-0'
                        bsSize='sm'
                        style={{ padding: '0.2rem 0.9rem' }}
                        placeholder='Max'
                        id='noAlertMax'
                        name='noAlertMax'
                        value={'∞'}
                      />
                      <InputGroupText className='fs-7 py-0'>Days</InputGroupText>
                    </InputGroup>
                  </div>
                </Col>
                <Col xs={12} className='mt-3'>
                  <div className='d-flex flewx-row justify-content-end align-items-center gap-3'>
                    <Button type='submit' className='fs-6 btn bg-primary' size='sm'>
                      Apply
                    </Button>
                  </div>
                </Col>
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </div>
  )
}

export default ReorderingPointsSettings
