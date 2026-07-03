 
import { useContext, useState } from 'react'

import AppContext from '@context/AppContext'
import axios from 'axios'
import { DebounceInput } from 'react-debounce-input'
import { toast } from 'react-toastify'
import { Button } from '@shadcn/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@shadcn/ui/dialog'
import { Spinner } from '@shadcn/ui/spinner'
import { useSWRConfig } from 'swr'

type Props = {
  editShipmentName: {
    show: boolean
    shipmentId: string
    shipmentName: string
  }
  seteditShipmentName: (prev: any) => void
}

const ChangeFBAShipmentName = ({ editShipmentName, seteditShipmentName }: Props) => {
  const { state }: any = useContext(AppContext)
  const { mutate } = useSWRConfig()
  const [shipmentName, setshipmentName] = useState(editShipmentName.shipmentName)
  const [isLoading, setisLoading] = useState(false)

  const hanldeEditFBAShipmentName = async () => {
    setisLoading(true)
    const updateShipmentName = toast.loading('Updating Shipment Name...')
    try {
      const response = await axios.post(`/api/amazon/shipments/changeFBAShipmentName?region=${state.currentRegion}&businessId=${state.user.businessId}`, {
        shipmentName: shipmentName,
        shipmentId: editShipmentName.shipmentId,
      })

      if (!response.data.error) {
        toast.update(updateShipmentName, {
          render: response.data.message,
          type: 'success',
          isLoading: false,
          autoClose: 3000,
        })
        seteditShipmentName({
          show: false,
          shipmentId: '',
          shipmentName: '',
        })
        mutate(`${process.env.NEXT_PUBLIC_SHELFCLOUD_SERVER_URL}/api/amz_workflow/listSellerFbaShipments/${state.currentRegion}/${state.user.businessId}`)
      } else {
        toast.update(updateShipmentName, {
          render: response.data.message,
          type: 'error',
          isLoading: false,
          autoClose: 3000,
        })
      }
    } catch (error) {
      toast.update(updateShipmentName, {
        render: 'Error updating Shipment Name',
        type: 'error',
        isLoading: false,
        autoClose: 3000,
      })
      console.error(error)
    }
    setisLoading(false)
  }

  return (
    <Dialog
      open={!!editShipmentName.show}
      onOpenChange={(open) => {
        if (!open) {
          seteditShipmentName({
            show: false,
            shipmentId: '',
            shipmentName: '',
          })
        }
      }}>
      <DialogContent aria-describedby={undefined} className='max-h-[90vh] overflow-y-auto sm:!max-w-lg' id='ChangeFBAShipmentName'>
        <DialogHeader className='pr-6'>
          <DialogTitle className='modal-title' id='myModalLabel'>
            Rename Shipment
          </DialogTitle>
        </DialogHeader>
        <div className='flex flex-wrap -mx-3'>
          <h5 className='text-[19.5px] mb-0 font-semibold text-primary'>Shipment:</h5>
          <div className='px-3 w-full mt-2'>
            <DebounceInput
              type='text'
              minLength={3}
              debounceTimeout={300}
              className="h-9 w-full min-w-0 rounded-md border border-input bg-input px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 input_background_white"
              placeholder='Search...'
              id='search-options'
              value={shipmentName}
              onKeyDown={(e) => (e.key == 'Enter' ? e.preventDefault() : null)}
              onChange={(e) => setshipmentName(e.target.value)}
            />
          </div>
          <div className='mt-6 flex flex-row gap-4 justify-end'>
            <Button
              disabled={isLoading}
              type='button'
              variant='light'
              onClick={() => {
                seteditShipmentName({
                  show: false,
                  shipmentId: '',
                  shipmentName: '',
                })
              }}>
              Cancel
            </Button>
            <Button disabled={isLoading} type='button' variant='success' onClick={hanldeEditFBAShipmentName}>
              {isLoading ? <Spinner className='text-white' /> : 'Confirm'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default ChangeFBAShipmentName
