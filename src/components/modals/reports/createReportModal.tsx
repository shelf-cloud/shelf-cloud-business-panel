import { useMemo } from 'react'

import { PRODUCTS_REPORT_TYPE } from '@features/reports/reportHelpers'
import { useSkus } from '@hooks/products/useSkus'
import moment from 'moment'
import { Button, Modal, ModalBody, ModalHeader, Row, Spinner } from '@/components/migration-ui'

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

  return (
    <Modal
      fade={false}
      size='md'
      id='createreportmodal'
      isOpen={showMappedCreateReport.show}
      toggle={() => {
        setshowMappedCreateReport((prev: any) => {
          return {
            ...prev,
            show: false,
            loading: false,
            reportType: '',
            productsSelected: '[]',
          }
        })
      }}>
      <ModalHeader
        toggle={() => {
          setshowMappedCreateReport((prev: any) => {
            return {
              ...prev,
              show: false,
              loading: false,
              reportType: '',
              productsSelected: '[]',
            }
          })
        }}
        className='modal-title'
        id='myModalLabel'>
        Request New Report
      </ModalHeader>
      <ModalBody>
        <Row>
          <div className='tw:space-y-3'>
            <div>
              <p className='fw-light text-muted fs-7 mb-1'>Select Report Type:</p>
              <SelectReportType showMappedCreateReport={showMappedCreateReport} setshowMappedCreateReport={setshowMappedCreateReport} />
            </div>
            <div>
              <p className='fw-light text-muted fs-7 mb-1'>Select Report Date Range:</p>
              <SelectRangeDates
                showMappedCreateReport={showMappedCreateReport}
                setshowMappedCreateReport={setshowMappedCreateReport}
                handleChangeDatesFromPicker={handleChangeDatesFromPicker}
              />
            </div>
            {showMappedCreateReport.reportType === PRODUCTS_REPORT_TYPE && (
              <div>
                <p className='fw-light text-muted fs-7 mb-1'>Select SKUs:</p>
                {isLoading ? (
                  <div className='d-flex align-items-center gap-2 text-muted fs-6'>
                    <Spinner color='primary' size={'sm'} />
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
                    triggerClassName='tw:mb-3'
                  />
                )}
              </div>
            )}
          </div>
          <Row md={12} className='mt-3'>
            <div className='d-flex flex-row gap-3 justify-content-end'>
              <Button
                disabled={showMappedCreateReport.loading}
                type='button'
                color='light'
                className='btn'
                onClick={() => {
                  setshowMappedCreateReport((prev: any) => {
                    return {
                      ...prev,
                      show: false,
                      loading: false,
                      reportType: '',
                      productsSelected: '[]',
                    }
                  })
                }}>
                Cancel
              </Button>
              <Button
                disabled={showMappedCreateReport.loading || showMappedCreateReport.reportType === ''}
                type='button'
                color='success'
                className='btn'
                onClick={handleCreateReport}>
                {showMappedCreateReport.loading ? <Spinner color='light' size={'sm'} /> : 'Request'}
              </Button>
            </div>
          </Row>
        </Row>
      </ModalBody>
    </Modal>
  )
}

export default CreateReportModal
