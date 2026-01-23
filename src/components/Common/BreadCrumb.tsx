import Link from 'next/link'
import React from 'react'

import { Col, Row } from 'reactstrap'

type Props = {
  title: string
  pageTitle: string
}

const BreadCrumb = ({ title, pageTitle }: Props) => {
  return (
    <React.Fragment>
      <Row>
        <Col xs={12} className='px-0 mx-0'>
          <div className='w-100 page-title-box d-sm-flex align-items-center justify-content-between'>
            <h4 className='mb-sm-0 fw-semibold' style={{ textTransform: 'capitalize' }}>
              {title}
            </h4>
            <div className='page-title-right'>
              <ol className='breadcrumb m-0'>
                <li className='breadcrumb-item'>
                  <Link href={'#'}>{pageTitle}</Link>
                </li>
                <li className='breadcrumb-item active'>{title}</li>
              </ol>
            </div>
          </div>
        </Col>
      </Row>
    </React.Fragment>
  )
}

export default BreadCrumb
