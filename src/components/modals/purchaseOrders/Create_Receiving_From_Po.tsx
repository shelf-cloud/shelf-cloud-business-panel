import router from 'next/router'
import { useContext, useState } from 'react'

import { SelectOptionType, SelectSingleValueType } from '@components/Common/SimpleSelect'
import PrintReceivingLabel from '@components/receiving/labels/PrintReceivingLabel'
import SelectSingleFilter from '@components/ui/filters/SelectSingleFilter'
import AppContext from '@context/AppContext'
import { useGenerateLabels } from '@hooks/pdfRender/useGenerateLabels'
import { useReceivingsBoxes } from '@hooks/receivings/useReceivingsBoxes'
import { useWarehouses } from '@hooks/warehouses/useWarehouse'
import axios from 'axios'
import { useFormik } from 'formik'
import { toast } from '@/lib/toast'

import { Alert } from '@/components/ui/Alert'
import { Button } from '@shadcn/ui/button'
import { Input } from '@shadcn/ui/input'
import { InputGroup, InputGroupText } from '@/components/ui/InputGroup'
import { Label } from '@shadcn/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@shadcn/ui/dialog'
import { Nav, NavItem, NavLink, TabContent, TabPane } from '@/components/ui/nav-tabs'
import { Spinner } from '@shadcn/ui/spinner'
import useSWR, { useSWRConfig } from 'swr'
import * as Yup from 'yup'

import Create_Receiving_Packages_Tab from '../receivings/createReceiving/Create_Receiving_Packages_Tab'
import Create_Receiving_Summary_Tab from '../receivings/createReceiving/Create_Receiving_Summary_Tab'

type Props = {
  orderNumberStart: string
}
type OpenReceivings = {
  id: number
  businessId: number
  orderId: string
  orderNumber: string
  orderDate: string
}

const RECEIVING_TYPES: SelectOptionType[] = [
  { value: '', label: 'Choose a Type...' },
  { value: 'true', label: 'Create New Receiving' },
]
const EXIST_RECEIVING_TYPE: SelectOptionType[] = [{ value: 'false', label: 'Add to Existing Receiving' }]

const fetcher = (endPoint: string) => axios(endPoint).then((res) => res.data)

