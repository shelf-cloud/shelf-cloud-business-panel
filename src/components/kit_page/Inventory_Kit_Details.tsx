import React, { useContext, useState } from 'react'

import ProductOrderedModals from '@components/modals/productPage/ProductOrderedModals'
import AppContext from '@context/AppContext'
import { AmazonFBA } from '@typings'
import axios from 'axios'
import { useFormik } from 'formik'
import { toast } from 'react-toastify'
import { Button, Form, FormFeedback, Input } from 'reactstrap'
import { useSWRConfig } from 'swr'
import * as Yup from 'yup'

type Props = {
  inventoryId?: number
  sku?: string
  onhand: number
  buffer: number
  available: number
  reserved: number
  receiving: number
  ordered: number
  amazonFBA: AmazonFBA[]
}

const Inventory_Kit_Details = ({ inventoryId, sku, onhand, buffer, available, reserved, receiving, ordered, amazonFBA }: Props) => {
  const { state }: any = useContext(AppContext)
  const { mutate } = useSWRConfig()
  const [showEditFields, setShowEditFields] = useState(false)
  const [showEditButton, setShowEditButton] = useState({ display: 'none' })
  const [showOrderedModal, setshowOrderedModal] = useState({
    show: false,
    sku: '',
  })

  const validation = useFormik({
    enableReinitialize: true,
    initialValues: {
      inventoryId,
      sku,
      buffer,
    },
    validationSchema: Yup.object({
      buffer: Yup.number().min(0, 'Minimum of 0').required('Enter Buffer'),
    }),
    onSubmit: async (values) => {
      const response = await axios.post(`/api/productDetails/inventoryProductDetails?region=${state.currentRegion}&businessId=${state.user.businessId}`, {
        productInfo: values,
      })
      if (!response.data.error) {
        toast.success(response.data.msg)
        mutate(`/api/getProductPageDetails?region=${state.currentRegion}&inventoryId=${inventoryId}&businessId=${state.user.businessId}`)
        setShowEditFields(false)
      } else {
        toast.error(response.data.msg)
      }
    },
  })

  const HandleAddProduct = (event: any) => {
    event.preventDefault()
    validation.handleSubmit()
  }

  // const handleShowEditFields = () => {
  //   validation.setValues({
  //     inventoryId,
  //     sku,
  //     buffer,
  //   })
  //   setShowEditFields(true)
  // }

  return (
    <div className='px-3 py-1 border-bottom w-100'>
      <p className='fs-4 text-primary fw-semibold mb-1'>Inventory</p>
      <table className='table table-sm table-striped align-middle'>
        <thead className='table-light'>
          <tr className='text-center'>
            <th></th>
            <th>On Hand</th>
            <th>Buffer</th>
            <th>Available</th>
            <th>Reserved</th>
            <th>Ordered</th>
            <th>Inbound</th>
          </tr>
        </thead>
        <tbody>
          <tr className='text-center'>
            <td className='fw-semibold'>ShelfCloud</td>
            <td>{onhand}</td>
            <td onMouseEnter={() => setShowEditButton({ display: 'block' })} onMouseLeave={() => setShowEditButton({ display: 'none' })}>
              {!showEditFields ? (
                <div className='d-flex flex-row justify-content-center align-items-center gap-1'>
                  {buffer}
                  <div className='text-end' style={showEditButton}>
                    {/* <i onClick={handleShowEditFields} className='ri-pencil-fill fs-5 m-0 p-0 text-primary' style={{ cursor: 'pointer' }}></i> */}
                  </div>
                </div>
              ) : (
                <Form onSubmit={HandleAddProduct}>
                  <div className='d-flex flex-row justify-content-center align-items-center gap-1 align-middle'>
                    <div>
                      <Input
                        type='number'
                        className='form-control fs-6 m-0'
                        style={{ maxWidth: '60px' }}
                        placeholder='Buffer...'
                        id='buffer'
                        name='buffer'
                        bsSize='sm'
                        onChange={validation.handleChange}
                        onBlur={validation.handleBlur}
                        value={validation.values.buffer || 0}
                        invalid={validation.touched.buffer && validation.errors.buffer ? true : false}
                      />
                      {validation.touched.buffer && validation.errors.buffer ? <FormFeedback type='invalid'>{validation.errors.buffer}</FormFeedback> : null}
                    </div>
                    <i className='fs-3 text-muted mdi mdi-close-circle' style={{ cursor: 'pointer' }} onClick={() => setShowEditFields(false)} />
                    <Button type='submit' color='muted' className='btn btn-sm m-0 p-0'>
                      <i className='fs-3 text-success ri-checkbox-circle-fill' />
                    </Button>
                  </div>
                </Form>
              )}
            </td>
            <td className='text-success'>{available}</td>
            <td className='text-danger'>{reserved}</td>
            <td style={{ cursor: 'pointer' }} className='text-primary' onClick={() => setshowOrderedModal({ show: true, sku: sku! })}>
              {ordered}
            </td>
            <td>{receiving}</td>
          </tr>
        </tbody>
      </table>
      {amazonFBA.length > 0 && (
        <table className='table table-sm table-striped align-middle'>
          <thead className='table-light'>
            <tr className='text-center'>
              <th></th>
              <th>Total</th>
              <th>Fulfillable</th>
              <th>Reserved</th>
              <th>Unsellable</th>
              <th>Inbound</th>
            </tr>
          </thead>
          <tbody>
            <tr className='text-center'>
              <td className='fw-semibold'>Amazon FBA</td>
              <td>
                {amazonFBA.reduce(
                  (total: number, listing: AmazonFBA) =>
                    total +
                    (listing.afn_fulfillable_quantity +
                      listing.afn_reserved_quantity +
                      listing.afn_inbound_receiving_quantity +
                      listing.afn_inbound_shipped_quantity +
                      listing.afn_inbound_working_quantity),
                  0
                )}
              </td>
              <td>{amazonFBA.reduce((total: number, listing: AmazonFBA) => total + listing.afn_fulfillable_quantity, 0)}</td>
              <td>{amazonFBA.reduce((total: number, listing: AmazonFBA) => total + listing.afn_reserved_quantity, 0)}</td>
              <td>{amazonFBA.reduce((total: number, listing: AmazonFBA) => total + listing.afn_unsellable_quantity, 0)}</td>
              <td>
                {amazonFBA.reduce(
                  (total: number, listing: AmazonFBA) =>
                    total + listing.afn_inbound_receiving_quantity + listing.afn_inbound_shipped_quantity + listing.afn_inbound_working_quantity,
                  0
                )}
              </td>
            </tr>
          </tbody>
        </table>
      )}
      {showOrderedModal.show && <ProductOrderedModals showOrderedModal={showOrderedModal} setshowOrderedModal={setshowOrderedModal} />}
    </div>
  )
}

export default Inventory_Kit_Details
