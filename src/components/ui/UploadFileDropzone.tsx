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
        <div className='dropzone dz-clickable cursor-pointer d-flex flex-column justify-content-center gap-1' {...getRootProps()}>
          <input {...getInputProps()} />
          <div className='px-3 dz-message needsclick'>
            <div className='mb-2'>
              <i className='display-6 text-primary ri-upload-2-line' />
            </div>
            <p className='m-0 mb-2 fs-7'>Upload 1 file</p>
            <p className='w-75 mx-auto fs-7'>{description}</p>
          </div>
        </div>
      )}
    </Dropzone>
  )
}

export default UploadFileDropzone
