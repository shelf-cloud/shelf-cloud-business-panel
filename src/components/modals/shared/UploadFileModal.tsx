/* eslint-disable @next/next/no-img-element */
import { useContext, useState } from 'react'

import SimpleSelect, { SelectOptionType, SelectSingleValueType } from '@components/Common/SimpleSelect'
import UploadFileDropzone from '@components/ui/UploadFileDropzone'
import AppContext from '@context/AppContext'
import { NoImageAdress } from '@lib/assetsConstants'
import { Accept } from 'react-dropzone/.'
import { toast } from '@/lib/toast'
import { Button } from '@shadcn/ui/button'
import { Card } from '@shadcn/ui/card'
import { Dialog, DialogContent, DialogFooter, DialogHeader } from '@shadcn/ui/dialog'
import { Spinner } from '@shadcn/ui/spinner'

export type UploadResponse = { error: boolean; message: string; url: string }

export type FileWithPreview = File & { preview: string; formattedSize: string }

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
    <Dialog open={!!isOpen} onOpenChange={(open) => { if (!open) handleClose() }}>
      <DialogContent id='confirmDeleteReceiving' aria-describedby={undefined} className='max-h-[90vh] overflow-y-auto sm:!max-w-lg'>
      <DialogHeader className='pr-6' id='myModalLabel'>
        {headerText}
      </DialogHeader>
      <div>
        <div className='flex flex-wrap -mx-3'>
          <p className='mb-2 text-[13px] font-semibold'>
            {primaryText} {primaryTextSub && <span className='text-primary'>{primaryTextSub}</span>}
          </p>
          {descriptionText && <p className='mb-1 text-[11.2px] text-muted-foreground'>{descriptionText}</p>}
          <div>
            <UploadFileDropzone accptedFiles={acceptedFiles} handleAcceptedFiles={handleAcceptedFiles} description={uploadZoneText} />
          </div>
          {showSelect && handleSelect && options ? (
            <div className='mb-2 mt-3'>
              <p className='text-[11.2px] font-normal mb-2'>Select Marketplace:</p>
              <SimpleSelect selected={select} handleSelect={(option) => handleSelect(option)} options={options} customStyle='sm' />
            </div>
          ) : null}
          <div className='list-unstyled mb-0' id='file-previews'>
            <p className='text-[11.2px] font-normal mb-2'>Files:</p>
            {selectedFiles.map((f: any, i) => {
              return (
                <Card className='mt-1 mb-0 py-2 shadow-none border dz-processing dz-image-preview dz-success dz-complete' key={i + '-file'}>
                  <div className='p-2'>
                    <div className='flex flex-wrap -mx-3 items-center'>
                      <div className='px-3 flex justify-evenly items-center gap-4'>
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
                        <div className='flex-grow'>
                          <p className='text-muted-foreground font-bold m-0'>{f.name}</p>
                          <p className='mb-0'>
                            <strong>{f.formattedSize}</strong>
                          </p>
                        </div>
                        <div>
                          <Button variant='light' className='btn-icon' onClick={() => handleClearFiles()}>
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
      <DialogFooter className='items-center'>
        <div className='w-full flex flex-row gap-2 justify-between items-center'>
          <div></div>
          <div className='flex flex-row gap-2 justify-end'>
            <Button disabled={isLoading} type='button' variant='light' className='text-[11.2px]' onClick={handleClose}>
              Cancel
            </Button>
            <Button
              disabled={isLoading || selectedFiles.length === 0 || (showSelect && select ? !select.value : false)}
              type='button'
              variant={isDeleteAction ? 'destructive' : 'success'}
              className='text-[11.2px]'
              onClick={handleConfirmAction}>
              {isLoading ? (
                <span>
                  <Spinner className='text-white' /> {loadingText}
                </span>
              ) : (
                confirmText
              )}
            </Button>
          </div>
        </div>
      </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default UploadFileModal
