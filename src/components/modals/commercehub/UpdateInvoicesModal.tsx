/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useContext } from 'react'
import { Button, Card, Col, Form, FormFeedback, FormGroup, Input, Label, Modal, ModalBody, ModalHeader, Row, Spinner } from 'reactstrap'
import AppContext from '@context/AppContext'
import axios from 'axios'
import * as Yup from 'yup'
import { toast } from 'react-toastify'
import Dropzone from 'react-dropzone'
import Papa from 'papaparse'
import { useFormik } from 'formik'
import { validateHomeDepotFile, validateLowesFile } from './validateFileTypesInfo'

type Props = {
  showUpdateInvoices: {
    show: boolean
  }
  setshowUpdateInvoices: (prev: any) => void
  clearFilters: () => void
  stores: { value: string; label: string }[]
}

const FILE_TYPES = [
  { value: 'homedepot', label: 'Home Depot' },
  { value: 'lowes', label: 'Lowes' },
]

const UpdateInvoicesModal = ({ showUpdateInvoices, setshowUpdateInvoices, clearFilters, stores }: Props) => {
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
          const chunkSize = 90
          const totalChunks = Math.ceil(results.data.length / chunkSize)

          for (let i = 0; i < results.data.length; i += chunkSize) {
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
            clearFilters()
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
    <Modal
      fade={false}
      size='lg'
      id='myModal'
      isOpen={showUpdateInvoices.show}
      toggle={() => {
        setshowUpdateInvoices({ show: false })
      }}>
      <ModalHeader
        toggle={() => {
          setshowUpdateInvoices({ show: false })
        }}
        className='modal-title'
        id='myModalLabel'>
        <p className='text-primary fs-4'>Import File to Update Commerce Hub Invoices</p>
      </ModalHeader>
      <ModalBody>
        <div className='mb-3'>
          <p className='m-0 fs-5 fw-bold'>Download Guide:</p>
          <p className='m-0 mb-1 fs-6 fw-semibold'>
            Lowes: <span className='m-0 fs-7 fw-light'>{`Download  de Vendor Gateway -> Finance & Accounting -> INVOICES`}</span>
          </p>
          <p className='m-0 mb-1 fs-6 fw-semibold'>
            Home Depot:{' '}
            <span className='m-0 fs-7 fw-light'>{`Download de Supplier Hub -> FINANCE AND ACCOUNTING -> Merch Payables Self-Service Portal -> Payments -> Remittance Advice`}</span>
          </p>
        </div>
        <Form onSubmit={handleUploadFile}>
          <Row className='mb-3'>
            <Col md={6}>
              <FormGroup className='mb-0'>
                <Label htmlFor='storeId' className='form-label'>
                  *Store
                </Label>
                <Input
                  type='select'
                  className='form-control fs-7'
                  id='storeId'
                  name='storeId'
                  onChange={validation.handleChange}
                  onBlur={validation.handleBlur}
                  invalid={validation.touched.storeId && validation.errors.storeId ? true : false}>
                  <option value=''>Choose Store..</option>
                  {stores?.map((store) => (
                    <option key={store.value} value={store.value}>
                      {store.label}
                    </option>
                  ))}
                </Input>
                {validation.touched.storeId && validation.errors.storeId ? <FormFeedback type='invalid'>{validation.errors.storeId}</FormFeedback> : null}
              </FormGroup>
              <FormGroup className='mb-3'>
                <Label htmlFor='fileType' className='form-label'>
                  *File Type
                </Label>
                <Input
                  type='select'
                  className='form-control fs-7'
                  id='fileType'
                  name='fileType'
                  onChange={validation.handleChange}
                  onBlur={validation.handleBlur}
                  invalid={validation.touched.fileType && validation.errors.fileType ? true : false}>
                  <option value=''>Choose fileType..</option>
                  {FILE_TYPES?.map((store) => (
                    <option key={store.value} value={store.value}>
                      {store.label}
                    </option>
                  ))}
                </Input>
                {validation.touched.fileType && validation.errors.fileType ? <FormFeedback type='invalid'>{validation.errors.fileType}</FormFeedback> : null}
              </FormGroup>
              <div className='list-unstyled mb-0' id='file-previews'>
                {selectedFiles.map((f: any, i) => {
                  return (
                    <Card className='mt-1 mb-0 shadow-sm border dz-processing dz-image-preview dz-success dz-complete' key={i + '-file'}>
                      <div className='p-2'>
                        <Row className='align-items-center'>
                          <Col className='d-flex justify-content-between align-items-center'>
                            <div>
                              <p className='text-muted font-weight-bold m-0'>{f.name}</p>
                              <p className='mb-0'>
                                <strong>{f.formattedSize}</strong>
                              </p>
                            </div>
                            <div>
                              <Button
                                color='light'
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
                          </Col>
                        </Row>
                      </div>
                    </Card>
                  )
                })}
              </div>
            </Col>
            <Col md={6}>
              <Dropzone
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
                      <p className='fs-6'>Upload Invoices File. Drop Only CSV files here or click to upload.</p>
                    </div>
                  </div>
                )}
              </Dropzone>
            </Col>
          </Row>
          {errorFile && <p className='text-danger m-0'>You must Upload a CSV file to upload products.</p>}
          {showErrorLines && (
            <div style={{ overflowY: 'scroll', height: '30vh', scrollbarWidth: 'none' }} className='my-3'>
              <p className='text-danger m-0'>
                There are <span className='fw-bold'>{errorLines.length}</span> errors in this file. Please review the following lines:
              </p>
              <table className='table table-sm'>
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
                      <td className='text-wrap w-25'>{error.value}</td>
                      <td className='text-wrap w-100 ps-3'>- {error.errorMessage}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {showerrorResponse && errorResponse?.map((error: any, index: number) => <p key={`ErrorLine${index}`} className='text-danger m-0'>{`Error: ${error}`}</p>)}
          <Col md={12}>
            <div className='text-end'>
              <Button type='submit' color='success'>
                {loading ? (
                  <span>
                    <Spinner size={'sm'} color='light' /> Uploading...
                  </span>
                ) : (
                  'Upload File'
                )}
              </Button>
            </div>
          </Col>
        </Form>
      </ModalBody>
    </Modal>
  )
}

export default UpdateInvoicesModal
