type Props = {
  active: boolean
  isKit: boolean
  inStock: boolean
}

const Status_Kit_Details = ({ active, isKit, inStock }: Props) => {
  return (
    <div className='border-l border-[color:var(--border)] ps-4 py-2 w-full'>
      <p className='text-[19.5px] text-primary font-semibold'>Status</p>
      <div className='flex flex-col'>
        <div className='flex justify-start items-center'>
          <i className={'ri-checkbox-circle-fill align-middle me-2 text-[22.75px] ' + (active ? 'text-success' : 'text-[color:var(--bs-secondary-color)]')}></i>
          <span className='text-[16.25px] font-extrabold'>Active</span>
        </div>
        <div className='flex justify-start items-center mt-2'>
          <i className={'align-middle me-2 text-[28px] text-primary ' + (isKit ? 'las la-sitemap' : 'las la-box')}></i>
          <span className='text-[16.25px] font-extrabold'>{isKit ? 'Kit Product' : 'Standard Product'}</span>
        </div>
        <div className='flex justify-start items-center mt-2'>
          <i className={'align-middle me-2 text-[22.75px] ' + (inStock ? 'ri-checkbox-circle-fill text-success' : 'ri-error-warning-fill text-danger')}></i>
          <span className='text-[16.25px] font-extrabold'>{inStock ? 'In Stock' : 'Out Of Stock'}</span>
        </div>
      </div>
    </div>
  )
}

export default Status_Kit_Details
