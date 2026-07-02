/* eslint-disable @next/next/no-img-element */
 
import Link from 'next/link'
import { useContext } from 'react'

import CopyTextToClipboard from '@components/ui/CopyTextToClipboard'
import SCTooltip from '@components/ui/SCTooltip'
import AppContext from '@context/AppContext'
import { FormatIntNumber } from '@lib/FormatNumbers'
// import TooltipComponent from '../constants/Tooltip'
import { NoImageAdress } from '@lib/assetsConstants'
import { loadBarcode, sortNumbers, sortStringsCaseInsensitive } from '@lib/helperFunctions'
import { KitRow } from '@typings'
import DataTable from '@components/Common/DataTableSC'

import { DropdownItem, DropdownMenu, DropdownToggle, Row, UncontrolledDropdown } from '@/components/migration-ui'

import KitExpandedDetails from './KitExpandedDetails'

type Props = {
  tableData: KitRow[]
  pending: boolean
  changeProductState: (kitId: number, businessId: number, sku: string) => {}
  setMsg: string
  icon: string
  activeText: string
}

const KitsTable = ({ tableData, pending }: Props) => {
  const { state, setModalKitDetails } = useContext(AppContext)

  const columns: any = [
    {
      name: <span className='tw:font-bold tw:text-[13px]'>Image</span>,
      selector: (cell: { image: any }) => {
        return (
          <div
            style={{
              width: '35px',
              height: '45px',
              margin: '2px 0px',
              position: 'relative',
            }}>
            <img
              loading='lazy'
              src={cell.image ? cell.image : NoImageAdress}
              alt='product Image'
              style={{ objectFit: 'contain', objectPosition: 'center', width: '100%', height: '100%' }}
            />
          </div>
        )
      },
      sortable: false,
      center: true,
      compact: true,
      width: '80px',
    },
    {
      name: (
        <span className='tw:font-bold tw:text-[13px]'>
          Title
          <br />
          SKU
        </span>
      ),
      selector: (row: KitRow) => {
        return (
          <div className='tw:text-[11.2px] tw:flex tw:flex-col tw:justify-start tw:items-start tw:gap-0 tw:pe-2'>
            <div className='tw:flex tw:flex-row tw:justify-start tw:items-center tw:text-[11.2px]'>
              <Link href={`/kit/${row.kitId}/${row.sku}`}>
                <p className='tw:m-0 tw:p-0 tw:text-primary tw:font-semibold tw:text-[13px]'>{row.sku}</p>
              </Link>
              <CopyTextToClipboard text={row.sku} label='SKU' />{' '}
            </div>
            <span className='tw:m-0 tw:p-0 tw:text-black tw:font-semibold tw:text-[11.2px] tw:text-wrap'>{row.title}</span>
            {row.note != '' && <i className='ri-information-fill tw:text-[16.25px] tw:text-warning' id={`tooltip${row.sku}`} />}
            {row.note != '' && (
              <SCTooltip target={`tooltip${row.sku}`} placement='right' key={`tooltip${row.sku}`}>
                <p className='tw:text-[11.2px] tw:text-primary tw:m-0 tw:p-0'>{row.note}</p>
              </SCTooltip>
            )}
          </div>
        )
      },
      sortable: true,
      wrap: true,
      grow: 1.5,
      sortFunction: (rowA: KitRow, rowB: KitRow) => sortStringsCaseInsensitive(rowA.title.toLowerCase(), rowB.title.toLowerCase()),
      //   compact: true,
    },
    {
      name: (
        <span className='tw:font-bold tw:text-[13px]'>
          ASIN
          <br />
          FNSKU
          <br />
          Barcode
        </span>
      ),
      selector: (row: KitRow) => {
        return (
          <div className='tw:text-[11.2px] tw:flex tw:flex-col tw:justify-items-start tw:gap-0'>
            {row.asin !== '' && (
              <div className='tw:flex tw:flex-row tw:justify-start tw:items-center'>
                <a className='tw:m-0' href={`https://www.amazon.${state.currentRegion == 'us' ? 'com' : 'es'}/dp/${row.asin}`} target='blank' rel='noopener noreferrer'>
                  {row.asin}
                </a>
                <CopyTextToClipboard text={row.asin} label='ASIN' />
              </div>
            )}
            {row.fnSku !== '' && (
              <p className='tw:m-0'>
                {row.fnSku} <CopyTextToClipboard text={row.fnSku} label='FNSKU' />
              </p>
            )}
            {row.barcode !== '' && (
              <div className='tw:flex tw:flex-row tw:justify-start tw:items-center'>
                <a className='tw:m-0 tw:!text-info' href='#' onClick={() => loadBarcode(row)}>
                  {row.barcode}
                </a>
                <CopyTextToClipboard text={row.barcode} label='Barcode' />
              </div>
            )}
          </div>
        )
      },
      sortable: false,
      compact: true,
    },
    {
      name: <span className='tw:font-bold tw:text-[13px]'>Quantity</span>,
      selector: (row: KitRow) => FormatIntNumber(state.currentRegion, row.quantity),
      sortable: true,
      compact: true,
      center: true,
      sortFunction: (rowA: KitRow, rowB: KitRow) => sortNumbers(rowA.quantity, rowB.quantity),
    },
    {
      name: <span className='tw:font-bold tw:text-[13px]'>Unit Dimensions</span>,
      sortable: false,
      compact: true,
      grow: 1.3,
      selector: (row: KitRow) => {
        return (
          <div className='tw:text-[11.2px]' style={{ padding: '7px 0px' }}>
            <Row>
              <span>
                Weight: {row.weight} {state.currentRegion == 'us' ? 'lb' : 'kg'}
              </span>
            </Row>
            <Row>
              <span>
                Length: {row.length} {state.currentRegion == 'us' ? 'in' : 'cm'}
              </span>
            </Row>
            <Row>
              <span>
                Width: {row.width} {state.currentRegion == 'us' ? 'in' : 'cm'}
              </span>
            </Row>
            <Row>
              <span>
                Height: {row.height} {state.currentRegion == 'us' ? 'in' : 'cm'}
              </span>
            </Row>
          </div>
        )
      },
    },
    {
      name: <span className='tw:font-bold tw:text-[13px]'>Box Dimensions</span>,
      sortable: false,
      compact: true,
      grow: 1.3,
      selector: (row: KitRow) => {
        return (
          <div className='tw:text-[11.2px]' style={{ padding: '7px 5px 7px 0px' }}>
            <Row>
              <span>
                Weight: {row.boxweight} {state.currentRegion == 'us' ? 'lb' : 'kg'}
              </span>
            </Row>
            <Row>
              <span>
                Length: {row.boxlength} {state.currentRegion == 'us' ? 'in' : 'cm'}
              </span>
            </Row>
            <Row>
              <span>
                Width: {row.boxwidth} {state.currentRegion == 'us' ? 'in' : 'cm'}
              </span>
            </Row>
            <Row>
              <span>
                Height: {row.boxheight} {state.currentRegion == 'us' ? 'in' : 'cm'}
              </span>
            </Row>
          </div>
        )
      },
    },
    {
      name: <span className='tw:font-bold tw:text-[13px]'>Qty/Box</span>,
      selector: (row: KitRow) => row.boxQty,
      sortable: true,
      center: true,
      compact: true,
      style: {
        fontSize: '0.7rem',
      },
    },
    {
      name: <span className='tw:font-bold tw:text-[13px]'>Action</span>,
      sortable: false,
      compact: true,
      cell: (row: KitRow) => {
        return (
          <UncontrolledDropdown className='dropdown tw:inline-block'>
            <DropdownToggle className='btn btn-light btn-sm tw:m-0 tw:p-0' style={{ border: '1px solid rgba(68, 129, 253, 0.06)' }} tag='button'>
              <i className='mdi mdi-dots-vertical tw:align-middle tw:text-[19.5px] tw:m-0 tw:px-1 tw:py-0' style={{ color: '#919FAF' }}></i>
            </DropdownToggle>
            <DropdownMenu className='dropdown-menu-end' container={'body'}>
              <DropdownItem className='edit-item-btn' onClick={() => setModalKitDetails(row.kitId, row.sku)}>
                <i className='ri-pencil-fill tw:align-middle tw:me-2 tw:text-[16.25px] tw:text-[var(--bs-secondary-color)]'></i>
                <span className='tw:text-[11.2px] tw:font-normal'>Edit</span>
              </DropdownItem>
              <DropdownItem className='edit-item-btn'>
                <Link href={`/kit/${row.kitId}/${row.sku}`}>
                  <i className='ri-file-list-line tw:align-middle tw:me-2 tw:text-[16.25px] tw:text-[var(--bs-secondary-color)]'></i>
                  <span className='tw:text-[11.2px] tw:font-normal tw:text-dark'>View Details</span>
                </Link>
              </DropdownItem>
            </DropdownMenu>
          </UncontrolledDropdown>
        )
      },
    },
  ]

  return (
    <>
      <DataTable
        columns={columns}
        data={tableData}
        progressPending={pending}
        striped={true}
        dense
        defaultSortFieldId={2}
        expandableRows
        expandableRowsComponent={KitExpandedDetails}
      />
    </>
  )
}

export default KitsTable
