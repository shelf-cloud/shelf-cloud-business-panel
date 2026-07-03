/* eslint-disable @next/next/no-img-element */
import Link from 'next/link'
import { useContext, useEffect, useMemo, useState } from 'react'

// import Animation from '@components/Common/Animation'
import AppContext from '@context/AppContext'
import { FormatCurrency, FormatIntNumber } from '@lib/FormatNumbers'
import { CleanSpecialCharacters } from '@lib/SkuFormatting'
import { OrderRowType, ShipmentOrderItem } from '@typings'
import { Button } from '@shadcn/ui/button'
import { Card, CardContent, CardHeader } from '@shadcn/ui/card'

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
      className={`p-0 border-0 no-underline text-dark font-semibold text-[11.2px] inline-flex items-center gap-1 ${className}`}
      aria-label={`${getProductsSortLabel(key)} by ${label}`}
      onClick={() => handleProductsSort(key)}>
      <span>{label}</span>
      <i className={`${getProductsSortIcon(key)} text-[13px] leading-none`} aria-hidden='true' />
    </button>
  )

  return (
    <div style={{ backgroundColor: '#F0F4F7', padding: '10px' }}>
      <div className='flex flex-wrap -mx-3'>
        <div className='px-3 sm:w-3/12'>
          <div className='px-3 sm:w-full'>
            <Card>
              <CardHeader className='py-2'>
                <h5 className='font-semibold m-0'>Receiving Details</h5>
              </CardHeader>
              <CardContent>
                <table className='w-full [&_th]:px-2 [&_th]:py-1 [&_td]:px-2 [&_td]:py-1'>
                  <tbody className='text-[11.2px]'>
                    <tr>
                      <td className='text-[var(--bs-secondary-color)] text-nowrap'>Type of Service:</td>
                      <td className='font-semibold w-full'>{data.carrierService}</td>
                    </tr>
                    <tr>
                      <td className='text-[var(--bs-secondary-color)] text-nowrap'># Of Pallets:</td>
                      <td className='font-semibold w-full'>{data.numberPallets}</td>
                    </tr>
                    <tr>
                      <td className='text-[var(--bs-secondary-color)] text-nowrap'># Of Boxes:</td>
                      <td className='font-semibold w-full'>{data.numberBoxes}</td>
                    </tr>
                    <tr>
                      <td className='text-[var(--bs-secondary-color)] text-nowrap'>Shrink Wrap:</td>
                      <td className='font-semibold w-full'>{data.shrinkWrap}</td>
                    </tr>
                    <tr>
                      <td className='text-[var(--bs-secondary-color)] text-nowrap'>Man Hours:</td>
                      <td className='font-semibold w-full'>{data.manHours}</td>
                    </tr>
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </div>
          <div className='px-3 sm:w-full'>
            <Card>
              <CardHeader className='py-2'>
                <h5 className='font-semibold m-0'>Charge Details</h5>
              </CardHeader>
              <CardContent>
                <table className='w-full whitespace-nowrap mb-0 [&_th]:px-2 [&_th]:py-1 [&_td]:px-2 [&_td]:py-1'>
                  <tbody className='text-[11.2px]'>
                    <tr className='border-b border-[color:var(--border)] pb-2'>
                      <td className='text-[var(--bs-secondary-color)] flex flex-row justify-start items-start'>
                        Service
                        {data.chargesFees && (
                          <>
                            <i className='ri-information-fill ms-1 text-[13px] text-[var(--bs-secondary-color)]' id={`tooltipService${OrderId}`}></i>
                            <TooltipComponent target={`tooltipService${OrderId}`} text={serviceFee} />
                          </>
                        )}
                      </td>
                      <td className='font-semibold text-end'>{FormatCurrency(state.currentRegion, data.receivingService!)}</td>
                    </tr>
                    <tr className='border-b border-[color:var(--border)] pb-2'>
                      <td className='text-[var(--bs-secondary-color)]'>
                        Pallets
                        {data.chargesFees && (
                          <>
                            <i className='ri-information-fill ms-1 text-[13px] text-[var(--bs-secondary-color)]' id={`tooltipPallet${OrderId}`}></i>
                            <TooltipComponent
                              target={`tooltipPallet${OrderId}`}
                              text={`${FormatCurrency(state.currentRegion, data.chargesFees.receivingPalletCost!)} per pallet`}
                            />
                          </>
                        )}
                      </td>
                      <td className='font-semibold text-end'>{FormatCurrency(state.currentRegion, data.receivingPallets!)}</td>
                    </tr>
                    <tr className='border-b border-[color:var(--border)] pb-2'>
                      <td className='text-[var(--bs-secondary-color)] flex flex-row justify-start items-start'>
                        Wrap Service
                        {data.chargesFees && (
                          <>
                            <i className='ri-information-fill ms-1 text-[13px] text-[var(--bs-secondary-color)]' id={`tooltipWrap${OrderId}`}></i>
                            <TooltipComponent target={`tooltipWrap${OrderId}`} text={`${FormatCurrency(state.currentRegion, data.chargesFees.receivingWrapService!)} per wrap`} />
                          </>
                        )}
                      </td>
                      <td className='font-semibold text-end'>{FormatCurrency(state.currentRegion, data.receivingWrapService!)}</td>
                    </tr>
                    <tr className='border-b border-[color:var(--border)] pb-2'>
                      <td className='text-[var(--bs-secondary-color)] flex flex-row justify-start items-start'>
                        Man Hour
                        {data.chargesFees && (
                          <>
                            <i className='ri-information-fill ms-1 text-[13px] text-[var(--bs-secondary-color)]' id={`tooltipHour${OrderId}`}></i>
                            <TooltipComponent target={`tooltipHour${OrderId}`} text={`${FormatCurrency(state.currentRegion, data.chargesFees.receivingManHour!)} per hour`} />
                          </>
                        )}
                      </td>
                      <td className='font-semibold text-end'>{FormatCurrency(state.currentRegion, data.manHour!)}</td>
                    </tr>
                    <tr className='border-b border-[color:var(--border)] pb-2'>
                      <td className='text-[var(--bs-secondary-color)]'>Extra Charge</td>
                      <td className='font-semibold text-end'>{FormatCurrency(state.currentRegion, data.extraCharge!)}</td>
                    </tr>
                    <tr>
                      <td className='font-bold'>TOTAL</td>
                      <td className='text-primary font-semibold text-end'>{FormatCurrency(state.currentRegion, data.totalCharge!)}</td>
                    </tr>
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </div>
          {data.extraComment != '' && (
            <div className='px-3 sm:w-full'>
              <Card>
                <CardHeader className='py-4'>
                  <h5 className='font-semibold m-0'>Order Comment</h5>
                </CardHeader>
                <CardContent>
                  <p>{data.extraComment}</p>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
        <div className='px-3 sm:w-9/12'>
          <Card className='mb-4'>
            <CardHeader className='py-2 flex flex-row justify-between'>
              <h5 className='font-semibold m-0'>Products</h5>
            </CardHeader>
            <CardContent>
              <div className='overflow-x-auto'>
                <table className='w-full align-middle mb-0 [&_th]:px-2 [&_th]:py-1 [&_td]:px-2 [&_td]:py-1'>
                  <thead className='bg-[color:var(--vz-light)] text-[11.2px]'>
                    <tr>
                      <th scope='col' className='text-center'>
                        Image
                      </th>
                      <th scope='col'>Title</th>
                      {hasPONumber && <th scope='col'>PO</th>}
                      <th scope='col' aria-sort={getProductsAriaSort('sku')}>
                        {renderSortableHeader('sku', 'Sku')}
                      </th>
                      <th className='text-center' scope='col' aria-sort={getProductsAriaSort('available')}>
                        {renderSortableHeader('available', 'Available', 'justify-center')}
                      </th>
                      <th className='text-center' scope='col' aria-sort={getProductsAriaSort('quantity')}>
                        {renderSortableHeader('quantity', 'Qty', 'justify-center')}
                      </th>
                      <th className='text-center' scope='col' aria-sort={getProductsAriaSort('qtyReceived')}>
                        {renderSortableHeader('qtyReceived', 'Qty Received', 'justify-center')}
                      </th>
                      {!data.boxes && <th></th>}
                    </tr>
                  </thead>
                  <tbody className='text-[11.2px]'>
                    {sortedOrderItems.map((product: ShipmentOrderItem, key) => (
                      <tr key={`${product.orderItemId || product.sku}-${product.splitId ?? key}`} className='border-b border-[color:var(--border)] py-2 w-full'>
                        <td className='text-center'>
                          <Link href={`/product/${product.inventoryId}/${product.sku}`} tabIndex={-1} target='blank' rel='noopener noreferrer' className='!text-black'>
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
                        <td className='font-semibold'>
                          <Link href={`/product/${product.inventoryId}/${product.sku}`} tabIndex={-1} target='blank' rel='noopener noreferrer' className='!text-black'>
                            {product.name}
                          </Link>
                        </td>
                        {hasPONumber && <td className='font-normal text-nowrap'>{product.poNumber || ''}</td>}
                        <td className='text-[var(--bs-secondary-color)]'>
                          <div className='flex flex-row justify-start items-center gap-1'>
                            <Link href={`/product/${product.inventoryId}/${product.sku}`} tabIndex={-1} target='blank' rel='noopener noreferrer' className='!text-black'>
                              {product.sku}
                            </Link>
                            <CopyTextToClipboard text={product.sku} label='SKU' />
                          </div>
                        </td>
                        <td className='text-center'>{FormatIntNumber(state.currentRegion, Number(product.available))}</td>
                        <td className='text-center'>{FormatIntNumber(state.currentRegion, Number(product.quantity))}</td>
                        <td className='text-center'>{FormatIntNumber(state.currentRegion, Number(product.qtyReceived))}</td>
                        {!data.boxes && (
                          <td>
                            {(data.orderStatus == 'awaiting' || data.orderStatus == 'awaiting_shipment') && product.qtyReceived! <= 0 && (
                              <i
                                className='text-[16.25px] text-destructive las la-trash-alt'
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
                      <td className='text-center text-[13px] font-bold text-nowrap'>Total</td>
                      <td className='text-center font-semibold text-[13px] text-primary'>{FormatIntNumber(state.currentRegion, Number(data.totalItems))}</td>
                      <td className='text-center font-semibold text-[13px] text-primary'>{FormatIntNumber(state.currentRegion, Number(data.totalReceivedItems))}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
          <div className='flex flex-wrap -mx-3 mb-2'>
            <div className='px-3 sm:w-full flex flex-row justify-end items-end'>
              <div className='m-0 flex flex-row justify-end items-end gap-2'>
                {!data.isReceivingFromPo && data.orderStatus !== 'received' && (
                  <a href={data.proofOfShipped} target='blank' rel='noopener noreferrer'>
                    <Button variant='info'>
                      <i className='las la-truck label-icon align-middle text-[16.25px] me-2' />
                      Proof Of Received
                    </Button>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      {deleteSKUModal.show && <Confirm_Delete_Item_From_Receiving deleteSKUModal={deleteSKUModal} setDeleteSKUModal={setDeleteSKUModal} mutateReceivings={mutateReceivings} />}
      {showEditOrderQty.show && <EditManualReceivingLog showEditOrderQty={showEditOrderQty} setshowEditOrderQty={setshowEditOrderQty} mutateReceivings={mutateReceivings} />}
      {addSkuToReceiving.show && (
        <AddSkuToManualReceivingLog addSkuToReceiving={addSkuToReceiving} setshowAddSkuToManualReceiving={setAddSkuToReceiving} mutateReceivings={mutateReceivings} />
      )}
    </div>
  )
}

export default ReceivingType
