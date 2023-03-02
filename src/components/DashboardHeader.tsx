/* eslint-disable react/no-unescaped-entities */
import React from 'react'
import { Col, Row } from 'reactstrap'
import Flatpickr from 'react-flatpickr'
import moment from 'moment'

type Props = {
  user: string
  startDate: string
  endDate: string
  handleChangeDates: Function
}

const DashboardHeader = ({
  user,
  startDate,
  endDate,
  handleChangeDates,
}: Props) => {
  return (
    <React.Fragment>
      <Row className="mb-3 pb-1">
        <Col xs={12}>
          <div className="d-flex align-items-lg-center flex-lg-row flex-column justify-content-between">
            <div>
              <h4 className="fs-6 mb-1">
                Good Morning, <span className="text-capitalize">{user}</span>
              </h4>
              <p className="fs-6 text-muted mb-0">
                Here's what's happening with your Inventory today.
              </p>
            </div>
            <div className="mt-3 mt-lg-0">
              <form action="#">
                <div className="d-flex flex-row align-items-center justify-content-between gap-2 w-auto px-3 py-1 rounded-3 shadow" style={{backgroundColor: 'white', minWidth: '230px'}}>
                  <i className="ri-calendar-2-line fs-5" />
                  <Flatpickr
                    className="border-0 fs-6 w-100"
                    options={{
                      mode: 'range',
                      dateFormat: 'd M y',
                      defaultDate: [
                        moment(startDate, 'YYYY-MM-DD').format('DD MMM YY'),
                        moment(endDate, 'YYYY-MM-DD').format('DD MMM YY'),
                      ],
                    }}
                    onChange={(_selectedDates, dateStr) =>
                      handleChangeDates(dateStr)
                    }
                  />
                    <i className="ri-arrow-down-s-line" />
                  {/* <div className="input-group-text bg-primary border-primary text-white">
                  </div> */}
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
