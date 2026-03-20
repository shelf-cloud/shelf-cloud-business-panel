import { toast } from 'react-toastify'

import { cn } from '@/lib/shadcn/utils'

type Props = {
  text: string
  label: string
  fontSize?: string
  className?: string
  title?: string
}

const CopyTextToClipboard = ({ text, label, fontSize = 'fs-6', className, title }: Props) => {
  return (
    <i
      className={cn(`ri-file-copy-line ${fontSize} my-0 mx-1 p-0 text-muted fw-normal`, className)}
      style={{ cursor: 'pointer' }}
      title={title ?? `Copy ${label}`}
      aria-label={title ?? `Copy ${label}`}
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
