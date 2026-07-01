type Props = {
  active: boolean
  isKit: boolean
  inStock: boolean
}

const Status_Product_Details = ({ active, isKit, inStock }: Props) => {
  return (
    <div className='tw:border-l tw:border-[color:var(--border)] tw:ps-4 tw:py-1 tw:w-full'>
      <p className='tw:text-[19.5px] tw:text-primary tw:font-semibold'>Status</p>
      <div className='tw:flex tw:flex-col'>
        <div className='tw:flex tw:justify-start tw:items-center'>
          <i className={'ri-checkbox-circle-fill tw:align-middle tw:me-2 tw:text-[19.5px] ' + (active ? 'tw:text-success' : 'tw:text-[color:var(--bs-secondary-color)]')}></i>
          <span className='tw:text-[13px] tw:font-extrabold'>Active</span>
        </div>
        <div className='tw:flex tw:justify-start tw:items-center tw:mt-2'>
          <i className={'tw:align-middle tw:me-2 tw:text-[22.75px] tw:text-primary ' + (isKit ? 'las la-sitemap' : 'las la-box')}></i>
          <span className='tw:text-[13px] tw:font-extrabold'>{isKit ? 'Kit Product' : 'Standard Product'}</span>
        </div>
        <div className='tw:flex tw:justify-start tw:items-center tw:mt-2'>
          <i className={'tw:align-middle tw:me-2 tw:text-[19.5px] ' + (inStock ? 'ri-checkbox-circle-fill tw:text-success' : 'ri-error-warning-fill tw:text-destructive')}></i>
          <span className='tw:text-[13px] tw:font-extrabold'>{inStock ? 'In Stock' : 'Out Of Stock'}</span>
        </div>
      </div>
    </div>
  )
}

export default Status_Product_Details
