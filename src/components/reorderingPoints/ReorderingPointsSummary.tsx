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
    <Row className='mb-2 gap-y-2 gap-x-1'>
      <Col xs={12}>
        <Card className='mb-0'>
          <CardBody className='flex flex-col items-center justify-between gap-1 md:flex-row py-2'>
            <div>
              <p className='capitalize font-semibold mb-0 text-nowrap' style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                Order Summary
              </p>
              <p className='text-[11.2px] m-0 p-0 text-[var(--bs-secondary-color)] mb-1'>
                <span>{`Supplier: `}</span>
                <span className='font-semibold text-black'>{selectedSupplier}</span>
              </p>
            </div>
            <div className='flex flex-row items-center justify-between gap-1 md:gap-0 md:flex-col md:items-start lg:items-center'>
              <span className='text-[var(--bs-secondary-color)] text-[11.2px]'>Total Qty</span>
              <span className='font-semibold text-right'>{FormatIntNumber(state.currentRegion, reorderingPointsOrder.totalQty)}</span>
            </div>
            <div className='flex flex-row items-center justify-between gap-1 md:gap-0 md:flex-col md:items-start lg:items-center'>
              <span className='text-[var(--bs-secondary-color)] text-[11.2px]'>Total Cost</span>
              <span className='font-semibold text-right'>{FormatCurrency(state.currentRegion, reorderingPointsOrder.totalCost)}</span>
            </div>
            <div className='flex flex-row items-center justify-between gap-1 md:gap-0 md:flex-col md:items-start lg:items-center'>
              <span className='text-[var(--bs-secondary-color)] text-[11.2px]'>Total Volume</span>
              <span className='font-semibold text-right'>{`${FormatIntPercentage(state.currentRegion, state.currentRegion === 'us' ? reorderingPointsOrder.totalVolume / 61020 : reorderingPointsOrder.totalVolume / 1000000)} m³`}</span>
            </div>
            {splits.isSplitting && (
              <div className='flex flex-row items-center justify-between gap-4 md:items-start lg:items-center'>
                <div className='flex flex-row items-center justify-between gap-1 md:gap-0 md:flex-col md:items-start lg:items-center'>
                  <span className='text-[var(--bs-secondary-color)] text-[11.2px]'>Total Splits</span>
                  <span className='font-semibold text-right'>{FormatIntNumber(state.currentRegion, splits.splitsQty)}</span>
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
                        <div key={`summarySplit-${splitIndex}`} className='flex flex-row items-center justify-end gap-2'>
                          <span className='text-[var(--bs-secondary-color)] text-[11.2px]'>{splitNames[`${splitIndex}`]}</span>
                          <span className='font-semibold text-right text-[11.2px]'>{`${FormatIntNumber(state.currentRegion, totalSplitQty)} / ${FormatIntPercentage(
                            state.currentRegion,
                            state.currentRegion === 'us' ? totalSplitVolume / 61020 : totalSplitVolume / 1000000
                          )} m³`}</span>
                        </div>
                      )
                    })}
                </div>
              </div>
            )}
            <div className='flex flex-col items-end justify-between gap-0 md:items-end'>
              <Button
                type='button'
                disabled={error.length > 0 || Object.keys(reorderingPointsOrder.products).length === 0 || orderHasSplitswithZeroQty}
                className='text-[11.2px]'
                color='primary'
                onClick={() => setshowPOModal(true)}>
                Create Order
              </Button>
              {error.length > 0 && <p className='text-[11.2px] text-danger m-0 p-0'>Error in some Products</p>}
              {orderHasSplitswithZeroQty && <p className='text-[11.2px] text-danger m-0 p-0'>Products missing splits Qty</p>}
            </div>
          </CardBody>
        </Card>
      </Col>
    </Row>
  )
}

export default memo(ReorderingPointsSummary)
