/* eslint-disable @next/next/no-img-element */
import Link from 'next/link'
import { useContext, useEffect, useMemo, useState } from 'react'

// import Animation from '@components/Common/Animation'
import AppContext from '@context/AppContext'
import { FormatCurrency, FormatIntNumber } from '@lib/FormatNumbers'
import { CleanSpecialCharacters } from '@lib/SkuFormatting'
import { OrderRowType, ShipmentOrderItem } from '@typings'
import { Button, Card, CardBody, CardHeader, Col, Row } from '@/components/migration-ui'

import { NoImageAdress } from '@/lib/assetsConstants'

import TooltipComponent from '../constants/Tooltip'
import Confirm_Delete_Item_From_Receiving from '../modals/receivings/Confirm_Delete_Item_From_Receiving'
import CopyTextToClipboard from '../ui/CopyTextToClipboard'
import AddSkuToManualReceivingLog from './AddSkuToManualReceivingLog'
import EditManualReceivingLog from './EditManualReceivingLog'

// import dynamic from 'next/dynamic';
// const Animation = dynamic(() => import('@components/Common/Animation'), {
//     ssr: false
// });

type Props = {
  data: OrderRowType
  mutateReceivings?: () => void
}

export type DeleteSKUFromReceivingModalType = {
  show: boolean
  orderId: number
  orderNumber: string
  sku: string
  title: string
  poNumber: string
  poId: number
  isReceivingFromPo: boolean
}

type ProductsSortKey = 'sku' | 'available' | 'quantity' | 'qtyReceived'
type ProductsSortDirection = 'asc' | 'desc'
type ProductsSortState = {
  key: ProductsSortKey | null
  direction: ProductsSortDirection
}

