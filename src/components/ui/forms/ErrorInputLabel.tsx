import React from 'react'

type Props = {
  error: string | undefined
}

const ErrorInputLabel = ({ error }: Props) => {
  if (!error || error === undefined) return null
  return <p className='m-0 mt-1 p-0 fs-7 text-danger'>{error}</p>
}

export default ErrorInputLabel
