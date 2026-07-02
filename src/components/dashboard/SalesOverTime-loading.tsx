import moment from 'moment'
import { Card, CardBody, CardHeader, Col, Spinner } from '@/components/migration-ui'

const SalesOverTimeLoading = () => {
  return (
    <Col>
      <Card style={{ width: '100%', height: '426px' }}>
        <CardHeader className='flex items-center justify-between'>
          <h4 className='grow mb-0 text-[16px] font-medium text-[#212529]'>Sales Over Time</h4>
          <span className='text-[13px] text-[color:var(--bs-secondary-color)] font-normal'>
            <i className='las la-clock text-[16.25px] me-1'></i>
            {moment().format('h:mm a')}
          </span>
        </CardHeader>

        <CardBody className='flex flex-row justify-center items-center text-primary'>
          <p className='text-[16.25px] m-0 p-0 font-normal'>
            <Spinner size={'sm'} /> Loading Sales...
          </p>
        </CardBody>
      </Card>
    </Col>
  )
}

export default SalesOverTimeLoading
