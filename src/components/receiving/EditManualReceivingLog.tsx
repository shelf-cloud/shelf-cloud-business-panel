/* eslint-disable @next/next/no-img-element */
import React, { useContext, useState } from 'react'

import AppContext from '@context/AppContext'
import { FormatIntNumber } from '@lib/FormatNumbers'
import { ShipmentOrderItem } from '@typings'
import axios from 'axios'
import { toast } from 'react-toastify'
import { Button, Input, Modal, ModalBody, ModalHeader, Row, Spinner } from 'reactstrap'

type Props = {
  showEditOrderQty: {
    show: boolean
    receivingId: number
    orderNumber: string
    receivingItems: ShipmentOrderItem[]
  }
  setshowEditOrderQty: (prev: any) => void
  mutateReceivings?: () => void
}

const EditManualReceivingLog = ({ showEditOrderQty, setshowEditOrderQty, mutateReceivings }: Props) => {
  const { state }: any = useContext(AppContext)
  const [newOrderedQtyItems, setnewOrderedQtyItems] = useState(structuredClone(showEditOrderQty.receivingItems))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)

  const handleEditManualReceiving = async () => {
    setLoading(true)

    const addSkusToManualReceiving = toast.loading('Adding Products to Manual Receiving...')

    const response = await axios.post(`/api/receivings/editManualReceiving?region=${state.currentRegion}&businessId=${state.user.businessId}`, {
      receivingId: showEditOrderQty.receivingId,
      orderNumber: showEditOrderQty.orderNumber,
      receivingItems: newOrderedQtyItems,
    })

    if (!response.data.error) {
      toast.update(addSkusToManualReceiving, {
        render: response.data.message,
        type: 'success',
        isLoading: false,
        autoClose: 3000,
      })
      mutateReceivings && mutateReceivings()
      setshowEditOrderQty({
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

    setLoading(false)
  }

  return (
    <Modal
      fade={false}
      size='lg'
      id='confirmDelete'
      isOpen={showEditOrderQty.show}
      toggle={() => {
        setshowEditOrderQty({
          show: false,
          receivingId: 0,
          orderNumber: '',
          receivingItems: [],
        })
      }}>
      <ModalHeader
        toggle={() => {
          setshowEditOrderQty({
            show: false,
            receivingId: 0,
            orderNumber: '',
            receivingItems: [],
          })
        }}
        className='modal-title'
        id='myModalLabel'>
        Edit Receiving Quantities
      </ModalHeader>
      <ModalBody>
        <Row>
          <h5 className='fs-5 mb-4 fw-semibold text-primary'>
            Purchase Order: <span className='fs-5 fw-bold text-black'>{showEditOrderQty.orderNumber}</span>
          </h5>
          <div className='table-responsive'>
            <table className='table table-sm align-middle table-borderless mb-0'>
              <thead className='table-light'>
                <tr>
                  <th scope='col'>Title</th>
                  <th className='text-center' scope='col'>
                    SKU
                  </th>
                  <th className='text-center' scope='col'>
                    Qty
                  </th>
                  <th className='text-center' scope='col'>
                    Qty Received
                  </th>
                </tr>
              </thead>
              <tbody className='fs-7'>
                {newOrderedQtyItems?.map((product: ShipmentOrderItem, key: number) => (
                  <tr key={`${key}-${product.sku}`} className='border-bottom py-2'>
                    <td className='fw-semibold'>{product.name || product.title}</td>
                    <td className='text-center text-nowrap'>{product.sku}</td>
                    <td className='text-center text-nowrap'>
                      <Input
                        type='number'
                        onWheel={(e) => e.currentTarget.blur()}
                        className='form-control fs-7 mx-auto text-center'
                        style={{ maxWidth: '80px' }}
                        placeholder='Qty'
                        id='newOrderQty'
                        name='newOrderQty'
                        bsSize='sm'
                        min={0}
                        value={product.quantity || 0}
                        onChange={(e) => {
                          e.target.closest('tr')?.classList.add('bg-warning', 'bg-opacity-25')
                          if (parseInt(e.target.value) <= 0 || parseInt(e.target.value) < product.qtyReceived!) {
                            setError(true)
                            e.target.classList.remove('border-warning')
                          } else {
                            setError(false)
                          }
                          const newOrderedQty = [...newOrderedQtyItems]
                          newOrderedQty[key].quantity = parseInt(e.target.value)
                          setnewOrderedQtyItems(newOrderedQty)
                        }}
                        invalid={product.quantity <= 0 || product.quantity < product.qtyReceived! ? true : false}
                      />
                    </td>
                    <td className='text-center text-nowrap'>{FormatIntNumber(state.currentRegion, product.qtyReceived!)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Row md={12}>
            <div className='text-end mt-4'>
              <Button disabled={loading || error ? true : false} type='button' color='success' className='btn fs-7' onClick={handleEditManualReceiving}>
                {loading ? (
                  <span>
                    <Spinner color='#fff' size={'sm'} /> Saving...
                  </span>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </div>
          </Row>
        </Row>
      </ModalBody>
    </Modal>
  )
}

export default EditManualReceivingLog
