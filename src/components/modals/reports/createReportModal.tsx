 
import moment from 'moment'
import { Button, Modal, ModalBody, ModalHeader, Row, Spinner } from 'reactstrap'

import SelectRangeDates from './SelectRangeDates'
import SelectReportType from './SelectReportType'

type Props = {
  showMappedCreateReport: {
    show: boolean
    loading: boolean
    reportType: string
    startDate: string
    endDate: string
  }
  setshowMappedCreateReport: (prev: any) => void
  handleCreateReport: () => void
}

const CreateReportModal = ({ showMappedCreateReport, setshowMappedCreateReport, handleCreateReport }: Props) => {
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
            }
          })
        }}
        className='modal-title'
        id='myModalLabel'>
        Request New Report
      </ModalHeader>
      <ModalBody>
        <Row>
          {/* <h5 className='fs-4 mb-0 fw-semibold text-primary'>Create Report:</h5> */}
          {/* <p className='fs-4 fw-semibold text-black'>{showMappedListingModal.listingSku}</p> */}
          <Row md={12} className='my-3'>
            <span className='fw-light text-muted fs-7 pb-1 pt-1'>Select Report Type:</span>
            <SelectReportType showMappedCreateReport={showMappedCreateReport} setshowMappedCreateReport={setshowMappedCreateReport} />
            <span className='fw-light text-muted fs-7 pb-1 pt-1'>Select Report Date Range:</span>
            <SelectRangeDates
              showMappedCreateReport={showMappedCreateReport}
              setshowMappedCreateReport={setshowMappedCreateReport}
              handleChangeDatesFromPicker={handleChangeDatesFromPicker}
            />
          </Row>
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
                {showMappedCreateReport.loading ? <Spinner color='#fff' size={'sm'} /> : 'Request'}
              </Button>
            </div>
          </Row>
        </Row>
      </ModalBody>
    </Modal>
  )
}

export default CreateReportModal
