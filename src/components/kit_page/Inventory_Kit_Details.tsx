import { useContext, useState } from 'react'

import ProductOrderedModals from '@components/modals/productPage/ProductOrderedModals'
import AppContext from '@context/AppContext'
import { AmazonFBA } from '@typings'
import axios from 'axios'
import { useFormik } from 'formik'
import { toast } from 'react-toastify'
import { Button, Form, FormFeedback, Input } from '@/components/migration-ui'
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

  const handleAddProduct = (event: any) => {
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
    <div className='tw:px-3 tw:py-1 tw:border-b tw:border-[color:var(--border)] tw:w-full'>
      <p className='tw:text-[19.5px] tw:text-primary tw:font-semibold tw:mb-1'>Inventory</p>
      <table className='tw:w-full tw:text-[11.2px] tw:align-middle tw:[&_th]:px-2 tw:[&_th]:py-1 tw:[&_td]:px-2 tw:[&_td]:py-1'>
        <thead className='tw:bg-[color:var(--vz-light)]'>
          <tr className='tw:text-center'>
            <th scope='col' aria-label='Inventory source'></th>
            <th>On Hand</th>
            <th>Buffer</th>
            <th>Available</th>
            <th>Reserved</th>
            <th>Ordered</th>
            <th>Inbound</th>
          </tr>
        </thead>
        <tbody>
          <tr className='tw:text-center'>
            <td className='tw:font-semibold'>ShelfCloud</td>
            <td>{onhand}</td>
            <td onMouseEnter={() => setShowEditButton({ display: 'block' })} onMouseLeave={() => setShowEditButton({ display: 'none' })}>
              {!showEditFields ? (
                <div className='tw:flex tw:flex-row tw:justify-center tw:items-center tw:gap-1'>
                  {buffer}
                  <div className='tw:text-right' style={showEditButton}>
                    {/* <i onClick={handleShowEditFields} className='ri-pencil-fill fs-5 m-0 p-0 text-primary' style={{ cursor: 'pointer' }}></i> */}
                  </div>
                </div>
              ) : (
                <Form onSubmit={handleAddProduct}>
                  <div className='tw:flex tw:flex-row tw:justify-center tw:items-center tw:gap-1 tw:align-middle'>
                    <div>
                      <Input
                        type='number'
                        className='tw:text-[13px] tw:m-0'
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
                    <button type='button' aria-label='Cancel editing buffer inventory' className='tw:m-0 tw:p-0 tw:border-0 tw:bg-transparent tw:text-[color:var(--bs-secondary-color)]' onClick={() => setShowEditFields(false)}>
                      <i className='tw:text-[22.75px] mdi mdi-close-circle' />
                    </button>
                    <Button type='submit' color='muted' size='sm' className='tw:m-0 tw:p-0'>
                      <i className='tw:text-[22.75px] tw:text-success ri-checkbox-circle-fill' />
                    </Button>
                  </div>
                </Form>
              )}
            </td>
            <td className='tw:text-success'>{available}</td>
            <td className='tw:text-danger'>{reserved}</td>
            <td>
              <button
                type='button'
                className='tw:p-0 tw:border-0 tw:bg-transparent tw:text-primary tw:no-underline'
                onClick={() => setshowOrderedModal({ show: true, sku: sku! })}
              >
                {ordered}
              </button>
            </td>
            <td>{receiving}</td>
          </tr>
        </tbody>
      </table>
      {amazonFBA.length > 0 && (
        <table className='tw:w-full tw:text-[11.2px] tw:align-middle tw:[&_th]:px-2 tw:[&_th]:py-1 tw:[&_td]:px-2 tw:[&_td]:py-1'>
          <thead className='tw:bg-[color:var(--vz-light)]'>
            <tr className='tw:text-center'>
              <th scope='col' aria-label='Fulfillment channel'></th>
              <th>Total</th>
              <th>Fulfillable</th>
              <th>Reserved</th>
              <th>Unsellable</th>
              <th>Inbound</th>
            </tr>
          </thead>
          <tbody>
            <tr className='tw:text-center'>
              <td className='tw:font-semibold'>Amazon FBA</td>
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
