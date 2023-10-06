import React, { useContext, useState } from 'react'
import { Button, Form, FormFeedback, Input } from 'reactstrap'
import * as Yup from 'yup'
import { useFormik } from 'formik'
import { toast } from 'react-toastify'
import { useSWRConfig } from 'swr'
import axios from 'axios'
import AppContext from '@context/AppContext'

type Props = {
  inventoryId?: number
  sku?: string
  onhand: number
  buffer: number
  available: number
  reserved: number
  receiving: number
}

const Inventory_Product_Details = ({ inventoryId, sku, onhand, buffer, available, reserved, receiving }: Props) => {
  const { state }: any = useContext(AppContext)
  const { mutate } = useSWRConfig()
  const [showEditFields, setShowEditFields] = useState(false)
  const [showEditButton, setShowEditButton] = useState({ display: 'none' })

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

  const handleShowEditFields = () => {
    validation.setValues({
      inventoryId,
      sku,
      buffer,
    })
    setShowEditFields(true)
  }

  return (
    <div className='px-3 py-1 border-bottom w-100'>
      <p className='fs-4 text-primary fw-semibold'>Inventory</p>
      <table className='table table-sm'>
        <thead>
          <tr className='text-center'>
            <th>Warehouse</th>
            <th>On Hand</th>
            <th>Buffer</th>
            <th>Available</th>
            <th>Reserved</th>
            <th>Receiving</th>
          </tr>
        </thead>
        <tbody>
          <tr className='text-center'>
            <td className='fw-semibold'>ShelfCloud</td>
            <td>{onhand}</td>
            <td onMouseEnter={() => setShowEditButton({ display: 'block' })} onMouseLeave={() => setShowEditButton({ display: 'none' })}>
              {!showEditFields ? (
                <div className='d-flex flex-row justify-content-center align-items-center gap-3'>
                  {buffer}
                  <div className='text-end' style={showEditButton}>
                    <i onClick={handleShowEditFields} className='ri-pencil-fill fs-4 text-secondary' style={{ cursor: 'pointer' }}></i>
                  </div>
                </div>
              ) : (
                <Form onSubmit={HandleAddProduct}>
                  <div className='d-flex flex-row justify-content-center align-items-center gap-1 align-middle'>
                    <div>
                      <Input
                        type='number'
                        className='form-control fs-6 m-0'
                        style={{maxWidth: '60px'}}
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
            <td>{receiving}</td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

export default Inventory_Product_Details
