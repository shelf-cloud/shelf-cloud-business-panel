import { useContext, useState } from 'react'

import PrintReceivingLabel from '@components/receiving/labels/PrintReceivingLabel'
import AppContext from '@context/AppContext'
import { useGenerateLabels } from '@hooks/pdfRender/useGenerateLabels'
import { useEditReceivingsBoxes } from '@hooks/receivings/useEditReceivingsBoxes'
import { useWarehouses } from '@hooks/warehouses/useWarehouse'
import { EditReceivingType } from '@pages/receivings'
import { OrderRowType } from '@typings'
import axios from 'axios'
import { toast } from '@/lib/toast'

import { Alert } from '@/components/ui/Alert'
import { Button } from '@shadcn/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@shadcn/ui/dialog'
import { Nav, NavItem, NavLink, TabContent, TabPane } from '@/components/ui/nav-tabs'
import { Spinner } from '@shadcn/ui/spinner'

import Edit_Receiving_Packages_Tab from './Edit_Receiving_Packages_Tab'
import Edit_Receiving_Summary_Tab from './Edit_Receiving_Summary_Tab'

type DeleteSKUFromReceivingModalType = {
  sku: string
  inventoryId: number
  poId: number
  quantity: number
  splitId?: number | undefined
}

type Props = {
  editReceiving: EditReceivingType
  seteditReceiving: (prev: EditReceivingType) => void
  mutateReceivings: () => void
}

