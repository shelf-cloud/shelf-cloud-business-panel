/* eslint-disable @next/next/no-img-element */
import { useContext, useMemo, useState } from 'react'

import AppContext from '@context/AppContext'
import { NoImageAdress } from '@lib/assetsConstants'
import { SkuToAddPo } from '@typesTs/purchaseOrders'
import axios from 'axios'
import DataTable from '@components/Common/DataTableSC'
import { DebounceInput } from 'react-debounce-input'
import { toast } from '@/lib/toast'
import { Button } from '@shadcn/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@shadcn/ui/dialog'
import { Spinner } from '@shadcn/ui/spinner'
import useSWR from 'swr'

interface SkuInListToAddToPo extends SkuToAddPo {
  addQty: number | string
}

type Props = {
  addSkuToReceiving: { show: boolean; receivingId: number; orderNumber: string; receivingItems: string[] }
  setshowAddSkuToManualReceiving: (prev: any) => void
  mutateReceivings?: () => void
}

const fetcher = (endPoint: string) => axios(endPoint).then((res) => res.data)

const AddSkuToManualReceivingLog = ({ addSkuToReceiving, setshowAddSkuToManualReceiving, mutateReceivings }: Props) => {
  const { state }: any = useContext(AppContext)
  const [loading, setloading] = useState(false)
  const [searchValue, setSearchValue] = useState<any>('')
  const [skuToAddToPo, setSkuToAddToPo] = useState<SkuInListToAddToPo[]>([])

  const { data: skuList }: { data?: SkuToAddPo[] } = useSWR(
    state.user.businessId ? `/api/receivings/getSkusToAddToManualReceiving?region=${state.currentRegion}&businessId=${state.user.businessId}` : null,
    fetcher,
    { revalidateOnFocus: false }
  )

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
      name: <span className='font-extrabold text-[13px]'>Image</span>,
      selector: (row: SkuToAddPo) => {
        return (
          <div
            style={{
              width: '100%',
              maxWidth: '80px',
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
        )
      },
      sortable: false,
      wrap: false,
      grow: 0,
    },
    {
      name: <span className='font-extrabold text-[13px]'>Title</span>,
      selector: (row: SkuToAddPo) => {
        return (
          <>
            <span className='text-[11.2px] font-semibold'>{row.title}</span>
            <br />
            <span className='text-muted-foreground text-[11.2px] font-normal'>{`${row.sku} / ${row.barcode} / ${row.asin}`}</span>
          </>
        )
      },
      sortable: true,
      wrap: true,
      compact: true,
      grow: 1,
    },
    {
      name: <span className='font-extrabold text-[13px]'></span>,
      selector: (row: SkuToAddPo) => {
        if (skuToAddToPo.some((item) => item.sku == row.sku) || addSkuToReceiving.receivingItems.includes(row.sku)) {
          return <i className='text-[19.5px] text-muted-foreground las la-check-circle' />
        } else {
          return <i className='text-[19.5px] text-success las la-plus-circle' style={{ cursor: 'pointer' }} onClick={() => handleAddSkuToList(row)} />
        }
      },
      sortable: false,
      compact: true,
      grow: 0,
    },
  ]

  const columnsSkuListAdded: any = [
    {
      name: <span className='font-extrabold text-[13px]'>Image</span>,
      selector: (row: SkuToAddPo) => {
        return (
          <div
            style={{
              width: '100%',
              maxWidth: '80px',
              height: '35px',
              margin: '2px 0px',
              position: 'relative',
            }}>
            <img
              loading='lazy'
              src={row.image ? row.image : NoImageAdress}
              alt='product Image'
              style={{ objectFit: 'contain', objectPosition: 'center', width: '100%', height: '100%' }}
            />
          </div>
        )
      },
      sortable: false,
      wrap: false,
      grow: 0,
    },
    {
      name: <span className='font-extrabold text-[13px]'>Title</span>,
      selector: (row: SkuToAddPo) => {
        return (
          <>
            <span className='text-[11.2px] font-semibold'>{row.title}</span>
            <br />
            <span className='text-muted-foreground text-[11.2px] font-normal'>{`${row.sku} / ${row.barcode} / ${row.asin}`}</span>
          </>
        )
      },
      sortable: true,
      wrap: true,
      compact: true,
      grow: 1,
    },
    {
      name: <span className='font-extrabold text-[13px]'>Qty</span>,
      selector: (row: SkuInListToAddToPo) => {
        return (
          <>
            <DebounceInput
              type='number'
              onWheel={(e: any) => e.currentTarget.blur()}
              minLength={1}
              debounceTimeout={300}
              className={'h-9 w-full min-w-0 rounded-md border border-input bg-input px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 text-[11.2px] m-0 ' + (Number(row.addQty) <= 0 || row.addQty == '' ? 'border-destructive' : '')}
              style={{ maxWidth: '80px' }}
              placeholder='Qty...'
              id='qtyToAdd'
              name='qtyToAdd'
              value={row.addQty}
              onChange={(e) => handleAddQtyToSku(Number(e.target.value), row.sku)}
            />
            {(Number(row.addQty) <= 0 || row.addQty == '') && <span className='text-destructive text-[11.2px]'>Qty Error</span>}
          </>
        )
      },
      sortable: false,
      center: true,
      compact: true,
      grow: 0,
    },
    {
      name: <span className='font-extrabold text-[13px]'></span>,
      selector: (row: SkuInListToAddToPo) => {
        return <i className='text-[22.75px] text-destructive las la-trash-alt ps-4' style={{ cursor: 'pointer' }} onClick={() => handleDeleteFromSkuList(row.sku)} />
      },
      sortable: false,
      compact: true,
      grow: 0,
    },
  ]

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

  const handleSubmitProductsToManualReceiving = async () => {
    setloading(true)

    const addSkusToManualReceiving = toast.loading('Adding Products to Manual Receiving...')

    const response = await axios.post(`/api/receivings/addSkusToManualReceiving?region=${state.currentRegion}&businessId=${state.user.businessId}`, {
      receivingId: addSkuToReceiving.receivingId,
      orderNumber: addSkuToReceiving.orderNumber,
      newSkus: skuToAddToPo,
    })

    if (!response.data.error) {
      toast.update(addSkusToManualReceiving, {
        render: response.data.message,
        type: 'success',
        isLoading: false,
        autoClose: 3000,
      })
      mutateReceivings && mutateReceivings()
      setshowAddSkuToManualReceiving({
        show: false,
        receivingId: 0,
        orderNumber: '',
        receivingItems: [],
      })
    } else {
      toast.update(addSkusToManualReceiving, {
        render: response.data.message,
        type: 'error',
        isLoading: false,
        autoClose: 3000,
      })
    }
    setloading(false)
  }

  const closeModal = () => {
    setshowAddSkuToManualReceiving({
      show: false,
      receivingId: 0,
      orderNumber: '',
      receivingItems: [],
    })
  }

  return (
    <Dialog
      open={!!addSkuToReceiving.show}
      onOpenChange={(open) => {
        if (!open) closeModal()
      }}>
      <DialogContent aria-describedby={undefined} className='max-h-[90vh] overflow-y-auto sm:!max-w-5xl'>
        <DialogHeader className='pr-6 pb-0'>
          <DialogTitle id='myModalLabel'>
            <p>Add Products to Receiving</p>
            <span className='text-[16.25px] mb-0 font-normal text-primary'>
              Order Number: <span className='text-[16.25px] font-bold text-black'>{addSkuToReceiving.orderNumber}</span>
            </span>
          </DialogTitle>
        </DialogHeader>
        <div className='flex flex-wrap -mx-3'>
          <div className='px-3 w-full sm:w-6/12 overflow-auto h-full'>
            <div className='flex flex-wrap -mx-3 flex flex-col-reverse justify-center items-end gap-2 mb-2 md:flex-row md:justify-between md:items-center'>
              <span className='text-[19.5px] font-semibold text-muted-foreground flex-1'>SKU List</span>
              <div className='w-full md:w-7/12'>
                <div className='flex flex-row justify-end items-center p-0'>
                  <div className='relative flex rounded-md w-full overflow-hidden' style={{ border: '1px solid #E1E3E5' }}>
                    <DebounceInput
                      minLength={2}
                      debounceTimeout={500}
                      type='text'
                      className='h-9 w-full border-0 bg-white px-3 text-sm outline-none'
                      placeholder='Search...'
                      id='search-options'
                      value={searchValue}
                      onKeyDown={(e) => (e.key == 'Enter' ? e.preventDefault() : null)}
                      onChange={(e) => {
                        setSearchValue(e.target.value)
                      }}
                    />
                    <span
                      className='flex items-center justify-center bg-white'
                      style={{
                        cursor: 'pointer',
                      }}
                      onClick={() => setSearchValue('')}>
                      <i className='mdi mdi-window-close text-[19.5px] m-0 px-2 py-0 text-muted-foreground' />
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className='px-3 w-full' style={{ height: '60vh', overflowX: 'hidden', overflowY: 'auto' }}>
              <DataTable
                columns={columnsSkuListToAdd}
                data={filterDataTable || []}
                progressPending={skuList ? false : true}
                striped={true}
                dense={true}
                fixedHeader={true}
                fixedHeaderScrollHeight='60vh'
                className='pb-6'
              />
            </div>
          </div>
          <div className='px-3 w-full sm:w-6/12'>
            <div className='flex flex-wrap -mx-3 flex flex-col-reverse justify-center items-end gap-2 mb-2 md:flex-row md:justify-end md:items-center'>
              <span className='text-[19.5px] font-semibold text-muted-foreground'>SKU List to Add to PO</span>
            </div>
            <div className='px-3 w-full' style={{ height: '60vh', overflowX: 'hidden', overflowY: 'auto' }}>
              <DataTable columns={columnsSkuListAdded} data={skuToAddToPo || []} striped={true} dense={true} fixedHeader={true} fixedHeaderScrollHeight='60vh' />
            </div>
          </div>
          <div className='flex flex-wrap -mx-3'>
            <div className='text-end'>
              <Button disabled={hasErrors} type='button' variant='success' onClick={handleSubmitProductsToManualReceiving}>
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

export default AddSkuToManualReceivingLog
