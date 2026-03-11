import { useMemo } from 'react'

import { RPProductsTrendTagBulkResult } from '@hooks/reorderingPoints/useRPProductsInfo'
import { Badge } from '@shadcn/ui/badge'
import { Button } from '@shadcn/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@shadcn/ui/dialog'
import { Field, FieldContent, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@shadcn/ui/field'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@shadcn/ui/select'
import { Spinner } from '@shadcn/ui/spinner'
import { ReorderingPointsProduct } from '@typesTs/reorderingPoints/reorderingPoints'
import { useFormik } from 'formik'
import { TrendingUpDownIcon } from 'lucide-react'

import { PRODUCT_TREND_OPTIONS, ProductTrendOption, bulkProductTrendFormSchema } from './productTrendTagForm'

type Props = {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  products: ReorderingPointsProduct[]
  onSubmit: (products: ReorderingPointsProduct[], bsnssTrend: ProductTrendOption) => Promise<RPProductsTrendTagBulkResult>
}

const RPBulkProductTrendTagDialog = ({ isOpen, onClose, onSuccess, products, onSubmit }: Props) => {
  const selectedCountLabel = useMemo(() => `${products.length} product${products.length === 1 ? '' : 's'} selected`, [products.length])

  const formik = useFormik<{ bsnssTrend: ProductTrendOption | '' }>({
    enableReinitialize: true,
    initialValues: {
      bsnssTrend: '',
    },
    validationSchema: bulkProductTrendFormSchema,
    onSubmit: async ({ bsnssTrend }, helpers) => {
      if (!bsnssTrend) return

      const result = await onSubmit(products, bsnssTrend)

      if (result.status === 'success') {
        helpers.resetForm()
        onSuccess()
        return
      }
    },
  })

  const handleOpenChange = (open: boolean) => {
    if (open) return

    formik.resetForm()

    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className='tw:max-w-xl' showCloseButton={false}>
        <DialogHeader className='tw:flex tw:flex-col tw:gap-3'>
          <div className='tw:flex tw:items-center tw:gap-2'>
            <Badge variant='secondary'>
              <TrendingUpDownIcon />
              Bulk Trend Tag
            </Badge>
            <Badge variant='outline'>{selectedCountLabel}</Badge>
          </div>
          <DialogTitle>Set product trend tag in bulk</DialogTitle>
          <DialogDescription>Select the business trend to apply to all selected products.</DialogDescription>
        </DialogHeader>

        <form onSubmit={formik.handleSubmit} className='tw:flex tw:flex-col tw:gap-5'>
          <FieldGroup>
            <Field data-invalid={formik.touched.bsnssTrend && formik.errors.bsnssTrend ? true : undefined}>
              <FieldLabel htmlFor='bulk-product-trend-tag'>Business Trend</FieldLabel>
              <FieldContent>
                <Select value={formik.values.bsnssTrend} onValueChange={(value) => formik.setFieldValue('bsnssTrend', value)}>
                  <SelectTrigger
                    id='bulk-product-trend-tag'
                    size='sm'
                    aria-invalid={formik.touched.bsnssTrend && formik.errors.bsnssTrend ? true : undefined}
                    className='tw:w-full'>
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
                {formik.touched.bsnssTrend && formik.errors.bsnssTrend ? <FieldError>{formik.errors.bsnssTrend}</FieldError> : null}
              </FieldContent>
            </Field>
          </FieldGroup>

          <DialogFooter>
            <Button variant='outline' onClick={() => handleOpenChange(false)} disabled={formik.isSubmitting}>
              Cancel
            </Button>
            <Button type='submit' disabled={formik.isSubmitting || !formik.values.bsnssTrend}>
              {formik.isSubmitting ? (
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
