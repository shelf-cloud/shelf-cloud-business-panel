const ResponseLoading = () => {
  return (
    <div className='tw:flex tw:items-center tw:gap-2 tw:text-xs tw:text-muted-foreground'>
      <span className='tw:flex tw:gap-1' aria-hidden='true'>
        <span className='tw:size-2 tw:animate-bounce tw:rounded-full tw:bg-primary [animation-delay:-0.3s]' />
        <span className='tw:size-2 tw:animate-bounce tw:rounded-full tw:bg-primary [animation-delay:-0.15s]' />
        <span className='tw:size-2 tw:animate-bounce tw:rounded-full tw:bg-primary' />
      </span>
      Analyzing forecast context...
    </div>
  )
}

export default ResponseLoading
