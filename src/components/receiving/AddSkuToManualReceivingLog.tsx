/* eslint-disable @next/next/no-img-element */
import { useContext, useMemo, useState } from 'react'

import AppContext from '@context/AppContext'
import { NoImageAdress } from '@lib/assetsConstants'
import { SkuToAddPo } from '@typesTs/purchaseOrders'
import axios from 'axios'
import DataTable from '@components/Common/DataTableSC'
import { DebounceInput } from 'react-debounce-input'
import { toast } from 'react-toastify'
import { Button, Col, Modal, ModalBody, ModalHeader, Row, Spinner } from '@/components/migration-ui'
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
      name: <span className='tw:font-extrabold tw:text-[13px]'>Image</span>,
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
      name: <span className='tw:font-extrabold tw:text-[13px]'>Title</span>,
      selector: (row: SkuToAddPo) => {
        return (
          <>
            <span className='tw:text-[11.2px] tw:font-semibold'>{row.title}</span>
            <br />
            <span className='tw:text-[var(--bs-secondary-color)] tw:text-[11.2px] tw:font-normal'>{`${row.sku} / ${row.barcode} / ${row.asin}`}</span>
          </>
        )
      },
      sortable: true,
      wrap: true,
      compact: true,
      grow: 1,
    },
    {
      name: <span className='tw:font-extrabold tw:text-[13px]'></span>,
      selector: (row: SkuToAddPo) => {
        if (skuToAddToPo.some((item) => item.sku == row.sku) || addSkuToReceiving.receivingItems.includes(row.sku)) {
          return <i className='tw:text-[19.5px] tw:text-[var(--bs-secondary-color)] las la-check-circle' />
        } else {
          return <i className='tw:text-[19.5px] tw:text-success las la-plus-circle' style={{ cursor: 'pointer' }} onClick={() => handleAddSkuToList(row)} />
        }
      },
      sortable: false,
      compact: true,
      grow: 0,
    },
  ]

  const columnsSkuListAdded: any = [
    {
      name: <span className='tw:font-extrabold tw:text-[13px]'>Image</span>,
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
      name: <span className='tw:font-extrabold tw:text-[13px]'>Title</span>,
      selector: (row: SkuToAddPo) => {
        return (
          <>
            <span className='tw:text-[11.2px] tw:font-semibold'>{row.title}</span>
            <br />
            <span className='tw:text-[var(--bs-secondary-color)] tw:text-[11.2px] tw:font-normal'>{`${row.sku} / ${row.barcode} / ${row.asin}`}</span>
          </>
        )
      },
      sortable: true,
      wrap: true,
      compact: true,
      grow: 1,
    },
    {
      name: <span className='tw:font-extrabold tw:text-[13px]'>Qty</span>,
      selector: (row: SkuInListToAddToPo) => {
        return (
          <>
            <DebounceInput
              type='number'
              onWheel={(e: any) => e.currentTarget.blur()}
              minLength={1}
              debounceTimeout={300}
              className={'form-control tw:text-[11.2px] tw:m-0 ' + (Number(row.addQty) <= 0 || row.addQty == '' ? 'tw:border-destructive' : '')}
              style={{ maxWidth: '80px' }}
              placeholder='Qty...'
              id='qtyToAdd'
              name='qtyToAdd'
              value={row.addQty}
              onChange={(e) => handleAddQtyToSku(Number(e.target.value), row.sku)}
            />
            {(Number(row.addQty) <= 0 || row.addQty == '') && <span className='tw:text-destructive tw:text-[11.2px]'>Qty Error</span>}
          </>
        )
      },
      sortable: false,
      center: true,
      compact: true,
      grow: 0,
    },
    {
      name: <span className='tw:font-extrabold tw:text-[13px]'></span>,
      selector: (row: SkuInListToAddToPo) => {
        return <i className='tw:text-[22.75px] tw:text-destructive las la-trash-alt tw:ps-4' style={{ cursor: 'pointer' }} onClick={() => handleDeleteFromSkuList(row.sku)} />
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
        className='modal-title tw:pb-0'
        id='myModalLabel'>
        <p>Add Products to Receiving</p>
        <span className='tw:text-[16.25px] tw:mb-0 tw:font-normal tw:text-primary'>
          Order Number: <span className='tw:text-[16.25px] tw:font-bold tw:text-black'>{addSkuToReceiving.orderNumber}</span>
        </span>
        <br />
      </ModalHeader>
      <ModalBody>
        <Row>
          <Col sm={6} className='tw:overflow-auto tw:h-full'>
            <Row className='tw:flex tw:flex-col-reverse tw:justify-center tw:items-end tw:gap-2 tw:mb-2 tw:md:flex-row tw:md:justify-between tw:md:items-center'>
              <span className='tw:text-[19.5px] tw:font-semibold tw:text-[var(--bs-secondary-color)] tw:flex-1'>SKU List</span>
              <div className='tw:w-full tw:md:w-7/12'>
                <div className='tw:flex tw:flex-row tw:justify-end tw:items-center tw:p-0'>
                  <div className='tw:relative tw:flex tw:rounded-md tw:w-full tw:overflow-hidden' style={{ border: '1px solid #E1E3E5' }}>
                    <DebounceInput
                      minLength={2}
                      debounceTimeout={500}
                      type='text'
                      className='tw:h-9 tw:w-full tw:border-0 tw:bg-white tw:px-3 tw:text-sm tw:outline-none'
                      placeholder='Search...'
                      id='search-options'
                      value={searchValue}
                      onKeyDown={(e) => (e.key == 'Enter' ? e.preventDefault() : null)}
                      onChange={(e) => {
                        setSearchValue(e.target.value)
                      }}
                    />
                    <span
                      className='tw:flex tw:items-center tw:justify-center tw:bg-white'
                      style={{
                        cursor: 'pointer',
                      }}
                      onClick={() => setSearchValue('')}>
                      <i className='mdi mdi-window-close tw:text-[19.5px] tw:m-0 tw:px-2 tw:py-0 tw:text-[var(--bs-secondary-color)]' />
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
                className='tw:pb-6'
              />
            </Col>
          </Col>
          <Col sm={6}>
            <Row className='tw:flex tw:flex-col-reverse tw:justify-center tw:items-end tw:gap-2 tw:mb-2 tw:md:flex-row tw:md:justify-end tw:md:items-center'>
              <span className='tw:text-[19.5px] tw:font-semibold tw:text-[var(--bs-secondary-color)]'>SKU List to Add to PO</span>
            </Row>
            <Col sm={12} style={{ height: '60vh', overflowX: 'hidden', overflowY: 'auto' }}>
              <DataTable columns={columnsSkuListAdded} data={skuToAddToPo || []} striped={true} dense={true} fixedHeader={true} fixedHeaderScrollHeight='60vh' />
            </Col>
          </Col>
          <Row md={12}>
            <div className='tw:text-end'>
              <Button disabled={hasErrors} type='button' color='success' onClick={handleSubmitProductsToManualReceiving}>
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
