import type { ReactNode } from 'react'

import { toast as sonner } from 'sonner'

// The Toaster component is re-exported from this same module (see bottom) so
// the dispatcher and the renderer are guaranteed to resolve the SAME sonner
// module instance — a duplicated instance means toasts dispatch into a store
// the mounted Toaster never sees (silently no toasts).
export { Toaster as SonnerToaster } from 'sonner'

/**
 * react-toastify-compatible adapter over sonner.
 *
 * Preserves the app's existing call signatures so the swap is an import-path
 * change only:
 *   toast.success/error/info/warning(msg)          -> same
 *   const id = toast.loading(msg)                   -> same (returns id)
 *   toast.update(id, { render, type, autoClose })   -> replaces the toast in
 *     place via sonner's { id } option (sonner has no update(); re-issuing
 *     with the same id is its replacement model)
 *   toast.dismiss(id?)                              -> same
 *
 * Option mapping: autoClose (ms | false) -> duration (ms | Infinity);
 * toastId -> id. Other react-toastify options (position, theme, transition)
 * are ignored — the global <Toaster/> in _app.tsx owns those.
 */
type ToastType = 'success' | 'error' | 'info' | 'warning' | 'default'

type CompatOptions = {
  autoClose?: number | false
  toastId?: string | number
  [key: string]: unknown
}

type UpdateOptions = CompatOptions & {
  render?: ReactNode
  type?: ToastType
  isLoading?: boolean
}

function mapOptions(opts?: CompatOptions): { id?: string | number; duration?: number } | undefined {
  if (!opts) return undefined
  const mapped: { id?: string | number; duration?: number } = {}
  if (opts.toastId !== undefined) mapped.id = opts.toastId
  if (opts.autoClose === false) mapped.duration = Infinity
  else if (typeof opts.autoClose === 'number') mapped.duration = opts.autoClose
  return mapped
}

function byType(type: ToastType | undefined) {
  switch (type) {
    case 'success':
      return sonner.success
    case 'error':
      return sonner.error
    case 'info':
      return sonner.info
    case 'warning':
      return sonner.warning
    default:
      return sonner.message
  }
}

// Callable like react-toastify's base toast('msg'), with method properties.
export const toast = Object.assign((msg: ReactNode, opts?: CompatOptions) => sonner.message(msg, mapOptions(opts)), {
  success: (msg: ReactNode, opts?: CompatOptions) => sonner.success(msg, mapOptions(opts)),
  error: (msg: ReactNode, opts?: CompatOptions) => sonner.error(msg, mapOptions(opts)),
  info: (msg: ReactNode, opts?: CompatOptions) => sonner.info(msg, mapOptions(opts)),
  warning: (msg: ReactNode, opts?: CompatOptions) => sonner.warning(msg, mapOptions(opts)),
  warn: (msg: ReactNode, opts?: CompatOptions) => sonner.warning(msg, mapOptions(opts)),
  loading: (msg: ReactNode, opts?: CompatOptions) => sonner.loading(msg, mapOptions(opts)),
  message: (msg: ReactNode, opts?: CompatOptions) => sonner.message(msg, mapOptions(opts)),
  dismiss: (id?: string | number) => sonner.dismiss(id),
  update: (id: string | number, { render, type, isLoading, ...rest }: UpdateOptions) => {
    if (isLoading) {
      sonner.loading(render, { id, ...mapOptions(rest) })
      return
    }
    byType(type)(render, { id, ...mapOptions(rest) })
  },
})

