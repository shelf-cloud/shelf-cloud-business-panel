import React, { useContext, useState } from 'react'

import AppContext from '@context/AppContext'
import { AMAZON_MARKETPLACES_ID } from '@lib/AmzConstants'
import { FormatCurrency } from '@lib/FormatNumbers'
import { Marketplace, ProductPerformance } from '@typesTs/marketplaces/productPerformance'
import { ExpanderComponentProps } from 'react-data-table-component'

import { Card, CardBody, CardHeader, Col, Collapse, Row } from '@/components/migration-ui'
import { cn } from '@/lib/shadcn/utils'

import { getProductNetExpenses, isAllMarketplacesStore } from './productPerformanceMetrics'
import ProductPerformanceTimeline from './productPerformanceTimeline'

type Props = {
  data: ProductPerformance
  selectedMarketplaceStoreId?: number | string
}

const ProductPerformanceExpandedDetails: React.FC<ExpanderComponentProps<ProductPerformance>> = ({ data, selectedMarketplaceStoreId }: Props) => {
  const { state }: any = useContext(AppContext)
  const [showTaxes, setShowTaxes] = useState(false)
  const [showMarketplacesFees, setShowMarketplacesFees] = useState(false)
  const [showAmazonFbaFees, setShowAmazonFbaFees] = useState(false)
  const [showCogs, setShowCogs] = useState(false)
  const [showRefundCogs, setShowRefundCogs] = useState(false)
  const [showPPCCosts, setShowPPCCosts] = useState(false)

  const totalExpenses = getProductNetExpenses(data, selectedMarketplaceStoreId)
  const totalCogs = data.productCost + data.shippingToFbaCost
  const totalPPCCosts = data.sponsoredProducts + data.displayAds

  return (
    <div style={{ backgroundColor: '#F0F4F7', padding: '10px' }}>
      <Row>
        <Col xs={12} lg={4}>
          <Col sm={12}>
            <Card>
              <CardHeader className='py-3'>
                <h5 className='font-semibold m-0'>Performance Details</h5>
              </CardHeader>
              <CardBody>
                <table className='w-full text-nowrap mb-0 [&_td]:px-2 [&_td]:py-1'>
                  <tbody>
                    {/* GROOSS REVENUE */}
                    <tr className='border-b border-[color:var(--border)] pb-2'>
                      <td className='text-black flex flex-row justify-start items-start font-normal'>Base Price</td>
                      <td className={'font-normal text-right text-black'}>{FormatCurrency(state.currentRegion, data.basePrice)}</td>
                    </tr>
                    <tr onClick={() => setShowTaxes(!showTaxes)} style={{ cursor: 'pointer' }}>
                      <td className='text-black flex flex-row justify-start items-start font-normal'>Total Tax</td>
                      <td className={'font-normal text-right text-black'}>{FormatCurrency(state.currentRegion, data.totalTax)}</td>
                    </tr>
                    <tr>
                      <td className='p-0' colSpan={2}>
                        <Collapse className='ps-3 pe-1 py-0 w-full' isOpen={showTaxes}>
                          <div className='py-1 w-full flex flex-row justify-between items-center'>
                            <span className='text-[color:var(--bs-secondary-color)] flex flex-row justify-start items-start text-[11.2px]'>Tax Collected</span>
                            <span className={'font-light text-right text-[color:var(--bs-secondary-color)] text-[11.2px]'}>{FormatCurrency(state.currentRegion, data.taxCollected)}</span>
                          </div>
                          <div className='py-1 w-full flex flex-row justify-between items-center'>
                            <span className='text-[color:var(--bs-secondary-color)] flex flex-row justify-start items-start text-[11.2px]'>Tax Withheld</span>
                            <span className='font-light text-right text-[color:var(--bs-secondary-color)] text-[11.2px]'>{FormatCurrency(state.currentRegion, data.taxWithheld)}</span>
                          </div>
                        </Collapse>
                      </td>
                    </tr>

                    <tr className='border-b border-t border-[color:var(--border)] pb-2'>
                      <td className='text-black flex flex-row justify-start items-start font-normal'>Shipping</td>
                      <td className={'font-normal text-right text-black'}>{FormatCurrency(state.currentRegion, data.totalShipping)}</td>
                    </tr>
                    <tr className='pb-2'>
                      <td className='text-black flex flex-row justify-start items-start font-bold text-[16.25px]'>Gross Revenue</td>
                      <td className={'font-bold text-right text-primary text-[16.25px]'}>{FormatCurrency(state.currentRegion, data.grossRevenue)}</td>
                    </tr>

                    {/* EXPENSES */}
                    <tr className='border-b border-[color:var(--border)] pb-2' onClick={() => setShowMarketplacesFees(!showMarketplacesFees)} style={{ cursor: 'pointer' }}>
                      <td className='text-black flex flex-row justify-start items-start font-semibold'>Marketplaces Fees</td>
                      <td className={'font-normal text-right text-black'}>{FormatCurrency(state.currentRegion, data.totalMarketplacesFees)}</td>
                    </tr>
                    <tr>
                      <td className='p-0' colSpan={2}>
                        <Collapse className='ps-3 pe-1 py-0 w-full' isOpen={showMarketplacesFees}>
                          {Object.values(data.marketplaces).map(
                            (market: Marketplace) =>
                              market.fees.totalComission + market.fees.totalFixedFee !== 0 && (
                                <div key={market.storeId}>
                                  <div
                                    key={market.name}
                                    className='border-b border-[color:var(--border)] py-1 w-full flex flex-row justify-between items-center'
                                    onClick={() => AMAZON_MARKETPLACES_ID.includes(market.storeId) && setShowAmazonFbaFees(!showAmazonFbaFees)}>
                                    <span
                                      style={AMAZON_MARKETPLACES_ID.includes(market.storeId) ? { cursor: 'pointer' } : undefined}
                                      className={
                                        'text-black flex flex-row justify-start items-start font-normal ' +
                                        (AMAZON_MARKETPLACES_ID.includes(market.storeId) && '')
                                      }>
                                      {market.name}
                                    </span>
                                    <span className={'font-normal text-right text-black'}>
                                      {FormatCurrency(state.currentRegion, market.fees.totalComission + market.fees.totalFixedFee)}
                                    </span>
                                  </div>
                                  {/* AMAZON FBA FEES */}
                                  {AMAZON_MARKETPLACES_ID.includes(market.storeId) && (
                                    <Collapse className='ps-4 pe-1 py-0 w-full' isOpen={showAmazonFbaFees}>
                                      {market.fees.FBAPerOrderFulfillmentFee! !== 0 && (
                                        <div className='border-b border-[color:var(--border)] py-1 w-full flex flex-row justify-between items-center'>
                                          <span className='text-[color:var(--bs-secondary-color)] font-normal text-[11.2px]'>FBA Per Order Fee</span>
                                          <span className={'font-normal text-right text-[color:var(--bs-secondary-color)] text-[11.2px]'}>
                                            {FormatCurrency(state.currentRegion, market.fees.FBAPerOrderFulfillmentFee!)}
                                          </span>
                                        </div>
                                      )}
                                      {market.fees.FBAPerUnitFulfillmentFee! !== 0 && (
                                        <div className='border-b border-[color:var(--border)] py-1 w-full flex flex-row justify-between items-center'>
                                          <span className='text-[color:var(--bs-secondary-color)] font-normal text-[11.2px]'>FBA Per Unit Fee</span>
                                          <span className={'font-normal text-right text-[color:var(--bs-secondary-color)] text-[11.2px]'}>{FormatCurrency(state.currentRegion, market.fees.FBAPerUnitFulfillmentFee!)}</span>
                                        </div>
                                      )}
                                      {market.fees.FBAWeightBasedFee! !== 0 && (
                                        <div className='border-b border-[color:var(--border)] py-1 w-full flex flex-row justify-between items-center'>
                                          <span className='text-[color:var(--bs-secondary-color)] font-normal text-[11.2px]'>FBA Weight Based Fee</span>
                                          <span className={'font-normal text-right text-[color:var(--bs-secondary-color)] text-[11.2px]'}>{FormatCurrency(state.currentRegion, market.fees.FBAWeightBasedFee!)}</span>
                                        </div>
                                      )}
                                      {market.fees.VariableClosingFee! !== 0 && (
                                        <div className='border-b border-[color:var(--border)] py-1 w-full flex flex-row justify-between items-center'>
                                          <span className='text-[color:var(--bs-secondary-color)] font-normal text-[11.2px]'>Variable Closing Fee</span>
                                          <span className={'font-normal text-right text-[color:var(--bs-secondary-color)] text-[11.2px]'}>{FormatCurrency(state.currentRegion, market.fees.VariableClosingFee!)}</span>
                                        </div>
                                      )}
                                      {market.fees.Commission! !== 0 && (
                                        <div className='border-b border-[color:var(--border)] py-1 w-full flex flex-row justify-between items-center'>
                                          <span className='text-[color:var(--bs-secondary-color)] font-normal text-[11.2px]'>Commission</span>
                                          <span className={'font-normal text-right text-[color:var(--bs-secondary-color)] text-[11.2px]'}>{FormatCurrency(state.currentRegion, market.fees.Commission!)}</span>
                                        </div>
                                      )}
                                      {market.fees.FixedClosingFee! !== 0 && (
                                        <div className='border-b border-[color:var(--border)] py-1 w-full flex flex-row justify-between items-center'>
                                          <span className='text-[color:var(--bs-secondary-color)] font-normal text-[11.2px]'>Fixed Closing Fee</span>
                                          <span className={'font-normal text-right text-[color:var(--bs-secondary-color)] text-[11.2px]'}>{FormatCurrency(state.currentRegion, market.fees.FixedClosingFee!)}</span>
                                        </div>
                                      )}
                                      {market.fees.SalesTaxCollectionFee! !== 0 && (
                                        <div className='border-b border-[color:var(--border)] py-1 w-full flex flex-row justify-between items-center'>
                                          <span className='text-[color:var(--bs-secondary-color)] font-normal text-[11.2px]'>Sales Tax Collection Fee</span>
                                          <span className={'font-normal text-right text-[color:var(--bs-secondary-color)] text-[11.2px]'}>{FormatCurrency(state.currentRegion, market.fees.SalesTaxCollectionFee!)}</span>
                                        </div>
                                      )}
                                      {market.fees.ShippingChargeback! !== 0 && (
                                        <div className='border-b border-[color:var(--border)] py-1 w-full flex flex-row justify-between items-center'>
                                          <span className='text-[color:var(--bs-secondary-color)] font-normal text-[11.2px]'>Shipping Holdback Fee</span>
                                          <span className={'font-normal text-right text-[color:var(--bs-secondary-color)] text-[11.2px]'}>{FormatCurrency(state.currentRegion, market.fees.ShippingChargeback!)}</span>
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
                    {data.refunds > 0 && (
                      <tr className='border-b border-[color:var(--border)] pb-2'>
                        <td className='text-black flex flex-row justify-start items-start font-normal'>Refunds</td>
                        <td className={'font-light text-right text-black'}>{FormatCurrency(state.currentRegion, data.refunds)}</td>
                      </tr>
                    )}
                    {data.promos > 0 && (
                      <tr className='border-b border-[color:var(--border)] pb-2'>
                        <td className='text-black flex flex-row justify-start items-start font-normal'>Promos</td>
                        <td className={'font-light text-right text-black'}>{FormatCurrency(state.currentRegion, data.promos)}</td>
                      </tr>
                    )}
                    {data.shelfCloudCost > 0 && (
                      <tr className='border-b border-[color:var(--border)] pb-2'>
                        <td className='text-black flex flex-row justify-start items-start font-normal'>Pick & Pack</td>
                        <td className={'font-light text-right text-black'}>{FormatCurrency(state.currentRegion, data.shelfCloudCost)}</td>
                      </tr>
                    )}
                    {data.storageCost > 0 && isAllMarketplacesStore(selectedMarketplaceStoreId) && (
                      <tr className='border-b border-[color:var(--border)] pb-2'>
                        <td className='text-black flex flex-row justify-start items-start font-normal'>Storage Cost</td>
                        <td className={'font-light text-right text-black'}>{FormatCurrency(state.currentRegion, data.storageCost)}</td>
                      </tr>
                    )}
                    {data.fbaStorageCost > 0 && (
                      <tr className='border-b border-[color:var(--border)] pb-2'>
                        <td className='text-black flex flex-row justify-start items-start font-normal'>FBA Storage Cost</td>
                        <td className={'font-light text-right text-black'}>{FormatCurrency(state.currentRegion, data.fbaStorageCost)}</td>
                      </tr>
                    )}
                    {data.shippingCost > 0 && (
                      <tr className='border-b border-[color:var(--border)] pb-2'>
                        <td className='text-black flex flex-row justify-start items-start font-normal'>Shipping Cost</td>
                        <td className={'font-light text-right text-black'}>{FormatCurrency(state.currentRegion, data.shippingCost)}</td>
                      </tr>
                    )}
                    <tr className='border-b border-[color:var(--border)]' onClick={() => setShowPPCCosts(!showPPCCosts)} style={{ cursor: 'pointer' }}>
                      <td className='text-black flex flex-row justify-start items-start font-normal'>PPC Costs</td>
                      <td className={'font-normal text-right text-black'}>{FormatCurrency(state.currentRegion, totalPPCCosts)}</td>
                    </tr>
                    <tr>
                      <td className='p-0' colSpan={2}>
                        <Collapse className='ps-3 pe-1 py-0 w-full' isOpen={showPPCCosts}>
                          <div className='py-1 w-full flex flex-row justify-between items-center'>
                            <span className='text-[color:var(--bs-secondary-color)] flex flex-row justify-start items-start text-[11.2px]'>Sponsored Products</span>
                            <span className={'font-light text-right text-[color:var(--bs-secondary-color)] text-[11.2px]'}>{FormatCurrency(state.currentRegion, data.sponsoredProducts)}</span>
                          </div>
                          <div className='py-1 w-full flex flex-row justify-between items-center'>
                            <span className='text-[color:var(--bs-secondary-color)] flex flex-row justify-start items-start text-[11.2px]'>Sponsored Displays</span>
                            <span className='font-light text-right text-[color:var(--bs-secondary-color)] text-[11.2px]'>{FormatCurrency(state.currentRegion, data.displayAds)}</span>
                          </div>
                        </Collapse>
                      </td>
                    </tr>
                    <tr className='border-b border-[color:var(--border)]' onClick={() => setShowCogs(!showCogs)} style={{ cursor: 'pointer' }}>
                      <td className='text-black flex flex-row justify-start items-start font-normal'>COGS</td>
                      <td className={'font-normal text-right text-black'}>{FormatCurrency(state.currentRegion, totalCogs)}</td>
                    </tr>
                    <tr>
                      <td className='p-0' colSpan={2}>
                        <Collapse className='ps-3 pe-1 py-0 w-full' isOpen={showCogs}>
                          <div className='py-1 w-full flex flex-row justify-between items-center'>
                            <span className='text-[color:var(--bs-secondary-color)] flex flex-row justify-start items-start text-[11.2px]'>Product Cost (Landed)</span>
                            <span className={'font-light text-right text-[color:var(--bs-secondary-color)] text-[11.2px]'}>{FormatCurrency(state.currentRegion, data.productCost)}</span>
                          </div>
                          <div className='py-1 w-full flex flex-row justify-between items-center'>
                            <span className='text-[color:var(--bs-secondary-color)] flex flex-row justify-start items-start text-[11.2px]'>Shipping To FBA Cost</span>
                            <span className='font-light text-right text-[color:var(--bs-secondary-color)] text-[11.2px]'>{FormatCurrency(state.currentRegion, data.shippingToFbaCost)}</span>
                          </div>
                        </Collapse>
                      </td>
                    </tr>
                    <tr className='border-b border-[color:var(--border)]' onClick={() => setShowRefundCogs(!showRefundCogs)} style={{ cursor: 'pointer' }}>
                      <td className='text-black flex flex-row justify-start items-start font-normal'>Returned COGS</td>
                      <td className={'font-normal text-right text-black'}>{FormatCurrency(state.currentRegion, data.productCostOfRefunds)}</td>
                    </tr>
                    <tr>
                      <td className='p-0' colSpan={2}>
                        <Collapse className='ps-3 pe-1 py-0 w-full' isOpen={showRefundCogs}>
                          <div className='py-1 w-full flex flex-row justify-between items-center'>
                            <span className='text-[color:var(--bs-secondary-color)] flex flex-row justify-start items-start text-[11.2px]'>Product Cost (Landed)</span>
                            <span className={'font-light text-right text-[color:var(--bs-secondary-color)] text-[11.2px]'}>{FormatCurrency(state.currentRegion, data.productCostOfRefunds)}</span>
                          </div>
                          {/* <div className='py-1 w-full flex flex-row justify-between items-center'>
                            <span className='text-[color:var(--bs-secondary-color)] flex flex-row justify-start items-start text-[11.2px]'>Shipping To FBA Cost</span>
                            <span className='font-light text-right text-[color:var(--bs-secondary-color)] text-[11.2px]'>{FormatCurrency(state.currentRegion, data.shippingToFbaCostOfRefunds)}</span>
                          </div> */}
                        </Collapse>
                      </td>
                    </tr>
                    {data.reimbursements !== 0 && (
                      <tr className='border-b border-[color:var(--border)] pb-2'>
                        <td className='text-black flex flex-row justify-start items-start font-normal'>Reimbursements</td>
                        <td className={'font-normal text-right text-black'}>-{FormatCurrency(state.currentRegion, data.reimbursements)}</td>
                      </tr>
                    )}
                    <tr>
                      <td className='text-black flex flex-row justify-start items-start font-bold text-[16.25px]'>Expenses</td>
                      <td className={cn('font-bold text-right text-[16.25px]', totalExpenses >= 0 ? 'text-destructive' : 'text-primary')}>{FormatCurrency(state.currentRegion, totalExpenses)}</td>
                    </tr>
                    <tr className='border-t border-[color:var(--foreground)]'>
                      <td className='font-bold text-[16.25px]'>Net Profit</td>
                      <td className={'font-bold text-[16.25px] text-right ' + (data.grossRevenue - totalExpenses >= 0 ? 'text-primary' : 'text-destructive')}>
                        {FormatCurrency(state.currentRegion, data.grossRevenue - totalExpenses)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </CardBody>
            </Card>
          </Col>
        </Col>
        <Col xs={12} lg={8}>
          <Card>
            <CardHeader className='py-3'>
              <h5 className='font-semibold m-0'>Performance Timeline</h5>
            </CardHeader>
            <CardBody>
              <ProductPerformanceTimeline productTimeLine={data.datesArray} />
            </CardBody>
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default ProductPerformanceExpandedDetails
