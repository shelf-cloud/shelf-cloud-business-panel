/* eslint-disable @next/next/no-img-element */
import AppContext from '@context/AppContext'
import React, { useContext, useEffect, useMemo, useState } from 'react'
import { Button, Col, Modal, ModalBody, ModalHeader, Row, Spinner } from 'reactstrap'
import axios from 'axios'
import useSWR from 'swr'
import { toast } from 'react-toastify'
import { useSWRConfig } from 'swr'
import { useRouter } from 'next/router'
import { SkuToAddPo } from '@typesTs/purchaseOrders'
import DataTable from 'react-data-table-component'
import { DebounceInput } from 'react-debounce-input'

interface SkuInListToAddToPo extends SkuToAddPo {
  addQty: number | string
}

const Add_Sku_To_Purchase_Order = ({}) => {
  const router = useRouter()
  const { status, organizeBy } = router.query
  const { mutate } = useSWRConfig()
  const { state, setShowAddSkuToPurchaseOrder }: any = useContext(AppContext)
  const [loading, setloading] = useState(false)
  const [hasErrors, setHasErrors] = useState(false)
  const [searchValue, setSearchValue] = useState<any>('')
  const [skuToAddToPo, setSkuToAddToPo] = useState<SkuInListToAddToPo[]>([])
  const fetcher = (endPoint: string) => axios(endPoint).then((res) => res.data)
  const { data: skuList }: { data?: SkuToAddPo[] } = useSWR(
    state.user.businessId ? `/api/purchaseOrders/getSkusToAddToPo?region=${state.currentRegion}&businessId=${state.user.businessId}&supplier=${state.modalAddSkuToPurchaseOrder?.suppliersName}` : null,
    fetcher
  )

  useEffect(() => {
    skuToAddToPo.length <= 0 ? setHasErrors(true) : setHasErrors(false)

    if (skuToAddToPo.length > 0) {
      skuToAddToPo.some((skus: SkuInListToAddToPo) => Number(skus.addQty) <= 0 || skus.addQty == '') ? setHasErrors(true) : setHasErrors(false)
    }
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
      name: <span className='fw-bolder fs-6'>Image</span>,
      selector: (row: SkuToAddPo) => {
        return (
          <div
            style={{
              width: '100%',
              maxWidth: '80px',
              height: '40px',
              margin: '2px 0px',
              position: 'relative',
            }}>
            <img
              loading='lazy'
              src={
                row.image
                  ? row.image
                  : 'https://firebasestorage.googleapis.com/v0/b/etiquetas-fba.appspot.com/o/image%2Fno-image.png?alt=media&token=c2232af5-43f6-4739-84eb-1d4803c44770'
              }
              onError={(e) =>
                (e.currentTarget.src =
                  'https://firebasestorage.googleapis.com/v0/b/etiquetas-fba.appspot.com/o/image%2Fno-image.png?alt=media&token=c2232af5-43f6-4739-84eb-1d4803c44770')
              }
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
      name: <span className='fw-bolder fs-6'>Title</span>,
      selector: (row: SkuToAddPo) => {
        return (
          <>
            <span className='fs-6 fw-semibold'>{row.title}</span>
            <br />
            <span className='text-muted fs-6 fw-normal'>{`${row.sku} / ${row.barcode} / ${row.asin}`}</span>
          </>
        )
      },
      sortable: true,
      wrap: true,
      compact: true,
      grow: 1,
    },
    {
      name: <span className='fw-bolder fs-6'></span>,
      selector: (row: SkuToAddPo) => {
        if (skuToAddToPo.some((item) => item.sku == row.sku)) {
          return <i className='fs-3 text-muted las la-check-circle' />
        } else {
          return <i className='fs-3 text-success las la-plus-circle' style={{ cursor: 'pointer' }} onClick={() => handleAddSkuToList(row)} />
        }
      },
      sortable: false,
      compact: true,
      grow: 0,
    },
  ]
  const columnsSkuListAdded: any = [
    {
      name: <span className='fw-bolder fs-6'>Image</span>,
      selector: (row: SkuToAddPo) => {
        return (
          <div
            style={{
              width: '100%',
              maxWidth: '80px',
              height: '40px',
              margin: '2px 0px',
              position: 'relative',
            }}>
            <img
              src={
                row.image
                  ? row.image
                  : 'https://firebasestorage.googleapis.com/v0/b/etiquetas-fba.appspot.com/o/image%2Fno-image.png?alt=media&token=c2232af5-43f6-4739-84eb-1d4803c44770'
              }
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
      name: <span className='fw-bolder fs-6'>Title</span>,
      selector: (row: SkuToAddPo) => {
        return (
          <>
            <span className='fs-6 fw-semibold'>{row.title}</span>
            <br />
            <span className='text-muted fs-6 fw-normal'>{`${row.sku} / ${row.barcode} / ${row.asin}`}</span>
          </>
        )
      },
      sortable: true,
      wrap: true,
      compact: true,
      grow: 1,
    },
    {
      name: <span className='fw-bolder fs-6'>Qty</span>,
      selector: (row: SkuInListToAddToPo) => {
        return (
          <>
            <DebounceInput
              type='number'
              minLength={1}
              debounceTimeout={300}
              className={'form-control fs-6 m-0 ' + (Number(row.addQty) <= 0 || row.addQty == '' ? 'border-danger' : '')}
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
      name: <span className='fw-bolder fs-6'></span>,
      selector: (row: SkuInListToAddToPo) => {
        return <i className='fs-3 text-danger las la-trash-alt ps-3' style={{ cursor: 'pointer' }} onClick={() => handleDeleteFromSkuList(row.sku)} />
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

  const handleSubmitProductsToPo = async () => {
    setloading(true)

    const response = await axios.post(`/api/purchaseOrders/addSkusToPo?region=${state.currentRegion}&businessId=${state.user.businessId}`, {
      poId: state.modalAddSkuToPurchaseOrder?.poId,
      orderNumber: state.modalAddSkuToPurchaseOrder?.orderNumber,
      skuToAddToPo,
    })

    if (!response.data.error) {
      setShowAddSkuToPurchaseOrder(false)
      toast.success(response.data.msg)
      if (organizeBy == 'suppliers') {
        mutate(`/api/purchaseOrders/getpurchaseOrdersBySuppliers?region=${state.currentRegion}&businessId=${state.user.businessId}&status=${status}`)
      } else if (organizeBy == 'orders') {
        mutate(`/api/purchaseOrders/getpurchaseOrdersByOrders?region=${state.currentRegion}&businessId=${state.user.businessId}&status=${status}`)
      } else if (organizeBy == 'sku') {
        mutate(`/api/purchaseOrders/getpurchaseOrdersBySku?region=${state.currentRegion}&businessId=${state.user.businessId}&status=${status}`)
      }
    } else {
      toast.error(response.data.msg)
    }
    setloading(false)
  }
  
  return (
    <Modal
      fade={false}
      scrollable={true}
      size='xl'
      id='addSkuToPoModal'
      isOpen={state.showAddSkuToPurchaseOrder}
      toggle={() => {
        setShowAddSkuToPurchaseOrder(!state.showAddSkuToPurchaseOrder)
      }}>
      <ModalHeader
        toggle={() => {
          setShowAddSkuToPurchaseOrder(!state.showAddSkuToPurchaseOrder)
        }}
        className='modal-title pb-0'
        id='myModalLabel'>
        <p>Add Products to PO</p>
        <span className='fs-4 mb-0 fw-normal text-primary'>
          Purchase Order: <span className='fs-4 fw-bold text-black'>{state.modalAddSkuToPurchaseOrder?.orderNumber}</span>
        </span>
        <br />
        <span className='fs-4 mb-0 fw-normal text-primary'>
          Supplier: <span className='fs-4 fw-bold text-black'>{state.modalAddSkuToPurchaseOrder?.suppliersName}</span>
        </span>
      </ModalHeader>
      <ModalBody>
        <Row>
          <Col md={5} className='overflow-auto h-100'>
            <Row className='d-flex flex-column-reverse justify-content-center align-items-end gap-2 mb-2 flex-md-row justify-content-md-between align-items-md-center'>
              <span className='fs-2 fw-semibold text-muted flex-1'>SKU List</span>
              <div className='col-sm-12 col-md-7'>
                <div className='app-search d-flex flex-row justify-content-end align-items-center p-0'>
                  <div className='position-relative d-flex rounded-3 w-100 overflow-hidden' style={{ border: '1px solid #E1E3E5' }}>
                    <DebounceInput
                      minLength={3}
                      debounceTimeout={400}
                      type='text'
                      className='form-control input_background_white'
                      placeholder='Search...'
                      id='search-options'
                      value={searchValue}
                      onKeyDown={(e) => (e.key == 'Enter' ? e.preventDefault() : null)}
                      onChange={(e) => {
                        setSearchValue(e.target.value)
                      }}
                    />
                    <span className='mdi mdi-magnify search-widget-icon fs-4'></span>
                    <span
                      className='d-flex align-items-center justify-content-center input_background_white'
                      style={{
                        cursor: 'pointer',
                      }}
                      onClick={() => setSearchValue('')}>
                      <i className='mdi mdi-window-close fs-4 m-0 px-2 py-0 text-muted' />
                    </span>
                  </div>
                </div>
              </div>
            </Row>
            <Col sm={12} style={{ height: '60vh', overflowX: 'hidden', overflowY: 'auto' }}>
              <DataTable
                columns={columnsSkuListToAdd}
                data={filterDataTable || []}
                progressPending={skuList ? false : true}
                striped={true}
                dense={true}
                fixedHeader={true}
                fixedHeaderScrollHeight='60vh'
                className='pb-4'
              />
            </Col>
          </Col>
          <Col md={7}>
            <Row className='d-flex flex-column-reverse justify-content-center align-items-end gap-2 mb-2 flex-md-row justify-content-md-end align-items-md-center'>
              <span className='fs-2 fw-semibold text-muted'>SKU List to Add to PO</span>
            </Row>
            <Col sm={12} style={{ height: '60vh', overflowX: 'hidden', overflowY: 'auto' }}>
              <DataTable columns={columnsSkuListAdded} data={skuToAddToPo || []} striped={true} dense={true} fixedHeader={true} fixedHeaderScrollHeight='60vh' />
            </Col>
          </Col>
          <Row md={12}>
            <div className='text-end'>
              <Button disabled={hasErrors} type='button' color='success' className='btn' onClick={handleSubmitProductsToPo}>
                {loading ? <Spinner color='#fff' /> : 'Add Products'}
              </Button>
            </div>
          </Row>
        </Row>
      </ModalBody>
    </Modal>
  )
}

export default Add_Sku_To_Purchase_Order
