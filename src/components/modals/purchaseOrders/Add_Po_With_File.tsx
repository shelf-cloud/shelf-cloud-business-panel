import React, { useContext, useState } from 'react'
import { Button, Card, Col, FormFeedback, FormGroup, Input, Label, Modal, ModalBody, ModalHeader, Row, Spinner } from 'reactstrap'
import AppContext from '@context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useSWRConfig } from 'swr'
import { useRouter } from 'next/router'
import * as Yup from 'yup'
import { Formik, Form } from 'formik'
import Papa from 'papaparse'
import Dropzone from 'react-dropzone'
import useSWR from 'swr'

type Props = {
  orderNumberStart: string
}
type Supplier = {
  suppliersId: number
  name: string
}
const Add_Po_With_File = ({ orderNumberStart }: Props) => {
  const router = useRouter()
  const { organizeBy } = router.query
  const { state, setShowCreatePoFromFile }: any = useContext(AppContext)
  const { mutate } = useSWRConfig()
  const [selectedFiles, setselectedFiles] = useState([])
  const [errorFile, setErrorFile] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showErrorLines, setShowErrorLines] = useState(false)
  const [errorLines, setErrorLines] = useState([]) as any
  const [showerrorResponse, setShowErrorResponse] = useState(false)
  const [errorResponse, setErrorResponse] = useState([]) as any
  const fetcher = (endPoint: string) => axios(endPoint).then((res) => res.data)
  const { data: suppliersList }: { data?: Supplier[] } = useSWR(
    state.user.businessId ? `/api/purchaseOrders/getSuppliers?region=${state.currentRegion}&businessId=${state.user.businessId}` : null,
    fetcher
  )

  const initialValues = {
    orderNumber: state.currentRegion == 'us' ? `00${state?.user?.orderNumber?.us}` : `00${state?.user?.orderNumber?.eu}`,
    supplier: '',
    date: '',
  }

  const validationSchema = Yup.object({
    orderNumber: Yup.string()
      .matches(/^[a-zA-Z0-9-]+$/, `Invalid special characters: % & # " ' @ ~ , ... Nor White Spaces`)
      .max(50, 'Order Number is to Long')
      .required('Required Order Number'),
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

          const response = await axios.post(`/api/purchaseOrders/addPoFromFile?region=${state.currentRegion}&businessId=${state.user.businessId}`, {
            ...values,
            resultValues,
          })
          if (!response.data.error) {
            setShowErrorResponse(false)
            setErrorResponse([])
            toast.success(response.data.msg)
            setShowCreatePoFromFile(false)
            if (organizeBy == 'suppliers') {
              mutate(`/api/purchaseOrders/getpurchaseOrdersBySuppliers?region=${state.currentRegion}&businessId=${state.user.businessId}`)
            } else if (organizeBy == 'orders') {
              mutate(`/api/purchaseOrders/getpurchaseOrdersByOrders?region=${state.currentRegion}&businessId=${state.user.businessId}`)
            } else if (organizeBy == 'sku') {
              mutate(`/api/purchaseOrders/getpurchaseOrdersBySku?region=${state.currentRegion}&businessId=${state.user.businessId}`)
            }
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
    <Modal
      fade={false}
      size='xl'
      id='addPoFromFile'
      isOpen={state.showCreatePoFromFile}
      toggle={() => {
        setShowCreatePoFromFile(!state.showCreatePoFromFile)
      }}>
      <ModalHeader
        toggle={() => {
          setShowCreatePoFromFile(!state.showCreatePoFromFile)
        }}
        className='modal-title'
        id='myModalLabel'>
        Create New Purchase Order
      </ModalHeader>
      <ModalBody>
        <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={(values) => handleSubmit(values)}>
          {({ values, errors, touched, handleChange, handleBlur }) => (
            <Form>
              <Row>
                <Col md={6}>
                  <FormGroup className='mb-1'>
                    <Label htmlFor='firstNameinput' className='form-label'>
                      *Purchase Order Number
                    </Label>
                    <div className='input-group'>
                      <span className='input-group-text fw-semibold fs-5' id='basic-addon1'>
                        {orderNumberStart}
                      </span>
                      <Input
                        type='text'
                        className='form-control'
                        id='orderNumber'
                        name='orderNumber'
                        onChange={handleChange}
                        onBlur={handleBlur}
                        value={values.orderNumber || ''}
                        invalid={touched.orderNumber && errors.orderNumber ? true : false}
                      />
                      {touched.orderNumber && errors.orderNumber ? <FormFeedback type='invalid'>{errors.orderNumber}</FormFeedback> : null}
                    </div>
                  </FormGroup>
                  <FormGroup className='mb-1'>
                    <Label htmlFor='firstNameinput' className='form-label'>
                      *Supplier
                    </Label>
                    <Input
                      type='select'
                      className='form-control'
                      id='supplier'
                      name='supplier'
                      onChange={handleChange}
                      onBlur={handleBlur}
                      value={values.supplier || ''}
                      invalid={touched.supplier && errors.supplier ? true : false}>
                      <option value=''>Select ...</option>
                      {suppliersList?.map((supplier: Supplier) => (
                        <option key={supplier.suppliersId} value={supplier.suppliersId}>
                          {supplier.name}
                        </option>
                      ))}
                    </Input>
                    {touched.supplier && errors.supplier ? <FormFeedback type='invalid'>{errors.supplier}</FormFeedback> : null}
                  </FormGroup>
                  <FormGroup className='mb-1'>
                    <Label htmlFor='firstNameinput' className='form-label'>
                      *Date
                    </Label>
                    <Input
                      type='date'
                      className='form-control'
                      id='date'
                      name='date'
                      onChange={handleChange}
                      onBlur={handleBlur}
                      value={values.date || ''}
                      invalid={touched.date && errors.date ? true : false}
                    />
                    {touched.date && errors.date ? <FormFeedback type='invalid'>{errors.date}</FormFeedback> : null}
                  </FormGroup>
                  {showErrorLines &&
                    errorLines.map((error: any, index: number) => (
                      <p key={`ErrorLine${index}`} className='text-danger m-0 p-0'>{`- Error in Line: ${error.errorLine} Value: ${error.value} Error: ${error.errorMessage}`}</p>
                    ))}
                  {showerrorResponse && errorResponse.map((error: any, index: number) => <p key={`ErrorLine${index}`} className='text-danger m-0'>{`Error: ${error}`}</p>)}
                </Col>
                <Col md={6}>
                  <p className='fs-6 fw-normal'>
                    You can import a Purchase Order by uploading a CSV file using the{' '}
                    <a
                      className='text-primary'
                      href={
                        state.currentRegion == 'us'
                          ? 'https://docs.google.com/spreadsheets/d/1c-Scw5zmrSkaBqu5HSaO7EHXbm0_hxKTQecjRaLRSR4/template/preview'
                          : 'https://docs.google.com/spreadsheets/d/1c-Scw5zmrSkaBqu5HSaO7EHXbm0_hxKTQecjRaLRSR4/template/preview'
                      }
                      target={'_blank'}
                      rel='noreferrer'>
                      template
                    </a>{' '}
                    file.
                  </p>
                  <Dropzone
                    accept={{ 'text/csv': ['.csv'] }}
                    multiple={false}
                    onDrop={(acceptedFiles) => {
                      handleAcceptedFiles(acceptedFiles)
                    }}>
                    {({ getRootProps }) => (
                      <div className='dropzone dz-clickable cursor-pointer'>
                        <div className='dz-message needsclick' {...getRootProps()}>
                          <div className='mb-3'>
                            <i className='display-4 text-muted ri-upload-cloud-2-fill' />
                          </div>
                          <h4 className='fs-5 px-3'>Upload Purchase Order Info. Drop Only CSV files here or click to upload.</h4>
                        </div>
                      </div>
                    )}
                  </Dropzone>
                  <Col md={12}>
                    <div className='list-unstyled mb-0' id='file-previews'>
                      {selectedFiles.map((f: any, i) => {
                        return (
                          <Card className='mt-1 mb-0 shadow-none border dz-processing dz-image-preview dz-success dz-complete' key={i + '-file'}>
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
                                    <Button color='light' className='btn-icon' onClick={() => setselectedFiles([])}>
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
                    {errorFile && <p className='text-danger m-0'>You must Upload a CSV file to upload purchase order.</p>}
                  </Col>
                </Col>
              </Row>

              <Col md={12} className='mt-4'>
                <div className='text-end'>
                  <Button disabled={errorFile || showErrorLines || showerrorResponse} type='submit' color='success' className='btn'>
                    {loading ? <Spinner /> : 'Create PO'}
                  </Button>
                </div>
              </Col>
            </Form>
          )}
        </Formik>
      </ModalBody>
    </Modal>
  )
}

export default Add_Po_With_File
