/* eslint-disable react/no-unescaped-entities */
import React from 'react'
import { Col, Row } from 'reactstrap'
import Flatpickr from 'react-flatpickr'

type Props = {
  user: string
}

const DashboardHeader = ({ user }: Props) => {
  return (
    <React.Fragment>
      <Row className="mb-3 pb-1">
        <Col xs={12}>
          <div className="d-flex align-items-lg-center flex-lg-row flex-column justify-content-between">
            <div>
              <h4 className="fs-16 mb-1">Good Morning, {user}</h4>
              <p className="text-muted mb-0">
                Here's what's happening with your Inventory today.
              </p>
            </div>
            <div className="mt-3 mt-lg-0">
              <form action="#">
                <div className="d-flex flex-row justify-content-end">
                  <Flatpickr
                    className="form-control border-0 w-100 shadow"
                    style={{ minWidth: '105%' }}
                    options={{
                      mode: 'range',
                      dateFormat: 'd M, Y',
                      defaultDate: ['01 Jan 2022', '31 Jan 2022'],
                    }}
                  />
                  <div className="input-group-text bg-primary border-primary text-white">
                    <i className="ri-calendar-2-line"></i>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </Col>
      </Row>
    </React.Fragment>
  )
}

export default DashboardHeader
