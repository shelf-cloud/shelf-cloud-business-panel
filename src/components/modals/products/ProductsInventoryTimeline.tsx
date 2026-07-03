 
 
import ProductsQtyTimeline from '@components/products/ProductsQtyTimeline'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@shadcn/ui/dialog'

type Props = {
  dates: string[]
  dailyQty: number[]
  dailySellerValue: number[]
  dailyLandedValue: number[]
  productsQtyTimelineModal: { show: boolean }
  setproductsQtyTimelineModal: (prev: any) => void
}

const ProductsInventoryTimelineModal = ({ dates, dailyQty, dailySellerValue, dailyLandedValue, productsQtyTimelineModal, setproductsQtyTimelineModal }: Props) => {
  return (
    <Dialog
      open={!!productsQtyTimelineModal.show}
      onOpenChange={(open) => {
        if (!open) setproductsQtyTimelineModal({ show: false })
      }}>
      <DialogContent aria-describedby={undefined} className='max-h-[90vh] overflow-y-auto sm:!max-w-5xl' id='ProductsInventoryTimelineModal'>
        <DialogHeader className='pr-6' id='ProductsInventoryTimeline'>
          <DialogTitle>Inventory Timeline</DialogTitle>
        </DialogHeader>
        <div>
          <ProductsQtyTimeline dates={dates} dailyQty={dailyQty} dailySellerValue={dailySellerValue} dailyLandedValue={dailyLandedValue} />
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default ProductsInventoryTimelineModal
