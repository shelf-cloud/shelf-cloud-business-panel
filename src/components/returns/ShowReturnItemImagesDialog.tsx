import { OrderItem } from '@/types/returns/returns'

import { Button } from '../shadcn/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../shadcn/ui/dialog'
import type { SelectedUnsellableImage } from './ShowBiggerImageDialog'

type Props = {
  imagesDialogItem: OrderItem | null
  imagesDialogImages: string[]
  handleImagesDialogOpenChange: (open: boolean) => void
  setSelectedImage: (image: SelectedUnsellableImage | null) => void
}

export const MAX_UNSELLABLE_IMAGES = 5

const ShowReturnItemImagesDialog = ({ imagesDialogItem, imagesDialogImages, handleImagesDialogOpenChange, setSelectedImage }: Props) => {
  return (
    <Dialog open={Boolean(imagesDialogItem)} onOpenChange={handleImagesDialogOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Unsellable Images</DialogTitle>
          <DialogDescription>
            <p className='tw:mb-0!'>{imagesDialogItem?.sku}</p>
            <p className='tw:mb-0!'>{imagesDialogItem?.title}</p>
          </DialogDescription>
        </DialogHeader>

        {imagesDialogImages.length ? (
          <div className='tw:flex tw:flex-row tw:justify-start tw:gap-2 tw:items-center'>
            {imagesDialogImages.map((image, index) => {
              const alt = `Unsellable image ${index + 1}`

              return (
                <Button
                  variant='outline'
                  key={`${imagesDialogItem?.sku}-${image}-${index}`}
                  type='button'
                  className='tw:focus-visible:ring-ring tw:relative tw:aspect-square tw:size-24 tw:overflow-hidden tw:rounded-md tw:border tw:p-0 tw:focus-visible:ring-2 tw:focus-visible:outline-none'
                  onClick={() => setSelectedImage({ images: imagesDialogImages, index })}
                  aria-label={`View ${alt}`}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={image} alt={alt} className='tw:h-full tw:w-full tw:object-cover' />
                </Button>
              )
            })}
          </div>
        ) : (
          <div className='tw:text-muted-foreground tw:rounded-md tw:border tw:border-dashed tw:p-6 tw:text-center tw:text-sm'>No images found.</div>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default ShowReturnItemImagesDialog
