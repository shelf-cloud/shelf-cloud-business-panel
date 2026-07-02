import { useContext } from 'react'

import AppContext from '@context/AppContext'
import { ExpandedRowProps, useRPProductSales } from '@hooks/reorderingPoints/useRPProductSale'
import { FormatCurrency, FormatIntNumber } from '@lib/FormatNumbers'
import { CleanSpecialCharacters } from '@lib/SkuFormatting'
import { ReorderingPointsProduct } from '@typesTs/reorderingPoints/reorderingPoints'
import { Card, CardBody, CardHeader, Col, Spinner, UncontrolledTooltip } from '@/components/migration-ui'

type Props = {
  data: ReorderingPointsProduct
  expandedRowProps?: ExpandedRowProps
}

const ReorderingPointsSalesDetails = ({ data, expandedRowProps }: Props) => {
  const { state }: any = useContext(AppContext)
  const { session, startDate, endDate } = expandedRowProps!
  const { productSales, isLoadingProductsSales } = useRPProductSales({ session, state, startDate, endDate, sku: data.sku })
  return (
    <Col xs={4}>
      <Card>
        <CardHeader className='tw:py-3'>
          <h5 className='tw:font-semibold tw:m-0'>Product Details</h5>
          <div className='tw:mt-2 tw:flex tw:flex-col tw:justify-start tw:items-start tw:gap-1'>
            <span className='tw:text-[11.2px]'>
              <span className='tw:font-semibold'>{`Unit Volume: `}</span>
              {`${FormatIntNumber(state.currentRegion, data.itemVolume)} ${state.currentRegion === 'us' ? 'in³' : 'cm³'}`}
            </span>
            <span className='tw:text-[11.2px]'>
              <span className='tw:font-semibold'>{`Box Volume: `}</span>
              {`${FormatIntNumber(state.currentRegion, data.itemBoxVolume)} ${state.currentRegion === 'us' ? 'in³' : 'cm³'}`}
            </span>
          </div>
        </CardHeader>
        <CardBody style={{ overflowX: 'scroll', scrollbarWidth: 'none' }}>
          <p className='tw:m-0 tw:p-0 tw:font-bold'>Sales By Marketplaces</p>
          <table className='table table-sm table-border table-nowrap tw:mb-0 tw:text-[11.2px]'>
            <thead>
              <tr>
                <th className='tw:w-fit tw:text-wrap'>Marketplace</th>
                <th className='tw:w-fit tw:text-right'>Gross Revenue</th>
                <th className='tw:w-fit tw:text-right'>Net Profit</th>
                <th className='tw:w-fit tw:text-right'>Units Sold</th>
              </tr>
            </thead>
            {!isLoadingProductsSales && productSales ? (
              <>
                <tbody>
                  {Object.values(productSales[data.sku].marketplaces)
                    .sort((marketpalceA, marketpalceB) => (marketpalceA.totalUnitsSold > marketpalceB.totalUnitsSold ? -1 : 1))
                    .map(
                      (marketplace, index) =>
                        marketplace.totalUnitsSold > 0 && (
                          <tr key={index}>
                            <td className='tw:w-1/2 tw:text-wrap'>{marketplace.name}</td>
                            <td className='tw:text-right tw:align-bottom'>{FormatCurrency(state.currentRegion, marketplace.grossRevenue)}</td>
                            <td className='tw:text-right tw:align-bottom'>{FormatCurrency(state.currentRegion, marketplace.grossRevenue - marketplace.expenses)}</td>
                            <td className='tw:text-center tw:align-bottom'>{FormatIntNumber(state.currentRegion, marketplace.totalUnitsSold)}</td>
                          </tr>
                        )
                    )}
                </tbody>
                <tfoot>
                  <tr>
                    <td className='tw:font-bold tw:text-right'>Total</td>
                    <td className='tw:text-right'>{FormatCurrency(state.currentRegion, productSales[data.sku].grossRevenue)}</td>
                    <td className='tw:text-right'>
                      <i className='tw:text-[13px] tw:me-1 tw:text-primary las la-info-circle' style={{ cursor: 'pointer' }} id={`salesTotalMsj${CleanSpecialCharacters(data.sku)}`} />
                      <UncontrolledTooltip
                        placement='top'
                        target={`salesTotalMsj${CleanSpecialCharacters(data.sku)}`}
                        innerClassName='tw:bg-white tw:border tw:border-[color-mix(in_srgb,var(--info)_50%,transparent)] tw:p-2'>
                        <p className='tw:text-[11.2px] tw:text-primary tw:m-0 tw:p-0 tw:mb-0'>{`Storage Cost: ${FormatCurrency(state.currentRegion, productSales[data.sku].storageCost)}`}</p>
                      </UncontrolledTooltip>
                      {FormatCurrency(state.currentRegion, productSales[data.sku].grossRevenue - productSales[data.sku].expenses - productSales[data.sku].storageCost)}
                    </td>
                    <td className='tw:text-center'>{FormatIntNumber(state.currentRegion, productSales[data.sku].unitsSold)}</td>
                  </tr>
                </tfoot>
              </>
            ) : (
              <tbody>
                <tr>
                  <td colSpan={4} className='tw:text-center tw:flex tw:justify-center tw:items-center tw:gap-2'>
                    <Spinner color='primary' size={'sm'} />
                    Loading Sales...
                  </td>
                </tr>
              </tbody>
            )}
          </table>
        </CardBody>
      </Card>
    </Col>
  )
}

export default ReorderingPointsSalesDetails
