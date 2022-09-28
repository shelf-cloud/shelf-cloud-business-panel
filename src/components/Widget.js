import React from 'react'
import { Card, CardBody, Col, Row } from 'reactstrap'
import CountUp from 'react-countup'
import FeatherIcon from 'feather-icons-react'

// type Props = {
//   summary: {
//     binsUSed: number,
//     currentBalance: number,
//     skus: number,
//     totalInventoryQty: number,
//   }
// }
const Widget = ({ summary }) => {

  return (
    <React.Fragment>
      <Row>
        <Col md={6}>
          <Card className="card-animate">
            <CardBody>
              <div className="d-flex justify-content-between">
                <div>
                  <p className="fw-medium text-muted mb-0">Used Bins</p>
                  <h2 className="mt-4 ff-secondary fw-semibold">
                    <span className="counter-value">
                      <CountUp
                        start={0}
                        end={summary?.binsUSed}
                        decimals={0}
                        duration={2}
                      />
                    </span>
                  </h2>
                </div>
                <div>
                  <div className="avatar-sm flex-shrink-0">
                    <span className="avatar-title bg-soft-info rounded-circle fs-2">
                      <FeatherIcon icon="archive" className="text-info" />
                    </span>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        </Col>

        <Col md={6}>
          <Card className="card-animate">
            <CardBody>
              <div className="d-flex justify-content-between">
                <div>
                  <p className="fw-medium text-muted mb-0">Current Balance</p>
                  <h2 className="mt-4 ff-secondary fw-semibold">
                    {`$ `}
                    <span className="counter-value" data-target="97.66">
                      <CountUp
                        start={0}
                        end={summary?.currentBalance}
                        decimals={2}
                        duration={2}
                        separator={','}
                      />
                    </span>
                  </h2>
                </div>
                <div>
                  <div className="avatar-sm flex-shrink-0">
                    <span className="avatar-title bg-soft-info rounded-circle fs-2">
                      <FeatherIcon icon="activity" className="text-info" />
                    </span>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col md={6}>
          <Card className="card-animate">
            <CardBody>
              <div className="d-flex justify-content-between">
                <div>
                  <p className="fw-medium text-muted mb-0">
                    Total SKUs
                  </p>
                  <h2 className="mt-4 ff-secondary fw-semibold">
                    <span className="counter-value" data-target="3">
                      <CountUp start={0} end={summary?.skus} duration={2} />
                    </span>
                  </h2>
                </div>
                <div>
                  <div className="avatar-sm flex-shrink-0">
                    <span className="avatar-title bg-soft-info rounded-circle fs-2">
                      <FeatherIcon icon="clock" className="text-info" />
                    </span>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        </Col>

        <Col md={6}>
          <Card className="card-animate">
            <CardBody>
              <div className="d-flex justify-content-between">
                <div>
                  <p className="fw-medium text-muted mb-0">Total Inventory Qty</p>
                  <h2 className="mt-4 ff-secondary fw-semibold">
                    <span className="counter-value" data-target="33.48">
                      <CountUp
                        start={0}
                        end={summary?.totalInventoryQty}
                        decimals={0}
                        duration={2}
                      />
                    </span>
                  </h2>
                </div>
                <div>
                  <div className="avatar-sm flex-shrink-0">
                    <span className="avatar-title bg-soft-info rounded-circle fs-2">
                      <FeatherIcon icon="external-link" className="text-info" />
                    </span>
                  </div>
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
