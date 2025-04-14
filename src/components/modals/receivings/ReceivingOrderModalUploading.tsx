/* eslint-disable react-hooks/exhaustive-deps */
// ALTER TABLE `dbpruebas` ADD `activeState` BOOLEAN NOT NULL DEFAULT TRUE AFTER `image`;
import React, { useEffect, useContext, useState } from 'react'
import { Button, Card, Col, Form, FormFeedback, FormGroup, Input, Label, Modal, ModalBody, ModalHeader, Row, Spinner } from 'reactstrap'
import AppContext from '@context/AppContext'
import axios from 'axios'
import * as Yup from 'yup'
import { useFormik } from 'formik'
import { toast } from 'react-toastify'
import { wholesaleProductRow } from '@typings'
import router from 'next/router'
import Papa from 'papaparse'
import { validateReceivingFile } from './validateReceivingFile'
import ExportBlankReceivingTemplate from './ExportBlankReceivingTemplate'
import UploadFileDropzone from '@components/ui/UploadFileDropzone'

type Props = {
  receivingUploadingModal: {
    show: boolean
  }
  orderNumberStart: string
  skuList: wholesaleProductRow[]
  setreceivingUploadingModal: (prev: any) => void
}
const ReceivingOrderModal = ({ receivingUploadingModal, orderNumberStart, skuList, setreceivingUploadingModal }: Props) => {
  const { state } = useContext(AppContext)
  const [selectedFiles, setselectedFiles] = useState([])
  const [uploadedSkuList, setuploadedSkuList] = useState<wholesaleProductRow[]>([])
  const [errorFile, setErrorFile] = useState(false)
  const [showErrorLines, setShowErrorLines] = useState(false)
  const [errorLines, setErrorLines] = useState<any>([])
  const [loading, setLoading] = useState(false)

  // const validSkuList = Object.groupBy(skuList, (item: wholesaleProductRow) => item.sku)
  const validSkuList = skuList.reduce((acc: { [key: string]: wholesaleProductRow[] }, item: wholesaleProductRow) => {
    if (!acc[item.sku]) {
      acc[item.sku] = []
    }
    acc[item.sku].push(item)
    return acc
  }, {})

  useEffect(() => {
    return () => {
      validation.resetForm()
    }
  }, [state.wholesaleOrderProducts])

  const validation = useFormik({
    // enableReinitialize : use this flag when initial values needs to be changed
    enableReinitialize: true,

    initialValues: {
      orderNumber: state.currentRegion == 'us' ? `00${state?.user?.orderNumber?.us}` : `00${state?.user?.orderNumber?.eu}`,
    },

    validationSchema: Yup.object({
      orderNumber: Yup.string()
        .matches(/^[a-zA-Z0-9-]+$/, `Invalid special characters: % & # " ' @ ~ , ...`)
        .max(100, 'Title is to Long')
        .required('Please enter Order Number'),
    }),

    onSubmit: async (values, { resetForm }) => {
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

      const shippingProducts = uploadedSkuList.map((product) => {
        return {
          sku: product.sku,
          qty: Number(product.orderQty),
          storeId: product.quantity.businessId,
          qtyPicked: 0,
          pickedHistory: [],
        }
      })

      const orderInfo = {
        orderNumber: values.orderNumber,
        orderProducts: uploadedSkuList.map((product) => {
          return {
            sku: product.sku,
            name: product.title,
            quantity: Number(product.orderQty),
            businessId: product.quantity.businessId,
            qtyReceived: 0,
          }
        }),
      }

      const response = await axios.post(`api/createReceivingOrder?region=${state.currentRegion}&businessId=${state.user.businessId}`, {
        shippingProducts: shippingProducts,
        orderInfo: orderInfo,
      })
      if (!response.data.error) {
        toast.update(creatingUploadedReceiving, {
          render: response.data.message,
          type: 'success',
          isLoading: false,
          autoClose: 3000,
        })
        resetForm()
        router.push('/receivings')
      } else {
        toast.update(creatingUploadedReceiving, {
          render: response.data.message,
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

        const uploadedSkuList = [] as wholesaleProductRow[]
        for await (const [sku, qty] of resultValues) {
          if (!sku) continue

          if (!validSkuList[sku]) continue
          const skuFound = { ...validSkuList[sku][0], orderQty: qty }

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

  return (
    <Modal
      fade={false}
      size='lg'
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
              <FormGroup className='mb-3'>
                <Label htmlFor='orderNumber' className='fs-7 form-label text-muted'>
                  *Order Number
                </Label>
                <div className='input-group'>
                  <span className='input-group-text fw-semibold fs-6' id='basic-addon1'>
                    {orderNumberStart}
                  </span>
                  <Input
                    type='text'
                    className='form-control fs-6'
                    id='orderNumber'
                    name='orderNumber'
                    onChange={validation.handleChange}
                    onBlur={validation.handleBlur}
                    value={validation.values.orderNumber || ''}
                    invalid={validation.touched.orderNumber && validation.errors.orderNumber ? true : false}
                  />
                  {validation.touched.orderNumber && validation.errors.orderNumber ? <FormFeedback type='invalid'>{validation.errors.orderNumber}</FormFeedback> : null}
                </div>
              </FormGroup>
              <div className='list-unstyled mb-0' id='file-previews'>
                {selectedFiles.map((f: any, i) => {
                  return (
                    <Card className='mt-1 mb-0 shadow-sm border dz-processing dz-image-preview dz-success dz-complete' key={i + '-file'}>
                      <div className='p-2'>
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
              {/* <Dropzone
                accept={{ 'text/csv': ['.csv'] }}
                multiple={false}
                onDrop={(acceptedFiles) => {
                  setErrorFile(false)
                  setErrorLines([])
                  setShowErrorLines(false)
                  handleAcceptedFiles(acceptedFiles)
                }}>
                {({ getRootProps }) => (
                  <div className='dropzone dz-clickable cursor-pointer' style={{ minHeight: '100px' }}>
                    <div className='px-3 dz-message needsclick' {...getRootProps()}>
                      <div className='mb-0'>
                        <i className='display-6 text-muted ri-upload-cloud-2-fill' />
                      </div>
                      <p className='fs-7'>Upload Invoices File. Drop Only CSV files here or click to upload.</p>
                    </div>
                  </div>
                )}
              </Dropzone> */}
              <UploadFileDropzone accptedFiles={{ 'text/csv': ['.csv'] }} handleAcceptedFiles={handleAcceptedFiles} description={`Upload Invoices File. Drop Only CSV files here or click to upload.`} />
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
            <Col md={12}>
              {!showErrorLines && (
                <table className='mt-3 table table-sm align-middle table-responsive table-nowrap table-striped-columns'>
                  <thead className='table-light'>
                    <tr>
                      <th>SKU</th>
                      <th className='text-center'>Total to Received</th>
                    </tr>
                  </thead>
                  <tbody className='fs-7'>
                    {uploadedSkuList?.map((product: any, index: number) => (
                      <tr key={index}>
                        <td>{product.sku}</td>
                        <td className='text-center'>{product.orderQty}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </Col>
            <Col md={12}>
              <div className='text-end'>
                <Button disabled={loading} type='submit' color='success' className='btn fs-7'>
                  {loading ? (
                    <span>
                      <Spinner color='#fff' size={'sm'} /> Creating...
                    </span>
                  ) : (
                    'Create Receiving'
                  )}
                </Button>
              </div>
            </Col>
          </Row>
        </Form>
      </ModalBody>
    </Modal>
  )
}

export default ReceivingOrderModal
