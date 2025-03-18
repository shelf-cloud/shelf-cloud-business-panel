import { Splits } from '@components/modals/reorderingPoints/ReorderingPointsCreatePOModal'
import AppContext from '@context/AppContext'
import { SplitNames } from '@hooks/reorderingPoints/useRPSplits'
import { FormatCurrency, FormatIntNumber, FormatIntPercentage } from '@lib/FormatNumbers'
import { ReorderingPointsProduct } from '@typesTs/reorderingPoints/reorderingPoints'
import React, { memo, useContext } from 'react'
import { Button, Card, CardBody, Col, Row } from 'reactstrap'

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
    <Row className='mb-2 gy-2 gx-1'>
      <Col xs={12}>
        <Card className='mb-0'>
          <CardBody className='d-flex flex-column align-items-center justify-content-between gap-1 flex-md-row py-2'>
            <div>
              <p className='text-capitalize fw-semibold mb-0  text-nowrap' style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                Order Summary
              </p>
              <p className='fs-7 m-0 p-0 text-muted mb-1'>
                <span>{`Supplier: `}</span>
                <span className='fw-semibold text-dark'>{selectedSupplier}</span>
              </p>
            </div>
            <div className='d-flex flex-row align-items-center justify-content-between gap-1 gap-md-0 flex-md-column align-items-md-start align-items-lg-center'>
              <span className='text-muted fs-7'>Total Qty</span>
              <span className='fw-semibold text-end'>{FormatIntNumber(state.currentRegion, reorderingPointsOrder.totalQty)}</span>
            </div>
            <div className='d-flex flex-row align-items-center justify-content-between gap-1 gap-md-0 flex-md-column align-items-md-start align-items-lg-center'>
              <span className='text-muted fs-7'>Total Cost</span>
              <span className='fw-semibold text-end'>{FormatCurrency(state.currentRegion, reorderingPointsOrder.totalCost)}</span>
            </div>
            <div className='d-flex flex-row align-items-center justify-content-between gap-1 gap-md-0 flex-md-column align-items-md-start align-items-lg-center'>
              <span className='text-muted fs-7'>Total Volume</span>
              <span className='fw-semibold text-end'>{`${FormatIntPercentage(state.currentRegion, state.currentRegion === 'us' ? reorderingPointsOrder.totalVolume / 61020 : reorderingPointsOrder.totalVolume / 1000000)} m³`}</span>
            </div>
            {splits.isSplitting && (
              <div className='d-flex flex-row align-items-center justify-content-between gap-3 align-items-md-start align-items-lg-center'>
                <div className='d-flex flex-row align-items-center justify-content-between gap-1 gap-md-0 flex-md-column align-items-md-start align-items-lg-center'>
                  <span className='text-muted fs-7'>Total Splits</span>
                  <span className='fw-semibold text-end'>{FormatIntNumber(state.currentRegion, splits.splitsQty)}</span>
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
                        <div key={`summarySplit-${splitIndex}`} className='d-flex flex-row align-items-center justify-content-end gap-2'>
                          <span className='text-muted fs-7'>{splitNames[`${splitIndex}`]}</span>
                          <span className='fw-semibold text-end fs-7'>{`${FormatIntNumber(state.currentRegion, totalSplitQty)} / ${FormatIntPercentage(
                            state.currentRegion,
                            state.currentRegion === 'us' ? totalSplitVolume / 61020 : totalSplitVolume / 1000000
                          )} m³`}</span>
                        </div>
                      )
                    })}
                </div>
              </div>
            )}
            <div className='d-flex flex-column align-items-end justify-content-between gap-0 align-items-md-end '>
              <Button type='button' disabled={error.length > 0 || Object.keys(reorderingPointsOrder.products).length === 0 || orderHasSplitswithZeroQty} className='fs-7' color='primary' onClick={() => setshowPOModal(true)}>
                Create Order
              </Button>
              {error.length > 0 && <p className='fs-7 text-danger m-0 p-0'>Error in some Products</p>}
              {orderHasSplitswithZeroQty && <p className='fs-7 text-danger m-0 p-0'>Products missing splits Qty</p>}
            </div>
          </CardBody>
        </Card>
      </Col>
    </Row>
  )
}

export default memo(ReorderingPointsSummary)
