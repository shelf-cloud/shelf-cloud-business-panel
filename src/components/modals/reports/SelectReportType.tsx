 
import { useEffect, useRef, useState } from 'react'

type Props = {
  showMappedCreateReport: {
    show: boolean
    loading: boolean
    reportType: string
    startDate: string
    endDate: string
  }
  setshowMappedCreateReport: (prev: any) => void
}

const REPORT_TYPE_LIST = [{ reportType: 'shipmentsReport', reportTypeTile: 'Shipments Report' }]

const SelectReportType = ({ showMappedCreateReport, setshowMappedCreateReport }: Props) => {
  const [openSelectionList, setOpenSelectionList] = useState(false)
  const selectProductMappedDiv = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (document) {
      document.addEventListener('click', (e: any) => {
        if (selectProductMappedDiv.current) {
          if (!selectProductMappedDiv.current.contains(e.target)) {
            setOpenSelectionList(false)
          }
        }
      })
    }
  }, [])

  return (
    <div ref={selectProductMappedDiv} className='dropdown mb-3'>
      <div className='btn-group w-100' onClick={() => setOpenSelectionList(!openSelectionList)} style={{ backgroundColor: 'white', border: '1px solid #E1E3E5' }}>
        <button type='button' disabled className='btn btn-light btn-sm form-control fs-6 w-100 text-start' style={{ backgroundColor: 'white', opacity: '100%' }}>
          {showMappedCreateReport.reportType == '' ? `Select...` : showMappedCreateReport.reportType}
        </button>
        <button
          type='button'
          disabled
          className='btn btn-light btn-md dropdown-toggle form-control fs-6dropdown-toggle dropdown-toggle-split'
          style={{ backgroundColor: 'white', maxWidth: '35px' }}
          data-bs-toggle='dropdown'
          data-bs-auto-close='outside'
          aria-expanded='false'>
          <span className='visually-hidden'>Toggle Dropdown</span>
        </button>
      </div>

      <div className={'dropdown-menu w-100 py-3 ps-3' + (openSelectionList ? ' show' : '')}>
        <div className='d-flex flex-column justify-content-start'>
          <div style={{ maxHeight: '30vh', overflowY: 'scroll', scrollbarWidth: 'none' }}>
            {REPORT_TYPE_LIST?.map((option) => (
              <div
                key={option.reportType}
                className={'m-0 py-2 ps-1 d-flex flex-row gap-2 ' + (showMappedCreateReport.reportType == `${option.reportType}` ? 'bg-light' : '')}
                style={{ cursor: 'pointer' }}
                onClick={() => {
                  setshowMappedCreateReport((prev: any) => {
                    return {
                      ...prev,
                      reportType: option.reportType,
                    }
                  })
                  setOpenSelectionList(false)
                }}>
                <p className='fs-6 m-0 p-0'>{option.reportTypeTile}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default SelectReportType
