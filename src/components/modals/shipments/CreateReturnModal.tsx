 
import { useContext, useState } from 'react'

import AppContext from '@context/AppContext'
import { Shipment } from '@typesTs/shipments/shipments'
import axios from 'axios'
import { toast } from 'react-toastify'
import { Button, Modal, ModalBody, ModalHeader, Spinner } from '@/components/migration-ui'

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
        <h4 className='tw:font-normal tw:text-[16.25px] tw:text-[var(--bs-secondary-color)]'>
          Order: <span className='tw:font-bold tw:text-black'>{data?.orderNumber}</span>
        </h4>
        <h4 className='tw:font-normal tw:text-[16.25px] tw:text-[var(--bs-secondary-color)]'>
          Status: <span className='tw:font-bold tw:text-black tw:capitalize'>{data?.orderStatus}</span>
        </h4>
        {data?.totalItems == 1 ? (
          <table className='tw:w-full tw:align-middle tw:text-[13px] tw:[&_th]:px-2 tw:[&_th]:py-1 tw:[&_td]:px-2 tw:[&_td]:py-1 tw:[&_tbody_tr:nth-child(odd)]:bg-[var(--vz-light)]'>
            <thead className='tw:bg-[color:var(--vz-light)]'>
              <tr className='tw:font-bold'>
                <th>Item</th>
                <th className='tw:text-center'>Qty</th>
              </tr>
            </thead>
            <tbody>
              {data?.orderItems.map((item: any) => (
                <tr key={item.sku}>
                  <td>
                    <span className='tw:font-bold'>{item.name || item.title}</span>
                    <br />
                    SKU: {item.sku}
                  </td>
                  <td className='tw:font-bold tw:text-center'>{item.quantity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <table className='tw:w-full tw:align-middle tw:text-[13px] tw:[&_th]:px-2 tw:[&_th]:py-1 tw:[&_td]:px-2 tw:[&_td]:py-1 tw:[&_tbody_tr:nth-child(odd)]:bg-[var(--vz-light)]'>
            <thead className='tw:bg-[color:var(--vz-light)]'>
              <tr className='tw:font-bold'>
                <th>Item</th>
                <th className='tw:text-center'>Qty</th>
              </tr>
            </thead>
            <tbody>
              {data?.orderItems.map((item: any, index: number) => (
                <tr key={item.sku}>
                  <td>
                    <span className='tw:font-bold'>{item.name || item.title}</span>
                    <br />
                    SKU: {item.sku}
                  </td>
                  <td className='tw:font-bold tw:text-center'>
                    <div className='tw:flex tw:justify-center tw:items-center tw:flex-nowrap tw:gap-4 tw:text-[13px]'>
                      <select className='form-select tw:text-[13px]' value={returnItemsList[index].quantity} style={{ width: '80px' }} onChange={(e) => handleOnChangeQty(e, item.sku)}>
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
                      <p className='tw:m-0'>of</p>
                      {item.quantity}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {errorMsg && (
          <div className='tw:flex tw:justify-start tw:items-center'>
            <p className='tw:text-danger tw:text-[13px]'>You must select at least 1 Quantity to return!</p>
          </div>
        )}
        <div className='tw:flex tw:justify-end tw:items-center'>
          <Button disabled={loadingConfirmation} color='success' onClick={() => handleConfirmReturn()}>
            {loadingConfirmation ? <Spinner color='light' /> : 'Confirm Return'}
          </Button>
        </div>
      </ModalBody>
    </Modal>
  )
}

export default CreateReturnModal
