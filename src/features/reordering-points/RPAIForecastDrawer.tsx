/* eslint-disable @next/next/no-img-element */
import { useMemo, useState } from 'react'

import { Drawer, DrawerClose, DrawerDescription, DrawerFooter, DrawerHeader, DrawerOverlay, DrawerPortal, DrawerTitle } from '@components/shadcn/ui/drawer'
import { Separator } from '@components/shadcn/ui/separator'
import { RPProductTrendTagUpdate } from '@hooks/reorderingPoints/useRPProductsInfo'
import { NoImageAdress } from '@lib/assetsConstants'
import { ReorderingPointsProduct } from '@typesTs/reorderingPoints/reorderingPoints'
import { ArrowLeftIcon, XIcon } from 'lucide-react'
import { Drawer as DrawerPrimitive } from 'vaul'

import { Button } from '@/components/shadcn/ui/button'
import ForecastChatPanel from '@/features/ai-chat/ForecastChatPanel'
import { ForecastChatModelNumber, ForecastChatSelectedForecast, ForecastChatUrgencyThresholds } from '@/features/ai-chat/types'
import { cn } from '@/lib/shadcn/utils'

import RPAIForecastModelCard from './RPAIForecastModelCard'
import RPProductTrendTagSection from './RPProductTrendTagSection'
import { buildProductPrompt } from './ai-helpers'

type Props = {
  product: ReorderingPointsProduct | null
  isOpen: boolean
  onClose: () => void
  region: string
  businessId: string
  onSave: (data: RPProductTrendTagUpdate) => void
  urgencyThresholds: ForecastChatUrgencyThresholds
}

type SelectedForecastChat = {
  inventoryId: number
  sessionKey: number
  modelNumber: ForecastChatModelNumber
  forecast: ForecastChatSelectedForecast
}

const RPAIForecastDrawer = ({ product, isOpen, onClose, region, businessId, onSave, urgencyThresholds }: Props) => {
  const [selectedForecastChat, setSelectedForecastChat] = useState<SelectedForecastChat | null>(null)

  const models = product
    ? [
        { modelNumber: 1 as const, ...product.totalAIForecast_1 },
        { modelNumber: 2 as const, ...product.totalAIForecast_2 },
        { modelNumber: 3 as const, ...product.totalAIForecast_3 },
      ]
    : []

  const visibleModels = models.filter((m) => m.model && m.analysis)
  const sanitizedProduct = useMemo(() => (product ? buildProductPrompt(product, urgencyThresholds) : null), [product, urgencyThresholds])
  const activeSelectedForecastChat = selectedForecastChat?.inventoryId === product?.inventoryId ? selectedForecastChat : null

  const handleClose = () => {
    setSelectedForecastChat(null)
    onClose()
  }

  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && handleClose()} direction='right'>
      <DrawerPortal>
        <DrawerOverlay className='tw:z-1040' />
        <DrawerPrimitive.Content
          data-slot='drawer-content'
          className={cn(
            'tw:fixed tw:z-1045 tw:flex tw:flex-col tw:border-border tw:bg-background tw:text-foreground tw:shadow-xl',
            'tw:inset-y-0 tw:right-0 tw:w-full tw:border-l tw:h-full',
            activeSelectedForecastChat ? 'tw:lg:max-w-[min(92vw,1180px)] tw:xl:max-w-[min(60vw,1320px)]' : 'tw:sm:max-w-lg'
          )}>
          {/* HEADER */}
          <DrawerHeader className='tw:border-b tw:border-border tw:pb-1'>
            <div className='tw:flex tw:flex-row tw:items-start tw:justify-between tw:gap-1'>
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
                <div className='tw:flex tw:flex-col tw:gap-0 tw:min-w-0'>
                  <DrawerTitle className='tw:text-base tw:text-primary tw:font-semibold tw:leading-tight'>{product?.sku}</DrawerTitle>
                  <DrawerDescription className='tw:text-sm tw:font-medium tw:text-foreground tw:line-clamp-2 tw:leading-snug tw:m-0!'>{product?.title}</DrawerDescription>
                  {activeSelectedForecastChat && (
                    <p className='tw:m-0! tw:text-xs tw:font-medium tw:text-muted-foreground'>AI follow-up chat for Model {activeSelectedForecastChat.modelNumber}</p>
                  )}
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
          <div className='tw:flex tw:min-h-0 tw:flex-1 tw:flex-col tw:px-4 tw:py-0'>
            {activeSelectedForecastChat && sanitizedProduct ? (
              <ForecastChatPanel
                key={`${sanitizedProduct.sku}-${activeSelectedForecastChat.modelNumber}-${activeSelectedForecastChat.sessionKey}`}
                businessId={businessId}
                region={region}
                chatSessionKey={activeSelectedForecastChat.sessionKey}
                modelNumber={activeSelectedForecastChat.modelNumber}
                product={sanitizedProduct}
                selectedForecast={activeSelectedForecastChat.forecast}
                urgencyThresholds={urgencyThresholds}
              />
            ) : (
              <>
                {/* PRODUCT TREND TAG */}
                <div className='tw:overflow-y-auto'>
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
                    <div className='tw:flex tw:flex-col tw:gap-0 tw:pb-4'>
                      {visibleModels.map((m, idx) => (
                        <div key={m.modelNumber}>
                          <RPAIForecastModelCard
                            modelNumber={m.modelNumber}
                            model={m.model}
                            analysis={m.analysis}
                            forecast={m.forecast}
                            region={region}
                            productForecast={m}
                            onAnalyze={(modelNumber, forecast) =>
                              setSelectedForecastChat({
                                inventoryId: product?.inventoryId ?? 0,
                                sessionKey: Date.now(),
                                modelNumber,
                                forecast,
                              })
                            }
                          />
                          {idx < visibleModels.length - 1 && <Separator className='tw:my-2' />}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* FOOTER */}
          <DrawerFooter className='tw:border-t tw:border-border tw:pt-3 tw:pb-4'>
            <div className='tw:flex tw:justify-between tw:gap-3'>
              <div>
                {activeSelectedForecastChat ? (
                  <Button variant='outline' aria-label='Back to forecasts' onClick={() => setSelectedForecastChat(null)}>
                    <ArrowLeftIcon className='tw:size-4' />
                    Back to forecasts
                  </Button>
                ) : null}
              </div>
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
