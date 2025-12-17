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
} from 'reactstrap'
import * as Yup from 'yup'

import Create_Manual_Receiving_Packages_Tab from './createReceiving/Create_Manual_Receiving_Packages_Tab'
import Create_Manual_Receiving_Summary_Tab from './createReceiving/Create_Manual_Receiving_Summary_Tab'

type Props = {
  orderNumberStart: string
  receivingProducts: ReceivingInventory[]
}

const ReceivingOrderModal = ({ orderNumberStart, receivingProducts }: Props) => {
  const { state, setWholeSaleOrderModal }: any = useContext(AppContext)
  const { warehouses, isLoading } = useWarehouses()
  const { downloadPDF } = useGenerateLabels()
  const [loading, setLoading] = useState(false)
  const [activeTab, setactiveTab] = useState('summary')

  const validation = useFormik({
    enableReinitialize: false,
    initialValues: {
      orderNumber: state.currentRegion == 'us' ? `00${state?.user?.orderNumber?.us}` : `00${state?.user?.orderNumber?.eu}`,
      packingConfiguration: 'single',
      shipmentType: { value: '', label: 'Select ...' },
      destinationSC: { value: '', label: 'Select ...' },
    },
    validationSchema: Yup.object({
      orderNumber: Yup.string()
        .matches(/^[a-zA-Z0-9-]+$/, `Invalid special characters: % & # " ' @ ~ , ...`)
        .max(100, 'Title is to Long')
        .required('Please enter Order Number'),
      destinationSC: Yup.object().shape({
        value: Yup.number().when([], {
          is: () => true,
          then: Yup.number().required('Destination Required'),
        }),
      }),
      shipmentType: Yup.object().shape({
        value: Yup.string().when([], {
          is: () => true,
          then: Yup.string().required('Shipment Type Required'),
        }),
      }),
    }),
    onSubmit: async (values) => {
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
          orderNumber: `${orderNumberStart}${validation.values.orderNumber}`,
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
              warehouse={warehouses?.find((w) => w.warehouseId === parseInt(validation.values.destinationSC.value))!}
              boxes={finalBoxesConfiguration}
              orderBarcode={data.orderid3PL}
              isManualReceiving={true}
            />,
            `${orderNumberStart}${validation.values.orderNumber}`
          )
        } else {
          downloadPDF(
            <PrintReceivingLabel
              companyName={state.user.name}
              prefix3PL={state.user.prefix3PL}
              warehouse={warehouses?.find((w) => w.warehouseId === parseInt(validation.values.destinationSC.value))!}
              boxes={finalBoxesConfiguration}
              orderBarcode={`${orderNumberStart}${validation.values.orderNumber}`}
              isManualReceiving={true}
            />,
            `${orderNumberStart}${validation.values.orderNumber}`
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
    },
  })

  const HandleAddProduct = (event: any) => {
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
  } = useCreateManualReceivingsBoxes(receivingProducts, validation.values.packingConfiguration, `${orderNumberStart}${validation.values.orderNumber}`)

  const { filteredWarehouses } = useFilterWarehousesByShipmentType(warehouses, validation.values.shipmentType.value)

  return (
    <Modal
      fade={false}
      size='xl'
      id='createReceivingOrderFromTable'
      isOpen={state.showWholeSaleOrderModal}
      toggle={() => {
        setWholeSaleOrderModal(!state.showWholeSaleOrderModal)
      }}>
      <ModalHeader
        toggle={() => {
          setWholeSaleOrderModal(!state.showWholeSaleOrderModal)
        }}
        className='modal-title'
        id='myModalLabel'>
        Create Manual Receiving
      </ModalHeader>
      <ModalBody>
        <Form onSubmit={HandleAddProduct}>
          <h5 className='fs-5 fw-bolder'>Receiving Details</h5>
          <Row>
            <Col xs={12} md={4}>
              <FormGroup>
                <Label htmlFor='orderNumber' className='form-label fs-7'>
                  *Transaction Number
                </Label>
                <div className='input-group'>
                  <span className='input-group-text fw-semibold fs-5 m-0 px-2 py-0' id='basic-addon1'>
                    {orderNumberStart}
                  </span>
                  <Input
                    type='text'
                    className='form-control fs-6'
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
            <Col xs={12} md={4}>
              <Label className='form-label fs-7'>*Shipment Type</Label>
              <SimpleSelect
                options={RECEIVING_SHIPMENT_TYPES}
                selected={validation.values.shipmentType}
                handleSelect={(selected) => {
                  validation.setFieldValue('shipmentType', selected)
                  validation.setFieldValue('destinationSC', { value: '', label: 'Select ...' })
                }}
                placeholder={'Select ...'}
                customStyle='sm'
              />
              {validation.errors.shipmentType && validation.touched.shipmentType ? <div className='m-0 p-0 text-danger fs-7'>*{validation.errors.shipmentType.value}</div> : null}
            </Col>
            <Col xs={12} md={4}>
              <Label className='form-label fs-7'>*Select Destination</Label>
              <SimpleSelect
                options={filteredWarehouses}
                selected={validation.values.destinationSC}
                handleSelect={(selected) => {
                  validation.setFieldValue('destinationSC', selected)
                }}
                placeholder={isLoading ? 'Loading...' : 'Select ...'}
                customStyle='sm'
              />
              {validation.errors.destinationSC && validation.touched.destinationSC ? (
                <div className='m-0 p-0 text-danger fs-7'>*{validation.errors.destinationSC.value}</div>
              ) : null}
            </Col>
          </Row>

          <Nav className='nav-tabs border-bottom' role='tablist'>
            <NavItem style={{ cursor: 'pointer' }}>
              <NavLink
                className={activeTab == 'summary' ? 'text-primary fw-semibold fs-6 border border-primary' : 'text-muted fs-6'}
                onClick={() => {
                  setactiveTab('summary')
                }}
                type='button'>
                Summary
              </NavLink>
            </NavItem>
            <NavItem style={{ cursor: 'pointer' }}>
              <NavLink
                className={activeTab == 'packages' ? 'text-primary fw-semibold fs-6 border border-primary' : 'text-muted fs-6'}
                onClick={() => {
                  setactiveTab('packages')
                }}
                type='button'>
                Boxes
              </NavLink>
            </NavItem>
          </Nav>

          <TabContent activeTab={activeTab} className='pt-2 mb-3'>
            <TabPane tabId='summary'>{activeTab == 'summary' && <Create_Manual_Receiving_Summary_Tab orderProducts={receivingProducts} />}</TabPane>
            <TabPane tabId='packages'>
              {activeTab == 'packages' && (
                <Create_Manual_Receiving_Packages_Tab
                  orderProducts={receivingProducts}
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

          <Row className='mb-2'>
            {hasBoxedErrors.error && (
              <Col xs={12} className='m-0'>
                <Alert color='danger' className='fs-7 py-1 mb-2'>
                  <i className='ri-error-warning-line me-3 align-middle fs-5' />
                  {hasBoxedErrors.message}
                </Alert>
              </Col>
            )}
          </Row>
          <Row md={12}>
            <div className='d-flex justify-content-end align-items-center gap-2'>
              {activeTab == 'summary' && (
                <Button disabled={loading || receivingProducts.length <= 0} type='button' className='fs-7 btn-soft-primary' onClick={() => setactiveTab('packages')}>
                  Next Step
                </Button>
              )}
              {activeTab == 'packages' && (
                <Button disabled={loading || receivingProducts.length <= 0 || hasBoxedErrors.error} type='submit' color='success' className='fs-7'>
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

export default ReceivingOrderModal
