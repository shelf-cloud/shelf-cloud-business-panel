import { useContext, useMemo, useState } from 'react'

import ProductPerformanceTimeline from '@components/marketplaces/productPerformanceTimeline'
import AppContext from '@context/AppContext'
import { AMAZON_MARKETPLACES_ID } from '@lib/AmzConstants'
import { FormatCurrency } from '@lib/FormatNumbers'
import { Marketplace, ProductPerformance, SummaryProductPerformance } from '@typesTs/marketplaces/productPerformance'
import { Button, Card, CardBody, CardHeader, Col, Collapse, Modal, ModalBody, ModalFooter, ModalHeader, Row } from '@/components/migration-ui'

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
        data.fbaStorageCost += sku.fbaStorageCost
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
        fbaStorageCost: 0,
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
        <p className='tw:m-0 tw:p-0 tw:font-bold tw:text-[16.25px]'>SUMMARY</p>
      </ModalHeader>
      <ModalBody>
        <Row>
          <Col xs={12} lg={4}>
            <Col sm={12}>
              <Card>
                <CardHeader className='tw:py-3'>
                  <h5 className='tw:font-semibold tw:m-0'>Performance Details</h5>
                </CardHeader>
                <CardBody>
                  <table className='tw:w-full tw:text-nowrap tw:mb-0 tw:[&_td]:px-2 tw:[&_td]:py-1'>
                    <tbody>
                      {/* GROOSS REVENUE */}
                      <tr className='tw:border-b tw:border-[color:var(--border)] tw:pb-2'>
                        <td className='tw:text-black tw:flex tw:flex-row tw:justify-start tw:items-start tw:font-normal'>Base Price</td>
                        <td className={'tw:font-normal tw:text-right tw:text-black'}>{FormatCurrency(state.currentRegion, data.basePrice)}</td>
                      </tr>
                      <tr onClick={() => setShowTaxes(!showTaxes)} style={{ cursor: 'pointer' }}>
                        <td className='tw:text-black tw:flex tw:flex-row tw:justify-start tw:items-start tw:font-normal'>Total Tax</td>
                        <td className={'tw:font-normal tw:text-right tw:text-black'}>{FormatCurrency(state.currentRegion, data.totalTax)}</td>
                      </tr>
                      <tr>
                        <td className='tw:p-0' colSpan={2}>
                          <Collapse className='tw:ps-3 tw:pe-1 tw:py-0 tw:w-full' isOpen={showTaxes}>
                            <div className='tw:py-1 tw:w-full tw:flex tw:flex-row tw:justify-between tw:items-center'>
                              <span className='tw:text-[color:var(--bs-secondary-color)] tw:flex tw:flex-row tw:justify-start tw:items-start tw:text-[11.2px]'>Tax Collected</span>
                              <span className={'tw:font-light tw:text-right tw:text-[color:var(--bs-secondary-color)] tw:text-[11.2px]'}>{FormatCurrency(state.currentRegion, data.taxCollected)}</span>
                            </div>
                            <div className='tw:py-1 tw:w-full tw:flex tw:flex-row tw:justify-between tw:items-center'>
                              <span className='tw:text-[color:var(--bs-secondary-color)] tw:flex tw:flex-row tw:justify-start tw:items-start tw:text-[11.2px]'>Tax Withheld</span>
                              <span className='tw:font-light tw:text-right tw:text-[color:var(--bs-secondary-color)] tw:text-[11.2px]'>{FormatCurrency(state.currentRegion, data.taxWithheld)}</span>
                            </div>
                          </Collapse>
                        </td>
                      </tr>

                      <tr className='tw:border-b tw:border-t tw:border-[color:var(--border)] tw:pb-2'>
                        <td className='tw:text-black tw:flex tw:flex-row tw:justify-start tw:items-start tw:font-normal'>Shipping</td>
                        <td className={'tw:font-normal tw:text-right tw:text-black'}>{FormatCurrency(state.currentRegion, data.totalShipping)}</td>
                      </tr>
                      <tr className='tw:pb-2'>
                        <td className='tw:text-black tw:flex tw:flex-row tw:justify-start tw:items-start tw:font-bold tw:text-[16.25px]'>Gross Revenue</td>
                        <td className={'tw:font-bold tw:text-right tw:text-primary tw:text-[16.25px]'}>{FormatCurrency(state.currentRegion, data.grossRevenue)}</td>
                      </tr>

                      {/* EXPENSES */}
                      <tr className='tw:border-b tw:border-[color:var(--border)] tw:pb-2' onClick={() => setShowMarketplacesFees(!showMarketplacesFees)} style={{ cursor: 'pointer' }}>
                        <td className='tw:text-black tw:flex tw:flex-row tw:justify-start tw:items-start tw:font-semibold'>Marketplaces Fees</td>
                        <td className={'tw:font-normal tw:text-right tw:text-black'}>-{FormatCurrency(state.currentRegion, data.totalMarketplacesFees)}</td>
                      </tr>
                      <tr>
                        <td className='tw:p-0' colSpan={2}>
                          <Collapse className='tw:ps-3 tw:pe-1 tw:py-0 tw:w-full' isOpen={showMarketplacesFees}>
                            {Object.values(data.marketplaces).map(
                              (market: Marketplace) =>
                                market.fees.totalComission + market.fees.totalFixedFee !== 0 && (
                                  <div key={market.storeId}>
                                    <div
                                      key={market.name}
                                      className='tw:border-b tw:border-[color:var(--border)] tw:py-1 tw:w-full tw:flex tw:flex-row tw:justify-between tw:items-center'
                                      onClick={() => AMAZON_MARKETPLACES_ID.includes(market.storeId) && setShowAmazonFbaFees(!showAmazonFbaFees)}>
                                      <span
                                        style={AMAZON_MARKETPLACES_ID.includes(market.storeId) ? { cursor: 'pointer' } : undefined}
                                        className={
                                          'tw:text-black tw:flex tw:flex-row tw:justify-start tw:items-start tw:font-normal ' +
                                          (AMAZON_MARKETPLACES_ID.includes(market.storeId) && '')
                                        }>
                                        {market.name}
                                      </span>
                                      <span className={'tw:font-normal tw:text-right tw:text-black'}>
                                        {FormatCurrency(state.currentRegion, market.fees.totalComission + market.fees.totalFixedFee)}
                                      </span>
                                    </div>
                                    {/* AMAZON FBA FEES */}
                                    {AMAZON_MARKETPLACES_ID.includes(market.storeId) && (
                                      <Collapse className='tw:ps-4 tw:pe-1 tw:py-0 tw:w-full' isOpen={showAmazonFbaFees}>
                                        {market.fees.FBAPerOrderFulfillmentFee! !== 0 && (
                                          <div className='tw:border-b tw:border-[color:var(--border)] tw:py-1 tw:w-full tw:flex tw:flex-row tw:justify-between tw:items-center'>
                                            <span className='tw:text-[color:var(--bs-secondary-color)] tw:font-normal tw:text-[11.2px]'>FBA Per Order Fee</span>
                                            <span className={'tw:font-normal tw:text-right tw:text-[color:var(--bs-secondary-color)] tw:text-[11.2px]'}>
                                              {FormatCurrency(state.currentRegion, market.fees.FBAPerOrderFulfillmentFee!)}
                                            </span>
                                          </div>
                                        )}
                                        {market.fees.FBAPerUnitFulfillmentFee! !== 0 && (
                                          <div className='tw:border-b tw:border-[color:var(--border)] tw:py-1 tw:w-full tw:flex tw:flex-row tw:justify-between tw:items-center'>
                                            <span className='tw:text-[color:var(--bs-secondary-color)] tw:font-normal tw:text-[11.2px]'>FBA Per Unit Fee</span>
                                            <span className={'tw:font-normal tw:text-right tw:text-[color:var(--bs-secondary-color)] tw:text-[11.2px]'}>
                                              {FormatCurrency(state.currentRegion, market.fees.FBAPerUnitFulfillmentFee!)}
                                            </span>
                                          </div>
                                        )}
                                        {market.fees.FBAWeightBasedFee! !== 0 && (
                                          <div className='tw:border-b tw:border-[color:var(--border)] tw:py-1 tw:w-full tw:flex tw:flex-row tw:justify-between tw:items-center'>
                                            <span className='tw:text-[color:var(--bs-secondary-color)] tw:font-normal tw:text-[11.2px]'>FBA Weight Based Fee</span>
                                            <span className={'tw:font-normal tw:text-right tw:text-[color:var(--bs-secondary-color)] tw:text-[11.2px]'}>{FormatCurrency(state.currentRegion, market.fees.FBAWeightBasedFee!)}</span>
                                          </div>
                                        )}
                                        {market.fees.VariableClosingFee! !== 0 && (
                                          <div className='tw:border-b tw:border-[color:var(--border)] tw:py-1 tw:w-full tw:flex tw:flex-row tw:justify-between tw:items-center'>
                                            <span className='tw:text-[color:var(--bs-secondary-color)] tw:font-normal tw:text-[11.2px]'>Variable Closing Fee</span>
                                            <span className={'tw:font-normal tw:text-right tw:text-[color:var(--bs-secondary-color)] tw:text-[11.2px]'}>{FormatCurrency(state.currentRegion, market.fees.VariableClosingFee!)}</span>
                                          </div>
                                        )}
                                        {market.fees.Commission! !== 0 && (
                                          <div className='tw:border-b tw:border-[color:var(--border)] tw:py-1 tw:w-full tw:flex tw:flex-row tw:justify-between tw:items-center'>
                                            <span className='tw:text-[color:var(--bs-secondary-color)] tw:font-normal tw:text-[11.2px]'>Commission</span>
                                            <span className={'tw:font-normal tw:text-right tw:text-[color:var(--bs-secondary-color)] tw:text-[11.2px]'}>{FormatCurrency(state.currentRegion, market.fees.Commission!)}</span>
                                          </div>
                                        )}
                                        {market.fees.FixedClosingFee! !== 0 && (
                                          <div className='tw:border-b tw:border-[color:var(--border)] tw:py-1 tw:w-full tw:flex tw:flex-row tw:justify-between tw:items-center'>
                                            <span className='tw:text-[color:var(--bs-secondary-color)] tw:font-normal tw:text-[11.2px]'>Fixed Closing Fee</span>
                                            <span className={'tw:font-normal tw:text-right tw:text-[color:var(--bs-secondary-color)] tw:text-[11.2px]'}>{FormatCurrency(state.currentRegion, market.fees.FixedClosingFee!)}</span>
                                          </div>
                                        )}
                                        {market.fees.SalesTaxCollectionFee! !== 0 && (
                                          <div className='tw:border-b tw:border-[color:var(--border)] tw:py-1 tw:w-full tw:flex tw:flex-row tw:justify-between tw:items-center'>
                                            <span className='tw:text-[color:var(--bs-secondary-color)] tw:font-normal tw:text-[11.2px]'>Sales Tax Collection Fee</span>
                                            <span className={'tw:font-normal tw:text-right tw:text-[color:var(--bs-secondary-color)] tw:text-[11.2px]'}>{FormatCurrency(state.currentRegion, market.fees.SalesTaxCollectionFee!)}</span>
                                          </div>
                                        )}
                                        {market.fees.ShippingChargeback! !== 0 && (
                                          <div className='tw:border-b tw:border-[color:var(--border)] tw:py-1 tw:w-full tw:flex tw:flex-row tw:justify-between tw:items-center'>
                                            <span className='tw:text-[color:var(--bs-secondary-color)] tw:font-normal tw:text-[11.2px]'>Shipping Holdback Fee</span>
                                            <span className={'tw:font-normal tw:text-right tw:text-[color:var(--bs-secondary-color)] tw:text-[11.2px]'}>{FormatCurrency(state.currentRegion, market.fees.ShippingChargeback!)}</span>
                                          </div>
                                        )}
                                        {market.fees.GiftwrapChargeback! !== 0 && (
                                          <div className='tw:border-b tw:border-[color:var(--border)] tw:py-1 tw:w-full tw:flex tw:flex-row tw:justify-between tw:items-center'>
                                            <span className='tw:text-[color:var(--bs-secondary-color)] tw:font-normal tw:text-[11.2px]'>Gift Wrap Chargeback Fee</span>
                                            <span className={'tw:font-normal tw:text-right tw:text-[color:var(--bs-secondary-color)] tw:text-[11.2px]'}>{FormatCurrency(state.currentRegion, market.fees.GiftwrapChargeback!)}</span>
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
                        <tr className='tw:border-b tw:border-[color:var(--border)] tw:pb-2'>
                          <td className='tw:text-black tw:flex tw:flex-row tw:justify-start tw:items-start tw:font-normal'>Refunds</td>
                          <td className={'tw:font-light tw:text-right tw:text-black'}>-{FormatCurrency(state.currentRegion, data.refunds)}</td>
                        </tr>
                      )}
                      {data.promos > 0 && (
                        <tr className='tw:border-b tw:border-[color:var(--border)] tw:pb-2'>
                          <td className='tw:text-black tw:flex tw:flex-row tw:justify-start tw:items-start tw:font-normal'>Promos</td>
                          <td className={'tw:font-light tw:text-right tw:text-black'}>-{FormatCurrency(state.currentRegion, data.promos)}</td>
                        </tr>
                      )}
                      {data.shelfCloudCost > 0 && (
                        <tr className='tw:border-b tw:border-[color:var(--border)] tw:pb-2'>
                          <td className='tw:text-black tw:flex tw:flex-row tw:justify-start tw:items-start tw:font-normal'>Pick & Pack</td>
                          <td className={'tw:font-light tw:text-right tw:text-black'}>-{FormatCurrency(state.currentRegion, data.shelfCloudCost)}</td>
                        </tr>
                      )}
                      {data.storageCost > 0 && (
                        <tr className='tw:border-b tw:border-[color:var(--border)] tw:pb-2'>
                          <td className='tw:text-black tw:flex tw:flex-row tw:justify-start tw:items-start tw:font-normal'>Storage Cost</td>
                          <td className={'tw:font-light tw:text-right tw:text-black'}>-{FormatCurrency(state.currentRegion, data.storageCost)}</td>
                        </tr>
                      )}
                      {data.fbaStorageCost > 0 && (
                        <tr className='tw:border-b tw:border-[color:var(--border)] tw:pb-2'>
                          <td className='tw:text-black tw:flex tw:flex-row tw:justify-start tw:items-start tw:font-normal'>FBA Storage Cost</td>
                          <td className={'tw:font-light tw:text-right tw:text-black'}>-{FormatCurrency(state.currentRegion, data.fbaStorageCost)}</td>
                        </tr>
                      )}
                      {data.shippingCost > 0 && (
                        <tr className='tw:border-b tw:border-[color:var(--border)] tw:pb-2'>
                          <td className='tw:text-black tw:flex tw:flex-row tw:justify-start tw:items-start tw:font-normal'>Shipping Cost</td>
                          <td className={'tw:font-light tw:text-right tw:text-black'}>-{FormatCurrency(state.currentRegion, data.shippingCost)}</td>
                        </tr>
                      )}
                      <tr className='tw:border-b tw:border-[color:var(--border)]' onClick={() => setShowPPCCosts(!showPPCCosts)} style={{ cursor: 'pointer' }}>
                        <td className='tw:text-black tw:flex tw:flex-row tw:justify-start tw:items-start tw:font-normal'>PPC Costs</td>
                        <td className={'tw:font-normal tw:text-right tw:text-black'}>-{FormatCurrency(state.currentRegion, data.totalPPCCosts)}</td>
                      </tr>
                      <tr>
                        <td className='tw:p-0' colSpan={2}>
                          <Collapse className='tw:ps-3 tw:pe-1 tw:py-0 tw:w-full' isOpen={showPPCCosts}>
                            <div className='tw:py-1 tw:w-full tw:flex tw:flex-row tw:justify-between tw:items-center'>
                              <span className='tw:text-[color:var(--bs-secondary-color)] tw:flex tw:flex-row tw:justify-start tw:items-start tw:text-[11.2px]'>Sponsored Products</span>
                              <span className={'tw:font-light tw:text-right tw:text-[color:var(--bs-secondary-color)] tw:text-[11.2px]'}>{FormatCurrency(state.currentRegion, data.sponsoredProducts)}</span>
                            </div>
                            <div className='tw:py-1 tw:w-full tw:flex tw:flex-row tw:justify-between tw:items-center'>
                              <span className='tw:text-[color:var(--bs-secondary-color)] tw:flex tw:flex-row tw:justify-start tw:items-start tw:text-[11.2px]'>Sponsored Displays</span>
                              <span className='tw:font-light tw:text-right tw:text-[color:var(--bs-secondary-color)] tw:text-[11.2px]'>{FormatCurrency(state.currentRegion, data.displayAds)}</span>
                            </div>
                          </Collapse>
                        </td>
                      </tr>
                      <tr className='tw:border-b tw:border-[color:var(--border)]' onClick={() => setShowCogs(!showCogs)} style={{ cursor: 'pointer' }}>
                        <td className='tw:text-black tw:flex tw:flex-row tw:justify-start tw:items-start tw:font-normal'>COGS</td>
                        <td className={'tw:font-normal tw:text-right tw:text-black'}>-{FormatCurrency(state.currentRegion, data.totalCogs)}</td>
                      </tr>
                      <tr>
                        <td className='tw:p-0' colSpan={2}>
                          <Collapse className='tw:ps-3 tw:pe-1 tw:py-0 tw:w-full' isOpen={showCogs}>
                            <div className='tw:py-1 tw:w-full tw:flex tw:flex-row tw:justify-between tw:items-center'>
                              <span className='tw:text-[color:var(--bs-secondary-color)] tw:flex tw:flex-row tw:justify-start tw:items-start tw:text-[11.2px]'>Product Cost (Landed)</span>
                              <span className={'tw:font-light tw:text-right tw:text-[color:var(--bs-secondary-color)] tw:text-[11.2px]'}>{FormatCurrency(state.currentRegion, data.productCost)}</span>
                            </div>
                            <div className='tw:py-1 tw:w-full tw:flex tw:flex-row tw:justify-between tw:items-center'>
                              <span className='tw:text-[color:var(--bs-secondary-color)] tw:flex tw:flex-row tw:justify-start tw:items-start tw:text-[11.2px]'>Shipping To FBA Cost</span>
                              <span className='tw:font-light tw:text-right tw:text-[color:var(--bs-secondary-color)] tw:text-[11.2px]'>{FormatCurrency(state.currentRegion, data.shippingToFbaCost)}</span>
                            </div>
                          </Collapse>
                        </td>
                      </tr>
                      <tr className='tw:border-b tw:border-[color:var(--border)]' onClick={() => setShowRefundCogs(!showRefundCogs)} style={{ cursor: 'pointer' }}>
                        <td className='tw:text-black tw:flex tw:flex-row tw:justify-start tw:items-start tw:font-normal'>Returned COGS</td>
                        <td className={'tw:font-normal tw:text-right tw:text-black'}>{FormatCurrency(state.currentRegion, data.productCostOfRefunds)}</td>
                      </tr>
                      <tr>
                        <td className='tw:p-0' colSpan={2}>
                          <Collapse className='tw:ps-3 tw:pe-1 tw:py-0 tw:w-full' isOpen={showRefundCogs}>
                            <div className='tw:py-1 tw:w-full tw:flex tw:flex-row tw:justify-between tw:items-center'>
                              <span className='tw:text-[color:var(--bs-secondary-color)] tw:flex tw:flex-row tw:justify-start tw:items-start tw:text-[11.2px]'>Product Cost (Landed)</span>
                              <span className={'tw:font-light tw:text-right tw:text-[color:var(--bs-secondary-color)] tw:text-[11.2px]'}>{FormatCurrency(state.currentRegion, data.productCostOfRefunds)}</span>
                            </div>
                            {/* <div className='tw:py-1 tw:w-full tw:flex tw:flex-row tw:justify-between tw:items-center'>
                            <span className='tw:text-[color:var(--bs-secondary-color)] tw:flex tw:flex-row tw:justify-start tw:items-start tw:text-[11.2px]'>Shipping To FBA Cost</span>
                            <span className='tw:font-light tw:text-right tw:text-[color:var(--bs-secondary-color)] tw:text-[11.2px]'>{FormatCurrency(state.currentRegion, data.shippingToFbaCostOfRefunds)}</span>
                          </div> */}
                          </Collapse>
                        </td>
                      </tr>
                      {data.reimbursements !== 0 && (
                        <tr className='tw:border-b tw:border-[color:var(--border)] tw:pb-2'>
                          <td className='tw:text-black tw:flex tw:flex-row tw:justify-start tw:items-start tw:font-normal'>Reimbursements</td>
                          <td className={'tw:font-normal tw:text-right tw:text-black'}>{FormatCurrency(state.currentRegion, data.reimbursements)}</td>
                        </tr>
                      )}
                      <tr>
                        <td className='tw:text-black tw:flex tw:flex-row tw:justify-start tw:items-start tw:font-bold tw:text-[16.25px]'>Expenses</td>
                        <td className={'tw:font-bold tw:text-right tw:text-destructive tw:text-[16.25px]'}>-{FormatCurrency(state.currentRegion, data.totalExpenses)}</td>
                      </tr>
                      <tr className='tw:border-t tw:border-[color:var(--foreground)]'>
                        <td className='tw:font-bold tw:text-[16.25px]'>Net Profit</td>
                        <td className={'tw:font-bold tw:text-[16.25px] tw:text-right ' + (data.grossRevenue - data.totalExpenses >= 0 ? 'tw:text-primary' : 'tw:text-destructive')}>
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
              <CardHeader className='tw:py-3'>
                <h5 className='tw:font-semibold tw:m-0'>Performance Timeline</h5>
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
