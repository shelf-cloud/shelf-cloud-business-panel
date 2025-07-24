import { toast } from 'react-toastify'

type Props = {
  text: string
  label: string
}

const CopyTextToClipboard = ({ text, label }: Props) => {
  return (
    <i
      className='ri-file-copy-line fs-6 my-0 mx-1 p-0 text-muted fw-normal'
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
