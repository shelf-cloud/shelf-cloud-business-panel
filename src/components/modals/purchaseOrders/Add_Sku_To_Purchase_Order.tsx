/* eslint-disable @next/next/no-img-element */
import { useRouter } from 'next/router'
import { useContext, useMemo, useState } from 'react'

import SearchInput from '@components/ui/SearchInput'
import AppContext from '@context/AppContext'
import { SkuInListToAddToPo, useAddToPo } from '@hooks/purchaseOrders/useAddToPo'
import { useRPNewForecast } from '@hooks/reorderingPoints/useRPNewForcast'
import { NoImageAdress } from '@lib/assetsConstants'
import { SkuToAddPo } from '@typesTs/purchaseOrders'
import axios from 'axios'
import DataTable from 'react-data-table-component'
import { DebounceInput } from 'react-debounce-input'
import { toast } from 'react-toastify'
import { Button } from '@shadcn/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@shadcn/ui/dialog'
import { Spinner } from '@shadcn/ui/spinner'
import { useSWRConfig } from 'swr'

const customStyles = {
  responsiveWrapper: {
    style: {
      scrollbarWidth: 'thin',
    },
  },
}

const Add_Sku_To_Purchase_Order = ({}) => {
  const router = useRouter()
  const { status, organizeBy } = router.query
  const { mutate } = useSWRConfig()
  const { skuList, isLoading } = useAddToPo()
  const {
    state: { currentRegion, user, modalAddSkuToPurchaseOrder },
    setModalAddSkuToPurchaseOrder,
  } = useContext(AppContext)
  const { show, poId, orderNumber, suppliersName, hasSplitting, split } = modalAddSkuToPurchaseOrder
  const [loading, setloading] = useState(false)
  const [searchValue, setSearchValue] = useState<any>('')
  const [skuToAddToPo, setSkuToAddToPo] = useState<SkuInListToAddToPo[]>([])

  const { generate_new_forecast_products } = useRPNewForecast()

  const hasErrors = useMemo(() => {
    if (skuToAddToPo.length <= 0) return true
    return skuToAddToPo.some((skus: SkuInListToAddToPo) => Number(skus.addQty) <= 0 || skus.addQty == '')
  }, [skuToAddToPo])

  const filterDataTable = useMemo(() => {
    if (searchValue === '') {
      return skuList
    }

    if (searchValue !== '') {
      const newDataTable = skuList?.filter(
        (sku: SkuToAddPo) =>
          sku?.sku?.toLowerCase().includes(searchValue.toLowerCase()) ||
          sku?.asin?.toLowerCase().includes(searchValue.toLowerCase()) ||
          sku?.barcode?.toLowerCase().includes(searchValue.toLowerCase()) ||
          sku?.title?.toLowerCase().includes(searchValue.toLowerCase())
      )
      return newDataTable
    }
  }, [skuList, searchValue])

  const columnsSkuListToAdd: any = [
    {
      name: <span className='font-bold text-[13px]'>Item</span>,
      selector: (row: SkuToAddPo) => {
        return (
          <div className='flex justify-center items-center gap-2 my-1'>
            <div
              style={{
                width: '100%',
                maxWidth: '50px',
                height: '35px',
                margin: '2px 0px',
                position: 'relative',
              }}>
              <img
                loading='lazy'
                src={row.image ? row.image : NoImageAdress}
                onError={(e) => (e.currentTarget.src = NoImageAdress)}
                alt='product Image'
                style={{ objectFit: 'contain', objectPosition: 'center', width: '100%', height: '100%' }}
              />
            </div>
            <div>
              <p className='m-0 p-0 text-[11.2px] font-semibold'>{row.title}</p>
              <p className='m-0 p-0 text-[var(--bs-secondary-color)] text-[11.2px] font-normal'>{`${row.sku} / ${row.barcode} / ${row.asin}`}</p>
            </div>
          </div>
        )
      },
      sortable: false,
      wrap: true,
      left: true,
      compact: false,
      grow: 1,
    },
    {
      name: <span className='font-bold text-[13px]'>Add</span>,
      selector: (row: SkuToAddPo) => {
        if (skuToAddToPo.some((item) => item.sku == row.sku)) {
          return <i className='text-[22.75px] text-[color:var(--bs-secondary-color)] las la-check-circle' />
        } else {
          return <i className='text-[22.75px] text-success las la-plus-circle' style={{ cursor: 'pointer' }} onClick={() => handleAddSkuToList(row)} />
        }
      },
      sortable: false,
      center: true,
      compact: true,
      grow: 0,
    },
  ]

  const columnsSkuListAdded: any = [
    {
      name: <span className='font-bold text-[13px]'>Image</span>,
      selector: (row: SkuToAddPo) => {
        return (
          <div className='flex justify-center items-center gap-2 my-1'>
            <div
              style={{
                width: '100%',
                maxWidth: '50px',
                height: '35px',
                margin: '2px 0px',
                position: 'relative',
              }}>
              <img
                loading='lazy'
                src={row.image ? row.image : NoImageAdress}
                onError={(e) => (e.currentTarget.src = NoImageAdress)}
                alt='product Image'
                style={{ objectFit: 'contain', objectPosition: 'center', width: '100%', height: '100%' }}
              />
            </div>
            <div>
              <p className='m-0 p-0 text-[11.2px] font-semibold'>{row.title}</p>
              <p className='m-0 p-0 text-[var(--bs-secondary-color)] text-[11.2px] font-normal'>{`${row.sku} / ${row.barcode} / ${row.asin}`}</p>
            </div>
          </div>
        )
      },
      sortable: false,
      wrap: true,
      left: true,
      compact: false,
      grow: 1,
    },
    {
      name: <span className='font-bold text-[13px]'>Qty</span>,
      selector: (row: SkuInListToAddToPo) => {
        return (
          <>
            <DebounceInput
              type='number'
              onWheel={(e: any) => e.currentTarget.blur()}
              minLength={1}
              debounceTimeout={300}
              className={
                'h-9 w-full min-w-0 rounded-md border border-input bg-input px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 text-[13px] m-0 ' +
                (Number(row.addQty) <= 0 || row.addQty == '' ? 'border-danger' : '')
              }
              style={{ maxWidth: '80px' }}
              placeholder='Qty...'
              id='qtyToAdd'
              name='qtyToAdd'
              value={row.addQty}
              onChange={(e) => handleAddQtyToSku(Number(e.target.value), row.sku)}
            />
            {(Number(row.addQty) <= 0 || row.addQty == '') && <span className='text-danger text-[11.2px]'>Qty Error</span>}
          </>
        )
      },
      sortable: false,
      center: true,
      compact: true,
      grow: 0,
    },
    {
      name: <span className='font-bold text-[13px]'>Remove</span>,
      selector: (row: SkuInListToAddToPo) => {
        return <i className='text-[19.5px] text-destructive las la-trash-alt ps-4' style={{ cursor: 'pointer' }} onClick={() => handleDeleteFromSkuList(row.sku)} />
      },
      sortable: false,
      center: true,
      compact: true,
      grow: 0,
    },
  ]

  const handleCloseModal = () => {
    setModalAddSkuToPurchaseOrder(false, 0, '', '', false, undefined)
  }

  const handleAddSkuToList = (row: SkuToAddPo) => {
    setSkuToAddToPo((prev) => [...prev, { ...row, addQty: '' }])
  }

  const handleDeleteFromSkuList = (sku: string) => {
    const newList = skuToAddToPo.filter((skus: SkuInListToAddToPo) => skus.sku != sku)
    setSkuToAddToPo(newList)
  }

  const handleAddQtyToSku = (qty: number, sku: string) => {
    const newList = skuToAddToPo.map((skus: SkuInListToAddToPo) => {
      if (skus.sku == sku) {
        skus.addQty = qty
      }
      return skus
    })
    setSkuToAddToPo(newList)
  }

  const handleSubmitProductsToPo = async () => {
    setloading(true)

    const response = await axios.post(`/api/purchaseOrders/addSkusToPo?region=${currentRegion}&businessId=${user.businessId}`, {
      poId: poId,
      orderNumber: orderNumber,
      skuToAddToPo,
      hasSplitting,
      split: hasSplitting ? split : undefined,
    })

    if (!response.data.error) {
      generate_new_forecast_products({
        skus: skuToAddToPo.map((item) => item.sku) ?? [],
        productIds: skuToAddToPo.map((item) => item.inventoryId) ?? [],
      })
      if (organizeBy == 'suppliers') {
        mutate(`/api/purchaseOrders/getpurchaseOrdersBySuppliers?region=${currentRegion}&businessId=${user.businessId}&status=${status}`)
      } else if (organizeBy == 'orders') {
        mutate(`/api/purchaseOrders/getpurchaseOrdersByOrders?region=${currentRegion}&businessId=${user.businessId}&status=${status}`)
      } else if (organizeBy == 'sku') {
        mutate(`/api/purchaseOrders/getpurchaseOrdersBySku?region=${currentRegion}&businessId=${user.businessId}&status=${status}`)
      }
      toast.success(response.data.msg)
      handleCloseModal()
    } else {
      toast.error(response.data.msg)
    }
    setloading(false)
  }

  return (
    <Dialog open={!!show} onOpenChange={(open) => { if (!open) handleCloseModal() }}>
      <DialogContent aria-describedby={undefined} className='max-h-[90vh] overflow-y-auto sm:!max-w-5xl' id='addSkuToPoModal'>
        <DialogHeader className='pr-6 modal-title pb-0' id='addSkuToPoModalLabel'>
          <DialogTitle>Add Products to PO</DialogTitle>
        </DialogHeader>
        <div>
          <p className='m-0 text-[16.25px] font-semibold'>
            Purchase Order: <span className='text-primary'>{orderNumber}</span>
          </p>
          <p className='m-0 text-[16.25px] font-semibold'>
            Supplier: <span className='text-primary'>{suppliersName}</span>
          </p>
          {hasSplitting && (
            <p className='text-[16.25px] font-semibold'>
              To Split: <span className='text-primary'>{split?.splitName}</span>
            </p>
          )}
          <div className='flex flex-wrap -mx-3'>
            <div className='px-3 w-full md:w-6/12 overflow-auto h-full'>
              <div className='flex flex-wrap -mx-3 flex-col-reverse justify-center items-end gap-2 mb-2 md:flex-row md:justify-between md:items-center'>
                <span className='text-[19.5px] font-semibold flex-1'>SKU List</span>
                <SearchInput searchValue={searchValue} setSearchValue={setSearchValue} background='none' widths='col-12 col-md-7' />
              </div>
              <div className='px-3 w-full' style={{ height: '60vh', overflowX: 'hidden', overflowY: 'auto' }}>
                <DataTable
                  columns={columnsSkuListToAdd}
                  data={filterDataTable || []}
                  progressPending={isLoading}
                  striped={true}
                  dense={true}
                  fixedHeader={true}
                  fixedHeaderScrollHeight='60vh'
                  className='pb-4'
                  customStyles={customStyles}
                />
              </div>
            </div>
            <div className='px-3 w-full md:w-6/12'>
              <div className='flex flex-wrap -mx-3 flex-col-reverse justify-center items-end gap-2 mb-2 md:flex-row md:justify-end md:items-center'>
                <span className='text-[19.5px] font-semibold'>Selected SKUs to Add to Purchase Order</span>
              </div>
              <div className='px-3 w-full' style={{ height: '60vh', overflowX: 'hidden', overflowY: 'auto' }}>
                <DataTable
                  columns={columnsSkuListAdded}
                  data={skuToAddToPo || []}
                  striped={true}
                  dense={true}
                  fixedHeader={true}
                  fixedHeaderScrollHeight='60vh'
                  customStyles={customStyles}
                />
              </div>
            </div>
          </div>
          <div className='flex flex-wrap -mx-3'>
            <div className='mt-4 flex justify-end items-center gap-2'>
              <Button type='button' variant='light' className='text-[11.2px]' onClick={handleCloseModal}>
                Cancel
              </Button>
              <Button disabled={loading || hasErrors} type='button' variant='success' className='text-[11.2px]' onClick={handleSubmitProductsToPo}>
                {loading ? (
                  <span>
                    <Spinner className='text-white' /> Adding...
                  </span>
                ) : (
                  'Add Products'
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default Add_Sku_To_Purchase_Order
