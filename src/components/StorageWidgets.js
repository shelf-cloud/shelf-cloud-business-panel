import React from 'react'
import { Card, CardBody, Col, Row } from 'reactstrap'
import CountUp from 'react-countup'
import Link from 'next/link'

const StorageWidgets = ({ currentBalance, binsUSed }) => {
  return (
    <React.Fragment>
      <Row className='w-100'>
        <Col>
          <div className="shadow-none mb-0">
            <div className='p-0'>
              <div className="d-flex align-items-center">
                <div className="flex-grow-1 overflow-hidden">
                  <p className="text-uppercase fw-semibold text-primary text-truncate mb-0">
                    Total Storage Charges
                  </p>
                </div>
              </div>
              <div className="d-flex align-items-end justify-content-between mt-1">
                <div>
                  <h4 className="fs-22 fw-semibold ff-secondary">
                    <span className="counter-value">
                      <CountUp
                        start={0}
                        prefix={'$'}
                        // suffix={item.suffix}
                        separator={'.'}
                        end={currentBalance}
                        decimals={2}
                        duration={1}
                      />
                    </span>
                  </h4>
                </div>
              </div>
            </div>
          </div>
        </Col>
        <Col>
          <div className="shadow-none mb-0 border-start ps-3">
            <div className='p-0'>
              <div className="d-flex align-items-center">
                <div className="flex-grow-1 overflow-hidden">
                  <p className="text-uppercase fw-semibold text-primary text-truncate mb-0">
                    Total Bins Used
                  </p>
                </div>
              </div>
              <div className="d-flex align-items-end justify-content-between mt-1">
                <div>
                  <h4 className="fs-22 fw-semibold ff-secondary">
                    <span className="counter-value">
                      <CountUp
                        start={0}
                        // prefix={'$'}
                        // suffix={item.suffix}
                        separator={'.'}
                        end={binsUSed}
                        decimals={0}
                        duration={1}
                      />
                    </span>
                  </h4>
                </div>
              </div>
            </div>
          </div>
        </Col>
      </Row>
    </React.Fragment>
  )
}

export default StorageWidgets
