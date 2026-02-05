type Props = {
  error: string | undefined
  marginTop?: string
}

const ErrorInputLabel = ({ error, marginTop = 'mt-1' }: Props) => {
  if (!error || error === undefined) return null
  return <p className={`m-0 ${marginTop} p-0 fs-7 text-danger`}>{error}</p>
}

export default ErrorInputLabel
