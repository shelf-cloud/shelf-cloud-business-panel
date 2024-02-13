import { AMAZON_MARKETPLACES_ID } from '@components/constants/shelfcloud'
import AppContext from '@context/AppContext'
import { FormatCurrency } from '@lib/FormatNumbers'
import { Marketpalce, ProductPerformance } from '@typesTs/marketplaces/productPerformance'
import React, { useContext, useState } from 'react'
import { ExpanderComponentProps } from 'react-data-table-component'
import { Card, CardBody, CardHeader, Col, Collapse, Row } from 'reactstrap'

type Props = {
  data: ProductPerformance
}

const ProductPerformanceExpandedDetails: React.FC<ExpanderComponentProps<ProductPerformance>> = ({ data }: Props) => {
  const { state }: any = useContext(AppContext)
  const [showTaxes, setShowTaxes] = useState(false)
  const [showMarketplacesFees, setShowMarketplacesFees] = useState(false)
  const [showAmazonFbaFees, setShowAmazonFbaFees] = useState(false)
  const [showCogs, setShowCogs] = useState(false)
  return (
    <div style={{ backgroundColor: '#F0F4F7', padding: '10px' }}>
      <Row>
        <Col xs={4} xl={3}>
          <Col sm={12}>
            <Card>
              <CardHeader className='py-3'>
                <h5 className='fw-semibold m-0'>Performance Details</h5>
              </CardHeader>
              <CardBody>
                <table className='table table-sm table-borderless table-nowrap mb-0'>
                  <tbody>
                    {/* GROOSS REVENUE */}
                    <tr className='border-bottom pb-2'>
                      <td className='text-black d-flex flex-row justify-content-start align-items-start fw-normal'>Base Price</td>
                      <td className={'fw-normal text-end text-black'}>{FormatCurrency(state.currentRegion, data.basePrice)}</td>
                    </tr>
                    <tr onClick={() => setShowTaxes(!showTaxes)} style={{ cursor: 'pointer' }}>
                      <td className='dropdown-toggle text-black d-flex flex-row justify-content-start align-items-start fw-normal'>Total Tax</td>
                      <td className={'fw-normal text-end text-black'}>{FormatCurrency(state.currentRegion, data.totalTax)}</td>
                    </tr>
                    <tr>
                      <td className='p-0' colSpan={2}>
                        <Collapse className='ps-3 pe-1 py-0 w-100' isOpen={showTaxes}>
                          <div className='py-1 w-100 d-flex flex-row justify-content-between align-items-center'>
                            <span className='text-muted d-flex flex-row justify-content-start align-items-start fs-7'>Tax Collected</span>
                            <span className={'fw-light text-end text-muted fs-7'}>{FormatCurrency(state.currentRegion, data.taxCollected)}</span>
                          </div>
                          <div className='py-1 w-100 d-flex flex-row justify-content-between align-items-center'>
                            <span className='text-muted d-flex flex-row justify-content-start align-items-start fs-7'>Tax Withheld</span>
                            <span className='fw-light text-end text-muted fs-7'>{FormatCurrency(state.currentRegion, data.taxWithheld)}</span>
                          </div>
                        </Collapse>
                      </td>
                    </tr>

                    <tr className='border-bottom border-top pb-2'>
                      <td className='text-black d-flex flex-row justify-content-start align-items-start fw-normal'>Shipping</td>
                      <td className={'fw-normal text-end text-black'}>{FormatCurrency(state.currentRegion, data.totalShipping)}</td>
                    </tr>
                    <tr className='pb-2'>
                      <td className='text-black d-flex flex-row justify-content-start align-items-start fw-bold fs-5'>Gross Revenue</td>
                      <td className={'fw-bold text-end text-primary fs-5'}>{FormatCurrency(state.currentRegion, data.grossRevenue)}</td>
                    </tr>

                    {/* EXPENSES */}
                    <tr className='border-bottom pb-2'>
                      <td className='text-black d-flex flex-row justify-content-start align-items-start fw-normal'>Reimbursements</td>
                      <td className={'fw-normal text-end text-black'}>{FormatCurrency(state.currentRegion, 0)}</td>
                    </tr>
                    <tr className='pb-2' onClick={() => setShowMarketplacesFees(!showMarketplacesFees)} style={{ cursor: 'pointer' }}>
                      <td className='dropdown-toggle text-black d-flex flex-row justify-content-start align-items-start fw-semibold'>Marketplaces Fees</td>
                      <td className={'fw-normal text-end text-black'}>{FormatCurrency(state.currentRegion, data.totalMarketpalcesFees)}</td>
                    </tr>
                    <tr>
                      <td className='p-0' colSpan={2}>
                        <Collapse className='ps-3 pe-1 py-0 w-100' isOpen={showMarketplacesFees}>
                          {Object.values(data.marketpalces).map(
                            (market: Marketpalce) =>
                              market.fees.totalComission + market.fees.totalFixedFee !== 0 && (
                                <div key={market.storeId}>
                                  <div
                                    key={market.name}
                                    className='border-bottom py-1 w-100 d-flex flex-row justify-content-between align-items-center'
                                    onClick={() => AMAZON_MARKETPLACES_ID.includes(market.storeId) && setShowAmazonFbaFees(!showAmazonFbaFees)}>
                                    <span
                                      className={
                                        'text-black d-flex flex-row justify-content-start align-items-start fw-normal ' +
                                        (AMAZON_MARKETPLACES_ID.includes(market.storeId) && 'dropdown-toggle')
                                      }>
                                      {market.name}
                                    </span>
                                    <span className={'fw-normal text-end text-black'}>
                                      {FormatCurrency(state.currentRegion, market.fees.totalComission + market.fees.totalFixedFee)}
                                    </span>
                                  </div>
                                  {/* AMAZON FBA FEES */}
                                  {AMAZON_MARKETPLACES_ID.includes(market.storeId) && (
                                    <Collapse className='ps-4 pe-1 py-0 w-100' isOpen={showAmazonFbaFees}>
                                      {market.fees.FBAPerOrderFulfillmentFee! !== 0 && (
                                        <div className='border-bottom py-1 w-100 d-flex flex-row justify-content-between align-items-center'>
                                          <span className='text-muted fw-normal fs-7'>FBA Per Order Fee</span>
                                          <span className={'fw-normal text-end text-muted fs-7'}>
                                            {FormatCurrency(state.currentRegion, market.fees.FBAPerOrderFulfillmentFee!)}
                                          </span>
                                        </div>
                                      )}
                                      {market.fees.FBAPerUnitFulfillmentFee! !== 0 && (
                                        <div className='border-bottom py-1 w-100 d-flex flex-row justify-content-between align-items-center'>
                                          <span className='text-muted fw-normal fs-7'>FBA Per Unit Fee</span>
                                          <span className={'fw-normal text-end text-muted fs-7'}>{FormatCurrency(state.currentRegion, market.fees.FBAPerUnitFulfillmentFee!)}</span>
                                        </div>
                                      )}
                                      {market.fees.FBAWeightBasedFee! !== 0 && (
                                        <div className='border-bottom py-1 w-100 d-flex flex-row justify-content-between align-items-center'>
                                          <span className='text-muted fw-normal fs-7'>FBA Weight Based Fee</span>
                                          <span className={'fw-normal text-end text-muted fs-7'}>{FormatCurrency(state.currentRegion, market.fees.FBAWeightBasedFee!)}</span>
                                        </div>
                                      )}
                                      {market.fees.VariableClosingFee! !== 0 && (
                                        <div className='border-bottom py-1 w-100 d-flex flex-row justify-content-between align-items-center'>
                                          <span className='text-muted fw-normal fs-7'>Variable Closing Fee</span>
                                          <span className={'fw-normal text-end text-muted fs-7'}>{FormatCurrency(state.currentRegion, market.fees.VariableClosingFee!)}</span>
                                        </div>
                                      )}
                                      {market.fees.Commission! !== 0 && (
                                        <div className='border-bottom py-1 w-100 d-flex flex-row justify-content-between align-items-center'>
                                          <span className='text-muted fw-normal fs-7'>Commission</span>
                                          <span className={'fw-normal text-end text-muted fs-7'}>{FormatCurrency(state.currentRegion, market.fees.Commission!)}</span>
                                        </div>
                                      )}
                                      {market.fees.FixedClosingFee! !== 0 && (
                                        <div className='border-bottom py-1 w-100 d-flex flex-row justify-content-between align-items-center'>
                                          <span className='text-muted fw-normal fs-7'>Fixed Closing Fee</span>
                                          <span className={'fw-normal text-end text-muted fs-7'}>{FormatCurrency(state.currentRegion, market.fees.FixedClosingFee!)}</span>
                                        </div>
                                      )}
                                      {market.fees.SalesTaxCollectionFee! !== 0 && (
                                        <div className='border-bottom py-1 w-100 d-flex flex-row justify-content-between align-items-center'>
                                          <span className='text-muted fw-normal fs-7'>Sales Tax Collection Fee</span>
                                          <span className={'fw-normal text-end text-muted fs-7'}>{FormatCurrency(state.currentRegion, market.fees.SalesTaxCollectionFee!)}</span>
                                        </div>
                                      )}
                                      {market.fees.ShippingChargeback! !== 0 && (
                                        <div className='border-bottom py-1 w-100 d-flex flex-row justify-content-between align-items-center'>
                                          <span className='text-muted fw-normal fs-7'>Shipping Holdback Fee</span>
                                          <span className={'fw-normal text-end text-muted fs-7'}>{FormatCurrency(state.currentRegion, market.fees.ShippingChargeback!)}</span>
                                        </div>
                                      )}
                                    </Collapse>
                                  )}
                                </div>
                              )
                          )}
                        </Collapse>
                      </td>
                    </tr>
                    <tr className='border-bottom pb-2'>
                      <td className='text-black d-flex flex-row justify-content-start align-items-start fw-normal'>Refunds</td>
                      <td className={'fw-light text-end text-black'}>{FormatCurrency(state.currentRegion, data.refunds)}</td>
                    </tr>
                    <tr className='border-bottom pb-2'>
                      <td className='text-black d-flex flex-row justify-content-start align-items-start fw-normal'>Promos</td>
                      <td className={'fw-light text-end text-black'}>{FormatCurrency(state.currentRegion, data.promos)}</td>
                    </tr>
                    <tr className='border-bottom pb-2'>
                      <td className='text-black d-flex flex-row justify-content-start align-items-start fw-normal'>Pick & Pack</td>
                      <td className={'fw-light text-end text-black'}>{FormatCurrency(state.currentRegion, data.shelfCloudCost)}</td>
                    </tr>
                    <tr className='border-bottom pb-2'>
                      <td className='text-black d-flex flex-row justify-content-start align-items-start fw-normal'>Shipping Cost</td>
                      <td className={'fw-light text-end text-black'}>{FormatCurrency(state.currentRegion, data.shippingCost)}</td>
                    </tr>
                    <tr onClick={() => setShowCogs(!showCogs)} style={{ cursor: 'pointer' }}>
                      <td className='dropdown-toggle text-black d-flex flex-row justify-content-start align-items-start fw-normal'>COGS</td>
                      <td className={'fw-normal text-end text-black'}>{FormatCurrency(state.currentRegion, data.productCost + data.shippingToFbaCost)}</td>
                    </tr>
                    <tr>
                      <td className='p-0' colSpan={2}>
                        <Collapse className='ps-3 pe-1 py-0 w-100' isOpen={showCogs}>
                          <div className='py-1 w-100 d-flex flex-row justify-content-between align-items-center'>
                            <span className='text-muted d-flex flex-row justify-content-start align-items-start fs-7'>Product Cost (Landed)</span>
                            <span className={'fw-light text-end text-muted fs-7'}>{FormatCurrency(state.currentRegion, data.productCost)}</span>
                          </div>
                          <div className='py-1 w-100 d-flex flex-row justify-content-between align-items-center'>
                            <span className='text-muted d-flex flex-row justify-content-start align-items-start fs-7'>Shipping To FBA Cost</span>
                            <span className='fw-light text-end text-muted fs-7'>{FormatCurrency(state.currentRegion, data.shippingToFbaCost)}</span>
                          </div>
                        </Collapse>
                      </td>
                    </tr>
                    <tr className='border-top pb-2'>
                      <td className='text-black d-flex flex-row justify-content-start align-items-start fw-bold fs-5'>Expenses</td>
                      <td className={'fw-bold text-end text-danger fs-5'}>{FormatCurrency(state.currentRegion, data.expenses)}</td>
                    </tr>

                    <tr>
                      <td className='fw-bold fs-5 border-top border-dark'>Net Profit</td>
                      <td className='fw-semibold fs-5 text-end border-top border-dark text-primary'>{FormatCurrency(state.currentRegion, data.grossRevenue - data.expenses)}</td>
                    </tr>
                  </tbody>
                </table>
              </CardBody>
            </Card>
          </Col>
        </Col>
      </Row>
    </div>
  )
}

export default ProductPerformanceExpandedDetails
