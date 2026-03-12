/* eslint-disable @next/next/no-img-element */
import { Drawer, DrawerClose, DrawerDescription, DrawerFooter, DrawerHeader, DrawerOverlay, DrawerPortal, DrawerTitle } from '@components/shadcn/ui/drawer'
import { Separator } from '@components/shadcn/ui/separator'
import { RPProductTrendTagUpdate } from '@hooks/reorderingPoints/useRPProductsInfo'
import { NoImageAdress } from '@lib/assetsConstants'
import { ReorderingPointsProduct } from '@typesTs/reorderingPoints/reorderingPoints'
import { XIcon } from 'lucide-react'
import { Drawer as DrawerPrimitive } from 'vaul'

import { Button } from '@/components/shadcn/ui/button'
import { cn } from '@/lib/shadcn/utils'

import RPAIForecastModelCard from './RPAIForecastModelCard'
import RPProductTrendTagSection from './RPProductTrendTagSection'

type Props = {
  product: ReorderingPointsProduct | null
  isOpen: boolean
  onClose: () => void
  region: string
  onSave: (data: RPProductTrendTagUpdate) => void
}

const RPAIForecastDrawer = ({ product, isOpen, onClose, region, onSave }: Props) => {
  const models = product
    ? [
        { modelNumber: 1 as const, ...product.totalAIForecast_1 },
        { modelNumber: 2 as const, ...product.totalAIForecast_2 },
        { modelNumber: 3 as const, ...product.totalAIForecast_3 },
      ]
    : []

  const visibleModels = models.filter((m) => m.model && m.analysis)

  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()} direction='right'>
      <DrawerPortal>
        <DrawerOverlay className='tw:z-1040' />
        <DrawerPrimitive.Content
          data-slot='drawer-content'
          className={cn(
            'tw:fixed tw:z-1045 tw:flex tw:flex-col tw:border-border tw:bg-background tw:text-foreground tw:shadow-xl',
            'tw:inset-y-0 tw:right-0 tw:w-full tw:border-l tw:sm:max-w-lg tw:h-full'
          )}>
          {/* HEADER */}
          <DrawerHeader className='tw:border-b tw:border-border tw:pb-4'>
            <div className='tw:flex tw:flex-row tw:items-start tw:justify-between tw:gap-3'>
              <div className='tw:flex tw:flex-row tw:items-start tw:gap-3'>
                <div style={{ width: 40, height: 52, flexShrink: 0 }} className='tw:relative tw:overflow-hidden tw:rounded-md tw:border tw:border-border tw:bg-muted'>
                  <img
                    loading='lazy'
                    src={product?.image || NoImageAdress}
                    onError={(e) => (e.currentTarget.src = NoImageAdress)}
                    alt='product'
                    style={{ objectFit: 'contain', objectPosition: 'center', width: '100%', height: '100%' }}
                  />
                </div>
                <div className='tw:flex tw:flex-col tw:gap-0.5 tw:min-w-0'>
                  <DrawerTitle className='tw:text-base tw:text-primary tw:font-semibold tw:leading-tight'>{product?.sku}</DrawerTitle>
                  <DrawerDescription className='tw:text-sm tw:font-medium tw:text-foreground tw:line-clamp-2 tw:leading-snug'>{product?.title}</DrawerDescription>
                </div>
              </div>
              <DrawerClose asChild>
                <Button variant={'outline'} size={'icon'} aria-label='Close'>
                  <XIcon className='tw:size-5' />
                </Button>
              </DrawerClose>
            </div>
          </DrawerHeader>

          {/* BODY */}
          <div className='tw:flex-1 tw:overflow-y-auto tw:px-4 tw:py-4'>
            {/* PRODUCT TREND TAG */}
            {product?.productTrendTag && <RPProductTrendTagSection product={product} onSave={onSave} />}
            <div className='tw:mb-4'>
              <h4 className='tw:text-sm tw:font-semibold tw:text-foreground tw:mb-0.5 tw:flex tw:items-center tw:gap-1.5'>
                <i className='las la-brain tw:text-base tw:text-info' />
                AI Forecast Models
              </h4>
              <p className='tw:text-xs tw:text-muted-foreground tw:m-0'>Comparison of all AI forecast models used for this product.</p>
            </div>

            {visibleModels.length === 0 ? (
              <div className='tw:flex tw:flex-col tw:items-center tw:justify-center tw:gap-2 tw:py-12 tw:text-center'>
                <i className='las la-robot tw:text-4xl tw:text-muted-foreground' />
                <p className='tw:text-sm tw:text-muted-foreground tw:m-0'>No AI forecast data available for this product.</p>
              </div>
            ) : (
              <div className='tw:flex tw:flex-col tw:gap-0'>
                {visibleModels.map((m, idx) => (
                  <div key={m.modelNumber}>
                    <RPAIForecastModelCard modelNumber={m.modelNumber} model={m.model} analysis={m.analysis} forecast={m.forecast} region={region} />
                    {idx < visibleModels.length - 1 && <Separator className='tw:my-2' />}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* FOOTER */}
          <DrawerFooter className='tw:border-t tw:border-border tw:pt-3 tw:pb-4'>
            <div className='tw:flex tw:justify-end'>
              <DrawerClose asChild>
                <Button variant={'muted'} aria-label='Close'>
                  Close
                </Button>
              </DrawerClose>
            </div>
          </DrawerFooter>
        </DrawerPrimitive.Content>
      </DrawerPortal>
    </Drawer>
  )
}

export default RPAIForecastDrawer
