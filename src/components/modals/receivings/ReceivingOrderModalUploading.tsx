/* eslint-disable react-hooks/exhaustive-deps */
// ALTER TABLE `dbpruebas` ADD `activeState` BOOLEAN NOT NULL DEFAULT TRUE AFTER `image`;
import router from 'next/router'
import { useContext, useMemo, useState } from 'react'

import SimpleSelect from '@components/Common/SimpleSelect'
import PrintReceivingLabel from '@components/receiving/labels/PrintReceivingLabel'
import UploadFileDropzone from '@components/ui/UploadFileDropzone'
import AppContext from '@context/AppContext'
import { useGenerateLabels } from '@hooks/pdfRender/useGenerateLabels'
import { useCreateManualReceivingsBoxes } from '@hooks/receivings/useCreateManualReceivingsBoxes'
import { ReceivingInventory } from '@hooks/receivings/useReceivingInventory'
import { useWarehouses } from '@hooks/warehouses/useWarehouse'
import axios from 'axios'
import { useFormik } from 'formik'
import Papa from 'papaparse'
import { toast } from 'react-toastify'
import {
  Alert,
  Button,
  Card,
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

import ExportBlankReceivingTemplate from './ExportBlankReceivingTemplate'
import Create_Manual_Receiving_Packages_Tab from './createReceiving/Create_Manual_Receiving_Packages_Tab'
import Create_Manual_Receiving_Summary_Tab from './createReceiving/Create_Manual_Receiving_Summary_Tab'
import { validateReceivingFile } from './validateReceivingFile'

type UploadedSkuList = {
  sku: string
  quantity: number
}

type Props = {
  receivingUploadingModal: {
    show: boolean
  }
  orderNumberStart: string
  receivingInventory: ReceivingInventory[]
  setreceivingUploadingModal: (prev: any) => void
}
const ReceivingOrderModal = ({ receivingUploadingModal, orderNumberStart, receivingInventory, setreceivingUploadingModal }: Props) => {
  const { state } = useContext(AppContext)
  const { warehouses, isLoading } = useWarehouses()
  const { downloadPDF } = useGenerateLabels()
  const [activeTab, setactiveTab] = useState('summary')
  const [selectedFiles, setselectedFiles] = useState([])
  const [uploadedSkuList, setuploadedSkuList] = useState<UploadedSkuList[]>([])
  const [errorFile, setErrorFile] = useState(false)
  const [showErrorLines, setShowErrorLines] = useState(false)
  const [errorLines, setErrorLines] = useState<any>([])
  const [loading, setLoading] = useState(false)

  const validSkuList = useMemo(
    () =>
      receivingInventory.reduce((acc: { [key: string]: ReceivingInventory }, item: ReceivingInventory) => {
        acc[item.sku] = item
        return acc
      }, {}),
    [receivingInventory]
  )

  const receivingProducts = useMemo(() => {
    if (Object.keys(uploadedSkuList).length === 0) return []

    return uploadedSkuList.map((item) => {
      return {
        ...validSkuList[item.sku],
        quantity: item.quantity,
      }
    })
  }, [uploadedSkuList, validSkuList])

  const validation = useFormik({
    // enableReinitialize : use this flag when initial values needs to be changed
    enableReinitialize: true,

    initialValues: {
      orderNumber: state.currentRegion == 'us' ? `00${state?.user?.orderNumber?.us}` : `00${state?.user?.orderNumber?.eu}`,
      packingConfiguration: 'single',
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
    }),

    onSubmit: async (values) => {
      setLoading(true)

      const creatingUploadedReceiving = toast.loading('Creating Receiving...')

      if (selectedFiles.length == 0) {
        setErrorFile(true)
        return
      }

      if (uploadedSkuList.length == 0) {
        setErrorFile(true)
        return
      }

      // SHIPPING PRODUCTS
      let shippingProducts = [] as any
      uploadedSkuList.map((product) => {
        const item = validSkuList[product.sku]
        shippingProducts.push({
          poId: null,
          hasSplitting: false,
          splitId: null,
          sku: item.sku,
          name: item.title,
          boxQty: item.boxQty,
          inventoryId: item.inventoryId,
          qty: product.quantity,
          storeId: item.businessId,
          qtyPicked: 0,
          pickedHistory: [],
        })
      })

      // ORDER PRODUCTS
      let orderProducts = [] as any
      uploadedSkuList.map((product) => {
        const item = validSkuList[product.sku]
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
          quantity: product.quantity,
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
        receivingItems: uploadedSkuList,
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

  function handleAcceptedFiles(files: any) {
    files.map((file: any) =>
      Object.assign(file, {
        preview: URL.createObjectURL(file),
        formattedSize: formatBytes(file.size),
      })
    )

    setselectedFiles(files)

    Papa.parse(files[0], {
      complete: async function (results, _file) {
        const resultValues = results.data as string[][]

        await validateReceivingFile(resultValues, Object.keys(validSkuList)).then(async (res) => {
          if (res.length > 0) {
            setuploadedSkuList([])
            setErrorLines(res)
            setShowErrorLines(true)
            setLoading(false)
            return
          }
        })

        const uploadedSkuList = [] as ReceivingInventory[]
        for await (const [sku, qty] of resultValues) {
          if (!sku) continue

          if (!validSkuList[sku]) continue
          const skuFound = { ...validSkuList[sku], quantity: parseInt(qty) }

          uploadedSkuList.push(skuFound)
        }

        setuploadedSkuList(uploadedSkuList)
      },
    })
  }

  function formatBytes(bytes: any, decimals = 2) {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const dm = decimals < 0 ? 0 : decimals
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']

    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
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

  return (
    <Modal
      fade={false}
      size='xl'
      id='createReceivingOrderByUploading'
      isOpen={receivingUploadingModal.show}
      toggle={() => {
        setreceivingUploadingModal({ show: false })
      }}>
      <ModalHeader
        toggle={() => {
          setreceivingUploadingModal({ show: false })
        }}
        className='modal-title'
        id='myModalLabel'>
        Create Receiving by Uploading File
      </ModalHeader>
      <ModalBody>
        <Form onSubmit={HandleAddProduct}>
          <Row>
            <h5 className='fs-5 fw-bolder'>Order Details</h5>
            <p className='m-0 mb-2 fs-7'>
              You can download a template to help you create your receiving file. <ExportBlankReceivingTemplate />
            </p>
            <Col md={6}>
              <Col xs={12}>
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
              <Col xs={12}>
                <Label className='form-label fs-7'>*Select Destination</Label>
                <SimpleSelect
                  options={warehouses?.map((w) => ({ value: `${w.warehouseId}`, label: w.name })) || []}
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
              <Col xs={12}>
                <Label htmlFor='orderNumber' className='form-label fs-7 mt-3 mb-1'>
                  *Uploaded File
                </Label>
                <div className='list-unstyled mb-0' id='file-previews'>
                  {selectedFiles.length === 0 && <div className='text-danger fs-7'>No file selected. Please upload a CSV file with the SKUs and quantities.</div>}
                  {selectedFiles.map((f: any, i) => {
                    return (
                      <Card className='mt-1 mb-0 shadow border dz-processing dz-image-preview dz-success dz-complete' key={i + '-file'}>
                        <div className='px-3 py-1'>
                          <Row className='align-items-center'>
                            <Col className='d-flex justify-content-between align-items-center'>
                              <div>
                                <p className='text-muted font-weight-bold m-0 fs-7'>{f.name}</p>
                                <p className='mb-0 fs-7'>
                                  <strong>{f.formattedSize}</strong>
                                </p>
                              </div>
                              <div>
                                <Button
                                  color='light'
                                  className='btn-icon'
                                  onClick={() => {
                                    setuploadedSkuList([])
                                    setselectedFiles([])
                                    setErrorLines([])
                                    setErrorFile(false)
                                    setShowErrorLines(false)
                                  }}>
                                  <i className='ri-close-line fs-5' />
                                </Button>
                              </div>
                            </Col>
                          </Row>
                        </div>
                      </Card>
                    )
                  })}
                </div>
              </Col>
            </Col>

            {/* File Upload */}
            <Col md={6}>
              <UploadFileDropzone
                accptedFiles={{ 'text/csv': ['.csv'] }}
                handleAcceptedFiles={handleAcceptedFiles}
                description={`Upload Invoices File. Drop Only CSV files here or click to upload.`}
              />
            </Col>
            {errorFile && <p className='text-danger m-0 fs-7'>You must Upload a CSV file to upload products.</p>}
            {showErrorLines && (
              <div style={{ overflowY: 'scroll', height: '40vh' }} className='my-3'>
                <p className='text-danger m-0 fs-7'>
                  <span className='fw-bold'>{errorLines.length}</span> errors found. Please review the following lines:
                </p>
                <table className='table table-sm'>
                  <thead>
                    <tr className='text-danger fs-7'>
                      <th className='text-center text-nowrap'>In Line</th>
                      <th>Value</th>
                      <th>Error</th>
                    </tr>
                  </thead>
                  <tbody className='fs-7'>
                    {errorLines.map((error: any, index: number) => (
                      <tr key={`ErrorLine${index}`} className='m-0'>
                        <td className='text-center'>{error.errorLine}</td>
                        <td className='text-wrap w-25'>{error.value}</td>
                        <td className='text-wrap w-100'>{error.errorMessage}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

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
          </Row>
        </Form>
      </ModalBody>
    </Modal>
  )
}

export default ReceivingOrderModal
