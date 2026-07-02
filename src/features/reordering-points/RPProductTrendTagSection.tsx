import { useCallback, useState } from 'react'

import { Badge } from '@components/shadcn/ui/badge'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@components/shadcn/ui/select'
import { Separator } from '@components/shadcn/ui/separator'
import { Switch } from '@components/shadcn/ui/switch'
import { RPProductTrendTagUpdate } from '@hooks/reorderingPoints/useRPProductsInfo'
import { ReorderingPointsProduct } from '@typesTs/reorderingPoints/reorderingPoints'
import { useFormik } from 'formik'
import { TrendingUpDownIcon } from 'lucide-react'

import { Button } from '@/components/shadcn/ui/button'
import { Card, CardContent } from '@/components/shadcn/ui/card'

import { PRODUCT_TREND_OPTIONS, ProductTrendOption, productTrendFormSchema } from './productTrendTagForm'

type Props = {
  product: ReorderingPointsProduct
  onSave: (data: RPProductTrendTagUpdate) => void
}

const RPProductTrendTagSection = ({ product, onSave }: Props) => {
  const [saving, setSaving] = useState(false)
  const trendTag = product.productTrendTag

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      bsnssTrend: (trendTag?.bsnssTrend || 'Normal') as ProductTrendOption,
      useAITrend: trendTag?.useAITrend ?? true,
    },
    validationSchema: productTrendFormSchema,
    onSubmit: async (values) => {
      setSaving(true)
      try {
        await onSave({
          inventoryId: product.inventoryId,
          sku: product.sku,
          productTrendTag: {
            aiTrend: trendTag?.aiTrend ?? 'Normal',
            analysis: trendTag?.analysis ?? '',
            bsnssTrend: values.bsnssTrend,
            useAITrend: values.useAITrend,
          },
        })
      } finally {
        setSaving(false)
      }
    },
  })

  const activeTrend = formik.values.useAITrend ? trendTag?.aiTrend : formik.values.bsnssTrend
  const hasChanges = formik.values.bsnssTrend !== (trendTag?.bsnssTrend || 'Normal') || formik.values.useAITrend !== (trendTag?.useAITrend ?? true)

  const handleSwitchChange = useCallback(
    (checked: boolean) => {
      formik.setFieldValue('useAITrend', checked)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  const handleSelectChange = useCallback(
    (value: string) => {
      formik.setFieldValue('bsnssTrend', value)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  return (
    <div className='mb-4'>
      <Card className='border-border shadow-md! gap-2!'>
        <CardContent className='p-4'>
          {/* Section header */}
          <div className='flex items-center justify-between mb-3'>
            <h4 className='text-sm font-semibold text-foreground m-0 flex items-center gap-1.5'>
              <TrendingUpDownIcon className='size-4 text-info' />
              Active Product Trend
            </h4>
            {activeTrend && (
              <Badge className='text-xs'>
                <TrendingUpDownIcon className='size-3 mr-1' />
                {activeTrend}
              </Badge>
            )}
          </div>

          {/* AI Trend display — read-only */}
          {trendTag?.aiTrend && (
            <div className='mb-3'>
              <div className='flex items-center gap-2 mb-1.5'>
                <span className='text-xs font-medium text-muted-foreground'>AI Trend</span>
                <Badge variant={'secondary'} className='text-xs'>
                  {trendTag.aiTrend}
                </Badge>
              </div>
              {trendTag.analysis && (
                <div className='border-l-2 pl-3 py-1' style={{ borderColor: '#4481FD' }}>
                  <p className='text-xs text-muted-foreground leading-relaxed m-0'>{trendTag.analysis}</p>
                </div>
              )}
            </div>
          )}

          <Separator className='my-3' />

          {/* Editable form */}
          <form onSubmit={formik.handleSubmit}>
            {/* Business Trend Select */}
            <div className='flex flex-col gap-1.5 mb-3'>
              <label className='text-xs font-medium text-muted-foreground'>Business Trend</label>
              <Select value={formik.values.bsnssTrend} onValueChange={handleSelectChange}>
                <SelectTrigger size='sm' className='w-full border border-border bg-transparent rounded-md'>
                  <SelectValue placeholder='Select trend' />
                </SelectTrigger>
                <SelectContent className='z-1050'>
                  <SelectGroup>
                    {PRODUCT_TREND_OPTIONS.map((opt) => (
                      <SelectItem key={opt} value={opt}>
                        {opt}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              {formik.touched.bsnssTrend && formik.errors.bsnssTrend && <span className='text-xs text-destructive'>{formik.errors.bsnssTrend}</span>}
            </div>

            {/* Use AI Trend Switch */}
            <div className='flex items-center justify-between mb-3'>
              <div className='flex flex-col gap-0.5'>
                <span className='text-xs font-medium text-foreground'>Use AI Trend</span>
                <span className='text-xs text-muted-foreground'>When enabled, AI trend overrides business trend</span>
              </div>
              <Switch checked={formik.values.useAITrend} onCheckedChange={handleSwitchChange} />
            </div>

            {/* Save button */}
            {hasChanges && (
              <div className='flex justify-end'>
                <Button type='submit' size={'sm'} disabled={saving}>
                  {saving ? (
                    <>
                      <i className='ri-loader-4-line animate-spin mr-1' />
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </Button>
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default RPProductTrendTagSection
