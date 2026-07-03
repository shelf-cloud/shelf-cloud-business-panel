import { useContext, useState } from 'react'

import UploadFileDropzone from '@components/ui/UploadFileDropzone'
import AppContext from '@context/AppContext'
import { storage } from '@firebase'
import { Shipment } from '@typesTs/shipments/shipments'
import axios from 'axios'
import { ref, uploadBytes } from 'firebase/storage'
import moment from 'moment'
import { useSession } from 'next-auth/react'
import { toast } from '@/lib/toast'
import { Button } from '@shadcn/ui/button'
import { Card } from '@shadcn/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@shadcn/ui/dialog'
import { Spinner } from '@shadcn/ui/spinner'

type Props = {
  data: Shipment
  mutateShipment?: () => void
}

const UploadIndividualUnitsLabelsModal = ({ data, mutateShipment }: Props) => {
  const { data: session } = useSession()
  const { state, setUploadIndividualUnitsLabelsModal }: any = useContext(AppContext)
  const [selectedFiles, setselectedFiles] = useState([])
  const [palletSelectedFiles, setPalletSelectedFiles] = useState([])
  const [errorFile, setErrorFile] = useState(false)
  const [errorPalletFile, setErrorPalletFile] = useState(false)
  const [loading, setloading] = useState(false)

  const hanldeUploadFiles = async () => {
    setloading(true)

    if (!data.isThird && selectedFiles.length == 0) {
      setErrorFile(true)
      setloading(false)
      return
    }
    setErrorFile(false)

    if (data.numberPallets > 0 && palletSelectedFiles.length == 0) {
      setErrorPalletFile(true)
      setloading(false)
      return
    }
    setErrorPalletFile(false)

    const docTime = moment().format('DD-MM-YYYY-HH-mm-ss-a')

    if (!data.isThird) {
      const storageRef = ref(storage, `shelf-cloud/etiquetas-fba-${session?.user?.name}-${state.currentRegion}-${docTime}.pdf`)
      await uploadBytes(storageRef, selectedFiles[0]).then((_snapshot) => {
        toast.success('Successfully uploaded Shipping labels!')
      })

      if (data.numberPallets > 0) {
        const storageRef = ref(storage, `shelf-cloud/pallet-etiquetas-fba-${session?.user?.name}-${state.currentRegion}-${docTime}.pdf`)
        await uploadBytes(storageRef, palletSelectedFiles[0]).then((_snapshot) => {
          toast.success('Successfully uploaded Pallet labels!')
        })
      }
    }

    const response = await axios.post(`api/uploadIndividualUnitsLabelsModal?region=${state.currentRegion}&businessId=${state.user.businessId}`, {
      orderId: data.id,
      labelsName: !data.isThird ? `etiquetas-fba-${session?.user?.name}-${state.currentRegion}-${docTime}.pdf` : '',
      palletLabels: !data.isThird && data.numberPallets > 0 ? `pallet-etiquetas-fba-${session?.user?.name}-${state.currentRegion}-${docTime}.pdf` : '',
    })

    if (!response.data.error) {
      setUploadIndividualUnitsLabelsModal(false)
      toast.success(response.data.msg)
      mutateShipment && mutateShipment()
    } else {
      toast.error(response.data.msg)
    }

    setloading(false)
  }

  function handleAcceptedFiles(files: any) {
    files.map((file: any) =>
      Object.assign(file, {
        preview: URL.createObjectURL(file),
        formattedSize: formatBytes(file.size),
      })
    )
    setselectedFiles(files)
  }

  function handlePalletAcceptedFiles(files: any) {
    files.map((file: any) =>
      Object.assign(file, {
        preview: URL.createObjectURL(file),
        formattedSize: formatBytes(file.size),
      })
    )
    setPalletSelectedFiles(files)
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
      open={!!state.showUploadIndividualUnitsLabelsModal}
      onOpenChange={(open) => {
        if (!open) setUploadIndividualUnitsLabelsModal(!state.showUploadIndividualUnitsLabelsModal)
      }}>
      <DialogContent aria-describedby={undefined} className='max-h-[90vh] overflow-y-auto sm:!max-w-3xl' id='myModal'>
        <DialogHeader className='pr-6' id='myModalLabel'>
          <DialogTitle>Upload Labels for Individual Units Wholesale Order</DialogTitle>
        </DialogHeader>
        <div className='px-3 flex-1 basis-0'>
          <div className='flex flex-wrap -mx-3'>
            <div className='px-3 flex-1 basis-0'>
              {/* <Dropzone
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
                      <h4>Upload Shipping Labels. Drop Only PDF files here or click to upload.</h4>
                    </div>
                  </div>
                )}
              </Dropzone> */}
              <UploadFileDropzone
                accptedFiles={undefined}
                handleAcceptedFiles={handleAcceptedFiles}
                description={`Upload Shipping Labels. Drop Only PDF files here or click to upload.`}
              />
              <div className='list-unstyled mb-0' id='file-previews'>
                {selectedFiles.map((f: any, i) => {
                  return (
                    <Card className='mt-1 mb-0 shadow-none border dz-processing dz-image-preview dz-success dz-complete' key={i + '-file'}>
                      <div className='p-2'>
                        <div className='flex flex-wrap -mx-3 items-center'>
                          <div className='px-3 flex-1 basis-0 flex justify-between items-center'>
                            <div>
                              <p className='text-muted-foreground font-bold m-0'>{f.name}</p>
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
              {errorFile && <p className='text-danger m-0'>You must Upload Labels to ship order.</p>}
            </div>
            <div className='px-3 flex-1 basis-0'>
              {data.numberPallets > 0 && (
                // <Dropzone
                //   multiple={false}
                //   onDrop={(acceptedFiles) => {
                //     handlePalletAcceptedFiles(acceptedFiles)
                //   }}>
                //   {({ getRootProps }) => (
                //     <div className='dropzone dz-clickable cursor-pointer'>
                //       <div className='dz-message needsclick' {...getRootProps()}>
                //         <div className='mb-4'>
                //           <i className='display-4 text-muted-foreground ri-upload-cloud-2-fill' />
                //         </div>
                //         <h4>Upload Pallet Labels. Drop Only PDF files here or click to upload.</h4>
                //       </div>
                //     </div>
                //   )}
                // </Dropzone>
                <UploadFileDropzone
                  accptedFiles={undefined}
                  handleAcceptedFiles={handlePalletAcceptedFiles}
                  description={`Upload Pallet Labels. Drop Only PDF files here or click to upload.`}
                />
              )}
              <div className='list-unstyled mb-0' id='file-previews'>
                {palletSelectedFiles.map((f: any, i) => {
                  return (
                    <Card className='mt-1 mb-0 shadow-none border dz-processing dz-image-preview dz-success dz-complete' key={i + '-file'}>
                      <div className='p-2'>
                        <div className='flex flex-wrap -mx-3 items-center'>
                          <div className='px-3 flex-1 basis-0 flex justify-between items-center'>
                            <div>
                              <p className='text-muted-foreground font-bold m-0'>{f.name}</p>
                              <p className='mb-0'>
                                <strong>{f.formattedSize}</strong>
                              </p>
                            </div>
                            <div>
                              <Button variant='light' className='btn-icon' onClick={() => setPalletSelectedFiles([])}>
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
              {errorPalletFile && <p className='text-danger m-0'>You must Upload the Pallet Labels to create order.</p>}
            </div>
          </div>
        </div>
        <div className='px-3 md:w-full'>
          <div className='text-right'>
            <Button
              type='submit'
              variant='light'
              className='mr-4'
              onClick={() => {
                setUploadIndividualUnitsLabelsModal(!state.showUploadIndividualUnitsLabelsModal)
              }}>
              Close
            </Button>
            <Button type='submit' variant='success' onClick={hanldeUploadFiles}>
              {loading ? <Spinner className='text-white' /> : 'Upload Labels'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default UploadIndividualUnitsLabelsModal
