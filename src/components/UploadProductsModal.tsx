/* eslint-disable @next/next/no-img-element */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useContext } from 'react'
import { Button, Card, Col, Modal, ModalBody, ModalHeader, Row, Spinner } from 'reactstrap'
import AppContext from '@context/AppContext'
import { toast } from 'react-toastify'
import router from 'next/router'
import axios from 'axios'
import Papa from 'papaparse'
import UploadFileDropzone from '@components/ui/UploadFileDropzone'

type Props = {}

const UploadProductsModal = ({}: Props) => {
  const { state, setUploadProductsModal }: any = useContext(AppContext)
  const [selectedFiles, setselectedFiles] = useState([])
  const [errorFile, setErrorFile] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showErrorLines, setShowErrorLines] = useState(false)
  const [errorLines, setErrorLines] = useState([]) as any
  const [showerrorResponse, setShowErrorResponse] = useState(false)
  const [errorResponse, setErrorResponse] = useState([]) as any

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
              ;/^[a-zA-Z0-9-]{4,50}$/.test(rowValues[v]) ? () => {} : errorsList.push({ errorLine: i, errorMessage: 'Value format error', value: rowValues[v] })
              break
            case 1:
              ;/^[a-zA-Z0-9-Á-öø-ÿ\s]{10,100}$/.test(rowValues[v]) ? () => {} : errorsList.push({ errorLine: i, errorMessage: 'Value format error', value: rowValues[v] })
              break
            case 2:
              ;/^[0-9]{5,20}$/.test(rowValues[v]) ? () => {} : errorsList.push({ errorLine: i, errorMessage: 'Value format error', value: rowValues[v] })
              break
            case 3:
              ;() => {}
              break
            case 4:
              ;() => {}
              break
            case 5:
              ;/[0-9]?[.]?[0-9]{1,}/.test(rowValues[v]) ? () => {} : errorsList.push({ errorLine: i, errorMessage: 'Value format error', value: rowValues[v] })
              break
            case 6:
              ;/[0-9]?[.]?[0-9]{1,}/.test(rowValues[v]) ? () => {} : errorsList.push({ errorLine: i, errorMessage: 'Value format error', value: rowValues[v] })
              break
            case 7:
              ;/[0-9]?[.]?[0-9]{1,}/.test(rowValues[v]) ? () => {} : errorsList.push({ errorLine: i, errorMessage: 'Value format error', value: rowValues[v] })
              break
            case 8:
              ;/[0-9]?[.]?[0-9]{1,}/.test(rowValues[v]) ? () => {} : errorsList.push({ errorLine: i, errorMessage: 'Value format error', value: rowValues[v] })
              break
            case 9:
              ;/^[0-9]{1,}$/.test(rowValues[v]) ? () => {} : errorsList.push({ errorLine: i, errorMessage: 'Value format error', value: rowValues[v] })
              break
            case 10:
              ;/[0-9]?[.]?[0-9]{1,}/.test(rowValues[v]) ? () => {} : errorsList.push({ errorLine: i, errorMessage: 'Value format error', value: rowValues[v] })
              break
            case 11:
              ;/[0-9]?[.]?[0-9]{1,}/.test(rowValues[v]) ? () => {} : errorsList.push({ errorLine: i, errorMessage: 'Value format error', value: rowValues[v] })
              break
            case 12:
              ;/[0-9]?[.]?[0-9]{1,}/.test(rowValues[v]) ? () => {} : errorsList.push({ errorLine: i, errorMessage: 'Value format error', value: rowValues[v] })
              break
            case 13:
              ;/[0-9]?[.]?[0-9]{1,}/.test(rowValues[v]) ? () => {} : errorsList.push({ errorLine: i, errorMessage: 'Value format error', value: rowValues[v] })
              break
            case 14:
              ;/[(http(s)?):\/\/(www\.)?a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/.test(rowValues[v]) ? () => {} : errorsList.push({ errorLine: i, errorMessage: 'Value format error', value: rowValues[v] })
              break
            default:
            // code block
          }
        }
      }
    }
    return errorsList
  }
  const handleUploadProducts = async () => {
    setLoading(true)
    setErrorLines([])
    setShowErrorLines(false)
    setShowErrorResponse(false)
    setErrorResponse([])
    if (selectedFiles.length == 0) {
      setErrorFile(true)
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

          const response = await axios.post(`api/uploadTemplateFile?region=${state.currentRegion}&businessId=${state.user.businessId}`, {
            productInfo: results.data,
          })
          if (!response.data.error) {
            setShowErrorResponse(false)
            setErrorResponse([])
            toast.success('All products where added to Inventory list!')
            setUploadProductsModal(false)
            router.push('/Products')
          } else {
            setErrorResponse(response.data.msg)
            setShowErrorResponse(true)
            toast.error('There were some errors when uploading products.')
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
      size='lg'
      id='myModal'
      isOpen={state.showUploadProductsModal}
      toggle={() => {
        setUploadProductsModal(!state.showUploadProductsModal)
      }}>
      <ModalHeader
        toggle={() => {
          setUploadProductsModal(!state.showUploadProductsModal)
        }}
        className='modal-title'
        id='myModalLabel'>
        <p className='fs-3'>Import Products</p>
      </ModalHeader>
      <ModalBody>
        <p className='fs-5 fw-normal'>
          You can import products in bulk by uploading a CSV file using the{' '}
          <a
            className='text-primary'
            href={
              state.currentRegion == 'us'
                ? 'https://docs.google.com/spreadsheets/d/1eHz260ce5orrlv8Jc_rx0xc1uiYB_U5V21dB72lpi_w/template/preview'
                : 'https://docs.google.com/spreadsheets/d/1fCb_bxaFt3P2O5FPiPIInESBB8vFIPtQKUU86N2P8UQ/template/preview'
            }
            target={'_blank'}
            rel='noreferrer'>
            template
          </a>{' '}
          file.
        </p>
        <Row>
          <Col md={6}>
            {/* <Dropzone
              accept={{ 'text/csv': ['.csv'] }}
              multiple={false}
              onDrop={(acceptedFiles) => {
                handleAcceptedFiles(acceptedFiles)
              }}
              onDropRejected={(error) => {
                toast.error(error[0].errors[0].message)
              }}>
              {({ getRootProps }) => (
                <div className='dropzone dz-clickable cursor-pointer' {...getRootProps()}>
                  <div className='dz-message needsclick' {...getRootProps()}>
                    <div className='mb-3'>
                      <i className='display-4 text-muted ri-upload-cloud-2-fill' />
                    </div>
                    <h4>Upload Products Info. Drop Only CSV files here or click to upload.</h4>
                  </div>
                </div>
              )}
            </Dropzone> */}
            <UploadFileDropzone accptedFiles={{ 'text/csv': ['.csv'] }} handleAcceptedFiles={handleAcceptedFiles} description={`Upload Products Info. Drop Only CSV files here or click to upload.`} />
          </Col>
          <Col md={6}>
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
          </Col>
        </Row>
        {errorFile && <p className='text-danger m-0'>You must Upload a CSV file to upload products.</p>}
        {showErrorLines && errorLines.map((error: any, index: number) => <p key={`ErrorLine${index}`} className='text-danger m-0'>{`Error in Line: ${error.errorLine} Value: ${error.value} Error: ${error.errorMessage}`}</p>)}
        {showerrorResponse && errorResponse.map((error: any, index: number) => <p key={`ErrorLine${index}`} className='text-danger m-0'>{`Error: ${error}`}</p>)}
        <Col md={12}>
          <div className='text-end'>
            <Button type='button' color='success' className='btn' onClick={handleUploadProducts}>
              {loading ? <Spinner /> : 'Upload File'}
            </Button>
          </div>
        </Col>
      </ModalBody>
    </Modal>
  )
}

export default UploadProductsModal
