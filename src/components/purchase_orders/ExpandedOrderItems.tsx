/* eslint-disable @next/next/no-img-element */
import { DeleteItemFromOrderType } from '@components/modals/purchaseOrders/Confirm_Delete_Item_From_PO'
import AppContext from '@context/AppContext'
import { NoImageAdress } from '@lib/assetsConstants'
import { FormatCurrency, FormatIntNumber } from '@lib/FormatNumbers'
import { PoItemArrivalHistory, PurchaseOrder, PurchaseOrderItem } from '@typesTs/purchaseOrders'
import Link from 'next/link'
import { useContext, useMemo, useState } from 'react'
import { DebounceInput } from 'react-debounce-input'
import { toast } from 'react-toastify'
import { UncontrolledTooltip } from 'reactstrap'

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
    splitId: number | undefined
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
    <div className='table-responsive'>
      <table className='table table-sm align-middle table-borderless mb-0'>
        <thead className='table-light fs-7'>
          <tr>
            <th scope='col' className='text-center'>
              Image
            </th>
            <th scope='col'>Title</th>
            <th className='text-center' scope='col' onClick={() => setOrderAsc(!orderAsc)} style={{ cursor: 'pointer' }}>
              SKU {orderAsc ? <i className='las la-sort-amount-down-alt ms-1 fs-5' /> : <i className='las la-sort-amount-up ms-1 fs-5' />}
            </th>
            <th className='text-center' scope='col'>
              Cost
            </th>
            <th className='text-center' scope='col'>
              Ordered
            </th>
            <th className='text-center' scope='col'>
              Inbound
            </th>
            <th className='text-center' scope='col'>
              Arrived
            </th>
            <th className='text-center' scope='col'>
              Pending
            </th>
            {(!data.hasSplitting || (data.hasSplitting && activeTab !== 'all')) && (
              <th className='text-center' scope='col'>
                Receiving
              </th>
            )}
            <th></th>
          </tr>
        </thead>
        <tbody className='fs-7'>
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
              <tr key={`${key}-${product.sku}`} className='border-bottom py-2'>
                <td className='text-center'>
                  <Link href={`/product/${product.inventoryId}/${product.sku}`} tabIndex={-1} target='blank' className='text-black'>
                    <div
                      style={{
                        width: '100%',
                        maxWidth: '60px',
                        height: '40px',
                        margin: '2px 0px',
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
                <td className='fw-semibold'>
                  <Link href={`/product/${product.inventoryId}/${product.sku}`} tabIndex={-1} target='blank' className='text-black'>
                    {product.title}
                  </Link>
                  {product.arrivalHistory?.length > 0 && (
                    <>
                      <i className='ri-information-fill ms-1 fs-7 text-warning' id={`tooltipHistory${product.inventoryId}`} />
                      <UncontrolledTooltip placement='right' target={`tooltipHistory${product.inventoryId}`} popperClassName='bg-white shadow px-3 pt-3 rounded-2' innerClassName='text-black bg-white p-0'>
                        <p className='fs-6 text-primary m-0 p-0 fw-bold mb-2'>Arrival History</p>
                        <table className='table table-striped table-bordered table-sm table-responsive text-nowrap fs-7'>
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
                  <span className='m-0 p-0 text-black fw-normal fs-7 d-flex flex-wrap justify-content-start align-items-center gap-1'>
                    {product.asin && (
                      <div className='d-flex flex-nowrap justify-content-start align-items-center' style={{ gap: '2px' }}>
                        {`ASIN: `}
                        <a href={`https://www.amazon.${state.currentRegion == 'us' ? 'com' : 'es'}/dp/${product.asin}`} target='blank' className='fw-light' style={{ textDecoration: 'none' }}>
                          {product.asin}
                        </a>
                        <i
                          className='ri-file-copy-line fs-6 m-0 p-0 text-muted'
                          style={{ cursor: 'pointer' }}
                          onClick={() => {
                            navigator.clipboard.writeText(product.asin)
                            toast('ASIN copied!', { autoClose: 1000 })
                          }}
                        />
                      </div>
                    )}
                    {product.barcode && (
                      <div>
                        {`UPC: `}
                        <span className='fw-light text-muted'>{product.barcode}</span>
                      </div>
                    )}
                  </span>
                </td>
                <td className='text-center text-nowrap'>
                  <Link href={`/product/${product.inventoryId}/${product.sku}`} tabIndex={-1} target='blank' className='text-black'>
                    {product.sku}
                  </Link>
                </td>
                <td className='text-center text-nowrap'>{FormatCurrency(state.currentRegion, product.orderQty * product.sellerCost)}</td>
                <td className='text-center text-nowrap'>{FormatIntNumber(state.currentRegion, product.orderQty)}</td>
                <td className='text-center text-nowrap'>{FormatIntNumber(state.currentRegion, product.inboundQty)}</td>
                <td className='text-center text-nowrap'>{FormatIntNumber(state.currentRegion, product.receivedQty)}</td>
                <td className='text-center text-nowrap'>{FormatIntNumber(state.currentRegion, product.orderQty - product.receivedQty - product.inboundQty)}</td>
                {(!data.hasSplitting || (data.hasSplitting && activeTab !== 'all')) && (
                  <td className=''>
                    <DebounceInput
                      type='number'
                      minLength={0}
                      debounceTimeout={200}
                      disabled={disableInput}
                      onWheel={(e: React.WheelEvent<HTMLInputElement>) => e.currentTarget.blur()}
                      className='form-control form-control-sm fs-6 m-0 mx-auto'
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
                            data.hasSplitting ? data.splits[activeTab].splitId : undefined
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
                      <i className='fs-4 text-muted las la-trash-alt mx-1' />
                    ) : (
                      <i
                        className='fs-4 text-danger las la-trash-alt mx-1'
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
            <td className='text-center fs-6 fw-semibold text-nowrap'>Totals</td>
            <td className='text-center fs-6 fw-semibold'>
              {FormatCurrency(
                state.currentRegion,
                poItems.reduce((total, product: PurchaseOrderItem) => total + Number(product.orderQty * product.sellerCost), 0)
              )}
            </td>
            <td className='text-center fs-6 fw-semibold'>
              {FormatIntNumber(
                state.currentRegion,
                poItems.reduce((total, product: PurchaseOrderItem) => total + Number(product.orderQty), 0)
              )}
            </td>
            <td className='text-center fs-6 fw-semibold'>
              {FormatIntNumber(
                state.currentRegion,
                poItems.reduce((total, product: PurchaseOrderItem) => total + Number(product.inboundQty), 0)
              )}
            </td>
            <td className='text-center fs-6 fw-semibold'>
              {FormatIntNumber(
                state.currentRegion,
                poItems.reduce((total, product: PurchaseOrderItem) => total + Number(product.receivedQty), 0)
              )}
            </td>
            <td className='text-center fs-6 fw-semibold'>
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
