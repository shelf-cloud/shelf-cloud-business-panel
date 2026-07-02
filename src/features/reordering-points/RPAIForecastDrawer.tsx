/* eslint-disable @next/next/no-img-element */
import { useMemo, useState } from 'react'

import { Drawer, DrawerClose, DrawerDescription, DrawerFooter, DrawerHeader, DrawerOverlay, DrawerPortal, DrawerTitle } from '@components/shadcn/ui/drawer'
import { Separator } from '@components/shadcn/ui/separator'
import { NoImageAdress } from '@lib/assetsConstants'
import { ReorderingPointsProduct } from '@typesTs/reorderingPoints/reorderingPoints'
import { ArrowLeftIcon, XIcon } from 'lucide-react'
import { Drawer as DrawerPrimitive } from 'vaul'

import { Button } from '@/components/shadcn/ui/button'
import ForecastChatPanel from '@/features/ai-chat/ForecastChatPanel'
import { ForecastChatModelNumber, ForecastChatSelectedForecast, ForecastChatUrgencyThresholds } from '@/features/ai-chat/types'
import { cn } from '@/lib/shadcn/utils'

import RPAIForecastModelCard from './RPAIForecastModelCard'
import { buildProductPrompt_v2 } from './ai-helpers-v2'

type Props = {
  product: ReorderingPointsProduct | null
  isOpen: boolean
  onClose: () => void
  region: string
  businessId: string
  urgencyThresholds: ForecastChatUrgencyThresholds
}

type SelectedForecastChat = {
  inventoryId: number
  sessionKey: number
  modelNumber: ForecastChatModelNumber
  forecast: ForecastChatSelectedForecast
}

const RPAIForecastDrawer = ({ product, isOpen, onClose, region, businessId, urgencyThresholds }: Props) => {
  const [selectedForecastChat, setSelectedForecastChat] = useState<SelectedForecastChat | null>(null)
  const [isChatLeftColumnOpen, setIsChatLeftColumnOpen] = useState(true)

  const models = product ? [{ modelNumber: 1 as const, ...product.totalAIForecast_1 }] : []

  const visibleModels = models.filter((m) => m.model && m.analysis)
  const sanitizedProduct = useMemo(() => (product ? buildProductPrompt_v2(product) : null), [product])
  const activeSelectedForecastChat = selectedForecastChat?.inventoryId === product?.inventoryId ? selectedForecastChat : null

  const handleOpenForecastChat = (modelNumber: ForecastChatModelNumber, forecast: ForecastChatSelectedForecast) => {
    setIsChatLeftColumnOpen(true)
    setSelectedForecastChat({
      inventoryId: product?.inventoryId ?? 0,
      sessionKey: Date.now(),
      modelNumber,
      forecast,
    })
  }

  const handleBackToForecasts = () => {
    setIsChatLeftColumnOpen(true)
    setSelectedForecastChat(null)
  }

  const handleClose = () => {
    setIsChatLeftColumnOpen(true)
    setSelectedForecastChat(null)
    onClose()
  }

  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && handleClose()} direction='right'>
      <DrawerPortal>
        <DrawerOverlay className='z-1040' />
        <DrawerPrimitive.Content
          data-slot='drawer-content'
          className={cn(
            'fixed z-1045 flex h-full flex-col border-border bg-background text-foreground shadow-xl transition-[max-width] duration-200 ease-out',
            'inset-y-0 right-0 w-full border-l',
            activeSelectedForecastChat
              ? isChatLeftColumnOpen
                ? 'lg:max-w-[min(92vw)] xl:max-w-[min(80vw)]'
                : 'lg:max-w-[min(75vw)] xl:max-w-[min(35vw)]'
              : 'sm:max-w-[min(40vw)]'
          )}>
          {/* HEADER */}
          <DrawerHeader className='border-b border-border pb-1'>
            <div className='flex flex-row items-start justify-between gap-1'>
              <div className='flex flex-row items-start gap-3'>
                <div style={{ width: 40, height: 52, flexShrink: 0 }} className='relative overflow-hidden rounded-md border border-border bg-muted'>
                  <img
                    loading='lazy'
                    src={product?.image || NoImageAdress}
                    onError={(e) => (e.currentTarget.src = NoImageAdress)}
                    alt='product'
                    style={{ objectFit: 'contain', objectPosition: 'center', width: '100%', height: '100%' }}
                  />
                </div>
                <div className='flex flex-col gap-0 min-w-0'>
                  <DrawerTitle className='text-base text-primary font-semibold leading-tight'>{product?.sku}</DrawerTitle>
                  <DrawerDescription className='text-sm font-medium text-foreground line-clamp-2 leading-snug m-0!'>{product?.title}</DrawerDescription>
                  {activeSelectedForecastChat && (
                    <p className='m-0! text-xs font-medium text-muted-foreground'>AI follow-up chat for Model {activeSelectedForecastChat.modelNumber}</p>
                  )}
                </div>
              </div>
              <DrawerClose asChild>
                <Button variant={'outline'} size={'icon'} aria-label='Close'>
                  <XIcon className='size-5' />
                </Button>
              </DrawerClose>
            </div>
          </DrawerHeader>

          {/* BODY */}
          <div className='flex min-h-0 flex-1 flex-col px-4 py-0'>
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
                isLeftColumnOpen={isChatLeftColumnOpen}
                onToggleLeftColumn={() => setIsChatLeftColumnOpen((current) => !current)}
              />
            ) : (
              <>
                {/* PRODUCT TREND TAG */}
                <div className='overflow-y-auto px-2' style={{ scrollbarWidth: 'thin' }}>
                  {/* {product?.productTrendTag && <RPProductTrendTagSection product={product} onSave={onSave} />} */}
                  <div className='mb-4'>
                    <h4 className='text-sm font-semibold text-foreground mb-0.5 flex items-center gap-1.5'>
                      <i className='las la-brain text-base text-info' />
                      AI Forecast Models
                    </h4>
                    <p className='text-xs text-muted-foreground m-0'>Comparison of all AI forecast models used for this product.</p>
                  </div>

                  {visibleModels.length === 0 || !product ? (
                    <div className='flex flex-col items-center justify-center gap-2 py-12 text-center'>
                      <i className='las la-robot text-4xl text-muted-foreground' />
                      <p className='text-sm text-muted-foreground m-0'>No AI forecast data available for this product.</p>
                    </div>
                  ) : (
                    <div className='flex flex-col gap-0 pb-4'>
                      {visibleModels.map((m, idx) => (
                        <div key={m.modelNumber}>
                          <RPAIForecastModelCard
                            modelNumber={m.modelNumber}
                            model={m.model}
                            analysis={m.analysis}
                            forecast={m.forecast}
                            region={region}
                            product={product}
                            productForecast={m}
                            urgencyThresholds={urgencyThresholds}
                            onAnalyze={handleOpenForecastChat}
                          />
                          {idx < visibleModels.length - 1 && <Separator className='my-2' />}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* FOOTER */}
          <DrawerFooter className='border-t border-border pt-3 pb-4'>
            <div className='flex justify-between gap-3'>
              <div>
                {activeSelectedForecastChat ? (
                  <Button variant='outline' aria-label='Back to forecasts' onClick={handleBackToForecasts}>
                    <ArrowLeftIcon className='size-4' />
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
