import React, { useContext } from 'react'

import AppContext from '@context/AppContext'
import { FormatCurrency } from '@lib/FormatNumbers'
import { FBAOrder, FBAOrderItem } from '@typesTs/amazon/orders'
import { ExpanderComponentProps } from 'react-data-table-component'
import { Card, CardContent, CardHeader } from '@shadcn/ui/card'

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
      <div className='flex flex-wrap -mx-3'>
        <div className='px-3 xl:w-3/12'>
          <div className='px-3 xl:w-full'>
            <Card>
              <CardHeader className='py-4'>
                <h5 className='font-semibold m-0'>Shipping</h5>
              </CardHeader>
              <CardContent>
                <div className='overflow-x-auto'>
                  <table className='w-full align-middle mb-0 [&_th]:px-2 [&_th]:py-1 [&_td]:px-2 [&_td]:py-1'>
                    <tbody>
                      <tr>
                        <td className='text-[var(--bs-secondary-color)] text-nowrap'>Country:</td>
                        <td className='font-semibold w-full'>{data.countryCode}</td>
                      </tr>
                      <tr>
                        <td className='text-[var(--bs-secondary-color)] text-nowrap'>State:</td>
                        <td className='font-semibold w-full'>{data.state}</td>
                      </tr>
                      <tr>
                        <td className='text-[var(--bs-secondary-color)] text-nowrap'>City:</td>
                        <td className='font-semibold w-full'>{data.city}</td>
                      </tr>
                      <tr>
                        <td className='text-[var(--bs-secondary-color)] text-nowrap'>PostalCode:</td>
                        <td className='font-semibold w-full'>{data.postalCode}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
          <div className='px-3 xl:w-full'>
            <Card>
              <CardHeader className='py-4'>
                <h5 className='font-semibold m-0'>Charge Details</h5>
              </CardHeader>
              <CardContent>
                <table className='w-full whitespace-nowrap mb-0 [&_th]:px-2 [&_th]:py-1 [&_td]:px-2 [&_td]:py-1'>
                  <tbody>
                    <tr className='border-b pb-2'>
                      <td className='text-black flex flex-row justify-start items-start font-semibold'>Order Total</td>
                      <td className={'font-semibold text-right text-primary'}>{FormatCurrency(state.currentRegion, OrderTotalBeforeFees)}</td>
                    </tr>

                    {data.orderItems.reduce((total, item: FBAOrderItem) => total + item.Commission, 0) < 0 && (
                      <tr className='border-b pb-2'>
                        <td className='text-[var(--bs-secondary-color)] flex flex-row justify-start items-start'>Commission</td>
                        <td className='font-normal text-right text-danger'>
                          {FormatCurrency(
                            state.currentRegion,
                            data.orderItems.reduce((total, item: FBAOrderItem) => total + item.Commission, 0)
                          )}
                        </td>
                      </tr>
                    )}
                    {data.orderItems.reduce((total, item: FBAOrderItem) => total + item.FBAPerOrderFulfillmentFee, 0) < 0 && (
                      <tr className='border-b pb-2'>
                        <td className='text-[var(--bs-secondary-color)]'>FBAPerOrderFulfillmentFee</td>
                        <td className='font-normal text-right text-danger'>
                          {FormatCurrency(
                            state.currentRegion,
                            data.orderItems.reduce((total, item: FBAOrderItem) => total + item.FBAPerOrderFulfillmentFee, 0)
                          )}
                        </td>
                      </tr>
                    )}
                    {data.orderItems.reduce((total, item: FBAOrderItem) => total + item.FBAPerUnitFulfillmentFee, 0) < 0 && (
                      <tr className='border-b pb-2'>
                        <td className='text-[var(--bs-secondary-color)]'>FBAPerUnitFulfillmentFee</td>
                        <td className='font-normal text-right text-danger'>
                          {FormatCurrency(
                            state.currentRegion,
                            data.orderItems.reduce((total, item: FBAOrderItem) => total + item.FBAPerUnitFulfillmentFee, 0)
                          )}
                        </td>
                      </tr>
                    )}
                    {data.orderItems.reduce((total, item: FBAOrderItem) => total + item.FBAWeightBasedFee, 0) < 0 && (
                      <tr className='border-b pb-2'>
                        <td className='text-[var(--bs-secondary-color)]'>FBAWeightBasedFee</td>
                        <td className='font-normal text-right text-danger'>
                          {FormatCurrency(
                            state.currentRegion,
                            data.orderItems.reduce((total, item: FBAOrderItem) => total + item.FBAWeightBasedFee, 0)
                          )}
                        </td>
                      </tr>
                    )}
                    {data.orderItems.reduce((total, item: FBAOrderItem) => total + item.FixedClosingFee, 0) < 0 && (
                      <tr className='border-b pb-2'>
                        <td className='text-[var(--bs-secondary-color)]'>FixedClosingFee</td>
                        <td className='font-normal text-right text-danger'>
                          {FormatCurrency(
                            state.currentRegion,
                            data.orderItems.reduce((total, item: FBAOrderItem) => total + item.FixedClosingFee, 0)
                          )}
                        </td>
                      </tr>
                    )}
                    {data.orderItems.reduce((total, item: FBAOrderItem) => total + item.GiftwrapChargeback, 0) < 0 && (
                      <tr className='border-b pb-2'>
                        <td className='text-[var(--bs-secondary-color)]'>GiftwrapChargeback</td>
                        <td className='font-normal text-right text-danger'>
                          {FormatCurrency(
                            state.currentRegion,
                            data.orderItems.reduce((total, item: FBAOrderItem) => total + item.GiftwrapChargeback, 0)
                          )}
                        </td>
                      </tr>
                    )}
                    {data.orderItems.reduce((total, item: FBAOrderItem) => total + item.SalesTaxCollectionFee, 0) < 0 && (
                      <tr className='border-b pb-2'>
                        <td className='text-[var(--bs-secondary-color)]'>SalesTaxCollectionFee</td>
                        <td className='font-normal text-right text-danger'>
                          {FormatCurrency(
                            state.currentRegion,
                            data.orderItems.reduce((total, item: FBAOrderItem) => total + item.SalesTaxCollectionFee, 0)
                          )}
                        </td>
                      </tr>
                    )}
                    {data.orderItems.reduce((total, item: FBAOrderItem) => total + item.VariableClosingFee, 0) < 0 && (
                      <tr className='border-b pb-2'>
                        <td className='text-[var(--bs-secondary-color)]'>VariableClosingFee</td>
                        <td className='font-normal text-right text-danger'>
                          {FormatCurrency(
                            state.currentRegion,
                            data.orderItems.reduce((total, item: FBAOrderItem) => total + item.VariableClosingFee, 0)
                          )}
                        </td>
                      </tr>
                    )}
                    <tr>
                      <td className='font-bold text-[16.25px] border-t border-black'>Total Seller Balance</td>
                      <td className='font-semibold text-[16.25px] text-right border-t border-black text-primary'>{FormatCurrency(state.currentRegion, OrderTotalAfterFees)}</td>
                    </tr>
                    {OrderTotalBeforeFeesWithRefund !== 0 && (
                      <tr className='border-b pb-2'>
                        <td className='text-black flex flex-row justify-start items-start font-normal'>Refund</td>
                        <td className='font-semibold text-right text-danger'>{FormatCurrency(state.currentRegion, OrderTotalBeforeFeesWithRefund)}</td>
                      </tr>
                    )}
                    {OrderTotalBeforeFeesWithRefund !== 0 && (
                      <tr className='pb-2 text-[16.25px]'>
                        <td className='font-bold text-[16.25px]'>Total</td>
                        <td className={'font-semibold text-right ' + (OrderTotalAfterFees + OrderTotalBeforeFeesWithRefund > 0 ? 'text-primary' : 'text-danger')}>
                          {FormatCurrency(state.currentRegion, OrderTotalAfterFees + OrderTotalBeforeFeesWithRefund)}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </div>
        </div>
        <div className='px-3 xl:w-9/12'>
          <Card>
            <CardHeader className='py-4'>
              <h5 className='font-semibold m-0'>Products</h5>
            </CardHeader>
            <CardContent>
              <div className='overflow-x-auto'>
                <table className='w-full align-middle mb-0 [&_th]:px-2 [&_th]:py-1 [&_td]:px-2 [&_td]:py-1'>
                  <thead className='bg-[color:var(--vz-light)]'>
                    <tr>
                      <th scope='col'>SKU</th>
                      <th scope='col'>ASIN</th>
                      <th scope='col'>ShelfCloud SKU</th>
                      <th className='text-center' scope='col'>
                        Qty
                      </th>
                      <th className='text-center' scope='col'>
                        Item Price
                      </th>
                      <th className='text-center' scope='col'>
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.orderItems.map((product: FBAOrderItem, key) => (
                      <tr key={key} className='border-b py-2'>
                        <td className='w-1/4 text-[13px] font-semibold'>{product.sku}</td>
                        <td className='text-[13px] text-[var(--bs-secondary-color)]'>{product.asin}</td>
                        <td className='text-[13px] text-[var(--bs-secondary-color)]'>{product.shelfcloud_sku ? product.shelfcloud_sku : <span className='text-[var(--bs-secondary-color)]'>Not Mapped</span>}</td>
                        <td className='text-center'>{product.quantity}</td>
                        <td className='text-center'>
                          {product.quantity === 0 ? FormatCurrency(state.currentRegion, 0) : FormatCurrency(state.currentRegion, product.itemPrice / product.quantity)}
                        </td>
                        <td className='text-center'>{FormatCurrency(state.currentRegion, product.itemPrice)}</td>
                      </tr>
                    ))}
                    <tr>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td className='text-right text-[13px] font-semibold text-nowrap'>Items</td>
                      <td className='text-center font-normal text-[13px] text-black'>
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
                      <td className='text-right text-[13px] font-semibold text-nowrap'>Items Tax</td>
                      <td className='text-center font-normal text-[13px] text-black'>
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
                      <td className='text-right text-[13px] font-semibold text-nowrap'>Shipping</td>
                      <td className='text-center font-normal text-[13px] text-black'>
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
                      <td className='text-right text-[13px] font-semibold text-nowrap border-b'>Shipping Tax</td>
                      <td className='text-center font-normal text-[13px] text-black border-b'>
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
                      <td className='text-right text-[11.2px] font-normal text-nowrap'>Item Promotion</td>
                      <td className='text-center font-normal text-[11.2px] text-[var(--bs-secondary-color)]'>
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
                      <td className='text-right text-[11.2px] font-normal text-nowrap border-b'>Shipping Promotion</td>
                      <td className='text-center font-normal text-[11.2px] text-[var(--bs-secondary-color)] border-b'>
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
                      <td className='text-right text-[11.2px] font-normal text-nowrap'>Shipping Rebate</td>
                      <td className='text-center font-normal text-[11.2px] text-[var(--bs-secondary-color)]'>
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
                      <td className='text-right text-[11.2px] font-normal text-nowrap'>Item Tax WithHeld</td>
                      <td className='text-center font-normal text-[11.2px] text-[var(--bs-secondary-color)]'>
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
                      <td className='text-right text-[11.2px] font-normal text-nowrap border-b border-black'>Shipping Tax WithHeld</td>
                      <td className='text-center font-normal text-[11.2px] text-[var(--bs-secondary-color)] border-b border-black'>
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
                      <td className='text-right text-[16.25px] font-bold text-nowrap'>Total</td>
                      <td className='text-center font-semibold text-[16.25px] text-primary'>{FormatCurrency(state.currentRegion, OrderTotalBeforeFees)}</td>
                    </tr>
                    {data?.orderItems.reduce((total, item: FBAOrderItem) => total + item.refund_item, 0) < 0 && (
                      <tr>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td className='text-right text-[11.2px] font-normal text-nowrap border-t border-black'>Refund Item</td>
                        <td className='text-center font-normal text-[11.2px] text-danger border-t border-black'>
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
                        <td className='text-right text-[11.2px] font-normal text-nowrap'>Refund Item Tax</td>
                        <td className='text-center font-normal text-[11.2px] text-danger'>
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
                        <td className='text-right text-[11.2px] font-normal text-nowrap'>Refund Commision</td>
                        <td className='text-center font-normal text-[11.2px]'>
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
                        <td className='text-right text-[11.2px] font-normal text-nowrap'>Refund Admin Fee</td>
                        <td className='text-center font-normal text-[11.2px] text-danger'>
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
                        <td className='text-right text-[11.2px] font-normal text-nowrap'>Refund WithHeld Tax</td>
                        <td className='text-center font-normal text-[11.2px] text-danger'>
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
                        <td className='text-right text-[16.25px] font-bold text-nowrap'>Total After Refund</td>
                        <td className='text-center font-semibold text-[16.25px] text-danger'>{FormatCurrency(state.currentRegion, OrderTotalBeforeFeesWithRefund)}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default FbaOrdersExpandedDetail
