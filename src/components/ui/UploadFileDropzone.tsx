import React from 'react'
import Dropzone, { Accept } from 'react-dropzone'
import { toast } from 'react-toastify'

type Props = {
  accptedFiles: Accept | undefined
  handleAcceptedFiles: (acceptedFiles: File[]) => void
  description?: string
}

function UploadFileDropzone({ accptedFiles, handleAcceptedFiles, description }: Props) {
  return (
    <Dropzone
      accept={accptedFiles}
      multiple={false}
      onDrop={(acceptedFiles) => {
        handleAcceptedFiles(acceptedFiles)
      }}
      onDropRejected={(error) => {
        toast.error(error[0].errors[0].message)
      }}>
      {({ getRootProps, getInputProps }) => (
        <div className='dropzone dz-clickable cursor-pointer' {...getRootProps()}>
          <input {...getInputProps()} />
          <div className='px-3 dz-message needsclick'>
            <div className='mb-3'>
              <i className='display-5 text-primary ri-upload-cloud-2-fill' />
            </div>
            <p className='fs-6'>{description}</p>
          </div>
        </div>
      )}
    </Dropzone>
  )
}

export default UploadFileDropzone
