import React from 'react'
import { Card, CardBody, Col, Row } from 'reactstrap'
import CountUp from 'react-countup'
import FeatherIcon from 'feather-icons-react'
import Link from 'next/link'

const Widget = ({ summary }) => {
  return (
    <React.Fragment>
      <Row>
        <Col xl={3} md={6}>
          <Card className="card-animate">
            <CardBody>
              <div className="d-flex align-items-center">
                <div className="flex-grow-1 overflow-hidden">
                  <p className="text-uppercase fw-medium text-muted text-truncate mb-0">
                    Storage Charges
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <h5 className={'fs-14 mb-0 fw-bold'}>
                    {summary?.binsUSed} Bins
                  </h5>
                </div>
              </div>
              <div className="d-flex align-items-end justify-content-between mt-4">
                <div>
                  <h4 className="fs-22 fw-semibold ff-secondary mb-4">
                    <span className="counter-value" data-target="559.25">
                      <CountUp
                        start={0}
                        prefix={'$'}
                        // suffix={item.suffix}
                        separator={'.'}
                        end={summary?.currentBalance}
                        decimals={2}
                        duration={1}
                      />
                    </span>
                  </h4>
                  <Link href="#" className="text-decoration-underline">
                    Storage
                  </Link>
                </div>
                <div className="avatar-sm flex-shrink-0">
                  <span
                    className={
                      'avatar-title rounded fs-3 bg-soft-info'
                    }
                  >
                    <i className='text-info bx bxs-box'></i>
                  </span>
                </div>
              </div>
            </CardBody>
          </Card>
        </Col>
        <Col xl={3} md={6}>
          <Card className="card-animate">
            <CardBody>
              <div className="d-flex align-items-center">
                <div className="flex-grow-1 overflow-hidden">
                  <p className="text-uppercase fw-medium text-muted text-truncate mb-0">
                    Total Inventory
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <h5 className={'fs-14 mb-0 fw-bold'}>
                  {summary?.skus} SKUs
                  </h5>
                </div>
              </div>
              <div className="d-flex align-items-end justify-content-between mt-4">
                <div>
                  <h4 className="fs-22 fw-semibold ff-secondary mb-4">
                    <span className="counter-value" data-target="559.25">
                      <CountUp
                        start={0}
                        // prefix={'$'}
                        // suffix={item.suffix}
                        // separator={'.'}
                        end={summary?.totalInventoryQty}
                        decimals={0}
                        duration={1}
                      />
                    </span>
                  </h4>
                  <Link href="/Products" className="text-decoration-underline">
                    Products
                  </Link>
                </div>
                <div className="avatar-sm flex-shrink-0">
                  <span
                    className={
                      'avatar-title rounded fs-3 bg-soft-success'
                    }
                  >
                    <i className='text-success las la-clipboard-list'></i>
                  </span>
                </div>
              </div>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </React.Fragment>
  )
}

export default Widget
