const ResponseLoading = () => {
  return (
    <div className='flex items-center gap-2 text-xs text-muted-foreground'>
      <span className='flex gap-1' aria-hidden='true'>
        <span className='size-2 animate-bounce rounded-full bg-primary [animation-delay:-0.3s]' />
        <span className='size-2 animate-bounce rounded-full bg-primary [animation-delay:-0.15s]' />
        <span className='size-2 animate-bounce rounded-full bg-primary' />
      </span>
      Analyzing forecast context...
    </div>
  )
}

export default ResponseLoading
