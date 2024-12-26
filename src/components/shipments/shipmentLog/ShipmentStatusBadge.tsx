import React from 'react'

type Props = {
  status: string
}

const ShipmentStatusBadge = ({ status }: Props) => {
  switch (status) {
    case 'shipped':
    case 'received':
      return <span className='badge text-uppercase badge-soft-success p-2'>{` ${status} `}</span>
      break
    case 'Processed':
      return <span className='badge text-uppercase badge-soft-secondary p-2'>{` ${status} `}</span>
      break
    case 'awaiting_shipment':
    case 'awaiting':
      return <span className='badge text-uppercase badge-soft-warning p-2'>{' awaiting '}</span>
      break
    case 'awaiting pickup':
      return <span className='badge text-uppercase badge-soft-secondary p-2'>{' awaiting pickup '}</span>
      break
    case 'on_hold':
      return <span className='badge text-uppercase badge-soft-danger p-2'>{' on hold '}</span>
      break
    case 'cancelled':
      return <span className='badge text-uppercase badge-soft-dark p-2'> {status} </span>
      break
    default:
      return <span className='badge text-uppercase badge-soft-primary p-2'> {status} </span>
      break
  }
}

export default ShipmentStatusBadge
