import { toast } from '@/lib/toast'

import { cn } from '@/lib/shadcn/utils'

type Props = {
  text: string
  label: string
  fontSize?: string
  className?: string
  title?: string
}

// Maps legacy Bootstrap `fs-*` sizes (still passed by not-yet-migrated callers)
// to Velzon-equivalent Tailwind sizes. A caller may also pass a `` class.
const FS_TO_TW: Record<string, string> = {
  'text-[22.75px]': 'text-[22.75px]',
  'text-[19.5px]': 'text-[19.5px]',
  'text-[16.25px]': 'text-[16.25px]',
  'text-[13px]': 'text-[13px]',
  'text-[11.2px]': 'text-[11.2px]',
}

const CopyTextToClipboard = ({ text, label, fontSize = 'text-[13px]', className, title }: Props) => {
  const sizeClass = fontSize.startsWith('fs-') ? (FS_TO_TW[fontSize] ?? 'text-[13px]') : fontSize
  return (
    <i
      className={cn('ri-file-copy-line', sizeClass, 'my-0 mx-1 p-0 text-muted-foreground font-normal', className)}
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
