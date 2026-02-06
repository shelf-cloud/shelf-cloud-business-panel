 
import { useContext, useState } from 'react'

import AppContext from '@context/AppContext'
import { Shipment } from '@typesTs/shipments/shipments'
import axios from 'axios'
import { toast } from 'react-toastify'
import { Button, Modal, ModalBody, ModalHeader, Spinner } from 'reactstrap'

type Props = {
  data: Shipment
  mutateShipments?: () => void
}

function CreateReturnModal({ data, mutateShipments }: Props) {
  const { state, setShowCreateReturnModal }: any = useContext(AppContext)
  const [loadingConfirmation, setLoadingConfirmation] = useState(false)
  const [returnItemsList, setReturnItemsList] = useState<any>(
    data.orderItems.map((item: any) => {
      return {
        sku: item.sku,
        name: item.name,
        quantity: Number(item.quantity),
        unitPrice: 0,
      }
    })
  )
  const [errorMsg, setErrorMsg] = useState(false)

  const handleOnChangeQty = (e: any, sku: string) => {
    setReturnItemsList(
      returnItemsList.map((item: any) => {
        if (item.sku == sku) {
          item.quantity = Number(e.target.value)
        }
        return item
      })
    )
  }

  const handleConfirmReturn = async () => {
    setErrorMsg(false)
    setLoadingConfirmation(true)
    const finalReturnItems = returnItemsList.filter((item: any) => item.quantity > 0)
    if (finalReturnItems.length == 0) {
      setErrorMsg(true)
      setLoadingConfirmation(false)
      return
    }

    const response = await axios.post(
      `api/createReturnFromOrder?region=${state.currentRegion}&businessId=${state.user.businessId}&orderId=${state.modalCreateReturnInfo.orderId}`,
      {
        returnItems: finalReturnItems,
      }
    )

    if (!response.data.error) {
      setShowCreateReturnModal(false)
      setLoadingConfirmation(false)
      toast.success(response.data.msg)
      mutateShipments && mutateShipments()
    } else {
      setLoadingConfirmation(false)
      toast.error(response.data.msg)
    }
  }

  return (
    <Modal
      size='xl'
      id='myModal'
      isOpen={state.showCreateReturnModal}
      toggle={() => {
        setShowCreateReturnModal(!state.showCreateReturnModal)
      }}>
      <ModalHeader
        toggle={() => {
          setShowCreateReturnModal(!state.showCreateReturnModal)
        }}>
        <h3 className='modal-title' id='myModalLabel'>
          Create Return
        </h3>
      </ModalHeader>
      <ModalBody>
        <h4 className='fw-normal fs-5 text-muted'>
          Order: <span className='fw-bold text-black'>{data?.orderNumber}</span>
        </h4>
        <h4 className='fw-normal fs-5 text-muted'>
          Status: <span className='fw-bold text-black capitalize'>{data?.orderStatus}</span>
        </h4>
        {data?.totalItems == 1 ? (
          <table className='table table-striped table-responsive align-middle'>
            <thead className='table-light'>
              <tr className='fw-bold'>
                <th>Item</th>
                <th className='text-center'>Qty</th>
              </tr>
            </thead>
            <tbody className='fs-6'>
              {data?.orderItems.map((item: any) => (
                <tr key={item.sku}>
                  <td>
                    <span className='fw-bold'>{item.name || item.title}</span>
                    <br />
                    SKU: {item.sku}
                  </td>
                  <td className='fw-bold text-center'>{item.quantity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <table className='table table-striped table-responsive align-middle'>
            <thead className='table-light'>
              <tr className='fw-bold'>
                <th>Item</th>
                <th className='text-center'>Qty</th>
              </tr>
            </thead>
            <tbody className='fs-6'>
              {data?.orderItems.map((item: any, index: number) => (
                <tr key={item.sku}>
                  <td>
                    <span className='fw-bold'>{item.name || item.title}</span>
                    <br />
                    SKU: {item.sku}
                  </td>
                  <td className='fw-bold text-center'>
                    <div className='d-flex justify-content-center align-items-center flex-nowrap gap-3 fs-6'>
                      <select className='form-select fs-6' value={returnItemsList[index].quantity} style={{ width: '80px' }} onChange={(e) => handleOnChangeQty(e, item.sku)}>
                        <option key={0} value={0}>
                          {0}
                        </option>
                        {Array(parseInt(item.quantity))
                          .fill(0)
                          .map((_item: any, index: number) => (
                            <option key={index + 1} value={index + 1}>
                              {index + 1}
                            </option>
                          ))}
                      </select>
                      <p className='m-0'>of</p>
                      {item.quantity}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {errorMsg && (
          <div className='d-flex justify-content-start align-items-center'>
            <p className='text-danger fs-6'>You must select at least 1 Quantity to return!</p>
          </div>
        )}
        <div className='d-flex justify-content-end align-items-center'>
          <Button disabled={loadingConfirmation} color='success' onClick={() => handleConfirmReturn()}>
            {loadingConfirmation ? <Spinner color='light' /> : 'Confirm Return'}
          </Button>
        </div>
      </ModalBody>
    </Modal>
  )
}

export default CreateReturnModal
