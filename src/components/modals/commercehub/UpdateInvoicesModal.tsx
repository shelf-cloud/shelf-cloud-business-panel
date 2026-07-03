 
import router from 'next/router'
import { useContext, useState } from 'react'

import UploadFileDropzone from '@components/ui/UploadFileDropzone'
import AppContext from '@context/AppContext'
import { CommerceHubStore } from '@typesTs/commercehub/invoices'
import axios from 'axios'
import { useFormik } from 'formik'
import Papa from 'papaparse'
import { toast } from 'react-toastify'
import { Button } from '@shadcn/ui/button'
import { Card } from '@shadcn/ui/card'
import { Dialog, DialogContent, DialogHeader } from '@shadcn/ui/dialog'
import { Label } from '@shadcn/ui/label'
import { NativeSelect } from '@shadcn/ui/native-select'
import { Spinner } from '@shadcn/ui/spinner'
import * as Yup from 'yup'

import { validateCitiBankLowesFile, validateHomeDepotFile, validateLowesFile } from './validateFileTypesInfo'

type Props = {
  showUpdateInvoices: {
    show: boolean
  }
  setshowUpdateInvoices: (prev: any) => void
  clearFilters?: () => void
  mutate: () => void
  stores: CommerceHubStore[]
}

const UpdateInvoicesModal = ({ showUpdateInvoices, setshowUpdateInvoices, clearFilters, stores, mutate }: Props) => {
  const { state }: any = useContext(AppContext)
  const [selectedFiles, setselectedFiles] = useState([])
  const [errorFile, setErrorFile] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showErrorLines, setShowErrorLines] = useState(false)
  const [errorLines, setErrorLines] = useState([]) as any
  const [showerrorResponse, setShowErrorResponse] = useState(false)
  const [errorResponse, setErrorResponse] = useState([]) as any

  const validation = useFormik({
    initialValues: {
      storeId: '',
      fileType: '',
    },
    validationSchema: Yup.object({
      storeId: Yup.string().required('Select a Store'),
      fileType: Yup.string().required('Select a file Type'),
    }),

    onSubmit: async (values, { resetForm }) => {
      setLoading(true)
      setErrorLines([])
      setShowErrorLines(false)
      setShowErrorResponse(false)
      setErrorResponse([])
      if (selectedFiles.length == 0) {
        setErrorFile(true)
        return
      }

      let validateResponse = []
      let fileLineStart = 1

      Papa.parse(selectedFiles[0], {
        complete: async function (results, _file) {
          const resultValues = results.data as any
          switch (values.fileType) {
            case 'homedepot':
              validateResponse = await validateHomeDepotFile(resultValues)
              break
            case 'lowes':
              validateResponse = await validateLowesFile(resultValues)
              break
            case 'citibanklowes':
              validateResponse = await validateCitiBankLowesFile(resultValues)
              break
            default:
              validateResponse = []
              break
          }

          if (validateResponse.length > 0) {
            setErrorLines(validateResponse)
            setShowErrorLines(true)
            setLoading(false)
            return
          }

          let hasError = false
          const uploadingFile = toast.loading('Uploading file...')
          const chunkSize = 110
          const totalChunks = Math.ceil(results.data.length / chunkSize)

          for (let i = fileLineStart; i < results.data.length; i += chunkSize) {
            const chunk = results.data.slice(i, i + chunkSize)

            try {
              const response = await axios.post(`/api/commerceHub/uploadInvoicesFile?region=${state.currentRegion}&businessId=${state.user.businessId}`, {
                fileType: values.fileType,
                storeId: values.storeId,
                invoiceData: chunk,
              })
              if (response.data.error) {
                // Handle error response for that batch
                setErrorResponse(response.data.msg || [])
                setShowErrorResponse(true)
                toast.update(uploadingFile, {
                  render: 'Error uploading file.',
                  type: 'error',
                  isLoading: false,
                  autoClose: 3000,
                })
                hasError = true
                break // Optionally stop further uploads if one fails
              }

              // Calculate progress percentage
              const currentChunkIndex = i / chunkSize + 1 // Current chunk (1-indexed)
              const progressPercentage = Math.round((currentChunkIndex / totalChunks) * 100)

              // Update the toast message with the current progress
              toast.update(uploadingFile, {
                render: `Uploading file... (${progressPercentage}%)`,
                type: 'info',
                isLoading: true,
                autoClose: false,
              })
            } catch (error) {
              // Handle any unexpected errors
              toast.update(uploadingFile, {
                render: 'An error occurred during upload.',
                type: 'error',
                isLoading: false,
                autoClose: 3000,
              })
              break
            }
          }
          if (!hasError) {
            setShowErrorResponse(false)
            setErrorResponse([])
            toast.update(uploadingFile, {
              render: 'File uploaded successfully.',
              type: 'success',
              isLoading: false,
              autoClose: 3000,
            })
            resetForm()
            setshowUpdateInvoices({ show: false })
            clearFilters && clearFilters()
            mutate()
          }
          setLoading(false)
        },
      })
    },
  })

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

  const handleUploadFile = (event: any) => {
    event.preventDefault()
    validation.handleSubmit()
  }

  return (
    <Dialog
      open={!!showUpdateInvoices.show}
      onOpenChange={(open) => {
        if (!open) setshowUpdateInvoices({ show: false })
      }}>
      <DialogContent id='myModal' aria-describedby={undefined} className='max-h-[90vh] overflow-y-auto sm:!max-w-3xl'>
      <DialogHeader className='pr-6 modal-title' id='myModalLabel'>
        <p className='text-primary text-[19.5px]'>Import File to Update Commerce Hub Invoices</p>
      </DialogHeader>
      <div>
        <div className='mb-4'>
          <p className='m-0 text-[16.25px] font-bold'>Download Guide:</p>
          <p className='m-0 mb-1 text-[13px] font-semibold'>
            Lowes: <span className='m-0 text-[11.2px] font-light'>{`Download  de Vendor Gateway -> Finance & Accounting -> INVOICES`}</span>
          </p>
          <p className='m-0 mb-1 text-[13px] font-semibold'>
            Home Depot:{' '}
            <span className='m-0 text-[11.2px] font-light'>{`Download de Supplier Hub -> FINANCE AND ACCOUNTING -> Merch Payables Self-Service Portal -> Payments -> Remittance Advice`}</span>
          </p>
        </div>
        <form onSubmit={handleUploadFile}>
          <div className='flex flex-wrap -mx-3 mb-4'>
            <div className='px-3 md:w-6/12'>
              <div className='mb-0'>
                <Label htmlFor='storeId' className='form-label'>
                  *Store
                </Label>
                <NativeSelect
                  className='text-[11.2px]'
                  id='storeId'
                  name='storeId'
                  onChange={(e) => {
                    validation.handleChange(e)
                    validation.setFieldValue('fileType', stores.find((store) => store.value === e.target.value)?.fileType)
                  }}
                  onBlur={validation.handleBlur}
                  aria-invalid={(validation.touched.storeId && validation.errors.storeId ? true : false) || undefined}>
                  <option value=''>Choose Store..</option>
                  {stores?.map((store) => (
                    <option key={store.value} value={store.value}>
                      {store.label} - File: {store.fileType}
                    </option>
                  ))}
                </NativeSelect>
                {validation.touched.storeId && validation.errors.storeId ? <div className='text-sm text-destructive'>{validation.errors.storeId}</div> : null}
              </div>
              <p className='text-[11.2px] text-[var(--bs-secondary-color)] font-light m-0'>
                {`You might need to configure in marketplace manager if you don't see a store.`}{' '}
                <span onClick={() => router.push('/marketplaceManager')} className='text-primary' style={{ cursor: 'pointer' }}>
                  <i className='ri-external-link-fill ms-1 text-[13px] text-primary' />
                </span>
              </p>
              <div className='list-none pl-0 mb-0' id='file-previews'>
                {selectedFiles.map((f: any, i) => {
                  return (
                    <Card className='mt-1 mb-0 shadow-[0_0.125rem_0.25rem_rgba(0,0,0,0.075)] border dz-processing dz-image-preview dz-success dz-complete' key={i + '-file'}>
                      <div className='p-2'>
                        <div className='flex flex-wrap -mx-3 items-center'>
                          <div className='px-3 flex justify-between items-center'>
                            <div>
                              <p className='text-[var(--bs-secondary-color)] font-bold m-0'>{f.name}</p>
                              <p className='mb-0'>
                                <strong>{f.formattedSize}</strong>
                              </p>
                            </div>
                            <div>
                              <Button
                                variant='light'
                                className='btn-icon'
                                onClick={() => {
                                  setselectedFiles([])
                                  setErrorLines([])
                                  setShowErrorLines(false)
                                  setShowErrorResponse(false)
                                  setErrorResponse([])
                                }}>
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
            </div>
            <div className='px-3 md:w-6/12'>
              {/* <Dropzone
                accept={{ 'text/csv': ['.csv'] }}
                multiple={false}
                onDrop={(acceptedFiles) => {
                  handleAcceptedFiles(acceptedFiles)
                }}>
                {({ getRootProps }) => (
                  <div className='dropzone dz-clickable cursor-pointer'>
                    <div className='px-3 dz-message needsclick' {...getRootProps()}>
                      <div className='mb-3'>
                        <i className='display-4 text-muted ri-upload-cloud-2-fill' />
                      </div>
                      <p className='text-[13px]'>Upload Invoices File. Drop Only CSV files here or click to upload.</p>
                    </div>
                  </div>
                )}
              </Dropzone> */}
              <UploadFileDropzone
                accptedFiles={{ 'text/csv': ['.csv'] }}
                handleAcceptedFiles={handleAcceptedFiles}
                description={`Upload Products Details. Drop Only CSV files here or click to upload.`}
              />
            </div>
          </div>
          {errorFile && <p className='text-danger m-0'>You must Upload a CSV file to upload products.</p>}
          {showErrorLines && (
            <div style={{ overflowY: 'scroll', height: '30vh', scrollbarWidth: 'none' }} className='my-4'>
              <p className='text-danger m-0'>
                There are <span className='font-bold'>{errorLines.length}</span> errors in this file. Please review the following lines:
              </p>
              <table className='w-full align-middle mb-0 [&_th]:px-2 [&_th]:py-1 [&_td]:px-2 [&_td]:py-1'>
                <thead>
                  <tr className='text-danger'>
                    <th className='text-center'>In Line</th>
                    <th>Value</th>
                    <th>Error</th>
                  </tr>
                </thead>
                <tbody>
                  {errorLines.map((error: any, index: number) => (
                    <tr key={`ErrorLine${index}`} className='m-0'>
                      <td className='text-center'>{error.errorLine}</td>
                      <td className='text-wrap w-1/4'>{error.value}</td>
                      <td className='text-wrap w-full ps-4'>- {error.errorMessage}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {showerrorResponse && errorResponse?.map((error: any, index: number) => <p key={`ErrorLine${index}`} className='text-danger m-0'>{`Error: ${error}`}</p>)}
          <div className='px-3 w-full'>
            <div className='text-right'>
              <Button type='submit' variant='success'>
                {loading ? (
                  <span>
                    <Spinner className='text-white' /> Uploading...
                  </span>
                ) : (
                  'Upload File'
                )}
              </Button>
            </div>
          </div>
        </form>
      </div>
      </DialogContent>
    </Dialog>
  )
}

export default UpdateInvoicesModal
