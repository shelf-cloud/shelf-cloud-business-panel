 
 
import router from 'next/router'
import { useContext, useState } from 'react'

import UploadFileDropzone from '@components/ui/UploadFileDropzone'
import AppContext from '@context/AppContext'
import axios from 'axios'
import Papa from 'papaparse'
import { toast } from 'react-toastify'
import { Button } from '@shadcn/ui/button'
import { Card } from '@shadcn/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@shadcn/ui/dialog'
import { Spinner } from '@shadcn/ui/spinner'

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
              ;/[(http(s)?):\/\/(www\.)?a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/.test(rowValues[v])
                ? () => {}
                : errorsList.push({ errorLine: i, errorMessage: 'Value format error', value: rowValues[v] })
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
    <Dialog
      open={!!state.showUploadProductsModal}
      onOpenChange={(open) => {
        if (!open) setUploadProductsModal(!state.showUploadProductsModal)
      }}>
      <DialogContent aria-describedby={undefined} className='max-h-[90vh] overflow-y-auto sm:!max-w-3xl' id='myModal'>
        <DialogHeader className='pr-6 modal-title' id='myModalLabel'>
          <DialogTitle>
            <p className='text-[22.75px]'>Import Products</p>
          </DialogTitle>
        </DialogHeader>
        <div>
        <p className='text-[16.25px] font-normal'>
          You can import products in bulk by uploading a CSV file using the{' '}
          <a className='!text-primary' href={'https://docs.google.com/spreadsheets/d/19H7hs8kS6D5cysi3QmJTH0Hfpmjw7VuG/template/preview'} target='blank' rel='noopener noreferrer'>
            template
          </a>{' '}
          file.
        </p>
        <div className='flex flex-wrap -mx-3'>
          <div className='px-3 md:w-6/12'>
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
            <UploadFileDropzone
              accptedFiles={{ 'text/csv': ['.csv'] }}
              handleAcceptedFiles={handleAcceptedFiles}
              description={`Upload Products Info. Drop Only CSV files here or click to upload.`}
            />
          </div>
          <div className='px-3 md:w-6/12'>
            <div className='list-unstyled mb-0' id='file-previews'>
              {selectedFiles.map((f: any, i) => {
                return (
                  <Card className='mt-1 mb-0 shadow-none border dz-processing dz-image-preview dz-success dz-complete' key={i + '-file'}>
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
          </div>
        </div>
        {errorFile && <p className='text-danger m-0'>You must Upload a CSV file to upload products.</p>}
        {showErrorLines &&
          errorLines.map((error: any, index: number) => (
            <p key={`ErrorLine${index}`} className='text-danger m-0'>{`Error in Line: ${error.errorLine} Value: ${error.value} Error: ${error.errorMessage}`}</p>
          ))}
        {showerrorResponse && errorResponse.map((error: any, index: number) => <p key={`ErrorLine${index}`} className='text-danger m-0'>{`Error: ${error}`}</p>)}
        <div className='px-3 w-full'>
          <div className='text-right'>
            <Button type='button' variant='success' className='btn' onClick={handleUploadProducts}>
              {loading ? <Spinner /> : 'Upload File'}
            </Button>
          </div>
        </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default UploadProductsModal
