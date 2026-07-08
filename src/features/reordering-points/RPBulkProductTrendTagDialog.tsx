import { useMemo } from 'react'

import { zodResolver } from '@hookform/resolvers/zod'
import { RPProductsTrendTagBulkResult } from '@hooks/reorderingPoints/useRPProductsInfo'
import { Badge } from '@shadcn/ui/badge'
import { Button } from '@shadcn/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@shadcn/ui/dialog'
import { Field, FieldContent, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@shadcn/ui/field'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@shadcn/ui/select'
import { Spinner } from '@shadcn/ui/spinner'
import { ReorderingPointsProduct } from '@typesTs/reorderingPoints/reorderingPoints'
import { useForm } from 'react-hook-form'
import { TrendingUpDownIcon } from 'lucide-react'
import { z } from 'zod'

import { PRODUCT_TREND_OPTIONS, ProductTrendOption } from './productTrendTagForm'

type Props = {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  products: ReorderingPointsProduct[]
  onSubmit: (products: ReorderingPointsProduct[], bsnssTrend: ProductTrendOption) => Promise<RPProductsTrendTagBulkResult>
}

const bulkProductTrendFormSchema = z.object({
  bsnssTrend: z.enum(PRODUCT_TREND_OPTIONS, { message: 'Select a business trend' }),
})

type BulkProductTrendFormValues = z.infer<typeof bulkProductTrendFormSchema>

const RPBulkProductTrendTagDialog = ({ isOpen, onClose, onSuccess, products, onSubmit }: Props) => {
  const selectedCountLabel = useMemo(() => `${products.length} product${products.length === 1 ? '' : 's'} selected`, [products.length])

  const validation = useForm<BulkProductTrendFormValues>({
    resolver: zodResolver(bulkProductTrendFormSchema),
    defaultValues: {
      bsnssTrend: '' as ProductTrendOption,
    },
  })

  const handleFormSubmit = async ({ bsnssTrend }: BulkProductTrendFormValues) => {
    if (!bsnssTrend) return

    const result = await onSubmit(products, bsnssTrend)

    if (result.status === 'success') {
      validation.reset()
      onSuccess()
      return
    }
  }

  const handleOpenChange = (open: boolean) => {
    if (open) return

    validation.reset()

    onClose()
  }

  const bsnssTrend = validation.watch('bsnssTrend')
  const { errors, touchedFields, isSubmitting } = validation.formState

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className='max-w-xl' showCloseButton={false}>
        <DialogHeader className='flex flex-col gap-3'>
          <div className='flex items-center gap-2'>
            <Badge variant='secondary'>
              <TrendingUpDownIcon />
              Bulk Trend Tag
            </Badge>
            <Badge variant='outline'>{selectedCountLabel}</Badge>
          </div>
          <DialogTitle>Set product trend tag in bulk</DialogTitle>
          <DialogDescription>Select the business trend to apply to all selected products.</DialogDescription>
        </DialogHeader>

        <form onSubmit={validation.handleSubmit(handleFormSubmit)} className='flex flex-col gap-5'>
          <FieldGroup>
            <Field data-invalid={touchedFields.bsnssTrend && errors.bsnssTrend ? true : undefined}>
              <FieldLabel htmlFor='bulk-product-trend-tag'>Business Trend</FieldLabel>
              <FieldContent>
                <Select value={bsnssTrend} onValueChange={(value) => validation.setValue('bsnssTrend', value as ProductTrendOption, { shouldValidate: true, shouldTouch: true })}>
                  <SelectTrigger
                    id='bulk-product-trend-tag'
                    size='sm'
                    aria-invalid={touchedFields.bsnssTrend && errors.bsnssTrend ? true : undefined}
                    className='w-full'>
                    <SelectValue placeholder='Select a trend' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {PRODUCT_TREND_OPTIONS.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <FieldDescription>Selected products will use this business trend for forecast, and AI trend will be disabled.</FieldDescription>
                {touchedFields.bsnssTrend && errors.bsnssTrend ? <FieldError>{errors.bsnssTrend.message}</FieldError> : null}
              </FieldContent>
            </Field>
          </FieldGroup>

          <DialogFooter>
            <Button variant='outline' onClick={() => handleOpenChange(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type='submit' disabled={isSubmitting || !bsnssTrend}>
              {isSubmitting ? (
                <>
                  <Spinner data-icon='inline-start' />
                  Saving
                </>
              ) : (
                'Apply Trend Tag'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default RPBulkProductTrendTagDialog