const ReceivingType = ({ data, mutateReceivings }: Props) => {
  const { state }: any = useContext(AppContext)
  const [serviceFee, setServiceFee] = useState('')
  const [productsSort, setProductsSort] = useState<ProductsSortState>({ key: null, direction: 'asc' })

  const [deleteSKUModal, setDeleteSKUModal] = useState<DeleteSKUFromReceivingModalType>({
    show: false,
    orderId: 0,
    orderNumber: '',
    sku: '',
    title: '',
    poNumber: '',
    poId: 0,
    isReceivingFromPo: false,
  })

  const [showEditOrderQty, setshowEditOrderQty] = useState({
    show: false,
    receivingId: 0,
    orderNumber: '',
    receivingItems: [] as ShipmentOrderItem[],
  })

  const [addSkuToReceiving, setAddSkuToReceiving] = useState({
    show: false,
    receivingId: 0,
    orderNumber: '',
    receivingItems: [] as string[],
  })

  useEffect(() => {
    if (data.chargesFees) {
      switch (data.carrierService) {
        case '20HQ-P':
          setServiceFee(`${data.carrierService} - ${FormatCurrency(state.currentRegion, data.chargesFees['20HQ-P']!)}`)
          break
        case '40HQ-P':
          setServiceFee(`${data.carrierService} - ${FormatCurrency(state.currentRegion, data.chargesFees['40HQ-P']!)}`)
          break
        case '20HQ-FL':
          setServiceFee(`${data.carrierService} - ${FormatCurrency(state.currentRegion, data.chargesFees['20HQ-FL']!)}`)
          break
        case '40HQ-FL':
          setServiceFee(`${data.carrierService} - ${FormatCurrency(state.currentRegion, data.chargesFees['40HQ-FL']!)}`)
          break
        case 'Pallets':
          setServiceFee(`${data.carrierService} - ${FormatCurrency(state.currentRegion, data.chargesFees.receivingPallets!)} per pallet`)
          break
        case 'Parcel':
          setServiceFee(`${data.carrierService} - ${FormatCurrency(state.currentRegion, data.chargesFees.parcelBoxCost!)} per box`)
          break
        default:
          setServiceFee(`Type of service...`)
      }
    }

    return () => {
      setServiceFee('')
    }
  }, [data, state.currentRegion])

  const OrderId = CleanSpecialCharacters(data.orderId!)
  const hasPONumber = useMemo(() => data.orderItems.some((product: ShipmentOrderItem) => Boolean(product.poNumber)), [data.orderItems])
  const sortedOrderItems = useMemo(() => {
    if (!productsSort.key) return data.orderItems

    const sortKey = productsSort.key
    const directionMultiplier = productsSort.direction === 'asc' ? 1 : -1

    return [...data.orderItems].sort((productA: ShipmentOrderItem, productB: ShipmentOrderItem) => {
      if (sortKey === 'sku') {
        return (productA.sku ?? '').localeCompare(productB.sku ?? '') * directionMultiplier
      }

      return (Number(productA[sortKey] ?? 0) - Number(productB[sortKey] ?? 0)) * directionMultiplier
    })
  }, [data.orderItems, productsSort.direction, productsSort.key])

  const handleProductsSort = (key: ProductsSortKey) => {
    setProductsSort((currentSort) => ({
      key,
      direction: currentSort.key === key && currentSort.direction === 'asc' ? 'desc' : 'asc',
    }))
  }

  const getProductsSortLabel = (key: ProductsSortKey) => {
    if (productsSort.key !== key) return 'Sort'

    return productsSort.direction === 'asc' ? 'Sorted ascending' : 'Sorted descending'
  }

  const getProductsSortIcon = (key: ProductsSortKey) => {
    if (productsSort.key !== key) return 'ri-arrow-up-down-line'

    return productsSort.direction === 'asc' ? 'ri-arrow-up-s-line' : 'ri-arrow-down-s-line'
  }

  const getProductsAriaSort = (key: ProductsSortKey) => {
    if (productsSort.key !== key) return 'none'

    return productsSort.direction === 'asc' ? 'ascending' : 'descending'
  }

  const renderSortableHeader = (key: ProductsSortKey, label: string, className = '') => (
    <button
      type='button'
      className={`tw:p-0 tw:border-0 tw:no-underline tw:text-dark tw:font-semibold tw:text-[11.2px] tw:inline-flex tw:items-center tw:gap-1 ${className}`}
      aria-label={`${getProductsSortLabel(key)} by ${label}`}
      onClick={() => handleProductsSort(key)}>
      <span>{label}</span>
      <i className={`${getProductsSortIcon(key)} tw:text-[13px] tw:leading-none`} aria-hidden='true' />
    </button>
  )

  return (
    <div style={{ backgroundColor: '#F0F4F7', padding: '10px' }}>
      <Row>
        <Col sm={3}>
          <Col sm={12}>
            <Card>
              <CardHeader className='tw:py-2'>
                <h5 className='tw:font-semibold tw:m-0'>Receiving Details</h5>
              </CardHeader>
              <CardBody>
                <table className='tw:w-full tw:[&_th]:px-2 tw:[&_th]:py-1 tw:[&_td]:px-2 tw:[&_td]:py-1'>
                  <tbody className='tw:text-[11.2px]'>
                    <tr>
                      <td className='tw:text-[var(--bs-secondary-color)] tw:text-nowrap'>Type of Service:</td>
                      <td className='tw:font-semibold tw:w-full'>{data.carrierService}</td>
                    </tr>
                    <tr>
                      <td className='tw:text-[var(--bs-secondary-color)] tw:text-nowrap'># Of Pallets:</td>
                      <td className='tw:font-semibold tw:w-full'>{data.numberPallets}</td>
                    </tr>
                    <tr>
                      <td className='tw:text-[var(--bs-secondary-color)] tw:text-nowrap'># Of Boxes:</td>
                      <td className='tw:font-semibold tw:w-full'>{data.numberBoxes}</td>
                    </tr>
                    <tr>
                      <td className='tw:text-[var(--bs-secondary-color)] tw:text-nowrap'>Shrink Wrap:</td>
                      <td className='tw:font-semibold tw:w-full'>{data.shrinkWrap}</td>
                    </tr>
                    <tr>
                      <td className='tw:text-[var(--bs-secondary-color)] tw:text-nowrap'>Man Hours:</td>
                      <td className='tw:font-semibold tw:w-full'>{data.manHours}</td>
                    </tr>
                  </tbody>
                </table>
              </CardBody>
            </Card>
          </Col>
          <Col sm={12}>
            <Card>
              <CardHeader className='tw:py-2'>
                <h5 className='tw:font-semibold tw:m-0'>Charge Details</h5>
              </CardHeader>
              <CardBody>
                <table className='tw:w-full tw:whitespace-nowrap tw:mb-0 tw:[&_th]:px-2 tw:[&_th]:py-1 tw:[&_td]:px-2 tw:[&_td]:py-1'>
                  <tbody className='tw:text-[11.2px]'>
                    <tr className='tw:border-b tw:border-[color:var(--border)] tw:pb-2'>
                      <td className='tw:text-[var(--bs-secondary-color)] tw:flex tw:flex-row tw:justify-start tw:items-start'>
                        Service
                        {data.chargesFees && (
                          <>
                            <i className='ri-information-fill tw:ms-1 fs-6 tw:text-[var(--bs-secondary-color)]' id={`tooltipService${OrderId}`}></i>
                            <TooltipComponent target={`tooltipService${OrderId}`} text={serviceFee} />
                          </>
                        )}
                      </td>
                      <td className='tw:font-semibold tw:text-end'>{FormatCurrency(state.currentRegion, data.receivingService!)}</td>
                    </tr>
                    <tr className='tw:border-b tw:border-[color:var(--border)] tw:pb-2'>
                      <td className='tw:text-[var(--bs-secondary-color)]'>
                        Pallets
                        {data.chargesFees && (
                          <>
                            <i className='ri-information-fill tw:ms-1 fs-6 tw:text-[var(--bs-secondary-color)]' id={`tooltipPallet${OrderId}`}></i>
                            <TooltipComponent
                              target={`tooltipPallet${OrderId}`}
                              text={`${FormatCurrency(state.currentRegion, data.chargesFees.receivingPalletCost!)} per pallet`}
                            />
                          </>
                        )}
                      </td>
                      <td className='tw:font-semibold tw:text-end'>{FormatCurrency(state.currentRegion, data.receivingPallets!)}</td>
                    </tr>
                    <tr className='tw:border-b tw:border-[color:var(--border)] tw:pb-2'>
                      <td className='tw:text-[var(--bs-secondary-color)] tw:flex tw:flex-row tw:justify-start tw:items-start'>
                        Wrap Service
                        {data.chargesFees && (
                          <>
                            <i className='ri-information-fill tw:ms-1 fs-6 tw:text-[var(--bs-secondary-color)]' id={`tooltipWrap${OrderId}`}></i>
                            <TooltipComponent target={`tooltipWrap${OrderId}`} text={`${FormatCurrency(state.currentRegion, data.chargesFees.receivingWrapService!)} per wrap`} />
                          </>
                        )}
                      </td>
                      <td className='tw:font-semibold tw:text-end'>{FormatCurrency(state.currentRegion, data.receivingWrapService!)}</td>
                    </tr>
                    <tr className='tw:border-b tw:border-[color:var(--border)] tw:pb-2'>
                      <td className='tw:text-[var(--bs-secondary-color)] tw:flex tw:flex-row tw:justify-start tw:items-start'>
                        Man Hour
                        {data.chargesFees && (
                          <>
                            <i className='ri-information-fill tw:ms-1 fs-6 tw:text-[var(--bs-secondary-color)]' id={`tooltipHour${OrderId}`}></i>
                            <TooltipComponent target={`tooltipHour${OrderId}`} text={`${FormatCurrency(state.currentRegion, data.chargesFees.receivingManHour!)} per hour`} />
                          </>
                        )}
                      </td>
                      <td className='tw:font-semibold tw:text-end'>{FormatCurrency(state.currentRegion, data.manHour!)}</td>
                    </tr>
                    <tr className='tw:border-b tw:border-[color:var(--border)] tw:pb-2'>
                      <td className='tw:text-[var(--bs-secondary-color)]'>Extra Charge</td>
                      <td className='tw:font-semibold tw:text-end'>{FormatCurrency(state.currentRegion, data.extraCharge!)}</td>
                    </tr>
                    <tr>
                      <td className='tw:font-bold'>TOTAL</td>
                      <td className='tw:text-primary tw:font-semibold tw:text-end'>{FormatCurrency(state.currentRegion, data.totalCharge!)}</td>
                    </tr>
                  </tbody>
                </table>
              </CardBody>
            </Card>
          </Col>
          {data.extraComment != '' && (
            <Col sm={12}>
              <Card>
                <CardHeader className='tw:py-4'>
                  <h5 className='tw:font-semibold tw:m-0'>Order Comment</h5>
                </CardHeader>
                <CardBody>
                  <p>{data.extraComment}</p>
                </CardBody>
              </Card>
            </Col>
          )}
        </Col>
        <Col sm={9}>
          <Card className='tw:mb-4'>
            <CardHeader className='tw:py-2 tw:flex tw:flex-row tw:justify-between'>
              <h5 className='tw:font-semibold tw:m-0'>Products</h5>
            </CardHeader>
            <CardBody>
              <div className='tw:overflow-x-auto'>
                <table className='tw:w-full tw:align-middle tw:mb-0 tw:[&_th]:px-2 tw:[&_th]:py-1 tw:[&_td]:px-2 tw:[&_td]:py-1'>
                  <thead className='tw:bg-[color:var(--vz-light)] tw:text-[11.2px]'>
                    <tr>
                      <th scope='col' className='tw:text-center'>
                        Image
                      </th>
                      <th scope='col'>Title</th>
                      {hasPONumber && <th scope='col'>PO</th>}
                      <th scope='col' aria-sort={getProductsAriaSort('sku')}>
                        {renderSortableHeader('sku', 'Sku')}
                      </th>
                      <th className='tw:text-center' scope='col' aria-sort={getProductsAriaSort('available')}>
                        {renderSortableHeader('available', 'Available', 'tw:justify-center')}
                      </th>
                      <th className='tw:text-center' scope='col' aria-sort={getProductsAriaSort('quantity')}>
                        {renderSortableHeader('quantity', 'Qty', 'tw:justify-center')}
                      </th>
                      <th className='tw:text-center' scope='col' aria-sort={getProductsAriaSort('qtyReceived')}>
                        {renderSortableHeader('qtyReceived', 'Qty Received', 'tw:justify-center')}
                      </th>
                      {!data.boxes && <th></th>}
                    </tr>
                  </thead>
                  <tbody className='tw:text-[11.2px]'>
                    {sortedOrderItems.map((product: ShipmentOrderItem, key) => (
                      <tr key={`${product.orderItemId || product.sku}-${product.splitId ?? key}`} className='tw:border-b tw:border-[color:var(--border)] tw:py-2 tw:w-full'>
                        <td className='tw:text-center'>
                          <Link href={`/product/${product.inventoryId}/${product.sku}`} tabIndex={-1} target='blank' rel='noopener noreferrer' className='tw:!text-black'>
                            <div
                              style={{
                                width: '100%',
                                maxWidth: '40px',
                                height: '30px',
                                margin: '2px 2px',
                                position: 'relative',
                              }}>
                              <img
                                loading='lazy'
                                src={product.image ? product.image : NoImageAdress}
                                onError={(e) => (e.currentTarget.src = NoImageAdress)}
                                alt='product Image'
                                style={{ objectFit: 'contain', objectPosition: 'center', width: '100%', height: '100%' }}
                              />
                            </div>
                          </Link>
                        </td>
                        <td className='tw:font-semibold'>
                          <Link href={`/product/${product.inventoryId}/${product.sku}`} tabIndex={-1} target='blank' rel='noopener noreferrer' className='tw:!text-black'>
                            {product.name}
                          </Link>
                        </td>
                        {hasPONumber && <td className='tw:font-normal tw:text-nowrap'>{product.poNumber || ''}</td>}
                        <td className='tw:text-[var(--bs-secondary-color)]'>
                          <div className='tw:flex tw:flex-row tw:justify-start tw:items-center tw:gap-1'>
                            <Link href={`/product/${product.inventoryId}/${product.sku}`} tabIndex={-1} target='blank' rel='noopener noreferrer' className='tw:!text-black'>
                              {product.sku}
                            </Link>
                            <CopyTextToClipboard text={product.sku} label='SKU' />
                          </div>
                        </td>
                        <td className='tw:text-center'>{FormatIntNumber(state.currentRegion, Number(product.available))}</td>
                        <td className='tw:text-center'>{FormatIntNumber(state.currentRegion, Number(product.quantity))}</td>
                        <td className='tw:text-center'>{FormatIntNumber(state.currentRegion, Number(product.qtyReceived))}</td>
                        {!data.boxes && (
                          <td>
                            {(data.orderStatus == 'awaiting' || data.orderStatus == 'awaiting_shipment') && product.qtyReceived! <= 0 && (
                              <i
                                className='tw:text-[16.25px] tw:text-destructive las la-trash-alt'
                                style={{ cursor: 'pointer' }}
                                onClick={() =>
                                  setDeleteSKUModal({
                                    show: true,
                                    orderId: data.id,
                                    orderNumber: data.orderNumber,
                                    sku: product.sku,
                                    title: product.name,
                                    poNumber: product.poNumber ? product.poNumber : '',
                                    poId: product.poId ? product.poId : 0,
                                    isReceivingFromPo: data.isReceivingFromPo ? true : false,
                                  })
                                }
                              />
                            )}
                          </td>
                        )}
                      </tr>
                    ))}
                    <tr>
                      <td></td>
                      <td></td>
                      {hasPONumber && <td></td>}
                      <td></td>
                      <td className='tw:text-center tw:text-[13px] tw:font-bold tw:text-nowrap'>Total</td>
                      <td className='tw:text-center tw:font-semibold tw:text-[13px] tw:text-primary'>{FormatIntNumber(state.currentRegion, Number(data.totalItems))}</td>
                      <td className='tw:text-center tw:font-semibold tw:text-[13px] tw:text-primary'>{FormatIntNumber(state.currentRegion, Number(data.totalReceivedItems))}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardBody>
          </Card>
          <Row className='tw:mb-2'>
            <Col sm={12} className='tw:flex tw:flex-row tw:justify-end tw:items-end'>
              <div className='tw:m-0 tw:flex tw:flex-row tw:justify-end tw:items-end tw:gap-2'>
                {!data.isReceivingFromPo && data.orderStatus !== 'received' && (
                  <a href={data.proofOfShipped} target='blank' rel='noopener noreferrer'>
                    <Button color='info'>
                      <i className='las la-truck label-icon align-middle fs-5 tw:me-2' />
                      Proof Of Received
                    </Button>
                  </a>
                )}
              </div>
            </Col>
          </Row>
        </Col>
      </Row>
      {deleteSKUModal.show && <Confirm_Delete_Item_From_Receiving deleteSKUModal={deleteSKUModal} setDeleteSKUModal={setDeleteSKUModal} mutateReceivings={mutateReceivings} />}
      {showEditOrderQty.show && <EditManualReceivingLog showEditOrderQty={showEditOrderQty} setshowEditOrderQty={setshowEditOrderQty} mutateReceivings={mutateReceivings} />}
      {addSkuToReceiving.show && (
        <AddSkuToManualReceivingLog addSkuToReceiving={addSkuToReceiving} setshowAddSkuToManualReceiving={setAddSkuToReceiving} mutateReceivings={mutateReceivings} />
      )}
    </div>
  )
}

export default ReceivingType
