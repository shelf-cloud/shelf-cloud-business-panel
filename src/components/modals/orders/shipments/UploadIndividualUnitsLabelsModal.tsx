import { useContext, useState } from 'react'

import UploadFileDropzone from '@components/ui/UploadFileDropzone'
import AppContext from '@context/AppContext'
import { storage } from '@firebase'
import { Shipment } from '@typesTs/shipments/shipments'
import axios from 'axios'
import { ref, uploadBytes } from 'firebase/storage'
import moment from 'moment'
import { useSession } from 'next-auth/react'
import { toast } from 'react-toastify'
import { Button, Card, Col, Modal, ModalBody, ModalHeader, Row, Spinner } from 'reactstrap'

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
    <Modal
      fade={false}
      size='lg'
      id='myModal'
      isOpen={state.showUploadIndividualUnitsLabelsModal}
      toggle={() => {
        setUploadIndividualUnitsLabelsModal(!state.showUploadIndividualUnitsLabelsModal)
      }}>
      <ModalHeader
        toggle={() => {
          setUploadIndividualUnitsLabelsModal(!state.showUploadIndividualUnitsLabelsModal)
        }}
        className='modal-title'
        id='myModalLabel'>
        Upload Labels for Individual Units Wholesale Order
      </ModalHeader>
      <ModalBody>
        <Col>
          <Row>
            <Col>
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
              {errorFile && <p className='text-danger m-0'>You must Upload Labels to ship order.</p>}
            </Col>
            <Col>
              {data.numberPallets > 0 && (
                // <Dropzone
                //   multiple={false}
                //   onDrop={(acceptedFiles) => {
                //     handlePalletAcceptedFiles(acceptedFiles)
                //   }}>
                //   {({ getRootProps }) => (
                //     <div className='dropzone dz-clickable cursor-pointer'>
                //       <div className='dz-message needsclick' {...getRootProps()}>
                //         <div className='mb-3'>
                //           <i className='display-4 text-muted ri-upload-cloud-2-fill' />
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
                        <Row className='align-items-center'>
                          <Col className='d-flex justify-content-between align-items-center'>
                            <div>
                              <p className='text-muted font-weight-bold m-0'>{f.name}</p>
                              <p className='mb-0'>
                                <strong>{f.formattedSize}</strong>
                              </p>
                            </div>
                            <div>
                              <Button color='light' className='btn-icon' onClick={() => setPalletSelectedFiles([])}>
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
              {errorPalletFile && <p className='text-danger m-0'>You must Upload the Pallet Labels to create order.</p>}
            </Col>
          </Row>
        </Col>
        <Col md={12}>
          <div className='text-end'>
            <Button
              type='submit'
              color='light'
              className='btn me-4'
              onClick={() => {
                setUploadIndividualUnitsLabelsModal(!state.showUploadIndividualUnitsLabelsModal)
              }}>
              Close
            </Button>
            <Button type='submit' color='success' className='btn' onClick={hanldeUploadFiles}>
              {loading ? <Spinner color='#fff' /> : 'Upload Labels'}
            </Button>
          </div>
        </Col>
      </ModalBody>
    </Modal>
  )
}

export default UploadIndividualUnitsLabelsModal
