import React from 'react'
import Link from 'next/link'
import { Card, CardBody, CardHeader, Col } from 'reactstrap'
import Image from 'next/image'
import { ProductSummary, TotalChagres } from '@typings'
import CountUp from 'react-countup'

type Props = {
  totalCharges: TotalChagres | undefined
}

const TotalChagesList = ({ totalCharges }: Props) => {
  return (
    <React.Fragment>
      <Col xl={6}>
        <Card>
          <CardHeader className="align-items-center d-flex">
            <h4 className="card-title mb-0 flex-grow-1">
              Total Charges
            </h4>
          </CardHeader>

          <CardBody>
            <div className="table-responsive table-card">
              <table className="table table-hover table-centered align-middle table-nowrap mb-0">
                <tbody>
                  <tr>
                    <td>
                      <div className="d-flex align-items-center">
                        <h5 className="fs-14 my-1">Pick and Pack</h5>
                      </div>
                    </td>
                    <td>
                      <h5 className="fs-14 my-1 fw-normal">
                        <CountUp
                          start={0}
                          prefix={'$ '}
                          // suffix={item.suffix}
                          separator={'.'}
                          end={totalCharges?.totalpickpackCharge || 0}
                          decimals={2}
                          duration={1}
                        />
                      </h5>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <div className="d-flex align-items-center">
                        <h5 className="fs-14 my-1">Shipping</h5>
                      </div>
                    </td>
                    <td>
                      <h5 className="fs-14 my-1 fw-normal">
                        <CountUp
                          start={0}
                          prefix={'$ '}
                          // suffix={item.suffix}
                          separator={'.'}
                          end={totalCharges?.totalshippingCharge || 0}
                          decimals={2}
                          duration={1}
                        />
                      </h5>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <div className="d-flex align-items-center">
                        <h5 className="fs-14 my-1">Labeling</h5>
                      </div>
                    </td>
                    <td>
                      <h5 className="fs-14 my-1 fw-normal">
                        <CountUp
                          start={0}
                          prefix={'$ '}
                          // suffix={item.suffix}
                          separator={'.'}
                          end={totalCharges?.totallabeling || 0}
                          decimals={2}
                          duration={1}
                        />
                      </h5>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <div className="d-flex align-items-center">
                        <h5 className="fs-14 my-1">Man Hours</h5>
                      </div>
                    </td>
                    <td>
                      <h5 className="fs-14 my-1 fw-normal">
                        <CountUp
                          start={0}
                          prefix={'$ '}
                          // suffix={item.suffix}
                          separator={'.'}
                          end={totalCharges?.totalmanHour || 0}
                          decimals={2}
                          duration={1}
                        />
                      </h5>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <div className="d-flex align-items-center">
                        <h5 className="fs-14 my-1">Extra Charges</h5>
                      </div>
                    </td>
                    <td>
                      <h5 className="fs-14 my-1 fw-normal">
                        <CountUp
                          start={0}
                          prefix={'$ '}
                          // suffix={item.suffix}
                          separator={'.'}
                          end={totalCharges?.totalextraCharge || 0}
                          decimals={2}
                          duration={1}
                        />
                      </h5>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <div className="d-flex align-items-center">
                        <h5 className="fs-14 my-1">Receiving</h5>
                      </div>
                    </td>
                    <td>
                      <h5 className="fs-14 my-1 fw-normal">
                        <CountUp
                          start={0}
                          prefix={'$ '}
                          // suffix={item.suffix}
                          separator={'.'}
                          end={(totalCharges?.totalreceivingService || 0) + (totalCharges?.totalreceivingPallets || 0) + (totalCharges?.totalreceivingWrapService || 0)}
                          decimals={2}
                          duration={1}
                        />
                      </h5>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardBody>
        </Card>
      </Col>
    </React.Fragment>
  )
}

export default TotalChagesList
