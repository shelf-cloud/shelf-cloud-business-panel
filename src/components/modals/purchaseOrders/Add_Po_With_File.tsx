import { useRouter } from 'next/router'
import { useContext, useState } from 'react'

import SimpleSelect, { SelectSingleValueType } from '@components/Common/SimpleSelect'
import UploadFileDropzone from '@components/ui/UploadFileDropzone'
import SelectSingleFilter from '@components/ui/filters/SelectSingleFilter'
import AppContext from '@context/AppContext'
import { useRPNewForecast } from '@hooks/reorderingPoints/useRPNewForcast'
import { Supplier, useSuppliers } from '@hooks/suppliers/useSuppliers'
import { useWarehouses } from '@hooks/warehouses/useWarehouse'
import axios from 'axios'
import { Form, Formik } from 'formik'
import Papa from 'papaparse'
import { toast } from 'react-toastify'
import { Button } from '@shadcn/ui/button'
import { Card } from '@shadcn/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@shadcn/ui/dialog'
import { Input } from '@shadcn/ui/input'
import { Label } from '@shadcn/ui/label'
import { Spinner } from '@shadcn/ui/spinner'
import { useSWRConfig } from 'swr'
import * as Yup from 'yup'

type Props = {
  orderNumberStart: string
}

const Add_Po_With_File = ({ orderNumberStart }: Props) => {
  const router = useRouter()
  const { status, organizeBy } = router.query
  const { state, setShowCreatePoFromFile }: any = useContext(AppContext)
  const { mutate } = useSWRConfig()
  const [selectedFiles, setselectedFiles] = useState([])
  const [errorFile, setErrorFile] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showErrorLines, setShowErrorLines] = useState(false)
  const [errorLines, setErrorLines] = useState([]) as any
  const [showerrorResponse, setShowErrorResponse] = useState(false)
  const [errorResponse, setErrorResponse] = useState([]) as any
  const { suppliers } = useSuppliers()
  const { warehouses, isLoading } = useWarehouses()
  const { generate_new_forecast_products } = useRPNewForecast()

  const initialValues = {
    orderNumber: state.currentRegion == 'us' ? `00${state?.user?.orderNumber?.us}` : `00${state?.user?.orderNumber?.eu}`,
    destinationSC: { value: '', label: 'Select ...' },
    supplier: '',
    date: '',
  }

  const validationSchema = Yup.object({
    orderNumber: Yup.string()
      .matches(/^[a-zA-Z0-9-]+$/, `Invalid special characters: % & # " ' @ ~ , ... Nor White Spaces`)
      .max(50, 'Order Number is to Long')
      .required('Required Order Number'),
    destinationSC: Yup.object().shape({
      value: Yup.number().when([], {
        is: () => !false,
        then: Yup.number().required('Destination Required'),
      }),
    }),
    supplier: Yup.string().required('Required Supplier'),
    date: Yup.date().required('Required Date'),
  })

  const validateProductsInfo = async (resultValues: any) => {
    let errorsList = []
    if (resultValues.length <= 1) {
      errorsList.push({ errorLine: 0, errorMessage: 'No product Information', value: 'No Data Found' })
      return errorsList
    }
    for (let i = 1; i < resultValues.length; i++) {
      const rowValues = resultValues[i] as any
      if (rowValues[0] != '' && rowValues[0] != null) {
        for (let v = 0; v < rowValues.length; v++) {
          switch (v) {
            case 0:
              ;/^[a-zA-Z0-9-]{4,50}$/.test(rowValues[v])
                ? () => {}
                : errorsList.push({ errorLine: i, errorMessage: 'Format error, invalid special characters: " , . @... No blank spaces.', value: rowValues[v] })
              break
            case 1:
              ;/^[0-9]{1,}$/.test(rowValues[v])
                ? () => {}
                : errorsList.push({ errorLine: i, errorMessage: 'Format error, only integers are valid. No decimal numbers.', value: rowValues[v] })
              break
            default:
            // code block
          }
        }
      }
    }
    return errorsList
  }

  const handleSubmit = async (values: any) => {
    setLoading(true)
    setErrorLines([])
    setShowErrorLines(false)
    setShowErrorResponse(false)
    setErrorResponse([])

    if (selectedFiles.length == 0) {
      setErrorFile(true)
      setLoading(false)
      return
    }

    Papa.parse(selectedFiles[0], {
      complete: async function (results, _file) {
        const resultValues = results.data as any
        await validateProductsInfo(resultValues).then(async (res) => {
          if (res.length > 0) {
            setErrorLines(res)
            setShowErrorLines(true)
            setLoading(false)
            return
          }

          const hasSplitting = false
          const selectedWarehouse = warehouses.find((w) => w.warehouseId === parseInt(values.destinationSC.value))

          const response = await axios.post(`/api/purchaseOrders/addPoFromFile?region=${state.currentRegion}&businessId=${state.user.businessId}`, {
            ...values,
            resultValues,
            destinationSC: hasSplitting ? 0 : warehouses?.find((w) => w.warehouseId === parseInt(values.destinationSC.value))?.isSCDestination ? 1 : 0,
            warehouseId: hasSplitting ? 0 : parseInt(values.destinationSC.value),
            name3PL: hasSplitting ? null : selectedWarehouse?.name3PL,
          })

          if (!response.data.error) {
            generate_new_forecast_products({
              skus: response.data.skus ?? [],
              productIds: response.data.productIds ?? [],
            })
            if (organizeBy == 'suppliers') {
              mutate(`/api/purchaseOrders/getpurchaseOrdersBySuppliers?region=${state.currentRegion}&businessId=${state.user.businessId}&status=${status}`)
            } else if (organizeBy == 'orders') {
              mutate(`/api/purchaseOrders/getpurchaseOrdersByOrders?region=${state.currentRegion}&businessId=${state.user.businessId}&status=${status}`)
            } else if (organizeBy == 'sku') {
              mutate(`/api/purchaseOrders/getpurchaseOrdersBySku?region=${state.currentRegion}&businessId=${state.user.businessId}&status=${status}`)
            }
            setShowErrorResponse(false)
            setErrorResponse([])
            toast.success(response.data.msg)
            setShowCreatePoFromFile(false)
          } else {
            setErrorResponse(response.data.errorList)
            setShowErrorResponse(true)
            toast.error('There were some errors creating Purchase Order.')
          }
          setLoading(false)
        })
      },
    })
  }

  function handleAcceptedFiles(files: any) {
    files.map((file: any) =>
      Object.assign(file, {
        preview: URL.createObjectURL(file),
        formattedSize: formatBytes(file.size),
      })
    )
    setShowErrorResponse(false)
    setErrorResponse([])
    setErrorLines([])
    setShowErrorLines(false)
    setErrorFile(false)
    setselectedFiles(files)
  }

  function formatBytes(bytes: any, decimals = 2) {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const dm = decimals < 0 ? 0 : decimals
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']

    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
  }

  return (
    <Dialog open={!!state.showCreatePoFromFile} onOpenChange={(open) => { if (!open) setShowCreatePoFromFile(!state.showCreatePoFromFile) }}>
      <DialogContent aria-describedby={undefined} className='max-h-[90vh] overflow-y-auto sm:!max-w-3xl' id='addPoFromFile'>
        <DialogHeader className='pr-6'>
          <DialogTitle className='modal-title' id='addPoFromFileModalLabel'>
            Create New Purchase Order
          </DialogTitle>
        </DialogHeader>
        <div>
        <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={(values) => handleSubmit(values)}>
          {({ values, errors, touched, handleChange, handleBlur }) => (
            <Form>
              <div className='flex flex-wrap -mx-3'>
                <div className='px-3 md:w-1/2'>
                  <div className='mb-1'>
                    <Label htmlFor='firstNameinput' className='form-label'>
                      *Purchase Order Number
                    </Label>
                    <div className='input-group'>
                      <span className='input-group-text font-semibold text-[16.25px] m-0 px-2 py-0' id='basic-addon1'>
                        {orderNumberStart}
                      </span>
                      <Input
                        type='text'
                        className='text-[13px] h-8 text-xs'
                        id='orderNumber'
                        name='orderNumber'
                        onChange={handleChange}
                        onBlur={handleBlur}
                        value={values.orderNumber || ''}
                        aria-invalid={(touched.orderNumber && errors.orderNumber ? true : false) || undefined}
                      />
                      {touched.orderNumber && errors.orderNumber ? <div className='text-sm text-destructive'>{errors.orderNumber}</div> : null}
                    </div>
                  </div>

                  <div className='mb-2'>
                    <Label className='form-label mb-1 text-[11.2px]'>*Destination</Label>
                    <SimpleSelect
                      options={warehouses?.map((w) => ({ value: `${w.warehouseId}`, label: w.name })) || []}
                      selected={values.destinationSC}
                      handleSelect={(selected) => {
                        handleChange({ target: { name: 'destinationSC', value: selected } })
                      }}
                      placeholder={isLoading ? 'Loading...' : 'Select ...'}
                      customStyle='sm'
                    />
                    {errors.destinationSC && touched.destinationSC ? <div className='m-0 p-0 text-danger text-[11.2px]'>*{errors.destinationSC.value}</div> : null}
                  </div>

                  <SelectSingleFilter
                    inputLabel={'*Supplier'}
                    inputName={'supplier'}
                    placeholder={'Select ...'}
                    selected={{ value: values.supplier, label: suppliers?.find((supplier: Supplier) => supplier.suppliersId == parseInt(values.supplier))?.name || 'Select...' }}
                    options={suppliers?.map((supplier: Supplier) => ({ value: supplier.suppliersId, label: supplier.name })) || [{ value: '', label: '' }]}
                    handleSelect={(option: SelectSingleValueType) => {
                      handleChange({ target: { name: 'supplier', value: option!.value } })
                    }}
                    error={errors.supplier}
                  />
                  <div className='mb-1'>
                    <Label htmlFor='firstNameinput' className='form-label mb-1 text-[11.2px]'>
                      *Date
                    </Label>
                    <Input
                      type='date'
                      className='text-[13px] h-8 text-xs'
                      id='date'
                      name='date'
                      onChange={handleChange}
                      onBlur={handleBlur}
                      value={values.date || ''}
                      aria-invalid={(touched.date && errors.date ? true : false) || undefined}
                    />
                    {touched.date && errors.date ? <div className='text-sm text-destructive'>{errors.date}</div> : null}
                  </div>
                  {showErrorLines &&
                    errorLines.map((error: any, index: number) => (
                      <p key={`ErrorLine${index}`} className='text-danger m-0 p-0'>{`- Error in Line: ${error.errorLine} Value: ${error.value} Error: ${error.errorMessage}`}</p>
                    ))}
                  {showerrorResponse && errorResponse.map((error: any, index: number) => <p key={`ErrorLine${index}`} className='text-danger m-0'>{`Error: ${error}`}</p>)}
                </div>
                <div className='px-3 md:w-1/2'>
                  <p className='text-[13px] font-normal'>
                    You can import a Purchase Order by uploading a CSV file using the{' '}
                    <a
                      className='!text-primary'
                      href={'https://docs.google.com/spreadsheets/d/15_8JObdU8ysyTPu-CkwdO5yOAioDJVq-/template/preview'}
                      target={'_blank'}
                      rel='noreferrer'>
                      template
                    </a>{' '}
                    file.
                  </p>
                  {/* <Dropzone
                    accept={{ 'text/csv': ['.csv'] }}
                    multiple={false}
                    onDrop={(acceptedFiles) => {
                      handleAcceptedFiles(acceptedFiles)
                    }}>
                    {({ getRootProps }) => (
                      <div className='dropzone dz-clickable cursor-pointer'>
                        <div className='dz-message needsclick' {...getRootProps()}>
                          <div className='mb-3'>
                            <i className='display-5 text-muted ri-upload-cloud-2-fill' />
                          </div>
                          <h4 className='text-[13px] px-3'>Upload Purchase Order Info. Drop Only CSV files here or click to upload.</h4>
                        </div>
                      </div>
                    )}
                  </Dropzone> */}
                  <UploadFileDropzone
                    accptedFiles={{ 'text/csv': ['.csv'] }}
                    handleAcceptedFiles={handleAcceptedFiles}
                    description={`Upload Purchase Order Info. Drop Only CSV files here or click to upload.`}
                  />
                  <div className='px-3 w-full'>
                    <div className='list-unstyled mb-0' id='file-previews'>
                      {selectedFiles.map((f: any, i) => {
                        return (
                          <Card className='mt-1 mb-0 shadow-none border dz-processing dz-image-preview dz-success dz-complete' key={i + '-file'}>
                            <div className='p-2'>
                              <div className='flex flex-wrap -mx-3 items-center'>
                                <div className='px-3 flex-1 basis-0 flex justify-between items-center'>
                                  <div>
                                    <p className='text-[var(--bs-secondary-color)] font-bold m-0'>{f.name}</p>
                                    <p className='mb-0'>
                                      <strong>{f.formattedSize}</strong>
                                    </p>
                                  </div>
                                  <div>
                                    <Button variant='light' className='btn-icon' onClick={() => setselectedFiles([])}>
                                      <i className=' ri-close-line' />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </Card>
                        )
                      })}
                    </div>
                    {errorFile && <p className='text-danger m-0'>You must Upload a CSV file to upload purchase order.</p>}
                  </div>
                </div>
              </div>

              <div className='px-3 w-full mt-6'>
                <div className='text-right'>
                  <Button disabled={errorFile || showErrorLines || showerrorResponse} type='submit' variant='success' className='text-[11.2px]'>
                    {loading ? (
                      <span>
                        <Spinner className='text-white' /> Creating...
                      </span>
                    ) : (
                      'Create PO'
                    )}
                  </Button>
                </div>
              </div>
            </Form>
          )}
        </Formik>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default Add_Po_With_File
