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
                {/* <table className='table table-sm table-borderless table-nowrap mb-0'>
                  <tbody>
                    <tr className='border-bottom pb-2'>
                      <td className='text-muted d-flex flex-row justify-content-start align-items-start'>
                        Pick Pack Charge
                        {data.chargesFees && (
                          <>
                            <i className='ri-information-fill ms-1 fs-6 text-muted' id={`tooltip${OrderId}`}></i>
                            <TooltipComponent
                              target={`tooltip${OrderId}`}
                              text={`${FormatCurrency(state.currentRegion, data.chargesFees.orderCost!)} first item + ${FormatCurrency(
                                state.currentRegion,
                                data.chargesFees.extraItemOrderCost!
                              )} addt'l.`}
                            />
                          </>
                        )}
                      </td>
                      <td className='fw-semibold text-end'>{FormatCurrency(state.currentRegion, data.pickpackCharge)}</td>
                    </tr>
                    <tr className='border-bottom pb-2'>
                      <td className='text-muted'>Shipping Charge</td>
                      <td className='fw-semibold text-end'>{FormatCurrency(state.currentRegion, data.onixShipping)}</td>
                    </tr>
                    <tr className='border-bottom pb-2'>
                      <td className='text-muted'>Extra Charge</td>
                      <td className='fw-semibold text-end'>{FormatCurrency(state.currentRegion, data.extraCharge)}</td>
                    </tr>
                    <tr>
                      <td className='fw-bold'>TOTAL</td>
                      <td className='text-primary fw-semibold text-end'>{FormatCurrency(state.currentRegion, data.totalCharge)}</td>
                    </tr>
                  </tbody>
                </table> */}
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
                          {product.quantity === 0
                            ? FormatCurrency(state.currentRegion, 0)
                            : FormatCurrency(
                                state.currentRegion,
                                (product.itemPrice +
                                  product.itemTax +
                                  product.shippingPrice +
                                  product.shippingTax +
                                  product.giftWrapPrice +
                                  product.giftWrapTax +
                                  product.itemPromotionDiscount +
                                  product.shippingPromotionDiscount) /
                                  product.quantity
                              )}
                        </td>
                        <td className='text-center'>
                          {FormatCurrency(
                            state.currentRegion,
                            product.itemPrice +
                              product.itemTax +
                              product.shippingPrice +
                              product.shippingTax +
                              product.giftWrapPrice +
                              product.giftWrapTax +
                              product.itemPromotionDiscount +
                              product.shippingPromotionDiscount
                          )}
                        </td>
                      </tr>
                    ))}
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
                                item.shippingPromotionDiscount),
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
