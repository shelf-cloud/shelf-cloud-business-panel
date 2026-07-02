 
import { ShelfCloudReportList } from '@typesTs/reports/reportsList'
import moment from 'moment'
import DataTable from 'react-data-table-component'

import { Button } from '@/components/migration-ui'

type Props = {
  reportList: ShelfCloudReportList[]
  pending: boolean
  handleDownloadReport: (reportFileName: string) => void
}

const ReportsTable = ({ reportList, pending, handleDownloadReport }: Props) => {
  const columns: any = [
    {
      name: <span className='tw:font-bold tw:text-[16.25px]'>Report Name</span>,
      selector: (row: ShelfCloudReportList) => row.reportName,
      sortable: true,
      wrap: true,
      grow: 1.5,
    },
    {
      name: <span className='tw:font-bold tw:text-[16.25px]'>Report Type</span>,
      selector: (row: ShelfCloudReportList) => row.reportType,
      sortable: true,
      center: true,
      compact: true,
    },
    {
      name: <span className='tw:font-bold tw:text-[16.25px]'>Date Created</span>,
      selector: (row: ShelfCloudReportList) => {
        return (
          <div>
            <p className='tw:m-0 tw:p-0'>
              {moment.utc(row.dateCreated).local().format('LL')} {moment.utc(row.timeCreated, 'HH:mm:ss').local().format('HH:mm A')}
            </p>
            <p className='tw:text-[var(--bs-secondary-color)] tw:text-[11.2px] tw:m-0 tw:p-0'>Expires: {moment(row.dateCreated).add(10, 'days').format('LL')}</p>
          </div>
        )
      },
      sortable: true,
      center: true,
      compact: true,
    },
    {
      name: <span className='tw:font-bold tw:text-[16.25px]'>Status</span>,
      selector: (row: ShelfCloudReportList) => {
        if (row.reportStatus === 'ready') {
          return (
            <div>
              <i className={'ri-checkbox-circle-fill align-middle me-2 fs-3 text-success'}></i>
              <span className='tw:capitalize'>{row.reportStatus}</span>
            </div>
          )
        } else {
          return (
            <div>
              <i className={'ri-time-line align-middle me-2 fs-3 text-muted'}></i>
              <span className='tw:capitalize'>{row.reportStatus}</span>
            </div>
          )
        }
      },
      sortable: true,
      center: true,
      compact: true,
    },
    {
      name: <span className='tw:font-bold tw:text-[16.25px]'></span>,
      selector: (row: ShelfCloudReportList) => {
        if (row.reportStatus === 'ready') {
          return (
            <Button color='primary' className='tw:text-[13px] tw:py-1' onClick={() => handleDownloadReport(row.reportFileName)}>
              Download
            </Button>
          )
        }
      },
      sortable: true,
      center: true,
      compact: true,
    },
  ]

  return (
    <>
      <DataTable columns={columns} data={reportList} progressPending={pending} striped={true} />
    </>
  )
}

export default ReportsTable
