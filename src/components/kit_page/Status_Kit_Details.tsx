import React from 'react'

import { Col, Row } from 'reactstrap'

type Props = {
  active: boolean
  isKit: boolean
  inStock: boolean
}

const Status_Kit_Details = ({ active, isKit, inStock }: Props) => {
  return (
    <div className='border-start ps-4 py-2 w-100'>
      <p className='fs-4 text-primary fw-semibold'>Status</p>
      <Row xs={1}>
        <Col className='d-flex justify-content-start align-items-center'>
          <i className={'ri-checkbox-circle-fill align-middle me-2 fs-2 ' + (active ? 'text-success' : 'text-muted')}></i>
          <span className='fs-5 fw-bolder'>Active</span>
        </Col>
        <Col className='d-flex justify-content-start align-items-center mt-2'>
          <i className={'align-middle me-2 fs-1 text-primary ' + (isKit ? 'las la-sitemap' : 'las la-box')}></i>
          <span className='fs-5 fw-bolder'>{isKit ? 'Kit Product' : 'Standard Product'}</span>
        </Col>
        <Col className='d-flex justify-content-start align-items-center mt-2'>
          <i className={'align-middle me-2 fs-2 ' + (inStock ? 'ri-checkbox-circle-fill text-success' : 'ri-error-warning-fill text-danger')}></i>
          <span className='fs-5 fw-bolder'>{inStock ? 'In Stock' : 'Out Of Stock'}</span>
        </Col>
      </Row>
    </div>
  )
}

export default Status_Kit_Details
