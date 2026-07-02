import { memo, useContext } from 'react'

import { Splits } from '@components/modals/reorderingPoints/ReorderingPointsCreatePOModal'
import AppContext from '@context/AppContext'
import { SplitNames } from '@hooks/reorderingPoints/useRPSplits'
import { FormatCurrency, FormatIntNumber, FormatIntPercentage } from '@lib/FormatNumbers'
import { ReorderingPointsProduct } from '@typesTs/reorderingPoints/reorderingPoints'
import { Button, Card, CardBody, Col, Row } from '@/components/migration-ui'

type Props = {
  reorderingPointsOrder: {
    totalQty: number
    totalCost: number
    totalVolume: number
    products: { [key: string]: ReorderingPointsProduct }
  }
  selectedSupplier: string
  error: string[]
  orderHasSplitswithZeroQty: boolean
  setshowPOModal: (show: boolean) => void
  splits: Splits
  splitNames: SplitNames
}

const ReorderingPointsSummary = ({ reorderingPointsOrder, selectedSupplier, error, orderHasSplitswithZeroQty, setshowPOModal, splits, splitNames }: Props) => {
  const { state }: any = useContext(AppContext)
  return (
    <Row className='tw:mb-2 tw:gap-y-2 tw:gap-x-1'>
      <Col xs={12}>
        <Card className='tw:mb-0'>
          <CardBody className='tw:flex tw:flex-col tw:items-center tw:justify-between tw:gap-1 tw:md:flex-row tw:py-2'>
            <div>
              <p className='tw:capitalize tw:font-semibold tw:mb-0 tw:text-nowrap' style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                Order Summary
              </p>
              <p className='tw:text-[11.2px] tw:m-0 tw:p-0 tw:text-[var(--bs-secondary-color)] tw:mb-1'>
                <span>{`Supplier: `}</span>
                <span className='tw:font-semibold tw:text-black'>{selectedSupplier}</span>
              </p>
            </div>
            <div className='tw:flex tw:flex-row tw:items-center tw:justify-between tw:gap-1 tw:md:gap-0 tw:md:flex-col tw:md:items-start tw:lg:items-center'>
              <span className='tw:text-[var(--bs-secondary-color)] tw:text-[11.2px]'>Total Qty</span>
              <span className='tw:font-semibold tw:text-right'>{FormatIntNumber(state.currentRegion, reorderingPointsOrder.totalQty)}</span>
            </div>
            <div className='tw:flex tw:flex-row tw:items-center tw:justify-between tw:gap-1 tw:md:gap-0 tw:md:flex-col tw:md:items-start tw:lg:items-center'>
              <span className='tw:text-[var(--bs-secondary-color)] tw:text-[11.2px]'>Total Cost</span>
              <span className='tw:font-semibold tw:text-right'>{FormatCurrency(state.currentRegion, reorderingPointsOrder.totalCost)}</span>
            </div>
            <div className='tw:flex tw:flex-row tw:items-center tw:justify-between tw:gap-1 tw:md:gap-0 tw:md:flex-col tw:md:items-start tw:lg:items-center'>
              <span className='tw:text-[var(--bs-secondary-color)] tw:text-[11.2px]'>Total Volume</span>
              <span className='tw:font-semibold tw:text-right'>{`${FormatIntPercentage(state.currentRegion, state.currentRegion === 'us' ? reorderingPointsOrder.totalVolume / 61020 : reorderingPointsOrder.totalVolume / 1000000)} m³`}</span>
            </div>
            {splits.isSplitting && (
              <div className='tw:flex tw:flex-row tw:items-center tw:justify-between tw:gap-4 tw:md:items-start tw:lg:items-center'>
                <div className='tw:flex tw:flex-row tw:items-center tw:justify-between tw:gap-1 tw:md:gap-0 tw:md:flex-col tw:md:items-start tw:lg:items-center'>
                  <span className='tw:text-[var(--bs-secondary-color)] tw:text-[11.2px]'>Total Splits</span>
                  <span className='tw:font-semibold tw:text-right'>{FormatIntNumber(state.currentRegion, splits.splitsQty)}</span>
                </div>
                <div>
                  {Array(splits.splitsQty)
                    .fill(0)
                    .map((_, splitIndex) => {
                      const totalSplitQty = Object.values(reorderingPointsOrder.products).reduce((acc, product) => {
                        const splitQty = product.orderAdjusted ? product.orderSplits[`${splitIndex}`]?.orderAdjusted || 0 : product.orderSplits[`${splitIndex}`]?.order || 0
                        return acc + splitQty
                      }, 0)
                      const totalSplitVolume = Object.values(reorderingPointsOrder.products).reduce((acc, product) => {
                        const splitQty = product.orderAdjusted ? product.orderSplits[`${splitIndex}`]?.orderAdjusted || 0 : product.orderSplits[`${splitIndex}`]?.order || 0
                        const splitVolume = product.itemVolume * splitQty
                        return acc + splitVolume
                      }, 0)
                      return (
                        <div key={`summarySplit-${splitIndex}`} className='tw:flex tw:flex-row tw:items-center tw:justify-end tw:gap-2'>
                          <span className='tw:text-[var(--bs-secondary-color)] tw:text-[11.2px]'>{splitNames[`${splitIndex}`]}</span>
                          <span className='tw:font-semibold tw:text-right tw:text-[11.2px]'>{`${FormatIntNumber(state.currentRegion, totalSplitQty)} / ${FormatIntPercentage(
                            state.currentRegion,
                            state.currentRegion === 'us' ? totalSplitVolume / 61020 : totalSplitVolume / 1000000
                          )} m³`}</span>
                        </div>
                      )
                    })}
                </div>
              </div>
            )}
            <div className='tw:flex tw:flex-col tw:items-end tw:justify-between tw:gap-0 tw:md:items-end'>
              <Button
                type='button'
                disabled={error.length > 0 || Object.keys(reorderingPointsOrder.products).length === 0 || orderHasSplitswithZeroQty}
                className='tw:text-[11.2px]'
                color='primary'
                onClick={() => setshowPOModal(true)}>
                Create Order
              </Button>
              {error.length > 0 && <p className='tw:text-[11.2px] tw:text-danger tw:m-0 tw:p-0'>Error in some Products</p>}
              {orderHasSplitswithZeroQty && <p className='tw:text-[11.2px] tw:text-danger tw:m-0 tw:p-0'>Products missing splits Qty</p>}
            </div>
          </CardBody>
        </Card>
      </Col>
    </Row>
  )
}

export default memo(ReorderingPointsSummary)
