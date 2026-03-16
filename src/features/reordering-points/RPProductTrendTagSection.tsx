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
    <div className='tw:mb-4'>
      <Card className='tw:border-border tw:shadow-md! tw:gap-2!'>
        <CardContent className='tw:p-4'>
          {/* Section header */}
          <div className='tw:flex tw:items-center tw:justify-between tw:mb-3'>
            <h4 className='tw:text-sm tw:font-semibold tw:text-foreground tw:m-0 tw:flex tw:items-center tw:gap-1.5'>
              <TrendingUpDownIcon className='tw:size-4 tw:text-info' />
              Active Product Trend
            </h4>
            {activeTrend && (
              <Badge className='tw:text-xs'>
                <TrendingUpDownIcon className='tw:size-3 tw:mr-1' />
                {activeTrend}
              </Badge>
            )}
          </div>

          {/* AI Trend display — read-only */}
          {trendTag?.aiTrend && (
            <div className='tw:mb-3'>
              <div className='tw:flex tw:items-center tw:gap-2 tw:mb-1.5'>
                <span className='tw:text-xs tw:font-medium tw:text-muted-foreground'>AI Trend</span>
                <Badge variant={'secondary'} className='tw:text-xs'>
                  {trendTag.aiTrend}
                </Badge>
              </div>
              {trendTag.analysis && (
                <div className='tw:border-l-2 tw:pl-3 tw:py-1' style={{ borderColor: '#4481FD' }}>
                  <p className='tw:text-xs tw:text-muted-foreground tw:leading-relaxed tw:m-0'>{trendTag.analysis}</p>
                </div>
              )}
            </div>
          )}

          <Separator className='tw:my-3' />

          {/* Editable form */}
          <form onSubmit={formik.handleSubmit}>
            {/* Business Trend Select */}
            <div className='tw:flex tw:flex-col tw:gap-1.5 tw:mb-3'>
              <label className='tw:text-xs tw:font-medium tw:text-muted-foreground'>Business Trend</label>
              <Select value={formik.values.bsnssTrend} onValueChange={handleSelectChange}>
                <SelectTrigger size='sm' className='tw:w-full tw:border tw:border-border tw:bg-transparent tw:rounded-md'>
                  <SelectValue placeholder='Select trend' />
                </SelectTrigger>
                <SelectContent className='tw:z-1050'>
                  <SelectGroup>
                    {PRODUCT_TREND_OPTIONS.map((opt) => (
                      <SelectItem key={opt} value={opt}>
                        {opt}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              {formik.touched.bsnssTrend && formik.errors.bsnssTrend && <span className='tw:text-xs tw:text-destructive'>{formik.errors.bsnssTrend}</span>}
            </div>

            {/* Use AI Trend Switch */}
            <div className='tw:flex tw:items-center tw:justify-between tw:mb-3'>
              <div className='tw:flex tw:flex-col tw:gap-0.5'>
                <span className='tw:text-xs tw:font-medium tw:text-foreground'>Use AI Trend</span>
                <span className='tw:text-xs tw:text-muted-foreground'>When enabled, AI trend overrides business trend</span>
              </div>
              <Switch checked={formik.values.useAITrend} onCheckedChange={handleSwitchChange} />
            </div>

            {/* Save button */}
            {hasChanges && (
              <div className='tw:flex tw:justify-end'>
                <Button type='submit' size={'sm'} disabled={saving}>
                  {saving ? (
                    <>
                      <i className='ri-loader-4-line tw:animate-spin tw:mr-1' />
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
