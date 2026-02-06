import { InboundPlan } from '@typesTs/amazon/fulfillments/fulfillment'

type Props = {
  fulfillment: InboundPlan
}

const ShippingPlacements = ({ fulfillment }: Props) => {
  return (
    <div className='w-100'>
      {fulfillment.packingOptions?.map((packingOption) => (
        <div key={packingOption.packingOptionId}>
          <p>{packingOption.status}</p>
        </div>
      ))}
    </div>
  )
}

export default ShippingPlacements
