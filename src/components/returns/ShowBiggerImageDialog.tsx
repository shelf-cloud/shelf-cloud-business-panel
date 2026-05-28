import { DownloadIcon } from 'lucide-react'

import { Button } from '../shadcn/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../shadcn/ui/dialog'

export type SelectedUnsellableImage = {
  url: string
  alt: string
}

type Props = {
  selectedImage: SelectedUnsellableImage | null
  setSelectedImage: (image: SelectedUnsellableImage | null) => void
}

const ShowBiggerImageDialog = ({ selectedImage, setSelectedImage }: Props) => {
  return (
    <Dialog open={Boolean(selectedImage)} onOpenChange={(isOpen) => !isOpen && setSelectedImage(null)}>
      <DialogContent className='tw:max-w-5xl'>
        <DialogHeader>
          <DialogTitle>Unsellable Image</DialogTitle>
          <DialogDescription>{selectedImage?.alt}</DialogDescription>
        </DialogHeader>
        <div className='tw:bg-muted tw:flex tw:max-h-[70vh] tw:items-center tw:justify-center tw:overflow-hidden tw:rounded-md tw:border'>
          {selectedImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={selectedImage.url} alt={selectedImage.alt} className='tw:max-h-[70vh] tw:w-full tw:object-contain' />
          ) : null}
        </div>
        <DialogFooter>
          {selectedImage ? (
            <Button asChild type='button'>
              <a href={selectedImage.url} download target='_blank' rel='noopener noreferrer'>
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
