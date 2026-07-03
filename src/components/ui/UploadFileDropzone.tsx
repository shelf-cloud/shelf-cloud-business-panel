import Dropzone, { Accept } from 'react-dropzone'
import { toast } from '@/lib/toast'

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
        <div className='dropzone dz-clickable cursor-pointer flex flex-col justify-center gap-1' {...getRootProps()}>
          <input {...getInputProps()} />
          <div className='px-4 dz-message needsclick'>
            <div className='mb-2'>
              <i className='display-6 text-primary ri-upload-2-line' />
            </div>
            <p className='m-0 mb-2 text-[11.2px]'>Upload 1 file</p>
            <p className='w-3/4 mx-auto text-[11.2px]'>{description}</p>
          </div>
        </div>
      )}
    </Dropzone>
  )
}

export default UploadFileDropzone
