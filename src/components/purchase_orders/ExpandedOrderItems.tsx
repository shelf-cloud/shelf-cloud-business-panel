/* eslint-disable @next/next/no-img-element */
import Link from 'next/link'
import { useContext, useMemo, useState } from 'react'

import { DeleteItemFromOrderType } from '@components/modals/purchaseOrders/Confirm_Delete_Item_From_PO'
import CopyTextToClipboard from '@components/ui/CopyTextToClipboard'
import AppContext from '@context/AppContext'
import { FormatCurrency, FormatIntNumber } from '@lib/FormatNumbers'
import { NoImageAdress } from '@lib/assetsConstants'
import { PoItemArrivalHistory, PurchaseOrder, PurchaseOrderItem } from '@typesTs/purchaseOrders'
import { DebounceInput } from 'react-debounce-input'
import { UncontrolledTooltip } from '@/components/migration-ui'

type Props = {
  activeTab: string
  poItems: PurchaseOrderItem[]
  data: PurchaseOrder
  loading: boolean
  handlereceivingOrderFromPo: (
    warehouseId: number,
    warehouseName: string,
    poId: number,
    orderNumber: string,
    inventoryId: number,
    sku: string,
    title: string,
    image: string,
    businessId: number,
    suppliersName: string,
    receivingQty: number,
    hasSplitting: boolean,
    splitId: number | undefined,
    boxQty: number
  ) => void
  setshowDeleteModal: (cb: (prev: DeleteItemFromOrderType) => DeleteItemFromOrderType) => void
}

