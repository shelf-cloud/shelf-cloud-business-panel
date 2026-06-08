import { PRODUCTS_REPORT_TYPE, SHIPMENTS_REPORT_TYPE } from '@features/reports/reportHelpers'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@shadcn/ui/select'

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
}

const REPORT_TYPE_LIST = [
  { reportType: SHIPMENTS_REPORT_TYPE, reportTypeTile: 'Shipments Report' },
  { reportType: PRODUCTS_REPORT_TYPE, reportTypeTile: 'Products Sales/Inventory Report' },
]

const SelectReportType = ({ showMappedCreateReport, setshowMappedCreateReport }: Props) => {
  return (
    <Select
      value={showMappedCreateReport.reportType}
      onValueChange={(reportType) => {
        setshowMappedCreateReport((prev: any) => {
          return {
            ...prev,
            reportType,
            productsSelected: reportType === PRODUCTS_REPORT_TYPE ? prev.productsSelected : '[]',
          }
        })
      }}>
      <SelectTrigger className='tw:mb-3 tw:w-full tw:border tw:border-border'>
        <SelectValue placeholder='Select...' />
      </SelectTrigger>
      <SelectContent className='tw:z-1050'>
        <SelectGroup>
          {REPORT_TYPE_LIST.map((option) => (
            <SelectItem key={option.reportType} value={option.reportType}>
              {option.reportTypeTile}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}

export default SelectReportType
