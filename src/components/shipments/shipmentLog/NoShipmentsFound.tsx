type Props = {}

const NoShipmentsFound = ({}: Props) => {
  return (
    <div className=''>
      <div className='tw:text-center tw:py-5'>
        <div className='tw:flex tw:justify-center tw:mb-4'>
          <div className='tw:bg-[color:var(--vz-light)] tw:rounded-full tw:px-4 tw:py-2 tw:text-center'>
            <i className='ri-inbox-line text-primary fs-1' />
          </div>
        </div>
        <h3 className='card-title'>No shipments found</h3>
        {/* <p className='card-text text-muted'>There are no active shipments at the moment.</p> */}
      </div>
    </div>
  )
}

export default NoShipmentsFound
