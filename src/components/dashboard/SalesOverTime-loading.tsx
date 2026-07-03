import moment from 'moment'
import { Card, CardContent, CardHeader } from '@shadcn/ui/card'
import { Spinner } from '@shadcn/ui/spinner'

const SalesOverTimeLoading = () => {
  return (
    <div className='px-3 flex-1 basis-0'>
      <Card style={{ width: '100%', height: '426px' }}>
        <CardHeader className='flex items-center justify-between'>
          <h4 className='grow mb-0 text-[16px] font-medium text-[#212529]'>Sales Over Time</h4>
          <span className='text-[13px] text-muted-foreground font-normal'>
            <i className='las la-clock text-[16.25px] me-1'></i>
            {moment().format('h:mm a')}
          </span>
        </CardHeader>

        <CardContent className='flex flex-row justify-center items-center text-primary'>
          <p className='text-[16.25px] m-0 p-0 font-normal'>
            <Spinner /> Loading Sales...
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

export default SalesOverTimeLoading
