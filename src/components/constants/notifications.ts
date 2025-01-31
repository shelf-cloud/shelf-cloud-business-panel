import { NotificationTagLinks } from '@typesTs/notifications'

export const notificationsTagLinks: NotificationTagLinks = {
  shipments_log: {
    link: '/Shipments',
    title: 'Shipments',
  },
  amazon_not_mapped: {
    link: '/amazon-sellers/listings?showHidden=0&condition=All&mapped=Not%20Mapped',
    title: 'Amazon Listings',
  },
  amazon_fulfillment_created: {
    link: '/amazon-sellers/fulfillments',
    title: 'Fulfillments',
  },
  amazon_fulfillment_error: {
    link: '/amazon-sellers/fulfillments',
    title: 'Fulfillments',
  },
  amazon_fba_shipments: {
    link: '/amazon-sellers/shipments',
    title: 'FBA Shipments',
  },
  receiving_log: {
    link: '/Receivings',
    title: 'Receivings',
  },
  reports_ready: {
    link: '/reports/list',
    title: 'Reports',
  },
  billing_invoices: {
    link: '/Invoices',
    title: 'Invoices',
  },
}