const Create_Receiving_From_Po = ({ orderNumberStart }: Props) => {
  const { state, setShowCreateReceivingFromPo } = useContext(AppContext)
  const { mutate } = useSWRConfig()
  const { warehouses } = useWarehouses()
  const [loading, setloading] = useState(false)
  const [activeTab, setactiveTab] = useState('summary')

  const { data: openReceivings }: { data?: OpenReceivings[] } = useSWR(
    state.user.businessId
      ? `/api/purchaseOrders/getOpenReceivings?region=${state.currentRegion}&businessId=${state.user.businessId}&warehouseId=${state.receivingFromPo.warehouse.id}`
      : null,
    fetcher,
    {
      revalidateOnMount: true,
      revalidateOnFocus: true,
    }
  )

  const validation = useFormik({
    enableReinitialize: false,
    initialValues: {
      orderNumber: state.currentRegion == 'us' ? `00${state?.user?.orderNumber?.us}` : `00${state?.user?.orderNumber?.eu}`,
      packingConfiguration: 'single',
      isNewReceiving: '',
      receivingIdToAdd: '',
    },
    validationSchema: Yup.object({
      orderNumber: Yup.string()
        .matches(/^[a-zA-Z0-9-]+$/, `Invalid special characters: % & # " ' @ ~ , ...`)
        .max(100, 'Title is to Long')
        .required('Please enter Order Number'),
      isNewReceiving: Yup.string().required('Select a Receiving Type'),
      receivingIdToAdd: Yup.string().when('isNewReceiving', {
        is: 'false',
        then: Yup.string().required('Must select a Receiving'),
      }),
    }),
    onSubmit: async (values) => {
      setloading(true)

      const createReceiving = toast.loading('Creating Receiving...')

      // SHIPPING PRODUCTS
      let shippingProducts = [] as any
      Object.entries(state.receivingFromPo.items).forEach(([_poId, inventoryId]: any) =>
        Object.entries(inventoryId).map(([_inventoryId, item]: any) => {
          shippingProducts.push({
            poId: item.poId,
            hasSplitting: item.hasSplitting,
            splitId: item.splitId,
            sku: item.sku,
            name: item.title,
            boxQty: item.boxQty,
            inventoryId: item.inventoryId,
            qty: Number(item.receivingQty),
            storeId: item.businessId,
            qtyPicked: 0,
            pickedHistory: [],
          })
        })
      )

      // ORDER PRODUCTS
      let orderProducts = [] as any
      Object.entries(state.receivingFromPo.items).map(([_poId, inventoryId]: any) =>
        Object.entries(inventoryId).map(([_inventoryId, item]: any) => {
          orderProducts.push({
            poId: item.poId,
            poNumber: item.orderNumber,
            orderNumber:
              validation.values.isNewReceiving === 'true'
                ? `${orderNumberStart}${validation.values.orderNumber}`
                : openReceivings?.find((receiving) => receiving.id == parseInt(validation.values.receivingIdToAdd))?.orderNumber!,
            hasSplitting: item.hasSplitting,
            splitId: item.splitId,
            sku: item.sku,
            inventoryId: item.inventoryId,
            name: item.title,
            image: item.image,
            boxQty: item.boxQty,
            quantity: Number(item.receivingQty),
            businessId: item.businessId,
            qtyReceived: 0,
            suppliersName: item.suppliersName,
          })
        })
      )

      const isNewReceiving = values.isNewReceiving == 'true' ? true : false

      const { data } = await axios.post(`/api/purchaseOrders/createReceivingFromPo?region=${state.currentRegion}&businessId=${state.user.businessId}`, {
        shippingProducts,
        orderInfo: {
          orderNumber: values.orderNumber,
          orderProducts,
        },
        receivingItems: state.receivingFromPo.items,
        isNewReceiving: isNewReceiving,
        receivingIdToAdd: isNewReceiving ? null : parseInt(values.receivingIdToAdd),
        warehouseId: state.receivingFromPo.warehouse.id,
        finalBoxesConfiguration,
      })

      if (!data.error) {
        setShowCreateReceivingFromPo(false)
        toast.update(createReceiving, {
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
              warehouse={warehouses?.find((w) => w.warehouseId === state.receivingFromPo.warehouse.id)!}
              boxes={finalBoxesConfiguration}
              orderBarcode={data.orderid3PL}
            />,
            validation.values.isNewReceiving === 'true'
              ? `${orderNumberStart}${validation.values.orderNumber}`
              : openReceivings?.find((receiving) => receiving.id == parseInt(validation.values.receivingIdToAdd))?.orderNumber!
          )
        } else {
          downloadPDF(
            <PrintReceivingLabel
              companyName={state.user.name}
              prefix3PL={state.user.prefix3PL}
              warehouse={warehouses?.find((w) => w.warehouseId === state.receivingFromPo.warehouse.id)!}
              boxes={finalBoxesConfiguration}
              orderBarcode={
                validation.values.isNewReceiving === 'true'
                  ? `${orderNumberStart}${validation.values.orderNumber}`
                  : openReceivings?.find((receiving) => receiving.id == parseInt(validation.values.receivingIdToAdd))?.orderNumber!
              }
            />,
            validation.values.isNewReceiving === 'true'
              ? `${orderNumberStart}${validation.values.orderNumber}`
              : openReceivings?.find((receiving) => receiving.id == parseInt(validation.values.receivingIdToAdd))?.orderNumber!
          )
        }

        await mutate('/api/getuser')
        router.push('/receivings')
      } else {
        toast.update(createReceiving, {
          render: data.message ?? 'Error creating Receiving',
          type: 'error',
          isLoading: false,
          autoClose: 3000,
        })
      }
      setloading(false)
    },
  })

  const handleCreateReceiving = (event: any) => {
    event.preventDefault()
    validation.handleSubmit()
  }

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
  } = useReceivingsBoxes(
    validation.values.packingConfiguration,
    validation.values.isNewReceiving === 'true'
      ? `${orderNumberStart}${validation.values.orderNumber}`
      : openReceivings?.find((receiving) => receiving.id == parseInt(validation.values.receivingIdToAdd))?.orderNumber!
  )

  const { downloadPDF } = useGenerateLabels()

  return (
    <Dialog
      open={!!state.showCreateReceivingFromPo}
      onOpenChange={(open) => {
        if (!open) setShowCreateReceivingFromPo(!state.showCreateReceivingFromPo)
      }}>
      <DialogContent aria-describedby={undefined} className='max-h-[90vh] overflow-y-auto sm:!max-w-5xl' id='addPaymentToPoModal'>
        <DialogHeader className='pr-6' id='myModalLabel'>
          <DialogTitle>Create Receiving From Purchase Orders</DialogTitle>
        </DialogHeader>
        <div className='flex flex-wrap -mx-3'>
          <p className='m-0 text-[16.25px] font-semibold'>
            Destination: <span className='text-primary'>{state.receivingFromPo.warehouse.name}</span>
          </p>
        </div>
        <form onSubmit={handleCreateReceiving}>
          <div className='flex flex-wrap -mx-3'>
            <div className='px-3 w-full md:w-5/12'>
              <div className='mb-3'>
                <Label htmlFor='firstNameinput' className='mb-2 inline-block text-[11.2px]'>
                  *Transaction Number
                </Label>
                <InputGroup>
                  <InputGroupText className='font-semibold text-[16.25px] m-0 px-2 py-0' id='basic-addon1'>
                    {orderNumberStart}
                  </InputGroupText>
                  <Input
                    disabled={validation.values.isNewReceiving === 'false'}
                    type='text'
                    className='text-[13px] h-8 text-xs'
                    id='orderNumber'
                    name='orderNumber'
                    onChange={validation.handleChange}
                    onBlur={validation.handleBlur}
                    value={validation.values.orderNumber || ''}
                    aria-invalid={validation.touched.orderNumber && validation.errors.orderNumber ? true : undefined}
                  />
                  {validation.touched.orderNumber && validation.errors.orderNumber ? <div className='text-sm text-destructive'>{validation.errors.orderNumber}</div> : null}
                </InputGroup>
              </div>
            </div>
            <div className='px-3 w-full md:w-5/12'>
              <SelectSingleFilter
                inputLabel='*Select Receiving Type'
                inputName='isNewReceiving'
                placeholder='Choose a Type...'
                selected={
                  [...RECEIVING_TYPES, ...EXIST_RECEIVING_TYPE].find((option) => option.value === validation.values.isNewReceiving) || { value: '', label: 'Choose a Type...' }
                }
                options={openReceivings && openReceivings.length > 0 ? [...RECEIVING_TYPES, ...EXIST_RECEIVING_TYPE] : RECEIVING_TYPES}
                handleSelect={(option: SelectSingleValueType) => {
                  validation.handleChange({ target: { name: 'isNewReceiving', value: option!.value } })
                }}
                error={validation.errors.isNewReceiving}
              />
              {openReceivings && openReceivings.length <= 0 && <p className='text-muted-foreground text-[11.2px]'>{`No open receiving to ${state.receivingFromPo.warehouse.name}`}</p>}
              {validation.values.isNewReceiving === 'false' && (
                <SelectSingleFilter
                  inputLabel='*Select Existing Receiving'
                  inputName='receivingIdToAdd'
                  placeholder='Choose a Type...'
                  selected={{
                    value: validation.values.receivingIdToAdd,
                    label: openReceivings?.find((receiving) => receiving.id == parseInt(validation.values.receivingIdToAdd))?.orderNumber || 'Choose a Receiving...',
                  }}
                  options={openReceivings?.map((receiving) => ({ value: receiving.id, label: receiving.orderNumber })) || [{ value: '', label: '' }]}
                  handleSelect={(option: SelectSingleValueType) => {
                    validation.handleChange({ target: { name: 'receivingIdToAdd', value: option!.value } })
                  }}
                  error={validation.errors.receivingIdToAdd}
                />
              )}
            </div>
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
            <TabPane tabId='summary'>{activeTab == 'summary' && <Create_Receiving_Summary_Tab />}</TabPane>
            <TabPane tabId='packages'>
              {activeTab == 'packages' && (
                <Create_Receiving_Packages_Tab
                  packingConfiguration={validation.values.packingConfiguration}
                  setPackingConfiguration={(field: string, value: string) => validation.setFieldValue(field, value)}
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
                <Button
                  disabled={loading || Object.keys(state.receivingFromPo.items).length <= 0}
                  type='button'
                  className='inline-flex h-9 items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium text-[11.2px] btn-soft-primary'
                  onClick={() => setactiveTab('packages')}>
                  Next Step
                </Button>
              )}
              {activeTab == 'packages' && (
                <Button disabled={loading || Object.keys(state.receivingFromPo.items).length <= 0 || hasBoxedErrors.error} type='submit' variant='success' className='text-[11.2px]'>
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

export default Create_Receiving_From_Po
