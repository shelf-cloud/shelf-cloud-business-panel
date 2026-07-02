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
        <div className='dropzone dz-clickable tw:cursor-pointer tw:flex tw:flex-col tw:justify-center tw:gap-1' {...getRootProps()}>
          <input {...getInputProps()} />
          <div className='tw:px-4 dz-message needsclick'>
            <div className='tw:mb-2'>
              <i className='display-6 text-primary ri-upload-2-line' />
            </div>
            <p className='tw:m-0 tw:mb-2 tw:text-[11.2px]'>Upload 1 file</p>
            <p className='tw:w-3/4 tw:mx-auto tw:text-[11.2px]'>{description}</p>
          </div>
        </div>
      )}
    </Dropzone>
  )
}

export default UploadFileDropzone
