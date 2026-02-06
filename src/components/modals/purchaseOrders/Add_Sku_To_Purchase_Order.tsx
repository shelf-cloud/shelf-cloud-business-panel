/* eslint-disable @next/next/no-img-element */
import { useRouter } from 'next/router'
import { useContext, useMemo, useState } from 'react'

import SearchInput from '@components/ui/SearchInput'
import AppContext from '@context/AppContext'
import { SkuInListToAddToPo, useAddToPo } from '@hooks/purchaseOrders/useAddToPo'
import { NoImageAdress } from '@lib/assetsConstants'
import { SkuToAddPo } from '@typesTs/purchaseOrders'
import axios from 'axios'
import DataTable from 'react-data-table-component'
import { DebounceInput } from 'react-debounce-input'
import { toast } from 'react-toastify'
import { Button, Col, Modal, ModalBody, ModalHeader, Row, Spinner } from 'reactstrap'
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
      name: <span className='fw-bolder fs-6'>Item</span>,
      selector: (row: SkuToAddPo) => {
        return (
          <div className='d-flex justify-content-center align-items-center gap-2 my-1'>
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
              <p className='m-0 p-0 fs-7 fw-semibold'>{row.title}</p>
              <p className='m-0 p-0 text-muted fs-7 fw-normal'>{`${row.sku} / ${row.barcode} / ${row.asin}`}</p>
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
      name: <span className='fw-bolder fs-6'>Add</span>,
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
      name: <span className='fw-bolder fs-6'>Image</span>,
      selector: (row: SkuToAddPo) => {
        return (
          <div className='d-flex justify-content-center align-items-center gap-2 my-1'>
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
              <p className='m-0 p-0 fs-7 fw-semibold'>{row.title}</p>
              <p className='m-0 p-0 text-muted fs-7 fw-normal'>{`${row.sku} / ${row.barcode} / ${row.asin}`}</p>
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
      name: <span className='fw-bolder fs-6'>Qty</span>,
      selector: (row: SkuInListToAddToPo) => {
        return (
          <>
            <DebounceInput
              type='number'
              onWheel={(e: any) => e.currentTarget.blur()}
              minLength={1}
              debounceTimeout={300}
              className={'form-control form-control-sm fs-6 m-0 ' + (Number(row.addQty) <= 0 || row.addQty == '' ? 'border-danger' : '')}
              style={{ maxWidth: '80px' }}
              placeholder='Qty...'
              id='qtyToAdd'
              name='qtyToAdd'
              value={row.addQty}
              onChange={(e) => handleAddQtyToSku(Number(e.target.value), row.sku)}
            />
            {(Number(row.addQty) <= 0 || row.addQty == '') && <span className='text-danger fs-7'>Qty Error</span>}
          </>
        )
      },
      sortable: false,
      center: true,
      compact: true,
      grow: 0,
    },
    {
      name: <span className='fw-bolder fs-6'>Remove</span>,
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
      axios.post(`/api/reorderingPoints/delete-reordering-points-cache?region=${currentRegion}&businessId=${user.businessId}`)
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
      <ModalHeader toggle={handleCloseModal} className='modal-title pb-0' id='addSkuToPoModalLabel'>
        Add Products to PO
      </ModalHeader>
      <ModalBody>
        <p className='m-0 fs-5 fw-semibold'>
          Purchase Order: <span className='text-primary'>{orderNumber}</span>
        </p>
        <p className='m-0 fs-5 fw-semibold'>
          Supplier: <span className='text-primary'>{suppliersName}</span>
        </p>
        {hasSplitting && (
          <p className='fs-5 fw-semibold'>
            To Split: <span className='text-primary'>{split?.splitName}</span>
          </p>
        )}
        <Row>
          <Col xs={12} md={6} className='overflow-auto h-100'>
            <Row className='d-flex flex-column-reverse justify-content-center align-items-end gap-2 mb-2 flex-md-row justify-content-md-between align-items-md-center'>
              <span className='fs-4 fw-semibold flex-1'>SKU List</span>
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
                className='pb-4'
                customStyles={customStyles}
              />
            </Col>
          </Col>
          <Col xs={12} md={6}>
            <Row className='d-flex flex-column-reverse justify-content-center align-items-end gap-2 mb-2 flex-md-row justify-content-md-end align-items-md-center'>
              <span className='fs-4 fw-semibold'>Selected SKUs to Add to Purchase Order</span>
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
          <div className='mt-3 d-flex justify-content-end align-items-center gap-2'>
            <Button type='button' color='light' className='fs-7' onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button disabled={loading || hasErrors} type='button' color='success' className='fs-7' onClick={handleSubmitProductsToPo}>
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
