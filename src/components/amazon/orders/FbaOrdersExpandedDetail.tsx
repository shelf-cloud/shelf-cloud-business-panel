import AppContext from '@context/AppContext'
import { FormatCurrency } from '@lib/FormatNumbers'
import { FBAOrder, FBAOrderItem } from '@typesTs/amazon/orders'
import React, { useContext } from 'react'
import { ExpanderComponentProps } from 'react-data-table-component'
import { Card, CardBody, CardHeader, Col, Row } from 'reactstrap'

type Props = {
  data: FBAOrder
}

const FbaOrdersExpandedDetail: React.FC<ExpanderComponentProps<FBAOrder>> = ({ data }: Props) => {
  const { state }: any = useContext(AppContext)
  return (
    <div style={{ backgroundColor: '#F0F4F7', padding: '10px' }}>
      <Row>
        <Col xl={3}>
          <Col xl={12}>
            <Card>
              <CardHeader className='py-3'>
                <h5 className='fw-semibold m-0'>Shipping</h5>
              </CardHeader>
              <CardBody>
                <table className='table table-sm table-borderless'>
                  <tbody>
                    <tr>
                      <td className='text-muted text-nowrap'>Country:</td>
                      <td className='fw-semibold w-100'>{data.countryCode}</td>
                    </tr>
                    <tr>
                      <td className='text-muted text-nowrap'>State:</td>
                      <td className='fw-semibold w-100'>{data.state}</td>
                    </tr>
                    <tr>
                      <td className='text-muted text-nowrap'>City:</td>
                      <td className='fw-semibold w-100'>{data.city}</td>
                    </tr>
                    <tr>
                      <td className='text-muted text-nowrap'>PostalCode:</td>
                      <td className='fw-semibold w-100'>{data.postalCode}</td>
                    </tr>
                  </tbody>
                </table>
              </CardBody>
            </Card>
          </Col>
          <Col xl={12}>
            <Card>
              <CardHeader className='py-3'>
                <h5 className='fw-semibold m-0'>Charge Details</h5>
              </CardHeader>
              <CardBody>
                <table className='table table-sm table-borderless table-nowrap mb-0'>
                  <tbody>
                    <tr className='border-bottom pb-2'>
                      <td className='text-black d-flex flex-row justify-content-start align-items-start fw-semibold'>Order Total</td>
                      <td className='fw-semibold text-end text-primary'>
                        {FormatCurrency(
                          state.currentRegion,
                          data?.orderItems.reduce(
                            (total, item: FBAOrderItem) =>
                              total +
                              (item.itemPrice +
                                item.itemTax +
                                item.shippingPrice +
                                item.shippingTax +
                                item.giftWrapPrice +
                                item.giftWrapTax +
                                item.itemPromotionDiscount +
                                item.shippingPromotionDiscount -
                                item.itemTax -
                                item.shippingTax +
                                item.ShippingChargeback),
                            0
                          )
                        )}
                      </td>
                    </tr>
                    {data.orderItems.reduce((total, item: FBAOrderItem) => total + item.Commission, 0) < 0 && (
                      <tr className='border-bottom pb-2'>
                        <td className='text-muted d-flex flex-row justify-content-start align-items-start'>Commission</td>
                        <td className='fw-normal text-end text-danger'>
                          {FormatCurrency(
                            state.currentRegion,
                            data.orderItems.reduce((total, item: FBAOrderItem) => total + item.Commission, 0)
                          )}
                        </td>
                      </tr>
                    )}
                    {data.orderItems.reduce((total, item: FBAOrderItem) => total + item.FBAPerOrderFulfillmentFee, 0) < 0 && (
                      <tr className='border-bottom pb-2'>
                        <td className='text-muted'>FBAPerOrderFulfillmentFee</td>
                        <td className='fw-normal text-end text-danger'>
                          {FormatCurrency(
                            state.currentRegion,
                            data.orderItems.reduce((total, item: FBAOrderItem) => total + item.FBAPerOrderFulfillmentFee, 0)
                          )}
                        </td>
                      </tr>
                    )}
                    {data.orderItems.reduce((total, item: FBAOrderItem) => total + item.FBAPerUnitFulfillmentFee, 0) < 0 && (
                      <tr className='border-bottom pb-2'>
                        <td className='text-muted'>FBAPerUnitFulfillmentFee</td>
                        <td className='fw-normal text-end text-danger'>
                          {FormatCurrency(
                            state.currentRegion,
                            data.orderItems.reduce((total, item: FBAOrderItem) => total + item.FBAPerUnitFulfillmentFee, 0)
                          )}
                        </td>
                      </tr>
                    )}
                    {data.orderItems.reduce((total, item: FBAOrderItem) => total + item.FBAWeightBasedFee, 0) < 0 && (
                      <tr className='border-bottom pb-2'>
                        <td className='text-muted'>FBAWeightBasedFee</td>
                        <td className='fw-normal text-end text-danger'>
                          {FormatCurrency(
                            state.currentRegion,
                            data.orderItems.reduce((total, item: FBAOrderItem) => total + item.FBAWeightBasedFee, 0)
                          )}
                        </td>
                      </tr>
                    )}
                    {data.orderItems.reduce((total, item: FBAOrderItem) => total + item.FixedClosingFee, 0) < 0 && (
                      <tr className='border-bottom pb-2'>
                        <td className='text-muted'>FixedClosingFee</td>
                        <td className='fw-normal text-end text-danger'>
                          {FormatCurrency(
                            state.currentRegion,
                            data.orderItems.reduce((total, item: FBAOrderItem) => total + item.FixedClosingFee, 0)
                          )}
                        </td>
                      </tr>
                    )}
                    {data.orderItems.reduce((total, item: FBAOrderItem) => total + item.GiftwrapChargeback, 0) < 0 && (
                      <tr className='border-bottom pb-2'>
                        <td className='text-muted'>GiftwrapChargeback</td>
                        <td className='fw-normal text-end text-danger'>
                          {FormatCurrency(
                            state.currentRegion,
                            data.orderItems.reduce((total, item: FBAOrderItem) => total + item.GiftwrapChargeback, 0)
                          )}
                        </td>
                      </tr>
                    )}
                    {data.orderItems.reduce((total, item: FBAOrderItem) => total + item.SalesTaxCollectionFee, 0) < 0 && (
                      <tr className='border-bottom pb-2'>
                        <td className='text-muted'>SalesTaxCollectionFee</td>
                        <td className='fw-normal text-end text-danger'>
                          {FormatCurrency(
                            state.currentRegion,
                            data.orderItems.reduce((total, item: FBAOrderItem) => total + item.SalesTaxCollectionFee, 0)
                          )}
                        </td>
                      </tr>
                    )}
                    {data.orderItems.reduce((total, item: FBAOrderItem) => total + item.VariableClosingFee, 0) < 0 && (
                      <tr className='border-bottom pb-2'>
                        <td className='text-muted'>VariableClosingFee</td>
                        <td className='fw-normal text-end text-danger'>
                          {FormatCurrency(
                            state.currentRegion,
                            data.orderItems.reduce((total, item: FBAOrderItem) => total + item.VariableClosingFee, 0)
                          )}
                        </td>
                      </tr>
                    )}
                    <tr>
                      <td className='fw-bold'>TOTAL</td>
                      <td className='text-primary fw-semibold text-end'>
                        {FormatCurrency(
                          state.currentRegion,
                          data?.orderItems.reduce(
                            (total, item: FBAOrderItem) =>
                              total +
                              (item.itemPrice +
                                item.itemTax +
                                item.shippingPrice +
                                item.shippingTax +
                                item.giftWrapPrice +
                                item.giftWrapTax +
                                item.itemPromotionDiscount +
                                item.shippingPromotionDiscount -
                                item.itemTax -
                                item.shippingTax +
                                item.ShippingChargeback +
                                item.Commission +
                                item.FBAPerOrderFulfillmentFee +
                                item.FBAPerUnitFulfillmentFee +
                                item.FBAWeightBasedFee +
                                item.FixedClosingFee +
                                item.GiftwrapChargeback),
                            0
                          )
                        )}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </CardBody>
            </Card>
          </Col>
        </Col>
        <Col xl={9}>
          <Card>
            <CardHeader className='py-3'>
              <h5 className='fw-semibold m-0'>Products</h5>
            </CardHeader>
            <CardBody>
              <div className='table-responsive'>
                <table className='table table-sm align-middle table-borderless mb-0'>
                  <thead className='table-light'>
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
                      <tr key={key} className='border-bottom py-2'>
                        <td className='w-25 fs-6 fw-semibold'>{product.sku}</td>
                        <td className='fs-6 text-muted'>{product.asin}</td>
                        <td className='fs-6 text-muted'>{product.shelfcloud_sku ? product.shelfcloud_sku : <span className='text-muted'>Not Mapped</span>}</td>
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
                      <td className='text-end fs-6 fw-semibold text-nowrap'>Items</td>
                      <td className='text-center fw-normal fs-6 text-black'>
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
                      <td className='text-end fs-6 fw-semibold text-nowrap'>Items Tax</td>
                      <td className='text-center fw-normal fs-6 text-black'>
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
                      <td className='text-end fs-6 fw-semibold text-nowrap'>Shipping</td>
                      <td className='text-center fw-normal fs-6 text-black'>
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
                      <td className='text-end fs-6 fw-semibold text-nowrap'>Shipping Tax</td>
                      <td className='text-center fw-normal fs-6 text-black'>
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
                      <td className='text-end fs-7 fw-normal text-nowrap'>Item Promotion</td>
                      <td className='text-center fw-normal fs-7 text-muted'>
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
                      <td className='text-end fs-7 fw-normal text-nowrap'>Shipping Promotion</td>
                      <td className='text-center fw-normal fs-7 text-muted'>
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
                      <td className='text-end fs-7 fw-normal text-nowrap'>Shipping Rebate</td>
                      <td className='text-center fw-normal fs-7 text-muted'>
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
                      <td className='text-end fs-7 fw-normal text-nowrap'>Item Tax WithHeld</td>
                      <td className='text-center fw-normal fs-7 text-muted'>
                        {FormatCurrency(
                          state.currentRegion,
                          data?.orderItems.reduce((total, item: FBAOrderItem) => total + item.itemTax * -1, 0)
                        )}
                      </td>
                    </tr>
                    <tr>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td className='text-end fs-7 fw-normal text-nowrap'>Shipping Tax WithHeld</td>
                      <td className='text-center fw-normal fs-7 text-muted'>
                        {FormatCurrency(
                          state.currentRegion,
                          data?.orderItems.reduce((total, item: FBAOrderItem) => total + item.shippingTax * -1, 0)
                        )}
                      </td>
                    </tr>
                    <tr>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td className='text-end fs-5 fw-bold text-nowrap'>Total</td>
                      <td className='text-center fw-semibold fs-5 text-primary'>
                        {FormatCurrency(
                          state.currentRegion,
                          data?.orderItems.reduce(
                            (total, item: FBAOrderItem) =>
                              total +
                              (item.itemPrice +
                                item.itemTax +
                                item.shippingPrice +
                                item.shippingTax +
                                item.giftWrapPrice +
                                item.giftWrapTax +
                                item.itemPromotionDiscount +
                                item.shippingPromotionDiscount -
                                item.itemTax -
                                item.shippingTax +
                                item.ShippingChargeback),
                            0
                          )
                        )}
                      </td>
                    </tr>
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
