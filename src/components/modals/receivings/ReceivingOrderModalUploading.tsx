 
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

import { Button } from '@shadcn/ui/button'
import { Card } from '@shadcn/ui/card'
import { Input } from '@shadcn/ui/input'
import { Label } from '@shadcn/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@shadcn/ui/dialog'
import { Spinner } from '@shadcn/ui/spinner'
import { Alert } from '@/components/ui/Alert'
import { Nav, NavItem, NavLink, TabContent, TabPane } from '@/components/ui/nav-tabs'
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

  const handleAddProduct = (event: any) => {
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
    <Dialog
      open={!!receivingUploadingModal.show}
      onOpenChange={(open) => {
        if (!open) setreceivingUploadingModal({ show: false })
      }}>
      <DialogContent aria-describedby={undefined} className='max-h-[90vh] overflow-y-auto sm:!max-w-5xl' id='createReceivingOrderByUploading'>
        <DialogHeader className='pr-6 modal-title' id='myModalLabel'>
          <DialogTitle>Create Receiving by Uploading File</DialogTitle>
        </DialogHeader>
        <div>
          <form onSubmit={handleAddProduct}>
          <div className='flex flex-wrap -mx-3'>
            <h5 className='text-[16.25px] font-extrabold'>Order Details</h5>
            <p className='m-0 mb-2 text-[11.2px]'>
              You can download a template to help you create your receiving file. <ExportBlankReceivingTemplate />
            </p>
            <div className='px-3 w-full md:w-6/12'>
              <div className='px-3 w-full'>
                <div className='mb-3'>
                  <Label htmlFor='orderNumber' className='mb-2 inline-block text-[11.2px]'>
                    *Transaction Number
                  </Label>
                  <div className='input-group'>
                    <span className='input-group-text font-semibold text-[16.25px] m-0 px-2 py-0' id='basic-addon1'>
                      {orderNumberStart}
                    </span>
                    <Input
                      type='text'
                      className='h-8 text-xs'
                      id='orderNumber'
                      name='orderNumber'
                      onChange={validation.handleChange}
                      onBlur={validation.handleBlur}
                      value={validation.values.orderNumber || ''}
                      aria-invalid={Boolean(validation.touched.orderNumber && validation.errors.orderNumber) || undefined}
                    />
                    {validation.touched.orderNumber && validation.errors.orderNumber ? <div className='text-sm text-destructive'>{validation.errors.orderNumber}</div> : null}
                  </div>
                </div>
              </div>
              <div className='px-3 w-full'>
                <Label className='mb-2 inline-block text-[11.2px]'>*Select Destination</Label>
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
                  <div className='m-0 p-0 text-destructive text-[11.2px]'>*{validation.errors.destinationSC.value}</div>
                ) : null}
              </div>
              <div className='px-3 w-full'>
                <Label htmlFor='orderNumber' className='mb-1 inline-block text-[11.2px] mt-4'>
                  *Uploaded File
                </Label>
                <div className='list-none mb-0' id='file-previews'>
                  {selectedFiles.length === 0 && <div className='text-destructive text-[11.2px]'>No file selected. Please upload a CSV file with the SKUs and quantities.</div>}
                  {selectedFiles.map((f: any, i) => {
                    return (
                      <Card className='mt-1 mb-0 shadow border dz-processing dz-image-preview dz-success dz-complete' key={i + '-file'}>
                        <div className='px-4 py-1'>
                          <div className='flex flex-wrap -mx-3 items-center'>
                            <div className='px-3 flex justify-between items-center'>
                              <div>
                                <p className='text-[var(--bs-secondary-color)] font-bold m-0 text-[11.2px]'>{f.name}</p>
                                <p className='mb-0 text-[11.2px]'>
                                  <strong>{f.formattedSize}</strong>
                                </p>
                              </div>
                              <div>
                                <Button
                                  variant='light'
                                  onClick={() => {
                                    setuploadedSkuList([])
                                    setselectedFiles([])
                                    setErrorLines([])
                                    setErrorFile(false)
                                    setShowErrorLines(false)
                                  }}>
                                  <i className='ri-close-line text-[16.25px]' />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Card>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* File Upload */}
            <div className='px-3 w-full md:w-6/12'>
              <UploadFileDropzone
                accptedFiles={{ 'text/csv': ['.csv'] }}
                handleAcceptedFiles={handleAcceptedFiles}
                description={`Upload Invoices File. Drop Only CSV files here or click to upload.`}
              />
            </div>
            {errorFile && <p className='text-destructive m-0 text-[11.2px]'>You must Upload a CSV file to upload products.</p>}
            {showErrorLines && (
              <div style={{ overflowY: 'scroll', height: '40vh' }} className='my-4'>
                <p className='text-destructive m-0 text-[11.2px]'>
                  <span className='font-bold'>{errorLines.length}</span> errors found. Please review the following lines:
                </p>
                <table className='w-full [&_th]:px-2 [&_th]:py-1 [&_td]:px-2 [&_td]:py-1'>
                  <thead>
                    <tr className='text-destructive text-[11.2px]'>
                      <th className='text-center text-nowrap'>In Line</th>
                      <th>Value</th>
                      <th>Error</th>
                    </tr>
                  </thead>
                  <tbody className='text-[11.2px]'>
                    {errorLines.map((error: any, index: number) => (
                      <tr key={`ErrorLine${index}`} className='m-0'>
                        <td className='text-center'>{error.errorLine}</td>
                        <td className='text-wrap w-1/4'>{error.value}</td>
                        <td className='text-wrap w-full'>{error.errorMessage}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <Nav className='nav-tabs border-b' role='tablist'>
              <NavItem style={{ cursor: 'pointer' }}>
                <NavLink
                  className={activeTab == 'summary' ? '!text-primary font-semibold text-[13px] border border-primary' : '!text-[color:var(--bs-secondary-color)] text-[13px]'}
                  onClick={() => {
                    setactiveTab('summary')
                  }}
                  type='button'>
                  Summary
                </NavLink>
              </NavItem>
              <NavItem style={{ cursor: 'pointer' }}>
                <NavLink
                  className={activeTab == 'packages' ? '!text-primary font-semibold text-[13px] border border-primary' : '!text-[color:var(--bs-secondary-color)] text-[13px]'}
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
          </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default ReceivingOrderModal
