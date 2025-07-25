import { toast } from 'react-toastify'

type Props = {
  text: string
  label: string
  fontSize?: string
}

const CopyTextToClipboard = ({ text, label, fontSize = 'fs-6' }: Props) => {
  return (
    <i
      className={`ri-file-copy-line ${fontSize} my-0 mx-1 p-0 text-muted fw-normal`}
      style={{ cursor: 'pointer' }}
      onClick={() => {
        navigator.clipboard.writeText(text)
        toast.success(`${label} copied!`, {
          autoClose: 2000,
          hideProgressBar: true,
          closeOnClick: true,
        })
      }}
    />
  )
}

export default CopyTextToClipboard
