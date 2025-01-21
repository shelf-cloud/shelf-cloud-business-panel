import ProductPerformanceTimeline from '@components/marketplaces/productPerformanceTimeline'
import AppContext from '@context/AppContext'
import { AMAZON_MARKETPLACES_ID } from '@lib/AmzConstants'
import { FormatCurrency } from '@lib/FormatNumbers'
import { Marketplace, ProductPerformance, SummaryProductPerformance } from '@typesTs/marketplaces/productPerformance'
import React, { useContext, useMemo, useState } from 'react'
import { Button, Card, CardBody, CardHeader, Col, Collapse, Modal, ModalBody, ModalFooter, ModalHeader, Row } from 'reactstrap'
import { datesArraySummary, marketplacesSummary } from './helperFunctions'

type Props = {
  productsData: ProductPerformance[]
  summaryModal: {
    show: boolean
  }
  setsummaryModal: (prev: any) => void
}

function SummaryPP({ productsData, summaryModal, setsummaryModal }: Props) {
  const { state }: any = useContext(AppContext)
  const [showTaxes, setShowTaxes] = useState(false)
  const [showMarketplacesFees, setShowMarketplacesFees] = useState(false)
  const [showAmazonFbaFees, setShowAmazonFbaFees] = useState(false)
  const [showCogs, setShowCogs] = useState(false)
  const [showRefundCogs, setShowRefundCogs] = useState(false)
  const [showPPCCosts, setShowPPCCosts] = useState(false)

  const data = useMemo(() => {
    return productsData.reduce(
      (data, sku) => {
        data.grossRevenue += sku.grossRevenue
        data.expenses += sku.expenses
        data.unitsSold += sku.unitsSold
        data.basePrice += sku.basePrice
        data.totalTax += sku.totalTax
        data.taxCollected += sku.taxCollected
        data.taxWithheld += sku.taxWithheld
        data.totalShipping += sku.totalShipping
        data.totalMarketplacesFees += sku.totalMarketplacesFees
        data.reimbursements += sku.reimbursements
        data.refunds += sku.refunds
        data.refundsQty += sku.refundsQty
        data.returns += sku.returns
        data.promos += sku.promos
        data.productCost += sku.productCost
        data.productCostOfRefunds += sku.productCostOfRefunds
        data.shippingCost += sku.shippingCost
        data.storageCost += sku.storageCost
        data.sponsoredProducts += sku.sponsoredProducts
        data.displayAds += sku.displayAds
        data.keywordAds += sku.keywordAds
        data.sellerCost += sku.sellerCost
        data.inboundShippingCost += sku.inboundShippingCost
        data.otherCosts += sku.otherCosts
        data.shippingToFBA += sku.shippingToFBA
        data.shippingToFbaCost += sku.shippingToFbaCost
        data.shippingToFbaCostOfRefunds += sku.shippingToFbaCostOfRefunds
        data.shelfCloudCost += sku.shelfCloudCost
        data.marketplaces = marketplacesSummary(structuredClone(data.marketplaces), sku.marketplaces)
        data.datesArray = datesArraySummary(structuredClone(data.datesArray), sku.datesArray)
        data.totalExpenses += sku.expenses + sku.storageCost
        data.totalCogs += sku.productCost + sku.shippingToFbaCost
        data.totalPPCCosts += sku.sponsoredProducts + sku.displayAds
        return data
      },
      {
        grossRevenue: 0,
        expenses: 0,
        unitsSold: 0,
        basePrice: 0,
        totalTax: 0,
        taxCollected: 0,
        taxWithheld: 0,
        totalShipping: 0,
        totalMarketplacesFees: 0,
        reimbursements: 0,
        refunds: 0,
        refundsQty: 0,
        returns: 0,
        promos: 0,
        productCost: 0,
        productCostOfRefunds: 0,
        shippingCost: 0,
        storageCost: 0,
        sponsoredProducts: 0,
        displayAds: 0,
        keywordAds: 0,
        sellerCost: 0,
        inboundShippingCost: 0,
        otherCosts: 0,
        shippingToFBA: 0,
        shippingToFbaCost: 0,
        shippingToFbaCostOfRefunds: 0,
        shelfCloudCost: 0,
        totalExpenses: 0,
        totalCogs: 0,
        totalPPCCosts: 0,
        marketplaces: {},
        datesArray: {},
      } as SummaryProductPerformance
    )
  }, [productsData])

  return (
    <Modal
      fade={false}
      size='xl'
      id='summaryPP'
      isOpen={summaryModal.show}
      toggle={() => {
        setsummaryModal({
          show: false,
        })
      }}>
      <ModalHeader
        toggle={() => {
          setsummaryModal({
            show: false,
          })
        }}>
        <p className='m-0 p-0 fw-bold fs-5'>SUMMARY</p>
      </ModalHeader>
      <ModalBody>
        <Row>
          <Col xs={12} lg={4}>
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
                      <tr className='border-bottom pb-2' onClick={() => setShowMarketplacesFees(!showMarketplacesFees)} style={{ cursor: 'pointer' }}>
                        <td className='dropdown-toggle text-black d-flex flex-row justify-content-start align-items-start fw-semibold'>Marketplaces Fees</td>
                        <td className={'fw-normal text-end text-black'}>-{FormatCurrency(state.currentRegion, data.totalMarketplacesFees)}</td>
                      </tr>
                      <tr>
                        <td className='p-0' colSpan={2}>
                          <Collapse className='ps-3 pe-1 py-0 w-100' isOpen={showMarketplacesFees}>
                            {Object.values(data.marketplaces).map(
                              (market: Marketplace) =>
                                market.fees.totalComission + market.fees.totalFixedFee !== 0 && (
                                  <div key={market.storeId}>
                                    <div
                                      key={market.name}
                                      className='border-bottom py-1 w-100 d-flex flex-row justify-content-between align-items-center'
                                      onClick={() => AMAZON_MARKETPLACES_ID.includes(market.storeId) && setShowAmazonFbaFees(!showAmazonFbaFees)}>
                                      <span
                                        style={AMAZON_MARKETPLACES_ID.includes(market.storeId) ? { cursor: 'pointer' } : undefined}
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
                                            <span className={'fw-normal text-end text-muted fs-7'}>
                                              {FormatCurrency(state.currentRegion, market.fees.FBAPerUnitFulfillmentFee!)}
                                            </span>
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
                                        {market.fees.GiftwrapChargeback! !== 0 && (
                                          <div className='border-bottom py-1 w-100 d-flex flex-row justify-content-between align-items-center'>
                                            <span className='text-muted fw-normal fs-7'>Gift Wrap Chargeback Fee</span>
                                            <span className={'fw-normal text-end text-muted fs-7'}>{FormatCurrency(state.currentRegion, market.fees.GiftwrapChargeback!)}</span>
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
                        <tr className='border-bottom pb-2'>
                          <td className='text-black d-flex flex-row justify-content-start align-items-start fw-normal'>Refunds</td>
                          <td className={'fw-light text-end text-black'}>-{FormatCurrency(state.currentRegion, data.refunds)}</td>
                        </tr>
                      )}
                      {data.promos > 0 && (
                        <tr className='border-bottom pb-2'>
                          <td className='text-black d-flex flex-row justify-content-start align-items-start fw-normal'>Promos</td>
                          <td className={'fw-light text-end text-black'}>-{FormatCurrency(state.currentRegion, data.promos)}</td>
                        </tr>
                      )}
                      {data.shelfCloudCost > 0 && (
                        <tr className='border-bottom pb-2'>
                          <td className='text-black d-flex flex-row justify-content-start align-items-start fw-normal'>Pick & Pack</td>
                          <td className={'fw-light text-end text-black'}>-{FormatCurrency(state.currentRegion, data.shelfCloudCost)}</td>
                        </tr>
                      )}
                      {data.storageCost > 0 && (
                        <tr className='border-bottom pb-2'>
                          <td className='text-black d-flex flex-row justify-content-start align-items-start fw-normal'>Storage Cost</td>
                          <td className={'fw-light text-end text-black'}>-{FormatCurrency(state.currentRegion, data.storageCost)}</td>
                        </tr>
                      )}
                      {data.shippingCost > 0 && (
                        <tr className='border-bottom pb-2'>
                          <td className='text-black d-flex flex-row justify-content-start align-items-start fw-normal'>Shipping Cost</td>
                          <td className={'fw-light text-end text-black'}>-{FormatCurrency(state.currentRegion, data.shippingCost)}</td>
                        </tr>
                      )}
                      <tr className='border-bottom' onClick={() => setShowPPCCosts(!showPPCCosts)} style={{ cursor: 'pointer' }}>
                        <td className='dropdown-toggle text-black d-flex flex-row justify-content-start align-items-start fw-normal'>PPC Costs</td>
                        <td className={'fw-normal text-end text-black'}>-{FormatCurrency(state.currentRegion, data.totalPPCCosts)}</td>
                      </tr>
                      <tr>
                        <td className='p-0' colSpan={2}>
                          <Collapse className='ps-3 pe-1 py-0 w-100' isOpen={showPPCCosts}>
                            <div className='py-1 w-100 d-flex flex-row justify-content-between align-items-center'>
                              <span className='text-muted d-flex flex-row justify-content-start align-items-start fs-7'>Sponsored Products</span>
                              <span className={'fw-light text-end text-muted fs-7'}>{FormatCurrency(state.currentRegion, data.sponsoredProducts)}</span>
                            </div>
                            <div className='py-1 w-100 d-flex flex-row justify-content-between align-items-center'>
                              <span className='text-muted d-flex flex-row justify-content-start align-items-start fs-7'>Sponsored Displays</span>
                              <span className='fw-light text-end text-muted fs-7'>{FormatCurrency(state.currentRegion, data.displayAds)}</span>
                            </div>
                          </Collapse>
                        </td>
                      </tr>
                      <tr className='border-bottom' onClick={() => setShowCogs(!showCogs)} style={{ cursor: 'pointer' }}>
                        <td className='dropdown-toggle text-black d-flex flex-row justify-content-start align-items-start fw-normal'>COGS</td>
                        <td className={'fw-normal text-end text-black'}>-{FormatCurrency(state.currentRegion, data.totalCogs)}</td>
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
                      <tr className='border-bottom' onClick={() => setShowRefundCogs(!showRefundCogs)} style={{ cursor: 'pointer' }}>
                        <td className='dropdown-toggle text-black d-flex flex-row justify-content-start align-items-start fw-normal'>Returned COGS</td>
                        <td className={'fw-normal text-end text-black'}>{FormatCurrency(state.currentRegion, data.productCostOfRefunds)}</td>
                      </tr>
                      <tr>
                        <td className='p-0' colSpan={2}>
                          <Collapse className='ps-3 pe-1 py-0 w-100' isOpen={showRefundCogs}>
                            <div className='py-1 w-100 d-flex flex-row justify-content-between align-items-center'>
                              <span className='text-muted d-flex flex-row justify-content-start align-items-start fs-7'>Product Cost (Landed)</span>
                              <span className={'fw-light text-end text-muted fs-7'}>{FormatCurrency(state.currentRegion, data.productCostOfRefunds)}</span>
                            </div>
                            {/* <div className='py-1 w-100 d-flex flex-row justify-content-between align-items-center'>
                            <span className='text-muted d-flex flex-row justify-content-start align-items-start fs-7'>Shipping To FBA Cost</span>
                            <span className='fw-light text-end text-muted fs-7'>{FormatCurrency(state.currentRegion, data.shippingToFbaCostOfRefunds)}</span>
                          </div> */}
                          </Collapse>
                        </td>
                      </tr>
                      {data.reimbursements !== 0 && (
                        <tr className='border-bottom pb-2'>
                          <td className='text-black d-flex flex-row justify-content-start align-items-start fw-normal'>Reimbursements</td>
                          <td className={'fw-normal text-end text-black'}>{FormatCurrency(state.currentRegion, data.reimbursements)}</td>
                        </tr>
                      )}
                      <tr>
                        <td className='text-black d-flex flex-row justify-content-start align-items-start fw-bold fs-5'>Expenses</td>
                        <td className={'fw-bold text-end text-danger fs-5'}>-{FormatCurrency(state.currentRegion, data.totalExpenses)}</td>
                      </tr>
                      <tr className='border-top border-dark'>
                        <td className='fw-bold fs-5'>Net Profit</td>
                        <td className={'fw-bold fs-5 text-end ' + (data.grossRevenue - data.totalExpenses >= 0 ? 'text-primary' : 'text-danger')}>
                          {FormatCurrency(state.currentRegion, data.grossRevenue - data.totalExpenses)}
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
                <h5 className='fw-semibold m-0'>Performance Timeline</h5>
              </CardHeader>
              <CardBody>
                <ProductPerformanceTimeline productTimeLine={data.datesArray} />
              </CardBody>
            </Card>
          </Col>
        </Row>
      </ModalBody>
      <ModalFooter>
        <Button
          color='light'
          onClick={() => {
            setsummaryModal({
              show: false,
            })
          }}>
          Close
        </Button>
      </ModalFooter>
    </Modal>
  )
}

export default SummaryPP