const EditReceivingModal = ({ editReceiving, seteditReceiving, mutateReceivings }: Props) => {
  const { show, order } = editReceiving
  const { warehouseName, orderNumber, orderItems, isShipjoyCreated, id3PL, boxes, isReceivingFromPo } = order
  const { state } = useContext(AppContext)
  const { warehouses } = useWarehouses()
  const [loading, setloading] = useState(false)
  const [activeTab, setactiveTab] = useState('summary')
  const [packingConfiguration, setpackingConfiguration] = useState('current')
  const [needsNewBoxConfiguration, setneedsNewBoxConfiguration] = useState(false)
  const [deletedSku, setdeletedSku] = useState<DeleteSKUFromReceivingModalType[]>([])

  const {
    singleSkuPackages,
    addNewSingleSkuBoxConfiguration,
    removeSingleSkuBoxConfiguration,
    changeUnitsPerBox,
    changeQtyOfBoxes,
    multiSkuPackages,
    addNewMultiSkuBoxConfiguration,
    removeMultiSkuBoxConfiguration,
    addSkuToMultiSkuBox,
    removeSkuFromMultiSkuBox,
    setMixedSkuBoxesUsingMasterBoxes,
    clearMultiSkuBoxes,
    finalBoxesConfiguration,
    hasBoxedErrors,
  } = useEditReceivingsBoxes(orderItems, packingConfiguration, isShipjoyCreated ? id3PL : orderNumber)

  const handleDeleteItem = (poId: number, sku: string, quantity: number, inventoryId: number, splitId: number | undefined) => {
    setdeletedSku((prev) => [...prev, { poId, sku, inventoryId, splitId, quantity }])
    const newOrderItems = orderItems.filter((item) => (isReceivingFromPo ? item.poId! !== poId || item.sku !== sku : item.inventoryId !== inventoryId))
    seteditReceiving({
      ...editReceiving,
      order: {
        ...order,
        orderItems: newOrderItems,
      },
    })
    setneedsNewBoxConfiguration(true)
    setpackingConfiguration('single')
  }
  const handleUpdateReceiving = async () => {
    setloading(true)
    const updateReceiving = toast.loading('Updating Receiving...')

    const { data } = await axios.post(`/api/receivings/editReceiving?region=${state.currentRegion}&businessId=${state.user.businessId}`, {
      orderId: order.id,
      orderNumber: order.orderNumber,
      orderItems,
      boxes: packingConfiguration !== 'current' ? finalBoxesConfiguration : boxes,
      deletedSku,
      isReceivingFromPo: order.isReceivingFromPo,
      warehouseId: order.warehouseId,
      orderid3PL: order.id3PL,
    })

    if (!data.error) {
      seteditReceiving({
        show: false,
        order: {} as OrderRowType,
      })
      toast.update(updateReceiving, {
        render: data.message,
        type: 'success',
        isLoading: false,
        autoClose: 3000,
      })

      if (order.id3PL) {
        downloadPDF(
          <PrintReceivingLabel
            companyName={state.user.name}
            prefix3PL={state.user.prefix3PL}
            warehouse={warehouses?.find((w) => w.warehouseId === order.warehouseId)!}
            boxes={packingConfiguration !== 'current' ? finalBoxesConfiguration : boxes || []}
            orderBarcode={order.id3PL}
            isManualReceiving={!isReceivingFromPo}
          />,
          order.orderNumber
        )
      } else {
        downloadPDF(
          <PrintReceivingLabel
            companyName={state.user.name}
            prefix3PL={state.user.prefix3PL}
            warehouse={warehouses?.find((w) => w.warehouseId === order.warehouseId)!}
            boxes={packingConfiguration !== 'current' ? finalBoxesConfiguration : boxes || []}
            orderBarcode={order.orderNumber}
            isManualReceiving={!isReceivingFromPo}
          />,
          order.orderNumber
        )
      }
      mutateReceivings && mutateReceivings()
    } else {
      toast.update(updateReceiving, {
        render: data.message ?? 'Error updating Receiving',
        type: 'error',
        isLoading: false,
        autoClose: 3000,
      })
    }

    setloading(false)
  }

  const { downloadPDF } = useGenerateLabels()

  return (
    <Dialog
      open={!!show}
      onOpenChange={(open) => {
        if (!open)
          seteditReceiving({
            show: false,
            order: {} as OrderRowType,
          })
      }}>
      <DialogContent aria-describedby={undefined} className='max-h-[90vh] overflow-y-auto sm:!max-w-5xl' id='editReceivingModal'>
        <DialogHeader className='pr-6' id='myModalLabel'>
          <DialogTitle>Edit Receiving</DialogTitle>
        </DialogHeader>
        <div className='flex flex-wrap -mx-3'>
          <p className='m-0 text-[16.25px] font-semibold'>
            Receiving: <span className='text-primary'>{orderNumber}</span>
          </p>
        </div>
        <div className='flex flex-wrap -mx-3 mb-4'>
          <p className='m-0 text-[13px] font-semibold'>
            Destination: <span className='text-primary'>{warehouseName}</span>
          </p>
        </div>

        <Nav className='nav-tabs border-b' role='tablist'>
          <NavItem style={{ cursor: 'pointer' }}>
            <NavLink
              className={activeTab == 'summary' ? 'text-primary font-semibold text-[13px] border border-primary' : 'text-muted-foreground text-[13px]'}
              onClick={() => {
                setactiveTab('summary')
              }}
              type='button'>
              Summary
            </NavLink>
          </NavItem>
          <NavItem style={{ cursor: 'pointer' }}>
            <NavLink
              className={activeTab == 'packages' ? 'text-primary font-semibold text-[13px] border border-primary' : 'text-muted-foreground text-[13px]'}
              onClick={() => {
                setactiveTab('packages')
              }}
              type='button'>
              Boxes
            </NavLink>
          </NavItem>
        </Nav>

        <TabContent activeTab={activeTab} className='pt-2 mb-4'>
          <TabPane tabId='summary'>
            {activeTab == 'summary' && <Edit_Receiving_Summary_Tab orderItems={orderItems} handleDeleteItem={handleDeleteItem} isReceivingFromPo={isReceivingFromPo!} />}
          </TabPane>
          <TabPane tabId='packages'>
            {activeTab == 'packages' && (
              <Edit_Receiving_Packages_Tab
                orderItems={orderItems}
                packingConfiguration={packingConfiguration}
                boxes={boxes || []}
                needsNewBoxConfiguration={needsNewBoxConfiguration}
                setPackingConfiguration={(_field: string, value: string) => setpackingConfiguration(value)}
                singleSkuPackages={singleSkuPackages}
                addNewSingleSkuBoxConfiguration={addNewSingleSkuBoxConfiguration}
                removeSingleSkuBoxConfiguration={removeSingleSkuBoxConfiguration}
                changeUnitsPerBox={changeUnitsPerBox}
                changeQtyOfBoxes={changeQtyOfBoxes}
                multiSkuPackages={multiSkuPackages}
                addNewMultiSkuBoxConfiguration={addNewMultiSkuBoxConfiguration}
                removeMultiSkuBoxConfiguration={removeMultiSkuBoxConfiguration}
                addSkuToMultiSkuBox={addSkuToMultiSkuBox}
                removeSkuFromMultiSkuBox={removeSkuFromMultiSkuBox}
                setMixedSkuBoxesUsingMasterBoxes={setMixedSkuBoxesUsingMasterBoxes}
                clearMultiSkuBoxes={clearMultiSkuBoxes}
                isReceivingFromPo={isReceivingFromPo!}
              />
            )}
          </TabPane>
        </TabContent>
        <div className='flex flex-wrap -mx-3 mb-2'>
          {needsNewBoxConfiguration && (
            <div className='px-3 w-full m-0'>
              <Alert color='warning' className='text-[11.2px] py-1 mb-2' fade={false}>
                <i className='ri-error-warning-line me-4 align-middle text-[16.25px]' />
                You need to create a new box configuration for this receiving.
              </Alert>
            </div>
          )}
          {!needsNewBoxConfiguration && packingConfiguration !== 'current' && (
            <div className='px-3 w-full m-0'>
              <Alert color='warning' className='text-[11.2px] py-1 mb-2' fade={false}>
                <i className='ri-error-warning-line me-4 align-middle text-[16.25px]' />
                You are editing the current box configuration. Please make sure to update the current box configuration if needed.
              </Alert>
            </div>
          )}
          {hasBoxedErrors.error && (
            <div className='px-3 w-full m-0'>
              <Alert color='danger' className='text-[11.2px] py-1 mb-2' fade={false}>
                <i className='ri-error-warning-line me-4 align-middle text-[16.25px]' />
                {hasBoxedErrors.message}
              </Alert>
            </div>
          )}
        </div>
        <div className='flex flex-wrap -mx-3'>
          <div className='flex justify-end items-center gap-4'>
            <Button
              type='button'
              variant='light'
              className='text-[11.2px]'
              onClick={() =>
                seteditReceiving({
                  show: false,
                  order: {} as OrderRowType,
                })
              }>
              Cancel
            </Button>
            {activeTab == 'summary' && (
              <Button disabled={false} type='button' className='text-[11.2px] !bg-transparent !border-transparent !shadow-none btn-soft-primary' onClick={() => setactiveTab('packages')}>
                Next Step
              </Button>
            )}
            {activeTab == 'packages' && (
              <Button disabled={loading || hasBoxedErrors.error} type='button' variant='success' className='text-[11.2px]' onClick={() => handleUpdateReceiving()}>
                {loading ? (
                  <span>
                    <Spinner className='text-white' /> Updating...
                  </span>
                ) : (
                  'Update Receiving'
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default EditReceivingModal
