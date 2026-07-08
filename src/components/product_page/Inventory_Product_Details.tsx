import { useContext, useEffect, useState } from 'react'

import ProductOrderedModals from '@components/modals/productPage/ProductOrderedModals'
import AppContext from '@context/AppContext'
import { FormatIntNumber } from '@lib/FormatNumbers'
import { AmazonFBA } from '@typings'
import { zodResolver } from '@hookform/resolvers/zod'
import axios from 'axios'
import { useForm } from 'react-hook-form'
import { toast } from '@/lib/toast'
import { Button } from '@shadcn/ui/button'
import { Input } from '@shadcn/ui/input'
import { useSWRConfig } from 'swr'
import { z } from 'zod'

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

const toNumber = (v: unknown) => {
  if (v === '' || v === null || v === undefined) return undefined
  const n = typeof v === 'number' ? v : Number(v)
  return Number.isNaN(n) ? undefined : n
}

const Inventory_Product_Details = ({ inventoryId, sku, onhand, buffer, available, reserved, receiving, ordered, amazonFBA }: Props) => {
  const { state } = useContext(AppContext)
  const { mutate } = useSWRConfig()
  const [showEditFields, setShowEditFields] = useState(false)
  const [showEditButton, setShowEditButton] = useState({ display: 'none' })
  const [showOrderedModal, setshowOrderedModal] = useState({
    show: false,
    sku: '',
  })

  const schema = z.object({
    inventoryId: z.number().optional(),
    sku: z.string().optional(),
    buffer: z.preprocess(toNumber, z.number({ error: 'Enter Buffer' }).min(0, 'Minimum of 0')),
  })

  const validation = useForm<z.input<typeof schema>, any, z.output<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      inventoryId,
      sku,
      buffer,
    },
  })

  useEffect(() => {
    validation.reset({ inventoryId, sku, buffer })
  }, [inventoryId, sku, buffer])

  const onSubmit = async (values: z.output<typeof schema>) => {
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
  }

  const handleAddProduct = validation.handleSubmit(onSubmit)

  const handleShowEditFields = () => {
    validation.reset({
      inventoryId,
      sku,
      buffer,
    })
    setShowEditFields(true)
  }

  const hasAWDInventory = amazonFBA.reduce((total: number, listing: AmazonFBA) => total + listing.awd_onHand_qty + listing.awd_inbound_qty, 0) > 0

  return (
    <div className='px-3 py-1 border-b border-[color:var(--border)] w-full'>
      <p className='text-[19.5px] text-primary font-semibold mb-1'>Inventory</p>
      <table className='w-full text-[11.2px] align-middle [&_th]:px-2 [&_th]:py-1 [&_td]:px-2 [&_td]:py-1'>
        <thead className='bg-[color:var(--vz-light)]'>
          <tr className='text-center'>
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
          <tr className='text-center'>
            <td className='font-semibold'>ShelfCloud</td>
            <td>{onhand}</td>
            <td onMouseEnter={() => setShowEditButton({ display: 'block' })} onMouseLeave={() => setShowEditButton({ display: 'none' })}>
              {!showEditFields ? (
                <div className='flex flex-row justify-center items-center gap-1'>
                  {buffer}
                  <div className='text-right' style={showEditButton}>
                    <button type='button' aria-label='Edit buffer inventory' className='m-0 p-0 border-0 bg-transparent text-primary' onClick={handleShowEditFields}>
                      <i className='ri-pencil-fill text-[16.25px] m-0 p-0' />
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleAddProduct}>
                  <div className='flex flex-row justify-center items-center gap-1 align-middle'>
                    <div>
                      <Input
                        type='number'
                        className='text-[13px] m-0 h-8 text-xs'
                        style={{ maxWidth: '60px' }}
                        placeholder='Buffer...'
                        id='buffer'
                        aria-invalid={(validation.formState.touchedFields.buffer && validation.formState.errors.buffer ? true : false) || undefined}
                        {...validation.register('buffer')}
                      />
                      {validation.formState.touchedFields.buffer && validation.formState.errors.buffer ? (
                        <div className='text-sm text-destructive'>{validation.formState.errors.buffer.message}</div>
                      ) : null}
                    </div>
                    <button type='button' aria-label='Cancel editing buffer inventory' className='m-0 p-0 border-0 bg-transparent text-muted-foreground' onClick={() => setShowEditFields(false)}>
                      <i className='text-[22.75px] mdi mdi-close-circle' />
                    </button>
                    <Button type='submit' variant='muted' size='sm' className='m-0 p-0'>
                      <i className='text-[22.75px] text-success ri-checkbox-circle-fill' />
                    </Button>
                  </div>
                </form>
              )}
            </td>
            <td className='text-success'>{FormatIntNumber(state.currentRegion, available)}</td>
            <td className='text-destructive'>{FormatIntNumber(state.currentRegion, reserved)}</td>
            <td>
              <button
                type='button'
                className='p-0 border-0 bg-transparent text-primary no-underline'
                onClick={() => setshowOrderedModal({ show: true, sku: sku! })}
              >
                {FormatIntNumber(state.currentRegion, ordered)}
              </button>
            </td>
            <td>{FormatIntNumber(state.currentRegion, receiving)}</td>
          </tr>
        </tbody>
      </table>
      {amazonFBA.length > 0 && (
        <table className='w-full text-[11.2px] align-middle [&_th]:px-2 [&_th]:py-1 [&_td]:px-2 [&_td]:py-1'>
          <thead className='bg-[color:var(--vz-light)]'>
            <tr className='text-center'>
              <th scope='col' aria-label='Fulfillment channel'></th>
              <th>Total</th>
              <th>Fulfillable</th>
              <th>Reserved</th>
              <th>Unsellable</th>
              <th>Inbound</th>
            </tr>
          </thead>
          <tbody>
            <tr className='text-center'>
              <td className='font-semibold'>Amazon FBA</td>
              <td>
                {FormatIntNumber(
                  state.currentRegion,
                  amazonFBA.reduce(
                    (total: number, listing: AmazonFBA) =>
                      total +
                      (listing.afn_fulfillable_quantity +
                        listing.afn_reserved_quantity +
                        listing.afn_inbound_receiving_quantity +
                        listing.afn_inbound_shipped_quantity +
                        listing.afn_inbound_working_quantity),
                    0
                  )
                )}
              </td>
              <td>
                {FormatIntNumber(
                  state.currentRegion,
                  amazonFBA.reduce((total: number, listing: AmazonFBA) => total + listing.afn_fulfillable_quantity, 0)
                )}
              </td>
              <td>
                {FormatIntNumber(
                  state.currentRegion,
                  amazonFBA.reduce((total: number, listing: AmazonFBA) => total + listing.afn_reserved_quantity, 0)
                )}
              </td>
              <td>
                {FormatIntNumber(
                  state.currentRegion,
                  amazonFBA.reduce((total: number, listing: AmazonFBA) => total + listing.afn_unsellable_quantity, 0)
                )}
              </td>
              <td>
                {FormatIntNumber(
                  state.currentRegion,
                  amazonFBA.reduce(
                    (total: number, listing: AmazonFBA) =>
                      total + listing.afn_inbound_receiving_quantity + listing.afn_inbound_shipped_quantity + listing.afn_inbound_working_quantity,
                    0
                  )
                )}
              </td>
            </tr>
            {hasAWDInventory && (
              <tr className='text-center'>
                <td className='font-semibold'>Amazon AWD</td>
                <td>
                  {FormatIntNumber(
                    state.currentRegion,
                    amazonFBA.reduce((total: number, listing: AmazonFBA) => total + listing.awd_onHand_qty + listing.awd_inbound_qty, 0)
                  )}
                </td>
                <td>
                  {FormatIntNumber(
                    state.currentRegion,
                    amazonFBA.reduce((total: number, listing: AmazonFBA) => total + listing.awd_onHand_qty, 0)
                  )}
                </td>
                <td>0</td>
                <td>0</td>
                <td>
                  {FormatIntNumber(
                    state.currentRegion,
                    amazonFBA.reduce((total: number, listing: AmazonFBA) => total + listing.awd_inbound_qty, 0)
                  )}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
      {showOrderedModal.show && <ProductOrderedModals showOrderedModal={showOrderedModal} setshowOrderedModal={setshowOrderedModal} />}
    </div>
  )
}

export default Inventory_Product_Details
