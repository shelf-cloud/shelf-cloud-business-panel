import React, { useContext } from 'react'

import AppContext from '@context/AppContext'
import { FormatCurrency } from '@lib/FormatNumbers'
import { FBAOrder, FBAOrderItem } from '@typesTs/amazon/orders'
import { ExpanderComponentProps } from 'react-data-table-component'
import { Card, CardBody, CardHeader, Col, Row } from '@/components/migration-ui'

type Props = {
  data: FBAOrder
}

const FbaOrdersExpandedDetail: React.FC<ExpanderComponentProps<FBAOrder>> = ({ data }: Props) => {
  const { state }: any = useContext(AppContext)

  const OrderTotalBeforeFeesWithRefund = data?.orderItems.reduce(
    (total, item: FBAOrderItem) => total + (item.refund_item + item.refund_itemTax + item.refund_commission + item.refund_adminCommission + item.refund_facilitatorTax_item),
    0
  )

  const OrderTotalBeforeFees = data?.orderItems.reduce(
    (total, item: FBAOrderItem) =>
      total +
      (item.itemPrice +
        item.itemTax +
        item.shippingPrice +
        item.shippingTax +
        item.giftWrapPrice +
        item.giftWrapTax -
        item.itemPromotionDiscount -
        item.shippingPromotionDiscount +
        item.facilitatorTax_item +
        item.facilitatorTax_shipping +
        item.ShippingChargeback),
    0
  )

  const OrderTotalAfterFees = data?.orderItems.reduce(
    (total, item: FBAOrderItem) =>
      total +
      (item.itemPrice +
        item.itemTax +
        item.shippingPrice +
        item.shippingTax +
        item.giftWrapPrice +
        item.giftWrapTax -
        item.itemPromotionDiscount -
        item.shippingPromotionDiscount +
        item.facilitatorTax_item +
        item.facilitatorTax_shipping +
        item.ShippingChargeback +
        item.Commission +
        item.FBAPerOrderFulfillmentFee +
        item.FBAPerUnitFulfillmentFee +
        item.FBAWeightBasedFee +
        item.FixedClosingFee +
        item.GiftwrapChargeback),
    0
  )
  // let OrderTotalAfterFees = 0
  // if (OrderTotalBeforeFeesWithRefund !== 0) {
  //   OrderTotalAfterFees = data?.orderItems.reduce(
  //     (total, item: FBAOrderItem) =>
  //       total +
  //       (OrderTotalBeforeFeesWithRefund + item.FBAPerOrderFulfillmentFee + item.FBAPerUnitFulfillmentFee + item.FBAWeightBasedFee + item.FixedClosingFee + item.GiftwrapChargeback),
  //     0
  //   )
  // } else {
  //   OrderTotalAfterFees = data?.orderItems.reduce(
  //     (total, item: FBAOrderItem) =>
  //       total +
  //       (item.itemPrice +
  //         item.itemTax +
  //         item.shippingPrice +
  //         item.shippingTax +
  //         item.giftWrapPrice +
  //         item.giftWrapTax -
  //         item.itemPromotionDiscount -
  //         item.shippingPromotionDiscount +
  //         item.facilitatorTax_item +
  //         item.facilitatorTax_shipping +
  //         item.ShippingChargeback +
  //         item.Commission +
  //         item.FBAPerOrderFulfillmentFee +
  //         item.FBAPerUnitFulfillmentFee +
  //         item.FBAWeightBasedFee +
  //         item.FixedClosingFee +
  //         item.GiftwrapChargeback),
  //     0
  //   )
  // }

  return (
    <div style={{ backgroundColor: '#F0F4F7', padding: '10px' }}>
      <Row>
        <Col xl={3}>
          <Col xl={12}>
            <Card>
              <CardHeader className='tw:py-4'>
                <h5 className='tw:font-semibold tw:m-0'>Shipping</h5>
              </CardHeader>
              <CardBody>
                <table className='table table-sm table-borderless'>
                  <tbody>
                    <tr>
                      <td className='tw:text-[var(--bs-secondary-color)] tw:text-nowrap'>Country:</td>
                      <td className='tw:font-semibold tw:w-full'>{data.countryCode}</td>
                    </tr>
                    <tr>
                      <td className='tw:text-[var(--bs-secondary-color)] tw:text-nowrap'>State:</td>
                      <td className='tw:font-semibold tw:w-full'>{data.state}</td>
                    </tr>
                    <tr>
                      <td className='tw:text-[var(--bs-secondary-color)] tw:text-nowrap'>City:</td>
                      <td className='tw:font-semibold tw:w-full'>{data.city}</td>
                    </tr>
                    <tr>
                      <td className='tw:text-[var(--bs-secondary-color)] tw:text-nowrap'>PostalCode:</td>
                      <td className='tw:font-semibold tw:w-full'>{data.postalCode}</td>
                    </tr>
                  </tbody>
                </table>
              </CardBody>
            </Card>
          </Col>
          <Col xl={12}>
            <Card>
              <CardHeader className='tw:py-4'>
                <h5 className='tw:font-semibold tw:m-0'>Charge Details</h5>
              </CardHeader>
              <CardBody>
                <table className='table table-sm table-borderless table-nowrap tw:mb-0'>
                  <tbody>
                    <tr className='tw:border-b tw:pb-2'>
                      <td className='tw:text-black tw:flex tw:flex-row tw:justify-start tw:items-start tw:font-semibold'>Order Total</td>
                      <td className={'tw:font-semibold tw:text-right tw:text-primary'}>{FormatCurrency(state.currentRegion, OrderTotalBeforeFees)}</td>
                    </tr>

                    {data.orderItems.reduce((total, item: FBAOrderItem) => total + item.Commission, 0) < 0 && (
                      <tr className='tw:border-b tw:pb-2'>
                        <td className='tw:text-[var(--bs-secondary-color)] tw:flex tw:flex-row tw:justify-start tw:items-start'>Commission</td>
                        <td className='tw:font-normal tw:text-right tw:tw:text-danger'>
                          {FormatCurrency(
                            state.currentRegion,
                            data.orderItems.reduce((total, item: FBAOrderItem) => total + item.Commission, 0)
                          )}
                        </td>
                      </tr>
                    )}
                    {data.orderItems.reduce((total, item: FBAOrderItem) => total + item.FBAPerOrderFulfillmentFee, 0) < 0 && (
                      <tr className='tw:border-b tw:pb-2'>
                        <td className='tw:text-[var(--bs-secondary-color)]'>FBAPerOrderFulfillmentFee</td>
                        <td className='tw:font-normal tw:text-right tw:tw:text-danger'>
                          {FormatCurrency(
                            state.currentRegion,
                            data.orderItems.reduce((total, item: FBAOrderItem) => total + item.FBAPerOrderFulfillmentFee, 0)
                          )}
                        </td>
                      </tr>
                    )}
                    {data.orderItems.reduce((total, item: FBAOrderItem) => total + item.FBAPerUnitFulfillmentFee, 0) < 0 && (
                      <tr className='tw:border-b tw:pb-2'>
                        <td className='tw:text-[var(--bs-secondary-color)]'>FBAPerUnitFulfillmentFee</td>
                        <td className='tw:font-normal tw:text-right tw:tw:text-danger'>
                          {FormatCurrency(
                            state.currentRegion,
                            data.orderItems.reduce((total, item: FBAOrderItem) => total + item.FBAPerUnitFulfillmentFee, 0)
                          )}
                        </td>
                      </tr>
                    )}
                    {data.orderItems.reduce((total, item: FBAOrderItem) => total + item.FBAWeightBasedFee, 0) < 0 && (
                      <tr className='tw:border-b tw:pb-2'>
                        <td className='tw:text-[var(--bs-secondary-color)]'>FBAWeightBasedFee</td>
                        <td className='tw:font-normal tw:text-right tw:tw:text-danger'>
                          {FormatCurrency(
                            state.currentRegion,
                            data.orderItems.reduce((total, item: FBAOrderItem) => total + item.FBAWeightBasedFee, 0)
                          )}
                        </td>
                      </tr>
                    )}
                    {data.orderItems.reduce((total, item: FBAOrderItem) => total + item.FixedClosingFee, 0) < 0 && (
                      <tr className='tw:border-b tw:pb-2'>
                        <td className='tw:text-[var(--bs-secondary-color)]'>FixedClosingFee</td>
                        <td className='tw:font-normal tw:text-right tw:tw:text-danger'>
                          {FormatCurrency(
                            state.currentRegion,
                            data.orderItems.reduce((total, item: FBAOrderItem) => total + item.FixedClosingFee, 0)
                          )}
                        </td>
                      </tr>
                    )}
                    {data.orderItems.reduce((total, item: FBAOrderItem) => total + item.GiftwrapChargeback, 0) < 0 && (
                      <tr className='tw:border-b tw:pb-2'>
                        <td className='tw:text-[var(--bs-secondary-color)]'>GiftwrapChargeback</td>
                        <td className='tw:font-normal tw:text-right tw:tw:text-danger'>
                          {FormatCurrency(
                            state.currentRegion,
                            data.orderItems.reduce((total, item: FBAOrderItem) => total + item.GiftwrapChargeback, 0)
                          )}
                        </td>
                      </tr>
                    )}
                    {data.orderItems.reduce((total, item: FBAOrderItem) => total + item.SalesTaxCollectionFee, 0) < 0 && (
                      <tr className='tw:border-b tw:pb-2'>
                        <td className='tw:text-[var(--bs-secondary-color)]'>SalesTaxCollectionFee</td>
                        <td className='tw:font-normal tw:text-right tw:tw:text-danger'>
                          {FormatCurrency(
                            state.currentRegion,
                            data.orderItems.reduce((total, item: FBAOrderItem) => total + item.SalesTaxCollectionFee, 0)
                          )}
                        </td>
                      </tr>
                    )}
                    {data.orderItems.reduce((total, item: FBAOrderItem) => total + item.VariableClosingFee, 0) < 0 && (
                      <tr className='tw:border-b tw:pb-2'>
                        <td className='tw:text-[var(--bs-secondary-color)]'>VariableClosingFee</td>
                        <td className='tw:font-normal tw:text-right tw:tw:text-danger'>
                          {FormatCurrency(
                            state.currentRegion,
                            data.orderItems.reduce((total, item: FBAOrderItem) => total + item.VariableClosingFee, 0)
                          )}
                        </td>
                      </tr>
                    )}
                    <tr>
                      <td className='tw:font-bold tw:text-[16.25px] tw:border-t tw:border-black'>Total Seller Balance</td>
                      <td className='tw:font-semibold tw:text-[16.25px] tw:text-right tw:border-t tw:border-black tw:text-primary'>{FormatCurrency(state.currentRegion, OrderTotalAfterFees)}</td>
                    </tr>
                    {OrderTotalBeforeFeesWithRefund !== 0 && (
                      <tr className='tw:border-b tw:pb-2'>
                        <td className='tw:text-black tw:flex tw:flex-row tw:justify-start tw:items-start tw:font-normal'>Refund</td>
                        <td className='tw:font-semibold tw:text-right tw:tw:text-danger'>{FormatCurrency(state.currentRegion, OrderTotalBeforeFeesWithRefund)}</td>
                      </tr>
                    )}
                    {OrderTotalBeforeFeesWithRefund !== 0 && (
                      <tr className='tw:pb-2 tw:text-[16.25px]'>
                        <td className='tw:font-bold tw:text-[16.25px]'>Total</td>
                        <td className={'tw:font-semibold tw:text-right ' + (OrderTotalAfterFees + OrderTotalBeforeFeesWithRefund > 0 ? 'tw:text-primary' : 'tw:tw:text-danger')}>
                          {FormatCurrency(state.currentRegion, OrderTotalAfterFees + OrderTotalBeforeFeesWithRefund)}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </CardBody>
            </Card>
          </Col>
        </Col>
        <Col xl={9}>
          <Card>
            <CardHeader className='tw:py-4'>
              <h5 className='tw:font-semibold tw:m-0'>Products</h5>
            </CardHeader>
            <CardBody>
              <div className='table-responsive'>
                <table className='table table-sm align-middle table-borderless tw:mb-0'>
                  <thead className='table-light'>
                    <tr>
                      <th scope='col'>SKU</th>
                      <th scope='col'>ASIN</th>
                      <th scope='col'>ShelfCloud SKU</th>
                      <th className='tw:tw:text-center' scope='col'>
                        Qty
                      </th>
                      <th className='tw:tw:text-center' scope='col'>
                        Item Price
                      </th>
                      <th className='tw:tw:text-center' scope='col'>
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.orderItems.map((product: FBAOrderItem, key) => (
                      <tr key={key} className='tw:border-b tw:py-2'>
                        <td className='tw:w-1/4 tw:text-[13px] tw:font-semibold'>{product.sku}</td>
                        <td className='tw:text-[13px] tw:text-[var(--bs-secondary-color)]'>{product.asin}</td>
                        <td className='tw:text-[13px] tw:text-[var(--bs-secondary-color)]'>{product.shelfcloud_sku ? product.shelfcloud_sku : <span className='tw:text-[var(--bs-secondary-color)]'>Not Mapped</span>}</td>
                        <td className='tw:tw:text-center'>{product.quantity}</td>
                        <td className='tw:tw:text-center'>
                          {product.quantity === 0 ? FormatCurrency(state.currentRegion, 0) : FormatCurrency(state.currentRegion, product.itemPrice / product.quantity)}
                        </td>
                        <td className='tw:tw:text-center'>{FormatCurrency(state.currentRegion, product.itemPrice)}</td>
                      </tr>
                    ))}
                    <tr>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td className='tw:text-right tw:text-[13px] tw:font-semibold tw:text-nowrap'>Items</td>
                      <td className='tw:tw:text-center tw:font-normal tw:text-[13px] tw:text-black'>
                        {FormatCurrency(
                          state.currentRegion,
                          data?.orderItems.reduce((total, item: FBAOrderItem) => total + item.itemPrice, 0)
                        )}
                      </td>
                    </tr>
                    <tr>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td className='tw:text-right tw:text-[13px] tw:font-semibold tw:text-nowrap'>Items Tax</td>
                      <td className='tw:tw:text-center tw:font-normal tw:text-[13px] tw:text-black'>
                        {FormatCurrency(
                          state.currentRegion,
                          data?.orderItems.reduce((total, item: FBAOrderItem) => total + item.itemTax, 0)
                        )}
                      </td>
                    </tr>
                    <tr>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td className='tw:text-right tw:text-[13px] tw:font-semibold tw:text-nowrap'>Shipping</td>
                      <td className='tw:tw:text-center tw:font-normal tw:text-[13px] tw:text-black'>
                        {FormatCurrency(
                          state.currentRegion,
                          data?.orderItems.reduce((total, item: FBAOrderItem) => total + item.shippingPrice, 0)
                        )}
                      </td>
                    </tr>
                    <tr>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td className='tw:text-right tw:text-[13px] tw:font-semibold tw:text-nowrap tw:border-b'>Shipping Tax</td>
                      <td className='tw:tw:text-center tw:font-normal tw:text-[13px] tw:text-black tw:border-b'>
                        {FormatCurrency(
                          state.currentRegion,
                          data?.orderItems.reduce((total, item: FBAOrderItem) => total + item.shippingTax, 0)
                        )}
                      </td>
                    </tr>
                    <tr>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td className='tw:text-right tw:text-[11.2px] tw:font-normal tw:text-nowrap'>Item Promotion</td>
                      <td className='tw:tw:text-center tw:font-normal tw:text-[11.2px] tw:text-[var(--bs-secondary-color)]'>
                        {FormatCurrency(
                          state.currentRegion,
                          data?.orderItems.reduce((total, item: FBAOrderItem) => total + item.itemPromotionDiscount * -1, 0)
                        )}
                      </td>
                    </tr>
                    <tr>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td className='tw:text-right tw:text-[11.2px] tw:font-normal tw:text-nowrap tw:border-b'>Shipping Promotion</td>
                      <td className='tw:tw:text-center tw:font-normal tw:text-[11.2px] tw:text-[var(--bs-secondary-color)] tw:border-b'>
                        {FormatCurrency(
                          state.currentRegion,
                          data?.orderItems.reduce((total, item: FBAOrderItem) => total + item.shippingPromotionDiscount * -1, 0)
                        )}
                      </td>
                    </tr>
                    <tr>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td className='tw:text-right tw:text-[11.2px] tw:font-normal tw:text-nowrap'>Shipping Rebate</td>
                      <td className='tw:tw:text-center tw:font-normal tw:text-[11.2px] tw:text-[var(--bs-secondary-color)]'>
                        {FormatCurrency(
                          state.currentRegion,
                          data?.orderItems.reduce((total, item: FBAOrderItem) => total + item.ShippingChargeback, 0)
                        )}
                      </td>
                    </tr>
                    <tr>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td className='tw:text-right tw:text-[11.2px] tw:font-normal tw:text-nowrap'>Item Tax WithHeld</td>
                      <td className='tw:tw:text-center tw:font-normal tw:text-[11.2px] tw:text-[var(--bs-secondary-color)]'>
                        {FormatCurrency(
                          state.currentRegion,
                          data?.orderItems.reduce((total, item: FBAOrderItem) => total + item.facilitatorTax_item, 0)
                        )}
                      </td>
                    </tr>
                    <tr>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td className='tw:text-right tw:text-[11.2px] tw:font-normal tw:text-nowrap tw:border-b tw:border-black'>Shipping Tax WithHeld</td>
                      <td className='tw:tw:text-center tw:font-normal tw:text-[11.2px] tw:text-[var(--bs-secondary-color)] tw:border-b tw:border-black'>
                        {FormatCurrency(
                          state.currentRegion,
                          data?.orderItems.reduce((total, item: FBAOrderItem) => total + item.facilitatorTax_shipping, 0)
                        )}
                      </td>
                    </tr>
                    <tr>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td className='tw:text-right tw:text-[16.25px] tw:font-bold tw:text-nowrap'>Total</td>
                      <td className='tw:tw:text-center tw:font-semibold tw:text-[16.25px] tw:text-primary'>{FormatCurrency(state.currentRegion, OrderTotalBeforeFees)}</td>
                    </tr>
                    {data?.orderItems.reduce((total, item: FBAOrderItem) => total + item.refund_item, 0) < 0 && (
                      <tr>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td className='tw:text-right tw:text-[11.2px] tw:font-normal tw:text-nowrap tw:border-t tw:border-black'>Refund Item</td>
                        <td className='tw:tw:text-center tw:font-normal tw:text-[11.2px] tw:tw:text-danger tw:border-t tw:border-black'>
                          {FormatCurrency(
                            state.currentRegion,
                            data?.orderItems.reduce((total, item: FBAOrderItem) => total + item.refund_item, 0)
                          )}
                        </td>
                      </tr>
                    )}
                    {data?.orderItems.reduce((total, item: FBAOrderItem) => total + item.refund_itemTax, 0) < 0 && (
                      <tr>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td className='tw:text-right tw:text-[11.2px] tw:font-normal tw:text-nowrap'>Refund Item Tax</td>
                        <td className='tw:tw:text-center tw:font-normal tw:text-[11.2px] tw:tw:text-danger'>
                          {FormatCurrency(
                            state.currentRegion,
                            data?.orderItems.reduce((total, item: FBAOrderItem) => total + item.refund_itemTax, 0)
                          )}
                        </td>
                      </tr>
                    )}
                    {data?.orderItems.reduce((total, item: FBAOrderItem) => total + item.refund_commission, 0) > 0 && (
                      <tr>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td className='tw:text-right tw:text-[11.2px] tw:font-normal tw:text-nowrap'>Refund Commision</td>
                        <td className='tw:tw:text-center tw:font-normal tw:text-[11.2px]'>
                          {FormatCurrency(
                            state.currentRegion,
                            data?.orderItems.reduce((total, item: FBAOrderItem) => total + item.refund_commission, 0)
                          )}
                        </td>
                      </tr>
                    )}
                    {data?.orderItems.reduce((total, item: FBAOrderItem) => total + item.refund_adminCommission, 0) < 0 && (
                      <tr>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td className='tw:text-right tw:text-[11.2px] tw:font-normal tw:text-nowrap'>Refund Admin Fee</td>
                        <td className='tw:tw:text-center tw:font-normal tw:text-[11.2px] tw:tw:text-danger'>
                          {FormatCurrency(
                            state.currentRegion,
                            data?.orderItems.reduce((total, item: FBAOrderItem) => total + item.refund_adminCommission, 0)
                          )}
                        </td>
                      </tr>
                    )}
                    {data?.orderItems.reduce((total, item: FBAOrderItem) => total + item.refund_facilitatorTax_item, 0) < 0 && (
                      <tr>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td className='tw:text-right tw:text-[11.2px] tw:font-normal tw:text-nowrap'>Refund WithHeld Tax</td>
                        <td className='tw:tw:text-center tw:font-normal tw:text-[11.2px] tw:tw:text-danger'>
                          {FormatCurrency(
                            state.currentRegion,
                            data?.orderItems.reduce((total, item: FBAOrderItem) => total + item.refund_facilitatorTax_item, 0)
                          )}
                        </td>
                      </tr>
                    )}
                    {OrderTotalBeforeFeesWithRefund !== 0 && OrderTotalBeforeFeesWithRefund !== OrderTotalBeforeFees && (
                      <tr>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td className='tw:text-right tw:text-[16.25px] tw:font-bold tw:text-nowrap'>Total After Refund</td>
                        <td className='tw:tw:text-center tw:font-semibold tw:text-[16.25px] tw:tw:text-danger'>{FormatCurrency(state.currentRegion, OrderTotalBeforeFeesWithRefund)}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default FbaOrdersExpandedDetail
