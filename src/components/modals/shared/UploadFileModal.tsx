 
/* eslint-disable @next/next/no-img-element */
import { useContext, useState } from 'react'

import SimpleSelect, { SelectOptionType, SelectSingleValueType } from '@components/Common/SimpleSelect'
import UploadFileDropzone from '@components/ui/UploadFileDropzone'
import AppContext from '@context/AppContext'
import { NoImageAdress } from '@lib/assetsConstants'
import { Accept } from 'react-dropzone/.'
import { toast } from 'react-toastify'
import { Button, Card, Col, Modal, ModalBody, ModalFooter, ModalHeader, Row, Spinner } from 'reactstrap'

export type UploadResponse = { error: boolean; message: string; url: string }

export type HandleSubmitParams = {
  region: string
  businessId: string
  selectedFiles: any[]
  marketplace?: string
}

type Props = {
  isOpen: boolean
  headerText: string
  primaryText: string
  primaryTextSub?: string
  descriptionText: string
  uploadZoneText: string
  confirmText: string
  loadingText: string
  isDeleteAction?: boolean
  select?: SelectSingleValueType
  selectedFiles: File[]
  acceptedFiles: Accept
  handleSelect?: (selected: SelectSingleValueType) => void
  handleAcceptedFiles?: (acceptedFiles: File[]) => void
  handleClearFiles?: () => void
  handleSubmit: ({ region, businessId, selectedFiles, marketplace }: HandleSubmitParams) => Promise<{ error: boolean }>
  handleClose: () => void
  showSelect?: boolean
  options?: SelectOptionType[]
}

const UploadFileModal = ({
  isOpen,
  headerText,
  primaryText,
  primaryTextSub,
  descriptionText,
  uploadZoneText,
  confirmText,
  loadingText,
  isDeleteAction = false,
  select = { value: '', label: 'Select Marketplace' } as SelectSingleValueType,
  selectedFiles = [],
  acceptedFiles,
  handleSelect,
  handleAcceptedFiles = () => {},
  handleClearFiles = () => {},
  handleSubmit,
  handleClose,
  showSelect = false,
  options,
}: Props) => {
  const { state }: any = useContext(AppContext)
  const [isLoading, setisLoading] = useState(false)

  const handleConfirmAction = async () => {
    if (showSelect) {
      if (!select || !select.value || selectedFiles.length === 0) {
        toast.error('Please select a file and marketplace to upload')
        return
      }
    }

    setisLoading(true)
    await handleSubmit({
      region: state.currentRegion,
      businessId: state.user.businessId,
      selectedFiles,
      marketplace: showSelect && select ? select.value.toString() : 'No Specific Marketplace',
    }).then(() => {
      handleClose()
      setisLoading(false)
    })
  }

  return (
    <Modal fade={false} size='md' id='confirmDeleteReceiving' isOpen={isOpen} toggle={handleClose}>
      <ModalHeader toggle={handleClose} className='modal-title' id='myModalLabel'>
        {headerText}
      </ModalHeader>
      <ModalBody>
        <Row>
          <p className='mb-2 fs-6 fw-semibold'>
            {primaryText} {primaryTextSub && <span className='text-primary'>{primaryTextSub}</span>}
          </p>
          {descriptionText && <p className='mb-1 fs-7 text-muted'>{descriptionText}</p>}
          <div>
            <UploadFileDropzone accptedFiles={acceptedFiles} handleAcceptedFiles={handleAcceptedFiles} description={uploadZoneText} />
          </div>
          {showSelect && handleSelect && options ? (
            <div className='mb-2 mt-3'>
              <p className='fs-7 fw-normal mb-2'>Select Marketplace:</p>
              <SimpleSelect selected={select} handleSelect={(option) => handleSelect(option)} options={options} customStyle='sm' />
            </div>
          ) : null}
          <div className='list-unstyled mb-0' id='file-previews'>
            <p className='fs-7 fw-normal mb-2'>Files:</p>
            {selectedFiles.map((f: any, i) => {
              return (
                <Card className='mt-1 mb-0 py-2 shadow-none border dz-processing dz-image-preview dz-success dz-complete' key={i + '-file'}>
                  <div className='p-2'>
                    <Row className='align-items-center'>
                      <Col className='d-flex justify-content-evenly align-items-center gap-3'>
                        <div
                          style={{
                            width: '60px',
                            height: '60px',
                            margin: '0px',
                            position: 'relative',
                          }}>
                          <img
                            loading='lazy'
                            src={f.preview}
                            onError={(e) => (e.currentTarget.src = NoImageAdress)}
                            alt='File preview'
                            style={{ objectFit: 'contain', objectPosition: 'center', width: '100%', height: '100%' }}
                            onLoad={() => {
                              URL.revokeObjectURL(f.preview)
                            }}
                          />
                        </div>
                        <div className='flex-grow-1'>
                          <p className='text-muted font-weight-bold m-0'>{f.name}</p>
                          <p className='mb-0'>
                            <strong>{f.formattedSize}</strong>
                          </p>
                        </div>
                        <div>
                          <Button color='light' className='btn-icon' onClick={() => handleClearFiles()}>
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
        </Row>
      </ModalBody>
      <ModalFooter>
        <div className='w-100 d-flex flex-row gap-2 justify-content-between align-items-center'>
          <div></div>
          <div className='d-flex flex-row gap-2 justify-content-end'>
            <Button disabled={isLoading} type='button' color='light' className='fs-7' onClick={handleClose}>
              Cancel
            </Button>
            <Button
              disabled={isLoading || selectedFiles.length === 0 || (showSelect && select ? !select.value : false)}
              type='button'
              color={isDeleteAction ? 'danger' : 'success'}
              className='fs-7'
              onClick={handleConfirmAction}>
              {isLoading ? (
                <span>
                  <Spinner color='light' size={'sm'} /> {loadingText}
                </span>
              ) : (
                confirmText
              )}
            </Button>
          </div>
        </div>
      </ModalFooter>
    </Modal>
  )
}

export default UploadFileModal
