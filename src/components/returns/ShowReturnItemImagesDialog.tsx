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
            <p className='mb-0!'>{imagesDialogItem?.sku}</p>
            <p className='mb-0!'>{imagesDialogItem?.title}</p>
          </DialogDescription>
        </DialogHeader>

        {imagesDialogImages.length ? (
          <div className='flex flex-row justify-start gap-2 items-center'>
            {imagesDialogImages.map((image, index) => {
              const alt = `Unsellable image ${index + 1}`

              return (
                <Button
                  variant='outline'
                  key={`${imagesDialogItem?.sku}-${image}-${index}`}
                  type='button'
                  className='focus-visible:ring-ring relative aspect-square size-24 overflow-hidden rounded-md border p-0 focus-visible:ring-2 focus-visible:outline-none'
                  onClick={() => setSelectedImage({ images: imagesDialogImages, index })}
                  aria-label={`View ${alt}`}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={image} alt={alt} className='h-full w-full object-cover' />
                </Button>
              )
            })}
          </div>
        ) : (
          <div className='text-muted-foreground rounded-md border border-dashed p-6 text-center text-sm'>No images found.</div>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default ShowReturnItemImagesDialog
