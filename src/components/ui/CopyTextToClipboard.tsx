import { toast } from 'react-toastify'

import { cn } from '@/lib/shadcn/utils'

type Props = {
  text: string
  label: string
  fontSize?: string
  className?: string
  title?: string
}

// Maps legacy Bootstrap `fs-*` sizes (still passed by not-yet-migrated callers)
// to Velzon-equivalent Tailwind sizes. A caller may also pass a `tw:` class.
const FS_TO_TW: Record<string, string> = {
  'fs-3': 'tw:text-[22.75px]',
  'fs-4': 'tw:text-[19.5px]',
  'fs-5': 'tw:text-[16.25px]',
  'fs-6': 'tw:text-[13px]',
  'fs-7': 'tw:text-[11.2px]',
}

const CopyTextToClipboard = ({ text, label, fontSize = 'fs-6', className, title }: Props) => {
  const sizeClass = fontSize.startsWith('fs-') ? (FS_TO_TW[fontSize] ?? 'tw:text-[13px]') : fontSize
  return (
    <i
      className={cn('ri-file-copy-line', sizeClass, 'tw:my-0 tw:mx-1 tw:p-0 tw:text-[color:var(--bs-secondary-color)] tw:font-normal', className)}
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
