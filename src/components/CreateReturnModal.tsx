/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useContext } from 'react'
import { Button, Modal, ModalBody, ModalHeader, Spinner } from 'reactstrap'
import AppContext from '@context/AppContext'
import axios from 'axios'
// import * as Yup from 'yup'
// import { useFormik } from 'formik'
import { toast } from 'react-toastify'
import { useSWRConfig } from 'swr'
import { OrderRowType } from '@typings'

type Props = {
  apiMutateLink: string
}

function CreateReturnModal({ apiMutateLink }: Props) {
  const { mutate } = useSWRConfig()
  const { state, setShowCreateReturnModal }: any = useContext(AppContext)
  const [orderInfo, setOrderInfo] = useState<OrderRowType>()
  const [loading, setLoading] = useState(true)
  const [loadingConfirmation, setLoadingConfirmation] = useState(false)
  const [returnItemsList, setReturnItemsList] = useState<any>([])

  useEffect(() => {
    const bringProductBins = async () => {
      const response: any = await axios(
        `/api/getShipmentOrder?businessId=${state.user.businessId}&orderId=${state.modalCreateReturnInfo.orderId}`
      )
      setOrderInfo(response.data)
      setReturnItemsList(
        response.data.orderItems.map((item: any) => {
          return {
            sku: item.sku,
            name: item.name,
            quantity: Number(item.quantity),
            unitPrice: 0,
          }
        })
      )
      setLoading(false)
    }
    bringProductBins()
    return () => {
      setLoading(true)
      setReturnItemsList([])
    }
  }, [
    state.modalCreateReturnInfo.businessId,
    state.modalCreateReturnInfo.orderId,
  ])

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
    setLoadingConfirmation(true)
    const response = await axios.post(
      `api/createReturnFromOrder?businessId=${state.user.businessId}&orderId=${state.modalCreateReturnInfo.orderId}`,
      {
        returnItems: returnItemsList,
      }
    )

    if (!response.data.error) {
      setShowCreateReturnModal(false)
      setLoadingConfirmation(false)
      toast.success(response.data.msg)
      mutate(apiMutateLink)
    } else {
      setLoadingConfirmation(false)
      toast.error(response.data.msg)
    }
  }

  return (
    <Modal
      size="xl"
      id="myModal"
      isOpen={state.showCreateReturnModal}
      toggle={() => {
        setShowCreateReturnModal(!state.showCreateReturnModal)
      }}
    >
      <ModalHeader
        toggle={() => {
          setShowCreateReturnModal(!state.showCreateReturnModal)
        }}
      >
        <h3 className="modal-title" id="myModalLabel">
          Create Return
        </h3>
        {loading && <Spinner />}
      </ModalHeader>
      <ModalBody>
        {!loading && (
          <>
            <h4>
              <span className="fw-bold fs-4">Order: </span>
              {orderInfo?.orderNumber}
            </h4>
            <h4>
              <span className="fw-bold fs-4">Status: </span>
              {orderInfo?.orderStatus}
            </h4>
            {orderInfo?.totalItems == 1 ? (
              <table className="table table-striped table-responsive align-middle">
                <thead className="table-light">
                  <tr className="fw-bold">
                    <th>Item</th>
                    <th className="text-center">Qty</th>
                  </tr>
                </thead>
                <tbody>
                  {orderInfo?.orderItems.map((item: any) => (
                    <tr key={item.sku}>
                      <td>
                        <span className="fw-bold">{item.name}</span>
                        <br />
                        SKU: {item.sku}
                      </td>
                      <td className="fw-bold text-center">{item.quantity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <table className="table table-striped table-responsive align-middle">
                <thead className="table-light">
                  <tr className="fw-bold">
                    <th>Item</th>
                    <th className="text-center">Qty</th>
                  </tr>
                </thead>
                <tbody>
                  {orderInfo?.orderItems.map((item: any, index: number) => (
                    <tr key={item.sku}>
                      <td>
                        <span className="fw-bold">{item.name}</span>
                        <br />
                        SKU: {item.sku}
                      </td>
                      <td className="fw-bold text-center">
                        <div className="d-flex justify-content-center align-items-center flex-nowrap gap-3 fs-4">
                          <select
                            className="form-select"
                            value={returnItemsList[index].quantity}
                            style={{ width: '80px' }}
                            onChange={(e) => handleOnChangeQty(e, item.sku)}
                          >
                            {Array(item.quantity)
                              .fill(0)
                              .map((_item: any, index: number) => (
                                <option key={index + 1} value={index + 1}>
                                  {index + 1}
                                </option>
                              ))}
                          </select>
                          <p className="m-0">of</p>
                          {item.quantity}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            <div className="d-flex justify-content-end align-items-center">
              <Button color="success" onClick={() => handleConfirmReturn()}>
                {loadingConfirmation ? (
                  <Spinner color="light" />
                ) : (
                  'Confirm Return'
                )}
              </Button>
            </div>
          </>
        )}
      </ModalBody>
    </Modal>
  )
}

export default CreateReturnModal
