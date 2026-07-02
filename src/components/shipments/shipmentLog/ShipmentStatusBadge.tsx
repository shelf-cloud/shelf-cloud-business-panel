type Props = {
  status: string
}

const ShipmentStatusBadge = ({ status }: Props) => {
  switch (status) {
    case 'shipped':
    case 'received':
      return <span className='badge tw:uppercase tw:bg-[color-mix(in_srgb,var(--success)_10%,transparent)] tw:text-success tw:p-2'>{` ${status} `}</span>
      break
    case 'Processed':
      return <span className='badge tw:uppercase tw:bg-[color-mix(in_srgb,var(--secondary)_10%,transparent)] tw:text-secondary tw:p-2'>{` ${status} `}</span>
      break
    case 'awaiting_shipment':
    case 'awaiting':
      return <span className='badge tw:uppercase tw:bg-[color-mix(in_srgb,var(--warning)_10%,transparent)] tw:text-warning tw:p-2'>{' awaiting '}</span>
      break
    case 'awaiting pickup':
      return <span className='badge tw:uppercase tw:bg-[color-mix(in_srgb,var(--secondary)_10%,transparent)] tw:text-secondary tw:p-2'>{' awaiting pickup '}</span>
      break
    case 'on_hold':
      return <span className='badge tw:uppercase tw:bg-[color-mix(in_srgb,var(--destructive)_10%,transparent)] tw:text-destructive tw:p-2'>{' on hold '}</span>
      break
    case 'cancelled':
      return <span className='badge tw:uppercase tw:bg-[color-mix(in_srgb,var(--dark)_10%,transparent)] tw:text-dark tw:p-2'> {status} </span>
      break
    default:
      return <span className='badge tw:uppercase tw:bg-[color-mix(in_srgb,var(--primary)_10%,transparent)] tw:text-primary tw:p-2'> {status} </span>
      break
  }
}

export default ShipmentStatusBadge
