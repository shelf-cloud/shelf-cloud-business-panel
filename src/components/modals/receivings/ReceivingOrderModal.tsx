import router from 'next/router'
import { useContext, useState } from 'react'

import SimpleSelect from '@components/Common/SimpleSelect'
import { RECEIVING_SHIPMENT_TYPES } from '@components/constants/receivings'
import PrintReceivingLabel from '@components/receiving/labels/PrintReceivingLabel'
import AppContext from '@context/AppContext'
import { useGenerateLabels } from '@hooks/pdfRender/useGenerateLabels'
import { useCreateManualReceivingsBoxes } from '@hooks/receivings/useCreateManualReceivingsBoxes'
import { ReceivingInventory } from '@hooks/receivings/useReceivingInventory'
import { useFilterWarehousesByShipmentType } from '@hooks/warehouses/useFilterWarehousesByShipmentType'
import { useWarehouses } from '@hooks/warehouses/useWarehouse'
import { zodResolver } from '@hookform/resolvers/zod'
import axios from 'axios'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { toast } from '@/lib/toast'

import { Alert } from '@/components/ui/Alert'
import { Button } from '@shadcn/ui/button'
import { Input } from '@shadcn/ui/input'
import { Label } from '@shadcn/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@shadcn/ui/dialog'
import { Nav, NavItem, NavLink, TabContent, TabPane } from '@/components/ui/nav-tabs'
import { Spinner } from '@shadcn/ui/spinner'
import { InputGroup, InputGroupText } from '@/components/ui/InputGroup'

import Create_Manual_Receiving_Packages_Tab from './createReceiving/Create_Manual_Receiving_Packages_Tab'
import Create_Manual_Receiving_Summary_Tab from './createReceiving/Create_Manual_Receiving_Summary_Tab'

type Props = {
  orderNumberStart: string
  receivingProducts: ReceivingInventory[]
}

const receivingOrderSchema = z.object({
  orderNumber: z
    .string()
    .regex(/^[a-zA-Z0-9-]+$/, `Invalid special characters: % & # " ' @ ~ , ...`)
    .max(100, 'Title is to Long')
    .min(1, 'Please enter Order Number'),
  packingConfiguration: z.string(),
  shipmentType: z.object({
    value: z.string().min(1, 'Shipment Type Required'),
    label: z.string(),
  }),
  destinationSC: z.object({
    value: z.string().min(1, 'Destination Required'),
    label: z.string(),
  }),
})

type ReceivingOrderForm = z.infer<typeof receivingOrderSchema>

