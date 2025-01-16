/* eslint-disable @next/next/no-img-element */
import AppContext from '@context/AppContext'
import React, { useContext, useEffect, useMemo, useState } from 'react'
import { Button, Col, Modal, ModalBody, ModalHeader, Row, Spinner } from 'reactstrap'
import axios from 'axios'
import useSWR from 'swr'
import { toast } from 'react-toastify'
import { SkuToAddPo } from '@typesTs/purchaseOrders'
import DataTable from 'react-data-table-component'
import { DebounceInput } from 'react-debounce-input'
import { NoImageAdress } from '@lib/assetsConstants'

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
  const [hasErrors, setHasErrors] = useState(false)
  const [searchValue, setSearchValue] = useState<any>('')
  const [skuToAddToPo, setSkuToAddToPo] = useState<SkuInListToAddToPo[]>([])

  const { data: skuList }: { data?: SkuToAddPo[] } = useSWR(
    state.user.businessId ? `/api/receivings/getSkusToAddToManualReceiving?region=${state.currentRegion}&businessId=${state.user.businessId}` : null,
    fetcher,
    { revalidateOnFocus: false }
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
      name: <span className='fw-bolder fs-6'>Title</span>,
      selector: (row: SkuToAddPo) => {
        return (
          <>
            <span className='fs-7 fw-semibold'>{row.title}</span>
            <br />
            <span className='text-muted fs-7 fw-normal'>{`${row.sku} / ${row.barcode} / ${row.asin}`}</span>
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
        if (skuToAddToPo.some((item) => item.sku == row.sku) || addSkuToReceiving.receivingItems.includes(row.sku)) {
          return <i className='fs-4 text-muted las la-check-circle' />
        } else {
          return <i className='fs-4 text-success las la-plus-circle' style={{ cursor: 'pointer' }} onClick={() => handleAddSkuToList(row)} />
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
      name: <span className='fw-bolder fs-6'>Title</span>,
      selector: (row: SkuToAddPo) => {
        return (
          <>
            <span className='fs-7 fw-semibold'>{row.title}</span>
            <br />
            <span className='text-muted fs-7 fw-normal'>{`${row.sku} / ${row.barcode} / ${row.asin}`}</span>
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
              onWheel={(e: any) => e.currentTarget.blur()}
              minLength={1}
              debounceTimeout={300}
              className={'form-control fs-7 m-0 ' + (Number(row.addQty) <= 0 || row.addQty == '' ? 'border-danger' : '')}
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

  return (
    <Modal
      fade={false}
      scrollable={true}
      size='xl'
      id='addSkuToPoModal'
      isOpen={addSkuToReceiving.show}
      toggle={() => {
        setshowAddSkuToManualReceiving({
          show: false,
          receivingId: 0,
          orderNumber: '',
          receivingItems: [],
        })
      }}>
      <ModalHeader
        toggle={() => {
          setshowAddSkuToManualReceiving({
            show: false,
            receivingId: 0,
            orderNumber: '',
            receivingItems: [],
          })
        }}
        className='modal-title pb-0'
        id='myModalLabel'>
        <p>Add Products to Receiving</p>
        <span className='fs-5 mb-0 fw-normal text-primary'>
          Order Number: <span className='fs-5 fw-bold text-black'>{addSkuToReceiving.orderNumber}</span>
        </span>
        <br />
      </ModalHeader>
      <ModalBody>
        <Row>
          <Col sm={6} className='overflow-auto h-100'>
            <Row className='d-flex flex-column-reverse justify-content-center align-items-end gap-2 mb-2 flex-md-row justify-content-md-between align-items-md-center'>
              <span className='fs-4 fw-semibold text-muted flex-1'>SKU List</span>
              <div className='col-sm-12 col-md-7'>
                <div className='app-search d-flex flex-row justify-content-end align-items-center p-0'>
                  <div className='position-relative d-flex rounded-3 w-100 overflow-hidden' style={{ border: '1px solid #E1E3E5' }}>
                    <DebounceInput
                      minLength={2}
                      debounceTimeout={500}
                      type='text'
                      className='form-control input_background_white fs-6'
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
          <Col sm={6}>
            <Row className='d-flex flex-column-reverse justify-content-center align-items-end gap-2 mb-2 flex-md-row justify-content-md-end align-items-md-center'>
              <span className='fs-4 fw-semibold text-muted'>SKU List to Add to PO</span>
            </Row>
            <Col sm={12} style={{ height: '60vh', overflowX: 'hidden', overflowY: 'auto' }}>
              <DataTable columns={columnsSkuListAdded} data={skuToAddToPo || []} striped={true} dense={true} fixedHeader={true} fixedHeaderScrollHeight='60vh' />
            </Col>
          </Col>
          <Row md={12}>
            <div className='text-end'>
              <Button disabled={hasErrors} type='button' color='success' className='btn fs-7' onClick={handleSubmitProductsToManualReceiving}>
                {loading ? (
                  <span>
                    <Spinner color='#fff' size={'sm'} /> Adding...
                  </span>
                ) : (
                  'Add Products'
                )}
              </Button>
            </div>
          </Row>
        </Row>
      </ModalBody>
    </Modal>
  )
}

export default AddSkuToManualReceivingLog
