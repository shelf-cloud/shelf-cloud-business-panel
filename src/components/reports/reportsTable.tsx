 
import { ShelfCloudReportList } from '@typesTs/reports/reportsList'
import moment from 'moment'
import DataTable from 'react-data-table-component'

import { Button } from '@shadcn/ui/button'

type Props = {
  reportList: ShelfCloudReportList[]
  pending: boolean
  handleDownloadReport: (reportFileName: string) => void
}

const ReportsTable = ({ reportList, pending, handleDownloadReport }: Props) => {
  const columns: any = [
    {
      name: <span className='font-bold text-[16.25px]'>Report Name</span>,
      selector: (row: ShelfCloudReportList) => row.reportName,
      sortable: true,
      wrap: true,
      grow: 1.5,
    },
    {
      name: <span className='font-bold text-[16.25px]'>Report Type</span>,
      selector: (row: ShelfCloudReportList) => row.reportType,
      sortable: true,
      center: true,
      compact: true,
    },
    {
      name: <span className='font-bold text-[16.25px]'>Date Created</span>,
      selector: (row: ShelfCloudReportList) => {
        return (
          <div>
            <p className='m-0 p-0'>
              {moment.utc(row.dateCreated).local().format('LL')} {moment.utc(row.timeCreated, 'HH:mm:ss').local().format('HH:mm A')}
            </p>
            <p className='text-muted-foreground text-[11.2px] m-0 p-0'>Expires: {moment(row.dateCreated).add(10, 'days').format('LL')}</p>
          </div>
        )
      },
      sortable: true,
      center: true,
      compact: true,
    },
    {
      name: <span className='font-bold text-[16.25px]'>Status</span>,
      selector: (row: ShelfCloudReportList) => {
        if (row.reportStatus === 'ready') {
          return (
            <div>
              <i className={'ri-checkbox-circle-fill align-middle me-2 text-[22.75px] text-success'}></i>
              <span className='capitalize'>{row.reportStatus}</span>
            </div>
          )
        } else {
          return (
            <div>
              <i className={'ri-time-line align-middle me-2 text-[22.75px] text-muted-foreground'}></i>
              <span className='capitalize'>{row.reportStatus}</span>
            </div>
          )
        }
      },
      sortable: true,
      center: true,
      compact: true,
    },
    {
      name: <span className='font-bold text-[16.25px]'></span>,
      selector: (row: ShelfCloudReportList) => {
        if (row.reportStatus === 'ready') {
          return (
            <Button className='text-[13px] py-1' onClick={() => handleDownloadReport(row.reportFileName)}>
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
