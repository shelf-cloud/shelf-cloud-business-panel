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
      <DialogContent className='max-w-5xl'>
        <DialogHeader>
          <DialogTitle>Unsellable Image</DialogTitle>
          <DialogDescription>{selectedImageAlt}</DialogDescription>
        </DialogHeader>
        <div className='bg-muted relative flex max-h-[70vh] items-center justify-center overflow-hidden rounded-md border'>
          {selectedImageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={selectedImageUrl} alt={selectedImageAlt} className='max-h-[70vh] w-full object-contain' />
          ) : null}
          {canNavigateSelectedImage ? (
            <div className='pointer-events-none absolute inset-0 z-10 flex items-center justify-between px-3'>
              <Button
                type='button'
                variant='outline'
                size='icon'
                className='pointer-events-auto size-7 rounded-full! shadow-md'
                onClick={() => handleSelectedImageNavigate(-1)}
                aria-label='Previous image'>
                <ChevronLeftIcon className='size-5' />
              </Button>
              <Button
                type='button'
                variant='outline'
                size='icon'
                className='pointer-events-auto size-7 rounded-full! shadow-md'
                onClick={() => handleSelectedImageNavigate(1)}
                aria-label='Next image'>
                <ChevronRightIcon className='size-5' />
              </Button>
            </div>
          ) : null}
        </div>
        <DialogFooter>
          {selectedImageUrl ? (
            <Button asChild type='button'>
              <a href={selectedImageUrl} download target='_blank' rel='noopener noreferrer'>
                <DownloadIcon className='size-4' />
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
