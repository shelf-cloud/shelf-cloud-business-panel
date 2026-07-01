type Props = {
  error: string | undefined
  marginTop?: string
}

const ErrorInputLabel = ({ error, marginTop = 'tw:mt-1' }: Props) => {
  if (!error || error === undefined) return null
  return <p className={`tw:m-0 ${marginTop} tw:p-0 tw:text-sm tw:text-destructive`}>{error}</p>
}

export default ErrorInputLabel
