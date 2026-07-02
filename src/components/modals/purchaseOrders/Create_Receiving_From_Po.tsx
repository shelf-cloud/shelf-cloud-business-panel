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
import { toast } from 'react-toastify'

import {
  Alert,
  Button,
  Col,
  Form,
  FormFeedback,
  FormGroup,
  Input,
  Label,
  Modal,
  ModalBody,
  ModalHeader,
  Nav,
  NavItem,
  NavLink,
  Row,
  Spinner,
  TabContent,
  TabPane,
} from '@/components/migration-ui'
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
    <Modal
      fade={false}
      size='xl'
      id='addPaymentToPoModal'
      isOpen={state.showCreateReceivingFromPo}
      toggle={() => {
        setShowCreateReceivingFromPo(!state.showCreateReceivingFromPo)
      }}>
      <ModalHeader
        toggle={() => {
          setShowCreateReceivingFromPo(!state.showCreateReceivingFromPo)
        }}
        className='modal-title'
        id='myModalLabel'>
        Create Receiving From Purchase Orders
      </ModalHeader>
      <ModalBody>
        <Row>
          <p className='tw:m-0 tw:text-[16.25px] tw:font-semibold'>
            Destination: <span className='tw:text-primary'>{state.receivingFromPo.warehouse.name}</span>
          </p>
        </Row>
        <Form onSubmit={handleCreateReceiving}>
          <Row>
            <Col xs={12} md={5}>
              <FormGroup>
                <Label htmlFor='firstNameinput' className='tw:mb-2 tw:inline-block tw:text-[11.2px]'>
                  *Transaction Number
                </Label>
                <div className='input-group'>
                  <span className='input-group-text tw:font-semibold tw:text-[16.25px] tw:m-0 tw:px-2 tw:py-0' id='basic-addon1'>
                    {orderNumberStart}
                  </span>
                  <Input
                    disabled={validation.values.isNewReceiving === 'false'}
                    type='text'
                    className='tw:text-[13px]'
                    id='orderNumber'
                    name='orderNumber'
                    bsSize='sm'
                    onChange={validation.handleChange}
                    onBlur={validation.handleBlur}
                    value={validation.values.orderNumber || ''}
                    invalid={validation.touched.orderNumber && validation.errors.orderNumber ? true : false}
                  />
                  {validation.touched.orderNumber && validation.errors.orderNumber ? <FormFeedback type='invalid'>{validation.errors.orderNumber}</FormFeedback> : null}
                </div>
              </FormGroup>
            </Col>
            <Col xs={12} md={5}>
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
              {openReceivings && openReceivings.length <= 0 && <p className='tw:text-[var(--bs-secondary-color)] tw:text-[11.2px]'>{`No open receiving to ${state.receivingFromPo.warehouse.name}`}</p>}
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
            </Col>
          </Row>

          <Nav className='nav-tabs tw:border-b' role='tablist'>
            <NavItem style={{ cursor: 'pointer' }}>
              <NavLink
                className={activeTab == 'summary' ? 'tw:text-primary tw:font-semibold tw:text-[13px] tw:border tw:border-primary' : 'tw:text-[var(--bs-secondary-color)] tw:text-[13px]'}
                onClick={() => {
                  setactiveTab('summary')
                }}
                type='button'>
                Summary
              </NavLink>
            </NavItem>
            <NavItem style={{ cursor: 'pointer' }}>
              <NavLink
                className={activeTab == 'packages' ? 'tw:text-primary tw:font-semibold tw:text-[13px] tw:border tw:border-primary' : 'tw:text-[var(--bs-secondary-color)] tw:text-[13px]'}
                onClick={() => {
                  setactiveTab('packages')
                }}
                type='button'>
                Boxes
              </NavLink>
            </NavItem>
          </Nav>

          <TabContent activeTab={activeTab} className='tw:pt-2 tw:mb-4'>
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
          <Row className='tw:mb-2'>
            {hasBoxedErrors.error && (
              <Col xs={12} className='tw:m-0'>
                <Alert color='danger' className='tw:text-[11.2px] tw:py-1 tw:mb-2'>
                  <i className='ri-error-warning-line me-3 align-middle fs-5' />
                  {hasBoxedErrors.message}
                </Alert>
              </Col>
            )}
          </Row>
          <Row md={12}>
            <div className='tw:flex tw:justify-end tw:items-center tw:gap-2'>
              {activeTab == 'summary' && (
                <Button
                  disabled={loading || Object.keys(state.receivingFromPo.items).length <= 0}
                  type='button'
                  className='tw:text-[11.2px] btn-soft-primary'
                  onClick={() => setactiveTab('packages')}>
                  Next Step
                </Button>
              )}
              {activeTab == 'packages' && (
                <Button disabled={loading || Object.keys(state.receivingFromPo.items).length <= 0 || hasBoxedErrors.error} type='submit' color='success' className='tw:text-[11.2px]'>
                  {loading ? (
                    <span>
                      <Spinner color='light' size={'sm'} /> Creating...
                    </span>
                  ) : (
                    'Create Receiving'
                  )}
                </Button>
              )}
            </div>
          </Row>
        </Form>
      </ModalBody>
    </Modal>
  )
}

export default Create_Receiving_From_Po
