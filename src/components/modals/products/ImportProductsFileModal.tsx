/* eslint-disable @next/next/no-img-element */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useContext } from 'react'
import { Button, Card, Col, Modal, ModalBody, ModalHeader, Row, Spinner } from 'reactstrap'
import AppContext from '@context/AppContext'
import { toast } from 'react-toastify'
import Dropzone from 'react-dropzone'
import axios from 'axios'
import Papa from 'papaparse'
import * as Yup from 'yup'
import { useSWRConfig } from 'swr'

type Props = {
  brands: string[]
  suppliers: string[]
  categories: string[]
  importModalDetails: {
    show: boolean
  }
  setimportModalDetails: (prev: any) => void
}

const ImportProductsFileModal = ({ importModalDetails, setimportModalDetails, brands, suppliers, categories }: Props) => {
  const { state }: any = useContext(AppContext)
  const { mutate } = useSWRConfig()
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
            // SKU
            case 0:
              const skuSchema = Yup.object().shape({
                sku: Yup.string()
                  .matches(/^[a-zA-Z0-9-]+$/, `Invalid special characters: " ' @ ~ , ...`)
                  .min(4)
                  .max(50)
                  .required('SKU is required'),
              })
              skuSchema.isValidSync({ sku: rowValues[v] })
                ? () => {}
                : errorsList.push({ errorLine: i + 1, errorMessage: `SKU: Required - No Spaces - Invalid Special characters: " ' @ ~ , ...`, value: rowValues[v] })
              break
            // title
            case 1:
              const titleSchema = Yup.object().shape({
                title: Yup.string()
                  .matches(/^[a-zA-Z0-9-–Á-öø-ÿ_/.()&*:\s]+$/, `Invalid special characters: " ' @ ~ , ...`)
                  .min(5)
                  .max(100)
                  .required('Title is required'),
              })
              titleSchema.isValidSync({ title: rowValues[v] })
                ? () => {}
                : errorsList.push({ errorLine: i + 1, errorMessage: `Title: Required - Invalid Special characters: " ' @ ~ , ...`, value: rowValues[v] })
              break
            // description
            case 2:
              ;() => {}
              break
            // asin
            case 3:
              const asinSchema = Yup.object().shape({
                asin: Yup.string(),
              })
              asinSchema.isValidSync({ asin: rowValues[v] }) ? () => {} : errorsList.push({ errorLine: i + 1, errorMessage: 'ASIN', value: rowValues[v] })
              break
            // fnsku
            case 4:
              const fnskuSchema = Yup.object().shape({
                fnsku: Yup.string(),
              })
              fnskuSchema.isValidSync({ fnsku: rowValues[v] }) ? () => {} : errorsList.push({ errorLine: i + 1, errorMessage: 'FNSKU', value: rowValues[v] })
              break
            // barcode
            case 5:
              const barcodeSchema = Yup.object().shape({
                barcode: Yup.string().required('Barcode is required'),
              })
              barcodeSchema.isValidSync({ barcode: rowValues[v] }) ? () => {} : errorsList.push({ errorLine: i + 1, errorMessage: 'Barcode: Required', value: rowValues[v] })
              break
            // supplier
            case 6:
              if (rowValues[v] != null && rowValues[v] !== '') {
                const supplierSchema = Yup.object().shape({
                  supplier: Yup.string().oneOf(suppliers, 'Invalid Supplier'),
                })
                supplierSchema.isValidSync({ supplier: rowValues[v] })
                  ? () => {}
                  : errorsList.push({ errorLine: i + 1, errorMessage: 'Supplier: Value not match business suppliers', value: rowValues[v] })
              }
              break
            // brand
            case 7:
              if (rowValues[v] != null && rowValues[v] !== '') {
                const brandSchema = Yup.object().shape({
                  brand: Yup.string().oneOf(brands, 'Invalid Brand'),
                })
                brandSchema.isValidSync({ brand: rowValues[v] })
                  ? () => {}
                  : errorsList.push({ errorLine: i + 1, errorMessage: 'Brand: Value not match business brands', value: rowValues[v] })
              }
              break
            // category
            case 8:
              if (rowValues[v] != null && rowValues[v] !== '') {
                const categorySchema = Yup.object().shape({
                  category: Yup.string().oneOf(categories, 'Invalid Category'),
                })
                categorySchema.isValidSync({ category: rowValues[v] })
                  ? () => {}
                  : errorsList.push({ errorLine: i + 1, errorMessage: 'Category: Value not match business categories', value: rowValues[v] })
              }
              break
            //weight
            case 9:
              const weightSchema = Yup.object().shape({
                weight: Yup.number().min(0.1).required('Weight is required'),
              })
              weightSchema.isValidSync({ weight: rowValues[v] })
                ? () => {}
                : errorsList.push({ errorLine: i + 1, errorMessage: 'Weight: Required - Greater than 0', value: rowValues[v] })
              break
            // length
            case 10:
              const lengthSchema = Yup.object().shape({
                length: Yup.number().min(0.1).required('Length is required'),
              })
              lengthSchema.isValidSync({ length: rowValues[v] })
                ? () => {}
                : errorsList.push({ errorLine: i + 1, errorMessage: 'Length: Required - Greater than 0', value: rowValues[v] })
              break
            // width
            case 11:
              const widthSchema = Yup.object().shape({
                width: Yup.number().min(0.1).required('Width is required'),
              })
              widthSchema.isValidSync({ width: rowValues[v] })
                ? () => {}
                : errorsList.push({ errorLine: i + 1, errorMessage: 'Width: Required - Greater than 0', value: rowValues[v] })
              break
            // height
            case 12:
              const heightSchema = Yup.object().shape({
                height: Yup.number().min(0.1).required('Height is required'),
              })
              heightSchema.isValidSync({ height: rowValues[v] })
                ? () => {}
                : errorsList.push({ errorLine: i + 1, errorMessage: 'Height: Required - Greater than 0', value: rowValues[v] })
              break
            // boxQuantity
            case 13:
              const boxQuantitySchema = Yup.object().shape({
                boxQuantity: Yup.number().min(1).integer().required('Box Quantity is required'),
              })
              boxQuantitySchema.isValidSync({ boxQuantity: rowValues[v] })
                ? () => {}
                : errorsList.push({ errorLine: i + 1, errorMessage: 'Box Quantity: Required - Integer - Greater than 0', value: rowValues[v] })
              break
            // box weight
            case 14:
              const boxWeightSchema = Yup.object().shape({
                boxWeight: Yup.number().min(0.1).required('Box Weight is required'),
              })
              boxWeightSchema.isValidSync({ boxWeight: rowValues[v] })
                ? () => {}
                : errorsList.push({ errorLine: i + 1, errorMessage: 'Box Weight: Required - Greater than 0', value: rowValues[v] })
              break
            // box length
            case 15:
              const boxLengthSchema = Yup.object().shape({
                boxLength: Yup.number().min(0.1).required('Box Length is required'),
              })
              boxLengthSchema.isValidSync({ boxLength: rowValues[v] })
                ? () => {}
                : errorsList.push({ errorLine: i + 1, errorMessage: 'Box Length: Required - Greater than 0', value: rowValues[v] })
              break
            // box width
            case 16:
              const boxWidthSchema = Yup.object().shape({
                boxWidth: Yup.number().min(0.1).required('Box Width is required'),
              })
              boxWidthSchema.isValidSync({ boxWidth: rowValues[v] })
                ? () => {}
                : errorsList.push({ errorLine: i + 1, errorMessage: 'Box Width: Required - Greater than 0', value: rowValues[v] })
              break
            // box height
            case 17:
              const boxHeightSchema = Yup.object().shape({
                boxHeight: Yup.number().min(0.1).required('Box Height is required'),
              })
              boxHeightSchema.isValidSync({ boxHeight: rowValues[v] })
                ? () => {}
                : errorsList.push({ errorLine: i + 1, errorMessage: 'Box Height: Required - Greater than 0', value: rowValues[v] })
              break
            // activestate
            case 18:
              const activestateSchema = Yup.object().shape({
                activestate: Yup.string().oneOf(['TRUE', 'FALSE'], 'Invalid Active State'),
              })
              activestateSchema.isValidSync({ activestate: rowValues[v].toUpperCase() })
                ? () => {}
                : errorsList.push({ errorLine: i + 1, errorMessage: 'Active State: Valid values: TRUE or FALSE', value: rowValues[v] })
              break
            // note
            case 19:
              const noteSchema = Yup.object().shape({
                note: Yup.string(),
              })
              noteSchema.isValidSync({ note: rowValues[v] }) ? () => {} : errorsList.push({ errorLine: i + 1, errorMessage: 'Note', value: rowValues[v] })
              break
            // defaultCost
            case 20:
              if (rowValues[v] != null && rowValues[v] !== '') {
                const defaultCostSchema = Yup.object().shape({
                  defaultCost: Yup.number().min(0),
                })
                defaultCostSchema.isValidSync({ defaultCost: rowValues[v] }) ? () => {} : errorsList.push({ errorLine: i + 1, errorMessage: 'Default Cost', value: rowValues[v] })
              }
              break
            // defaultPrice
            case 21:
              if (rowValues[v] != null && rowValues[v] !== '') {
                const defaultPriceSchema = Yup.object().shape({
                  defaultPrice: Yup.number().min(0),
                })
                defaultPriceSchema.isValidSync({ defaultPrice: rowValues[v] })
                  ? () => {}
                  : errorsList.push({
                      errorLine: i + 1,
                      errorMessage: 'Default Price',
                      value: rowValues[v],
                    })
              }
              break
            // msrp
            case 22:
              if (rowValues[v] != null && rowValues[v] !== '') {
                const msrpSchema = Yup.object().shape({
                  msrp: Yup.number().min(0),
                })
                msrpSchema.isValidSync({ msrp: parseFloat(rowValues[v]) }) ? () => {} : errorsList.push({ errorLine: i + 1, errorMessage: 'MSRP', value: rowValues[v] })
              }
              break
            //map
            case 23:
              if (rowValues[v] != null && rowValues[v] !== '') {
                const mapSchema = Yup.object().shape({
                  map: Yup.number().min(0),
                })
                mapSchema.isValidSync({ map: parseFloat(rowValues[v]) }) ? () => {} : errorsList.push({ errorLine: i + 1, errorMessage: 'MAP', value: rowValues[v] })
              }
              break
            // floor
            case 24:
              if (rowValues[v] != null && rowValues[v] !== '') {
                const floorSchema = Yup.object().shape({
                  floor: Yup.number().min(0),
                })
                floorSchema.isValidSync({ floor: parseFloat(rowValues[v]) }) ? () => {} : errorsList.push({ errorLine: i + 1, errorMessage: 'Floor', value: rowValues[v] })
              }
              break
            // ceiling
            case 25:
              if (rowValues[v] != null && rowValues[v] !== '') {
                const ceilingSchema = Yup.object().shape({
                  ceiling: Yup.number().min(0),
                })
                ceilingSchema.isValidSync({ ceiling: parseFloat(rowValues[v]) }) ? () => {} : errorsList.push({ errorLine: i + 1, errorMessage: 'Ceiling', value: rowValues[v] })
              }
              break
            // sellerCost
            case 26:
              if (rowValues[v] != null && rowValues[v] !== '') {
                const sellerCostSchema = Yup.object().shape({
                  sellerCost: Yup.number().min(0),
                })
                sellerCostSchema.isValidSync({ sellerCost: parseFloat(rowValues[v]) })
                  ? () => {}
                  : errorsList.push({ errorLine: i + 1, errorMessage: 'Seller Cost', value: rowValues[v] })
              }
              break
            // inboundShippingCost
            case 27:
              if (rowValues[v] != null && rowValues[v] !== '') {
                const inboundShippingCostSchema = Yup.object().shape({
                  inboundShippingCost: Yup.number().min(0),
                })
                inboundShippingCostSchema.isValidSync({ inboundShippingCost: parseFloat(rowValues[v]) })
                  ? () => {}
                  : errorsList.push({ errorLine: i + 1, errorMessage: 'Inbound Shipping Cost', value: rowValues[v] })
              }
              break
            // otherCosts
            case 28:
              if (rowValues[v] != null && rowValues[v] !== '') {
                const otherCostsSchema = Yup.object().shape({
                  otherCosts: Yup.number().min(0),
                })
                otherCostsSchema.isValidSync({ otherCosts: parseFloat(rowValues[v]) })
                  ? () => {}
                  : errorsList.push({ errorLine: i + 1, errorMessage: 'Other Costs', value: rowValues[v] })
              }
              break
            // productionTime
            case 29:
              if (rowValues[v] != null && rowValues[v] !== '') {
                const productionTimeSchema = Yup.object().shape({
                  productionTime: Yup.number().min(0).integer(),
                })
                productionTimeSchema.isValidSync({ productionTime: parseInt(rowValues[v]) })
                  ? () => {}
                  : errorsList.push({ errorLine: i + 1, errorMessage: 'Production Time', value: rowValues[v] })
              }
              break
            // transitTime
            case 30:
              if (rowValues[v] != null && rowValues[v] !== '') {
                const transitTimeSchema = Yup.object().shape({
                  transitTime: Yup.number().min(0).integer(),
                })
                transitTimeSchema.isValidSync({ transitTime: parseInt(rowValues[v]) })
                  ? () => {}
                  : errorsList.push({ errorLine: i + 1, errorMessage: 'Transit Time', value: rowValues[v] })
              }
              break
            // shippingToFBACost
            case 31:
              if (rowValues[v] != null && rowValues[v] !== '') {
                const shippingToFBACostSchema = Yup.object().shape({
                  shippingToFBACost: Yup.number().min(0),
                })
                shippingToFBACostSchema.isValidSync({ shippingToFBACost: parseFloat(rowValues[v]) })
                  ? () => {}
                  : errorsList.push({ errorLine: i + 1, errorMessage: 'Shipping To FBA Cost', value: rowValues[v] })
              }
              break
            // buffer
            case 32:
              if (rowValues[v] != null && rowValues[v] !== '') {
                const bufferSchema = Yup.object().shape({
                  buffer: Yup.number().min(0),
                })
                bufferSchema.isValidSync({ buffer: parseInt(rowValues[v]) }) ? () => {} : errorsList.push({ errorLine: i + 1, errorMessage: 'Buffer', value: rowValues[v] })
              }
              break
            // itemcondition
            case 33:
              const itemconditionSchema = Yup.object().shape({
                itemcondition: Yup.string().oneOf(['New', 'Used'], 'Invalid Item Condition'),
              })
              itemconditionSchema.isValidSync({ itemcondition: rowValues[v] })
                ? () => {}
                : errorsList.push({ errorLine: i + 1, errorMessage: 'Item Condition Valid values: New or Used', value: rowValues[v] })
              break
            // image
            case 34:
              if (rowValues[v] != null && rowValues[v] !== '') {
                const imageSchema = Yup.object().shape({
                  image: Yup.string().url(),
                })
                imageSchema.isValidSync({ image: rowValues[v] }) ? () => {} : errorsList.push({ errorLine: i + 1, errorMessage: 'Image: invalid URL', value: rowValues[v] })
              }
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
          const response = await axios.post(`api/productDetails/uploadProductsTemplate?region=${state.currentRegion}&businessId=${state.user.businessId}`, {
            productsInfo: results.data,
          })
          if (!response.data.error) {
            mutate(`/api/getBusinessInventory?region=${state.currentRegion}&businessId=${state.user.businessId}`)
            setShowErrorResponse(false)
            setErrorResponse([])
            toast.success('All products where added!')
            setimportModalDetails((prev: any) => {
              return { ...prev, show: false }
            })
          } else {
            setErrorResponse(response.data.msg || [])
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
      isOpen={importModalDetails.show}
      toggle={() => {
        setimportModalDetails((prev: any) => {
          return { ...prev, show: false }
        })
      }}>
      <ModalHeader
        toggle={() => {
          setimportModalDetails((prev: any) => {
            return { ...prev, show: false }
          })
        }}
        className='modal-title'
        id='myModalLabel'>
        <p className='fs-4'>Import File Bulk Add/Update Products Details</p>
      </ModalHeader>
      <ModalBody>
        <Row>
          <p className='fs-6 fw-normal m-0 mb-1'>
            You can <span className='fw-bold'>Update</span> existing products in bulk by uploading a CSV file using the{' '}
            <span className='text-info'>Existing Products Template</span> file.
          </p>
          <p className='fs-6 fw-normal m-0 mb-3'>
            You can <span className='fw-bold'>Add</span> new products in bulk by uploading a CSV file using the <span className='text-info'>Empty Template</span> file.
          </p>
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
                    <p className='fs-5'>Upload Products Details. Drop Only CSV files here or click to upload.</p>
                  </div>
                </div>
              )}
            </Dropzone>
          </Col>
          <Col md={6}>
            <span className='text-danger fw-semibold'>Warning:</span>
            <ul>
              <li>Review file before uploading!</li>
              <li>Do not change the order of the columns.</li>
              <li>If you want to assign Brand, Supplier or Category to products, add them before exporting any template in the account settings tab.</li>
            </ul>
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
        {showErrorLines && (
          <div style={{ overflowY: 'scroll', height: '40vh' }} className='my-3'>
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
            <Button type='button' color='success' className='btn' onClick={handleUploadProducts}>
              {loading ? <Spinner /> : 'Upload File'}
            </Button>
          </div>
        </Col>
      </ModalBody>
    </Modal>
  )
}

export default ImportProductsFileModal