const ReceivingOrderModal = ({ orderNumberStart, receivingProducts }: Props) => {
  const { state, setWholeSaleOrderModal }: any = useContext(AppContext)
  const { warehouses, isLoading } = useWarehouses()
  const { downloadPDF } = useGenerateLabels()
  const [loading, setLoading] = useState(false)
  const [activeTab, setactiveTab] = useState('summary')

  const validation = useForm<ReceivingOrderForm>({
    resolver: zodResolver(receivingOrderSchema),
    defaultValues: {
      orderNumber: state.currentRegion == 'us' ? `00${state?.user?.orderNumber?.us}` : `00${state?.user?.orderNumber?.eu}`,
      packingConfiguration: 'single',
      shipmentType: { value: '', label: 'Select ...' },
      destinationSC: { value: '', label: 'Select ...' },
    },
  })

  const formValues = validation.watch()

  const onSubmit = async (values: ReceivingOrderForm) => {
    setLoading(true)

    const creatingUploadedReceiving = toast.loading('Creating Receiving...')

    // SHIPPING PRODUCTS
    let shippingProducts = [] as any
    receivingProducts.map((item) => {
      shippingProducts.push({
        poId: null,
        hasSplitting: false,
        splitId: null,
        sku: item.sku,
        name: item.title,
        boxQty: item.boxQty,
        inventoryId: item.inventoryId,
        qty: item.quantity,
        storeId: item.businessId,
        qtyPicked: 0,
        pickedHistory: [],
      })
    })

    // ORDER PRODUCTS
    let orderProducts = [] as any
    receivingProducts.map((item) => {
      orderProducts.push({
        poId: null,
        poNumber: null,
        orderNumber: `${orderNumberStart}${values.orderNumber}`,
        hasSplitting: false,
        splitId: null,
        sku: item.sku,
        inventoryId: item.inventoryId,
        name: item.title,
        image: item.image,
        boxQty: item.boxQty,
        quantity: item.quantity,
        businessId: item.businessId,
        qtyReceived: 0,
        suppliersName: item.suppliersName,
      })
    })

    const { data } = await axios.post(`/api/receivings/createManualReceiving?region=${state.currentRegion}&businessId=${state.user.businessId}`, {
      shippingProducts,
      orderInfo: {
        orderNumber: values.orderNumber,
        orderProducts,
      },
      receivingItems: receivingProducts,
      isNewReceiving: true,
      receivingIdToAdd: null,
      // destinationSC: warehouses?.find((w) => w.warehouseId === parseInt(values.destinationSC.value))?.isSCDestination ? 1 : 0,
      warehouseId: parseInt(values.destinationSC.value),
      finalBoxesConfiguration,
    })

    if (!data.error) {
      toast.update(creatingUploadedReceiving, {
        render: data.message,
        type: 'success',
        isLoading: false,
        autoClose: 3000,
      })

      if (data.is3PL) {
        downloadPDF(
          <PrintReceivingLabel
            companyName={state.user.name}
            prefix3PL={state.user.prefix3PL}
            warehouse={warehouses?.find((w) => w.warehouseId === parseInt(values.destinationSC.value))!}
            boxes={finalBoxesConfiguration}
            orderBarcode={data.orderid3PL}
            isManualReceiving={true}
          />,
          `${orderNumberStart}${values.orderNumber}`
        )
      } else {
        downloadPDF(
          <PrintReceivingLabel
            companyName={state.user.name}
            prefix3PL={state.user.prefix3PL}
            warehouse={warehouses?.find((w) => w.warehouseId === parseInt(values.destinationSC.value))!}
            boxes={finalBoxesConfiguration}
            orderBarcode={`${orderNumberStart}${values.orderNumber}`}
            isManualReceiving={true}
          />,
          `${orderNumberStart}${values.orderNumber}`
        )
      }

      setWholeSaleOrderModal(false)
      router.push('/receivings')
    } else {
      toast.update(creatingUploadedReceiving, {
        render: data.message,
        type: 'error',
        isLoading: false,
        autoClose: 3000,
      })
    }
    setLoading(false)
  }

  const handleAddProduct = validation.handleSubmit(onSubmit)

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
  } = useCreateManualReceivingsBoxes(receivingProducts, formValues.packingConfiguration, `${orderNumberStart}${formValues.orderNumber}`)

  const { filteredWarehouses } = useFilterWarehousesByShipmentType(warehouses, formValues.shipmentType.value)

  return (
    <Dialog
      open={!!state.showWholeSaleOrderModal}
      onOpenChange={(open) => {
        if (!open) setWholeSaleOrderModal(!state.showWholeSaleOrderModal)
      }}>
      <DialogContent aria-describedby={undefined} className='max-h-[90vh] overflow-y-auto sm:!max-w-5xl' id='createReceivingOrderFromTable'>
        <DialogHeader className='pr-6' id='myModalLabel'>
          <DialogTitle>Create Manual Receiving</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleAddProduct}>
          <h5 className='text-[16.25px] font-extrabold'>Receiving Details</h5>
          <div className='flex flex-wrap -mx-3'>
            <div className='px-3 w-full md:w-4/12'>
              <div className='mb-3'>
                <Label htmlFor='orderNumber' className='mb-2 inline-block text-[11.2px]'>
                  *Transaction Number
                </Label>
                <InputGroup>
                  <InputGroupText className='font-semibold text-[16.25px] m-0 px-2 py-0' id='basic-addon1'>
                    {orderNumberStart}
                  </InputGroupText>
                  <Input
                    type='text'
                    className='text-[13px] h-8 text-xs'
                    id='orderNumber'
                    aria-invalid={validation.formState.errors.orderNumber ? true : undefined}
                    {...validation.register('orderNumber')}
                  />
                </InputGroup>
                {validation.formState.errors.orderNumber ? <div className='text-sm text-destructive'>{validation.formState.errors.orderNumber.message}</div> : null}
              </div>
            </div>
            <div className='px-3 w-full md:w-4/12'>
              <Label className='mb-2 inline-block text-[11.2px]'>*Shipment Type</Label>
              <SimpleSelect
                options={RECEIVING_SHIPMENT_TYPES}
                selected={formValues.shipmentType}
                handleSelect={(selected) => {
                  validation.setValue('shipmentType', selected as any, { shouldValidate: true })
                  validation.setValue('destinationSC', { value: '', label: 'Select ...' }, { shouldValidate: true })
                }}
                placeholder={'Select ...'}
                customStyle='sm'
              />
              {validation.formState.errors.shipmentType ? <div className='m-0 p-0 text-destructive text-[11.2px]'>*{validation.formState.errors.shipmentType.value?.message}</div> : null}
            </div>
            <div className='px-3 w-full md:w-4/12'>
              <Label className='mb-2 inline-block text-[11.2px]'>*Select Destination</Label>
              <SimpleSelect
                options={filteredWarehouses}
                selected={formValues.destinationSC}
                handleSelect={(selected) => {
                  validation.setValue('destinationSC', selected as any, { shouldValidate: true })
                }}
                placeholder={isLoading ? 'Loading...' : 'Select ...'}
                customStyle='sm'
              />
              {validation.formState.errors.destinationSC ? (
                <div className='m-0 p-0 text-destructive text-[11.2px]'>*{validation.formState.errors.destinationSC.value?.message}</div>
              ) : null}
            </div>
          </div>

          <Nav className='nav-tabs border-b' role='tablist'>
            <NavItem style={{ cursor: 'pointer' }}>
              <NavLink
                className={activeTab == 'summary' ? '!text-primary font-semibold text-[13px] border border-primary' : '!text-muted-foreground text-[13px]'}
                onClick={() => {
                  setactiveTab('summary')
                }}
                type='button'>
                Summary
              </NavLink>
            </NavItem>
            <NavItem style={{ cursor: 'pointer' }}>
              <NavLink
                className={activeTab == 'packages' ? '!text-primary font-semibold text-[13px] border border-primary' : '!text-muted-foreground text-[13px]'}
                onClick={() => {
                  setactiveTab('packages')
                }}
                type='button'>
                Boxes
              </NavLink>
            </NavItem>
          </Nav>

          <TabContent activeTab={activeTab} className='pt-2 mb-4'>
            <TabPane tabId='summary'>{activeTab == 'summary' && <Create_Manual_Receiving_Summary_Tab orderProducts={receivingProducts} />}</TabPane>
            <TabPane tabId='packages'>
              {activeTab == 'packages' && (
                <Create_Manual_Receiving_Packages_Tab
                  orderProducts={receivingProducts}
                  packingConfiguration={formValues.packingConfiguration}
                  setPackingConfiguration={(field: string, value: string) => validation.setValue(field as any, value)}
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
                />
              )}
            </TabPane>
          </TabContent>

          <div className='flex flex-wrap -mx-3 mb-2'>
            {hasBoxedErrors.error && (
              <div className='px-3 w-full m-0'>
                <Alert color='danger' className='text-[11.2px] py-1 mb-2'>
                  <i className='ri-error-warning-line me-4 align-middle text-[16.25px]' />
                  {hasBoxedErrors.message}
                </Alert>
              </div>
            )}
          </div>
          <div className='flex flex-wrap -mx-3'>
            <div className='flex justify-end items-center gap-2'>
              {activeTab == 'summary' && (
                <Button disabled={loading || receivingProducts.length <= 0} type='button' onClick={() => setactiveTab('packages')}>
                  Next Step
                </Button>
              )}
              {activeTab == 'packages' && (
                <Button disabled={loading || receivingProducts.length <= 0 || hasBoxedErrors.error} type='submit' variant='success'>
                  {loading ? (
                    <span>
                      <Spinner className='text-white' /> Creating...
                    </span>
                  ) : (
                    'Create Receiving'
                  )}
                </Button>
              )}
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default ReceivingOrderModal
