import { useMemo } from 'react'

import { PRODUCTS_REPORT_TYPE } from '@features/reports/reportHelpers'
import { useSkus } from '@hooks/products/useSkus'
import moment from 'moment'
import { Button } from '@shadcn/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@shadcn/ui/dialog'
import { Spinner } from '@shadcn/ui/spinner'

import MultiSelectSearchInput, { MultiSelectItem } from '../shared/multi-select-search-input'
import SelectRangeDates from './SelectRangeDates'
import SelectReportType from './SelectReportType'

type Props = {
  showMappedCreateReport: {
    show: boolean
    loading: boolean
    reportType: string
    startDate: string
    endDate: string
    productsSelected: string
  }
  setshowMappedCreateReport: (prev: any) => void
  handleCreateReport: () => void
}

const parseSelectedProducts = (selectedProducts: string): string[] => {
  try {
    const parsedValue = JSON.parse(selectedProducts)

    if (!Array.isArray(parsedValue)) return []

    return parsedValue.map((value) => String(value))
  } catch {
    return []
  }
}

const serializeSelectedProducts = (selectedProducts: string[]) => JSON.stringify(selectedProducts.map((value) => (/^-?\d+$/.test(value) ? Number(value) : value)))

const CreateReportModal = ({ showMappedCreateReport, setshowMappedCreateReport, handleCreateReport }: Props) => {
  const { skus, isLoading } = useSkus()
  const skuSelectionInfo: MultiSelectItem[] = useMemo(
    () =>
      skus.map((product) => {
        return {
          value: String(product.inventoryId),
          label: product.sku,
        }
      }),
    [skus]
  )
  const selectedProducts = useMemo(() => parseSelectedProducts(showMappedCreateReport.productsSelected), [showMappedCreateReport.productsSelected])

  const handleChangeDatesFromPicker = (dateStr: string) => {
    const dates = dateStr.split(' to ')
    setshowMappedCreateReport((prev: any) => {
      return {
        ...prev,
        startDate: moment(dates[0], 'DD MMM YY').format('YYYY-MM-DD'),
        endDate: moment(dates[1], 'DD MMM YY').format('YYYY-MM-DD'),
      }
    })
  }

  const closeModal = () => {
    setshowMappedCreateReport((prev: any) => {
      return {
        ...prev,
        show: false,
        loading: false,
        reportType: '',
        productsSelected: '[]',
      }
    })
  }

  return (
    <Dialog
      open={!!showMappedCreateReport.show}
      onOpenChange={(open) => {
        if (!open) closeModal()
      }}>
      <DialogContent aria-describedby={undefined} className='max-h-[90vh] overflow-y-auto sm:!max-w-lg'>
        <DialogHeader className='pr-6'>
          <DialogTitle id='myModalLabel'>Request New Report</DialogTitle>
        </DialogHeader>
        <div className='flex flex-wrap -mx-3'>
          <div className='space-y-3'>
            <div>
              <p className='font-light text-[var(--bs-secondary-color)] text-[11.2px] mb-1'>Select Report Type:</p>
              <SelectReportType showMappedCreateReport={showMappedCreateReport} setshowMappedCreateReport={setshowMappedCreateReport} />
            </div>
            <div>
              <p className='font-light text-[var(--bs-secondary-color)] text-[11.2px] mb-1'>Select Report Date Range:</p>
              <SelectRangeDates
                showMappedCreateReport={showMappedCreateReport}
                setshowMappedCreateReport={setshowMappedCreateReport}
                handleChangeDatesFromPicker={handleChangeDatesFromPicker}
              />
            </div>
            {showMappedCreateReport.reportType === PRODUCTS_REPORT_TYPE && (
              <div>
                <p className='font-light text-[var(--bs-secondary-color)] text-[11.2px] mb-1'>Select SKUs:</p>
                {isLoading ? (
                  <div className='flex items-center gap-2 text-[var(--bs-secondary-color)] text-[13px]'>
                    <Spinner className='text-primary' />
                    Loading SKUs...
                  </div>
                ) : (
                  <MultiSelectSearchInput
                    items={skuSelectionInfo}
                    selected={selectedProducts}
                    onSelectedChange={(value) => {
                      setshowMappedCreateReport((prev: any) => {
                        return {
                          ...prev,
                          productsSelected: serializeSelectedProducts(value),
                        }
                      })
                    }}
                    placeholder='Select SKUs'
                    emptyMessage='No SKU found.'
                    searchPlaceholder='Search SKUs...'
                    maxDisplayItems={2}
                    triggerClassName='mb-3'
                  />
                )}
              </div>
            )}
          </div>
          <div className='flex flex-wrap -mx-3 mt-4'>
            <div className='flex flex-row gap-4 justify-end'>
              <Button
                disabled={showMappedCreateReport.loading}
                type='button'
                variant='light'
                className='btn'
                onClick={closeModal}>
                Cancel
              </Button>
              <Button
                disabled={showMappedCreateReport.loading || showMappedCreateReport.reportType === ''}
                type='button'
                variant='success'
                className='btn'
                onClick={handleCreateReport}>
                {showMappedCreateReport.loading ? <Spinner className='text-white' /> : 'Request'}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default CreateReportModal
