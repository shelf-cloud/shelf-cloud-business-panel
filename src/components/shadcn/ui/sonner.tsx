import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react"
import type { ToasterProps } from "sonner"

// Imported via @/lib/toast (not directly from 'sonner') so the mounted Toaster
// and the toast() dispatcher share one sonner module instance — a duplicate
// instance means dispatched toasts land in a store this Toaster never reads.
import { SonnerToaster } from "@/lib/toast"


// App is light-only (data-layout-mode is always 'light'; next-themes is not
// mounted), so the theme is pinned instead of read from a provider.
// position/duration defaults match the react-toastify container this replaced.
const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <SonnerToaster
      theme="light"
      position="top-right"
      duration={5000}
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }
