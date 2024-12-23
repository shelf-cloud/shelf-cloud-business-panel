/* eslint-disable @next/next/no-img-element */
import React, { useContext, useState } from 'react'
import { Button, Input, Modal, ModalBody, ModalHeader, Row, Spinner } from 'reactstrap'
import { toast } from 'react-toastify'
import { useSWRConfig } from 'swr'
import axios from 'axios'
import { useRouter } from 'next/router'
import AppContext from '@context/AppContext'
import { PurchaseOrderItem } from '@typesTs/purchaseOrders'
import { FormatCurrency, FormatIntNumber } from '@lib/FormatNumbers'
import { NoImageAdress } from '@lib/assetsConstants'

type Props = {
  showEditOrderQty: {
    show: boolean
    poId: number
    orderNumber: string
    poItems: PurchaseOrderItem[]
  }
  setshowEditOrderQty: (prev: any) => void
  loading: boolean
  setLoading: (state: boolean) => void
}

const Edit_PO_Ordered_Qty = ({ showEditOrderQty, setshowEditOrderQty, loading, setLoading }: Props) => {
  const { state }: any = useContext(AppContext)
  const router = useRouter()
  const { status, organizeBy } = router.query
  const { mutate } = useSWRConfig()
  const [newOrderedQtyItems, setnewOrderedQtyItems] = useState(JSON.parse(JSON.stringify(showEditOrderQty.poItems)))
  const [error, setError] = useState(false)

  const handleEditOrderedQtyFromPO = async () => {
    setLoading(true)
    const response = await axios.post(`/api/purchaseOrders/editPoOrderedQty?region=${state.currentRegion}&businessId=${state.user.businessId}`, {
      poId: showEditOrderQty.poId,
      orderNumber: showEditOrderQty.orderNumber,
      poItems: newOrderedQtyItems,
    })

    if (!response.data.error) {
      setshowEditOrderQty({
        show: false,
        poId: 0,
        orderNumber: '',
        poItems: [],
      })
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
          poId: 0,
          orderNumber: '',
          poItems: [],
        })
      }}>
      <ModalHeader
        toggle={() => {
          setshowEditOrderQty({
            show: false,
            poId: 0,
            orderNumber: '',
            poItems: [],
          })
        }}
        className='modal-title'
        id='myModalLabel'>
        Edit PO Quantities
      </ModalHeader>
      <ModalBody>
        <Row>
          <h5 className='fs-4 mb-4 fw-semibold text-primary'>
            Purchase Order: <span className='fs-4 fw-bold text-black'>{showEditOrderQty.orderNumber}</span>
          </h5>
          <div className='table-responsive'>
            <table className='table table-sm align-middle table-borderless mb-0'>
              <thead className='table-light'>
                <tr>
                  <th scope='col' className='text-center'>
                    Image
                  </th>
                  <th scope='col'>Title</th>
                  <th className='text-center' scope='col'>
                    SKU
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
                </tr>
              </thead>
              <tbody>
                {newOrderedQtyItems?.map((product: PurchaseOrderItem, key: number) => (
                  <tr key={`${key}-${product.sku}`} className='border-bottom py-2'>
                    <td className='text-center'>
                      <div
                        style={{
                          width: '100%',
                          maxWidth: '80px',
                          height: '50px',
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
                    </td>
                    <td className='fs-6 fw-semibold'>
                      {product.title}

                      {product.asin && (
                        <>
                          <br />
                          <span className='text-muted fs-6 fw-normal'>{product.asin}</span>
                        </>
                      )}
                      {product.barcode && (
                        <>
                          <br />
                          <span className='text-muted fs-6 fw-normal'>{product.barcode}</span>
                        </>
                      )}
                    </td>
                    <td className='fs-6 text-center text-nowrap'>{product.sku}</td>
                    <td className='fs-6 text-center text-nowrap'>{FormatCurrency(state.currentRegion, product.orderQty * product.sellerCost || 0)}</td>
                    <td className='fs-6 text-center text-nowrap'>
                      <Input
                        type='number'
                        onWheel={(e) => e.currentTarget.blur()}
                        className='form-control fs-6 m-0 shadow-sm'
                        style={{ maxWidth: '60px' }}
                        placeholder='Qty'
                        id='newOrderQty'
                        name='newOrderQty'
                        bsSize='sm'
                        min={0}
                        value={product.orderQty || 0}
                        onChange={(e) => {
                          e.target.closest('tr')?.classList.add('bg-warning', 'bg-opacity-25')
                          if (parseInt(e.target.value) <= 0 || parseInt(e.target.value) < product.receivedQty + product.inboundQty) {
                            setError(true)
                            e.target.classList.remove('border-warning')
                          } else {
                            setError(false)
                          }
                          const newOrderedQty = [...newOrderedQtyItems]
                          newOrderedQty[key].orderQty = parseInt(e.target.value)
                          setnewOrderedQtyItems(newOrderedQty)
                        }}
                        invalid={product.orderQty <= 0 || product.orderQty < product.receivedQty + product.inboundQty ? true : false}
                      />
                    </td>
                    <td className='fs-6 text-center text-nowrap'>{FormatIntNumber(state.currentRegion, product.inboundQty)}</td>
                    <td className='fs-6 text-center text-nowrap'>{FormatIntNumber(state.currentRegion, product.receivedQty)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Row md={12}>
            <div className='text-end mt-4'>
              <Button disabled={loading || error ? true : false} type='button' color='success' className='btn' onClick={handleEditOrderedQtyFromPO}>
                {loading ? <Spinner color='#fff' /> : 'Save Changes'}
              </Button>
            </div>
          </Row>
        </Row>
      </ModalBody>
    </Modal>
  )
}

export default Edit_PO_Ordered_Qty
