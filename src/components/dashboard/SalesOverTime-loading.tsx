import moment from 'moment'
import { Card, CardBody, CardHeader, Col, Spinner } from '@/components/migration-ui'

const SalesOverTimeLoading = () => {
  return (
    <Col>
      <Card style={{ width: '100%', height: '426px' }}>
        <CardHeader className='tw:flex tw:items-center tw:justify-between'>
          <h4 className='tw:grow tw:mb-0 tw:text-[16px] tw:font-medium tw:text-[#212529]'>Sales Over Time</h4>
          <span className='tw:text-[13px] tw:text-[color:var(--bs-secondary-color)] tw:font-normal'>
            <i className='las la-clock tw:text-[16.25px] tw:me-1'></i>
            {moment().format('h:mm a')}
          </span>
        </CardHeader>

        <CardBody className='tw:flex tw:flex-row tw:justify-center tw:items-center tw:text-primary'>
          <p className='tw:text-[16.25px] tw:m-0 tw:p-0 tw:font-normal'>
            <Spinner size={'sm'} /> Loading Sales...
          </p>
        </CardBody>
      </Card>
    </Col>
  )
}

export default SalesOverTimeLoading