const ExpandedOrderItems = ({ activeTab, poItems, data, loading, handlereceivingOrderFromPo, setshowDeleteModal }: Props) => {
  const { state }: any = useContext(AppContext)
  const [orderAsc, setOrderAsc] = useState(true)
  const orderPoItems = useMemo(() => {
    if (orderAsc) {
      return poItems.sort((a, b) => a.sku.localeCompare(b.sku))
    } else {
      return poItems.sort((a, b) => b.sku.localeCompare(a.sku))
    }
  }, [poItems, orderAsc])

  return (
    <div className='tw:overflow-x-auto'>
      <table className='tw:w-full tw:text-[11.2px] tw:align-middle tw:mb-0 tw:[&_th]:px-2 tw:[&_th]:py-1 tw:[&_td]:px-2 tw:[&_td]:py-1'>
        <thead className='tw:bg-[color:var(--vz-light)] tw:text-[11.2px]'>
          <tr key={`poItems-${data.poId}-header`}>
            <th scope='col' className='tw:text-center'>
              Image
            </th>
            <th scope='col'>Title</th>
            <th className='tw:text-center' scope='col' onClick={() => setOrderAsc(!orderAsc)} style={{ cursor: 'pointer' }}>
              SKU {orderAsc ? <i className='las la-sort-amount-down-alt tw:ms-1 tw:text-[16.25px]' /> : <i className='las la-sort-amount-up tw:ms-1 tw:text-[16.25px]' />}
            </th>
            <th className='tw:text-center' scope='col'>
              Cost
            </th>
            <th className='tw:text-center' scope='col'>
              Ordered
            </th>
            <th className='tw:text-center' scope='col'>
              Inbound
            </th>
            <th className='tw:text-center' scope='col'>
              Arrived
            </th>
            <th className='tw:text-center' scope='col'>
              Pending
            </th>
            {(!data.hasSplitting || (data.hasSplitting && activeTab !== 'all')) && (
              <th className='tw:text-center' scope='col'>
                Receiving
              </th>
            )}
            <th></th>
          </tr>
        </thead>
        <tbody>
          {orderPoItems.map((product: PurchaseOrderItem, key) => {
            const noQtytoReceive = product.orderQty - product.receivedQty - product.inboundQty <= 0
            const isClosed = !data.isOpen
            const isDifferentWarehouse = () => {
              if (state.receivingFromPo.warehouse.id === 0) return false
              if (data.hasSplitting && activeTab === 'all') return false
              return data.hasSplitting ? state.receivingFromPo.warehouse.id !== data.splits[activeTab].destination.id : state.receivingFromPo.warehouse.id !== data.warehouseId
            }
            const disableInput = noQtytoReceive || isClosed || isDifferentWarehouse()

            const inputValue = () => {
              if (!data.hasSplitting) return state.receivingFromPo?.items[data.poId]?.[product.inventoryId]?.receivingQty
              if (data.hasSplitting && activeTab === 'all') return ''
              if (state.receivingFromPo.warehouse.id === data.splits[activeTab].destination.id) return state.receivingFromPo?.items[data.poId]?.[product.inventoryId]?.receivingQty
              return ''
            }
            return (
              <tr key={`${key}-${product.sku}`} className='tw:border-b tw:border-[color:var(--border)] tw:py-2'>
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
                    {product.title}
                  </Link>
                  {product.arrivalHistory?.length > 0 && (
                    <>
                      <i className='ri-information-fill tw:ms-1 tw:text-[11.2px] tw:text-warning' id={`tooltipHistory${product.inventoryId}`} />
                      <UncontrolledTooltip
                        placement='right'
                        target={`tooltipHistory${product.inventoryId}`}
                        popperClassName='tw:bg-white tw:shadow tw:px-3 tw:pt-3 tw:rounded'
                        innerClassName='tw:text-black tw:bg-white tw:p-0'>
                        <p className='tw:text-[13px] tw:text-primary tw:m-0 tw:p-0 tw:font-bold tw:mb-2'>Arrival History</p>
                        <table className='tw:w-full tw:text-[11.2px] tw:text-nowrap tw:[&_th]:px-2 tw:[&_th]:py-1 tw:[&_th]:border tw:[&_th]:border-[color:var(--border)] tw:[&_td]:px-2 tw:[&_td]:py-1 tw:[&_td]:border tw:[&_td]:border-[color:var(--border)]'>
                          <thead>
                            <tr>
                              <th>Date</th>
                              <th>Receiving</th>
                              <th>Qty</th>
                            </tr>
                          </thead>
                          <tbody>
                            {product.arrivalHistory.map((received: PoItemArrivalHistory, index: number) => (
                              <tr key={index}>
                                <td>{received.date}</td>
                                <td>{received.receivingOrder}</td>
                                <td>{FormatIntNumber(state.currentRegion, received.quantity)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </UncontrolledTooltip>
                    </>
                  )}
                  <span className='tw:m-0 tw:p-0 tw:text-black tw:font-normal tw:text-[11.2px] tw:flex tw:flex-wrap tw:justify-start tw:items-center tw:gap-1'>
                    {product.asin && (
                      <div className='tw:flex tw:flex-nowrap tw:justify-start tw:items-center' style={{ gap: '2px' }}>
                        {`ASIN: `}
                        <a
                          href={`https://www.amazon.${state.currentRegion == 'us' ? 'com' : 'es'}/dp/${product.asin}`}
                          target='blank'
                          rel='noopener noreferrer'
                          className='tw:font-light'
                          style={{ textDecoration: 'none' }}>
                          {product.asin}
                        </a>
                        <CopyTextToClipboard text={product.asin} label='ASIN' />
                      </div>
                    )}
                    {product.barcode && (
                      <div>
                        {`UPC: `}
                        <span className='tw:font-light tw:text-[color:var(--bs-secondary-color)]'>{product.barcode}</span>
                      </div>
                    )}
                  </span>
                </td>
                <td className='tw:text-center tw:text-nowrap'>
                  <div className='tw:flex tw:flex-row tw:justify-start tw:items-center tw:gap-1'>
                    <Link href={`/product/${product.inventoryId}/${product.sku}`} tabIndex={-1} target='blank' rel='noopener noreferrer' className='tw:!text-black'>
                      {product.sku}
                    </Link>
                    <CopyTextToClipboard text={product.sku} label='SKU' />
                  </div>
                </td>
                <td className='tw:text-center tw:text-nowrap'>{FormatCurrency(state.currentRegion, product.orderQty * product.sellerCost)}</td>
                <td className='tw:text-center tw:text-nowrap'>{FormatIntNumber(state.currentRegion, product.orderQty)}</td>
                <td className='tw:text-center tw:text-nowrap'>{FormatIntNumber(state.currentRegion, product.inboundQty)}</td>
                <td className='tw:text-center tw:text-nowrap'>{FormatIntNumber(state.currentRegion, product.receivedQty)}</td>
                <td className='tw:text-center tw:text-nowrap'>{FormatIntNumber(state.currentRegion, product.orderQty - product.receivedQty - product.inboundQty)}</td>
                {(!data.hasSplitting || (data.hasSplitting && activeTab !== 'all')) && (
                  <td className=''>
                    <DebounceInput
                      type='number'
                      minLength={0}
                      debounceTimeout={200}
                      disabled={disableInput}
                      onWheel={(e: React.WheelEvent<HTMLInputElement>) => e.currentTarget.blur()}
                      className='tw:h-8 tw:w-full tw:rounded-md tw:border tw:border-[color:var(--input-border)] tw:bg-white tw:px-2 tw:text-xs tw:m-0 tw:mx-auto'
                      style={{ maxWidth: '80px' }}
                      placeholder='--'
                      value={inputValue()}
                      onKeyDown={(e) => (e.key == 'Enter' ? e.preventDefault() : null)}
                      onChange={(e) => {
                        if (Number(e.target.value) <= product.orderQty - product.receivedQty - product.inboundQty && Number(e.target.value) >= 0) {
                          handlereceivingOrderFromPo(
                            data.hasSplitting ? data.splits[activeTab].destination.id : data.warehouseId,
                            data.hasSplitting ? data.splits[activeTab].destination.label : data.warehouseName,
                            data.poId,
                            data.orderNumber,
                            product.inventoryId,
                            product.sku,
                            product.title,
                            product.image,
                            data.businessId,
                            data.suppliersName,
                            Number(e.target.value),
                            data.hasSplitting,
                            data.hasSplitting ? data.splits[activeTab].splitId : undefined,
                            product.boxQty
                          )
                        }
                      }}
                    />
                  </td>
                )}
                <td>
                  {(!data.hasSplitting || (data.hasSplitting && activeTab !== 'all')) &&
                    data.isOpen &&
                    Number(product.inboundQty) <= 0 &&
                    Number(product.receivedQty) <= 0 &&
                    (loading ? (
                      <i className='tw:text-[19.5px] tw:text-[color:var(--bs-secondary-color)] las la-trash-alt tw:mx-1' />
                    ) : (
                      <i
                        className='tw:text-[19.5px] tw:text-destructive las la-trash-alt tw:mx-1'
                        style={{ cursor: 'pointer' }}
                        onClick={() =>
                          setshowDeleteModal((prev) => {
                            return {
                              ...prev,
                              show: true,
                              poId: data.poId,
                              orderNumber: data.orderNumber,
                              inventoryId: product.inventoryId,
                              sku: product.sku,
                              title: product.title,
                              image: product.image,
                              hasSplitting: data.hasSplitting,
                              split: data.splits[activeTab] || undefined,
                            }
                          })
                        }
                      />
                    ))}
                </td>
              </tr>
            )
          })}
          <tr>
            <td></td>
            <td></td>
            <td className='tw:text-center tw:text-[13px] tw:font-semibold tw:text-nowrap'>Totals</td>
            <td className='tw:text-center tw:text-[13px] tw:font-semibold'>
              {FormatCurrency(
                state.currentRegion,
                poItems.reduce((total, product: PurchaseOrderItem) => total + Number(product.orderQty * product.sellerCost), 0)
              )}
            </td>
            <td className='tw:text-center tw:text-[13px] tw:font-semibold'>
              {FormatIntNumber(
                state.currentRegion,
                poItems.reduce((total, product: PurchaseOrderItem) => total + Number(product.orderQty), 0)
              )}
            </td>
            <td className='tw:text-center tw:text-[13px] tw:font-semibold'>
              {FormatIntNumber(
                state.currentRegion,
                poItems.reduce((total, product: PurchaseOrderItem) => total + Number(product.inboundQty), 0)
              )}
            </td>
            <td className='tw:text-center tw:text-[13px] tw:font-semibold'>
              {FormatIntNumber(
                state.currentRegion,
                poItems.reduce((total, product: PurchaseOrderItem) => total + Number(product.receivedQty), 0)
              )}
            </td>
            <td className='tw:text-center tw:text-[13px] tw:font-semibold'>
              {FormatIntNumber(
                state.currentRegion,
                poItems.reduce((total, product: PurchaseOrderItem) => total + Number(product.orderQty - product.receivedQty - product.inboundQty), 0)
              )}
            </td>
            <td></td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

export default ExpandedOrderItems
