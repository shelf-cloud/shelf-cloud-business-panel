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
        <CardHeader className='py-3'>
          <h5 className='font-semibold m-0'>Product Details</h5>
          <div className='mt-2 flex flex-col justify-start items-start gap-1'>
            <span className='text-[11.2px]'>
              <span className='font-semibold'>{`Unit Volume: `}</span>
              {`${FormatIntNumber(state.currentRegion, data.itemVolume)} ${state.currentRegion === 'us' ? 'in³' : 'cm³'}`}
            </span>
            <span className='text-[11.2px]'>
              <span className='font-semibold'>{`Box Volume: `}</span>
              {`${FormatIntNumber(state.currentRegion, data.itemBoxVolume)} ${state.currentRegion === 'us' ? 'in³' : 'cm³'}`}
            </span>
          </div>
        </CardHeader>
        <CardBody style={{ overflowX: 'scroll', scrollbarWidth: 'none' }}>
          <p className='m-0 p-0 font-bold'>Sales By Marketplaces</p>
          <table className='table table-sm table-border table-nowrap mb-0 text-[11.2px]'>
            <thead>
              <tr>
                <th className='w-fit text-wrap'>Marketplace</th>
                <th className='w-fit text-right'>Gross Revenue</th>
                <th className='w-fit text-right'>Net Profit</th>
                <th className='w-fit text-right'>Units Sold</th>
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
                            <td className='w-1/2 text-wrap'>{marketplace.name}</td>
                            <td className='text-right align-bottom'>{FormatCurrency(state.currentRegion, marketplace.grossRevenue)}</td>
                            <td className='text-right align-bottom'>{FormatCurrency(state.currentRegion, marketplace.grossRevenue - marketplace.expenses)}</td>
                            <td className='text-center align-bottom'>{FormatIntNumber(state.currentRegion, marketplace.totalUnitsSold)}</td>
                          </tr>
                        )
                    )}
                </tbody>
                <tfoot>
                  <tr>
                    <td className='font-bold text-right'>Total</td>
                    <td className='text-right'>{FormatCurrency(state.currentRegion, productSales[data.sku].grossRevenue)}</td>
                    <td className='text-right'>
                      <i className='text-[13px] me-1 text-primary las la-info-circle' style={{ cursor: 'pointer' }} id={`salesTotalMsj${CleanSpecialCharacters(data.sku)}`} />
                      <UncontrolledTooltip
                        placement='top'
                        target={`salesTotalMsj${CleanSpecialCharacters(data.sku)}`}
                        innerClassName='bg-white border border-[color-mix(in_srgb,var(--info)_50%,transparent)] p-2'>
                        <p className='text-[11.2px] text-primary m-0 p-0 mb-0'>{`Storage Cost: ${FormatCurrency(state.currentRegion, productSales[data.sku].storageCost)}`}</p>
                      </UncontrolledTooltip>
                      {FormatCurrency(state.currentRegion, productSales[data.sku].grossRevenue - productSales[data.sku].expenses - productSales[data.sku].storageCost)}
                    </td>
                    <td className='text-center'>{FormatIntNumber(state.currentRegion, productSales[data.sku].unitsSold)}</td>
                  </tr>
                </tfoot>
              </>
            ) : (
              <tbody>
                <tr>
                  <td colSpan={4} className='text-center flex justify-center items-center gap-2'>
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
