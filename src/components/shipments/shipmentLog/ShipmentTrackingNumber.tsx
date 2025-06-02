/* eslint-disable @next/next/no-img-element */
import { NoImageAdress } from '@lib/assetsConstants'

type Props = {
  orderStatus: string
  orderType: string
  trackingNumber: string
  trackingLink: string
  carrierIcon: string
  carrierService: string
}

const ShipmentTrackingNumber = ({ orderStatus, orderType, trackingNumber, trackingLink, carrierIcon, carrierService }: Props) => {
  switch (true) {
    case orderStatus == 'cancelled':
      return <></>
    case (orderType == 'Shipment' || orderType == 'Return') && trackingNumber != '' && !!trackingLink:
      return (
        <div className='trackingNumber_container'>
          <img
            loading='lazy'
            src={carrierIcon ? carrierIcon : NoImageAdress}
            alt='carrier logo'
            style={{
              width: '16px',
              height: '16px',
              objectFit: 'contain',
            }}
          />
          <a
            className='fs-7 text-primary'
            href={`${trackingLink}${trackingNumber}`}
            target='blank'
            rel='noopener noreferrer'
            style={{ textDecoration: 'none', color: 'black', cursor: 'pointer' }}>
            {trackingNumber}
          </a>
        </div>
      )
    case (orderType == 'Shipment' || orderType == 'Return') && trackingNumber != '':
      return (
        <div className='trackingNumber_container'>
          <img
            loading='lazy'
            src={carrierIcon ? carrierIcon : NoImageAdress}
            alt='carrier logo'
            style={{
              width: '16px',
              height: '16px',
              objectFit: 'contain',
            }}
          />
          <p className='fs-7' style={{ margin: '0px' }}>
            {trackingNumber}
          </p>
        </div>
      )
    case (orderType == 'Wholesale' || orderType == 'FBA Shipment') && trackingNumber != '' && !!trackingLink && carrierService == 'Parcel Boxes':
      return (
        <div className='trackingNumber_container'>
          <img
            loading='lazy'
            src={carrierIcon ? carrierIcon : NoImageAdress}
            alt='carrier logo'
            style={{
              width: '16px',
              height: '16px',
              objectFit: 'contain',
            }}
          />
          <a
            className='fs-7 text-primary'
            href={`${trackingLink}${trackingNumber}`}
            target='blank'
            rel='noopener noreferrer'
            style={{ textDecoration: 'none', color: 'black', cursor: 'pointer' }}>
            {trackingNumber}
          </a>
        </div>
      )
    case orderType == 'Wholesale' && trackingNumber != '':
      return (
        <div className='trackingNumber_container'>
          <img
            loading='lazy'
            src={carrierIcon ? carrierIcon : NoImageAdress}
            alt='carrier logo'
            style={{
              width: '16px',
              height: '16px',
              objectFit: 'contain',
            }}
          />
          <p className='fs-7' style={{ margin: '0px' }}>
            {trackingNumber}
          </p>
        </div>
      )
    case trackingNumber == '':
      return <span className='fs-7'>{trackingNumber}</span>
    default:
      return <span className='fs-7'>{trackingNumber}</span>
  }
}

export default ShipmentTrackingNumber
