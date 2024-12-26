import React from 'react'
import { Card, CardBody } from 'reactstrap'

type Props = {
  carrier: string
  currentStatus: string
}

const UPS_STATUS_BAR = ['Label Created', 'We Have Your Package', 'On the Way', 'Delay', 'Out for Delivery', 'Delivered']
const UPS_STATUS: { [key: string]: string } = {
  'Label Created': 'Label Created',
  'Shipment Ready for UPS': 'Label Created',
  'We Have Your Package': 'We Have Your Package',
  'On the Way': 'On the Way',
  Delay: 'Delay',
  'Preparing for Delivery': 'On the Way',
  'Loaded on Delivery Vehicle': 'Out for Delivery',
  'Out for Delivery': 'Out for Delivery',
  Delivered: 'Delivered',
}

const FEDEX_STATUS_BAR = ['Label created', 'We have your package', 'On the way', 'Out for delivery', 'Delivered']
const FEDEX_STATUS: { [key: string]: string } = {
  'Label created': 'Label created',
  'We have your package': 'We have your package',
  'On the way': 'On the way',
  'Out for delivery': 'Out for delivery',
  'Delivery updated': 'Out for delivery',
  Delivered: 'Delivered',
}

const checkBorderRadius = (index: number, statusIndex: number) => {
  switch (true) {
    case index === 0 && statusIndex > 0:
      return '0.75rem 0 0 0.75rem'
    case index === 0 && statusIndex === 0:
      return '0.75rem 0.75rem 0.75rem 0.75rem'
    case index < statusIndex:
      return '0 0 0 0'
    case index === statusIndex:
      return '0 0.75rem 0.75rem 0'
    default:
      return '0 0 0 0'
  }
}

const ShipmentCarrierStatusBar = ({ carrier, currentStatus }: Props) => {
  let gridTemplateColumns = `repeat(${UPS_STATUS_BAR.length}, 1fr)`
  let statusLabel = ''
  let statusIndex = 0

  switch (carrier) {
    case 'ups':
      gridTemplateColumns = `repeat(${UPS_STATUS_BAR.length}, 1fr)`
      statusLabel = UPS_STATUS[currentStatus]
      statusIndex = UPS_STATUS_BAR.indexOf(statusLabel)
      return (
        <Card className='mt-0 mb-3'>
          <CardBody className='p-0' style={{ display: 'grid', gridTemplateColumns }}>
            {UPS_STATUS_BAR.map((status, index) => (
              <div
                key={index}
                className={'text-center py-2' + (index <= statusIndex ? ' bg-primary bg-gradient' : '')}
                style={{ borderRadius: checkBorderRadius(index, statusIndex) }}>
                <p className={'m-0 p-0' + (index <= statusIndex ? ' fw-semibold text-white' : ' fw-semibold text-muted')}>{status}</p>
              </div>
            ))}
          </CardBody>
        </Card>
      )
      break
    case 'fedex':
      gridTemplateColumns = `repeat(${FEDEX_STATUS_BAR.length}, 1fr)`
      statusLabel = FEDEX_STATUS[currentStatus]
      statusIndex = FEDEX_STATUS_BAR.indexOf(statusLabel)
      return (
        <Card className='mt-0 mb-3'>
          <CardBody className='p-0' style={{ display: 'grid', gridTemplateColumns }}>
            {FEDEX_STATUS_BAR.map((status, index) => (
              <div
                key={index}
                className={'text-center py-2' + (index <= statusIndex ? ' bg-primary bg-gradient' : '')}
                style={{ borderRadius: checkBorderRadius(index, statusIndex) }}>
                <p className={'m-0 p-0' + (index <= statusIndex ? ' fw-semibold text-white' : ' fw-semibold text-muted')}>{status}</p>
              </div>
            ))}
          </CardBody>
        </Card>
      )
      break
    default:
      gridTemplateColumns = `repeat(${UPS_STATUS_BAR.length}, 1fr)`
      statusLabel = UPS_STATUS[currentStatus]
      statusIndex = UPS_STATUS_BAR.indexOf(statusLabel)
      return (
        <Card className='mt-0 mb-3'>
          <CardBody className='p-0' style={{ display: 'grid', gridTemplateColumns }}>
            {UPS_STATUS_BAR.map((status, index) => (
              <div
                key={index}
                className={'text-center py-2' + (index <= statusIndex ? ' bg-primary bg-gradient' : '')}
                style={{ borderRadius: checkBorderRadius(index, statusIndex) }}>
                <p className={'m-0 p-0' + (index <= statusIndex ? ' fw-semibold text-white' : ' fw-semibold text-muted')}>{status}</p>
              </div>
            ))}
          </CardBody>
        </Card>
      )
      break
  }
}

export default ShipmentCarrierStatusBar
