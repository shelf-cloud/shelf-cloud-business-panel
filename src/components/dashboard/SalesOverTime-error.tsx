import moment from 'moment'
import { Card, CardBody, CardHeader, Col } from 'reactstrap'

const SalesOverTimeError = () => {
  return (
    <Col>
      <Card style={{ width: '100%', height: '426px' }}>
        <CardHeader className='align-items-center d-flex justify-content-between'>
          <h4 className='card-title mb-0 flex-grow-1'>Sales Over Time</h4>
          <span className='fs-6 text-muted fw-normal'>
            <i className='las la-clock fs-5 me-1'></i>
            {moment().format('h:mm a')}
          </span>
        </CardHeader>

        <CardBody className='d-flex flex-row justify-content-center align-items-center text-danger'>
          <p className='fs-5 m-0 p-0 fw-normal'>
            <i className='las la-exclamation-triangle fs-4 me-1'></i> Error loading sales data. Please try again later.
          </p>
        </CardBody>
      </Card>
    </Col>
  )
}

export default SalesOverTimeError
