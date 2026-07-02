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
import { Button, Col, Modal, ModalBody, ModalHeader, Row, Spinner } from '@/components/migration-ui'
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
      name: <span className='tw:font-bold tw:text-[13px]'>Item</span>,
      selector: (row: SkuToAddPo) => {
        return (
          <div className='tw:flex tw:justify-center tw:items-center tw:gap-2 tw:my-1'>
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
              <p className='tw:m-0 tw:p-0 tw:text-[11.2px] tw:font-semibold'>{row.title}</p>
              <p className='tw:m-0 tw:p-0 tw:text-[var(--bs-secondary-color)] tw:text-[11.2px] tw:font-normal'>{`${row.sku} / ${row.barcode} / ${row.asin}`}</p>
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
      name: <span className='tw:font-bold tw:text-[13px]'>Add</span>,
      selector: (row: SkuToAddPo) => {
        if (skuToAddToPo.some((item) => item.sku == row.sku)) {
          return <i className='fs-3 text-muted las la-check-circle' />
        } else {
          return <i className='fs-3 text-success las la-plus-circle' style={{ cursor: 'pointer' }} onClick={() => handleAddSkuToList(row)} />
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
      name: <span className='tw:font-bold tw:text-[13px]'>Image</span>,
      selector: (row: SkuToAddPo) => {
        return (
          <div className='tw:flex tw:justify-center tw:items-center tw:gap-2 tw:my-1'>
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
              <p className='tw:m-0 tw:p-0 tw:text-[11.2px] tw:font-semibold'>{row.title}</p>
              <p className='tw:m-0 tw:p-0 tw:text-[var(--bs-secondary-color)] tw:text-[11.2px] tw:font-normal'>{`${row.sku} / ${row.barcode} / ${row.asin}`}</p>
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
      name: <span className='tw:font-bold tw:text-[13px]'>Qty</span>,
      selector: (row: SkuInListToAddToPo) => {
        return (
          <>
            <DebounceInput
              type='number'
              onWheel={(e: any) => e.currentTarget.blur()}
              minLength={1}
              debounceTimeout={300}
              className={'form-control form-control-sm tw:text-[13px] tw:m-0 ' + (Number(row.addQty) <= 0 || row.addQty == '' ? 'tw:border-danger' : '')}
              style={{ maxWidth: '80px' }}
              placeholder='Qty...'
              id='qtyToAdd'
              name='qtyToAdd'
              value={row.addQty}
              onChange={(e) => handleAddQtyToSku(Number(e.target.value), row.sku)}
            />
            {(Number(row.addQty) <= 0 || row.addQty == '') && <span className='tw:text-danger tw:text-[11.2px]'>Qty Error</span>}
          </>
        )
      },
      sortable: false,
      center: true,
      compact: true,
      grow: 0,
    },
    {
      name: <span className='tw:font-bold tw:text-[13px]'>Remove</span>,
      selector: (row: SkuInListToAddToPo) => {
        return <i className='fs-4 text-danger las la-trash-alt ps-3' style={{ cursor: 'pointer' }} onClick={() => handleDeleteFromSkuList(row.sku)} />
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
    <Modal fade={false} scrollable={true} size='xl' id='addSkuToPoModal' isOpen={show} toggle={handleCloseModal}>
      <ModalHeader toggle={handleCloseModal} className='modal-title tw:pb-0' id='addSkuToPoModalLabel'>
        Add Products to PO
      </ModalHeader>
      <ModalBody>
        <p className='tw:m-0 tw:text-[16.25px] tw:font-semibold'>
          Purchase Order: <span className='tw:text-primary'>{orderNumber}</span>
        </p>
        <p className='tw:m-0 tw:text-[16.25px] tw:font-semibold'>
          Supplier: <span className='tw:text-primary'>{suppliersName}</span>
        </p>
        {hasSplitting && (
          <p className='tw:text-[16.25px] tw:font-semibold'>
            To Split: <span className='tw:text-primary'>{split?.splitName}</span>
          </p>
        )}
        <Row>
          <Col xs={12} md={6} className='tw:overflow-auto tw:h-full'>
            <Row className='tw:flex tw:flex-col-reverse tw:justify-center tw:items-end tw:gap-2 tw:mb-2 md:tw:flex-row md:tw:justify-between md:tw:items-center'>
              <span className='tw:text-[19.5px] tw:font-semibold tw:flex-1'>SKU List</span>
              <SearchInput searchValue={searchValue} setSearchValue={setSearchValue} background='none' widths='col-12 col-md-7' />
            </Row>
            <Col sm={12} style={{ height: '60vh', overflowX: 'hidden', overflowY: 'auto' }}>
              <DataTable
                columns={columnsSkuListToAdd}
                data={filterDataTable || []}
                progressPending={isLoading}
                striped={true}
                dense={true}
                fixedHeader={true}
                fixedHeaderScrollHeight='60vh'
                className='tw:pb-4'
                customStyles={customStyles}
              />
            </Col>
          </Col>
          <Col xs={12} md={6}>
            <Row className='tw:flex tw:flex-col-reverse tw:justify-center tw:items-end tw:gap-2 tw:mb-2 md:tw:flex-row md:tw:justify-end md:tw:items-center'>
              <span className='tw:text-[19.5px] tw:font-semibold'>Selected SKUs to Add to Purchase Order</span>
            </Row>
            <Col sm={12} style={{ height: '60vh', overflowX: 'hidden', overflowY: 'auto' }}>
              <DataTable
                columns={columnsSkuListAdded}
                data={skuToAddToPo || []}
                striped={true}
                dense={true}
                fixedHeader={true}
                fixedHeaderScrollHeight='60vh'
                customStyles={customStyles}
              />
            </Col>
          </Col>
        </Row>
        <Row md={12}>
          <div className='tw:mt-4 tw:flex tw:justify-end tw:items-center tw:gap-2'>
            <Button type='button' color='light' className='tw:text-[11.2px]' onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button disabled={loading || hasErrors} type='button' color='success' className='tw:text-[11.2px]' onClick={handleSubmitProductsToPo}>
              {loading ? (
                <span>
                  <Spinner color='light' size={'sm'} /> Adding...
                </span>
              ) : (
                'Add Products'
              )}
            </Button>
          </div>
        </Row>
      </ModalBody>
    </Modal>
  )
}

export default Add_Sku_To_Purchase_Order
