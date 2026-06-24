import type { Dispatch, SetStateAction } from 'react'

import { ChevronLeftIcon, ChevronRightIcon, DownloadIcon } from 'lucide-react'

import { Button } from '../shadcn/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../shadcn/ui/dialog'

export type SelectedUnsellableImage = {
  images: string[]
  index: number
}

type Props = {
  selectedImage: SelectedUnsellableImage | null
  setSelectedImage: Dispatch<SetStateAction<SelectedUnsellableImage | null>>
}

const ShowBiggerImageDialog = ({ selectedImage, setSelectedImage }: Props) => {
  const selectedImageUrl = selectedImage?.images[selectedImage.index] ?? ''
  const selectedImageAlt = selectedImage ? `Unsellable image ${selectedImage.index + 1}` : ''
  const canNavigateSelectedImage = (selectedImage?.images.length ?? 0) > 1

  const handleSelectedImageNavigate = (direction: -1 | 1) => {
    setSelectedImage((current) => {
      if (!current || current.images.length <= 0) {
        return current
      }

      return {
        ...current,
        index: (current.index + direction + current.images.length) % current.images.length,
      }
    })
  }

  return (
    <Dialog open={Boolean(selectedImage)} onOpenChange={(isOpen) => !isOpen && setSelectedImage(null)}>
      <DialogContent className='tw:max-w-5xl'>
        <DialogHeader>
          <DialogTitle>Unsellable Image</DialogTitle>
          <DialogDescription>{selectedImageAlt}</DialogDescription>
        </DialogHeader>
        <div className='tw:bg-muted tw:relative tw:flex tw:max-h-[70vh] tw:items-center tw:justify-center tw:overflow-hidden tw:rounded-md tw:border'>
          {selectedImageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={selectedImageUrl} alt={selectedImageAlt} className='tw:max-h-[70vh] tw:w-full tw:object-contain' />
          ) : null}
          {canNavigateSelectedImage ? (
            <div className='tw:pointer-events-none tw:absolute tw:inset-0 tw:z-10 tw:flex tw:items-center tw:justify-between tw:px-3'>
              <Button
                type='button'
                variant='outline'
                size='icon'
                className='tw:pointer-events-auto tw:size-7 tw:rounded-full! tw:shadow-md'
                onClick={() => handleSelectedImageNavigate(-1)}
                aria-label='Previous image'>
                <ChevronLeftIcon className='tw:size-5' />
              </Button>
              <Button
                type='button'
                variant='outline'
                size='icon'
                className='tw:pointer-events-auto tw:size-7 tw:rounded-full! tw:shadow-md'
                onClick={() => handleSelectedImageNavigate(1)}
                aria-label='Next image'>
                <ChevronRightIcon className='tw:size-5' />
              </Button>
            </div>
          ) : null}
        </div>
        <DialogFooter>
          {selectedImageUrl ? (
            <Button asChild type='button'>
              <a href={selectedImageUrl} download target='_blank' rel='noopener noreferrer'>
                <DownloadIcon className='tw:size-4' />
                Download
              </a>
            </Button>
          ) : null}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default ShowBiggerImageDialog
