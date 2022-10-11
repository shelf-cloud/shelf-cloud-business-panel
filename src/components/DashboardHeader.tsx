/* eslint-disable react/no-unescaped-entities */
import React from 'react'
import { Col, Row } from 'reactstrap'
import Flatpickr from 'react-flatpickr'
import moment from 'moment'

type Props = {
  user: string,
  startDate: string,
  endDate: string,
  handleChangeDates: Function
}

const DashboardHeader = ({ user, startDate, endDate, handleChangeDates }: Props) => {
  
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
                <div className="d-flex flex-row justify-content-end w-100">
                  <Flatpickr
                    className="form-control border-0 shadow datePicker"
                    options={{
                      mode: 'range',
                      dateFormat: 'd/m/Y',
                      defaultDate: [moment(startDate, 'YYYY-MM-DD').format('DD-MM-YYYY'), moment(endDate, 'YYYY-MM-DD').format('DD-MM-YYYY')],
                    }}
                    onChange={(selectedDates, dateStr) => handleChangeDates(dateStr)}
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
