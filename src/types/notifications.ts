export interface NotificationBody {
  id: number
  businessUniqId: string
  read: boolean
  created: string
  type: 'error' | 'warning' | 'info' | 'success'
  needToast: boolean
  title: string
  description: string
  tag?: string
}

export type ToastNotificationUserBody = Pick<NotificationBody, 'type' | 'needToast' | 'title'>

export interface NotificationsPanelResponse {
  notifications: NotificationBody[]
}

export type NotificationTag =
  | 'shipments_log'
  | 'amazon_not_mapped'
  | 'amazon_fulfillment_created'
  | 'amazon_fulfillment_error'
  | 'amazon_fba_shipments'
  | 'receiving_log'
  | 'reports_ready'
  | 'billing_invoices'

export type NotificationTagLinks = { [key in NotificationTag]: { title: string; link: string } }
